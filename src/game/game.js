import { Application, Container, Graphics, Text, TextStyle } from "pixi.js";

const THEME = {
  background: 0x0a1628,
  pegColor: 0xffffff,
  pegGlowColor: 0x4a5568,
  pegGlowAlpha: 0.22,
  pegGlowScale: 2.2,
  ballColor: 0xffc107,
  ballGlowColor: 0xffeb3b,
  ballGlowAlpha: 0.24,
  pegRadiusScale: 0.14,
  ballRadiusScale: 1.5,
  ripple: {
    enabled: true,
    color: 0xffffff,
    startAlpha: 0.35,
    duration: 220,
    startRadius: 2,
    endRadiusScale: 5.4,
    lineWidth: 6,
  },
  pinBounce: {
    enabled: true,
    duration: 70,
    downOffsetScale: 0.55,
    squash: 0.1,
  },
  multiplierBox: {
    height: 40,
    cornerRadius: 5,
    gap: 5,
    widthScale: 1.5,
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    fontWeight: 100,
    fontSizeScale: 0.4,
    shadowAlpha: 0.45,
    strokeAlpha: 0.25,
    highlightAlpha: 0.22,
    pressDepth: 5,
  },
  multiplierColors: {
    max: 0xd32f2f,
    high: 0xff3d00,
    medHigh: 0xff6d00,
    med: 0xffa000,
    medLow: 0xffc107,
    low: 0xffd54f,
  },
  textDark: 0x0a1628,
  pegPattern: {
    startRow: 1,
  },
};

const PHYS = {
  gravity: 1000,
  drag: 0.996,
  maxSpeed: 1000,
  restitution: 0.42,
  wallRestitution: 0.2,
  tangentialDamp: 0.9,
  collisionSlop: 0.01,
  impulseJitter: 14,
  aimStrength: 0.00105,
};

const BASE_MULTIPLIERS = [
  110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110,
];

const MULTIPLIER_TABLE = {
  16: [
    { value: 110, color: 0xff003f }, // red
    { value: 41, color: 0xff1837 }, // red
    { value: 10, color: 0xff302f }, // orange
    { value: 5, color: 0xff4827 }, // orange
    { value: 3, color: 0xff6020 }, // orange
    { value: 1.5, color: 0xff7818 }, // orange
    { value: 1, color: 0xff9010 }, // yellow
    { value: 0.5, color: 0xffa808 }, // yellow
    { value: 0.3, color: 0xffc000 }, // yellow
    { value: 0.5, color: 0xffa808 }, // yellow
    { value: 1, color: 0xff9010 }, // yellow
    { value: 1.5, color: 0xff7818 }, // yellow
    { value: 3, color: 0xff6020 }, // orange
    { value: 5, color: 0xff4827 }, // orange
    { value: 10, color: 0xff302f }, // orange
    { value: 41, color: 0xff1837 }, // red
    { value: 110, color: 0xff003f }, // red
  ],
  15: [
    { value: 88, color: 0xff003f }, // red
    { value: 18, color: 0xff1a37 }, // red
    { value: 11, color: 0xff332e }, // orange
    { value: 5, color: 0xff4d26 }, // orange
    { value: 3, color: 0xff661d }, // orange
    { value: 1, color: 0xff8015 }, // yellow
    { value: 0.5, color: 0xff9a0d }, // yellow
    { value: 0.3, color: 0xffb304 }, // yellow
    { value: 0.3, color: 0xffb304 }, // yellow
    { value: 0.5, color: 0xff9a0d }, // yellow
    { value: 1, color: 0xff8015 }, // yellow
    { value: 3, color: 0xff661d }, // orange
    { value: 5, color: 0xff4d26 }, // orange
    { value: 11, color: 0xff332e }, // orange
    { value: 18, color: 0xff1a37 }, // red
    { value: 88, color: 0xff003f }, // red
  ],
  14: [
    { value: 58, color: 0xff003f }, // red
    { value: 15, color: 0xff1b36 }, // red
    { value: 7, color: 0xff372d }, // orange
    { value: 4, color: 0xff5224 }, // orange
    { value: 1.9, color: 0xff6e1b }, // yellow
    { value: 1, color: 0xff8912 }, // yellow
    { value: 0.5, color: 0xffa509 }, // yellow
    { value: 0.2, color: 0xffc000 }, // yellow
    { value: 0.5, color: 0xffa509 }, // yellow
    { value: 1, color: 0xff8912 }, // yellow
    { value: 1.9, color: 0xff6e1b }, // yellow
    { value: 4, color: 0xff5224 }, // orange
    { value: 7, color: 0xff372d }, // orange
    { value: 15, color: 0xff1b36 }, // red
    { value: 58, color: 0xff003f }, // red
  ],
  13: [
    { value: 43, color: 0xff003f }, // red
    { value: 13, color: 0xff1e35 }, // red
    { value: 6, color: 0xff3b2c }, // orange
    { value: 3, color: 0xff5922 }, // orange
    { value: 1.3, color: 0xff7618 }, // yellow
    { value: 0.7, color: 0xff940f }, // yellow
    { value: 0.4, color: 0xffb105 }, // yellow
    { value: 0.4, color: 0xffb105 }, // yellow
    { value: 0.7, color: 0xff940f }, // yellow
    { value: 1.3, color: 0xff7618 }, // yellow
    { value: 3, color: 0xff5922 }, // orange
    { value: 6, color: 0xff3b2c }, // orange
    { value: 13, color: 0xff1e35 }, // red
    { value: 43, color: 0xff003f }, // red
  ],
  12: [
    { value: 33, color: 0xff003f }, // red
    { value: 11, color: 0xff2035 }, // red
    { value: 4, color: 0xff402a }, // orange
    { value: 2, color: 0xff6020 }, // orange
    { value: 1.1, color: 0xff8015 }, // yellow
    { value: 0.6, color: 0xffa00b }, // yellow
    { value: 0.3, color: 0xffc000 }, // yellow
    { value: 0.6, color: 0xffa00b }, // yellow
    { value: 1.1, color: 0xff8015 }, // yellow
    { value: 2, color: 0xff6020 }, // orange
    { value: 4, color: 0xff402a }, // orange
    { value: 11, color: 0xff2035 }, // red
    { value: 33, color: 0xff003f }, // red
  ],
  11: [
    { value: 24, color: 0xff003f }, // red
    { value: 6, color: 0xff2334 }, // red
    { value: 3, color: 0xff4628 }, // orange
    { value: 1.8, color: 0xff691d }, // orange
    { value: 0.7, color: 0xff8c11 }, // yellow
    { value: 0.5, color: 0xffaf06 }, // yellow
    { value: 0.5, color: 0xffaf06 }, // yellow
    { value: 0.7, color: 0xff8c11 }, // yellow
    { value: 1.8, color: 0xff691d }, // yellow
    { value: 3, color: 0xff4628 }, // orange
    { value: 6, color: 0xff2334 }, // orange
    { value: 24, color: 0xff003f }, // red
  ],
  10: [
    { value: 22, color: 0xff003f }, // red
    { value: 5, color: 0xff2632 }, // orange
    { value: 2, color: 0xff4d26 }, // yellow
    { value: 1.4, color: 0xff7319 }, // yellow
    { value: 0.6, color: 0xff9a0d }, // yellow
    { value: 0.4, color: 0xffc000 }, // yellow
    { value: 0.6, color: 0xff9a0d }, // yellow
    { value: 1.4, color: 0xff7319 }, // yellow
    { value: 2, color: 0xff4d26 }, // yellow
    { value: 5, color: 0xff2632 }, // orange
    { value: 22, color: 0xff003f }, // red
  ],
  9: [
    { value: 18, color: 0xff003f }, // red
    { value: 4, color: 0xff2b31 }, // red
    { value: 1.7, color: 0xff5523 }, // orange
    { value: 0.9, color: 0xff8015 }, // orange
    { value: 0.5, color: 0xffab07 }, // yellow
    { value: 0.5, color: 0xffab07 }, // yellow
    { value: 0.9, color: 0xff8015 }, // orange
    { value: 1.7, color: 0xff5523 }, // orange
    { value: 4, color: 0xff2b31 }, // red
    { value: 18, color: 0xff003f }, // red
  ],

  8: [
    { value: 13, color: 0xff003f }, // red
    { value: 3, color: 0xff302f }, // red
    { value: 1.3, color: 0xff6020 }, // orange
    { value: 0.7, color: 0xff9010 }, // yellow
    { value: 0.4, color: 0xffc000 }, // yellow
    { value: 0.7, color: 0xff9010 }, // yellow
    { value: 1.3, color: 0xff6020 }, // orange
    { value: 3, color: 0xff302f }, // red
    { value: 13, color: 0xff003f }, // red
  ],
};

function getMultiplierColor(value, rows) {
  const multiplierData = MULTIPLIER_TABLE[rows] || [];
  const multiplier = multiplierData.find((m) => m.value === value);

  return multiplier ? multiplier.color : 0xffffff; // Default white if not found
}

function createMultipliers(rows) {
  const multipliers = MULTIPLIER_TABLE[rows] || [];

  // Create the boxes and assign colors dynamically
  multipliers.forEach((multiplier, i) => {
    const box = new Graphics();
    box.beginFill(multiplier.color);
    box.drawRect(0, 0, 100, 50); // Adjust box size as needed
    box.endFill();

    // Place the box in the correct position
    box.x = i * (100 + 10); // Box spacing
    box.y = 400; // Y position of the box row (adjust as needed)
    uiContainer.addChild(box);

    const label = new Text(
      `${multiplier.value}x`,
      new TextStyle({
        fontFamily: "Arial",
        fontSize: 18,
        fill: 0x000000, // black text color
      })
    );
    label.x = box.x + 50;
    label.y = box.y + 15; // Adjust text position inside box
    uiContainer.addChild(label);
  });
}

function updateMultiplierUI(rows) {
  uiContainer.removeChildren();

  createMultipliers(rows);
}

function getMultiplierTextColor() {
  return THEME.textDark;
}

function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t);
}
function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function tween(app, { duration, update, complete }) {
  const start = performance.now();
  let cancelled = false;

  const step = () => {
    if (cancelled) return;
    const elapsed = performance.now() - start;
    const t = Math.min(1, elapsed / duration);
    update?.(t);
    if (t >= 1) {
      app.ticker.remove(step);
      complete?.();
    }
  };

  app.ticker.add(step);

  return () => {
    cancelled = true;
    app.ticker.remove(step);
  };
}

function factorial(n) {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function generateBinomialProbabilities(n) {
  const probs = [];
  const total = Math.pow(2, n);
  for (let k = 0; k <= n; k++) {
    const bin = factorial(n) / (factorial(k) * factorial(n - k));
    probs.push(bin / total);
  }
  return probs;
}

function selectByProbability(probabilities) {
  const sum = probabilities.reduce((a, b) => a + b, 0);
  if (sum <= 0) return 0;

  const normalized = probabilities.map((p) => p / sum);
  const r = Math.random();
  let acc = 0;
  for (let i = 0; i < normalized.length; i++) {
    acc += normalized[i];
    if (r <= acc) return i;
  }
  return normalized.length - 1;
}

function getPegPosition(row, col, gridWidth, startY, pegSpacingX, pegSpacingY) {
  const pegsInRow = row + 1;
  const rowWidth = (pegsInRow - 1) * pegSpacingX;
  const startX = (gridWidth - rowWidth) / 2;
  return {
    x: startX + col * pegSpacingX,
    y: startY + row * pegSpacingY,
  };
}

function getMultipliersForRows(rows) {
  const multipliers = MULTIPLIER_TABLE[rows];

  if (!multipliers) {
    console.warn(`No multiplier data available for ${rows} rows.`);
    return [];
  }

  console.log(`Multipliers for ${rows} rows:`, multipliers);
  return multipliers;
}

export async function createGame(mount, opts = {}) {
  const root =
    typeof mount === "string" ? document.querySelector(mount) : mount;
  if (!root) throw new Error("createGame: mount element not found");

  const minRows = opts.minRows ?? 8;
  const maxRows = opts.maxRows ?? 16;

  let rows = opts.rows ?? 16;
  rows = Math.max(minRows, Math.min(maxRows, rows));

  const historySize = opts.historySize ?? 10;

  let multipliers = MULTIPLIER_TABLE[rows] || [];
  let boxCount = multipliers.length;

  let probabilities = generateBinomialProbabilities(rows);

  let isAnimating = false;
  let history = [];

  const app = new Application();

  const dpr = window.devicePixelRatio || 1;
  const initialWidth = Math.max(1, root.clientWidth || 400);
  const initialHeight = Math.max(1, root.clientHeight || 400);

  await app.init({
    background: THEME.background,
    width: initialWidth,
    height: initialHeight,
    antialias: true,
    autoDensity: true,
    resolution: dpr,
  });

  root.innerHTML = "";
  root.appendChild(app.canvas);

  const mainContainer = new Container();
  const boardContainer = new Container();
  const effectsContainer = new Container();
  const ballContainer = new Container();
  const uiContainer = new Container();
  const historyContainer = new Container();

  mainContainer.addChild(boardContainer);
  mainContainer.addChild(effectsContainer);
  mainContainer.addChild(ballContainer);
  mainContainer.addChild(uiContainer);
  mainContainer.addChild(historyContainer);
  app.stage.addChild(mainContainer);

  let pegGraphics = [];
  let boxGraphics = [];
  let boxTexts = [];
  let historyBoxes = [];
  let ball = null;

  let gameWidth = 0;
  let gameHeight = 0;
  let pegSpacingX = 0;
  let pegSpacingY = 0;
  let pegRadius = 0;
  let ballRadius = 0;
  let boxWidth = 0;
  let boxHeight = 0;
  let gridStartY = 0;
  let gridWidth = 0;
  let historyPanelWidth = 0;
  let historyPanelX = 0;
  let historyPanelY = 0;

  let pegPoints = [];
  let lastRowY = 0;
  let baseWidth = 0;
  let baseLeft = 0;
  let baseRight = 0;
  let apexX = 0;

  let scoreZoneTop = 0;
  let scoreZoneBottom = 0;

  function isPegVisible(row) {
    return row >= (THEME.pegPattern.startRow ?? 0);
  }

  function calculateLayout() {
    const containerWidth = Math.max(1, root.clientWidth || 500);
    const containerHeight = Math.max(1, root.clientHeight || 500);

    historyPanelWidth = Math.min(110, containerWidth * 0.16);
    const playAreaWidth = containerWidth - historyPanelWidth - 30;

    gameWidth = playAreaWidth;
    gameHeight = containerHeight;

    const maxPegsInRow = rows + 1;

    gridStartY = gameHeight * 0.055;
    gridWidth = gameWidth;

    const bottomReserve = gameHeight * 0.14;
    const usableH = gameHeight - gridStartY - bottomReserve;

    pegSpacingX = (gameWidth * 0.9) / maxPegsInRow;
    pegSpacingY = (usableH * 0.92) / (rows + 1);

    pegRadius = Math.min(pegSpacingX, pegSpacingY) * THEME.pegRadiusScale;
    ballRadius = pegRadius * THEME.ballRadiusScale;

    historyPanelX = gridWidth + 15;
    historyPanelY = gridStartY;

    lastRowY = gridStartY + rows * pegSpacingY;
    baseWidth = rows * pegSpacingX * 1.2;
    baseLeft = (gridWidth - baseWidth) / 2;
    baseRight = baseLeft + baseWidth;
    apexX = gridWidth / 2;

    mainContainer.position.set(0, 0);
  }

  function triangleBoundsAtY(y) {
    const y0 = gridStartY;
    const y1 = lastRowY;
    const t = y1 === y0 ? 1 : Math.max(0, Math.min(1, (y - y0) / (y1 - y0)));
    const w = baseWidth * t;
    const left = apexX - w / 2;
    const right = apexX + w / 2;
    return { left, right };
  }

  function spawnRipple(x, y) {
    if (!THEME.ripple.enabled) return;

    const g = new Graphics();
    g.x = x;
    g.y = y;
    g.blendMode = "add";
    effectsContainer.addChild(g);

    const startR = Math.max(1, THEME.ripple.startRadius);
    const endR = Math.max(startR + 1, pegRadius * THEME.ripple.endRadiusScale);
    const ring2Delay = 0.1;

    tween(app, {
      duration: THEME.ripple.duration,
      update: (t) => {
        const e = easeOutQuad(t);

        const r1 = startR + (endR - startR) * e;

        const t2 = Math.max(0, (t - ring2Delay) / (1 - ring2Delay));
        const e2 = easeOutQuad(t2);
        const r2 = startR + (endR - startR) * e2;

        const a = THEME.ripple.startAlpha * (1 - t);

        g.clear();

        g.beginFill(THEME.ripple.color, a * 0.14);
        g.drawCircle(0, 0, r1 * 0.58);
        g.endFill();

        g.lineStyle(THEME.ripple.lineWidth, THEME.ripple.color, a);
        g.drawCircle(0, 0, r1);

        g.lineStyle(
          Math.max(2, THEME.ripple.lineWidth - 2),
          THEME.ripple.color,
          a * 0.72
        );
        g.drawCircle(0, 0, r2);
      },
      complete: () => g.destroy(),
    });
  }

  function createPegs() {
    pegGraphics.forEach((p) => p.destroy());
    pegGraphics = [];
    pegPoints = [];

    for (let row = 0; row <= rows; row++) {
      if (!isPegVisible(row)) continue;

      for (let col = 0; col < row + 2; col++) {
        const pos = getPegPosition(
          row,
          col,
          gridWidth,
          gridStartY,
          pegSpacingX,
          pegSpacingY
        );

        const peg = new Graphics();

        peg.beginFill(THEME.pegGlowColor, THEME.pegGlowAlpha);
        peg.drawCircle(0, 0, pegRadius * THEME.pegGlowScale);
        peg.endFill();

        peg.beginFill(THEME.pegColor);
        peg.drawCircle(0, 0, pegRadius);
        peg.endFill();

        peg.x = pos.x;
        peg.y = pos.y;

        boardContainer.addChild(peg);
        pegGraphics.push(peg);
        pegPoints.push({ x: pos.x, y: pos.y });
      }
    }
  }

  function drawButtonBox(g, w, h, color) {
    const r = THEME.multiplierBox.cornerRadius;
    const depth = THEME.multiplierBox.pressDepth;

    g.clear();

    g.beginFill(0x000000, THEME.multiplierBox.shadowAlpha);
    g.drawRoundedRect(0, depth, w, h, r);
    g.endFill();

    g.beginFill(color, 1);
    g.drawRoundedRect(0, 0, w, h, r);
    g.endFill();

    g.beginFill(0xffffff, THEME.multiplierBox.highlightAlpha);
    g.drawRoundedRect(0, 0, w, h * 0.42, Math.max(8, r - 2));
    g.endFill();

    g.lineStyle(2, 0x000000, THEME.multiplierBox.strokeAlpha);
    g.drawRoundedRect(0, 0, w, h, r);
  }

  function createBoxes() {
    boxGraphics.forEach((b) => b.destroy());
    boxTexts.forEach((t) => t.destroy());
    boxGraphics = [];
    boxTexts = [];

    const gap = THEME.multiplierBox.gap;
    const maxBoxesWidth = baseWidth * 0.9;

    // Dynamically calculate the width for the boxes based on available space
    const wFit = (maxBoxesWidth - boxCount * gap) / boxCount;
    const w = Math.max(
      (160 / (boxCount-1)*2), // Ensure box width can shrink to a minimum size
      Math.min(pegSpacingX * THEME.multiplierBox.widthScale, wFit) // Adjust multiplier box width dynamically
    );
    const h = Math.max(40, THEME.multiplierBox.height); // Minimum height for boxes

    boxWidth = w;
    boxHeight = h;

    // Calculate the total width of all boxes (including gaps)
    const totalW = boxCount * w + (boxCount - 1) * gap;

    // Create a container for the boxes
    const boxesContainer = new Container();

    // Apply a red border to the container
    const border = new Graphics();
    border.lineStyle(2, 0xff0000); // Red border color
    border.drawRect(0, 0, totalW, h + gap); // Adjust height and width of border
    boxesContainer.addChild(border);

    // Centering the boxes by calculating startX
    const startX = baseLeft + 17.5 + (1 - (boxCount-1)/16)*30 + (baseWidth - totalW) / 2;
    // Adjust the Y position for the boxes based on available space
    const boxY = Math.min(gameHeight - h - 12, lastRowY + pegSpacingY * 0.65);

    // Create boxes for the multipliers
    for (let i = 0; i < boxCount; i++) {
      const multiplier = multipliers[i];
      const color = getMultiplierColor(multiplier.value, rows);
      const textColor = getMultiplierTextColor(multiplier);

      // Position each box based on calculated startX and index
      const x = startX + i * (w + gap);

      if (x < baseLeft - 1) continue; // Prevent out-of-bounds placement
      if (x + w > baseRight + 1) continue;

      // Create the box graphic
      const box = new Graphics();
      drawButtonBox(box, w, h, color);
      box.x = x;
      box.y = boxY;

      // Add the box to the container
      boxesContainer.addChild(box);
      boxGraphics.push(box);

      // Adjust font size for text based on box size
      const fontSize = Math.max(
        6,
        Math.min(h, w) * THEME.multiplierBox.fontSizeScale
      );

      const style = new TextStyle({
        fontFamily: THEME.multiplierBox.fontFamily,
        fontSize,
        fontWeight: THEME.multiplierBox.fontWeight,
        fill: textColor,
        stroke: 0x000000,
        strokeThickness: Math.max(2, Math.floor(fontSize * 0.12)),
        lineJoin: "round",
      });

      // Display the multiplier value inside the box
      const label =
        multiplier.value !== undefined && multiplier.value % 1 === 0
          ? `${multiplier.value}x`
          : multiplier.value !== undefined
          ? `${multiplier.value}x`
          : "N/A";

      const text = new Text(label, style);
      text.anchor.set(0.5);
      text.x = x + w / 2;
      text.y = boxY + h / 2 + 1;

      // Add the text to the container
      boxesContainer.addChild(text);
      boxTexts.push(text);
    }

    // Add the boxes container to the UI container
    uiContainer.addChild(boxesContainer);
  }

  async function simulateDrop(targetIndex) {
    return new Promise((resolve) => {
      if (ball) ball.destroy();
      ball = createBall();
      ball.alpha = 1;
      ball.scale.set(1);
      ballContainer.addChild(ball);

      const startRow = THEME.pegPattern.startRow ?? 0;
      const startPos = getPegPosition(
        startRow,
        0,
        gridWidth,
        gridStartY,
        pegSpacingX,
        pegSpacingY
      );

      const targetX = boxGraphics[targetIndex]?.x + boxWidth / 2 || apexX;

      const state = {
        x: apexX,
        y: startPos.y - pegSpacingY * 0.9,
        vx: (Math.random() - 0.5) * 120,
        vy: 0,
      };

      const settleLineY =
        boxGraphics[0]?.y - ballRadius * 0.35 || lastRowY + pegSpacingY;
      let settledFrames = 0;
      let landedIndex = 0;
      let done = false;

      const step = (ticker) => {
        if (done) return;

        const dt = Math.min(1 / 30, ticker.deltaMS / 1000);

        const axAim = (targetX - state.x) * PHYS.aimStrength;
        state.vx += axAim * (PHYS.gravity * 0.18) * dt;

        state.vy += PHYS.gravity * dt;

        state.vx *= Math.pow(PHYS.drag, dt * 60);
        state.vy *= Math.pow(PHYS.drag, dt * 60);

        const sp = Math.hypot(state.vx, state.vy);
        if (sp > PHYS.maxSpeed) {
          const k = PHYS.maxSpeed / sp;
          state.vx *= k;
          state.vy *= k;
        }

        state.x += state.vx * dt;
        state.y += state.vy * dt;

        const b = triangleBoundsAtY(state.y);
        const left = b.left + ballRadius;
        const right = b.right - ballRadius;

        if (state.x < left) {
          state.x = left;
          if (state.vx < 0) state.vx = -state.vx * PHYS.wallRestitution;
        } else if (state.x > right) {
          state.x = right;
          if (state.vx > 0) state.vx = -state.vx * PHYS.wallRestitution;
        }

        let hit = false;
        for (let i = 0; i < pegPoints.length; i++) {
          if (resolvePegCollision(state, pegPoints[i].x, pegPoints[i].y))
            hit = true;
        }

        const squash = 1 + Math.min(0.18, Math.abs(state.vy) / 2400) * 0.12;
        ball.scale.set(1 / squash, squash);

        ball.x = state.x;
        ball.y = state.y;

        if (hit && THEME.pinBounce.enabled) {
          const baseY = ball.y;
          const down = pegRadius * THEME.pinBounce.downOffsetScale;
          tween(app, {
            duration: THEME.pinBounce.duration,
            update: (t) => {
              const e = easeOutQuad(t);
              const phase = Math.sin(e * Math.PI);
              ball.y = baseY + phase * down;
            },
            complete: () => {
              ball.y = baseY;
            },
          });
        }

        if (state.y >= settleLineY) {
          landedIndex = getClosestBoxIndexByX(state.x);
          if (Math.abs(state.vy) < PHYS.settleVy) settledFrames++;
          else settledFrames = 0;

          if (settledFrames >= PHYS.settleMaxFrames) {
            done = true;
            app.ticker.remove(step);
            highlightBox(landedIndex);
            animateFadeOutBall(() => {
              // Ensure the ball is destroyed and the history is updated with the correct multiplier
              history.unshift(multipliers[landedIndex]);
              if (history.length > historySize) history.length = historySize;
              updateHistoryDisplay();
              resolve(landedIndex);
            });
          }
        }
      };

      app.ticker.add(step);
    });
  }

  function destroyBallAndResolve(resolve, value) {
    if (!ball) {
      resolve(value);
      return;
    }
    tween(app, {
      duration: 220,
      update: (t) => {
        if (!ball) return;
        ball.alpha = 1 - t;
        ball.scale.set(1 - t * 0.35);
      },
      complete: () => {
        if (ball) {
          ball.destroy();
          ball = null;
        }
        resolve(value);
      },
    });
  }

  function createHistoryTitle() {
    const style = new TextStyle({
      fontFamily: THEME.multiplierBox.fontFamily,
      fontSize: 12,
      fontWeight: "bold",
      fill: THEME.ballColor,
    });

    const title = new Text("HISTORY", style);
    title.anchor.set(0.5, 0);
    title.x = historyPanelX + historyPanelWidth / 2;
    title.y = historyPanelY - 5;
    historyContainer.addChild(title);
  }

  function updateHistoryDisplay() {
    historyBoxes.forEach((b) => b.destroy());
    historyBoxes = [];

    const boxSize = Math.min(historyPanelWidth - 10, 60);
    const gap = 8;
    const startY = historyPanelY + 20;

    history.slice(0, historySize).forEach((multiplier, index) => {
      // if (typeof multiplier !== "number") {
      //   console.warn(`History multiplier is not a number:`, multiplier);
      //   multiplier = 0; // Default to 0 if it's not a valid number
      // }

      const rowData = MULTIPLIER_TABLE[rows]; // Get the multiplier data for the selected rows

      // Find the corresponding multiplier data from MULTIPLIER_TABLE
      const multiplierData = rowData?.find((m) => m.value == multiplier.value);
      console.log(rowData);
      // Log the data to debug
      console.log(
        `Looking for multiplier ${multiplier.value} in MULTIPLIER_TABLE[${rows}]`,
        multiplierData
      );

      const color = multiplierData ? multiplierData.color : 0xffffff; // Default to white if not found
      const textColor = getMultiplierTextColor(multiplier.value);

      const wrap = new Container();

      const box = new Graphics();
      drawButtonBox(box, boxSize, boxSize * 0.62, color);

      const style = new TextStyle({
        fontFamily: THEME.multiplierBox.fontFamily,
        fontSize: boxSize * 0.26,
        fontWeight: THEME.multiplierBox.fontWeight,
        fill: textColor,
      });

      const label =
        multiplierData && multiplierData.value % 1 === 0
          ? `${multiplierData.value}x`
          : multiplierData
          ? `${multiplierData.value}x`
          : "N/A";

      const text = new Text(label, style);
      text.anchor.set(0.5);
      text.x = boxSize / 2;
      text.y = (boxSize * 0.62) / 2 + Math.max(1, boxSize * 0.02);

      wrap.addChild(box);
      wrap.addChild(text);

      wrap.x = historyPanelX + (historyPanelWidth - boxSize) / 2;
      wrap.y = startY + index * (boxSize * 0.62 + gap);

      if (index === 0) {
        wrap.scale.set(0);
        wrap.alpha = 0;
        wrap.pivot.set(boxSize / 2, (boxSize * 0.62) / 2);
        wrap.x += boxSize / 2;
        wrap.y += (boxSize * 0.62) / 2;

        tween(app, {
          duration: 400,
          update: (t) => {
            const eased = easeOutBack(t);
            wrap.scale.set(eased);
            wrap.alpha = t;
          },
        });
      }

      historyContainer.addChild(wrap);
      historyBoxes.push(wrap);
    });
  }

  function createBall() {
    const g = new Graphics();

    g.beginFill(THEME.ballGlowColor, THEME.ballGlowAlpha);
    g.drawCircle(0, 0, ballRadius * 1.5);
    g.endFill();

    g.beginFill(THEME.ballColor);
    g.drawCircle(0, 0, ballRadius);
    g.endFill();

    g.beginFill(0xffffff, 0.4);
    g.drawCircle(-ballRadius * 0.3, -ballRadius * 0.3, ballRadius * 0.4);
    g.endFill();

    return g;
  }

  function getClosestBoxIndexByX(x) {
    if (!boxGraphics.length) return 0;
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < boxGraphics.length; i++) {
      const cx = boxGraphics[i].x + boxWidth / 2;
      const d = Math.abs(cx - x);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  }

  function highlightBox(boxIndex) {
    const box = boxGraphics[boxIndex];
    const text = boxTexts[boxIndex];

    tween(app, {
      duration: 160,
      update: (t) => {
        const s = 1 + Math.sin(t * Math.PI) * 0.22;
        box.scale.set(s);
        text.scale.set(s);
      },
      complete: () => {
        box.scale.set(1);
        text.scale.set(1);
      },
    });
  }

  function destroyBallAndResolve(resolve, value) {
    if (!ball) {
      resolve(value);
      return;
    }
    tween(app, {
      duration: 220,
      update: (t) => {
        if (!ball) return;
        ball.alpha = 1 - t;
        ball.scale.set(1 - t * 0.35);
      },
      complete: () => {
        if (ball) {
          ball.destroy();
          ball = null;
        }
        resolve(value);
      },
    });
  }

  function resolvePegCollision(state, pegX, pegY) {
    const dx = state.x - pegX;
    const dy = state.y - pegY;
    const r = ballRadius + pegRadius;
    const d2 = dx * dx + dy * dy;
    if (d2 <= 0 || d2 > r * r) return false;

    const d = Math.sqrt(d2);
    const nx = dx / d;
    const ny = dy / d;

    const penetration = r - d + PHYS.collisionSlop;
    state.x += nx * penetration;
    state.y += ny * penetration;

    const vDotN = state.vx * nx + state.vy * ny;
    if (vDotN < 0) {
      const tx = -ny;
      const ty = nx;

      const vDotT = state.vx * tx + state.vy * ty;

      const j = -(1 + PHYS.restitution) * vDotN;
      state.vx += j * nx;
      state.vy += j * ny;

      state.vx =
        tx * (vDotT * PHYS.tangentialDamp) +
        nx * (state.vx * nx + state.vy * ny);
      state.vy =
        ty * (vDotT * PHYS.tangentialDamp) +
        ny * (state.vx * nx + state.vy * ny);

      state.vx += (Math.random() - 0.5) * PHYS.impulseJitter;
      spawnRipple(pegX, pegY - pegRadius * 0.2);
      return true;
    }
    return false;
  }

  async function simulateDrop(targetIndex) {
    return new Promise((resolve) => {
      if (ball) ball.destroy();
      ball = createBall();
      ball.alpha = 1;
      ball.scale.set(1);
      ballContainer.addChild(ball);

      const startRow = THEME.pegPattern.startRow ?? 0;
      const startPos = getPegPosition(
        startRow,
        0,
        gridWidth,
        gridStartY,
        pegSpacingX,
        pegSpacingY
      );

      const targetX = boxGraphics[targetIndex]?.x + boxWidth / 2 || apexX;

      const state = {
        x: apexX,
        y: startPos.y - pegSpacingY * 0.9,
        vx: (Math.random() - 0.5) * 120,
        vy: 0,
      };

      let done = false;

      const step = (ticker) => {
        if (done) return;

        const dt = Math.min(1 / 30, ticker.deltaMS / 1000);

        const axAim = (targetX - state.x) * PHYS.aimStrength;
        state.vx += axAim * (PHYS.gravity * 0.18) * dt;

        state.vy += PHYS.gravity * dt;

        state.vx *= Math.pow(PHYS.drag, dt * 60);
        state.vy *= Math.pow(PHYS.drag, dt * 60);

        const sp = Math.hypot(state.vx, state.vy);
        if (sp > PHYS.maxSpeed) {
          const k = PHYS.maxSpeed / sp;
          state.vx *= k;
          state.vy *= k;
        }

        state.x += state.vx * dt;
        state.y += state.vy * dt;

        const b = triangleBoundsAtY(state.y);
        const left = b.left + ballRadius;
        const right = b.right - ballRadius;

        if (state.x < left) {
          state.x = left;
          if (state.vx < 0) state.vx = -state.vx * PHYS.wallRestitution;
        } else if (state.x > right) {
          state.x = right;
          if (state.vx > 0) state.vx = -state.vx * PHYS.wallRestitution;
        }

        let hit = false;
        for (let i = 0; i < pegPoints.length; i++) {
          if (resolvePegCollision(state, pegPoints[i].x, pegPoints[i].y))
            hit = true;
        }

        if (ball) {
          const squash = 1 + Math.min(0.18, Math.abs(state.vy) / 2400) * 0.12;
          ball.scale.set(1 / squash, squash);
          ball.x = state.x;
          ball.y = state.y;
        }

        if (hit && THEME.pinBounce.enabled && ball) {
          const baseY = ball.y;
          const down = pegRadius * THEME.pinBounce.downOffsetScale;
          tween(app, {
            duration: THEME.pinBounce.duration,
            update: (t) => {
              const e = easeOutQuad(t);
              const phase = Math.sin(e * Math.PI);
              if (ball) ball.y = baseY + phase * down;
            },
            complete: () => {
              if (ball) ball.y = baseY;
            },
          });
        }

        const zTop =
          scoreZoneTop ||
          (boxGraphics[0]?.y ?? lastRowY + pegSpacingY) + boxHeight;
        const zBottom =
          scoreZoneBottom || zTop + Math.max(10, boxHeight * 0.95);

        if (state.y >= zTop && state.y <= zBottom) {
          const landedIndex = getClosestBoxIndexByX(state.x);
          done = true;
          app.ticker.remove(step);
          highlightBox(landedIndex);
          destroyBallAndResolve(resolve, landedIndex);
          return;
        }

        if (state.y > gameHeight + ballRadius * 3) {
          done = true;
          app.ticker.remove(step);
          destroyBallAndResolve(resolve, -1);
        }
      };

      app.ticker.add(step);
    });
  }

  function resize() {
    const width = Math.max(1, root.clientWidth || 600);
    const height = Math.max(1, root.clientHeight || 600);

    const dprNow = window.devicePixelRatio || 1;
    if (app.renderer.resolution !== dprNow) {
      app.renderer.resolution = dprNow;
    }
    app.renderer.resize(width, height);

    calculateLayout();

    boardContainer.removeChildren();
    effectsContainer.removeChildren();
    uiContainer.removeChildren();
    historyContainer.removeChildren();

    createPegs();
    createBoxes();
    createHistoryTitle();
    updateHistoryDisplay();
  }

  calculateLayout();
  resize();

  const resizeObserver = new ResizeObserver(() => resize());
  resizeObserver.observe(root);
  window.addEventListener("resize", resize);

  return {
    async startRound() {
      if (isAnimating) return -1;
      isAnimating = true;

      const fullBoxCount = rows + 1;

      let probs = probabilities;
      if (!Array.isArray(probs) || probs.length !== fullBoxCount) {
        probs = generateBinomialProbabilities(rows);
      }

      const targetIndex = Math.max(
        0,
        Math.min(selectByProbability(probs), boxCount - 1)
      );

      const landedIndex = await simulateDrop(targetIndex);

      if (landedIndex >= 0) {
        const multiplier = multipliers[landedIndex];
        history.unshift(multiplier);
        if (history.length > historySize) history.length = historySize;
        updateHistoryDisplay();
        isAnimating = false;
        return multiplier;
      }

      isAnimating = false;
      return -1;
    },

    destroy() {
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      app.destroy(true, { children: true, texture: true });
      if (root.contains(app.canvas)) root.removeChild(app.canvas);
    },

    getState() {
      return {
        isAnimating,
        history: [...history],
        rows,
        boxCount,
        multipliers: multipliers.slice(),
      };
    },

    setProbabilities(weights) {
      if (!Array.isArray(weights) || weights.length !== boxCount) return;
      probabilities = [...weights];
    },

    setRows(newRows) {
      if (isAnimating) return;

      const target = Math.round(newRows);
      const clamped = Math.max(minRows, Math.min(maxRows, target));
      if (clamped === rows) return;

      rows = clamped;
      multipliers = getMultipliersForRows(rows);
      boxCount = multipliers.length;
      probabilities = generateBinomialProbabilities(rows);

      resize();
    },
  };
}
