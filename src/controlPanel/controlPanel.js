import { Stepper } from "../stepper/stepper.js";
import bitcoinIconUrl from "../../assets/sprites/controlPanel/BitCoin.svg";
import infinityIconUrl from "../../assets/sprites/controlPanel/Infinity.svg";
import percentageIconUrl from "../../assets/sprites/controlPanel/Percentage.svg";

function resolveMount(mount) {
  if (!mount) {
    throw new Error("Control panel mount target is required");
  }
  if (typeof mount === "string") {
    const element = document.querySelector(mount);
    if (!element) {
      throw new Error(`Control panel mount '${mount}' not found`);
    }
    return element;
  }
  return mount;
}

function clampToZero(value) {
  return Math.max(0, value);
}

export class ControlPanel extends EventTarget {
  enableSelectAllOnFocus(input) {
    if (!input) return;
    const selectAll = () => {
      if (typeof input.select === "function") {
        input.select();
      }
    };
    input.addEventListener("focus", selectAll);
    input.addEventListener("pointerup", (event) => {
      event.preventDefault();
      selectAll();
    });
  }

  constructor(mount, options = {}) {
    super();
    this.options = {
      betAmountLabel: options.betAmountLabel ?? "Bet Amount",
      profitOnWinLabel: options.profitOnWinLabel ?? "Profit on Win",
      initialTotalProfitMultiplier: options.initialTotalProfitMultiplier ?? 1,
      initialBetValue: options.initialBetValue ?? "0.00000000",
      initialBetAmountDisplay: options.initialBetAmountDisplay ?? "$0.00",
      initialProfitOnWinDisplay: options.initialProfitOnWinDisplay ?? "$0.00",
      initialProfitValue: options.initialProfitValue ?? "0.00000000",
      initialMode: options.initialMode ?? "manual",
      gameName: options.gameName ?? "Plinko",
      rowsLabel: options.rowsLabel ?? "Rows",
      difficultyLabel: options.difficultyLabel ?? "Difficulty",
      numberOfBetsLabel: options.numberOfBetsLabel ?? "Number of Bets",
      animationsLabel: options.animationsLabel ?? "Animations",
      showServerLabel: options.showServerLabel ?? "Show Server",
      initialAnimationsEnabled: options.initialAnimationsEnabled ?? true,
      minRows: options.minRows ?? 8,
      maxRows: options.maxRows ?? 16,
      initialRows: options.initialRows ?? 11,
      difficulties: options.difficulties ?? ["low", "medium", "high"],
      difficultyLabels: options.difficultyLabels ?? {
        low: "Low",
        medium: "Medium",
        high: "High",
      },
      initialDifficulty: options.initialDifficulty ?? "medium",
    };

    this.host = resolveMount(mount);
    this.host.innerHTML = "";

    this.mode = this.options.initialMode === "auto" ? "auto" : "manual";
    this.animationsEnabled = Boolean(this.options.initialAnimationsEnabled);

    this.betButtonMode = "bet";
    this.betButtonState = "clickable";
    this.autoStartButtonState = "non-clickable";
    this.autoStartButtonMode = "start";

    this.totalProfitMultiplier = 1;
    this.betTooltipTimeout = null;

    const minRows = Math.floor(Number(this.options.minRows) || 8);
    const maxRows = Math.floor(Number(this.options.maxRows) || 16);
    this.minRows = Math.max(1, Math.min(minRows, maxRows));
    this.maxRows = Math.max(this.minRows, maxRows);
    const initialRows = Math.floor(Number(this.options.initialRows) || 11);
    this.currentRows = Math.max(
      this.minRows,
      Math.min(initialRows, this.maxRows)
    );

    this.difficulties = Array.isArray(this.options.difficulties)
      ? this.options.difficulties
      : ["low", "medium", "high"];
    this.difficultyLabels = this.options.difficultyLabels || {
      low: "Low",
      medium: "Medium",
      high: "High",
    };
    this.currentDifficulty = this.difficulties.includes(
      this.options.initialDifficulty
    )
      ? this.options.initialDifficulty
      : this.difficulties[0];

    this.rowsSelectState = "clickable";
    this.difficultySelectState = "clickable";

    this.container = document.createElement("div");
    this.container.className = "control-panel";
    this.host.appendChild(this.container);

    this.scrollContainer = document.createElement("div");
    this.scrollContainer.className = "control-panel-scroll";
    this.container.appendChild(this.scrollContainer);

    this.buildToggle();
    this.buildBetAmountDisplay();
    this.buildBetControls();
    this.buildDifficultyLabel();
    this.buildDifficultySelect();
    this.buildRowsLabel();
    this.buildRowsSelect();
    this.buildModeSections();
    this.buildFooter();

    this.setBetAmountDisplay(this.options.initialBetAmountDisplay);
    this.setProfitOnWinDisplay(this.options.initialProfitOnWinDisplay);
    this.setTotalProfitMultiplier(this.options.initialTotalProfitMultiplier);
    this.setProfitValue(this.options.initialProfitValue);
    this.setBetInputValue(this.options.initialBetValue, { emit: false });
    this.setRowsValue(this.currentRows, { emit: false });
    this.setDifficultyValue(this.currentDifficulty, { emit: false });
    this.updateModeButtons();
    this.updateModeSections();
    this.updateAdvancedVisibility();
    this.updateNumberOfBetsIcon();
    this.updateOnWinMode();
    this.updateOnLossMode();
    this.updateAnimationToggle();
    this.setupResponsiveLayout();
  }

  buildToggle() {
    this.toggleWrapper = document.createElement("div");
    this.toggleWrapper.className = "control-toggle";

    this.manualButton = document.createElement("button");
    this.manualButton.type = "button";
    this.manualButton.className = "control-toggle-btn";
    this.manualButton.textContent = "Manual";
    this.manualButton.addEventListener("click", () => this.setMode("manual"));

    this.autoButton = document.createElement("button");
    this.autoButton.type = "button";
    this.autoButton.className = "control-toggle-btn";
    this.autoButton.textContent = "Auto";
    this.autoButton.addEventListener("click", () => this.setMode("auto"));

    this.toggleWrapper.append(this.manualButton, this.autoButton);
    this.scrollContainer.appendChild(this.toggleWrapper);
  }

  buildBetAmountDisplay() {
    const row = document.createElement("div");
    row.className = "control-row";

    const label = document.createElement("span");
    label.className = "control-row-label";
    label.textContent = this.options.betAmountLabel;
    row.appendChild(label);

    this.betAmountValue = document.createElement("span");
    this.betAmountValue.className = "control-row-value";
    row.appendChild(this.betAmountValue);

    this.scrollContainer.appendChild(row);
  }

  buildBetControls() {
    this.betBox = document.createElement("div");
    this.betBox.className = "control-bet-box";

    this.betInputWrapper = document.createElement("div");
    this.betInputWrapper.className = "control-bet-input-field has-stepper";
    this.betBox.appendChild(this.betInputWrapper);

    this.betInput = document.createElement("input");
    this.betInput.type = "text";
    this.betInput.inputMode = "decimal";
    this.betInput.spellcheck = false;
    this.betInput.autocomplete = "off";
    this.betInput.setAttribute("aria-label", this.options.betAmountLabel);
    this.betInput.className = "control-bet-input";
    this.betInput.addEventListener("input", () => {
      const numericValue = this.parseBetValue(this.betInput.value);
      if (numericValue < 0) {
        const formatted = this.formatBetValue(0);
        this.betInput.value = formatted;
        this.showBetAmountTooltip();
        this.dispatchBetValueChange(formatted);
        return;
      }
      this.dispatchBetValueChange();
    });
    this.betInput.addEventListener("blur", () => {
      this.setBetInputValue(this.betInput.value);
    });
    this.enableSelectAllOnFocus(this.betInput);
    this.betInputWrapper.appendChild(this.betInput);

    const icon = document.createElement("img");
    icon.src = bitcoinIconUrl;
    icon.alt = "";
    icon.className = "control-bet-input-icon";
    this.betInputWrapper.appendChild(icon);

    this.betStepper = new Stepper({
      onStepUp: () => this.adjustBetValue(1e-8),
      onStepDown: () => this.adjustBetValue(-1e-8),
      upAriaLabel: "Increase bet amount",
      downAriaLabel: "Decrease bet amount",
    });
    this.betInputWrapper.appendChild(this.betStepper.element);

    this.betTooltip = document.createElement("div");
    this.betTooltip.className = "control-bet-tooltip";
    this.betTooltip.setAttribute("role", "alert");
    this.betTooltip.textContent = "This must be greater than or equal to 0";
    this.betBox.appendChild(this.betTooltip);

    this.halfButton = document.createElement("button");
    this.halfButton.type = "button";
    this.halfButton.className = "control-bet-action";
    this.halfButton.textContent = "½";
    this.halfButton.setAttribute("aria-label", "Halve bet value");
    this.halfButton.addEventListener("click", () => this.scaleBetValue(0.5));

    this.doubleButton = document.createElement("button");
    this.doubleButton.type = "button";
    this.doubleButton.className = "control-bet-action";
    this.doubleButton.textContent = "2×";
    this.doubleButton.setAttribute("aria-label", "Double bet value");
    this.doubleButton.addEventListener("click", () => this.scaleBetValue(2));

    const separator = document.createElement("div");
    separator.className = "control-bet-separator";

    this.betBox.append(
      this.betInputWrapper,
      this.halfButton,
      separator,
      this.doubleButton
    );
    this.scrollContainer.appendChild(this.betBox);
  }

  buildDifficultyLabel() {
    const row = document.createElement("div");
    row.className = "control-row";

    const label = document.createElement("span");
    label.className = "control-row-label";
    label.textContent = this.options.difficultyLabel;
    row.appendChild(label);

    this.scrollContainer.appendChild(row);
  }

  buildDifficultySelect() {
    this.difficultySelectWrapper = document.createElement("div");
    this.difficultySelectWrapper.className = "control-select-field";

    this.difficultySelect = document.createElement("select");
    this.difficultySelect.className = "control-select";
    this.difficultySelect.setAttribute(
      "aria-label",
      this.options.difficultyLabel
    );

    this.difficulties.forEach((key) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = this.difficultyLabels[key] ?? key;
      if (key === this.currentDifficulty) {
        option.selected = true;
      }
      this.difficultySelect.appendChild(option);
    });

    this.difficultySelect.addEventListener("change", () => {
      this.currentDifficulty = this.difficultySelect.value;
      this.dispatchDifficultyChange();
    });

    this.difficultySelectWrapper.appendChild(this.difficultySelect);

    const arrow = document.createElement("span");
    arrow.className = "control-select-arrow";
    arrow.setAttribute("aria-hidden", "true");
    this.difficultySelectWrapper.appendChild(arrow);

    this.scrollContainer.appendChild(this.difficultySelectWrapper);

    this.setDifficultySelectState(this.difficultySelectState);
  }

  buildRowsLabel() {
    const row = document.createElement("div");
    row.className = "control-row";

    const label = document.createElement("span");
    label.className = "control-row-label";
    label.textContent = this.options.rowsLabel;
    row.appendChild(label);

    this.scrollContainer.appendChild(row);
  }

  buildRowsSelect() {
    this.rowsSelectWrapper = document.createElement("div");
    this.rowsSelectWrapper.className = "control-select-field";

    this.rowsSelect = document.createElement("select");
    this.rowsSelect.className = "control-select";
    this.rowsSelect.setAttribute("aria-label", this.options.rowsLabel);

    for (let r = this.minRows; r <= this.maxRows; r += 1) {
      const option = document.createElement("option");
      option.value = String(r);
      option.textContent = String(r);
      if (r === this.currentRows) option.selected = true;
      this.rowsSelect.appendChild(option);
    }

    this.rowsSelect.addEventListener("change", () => {
      const value = Math.floor(Number(this.rowsSelect.value) || this.minRows);
      this.currentRows = Math.max(this.minRows, Math.min(value, this.maxRows));
      this.dispatchRowsChange();
    });

    this.rowsSelectWrapper.appendChild(this.rowsSelect);

    const arrow = document.createElement("span");
    arrow.className = "control-select-arrow";
    arrow.setAttribute("aria-hidden", "true");
    this.rowsSelectWrapper.appendChild(arrow);

    this.scrollContainer.appendChild(this.rowsSelectWrapper);

    this.setRowsSelectState(this.rowsSelectState);
  }

  buildModeSections() {
    this.manualSection = document.createElement("div");
    this.manualSection.className =
      "control-mode-section control-mode-section--manual";
    this.scrollContainer.appendChild(this.manualSection);

    this.buildBetButton();
    this.buildProfitOnWinDisplay();
    this.buildProfitDisplay();

    this.autoSection = document.createElement("div");
    this.autoSection.className =
      "control-mode-section control-mode-section--auto";
    this.scrollContainer.appendChild(this.autoSection);

    this.buildAutoControls();
  }

  buildAutoControls() {
    this.autoNumberOfBetsLabel = this.createSectionLabel(
      this.options.numberOfBetsLabel
    );
    this.autoSection.appendChild(this.autoNumberOfBetsLabel);

    this.autoNumberOfBetsField = document.createElement("div");
    this.autoNumberOfBetsField.className =
      "control-bet-input-field auto-number-field has-stepper";
    this.autoSection.appendChild(this.autoNumberOfBetsField);

    this.autoNumberOfBetsInput = document.createElement("input");
    this.autoNumberOfBetsInput.type = "text";
    this.autoNumberOfBetsInput.inputMode = "numeric";
    this.autoNumberOfBetsInput.autocomplete = "off";
    this.autoNumberOfBetsInput.spellcheck = false;
    this.autoNumberOfBetsInput.className =
      "control-bet-input auto-number-input";
    this.autoNumberOfBetsInput.value = "0";
    this.autoNumberOfBetsInput.addEventListener("input", () => {
      this.sanitizeNumberOfBets();
      this.updateNumberOfBetsIcon();
      this.dispatchNumberOfBetsChange();
    });
    this.autoNumberOfBetsInput.addEventListener("blur", () => {
      this.sanitizeNumberOfBets();
      this.updateNumberOfBetsIcon();
      this.dispatchNumberOfBetsChange();
    });
    this.enableSelectAllOnFocus(this.autoNumberOfBetsInput);
    this.autoNumberOfBetsField.appendChild(this.autoNumberOfBetsInput);

    this.autoNumberOfBetsInfinityIcon = document.createElement("img");
    this.autoNumberOfBetsInfinityIcon.src = infinityIconUrl;
    this.autoNumberOfBetsInfinityIcon.alt = "";
    this.autoNumberOfBetsInfinityIcon.className = "auto-number-infinity";
    this.autoNumberOfBetsField.appendChild(this.autoNumberOfBetsInfinityIcon);

    this.autoNumberOfBetsStepper = new Stepper({
      onStepUp: () => this.incrementNumberOfBets(1),
      onStepDown: () => this.incrementNumberOfBets(-1),
      upAriaLabel: "Increase number of bets",
      downAriaLabel: "Decrease number of bets",
    });
    this.autoNumberOfBetsField.appendChild(
      this.autoNumberOfBetsStepper.element
    );

    this.autoAdvancedHeader = document.createElement("div");
    this.autoAdvancedHeader.className = "auto-advanced-header";
    this.autoSection.appendChild(this.autoAdvancedHeader);

    this.autoAdvancedLabel = this.createSectionLabel("Advanced");
    this.autoAdvancedLabel.classList.add("auto-advanced-label");
    this.autoAdvancedHeader.appendChild(this.autoAdvancedLabel);

    this.autoAdvancedToggle = this.createSwitchButton({
      onToggle: (isActive) => {
        this.isAdvancedEnabled = Boolean(isActive);
        this.updateAdvancedVisibility();
      },
    });
    this.autoAdvancedHeader.appendChild(this.autoAdvancedToggle);

    this.autoAdvancedContent = document.createElement("div");
    this.autoAdvancedContent.className = "auto-advanced-content";
    this.autoSection.appendChild(this.autoAdvancedContent);

    this.autoAdvancedContent.appendChild(this.createSectionLabel("On Win"));
    const onWinRow = this.createAdvancedStrategyRow("win");
    this.autoAdvancedContent.appendChild(onWinRow);

    this.autoAdvancedContent.appendChild(this.createSectionLabel("On Loss"));
    const onLossRow = this.createAdvancedStrategyRow("loss");
    this.autoAdvancedContent.appendChild(onLossRow);

    const profitRow = document.createElement("div");
    profitRow.className = "auto-advanced-summary-row";
    const profitLabel = document.createElement("span");
    profitLabel.className = "auto-advanced-summary-label";
    profitLabel.textContent = "Stop on Profit";
    const profitValue = document.createElement("span");
    profitValue.className = "auto-advanced-summary-value";
    profitValue.textContent = "$0.00";
    profitRow.append(profitLabel, profitValue);
    this.autoAdvancedContent.appendChild(profitRow);

    this.autoStopOnProfitField = this.createCurrencyField({
      onChange: (value) => this.dispatchStopOnProfitChange(value),
      increaseAriaLabel: "Increase stop on profit amount",
      decreaseAriaLabel: "Decrease stop on profit amount",
    });
    this.autoAdvancedContent.appendChild(this.autoStopOnProfitField.wrapper);
    this.autoStopOnProfitField.input.addEventListener("input", () => {
      this.dispatchStopOnProfitChange(this.autoStopOnProfitField.input.value);
    });
    this.autoStopOnProfitField.input.addEventListener("blur", () => {
      const normalized = this.normalizeCurrencyInputValue(
        this.autoStopOnProfitField.input
      );
      this.dispatchStopOnProfitChange(normalized);
    });

    const lossRow = document.createElement("div");
    lossRow.className = "auto-advanced-summary-row";
    const lossLabel = document.createElement("span");
    lossLabel.className = "auto-advanced-summary-label";
    lossLabel.textContent = "Stop on Loss";
    const lossValue = document.createElement("span");
    lossValue.className = "auto-advanced-summary-value";
    lossValue.textContent = "$0.00";
    lossRow.append(lossLabel, lossValue);
    this.autoAdvancedContent.appendChild(lossRow);

    this.autoStopOnLossField = this.createCurrencyField({
      onChange: (value) => this.dispatchStopOnLossChange(value),
      increaseAriaLabel: "Increase stop on loss amount",
      decreaseAriaLabel: "Decrease stop on loss amount",
    });
    this.autoAdvancedContent.appendChild(this.autoStopOnLossField.wrapper);
    this.autoStopOnLossField.input.addEventListener("input", () => {
      this.dispatchStopOnLossChange(this.autoStopOnLossField.input.value);
    });
    this.autoStopOnLossField.input.addEventListener("blur", () => {
      const normalized = this.normalizeCurrencyInputValue(
        this.autoStopOnLossField.input
      );
      this.dispatchStopOnLossChange(normalized);
    });

    this.autoStartButton = document.createElement("button");
    this.autoStartButton.type = "button";
    this.autoStartButton.className =
      "control-bet-btn control-start-autobet-btn";
    this.autoStartButton.textContent = "Start Autobet";
    this.autoStartButton.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("startautobet"));
    });

    this.container.appendChild(this.autoStartButton);

    this.setAutoStartButtonState(this.autoStartButtonState);

    this.isAdvancedEnabled = false;
    this.onWinMode = "reset";
    this.onLossMode = "reset";
    this.strategyControlsNonClickable = false;
  }

  createSectionLabel(text) {
    const label = document.createElement("div");
    label.className = "control-section-label";
    label.textContent = text;
    return label;
  }

  createSwitchButton({ onToggle }) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "control-switch";
    button.setAttribute("aria-pressed", "false");

    const handle = document.createElement("span");
    handle.className = "control-switch-handle";
    button.appendChild(handle);

    button.addEventListener("click", () => {
      const isActive = button.classList.toggle("is-on");
      button.setAttribute("aria-pressed", String(isActive));
      onToggle?.(isActive);
    });

    return button;
  }

  createAdvancedStrategyRow(key) {
    const row = document.createElement("div");
    row.className = "auto-advanced-strategy-row";

    const toggle = document.createElement("div");
    toggle.className = "auto-mode-toggle";

    const resetButton = document.createElement("button");
    resetButton.type = "button";
    resetButton.className = "auto-mode-toggle-btn is-reset";
    resetButton.textContent = "Reset";

    const increaseButton = document.createElement("button");
    increaseButton.type = "button";
    increaseButton.className = "auto-mode-toggle-btn";
    increaseButton.textContent = "Increase by:";

    toggle.append(resetButton, increaseButton);
    row.appendChild(toggle);

    const field = document.createElement("div");
    field.className = "control-bet-input-field auto-advanced-input has-stepper";
    row.appendChild(field);

    const input = document.createElement("input");
    input.type = "text";
    input.inputMode = "decimal";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.className = "control-bet-input";
    input.value = "0";
    field.appendChild(input);

    const icon = document.createElement("img");
    icon.src = percentageIconUrl;
    icon.alt = "";
    icon.className = "control-bet-input-icon auto-percentage-icon";
    field.appendChild(icon);

    const stepper = new Stepper({
      onStepUp: () => this.adjustStrategyValue(key, 1),
      onStepDown: () => this.adjustStrategyValue(key, -1),
      upAriaLabel:
        key === "win"
          ? "Increase on win percentage"
          : "Increase on loss percentage",
      downAriaLabel:
        key === "win"
          ? "Decrease on win percentage"
          : "Decrease on loss percentage",
    });
    field.appendChild(stepper.element);

    if (key === "win") {
      this.onWinResetButton = resetButton;
      this.onWinIncreaseButton = increaseButton;
      this.onWinInput = input;
      this.onWinField = field;
      this.onWinStepper = stepper;
    } else {
      this.onLossResetButton = resetButton;
      this.onLossIncreaseButton = increaseButton;
      this.onLossInput = input;
      this.onLossField = field;
      this.onLossStepper = stepper;
    }

    resetButton.addEventListener("click", () => {
      this.setStrategyMode(key, "reset");
    });
    increaseButton.addEventListener("click", () => {
      this.setStrategyMode(key, "increase");
    });

    input.addEventListener("input", () => {
      const value = this.sanitizeStrategyInput(input);
      this.dispatchStrategyValueChange(key, value);
    });
    input.addEventListener("blur", () => {
      const value = this.sanitizeStrategyInput(input, { enforceMinimum: true });
      this.dispatchStrategyValueChange(key, value);
    });

    this.enableSelectAllOnFocus(input);

    this.sanitizeStrategyInput(input);

    return row;
  }

  createCurrencyField({
    onChange,
    increaseAriaLabel = "Increase amount",
    decreaseAriaLabel = "Decrease amount",
    step = 1e-8,
  } = {}) {
    const wrapper = document.createElement("div");
    wrapper.className =
      "control-bet-input-field auto-currency-field has-stepper";

    const input = document.createElement("input");
    input.type = "text";
    input.inputMode = "decimal";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.className = "control-bet-input";
    input.value = "0.00000000";
    this.enableSelectAllOnFocus(input);
    wrapper.appendChild(input);

    const icon = document.createElement("img");
    icon.src = bitcoinIconUrl;
    icon.alt = "";
    icon.className = "control-bet-input-icon";
    wrapper.appendChild(icon);

    const stepper = new Stepper({
      onStepUp: () => {
        const value = this.adjustCurrencyInputValue(input, step);
        onChange?.(value);
      },
      onStepDown: () => {
        const value = this.adjustCurrencyInputValue(input, -step);
        onChange?.(value);
      },
      upAriaLabel: increaseAriaLabel,
      downAriaLabel: decreaseAriaLabel,
    });
    wrapper.appendChild(stepper.element);

    return { wrapper, input, icon, stepper };
  }

  buildBetButton() {
    this.betButton = document.createElement("button");
    this.betButton.type = "button";
    this.betButton.id = "betBtn";
    this.betButton.className = "control-bet-btn";
    this.betButton.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("bet"));
    });
    const parent = this.manualSection ?? this.scrollContainer;
    parent.appendChild(this.betButton);

    this.setBetButtonMode(this.betButtonMode);
    this.setBetButtonState(this.betButtonState);
  }

  refreshRowsOptions({ emit = true } = {}) {
    if (!this.rowsSelect) return;
    const selected = Math.max(
      this.minRows,
      Math.min(this.currentRows, this.maxRows)
    );

    this.rowsSelect.innerHTML = "";
    for (let r = this.minRows; r <= this.maxRows; r += 1) {
      const option = document.createElement("option");
      option.value = String(r);
      option.textContent = String(r);
      if (r === selected) {
        option.selected = true;
      }
      this.rowsSelect.appendChild(option);
    }

    this.currentRows = selected;
    if (emit) {
      this.dispatchRowsChange();
    }
  }

  setRowsValue(value, { emit = true } = {}) {
    const numeric = Math.floor(Number(value));
    const clamped = Math.max(
      this.minRows,
      Math.min(Number.isFinite(numeric) ? numeric : this.minRows, this.maxRows)
    );
    this.currentRows = clamped;
    if (this.rowsSelect) {
      this.rowsSelect.value = String(clamped);
    }
    if (emit) {
      this.dispatchRowsChange();
    }
  }

  setDifficultyValue(value, { emit = true } = {}) {
    const key = this.difficulties.includes(value)
      ? value
      : this.difficulties[0];
    this.currentDifficulty = key;
    if (this.difficultySelect) {
      this.difficultySelect.value = key;
    }
    if (emit) {
      this.dispatchDifficultyChange();
    }
  }

  getRowsValue() {
    return this.currentRows;
  }

  getDifficultyValue() {
    return this.currentDifficulty;
  }

  dispatchRowsChange() {
    this.dispatchEvent(
      new CustomEvent("rowschange", {
        detail: {
          rows: this.getRowsValue(),
          difficulty: this.getDifficultyValue(),
        },
      })
    );
  }

  dispatchDifficultyChange() {
    this.dispatchEvent(
      new CustomEvent("difficultychange", {
        detail: {
          difficulty: this.getDifficultyValue(),
          rows: this.getRowsValue(),
        },
      })
    );
  }

  buildProfitOnWinDisplay() {
    const row = document.createElement("div");
    row.className = "control-row";

    this.profitOnWinLabel = document.createElement("span");
    this.profitOnWinLabel.className = "control-row-label";
    row.appendChild(this.profitOnWinLabel);
    this.updateTotalProfitLabel();

    this.profitOnWinValue = document.createElement("span");
    this.profitOnWinValue.className = "control-row-value";
    row.appendChild(this.profitOnWinValue);

    const parent = this.manualSection ?? this.scrollContainer;
    parent.appendChild(row);
  }

  updateTotalProfitLabel() {
    if (!this.profitOnWinLabel) return;
    const formattedMultiplier = this.totalProfitMultiplier.toFixed(2);
    this.profitOnWinLabel.textContent = `Total Profit (${formattedMultiplier}x)`;
  }

  setTotalProfitMultiplier(value) {
    const numeric = Number(value);
    const normalized = Number.isFinite(numeric) && numeric > 0 ? numeric : 1;
    this.totalProfitMultiplier = normalized;
    this.updateTotalProfitLabel();
  }

  buildProfitDisplay() {
    this.profitBox = document.createElement("div");
    this.profitBox.className = "control-profit-box";

    this.profitValue = document.createElement("span");
    this.profitValue.className = "control-profit-value";
    this.profitBox.appendChild(this.profitValue);

    const icon = document.createElement("img");
    icon.src = bitcoinIconUrl;
    icon.alt = "";
    icon.className = "control-profit-icon";
    this.profitBox.appendChild(icon);

    const parent = this.manualSection ?? this.scrollContainer;
    parent.appendChild(this.profitBox);
  }

  buildFooter() {
    this.footer = document.createElement("div");
    this.footer.className = "control-panel-footer";
    this.container.appendChild(this.footer);

    this.gameName = document.createElement("div");
    this.gameName.className = "control-game-name";
    this.gameName.textContent = this.options.gameName;
    this.footer.appendChild(this.gameName);

    this.footerActions = document.createElement("div");
    this.footerActions.className = "control-footer-actions";
    this.footer.appendChild(this.footerActions);

    this.animationToggleWrapper = document.createElement("div");
    this.animationToggleWrapper.className = "control-animations-toggle";
    this.footerActions.appendChild(this.animationToggleWrapper);

    const label = document.createElement("span");
    label.className = "control-animations-label";
    label.textContent = this.options.animationsLabel;
    this.animationToggleWrapper.appendChild(label);

    this.animationToggleButton = this.createSwitchButton({
      onToggle: (isActive) => {
        this.setAnimationsEnabled(isActive);
      },
    });
    this.animationToggleButton.classList.add("control-animations-switch");
    this.animationToggleButton.setAttribute(
      "aria-label",
      "Toggle game animations"
    );
    this.animationToggleWrapper.appendChild(this.animationToggleButton);

    this.showServerButton = document.createElement("button");
    this.showServerButton.type = "button";
    this.showServerButton.className = "control-show-server";
    this.showServerButton.textContent = this.options.showServerLabel;
    this.showServerButton.addEventListener("click", () => {
      if (this.showServerButton.disabled) {
        return;
      }
      this.dispatchEvent(new CustomEvent("showserver"));
    });
  }

  setMode(mode) {
    const normalized = mode === "auto" ? "auto" : "manual";
    if (this.mode === normalized) {
      return;
    }
    this.mode = normalized;
    this.updateModeButtons();
    this.updateModeSections();
    this.dispatchEvent(
      new CustomEvent("modechange", { detail: { mode: this.mode } })
    );
  }

  updateModeButtons() {
    if (!this.manualButton || !this.autoButton) return;
    this.manualButton.classList.toggle("is-active", this.mode === "manual");
    this.autoButton.classList.toggle("is-active", this.mode === "auto");
  }

  updateModeSections() {
    if (this.manualSection) {
      this.manualSection.hidden = this.mode !== "manual";
    }
    if (this.autoSection) {
      this.autoSection.hidden = this.mode !== "auto";
    }
    if (this.autoStartButton) {
      this.autoStartButton.hidden = this.mode !== "auto";
    }
  }

  setupResponsiveLayout() {
    if (!this.container) return;

    const query = window.matchMedia("(orientation: portrait)");
    this._layoutMediaQuery = query;
    this._onMediaQueryChange = () => this.updateResponsiveLayout();

    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", this._onMediaQueryChange);
    } else if (typeof query.addListener === "function") {
      query.addListener(this._onMediaQueryChange);
    }

    this.updateResponsiveLayout();
  }

  updateResponsiveLayout() {
    if (!this.container || !this.scrollContainer) return;
    const isPortrait = Boolean(this._layoutMediaQuery?.matches);
    this.container.classList.toggle("is-portrait", isPortrait);

    if (this.autoStartButton) {
      if (isPortrait && this.scrollContainer) {
        this.container.insertBefore(this.autoStartButton, this.scrollContainer);
      } else {
        const referenceNode = this.footer ?? null;
        this.container.insertBefore(this.autoStartButton, referenceNode);
      }
    }

    if (this.toggleWrapper) {
      if (isPortrait) {
        const referenceNode = this.footer ?? null;
        this.container.insertBefore(this.toggleWrapper, referenceNode);
      } else {
        this.scrollContainer.insertBefore(
          this.toggleWrapper,
          this.scrollContainer.firstChild
        );
      }
    }
  }

  sanitizeNumberOfBets() {
    if (!this.autoNumberOfBetsInput) return;
    const numeric = Math.max(
      0,
      Math.floor(
        Number(this.autoNumberOfBetsInput.value.replace(/[^0-9]/g, "")) || 0
      )
    );
    this.autoNumberOfBetsInput.value = String(numeric);
  }

  sanitizeStrategyInput(input, { enforceMinimum = false } = {}) {
    if (!input) return "";

    let value = input.value.replace(/[^\d.]/g, "");
    const decimalIndex = value.indexOf(".");

    if (decimalIndex !== -1) {
      const whole = value.slice(0, decimalIndex);
      let fractional = value.slice(decimalIndex + 1).replace(/\./g, "");
      fractional = fractional.slice(0, 2);
      value = `${whole}.${fractional}`;
    }

    if (value.startsWith(".")) {
      value = `0${value}`;
    }

    if (!value) {
      if (enforceMinimum) {
        input.value = "0";
        return "0";
      }
      input.value = "";
      return "";
    }

    const hasTrailingDecimal = value.endsWith(".");
    if (hasTrailingDecimal) {
      if (enforceMinimum) {
        value = value.slice(0, -1) || "0";
      } else {
        input.value = value;
        return value;
      }
    }

    let numeric = Number.parseFloat(value);
    if (!Number.isFinite(numeric)) {
      numeric = 0;
    }

    numeric = Math.max(0, numeric);

    const decimals = this.getStrategyDecimalPlacesFromString(value);
    const formatted = this.formatStrategyValue(numeric, decimals);

    if (
      !enforceMinimum &&
      decimals > 0 &&
      numeric === 0 &&
      /^0(\.0*)?$/.test(value)
    ) {
      input.value = value;
      return value;
    }

    input.value = formatted;
    return formatted;
  }

  adjustStrategyValue(key, delta) {
    const input = key === "win" ? this.onWinInput : this.onLossInput;
    if (!input) return;
    const current = Number.parseFloat(input.value) || 0;
    const decimals = this.getStrategyDecimalPlacesFromString(input.value);
    const step = 1;
    const next = Math.max(0, current + delta * step);
    input.value = this.formatStrategyValue(next, decimals);
    this.dispatchStrategyValueChange(key, input.value);
  }

  incrementNumberOfBets(delta) {
    if (!this.autoNumberOfBetsInput) return;
    const current = Number(this.autoNumberOfBetsInput.value) || 0;
    const next = Math.max(0, current + delta);
    this.autoNumberOfBetsInput.value = String(next);
    this.updateNumberOfBetsIcon();
    this.dispatchNumberOfBetsChange();
  }

  updateNumberOfBetsIcon() {
    if (
      !this.autoNumberOfBetsInfinityIcon ||
      !this.autoNumberOfBetsInput ||
      !this.autoNumberOfBetsField
    ) {
      return;
    }
    const current = Number(this.autoNumberOfBetsInput.value) || 0;
    const isInfinite = current === 0;
    this.autoNumberOfBetsInfinityIcon.classList.toggle(
      "is-visible",
      isInfinite
    );
    this.autoNumberOfBetsField.classList.toggle(
      "is-infinity-hidden",
      !isInfinite
    );
  }

  updateAdvancedVisibility() {
    if (!this.autoAdvancedContent || !this.autoAdvancedToggle) return;
    const isActive = Boolean(this.isAdvancedEnabled);
    this.autoAdvancedContent.hidden = !isActive;
    this.autoAdvancedToggle.classList.toggle("is-on", isActive);
    this.autoAdvancedToggle.setAttribute("aria-pressed", String(isActive));
  }

  setStrategyMode(key, mode) {
    const normalized = mode === "increase" ? "increase" : "reset";
    if (key === "win") {
      if (this.onWinMode === normalized) {
        return;
      }
      this.onWinMode = normalized;
      this.updateOnWinMode();
      this.dispatchStrategyModeChange("win");
    } else {
      if (this.onLossMode === normalized) {
        return;
      }
      this.onLossMode = normalized;
      this.updateOnLossMode();
      this.dispatchStrategyModeChange("loss");
    }
  }

  updateOnWinMode() {
    this.updateStrategyButtons(
      this.onWinMode,
      this.onWinResetButton,
      this.onWinIncreaseButton,
      this.onWinInput,
      this.onWinField
    );
  }

  updateOnLossMode() {
    this.updateStrategyButtons(
      this.onLossMode,
      this.onLossResetButton,
      this.onLossIncreaseButton,
      this.onLossInput,
      this.onLossField
    );
  }

  updateStrategyButtons(mode, resetButton, increaseButton, input, field) {
    if (!resetButton || !increaseButton || !input || !field) return;
    const isIncrease = mode === "increase";
    const controlsNonClickable = Boolean(this.strategyControlsNonClickable);
    resetButton.classList.toggle("is-active", !isIncrease);
    increaseButton.classList.toggle("is-active", isIncrease);
    resetButton.disabled = controlsNonClickable;
    increaseButton.disabled = controlsNonClickable;
    const allowInput = !controlsNonClickable && isIncrease;
    input.disabled = !allowInput;
    field.classList.toggle("is-non-clickable", !allowInput);
    const stepper =
      field === this.onWinField ? this.onWinStepper : this.onLossStepper;
    stepper?.setClickable(allowInput);
  }

  adjustBetValue(delta) {
    const current = this.getBetValue();
    const nextRaw = current + delta;
    if (nextRaw < 0) {
      this.showBetAmountTooltip();
    }
    const next = clampToZero(nextRaw);
    this.setBetInputValue(next);
  }

  adjustCurrencyInputValue(input, delta) {
    if (!input) return "0.00000000";
    const current = Number(this.parseBetValue(input.value));
    const next = clampToZero(
      (Number.isFinite(current) ? current : 0) + Number(delta || 0)
    );
    const formatted = this.formatBetValue(next);
    input.value = formatted;
    return formatted;
  }

  normalizeCurrencyInputValue(input) {
    if (!input) return "0.00000000";
    const formatted = this.formatBetValue(input.value);
    input.value = formatted;
    return formatted;
  }

  scaleBetValue(factor) {
    const current = this.getBetValue();
    const next = clampToZero(current * factor);
    this.setBetInputValue(next);
  }

  showBetAmountTooltip(message = "This must be greater than or equal to 0") {
    if (!this.betTooltip) {
      return;
    }
    this.betTooltip.textContent = message;
    this.betTooltip.classList.add("is-visible");
    if (this.betTooltipTimeout) {
      clearTimeout(this.betTooltipTimeout);
    }
    this.betTooltipTimeout = setTimeout(() => {
      this.betTooltip?.classList.remove("is-visible");
      this.betTooltipTimeout = null;
    }, 3000);
  }

  setBetInputValue(value, { emit = true } = {}) {
    const formatted = this.formatBetValue(value);
    this.betInput.value = formatted;
    if (emit) {
      this.dispatchBetValueChange(formatted);
    }
    return formatted;
  }

  formatBetValue(value) {
    const numeric = Number(this.parseBetValue(value));
    if (!Number.isFinite(numeric)) {
      return "0.00000000";
    }
    return clampToZero(numeric).toFixed(8);
  }

  parseBetValue(value) {
    if (typeof value === "number") {
      return value;
    }
    if (typeof value !== "string") {
      return 0;
    }
    const sanitized = value.replace(/[^0-9.\-]+/g, "");
    const numeric = Number(sanitized);
    return Number.isFinite(numeric) ? numeric : 0;
  }

  dispatchBetValueChange(value = this.betInput.value) {
    this.dispatchEvent(
      new CustomEvent("betvaluechange", {
        detail: { value: value, numericValue: this.getBetValue() },
      })
    );
  }

  dispatchNumberOfBetsChange() {
    this.dispatchEvent(
      new CustomEvent("numberofbetschange", {
        detail: { value: this.getNumberOfBetsValue() },
      })
    );
  }

  dispatchStrategyModeChange(key) {
    const mode = key === "win" ? this.onWinMode : this.onLossMode;
    this.dispatchEvent(
      new CustomEvent("strategychange", {
        detail: { key: key === "win" ? "win" : "loss", mode },
      })
    );
  }

  dispatchStrategyValueChange(key, value) {
    this.dispatchEvent(
      new CustomEvent("strategyvaluechange", {
        detail: { key: key === "win" ? "win" : "loss", value },
      })
    );
  }

  getStrategyDecimalPlacesFromString(value) {
    if (!value) return 0;
    const [, decimals = ""] = String(value).split(".");
    const length = decimals.replace(/[^0-9]/g, "").length;
    if (length <= 0) return 0;
    return Math.max(0, Math.min(2, length));
  }

  formatStrategyValue(value, decimals = 0) {
    const safeDecimals = Math.max(0, Math.min(2, decimals ?? 0));
    const clamped = Math.max(0, Number.isFinite(value) ? value : 0);
    if (clamped === 0) {
      return "0";
    }
    return clamped.toFixed(safeDecimals);
  }

  dispatchStopOnProfitChange(value) {
    this.dispatchEvent(
      new CustomEvent("stoponprofitchange", {
        detail: { value },
      })
    );
  }

  dispatchStopOnLossChange(value) {
    this.dispatchEvent(
      new CustomEvent("stoponlosschange", {
        detail: { value },
      })
    );
  }

  getBetValue() {
    const numeric = Number(this.formatBetValue(this.betInput.value));
    return Number.isFinite(numeric) ? numeric : 0;
  }

  setBetAmountDisplay(value) {
    if (this.betAmountValue) {
      this.betAmountValue.textContent = value;
    }
  }

  setProfitOnWinDisplay(value) {
    if (this.profitOnWinValue) {
      this.profitOnWinValue.textContent = value;
    }
  }

  setProfitValue(value) {
    if (!this.profitValue) return;
    if (Number.isFinite(Number(value))) {
      const numeric = Number(value);
      this.profitValue.textContent = clampToZero(numeric).toFixed(8);
    } else if (typeof value === "string") {
      this.profitValue.textContent = value;
    } else {
      this.profitValue.textContent = "0.00000000";
    }
  }

  setGameName(name) {
    if (this.gameName) {
      this.gameName.textContent = name;
    }
  }

  setAnimationsEnabled(value, { emit = true } = {}) {
    const normalized = Boolean(value);
    if (this.animationsEnabled === normalized) {
      this.updateAnimationToggle();
      return;
    }
    this.animationsEnabled = normalized;
    this.updateAnimationToggle();
    if (emit) {
      this.dispatchAnimationsChange();
    }
  }

  getAnimationsEnabled() {
    return Boolean(this.animationsEnabled);
  }

  updateAnimationToggle() {
    if (!this.animationToggleButton) return;
    this.animationToggleButton.classList.toggle(
      "is-on",
      Boolean(this.animationsEnabled)
    );
    this.animationToggleButton.setAttribute(
      "aria-pressed",
      String(Boolean(this.animationsEnabled))
    );
  }

  dispatchAnimationsChange() {
    this.dispatchEvent(
      new CustomEvent("animationschange", {
        detail: { enabled: Boolean(this.animationsEnabled) },
      })
    );
  }

  setServerPanelVisibility(isVisible) {
    if (!this.showServerButton) return;
    const disabled = Boolean(isVisible);
    this.showServerButton.disabled = disabled;
    this.showServerButton.classList.toggle("is-disabled", disabled);
    this.showServerButton.setAttribute("aria-disabled", String(disabled));
  }

  setBetButtonMode(mode) {
    if (!this.betButton) return;
    const normalized = mode === "cashout" ? "cashout" : "bet";
    this.betButtonMode = normalized;
    this.betButton.textContent = normalized === "cashout" ? "Cashout" : "Bet";
    this.betButton.dataset.mode = normalized;
  }

  setBetButtonState(state) {
    if (!this.betButton) return;
    const normalized =
      state === "clickable" || state === true || state === "enabled"
        ? "clickable"
        : "non-clickable";
    this.betButtonState = normalized;
    const isClickable = normalized === "clickable";
    this.betButton.disabled = !isClickable;
    this.betButton.classList.toggle("is-non-clickable", !isClickable);
  }

  setAutoStartButtonState(state) {
    if (!this.autoStartButton) return;
    const normalized =
      state === "clickable" || state === true || state === "enabled"
        ? "clickable"
        : "non-clickable";
    this.autoStartButtonState = normalized;
    const isClickable = normalized === "clickable";
    this.autoStartButton.disabled = !isClickable;
    this.autoStartButton.classList.toggle("is-non-clickable", !isClickable);
  }

  setRowsSelectState(state) {
    if (!this.rowsSelect || !this.rowsSelectWrapper) return;
    const normalized =
      state === "clickable" || state === true || state === "enabled"
        ? "clickable"
        : "non-clickable";
    this.rowsSelectState = normalized;
    const isClickable = normalized === "clickable";
    this.rowsSelect.disabled = !isClickable;
    this.rowsSelect.setAttribute("aria-disabled", String(!isClickable));
    this.rowsSelectWrapper.classList.toggle("is-non-clickable", !isClickable);
  }

  setDifficultySelectState(state) {
    if (!this.difficultySelect || !this.difficultySelectWrapper) return;
    const normalized =
      state === "clickable" || state === true || state === "enabled"
        ? "clickable"
        : "non-clickable";
    this.difficultySelectState = normalized;
    const isClickable = normalized === "clickable";
    this.difficultySelect.disabled = !isClickable;
    this.difficultySelect.setAttribute("aria-disabled", String(!isClickable));
    this.difficultySelectWrapper.classList.toggle(
      "is-non-clickable",
      !isClickable
    );
  }

  setAutoStartButtonMode(mode) {
    if (!this.autoStartButton) return;
    const normalized =
      mode === "stop" ? "stop" : mode === "finish" ? "finish" : "start";
    this.autoStartButtonMode = normalized;
    this.autoStartButton.textContent =
      normalized === "stop"
        ? "Stop Autobet"
        : normalized === "finish"
        ? "Finishing Autobet"
        : "Start Autobet";
    this.autoStartButton.dataset.mode = normalized;
  }

  getAutoStartButtonMode() {
    return this.autoStartButtonMode ?? "start";
  }

  setInteractable(isInteractive) {
    const clickable = Boolean(isInteractive);
    this.setModeToggleClickable(clickable);
    this.setBetControlsClickable(clickable);
    this.setBetButtonState(clickable ? "clickable" : "non-clickable");
    this.setAutoStartButtonState(clickable ? "clickable" : "non-clickable");
    this.setRowsSelectState(clickable ? "clickable" : "non-clickable");
    this.setDifficultySelectState(clickable ? "clickable" : "non-clickable");
    this.setNumberOfBetsClickable(clickable);
    this.setAdvancedToggleClickable(clickable);
    this.setAdvancedStrategyControlsClickable(clickable);
    this.setStopOnProfitClickable(clickable);
    this.setStopOnLossClickable(clickable);
    this.setAnimationsToggleClickable(clickable);
  }

  setModeToggleClickable(isClickable) {
    const clickable = Boolean(isClickable);
    if (this.manualButton) {
      this.manualButton.disabled = !clickable;
      this.manualButton.classList.toggle("is-non-clickable", !clickable);
    }
    if (this.autoButton) {
      this.autoButton.disabled = !clickable;
      this.autoButton.classList.toggle("is-non-clickable", !clickable);
    }
  }

  setAnimationsToggleClickable(isClickable) {
    const clickable = Boolean(isClickable);
    if (this.animationToggleButton) {
      this.animationToggleButton.disabled = !clickable;
      this.animationToggleButton.classList.toggle(
        "is-non-clickable",
        !clickable
      );
      this.animationToggleButton.setAttribute(
        "aria-disabled",
        String(!clickable)
      );
    }
  }

  setBetControlsClickable(isClickable) {
    const clickable = Boolean(isClickable);
    if (this.betInput) {
      this.betInput.disabled = !clickable;
    }
    if (this.betBox) {
      this.betBox.classList.toggle("is-non-clickable", !clickable);
    }
    if (this.betInputWrapper) {
      this.betInputWrapper.classList.toggle("is-non-clickable", !clickable);
    }
    if (this.betStepper?.setClickable) {
      this.betStepper.setClickable(clickable);
    }
    if (this.halfButton) {
      this.halfButton.disabled = !clickable;
      this.halfButton.classList.toggle("is-non-clickable", !clickable);
    }
    if (this.doubleButton) {
      this.doubleButton.disabled = !clickable;
      this.doubleButton.classList.toggle("is-non-clickable", !clickable);
    }
  }

  getNumberOfBetsValue() {
    if (!this.autoNumberOfBetsInput) return 0;
    const numeric = Number(this.autoNumberOfBetsInput.value);
    return Number.isFinite(numeric) && numeric > 0 ? Math.floor(numeric) : 0;
  }

  setNumberOfBetsValue(value) {
    if (!this.autoNumberOfBetsInput) return;
    const normalized = Math.max(0, Math.floor(Number(value) || 0));
    this.autoNumberOfBetsInput.value = String(normalized);
    this.updateNumberOfBetsIcon();
  }

  isAdvancedModeEnabled() {
    return Boolean(this.isAdvancedEnabled);
  }

  getOnWinStrategyMode() {
    return this.onWinMode;
  }

  getOnLossStrategyMode() {
    return this.onLossMode;
  }

  getOnWinStrategyValue() {
    const numeric = Number.parseFloat(this.onWinInput?.value);
    return Number.isFinite(numeric) ? numeric : 0;
  }

  getOnLossStrategyValue() {
    const numeric = Number.parseFloat(this.onLossInput?.value);
    return Number.isFinite(numeric) ? numeric : 0;
  }

  getStopOnProfitValue() {
    if (!this.autoStopOnProfitField?.input) return 0;
    const numeric = Number(
      this.parseBetValue(this.autoStopOnProfitField.input.value)
    );
    return Number.isFinite(numeric) ? clampToZero(numeric) : 0;
  }

  getStopOnLossValue() {
    if (!this.autoStopOnLossField?.input) return 0;
    const numeric = Number(
      this.parseBetValue(this.autoStopOnLossField.input.value)
    );
    return Number.isFinite(numeric) ? clampToZero(numeric) : 0;
  }

  setNumberOfBetsClickable(isClickable) {
    const clickable = Boolean(isClickable);
    if (this.autoNumberOfBetsField) {
      this.autoNumberOfBetsField.classList.toggle(
        "is-non-clickable",
        !clickable
      );
    }
    if (this.autoNumberOfBetsInput) {
      this.autoNumberOfBetsInput.disabled = !clickable;
      this.autoNumberOfBetsInput.classList.toggle(
        "is-non-clickable",
        !clickable
      );
    }
    if (this.autoNumberOfBetsStepper?.setClickable) {
      this.autoNumberOfBetsStepper.setClickable(clickable);
    }
  }

  setAdvancedToggleClickable(isClickable) {
    const clickable = Boolean(isClickable);
    if (this.autoAdvancedToggle) {
      this.autoAdvancedToggle.disabled = !clickable;
      this.autoAdvancedToggle.classList.toggle("is-non-clickable", !clickable);
    }
  }

  setAdvancedStrategyControlsClickable(isClickable) {
    this.strategyControlsNonClickable = !isClickable;
    this.updateOnWinMode();
    this.updateOnLossMode();
  }

  setStopOnProfitClickable(isClickable) {
    const clickable = Boolean(isClickable);
    if (this.autoStopOnProfitField?.input) {
      this.autoStopOnProfitField.input.disabled = !clickable;
      this.autoStopOnProfitField.wrapper.classList.toggle(
        "is-non-clickable",
        !clickable
      );
    }
    if (this.autoStopOnProfitField?.stepper?.setClickable) {
      this.autoStopOnProfitField.stepper.setClickable(clickable);
    }
  }

  setStopOnLossClickable(isClickable) {
    const clickable = Boolean(isClickable);
    if (this.autoStopOnLossField?.input) {
      this.autoStopOnLossField.input.disabled = !clickable;
      this.autoStopOnLossField.wrapper.classList.toggle(
        "is-non-clickable",
        !clickable
      );
    }
    if (this.autoStopOnLossField?.stepper?.setClickable) {
      this.autoStopOnLossField.stepper.setClickable(clickable);
    }
  }

  getMode() {
    return this.mode;
  }
}
