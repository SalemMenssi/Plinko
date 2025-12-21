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
    borderWidth: 2,
    strokeAlpha: 0.25,
    highlightAlpha: 0.22,
    pressDepth: 5,
    innerInsetScale: 0,
    innerAlpha: 0,
    entryInsetScale: 0.22,
    entryBottomScale: 0.92,
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
  layout: {
    leftPadding: 0,
    rightPadding: 0,
    historyGap: 5,
    boardOffsetX: 5,
    boardOffsetY: 0,
    gridStartYScale: 0.055,
    gridStartYOffset: 0,
    baseWidthScale: 1.2,
    pegOffsetX: 0,
    pegOffsetXMinRows: 8,
    pegOffsetXMaxRows: 16,
    pegOffsetXAtMinRows: -37.5,
    pegOffsetXAtMaxRows: -20,
    boxOffsetX: 0,
    boxOffsetY: 0,
    boxRowWidthScaleMinRows: 8,
    boxRowWidthScaleMaxRows: 16,
    boxRowWidthScaleAtMinRows: 1.0,
    boxRowWidthScaleAtMaxRows: 0.9,
    historyOffsetX: 0,
    historyOffsetY: 0,
    spawnOffsetX: 0,
    spawnOffsetY: 0,
    spawnRangeXMinRows: 16,
    spawnRangeXMaxRows: 8,
    spawnRangeXAtMinRows: 120,
    spawnRangeXAtMaxRows: 60,
    spawnCompensatePegOffset: true,
    spawnClampPadding: 0,
  },
  pegPattern: {
    startRow: 1,
  },
};

const PHYS = {
  gravity: 10000,
  drag: 0.993,
  maxSpeed: 300,
  spawnSpeed: 300,
  spawnAngleJitter: 0,
  minSpeed: 300,
  constantSpeed: 300,
  constantSpeedBaseRows: 16,
  restitution: 0.18,
  wallRestitution: 0.14,
  tangentialDamp: 0.85,
  collisionSlop: 0.01,
  impulseJitter: 8,
  aimStrength: 0.00105,
  centerBiasStrength: 4.0,
  centerBiasJitter: 0.25,
  bounceAngleJitter: 0.02,
  keepDirectionChance: 0.15,
};

const PHYS_CLAMP_01_KEYS = new Set([
  "drag",
  "restitution",
  "wallRestitution",
  "tangentialDamp",
  "centerBiasStrength",
  "centerBiasJitter",
  "keepDirectionChance",
]);

const BASE_MULTIPLIERS = [
  110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110,
];

const MULTIPLIER_TABLE_MEDIUM = {
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

const MULTIPLIER_TABLE_LOW_VALUES = {
  8: [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
  9: [5.6, 2, 1.6, 1, 0.7, 0.7, 1, 1.6, 2, 5.6],
  10: [8.9, 3, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 3, 8.9],
  11: [8.4, 3, 1.9, 1.3, 1, 0.7, 0.7, 1, 1.3, 1.9, 3, 8.4],
  12: [10, 3, 1.6, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 1.6, 3, 10],
  13: [8.1, 4, 3, 1.9, 1.2, 0.9, 0.7, 0.7, 0.9, 1.2, 1.9, 3, 4, 8.1],
  14: [7.1, 4, 1.9, 1.4, 1.3, 1.1, 1, 0.5, 1, 1.1, 1.3, 1.4, 1.9, 4, 7.1],
  15: [15, 8, 3, 2, 1.5, 1.1, 1, 0.7, 0.7, 1, 1.1, 1.5, 2, 3, 8, 15],
  16: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16],
};

const MULTIPLIER_TABLE_HIGH_VALUES = {
  8: [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
  9: [5.6, 2, 1.6, 1, 0.7, 0.7, 1, 1.6, 2, 5.6],
  10: [8.9, 3, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 3, 8.9],
  11: [8.4, 3, 1.9, 1.3, 1, 0.7, 0.7, 1, 1.3, 1.9, 3, 8.4],
  12: [10, 3, 1.6, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 1.6, 3, 10],
  13: [8.1, 4, 3, 1.9, 1.2, 0.9, 0.7, 0.7, 0.9, 1.2, 1.9, 3, 4, 8.1],
  14: [7.1, 4, 1.9, 1.4, 1.3, 1.1, 1, 0.5, 1, 1.1, 1.3, 1.4, 1.9, 4, 7.1],
  15: [15, 8, 3, 2, 1.5, 1.1, 1, 0.7, 0.7, 1, 1.1, 1.5, 2, 3, 8, 15],
  16: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16],
};

const DIFFICULTY_SCALES = {
  low: 0.75,
  medium: 1,
  high: 1.35,
};

const DEFAULT_DIFFICULTY = "medium";

function normalizeDifficulty(value) {
  return DIFFICULTY_SCALES[value] ? value : DEFAULT_DIFFICULTY;
}

function formatMultiplierValue(value) {
  if (!Number.isFinite(value)) return 0;
  if (value >= 10) return Math.round(value);
  if (value >= 1) return Math.round(value * 10) / 10;
  return Math.round(value * 100) / 100;
}

function getSpeedScaleForRows(rowCount) {
  const baseRows = Number.isFinite(PHYS.constantSpeedBaseRows)
    ? PHYS.constantSpeedBaseRows
    : 16;
  const safeRows = Math.max(1, rowCount);
  const safeBase = Math.max(1, baseRows);
  return safeBase / safeRows;
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function normalizeWinRateValue(value) {
  if (!Number.isFinite(value)) return null;
  const normalized = value > 1 ? value / 100 : value;
  return clamp01(normalized);
}

function getSpawnRangeXForRows(rowCount, pegSpacingX, boxWidth, layout) {
  const direct = layout?.spawnRangeX;
  if (Number.isFinite(direct)) return Math.max(0, direct);

  const minRows = Number.isFinite(layout?.spawnRangeXMinRows)
    ? layout.spawnRangeXMinRows
    : 8;
  const maxRows = Number.isFinite(layout?.spawnRangeXMaxRows)
    ? layout.spawnRangeXMaxRows
    : 16;
  const atMin = layout?.spawnRangeXAtMinRows;
  const atMax = layout?.spawnRangeXAtMaxRows;
  if (
    Number.isFinite(atMin) &&
    Number.isFinite(atMax) &&
    maxRows !== minRows
  ) {
    const t = (rowCount - minRows) / (maxRows - minRows);
    const clamped = Math.max(0, Math.min(1, t));
    return Math.max(0, atMin + (atMax - atMin) * clamped);
  }

  const baseJitter = Math.min(pegSpacingX * 0.35, boxWidth * 0.3);
  const spawnJitter = Math.max(4, Math.min(24, baseJitter));
  return spawnJitter * 2;
}

function getBoxRowWidthScaleForRows(rowCount, layout) {
  const direct = layout?.boxRowWidthScale;
  if (Number.isFinite(direct)) return direct;

  const minRows = Number.isFinite(layout?.boxRowWidthScaleMinRows)
    ? layout.boxRowWidthScaleMinRows
    : 8;
  const maxRows = Number.isFinite(layout?.boxRowWidthScaleMaxRows)
    ? layout.boxRowWidthScaleMaxRows
    : 16;
  const atMin = layout?.boxRowWidthScaleAtMinRows;
  const atMax = layout?.boxRowWidthScaleAtMaxRows;
  if (
    Number.isFinite(atMin) &&
    Number.isFinite(atMax) &&
    maxRows !== minRows
  ) {
    const t = (rowCount - minRows) / (maxRows - minRows);
    const clamped = Math.max(0, Math.min(1, t));
    return atMin + (atMax - atMin) * clamped;
  }

  return 0.9;
}

function getPhysForRows(rowCount) {
  const scale = getSpeedScaleForRows(rowCount);
  const scaled = {};
  Object.entries(PHYS).forEach(([key, value]) => {
    if (!Number.isFinite(value)) {
      scaled[key] = value;
      return;
    }
    if (key === "constantSpeedBaseRows") {
      scaled[key] = value;
      return;
    }
    let next = value * scale;
    if (PHYS_CLAMP_01_KEYS.has(key)) {
      next = clamp01(next);
    }
    scaled[key] = next;
  });
  return scaled;
}

function buildDifficultyTable(scale) {
  const table = {};
  Object.keys(MULTIPLIER_TABLE_MEDIUM).forEach((rowKey) => {
    const entries = MULTIPLIER_TABLE_MEDIUM[rowKey];
    table[rowKey] = entries.map((entry) => ({
      value: formatMultiplierValue(entry.value * scale),
      color: entry.color,
    }));
  });
  return table;
}

function buildValueTable(valuesByRow, colorSource) {
  const table = {};
  Object.keys(valuesByRow).forEach((rowKey) => {
    const values = valuesByRow[rowKey];
    const source = colorSource[rowKey] || [];
    table[rowKey] = values.map((value, index) => ({
      value,
      color: source[index]?.color ?? 0xffffff,
    }));
  });
  return table;
}

const MULTIPLIER_TABLE_LOW = buildValueTable(
  MULTIPLIER_TABLE_LOW_VALUES,
  MULTIPLIER_TABLE_MEDIUM
);
const MULTIPLIER_TABLE_HIGH = buildValueTable(
  MULTIPLIER_TABLE_HIGH_VALUES,
  MULTIPLIER_TABLE_MEDIUM
);

const MULTIPLIER_TABLES = {
  low: MULTIPLIER_TABLE_LOW,
  medium: MULTIPLIER_TABLE_MEDIUM,
  high: MULTIPLIER_TABLE_HIGH,
};

function getMultiplierTable(difficulty) {
  return MULTIPLIER_TABLES[normalizeDifficulty(difficulty)];
}

function getMultiplierColor(value, rows, difficulty) {
  const multiplierData = getMultiplierTable(difficulty)?.[rows] || [];
  const multiplier = multiplierData.find((m) => m.value === value);

  return multiplier ? multiplier.color : 0xffffff; // Default white if not found
}

function createMultipliers(rows, difficulty) {
  const multipliers = getMultiplierTable(difficulty)?.[rows] || [];

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

function updateMultiplierUI(rows, difficulty) {
  uiContainer.removeChildren();

  createMultipliers(rows, difficulty);
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

const WINRATE_BIAS_RANGE = 8;

function normalizeProbabilities(probabilities) {
  const sum = probabilities.reduce((acc, value) => acc + value, 0);
  if (!Number.isFinite(sum) || sum <= 0) return probabilities.slice();
  return probabilities.map((value) => value / sum);
}

function getMultiplierValues(multipliers, count) {
  const values = [];
  for (let i = 0; i < count; i++) {
    const raw = multipliers[i]?.value ?? multipliers[i];
    const value = Number(raw);
    values.push(Number.isFinite(value) ? value : 0);
  }
  return values;
}

function getWinChanceFromValues(probabilities, values, minMultiplier) {
  const threshold = Number.isFinite(minMultiplier) ? minMultiplier : 1;
  let totalProbability = 0;
  let winProbability = 0;

  for (let i = 0; i < probabilities.length; i++) {
    const probability = Number(probabilities[i]);
    const multiplier = Number(values[i]);
    if (!Number.isFinite(probability) || probability < 0) {
      continue;
    }
    if (!Number.isFinite(multiplier)) {
      continue;
    }
    totalProbability += probability;
    if (multiplier >= threshold) {
      winProbability += probability;
    }
  }

  if (totalProbability <= 0) {
    return null;
  }

  return winProbability / totalProbability;
}

function buildWeightedProbabilities(baseProbabilities, values, bias) {
  const count = Math.min(baseProbabilities.length, values.length);
  if (count <= 0) return [];

  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < count; i++) {
    const value = values[i];
    if (!Number.isFinite(value)) continue;
    min = Math.min(min, value);
    max = Math.max(max, value);
  }

  if (!Number.isFinite(min) || !Number.isFinite(max) || max === min) {
    return normalizeProbabilities(baseProbabilities.slice(0, count));
  }

  const range = max - min;
  const weights = new Array(count);
  for (let i = 0; i < count; i++) {
    const base = Number(baseProbabilities[i]);
    if (!Number.isFinite(base) || base < 0) {
      weights[i] = 0;
      continue;
    }
    const score = (values[i] - min) / range;
    const factor = Math.exp(bias * (score - 0.5));
    weights[i] = base * factor;
  }

  return normalizeProbabilities(weights);
}

function buildWinRateProbabilities(
  baseProbabilities,
  multipliers,
  targetWinRate,
  minMultiplier
) {
  if (!Number.isFinite(targetWinRate)) {
    return baseProbabilities.slice();
  }

  const clampedTarget = clamp01(targetWinRate);
  const count = Math.min(baseProbabilities.length, multipliers.length);
  if (count <= 0) {
    return baseProbabilities.slice();
  }

  const base = baseProbabilities.slice(0, count);
  const values = getMultiplierValues(multipliers, count);

  let lowBias = -WINRATE_BIAS_RANGE;
  let highBias = WINRATE_BIAS_RANGE;

  let lowProbs = buildWeightedProbabilities(base, values, lowBias);
  let highProbs = buildWeightedProbabilities(base, values, highBias);

  let lowChance = getWinChanceFromValues(
    lowProbs,
    values,
    minMultiplier
  );
  let highChance = getWinChanceFromValues(
    highProbs,
    values,
    minMultiplier
  );

  if (!Number.isFinite(lowChance) || !Number.isFinite(highChance)) {
    return normalizeProbabilities(base);
  }

  if (lowChance > highChance) {
    [lowBias, highBias] = [highBias, lowBias];
    [lowChance, highChance] = [highChance, lowChance];
  }

  if (clampedTarget <= lowChance) {
    return lowProbs;
  }
  if (clampedTarget >= highChance) {
    return highProbs;
  }

  for (let i = 0; i < 30; i++) {
    const midBias = (lowBias + highBias) / 2;
    const midProbs = buildWeightedProbabilities(base, values, midBias);
    const midChance = getWinChanceFromValues(
      midProbs,
      values,
      minMultiplier
    );
    if (!Number.isFinite(midChance)) {
      break;
    }
    if (midChance < clampedTarget) {
      lowBias = midBias;
      lowChance = midChance;
    } else {
      highBias = midBias;
      highChance = midChance;
    }
  }

  return buildWeightedProbabilities(base, values, highBias);
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

function getPegOffsetXForRows(rows) {
  const layout = THEME.layout || {};
  const baseOffset = Number.isFinite(layout.pegOffsetX)
    ? layout.pegOffsetX
    : 0;
  const minRows = Number(layout.pegOffsetXMinRows);
  const maxRows = Number(layout.pegOffsetXMaxRows);
  const minOffset = Number(layout.pegOffsetXAtMinRows);
  const maxOffset = Number(layout.pegOffsetXAtMaxRows);

  const hasRange =
    Number.isFinite(minRows) &&
    Number.isFinite(maxRows) &&
    Number.isFinite(minOffset) &&
    Number.isFinite(maxOffset) &&
    minRows !== maxRows;
  if (!hasRange) {
    return baseOffset;
  }

  const t = (rows - minRows) / (maxRows - minRows);
  const clamped = Math.max(0, Math.min(1, t));
  return baseOffset + minOffset + (maxOffset - minOffset) * clamped;
}

function getPegPosition(
  row,
  col,
  gridWidth,
  startY,
  pegSpacingX,
  pegSpacingY,
  pegOffsetX
) {
  const offsetX = Number.isFinite(pegOffsetX) ? pegOffsetX : 0;
  const pegsInRow = row + 1;
  const rowWidth = (pegsInRow - 1) * pegSpacingX;
  const startX = (gridWidth - rowWidth) / 2;
  return {
    x: startX + col * pegSpacingX + offsetX,
    y: startY + row * pegSpacingY,
  };
}

function getMultipliersForRows(rows, difficulty) {
  const multipliers = getMultiplierTable(difficulty)?.[rows];

  if (!multipliers) {
    console.warn(`No multiplier data available for ${rows} rows.`);
    return [];
  }

  return multipliers.map((entry) => ({ ...entry }));
}

export async function createGame(mount, opts = {}) {
  const root =
    typeof mount === "string" ? document.querySelector(mount) : mount;
  if (!root) throw new Error("createGame: mount element not found");

  const minRows = opts.minRows ?? 8;
  const maxRows = opts.maxRows ?? 16;

  let rows = opts.rows ?? 16;
  rows = Math.max(minRows, Math.min(maxRows, rows));

  let difficulty = normalizeDifficulty(opts.difficulty);
  const historySize = opts.historySize ?? 10;

  let multipliers = getMultipliersForRows(rows, difficulty);
  let boxCount = multipliers.length;

  let baseProbabilities = generateBinomialProbabilities(rows);
  let probabilities = baseProbabilities.slice();
  let winRateTarget = normalizeWinRateValue(opts.winRate);
  let winRateMinMultiplier = Number.isFinite(opts.winRateMinMultiplier)
    ? opts.winRateMinMultiplier
    : 1;
  let phys = getPhysForRows(rows);

  let isAnimating = false;
  let activeDrops = 0;
  let history = [];

  const markDropStart = () => {
    activeDrops += 1;
    isAnimating = activeDrops > 0;
  };

  const markDropEnd = () => {
    activeDrops = Math.max(0, activeDrops - 1);
    isAnimating = activeDrops > 0;
  };

  const rebuildProbabilities = () => {
    probabilities = buildWinRateProbabilities(
      baseProbabilities,
      multipliers,
      winRateTarget,
      winRateMinMultiplier
    );
  };

  rebuildProbabilities();

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
  let historyTweens = [];

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
  let pegOffsetX = 0;

  let scoreZoneTop = 0;
  let scoreZoneBottom = 0;

  function isPegVisible(row) {
    return row >= (THEME.pegPattern.startRow ?? 0);
  }

  function calculateLayout() {
    const containerWidth = Math.max(1, root.clientWidth || 500);
    const containerHeight = Math.max(1, root.clientHeight || 500);

    const layout = THEME.layout || {};
    const leftPadding = layout.leftPadding ?? 0;
    const rightPadding = layout.rightPadding ?? 0;
    const historyGap = layout.historyGap ?? 5;
    pegOffsetX = getPegOffsetXForRows(rows);

    historyPanelWidth = Math.min(110, containerWidth * 0.16);
    const playAreaWidth = Math.max(
      1,
      containerWidth - historyPanelWidth - historyGap - leftPadding - rightPadding
    );

    gameWidth = playAreaWidth;
    gameHeight = containerHeight;

    const maxPegsInRow = rows + 1;

    gridStartY =
      gameHeight * (layout.gridStartYScale ?? 0.055) +
      (layout.gridStartYOffset ?? 0);
    gridWidth = gameWidth;

    const bottomReserve = gameHeight * 0.14;
    const usableH = gameHeight - gridStartY - bottomReserve;

    pegSpacingX = (gameWidth * 0.9) / maxPegsInRow;
    pegSpacingY = (usableH * 0.92) / (rows + 1);

    pegRadius = Math.min(pegSpacingX, pegSpacingY) * THEME.pegRadiusScale;
    ballRadius = pegRadius * THEME.ballRadiusScale;

    historyPanelX = gridWidth + historyGap + (layout.historyOffsetX ?? 0);
    historyPanelY = gridStartY + (layout.historyOffsetY ?? 0);

    lastRowY = gridStartY + rows * pegSpacingY;
    baseWidth = rows * pegSpacingX * (layout.baseWidthScale ?? 1.2);
    baseLeft = (gridWidth - baseWidth) / 2;
    baseRight = baseLeft + baseWidth;
    apexX = gridWidth / 2;

    mainContainer.position.set(
      leftPadding + (layout.boardOffsetX ?? 0),
      layout.boardOffsetY ?? 0
    );
  }

  function triangleBoundsAtY(y) {
    const y0 = gridStartY;
    const y1 = lastRowY;
    const t = y1 === y0 ? 1 : Math.max(0, Math.min(1, (y - y0) / (y1 - y0)));
    const w = baseWidth * t;
    const left = apexX + pegOffsetX - w / 2;
    const right = apexX + pegOffsetX + w / 2;
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
          pegSpacingY,
          pegOffsetX
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

    const insetScale = THEME.multiplierBox.innerInsetScale ?? 0;
    const innerAlpha = THEME.multiplierBox.innerAlpha ?? 0;
    if (insetScale > 0 && innerAlpha > 0) {
      const inset = Math.max(2, Math.floor(Math.min(w, h) * insetScale));
      const innerW = Math.max(1, w - inset * 2);
      const innerH = Math.max(1, h - inset * 1.5);
      const innerR = Math.max(2, r - inset * 0.6);
      g.beginFill(0x000000, innerAlpha);
      g.drawRoundedRect(inset, inset * 0.7, innerW, innerH, innerR);
      g.endFill();
    }

    g.beginFill(0xffffff, THEME.multiplierBox.highlightAlpha);
    g.drawRoundedRect(0, 0, w, h * 0.42, Math.max(8, r - 2));
    g.endFill();

    g.lineStyle(
      THEME.multiplierBox.borderWidth ?? 2,
      0x000000,
      THEME.multiplierBox.strokeAlpha
    );
    g.drawRoundedRect(0, 0, w, h, r);
  }

  function createBoxes() {
    boxGraphics.forEach((b) => b.destroy());
    boxTexts.forEach((t) => t.destroy());
    boxGraphics = [];
    boxTexts = [];

    const gap = THEME.multiplierBox.gap;
    const layout = THEME.layout || {};
    const maxBoxesWidth = Math.min(
      baseWidth * getBoxRowWidthScaleForRows(rows, layout),
      gridWidth
    );

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

    // Centering the boxes by calculating startX
    const startX =
      baseLeft + (baseWidth - totalW) / 2 + (layout.boxOffsetX ?? 0);
    // Adjust the Y position for the boxes based on available space
    const boxY =
      Math.min(gameHeight - h - 12, lastRowY + pegSpacingY * 0.65) +
      (layout.boxOffsetY ?? 0);

    // Create boxes for the multipliers
    for (let i = 0; i < boxCount; i++) {
      const multiplier = multipliers[i];
      const color =
        multiplier?.color ??
        getMultiplierColor(multiplier?.value, rows, difficulty);
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

  function destroyBallAndResolve(resolve, value, ballToDestroy) {
    if (!ballToDestroy) {
      resolve(value);
      return;
    }
    tween(app, {
      duration: 220,
      update: (t) => {
        if (!ballToDestroy || ballToDestroy.destroyed) return;
        ballToDestroy.alpha = 1 - t;
        ballToDestroy.scale.set(1 - t * 0.35);
      },
      complete: () => {
        if (ballToDestroy && !ballToDestroy.destroyed) {
          ballToDestroy.destroy();
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
    historyTweens.forEach((cancel) => cancel());
    historyTweens = [];
    historyBoxes.forEach((b) => b.destroy());
    historyBoxes = [];

    const startY = historyPanelY + 20;
    const availableHeight = Math.max(1, gameHeight - startY - 10);
    const entryHeight = availableHeight / Math.max(1, historySize);
    const maxBoxSize = Math.max(6, Math.min(historyPanelWidth - 10, 60));
    const boxHeight = Math.min(entryHeight * 0.9, maxBoxSize * 0.62);
    const boxSize = Math.max(6, Math.min(maxBoxSize, boxHeight / 0.62));
    const gap = Math.max(2, Math.min(8, entryHeight - boxSize * 0.62));

    history.slice(0, historySize).forEach((multiplier, index) => {
      if (multiplier == null) return;
      // if (typeof multiplier !== "number") {
      //   console.warn(`History multiplier is not a number:`, multiplier);
      //   multiplier = 0; // Default to 0 if it's not a valid number
      // }

      const value = Number(multiplier?.value ?? multiplier);
      const hasValue = Number.isFinite(value);
      const color = multiplier?.color ?? 0xffffff; // Default to white if not found
      const textColor = getMultiplierTextColor(value);

      const wrap = new Container();

      const box = new Graphics();
      drawButtonBox(box, boxSize, boxSize * 0.62, color);

      const style = new TextStyle({
        fontFamily: THEME.multiplierBox.fontFamily,
        fontSize: boxSize * 0.26,
        fontWeight: THEME.multiplierBox.fontWeight,
        fill: textColor,
      });

      const label = hasValue ? `${value}x` : "N/A";

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

        const cancel = tween(app, {
          duration: 400,
          update: (t) => {
            if (wrap.destroyed) return;
            const eased = easeOutBack(t);
            wrap.scale.set(eased);
            wrap.alpha = t;
          },
        });
        historyTweens.push(cancel);
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
    if (!boxGraphics.length) return -1;
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
    if (!box || !text || box.destroyed || text.destroyed) return;

    tween(app, {
      duration: 160,
      update: (t) => {
        if (box.destroyed || text.destroyed) return;
        const s = 1 + Math.sin(t * Math.PI) * 0.22;
        box.scale.set(s);
        text.scale.set(s);
      },
      complete: () => {
        if (box.destroyed || text.destroyed) return;
        box.scale.set(1);
        text.scale.set(1);
      },
    });
  }

  function destroyBallAndResolve(resolve, value, ballToDestroy) {
    if (!ballToDestroy) {
      resolve(value);
      return;
    }
    tween(app, {
      duration: 220,
      update: (t) => {
        if (!ballToDestroy) return;
        ballToDestroy.alpha = 1 - t;
        ballToDestroy.scale.set(1 - t * 0.35);
      },
      complete: () => {
        if (ballToDestroy) {
          ballToDestroy.destroy();
        }
        resolve(value);
      },
    });
  }

  function clampStateSpeed(state, maxSpeed) {
    if (!Number.isFinite(maxSpeed) || maxSpeed <= 0) return;
    const speed = Math.hypot(state.vx, state.vy);
    if (speed > maxSpeed) {
      const k = maxSpeed / speed;
      state.vx *= k;
      state.vy *= k;
    }
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

    const penetration = r - d + phys.collisionSlop;
    state.x += nx * penetration;
    state.y += ny * penetration;

    const vDotN = state.vx * nx + state.vy * ny;
    if (vDotN < 0) {
      const incomingVx = state.vx;
      const tx = -ny;
      const ty = nx;

      const vDotT = state.vx * tx + state.vy * ty;

      let j = -(1 + phys.restitution) * vDotN;
      if (state.y > pegY) {
        j = 0;
      }
      state.vx += j * nx;
      state.vy += j * ny;

      state.vx =
        tx * (vDotT * phys.tangentialDamp) +
        nx * (state.vx * nx + state.vy * ny);
      state.vy =
        ty * (vDotT * phys.tangentialDamp) +
        ny * (state.vx * nx + state.vy * ny);

      state.vx += (Math.random() - 0.5) * phys.impulseJitter;

      const angleJitter = Number.isFinite(phys.bounceAngleJitter)
        ? phys.bounceAngleJitter
        : 0;
      if (angleJitter > 0) {
        const angle = (Math.random() - 0.5) * angleJitter * 2;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const vx = state.vx;
        const vy = state.vy;
        state.vx = vx * cos - vy * sin;
        state.vy = vx * sin + vy * cos;
      }

      const keepChance = Number.isFinite(phys.keepDirectionChance)
        ? phys.keepDirectionChance
        : 0;
      const shouldKeep = Math.random() < keepChance;
      if (!shouldKeep) {
        let incomingSign = Math.sign(incomingVx);
        if (incomingSign === 0) {
          incomingSign = Math.random() < 0.5 ? -1 : 1;
        }
        const outgoingSign = Math.sign(state.vx);
        if (outgoingSign === 0 || outgoingSign === incomingSign) {
          state.vx = -state.vx;
          if (Math.abs(state.vx) < 1e-4) {
            const nudge = Math.max(
              1,
              Math.abs(incomingVx),
              phys.impulseJitter
            );
            state.vx = -incomingSign * nudge;
          }
        }
      }

      const centerBiasStrength = phys.centerBiasStrength ?? 0;
      if (centerBiasStrength > 0 && Math.abs(state.vx) > 1e-4) {
        const toCenter = apexX + pegOffsetX - state.x;
        const directionToCenter = Math.sign(toCenter);
        if (directionToCenter !== 0) {
          const maxDistance = Math.max(1, gridWidth * 0.5);
          const distanceFactor = Math.min(1, Math.abs(toCenter) / maxDistance);
          if (distanceFactor > 0) {
            const jitter =
              1 + (Math.random() - 0.5) * (phys.centerBiasJitter ?? 0);
            const bias = centerBiasStrength * distanceFactor * jitter;
            const movingTowardCenter =
              Math.sign(state.vx) === directionToCenter;
            state.vx *= movingTowardCenter ? 1 + bias : 1 - bias;
          }
        }
      }

      clampStateSpeed(state, phys.maxSpeed);

      spawnRipple(pegX, pegY - pegRadius * 0.2);
      return true;
    }
    return false;
  }

  async function simulateDrop(targetIndex) {
    return new Promise((resolve) => {
      const activeBall = createBall();
      activeBall.alpha = 1;
      activeBall.scale.set(1);
      ballContainer.addChild(activeBall);

      const startRow = THEME.pegPattern.startRow ?? 0;
      const startPos = getPegPosition(
        startRow,
        0,
        gridWidth,
        gridStartY,
        pegSpacingX,
        pegSpacingY,
        pegOffsetX
      );

      const layout = THEME.layout || {};
      const spawnCompensate = layout.spawnCompensatePegOffset ?? true;
      const boxCenterBounds = (() => {
        if (boxGraphics.length && boxWidth > 0) {
          const first = boxGraphics[0];
          const last = boxGraphics[boxGraphics.length - 1];
          if (first && last) {
            const left = first.x + boxWidth / 2;
            const right = last.x + boxWidth / 2;
            if (right > left) {
              return { left, right, center: (left + right) / 2, has: true };
            }
          }
        }
        return {
          left: ballRadius,
          right: gridWidth - ballRadius,
          center: apexX,
          has: false,
        };
      })();

      const spawnOffsetX =
        (Number.isFinite(layout.spawnOffsetX) ? layout.spawnOffsetX : 0) +
        (!boxCenterBounds.has && spawnCompensate ? -pegOffsetX : 0);
      const spawnOffsetY = Number.isFinite(layout.spawnOffsetY)
        ? layout.spawnOffsetY
        : 0;
      const spawnCenterX = boxCenterBounds.center + spawnOffsetX;

      const spawnRangeX = getSpawnRangeXForRows(
        rows,
        pegSpacingX,
        boxWidth,
        layout
      );
      const spawnClampPadding = Number.isFinite(layout.spawnClampPadding)
        ? layout.spawnClampPadding
        : 0;
      const clampPad = Math.max(0, spawnClampPadding);
      const halfBoxWidth = boxWidth > 0 ? boxWidth / 2 : 0;
      const boundsLeft = boxCenterBounds.left - halfBoxWidth;
      const boundsRight = boxCenterBounds.right + halfBoxWidth;
      const spawnLeft = boundsLeft - clampPad;
      const spawnRight = boundsRight + clampPad;
      const playBounds = { left: spawnLeft, right: spawnRight };

      const targetBox =
        Number.isFinite(targetIndex) && targetIndex >= 0
          ? boxGraphics[targetIndex]
          : null;
      const targetX =
        targetBox && Number.isFinite(targetBox.x)
          ? targetBox.x + boxWidth / 2
          : null;
      const spawnX = Math.max(
        spawnLeft,
        Math.min(
          spawnRight,
          spawnCenterX + (Math.random() - 0.5) * spawnRangeX
        )
      );
      const spawnSpeed =
        Number.isFinite(phys.constantSpeed) && phys.constantSpeed > 0
          ? phys.constantSpeed
          : Number.isFinite(phys.spawnSpeed)
            ? phys.spawnSpeed
            : 0;
      const spawnAngleJitter = Number.isFinite(phys.spawnAngleJitter)
        ? phys.spawnAngleJitter
        : 0;
      const spawnAngle =
        Math.PI / 2 + (Math.random() - 0.5) * spawnAngleJitter;
      const spawnVx = Math.cos(spawnAngle) * spawnSpeed;
      const spawnVy = Math.sin(spawnAngle) * spawnSpeed;

      const state = {
        x: spawnX,
        y: startPos.y - pegSpacingY * 0.9 + spawnOffsetY,
        vx: spawnVx,
        vy: spawnVy,
      };
      activeBall.x = state.x;
      activeBall.y = state.y;

      let done = false;

      const step = (ticker) => {
        if (done) return;

        const dt = Math.min(1 / 30, ticker.deltaMS / 1000);

        state.vy += phys.gravity * dt;

        state.vx *= Math.pow(phys.drag, dt * 60);
        state.vy *= Math.pow(phys.drag, dt * 60);

        if (Number.isFinite(targetX)) {
          const dx = targetX - state.x;
          state.vx += dx * phys.aimStrength * dt * 60;
        }

        const speedLimit = Number.isFinite(phys.maxSpeed) ? phys.maxSpeed : 0;
        const sp = Math.hypot(state.vx, state.vy);
        if (speedLimit > 0 && sp > speedLimit) {
          const k = speedLimit / sp;
          state.vx *= k;
          state.vy *= k;
        }

        state.x += state.vx * dt;
        state.y += state.vy * dt;

        const b = playBounds;
        const left = b.left + ballRadius;
        const right = b.right - ballRadius;

        if (state.x < left) {
          state.x = left;
          if (state.vx < 0) state.vx = -state.vx * phys.wallRestitution;
        } else if (state.x > right) {
          state.x = right;
          if (state.vx > 0) state.vx = -state.vx * phys.wallRestitution;
        }

        let hit = false;
        for (let i = 0; i < pegPoints.length; i++) {
          if (resolvePegCollision(state, pegPoints[i].x, pegPoints[i].y))
            hit = true;
        }

        const maxSpeed = Number.isFinite(phys.maxSpeed) ? phys.maxSpeed : 0;
        const minSpeed = Number.isFinite(phys.minSpeed) ? phys.minSpeed : 0;
        const constantSpeed = Number.isFinite(phys.constantSpeed)
          ? phys.constantSpeed
          : 0;
        let speed = Math.hypot(state.vx, state.vy);
        if (constantSpeed > 0) {
          const target =
            maxSpeed > 0 ? Math.min(constantSpeed, maxSpeed) : constantSpeed;
          if (target > 0) {
            if (speed < 1e-4) {
              state.vx = 0;
              state.vy = target;
            } else {
              const k = target / speed;
              state.vx *= k;
              state.vy *= k;
            }
          }
        } else {
          if (maxSpeed > 0 && speed > maxSpeed) {
            const k = maxSpeed / speed;
            state.vx *= k;
            state.vy *= k;
            speed = maxSpeed;
          }
          const floorSpeed =
            minSpeed > 0
              ? maxSpeed > 0
                ? Math.min(minSpeed, maxSpeed)
                : minSpeed
              : 0;
          if (floorSpeed > 0 && speed < floorSpeed) {
            if (speed < 1e-4) {
              state.vx = 0;
              state.vy = floorSpeed;
            } else {
              const k = floorSpeed / speed;
              state.vx *= k;
              state.vy *= k;
            }
          }
        }

        const squash = 1 + Math.min(0.18, Math.abs(state.vy) / 2400) * 0.12;
        activeBall.scale.set(1 / squash, squash);
        activeBall.x = state.x;
        activeBall.y = state.y;

        if (hit && THEME.pinBounce.enabled) {
          const baseY = activeBall.y;
          const down = pegRadius * THEME.pinBounce.downOffsetScale;
          tween(app, {
            duration: THEME.pinBounce.duration,
            update: (t) => {
              if (activeBall.destroyed) return;
              const e = easeOutQuad(t);
              const phase = Math.sin(e * Math.PI);
              activeBall.y = baseY + phase * down;
            },
            complete: () => {
              if (activeBall.destroyed) return;
              activeBall.y = baseY;
            },
          });
        }

        const boxTop = boxGraphics[0]?.y ?? lastRowY + pegSpacingY;
        const entryInset = Math.min(
          boxHeight * 0.45,
          Math.max(
            ballRadius * 0.6,
            boxHeight * (THEME.multiplierBox.entryInsetScale ?? 0.22)
          )
        );
        const entryBottom = Math.max(
          entryInset + ballRadius,
          boxHeight * (THEME.multiplierBox.entryBottomScale ?? 0.92)
        );
        const zTop = scoreZoneTop || boxTop + entryInset;
        const zBottom = scoreZoneBottom || boxTop + entryBottom;

        if (state.y >= zTop && state.y <= zBottom) {
          const landedIndex = getClosestBoxIndexByX(state.x);
          done = true;
          app.ticker.remove(step);
          if (landedIndex >= 0) {
            highlightBox(landedIndex);
            destroyBallAndResolve(resolve, landedIndex, activeBall);
          } else {
            destroyBallAndResolve(resolve, -1, activeBall);
          }
          return;
        }

        if (state.y > gameHeight + ballRadius * 3) {
          done = true;
          app.ticker.remove(step);
          destroyBallAndResolve(resolve, -1, activeBall);
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

  function getRtpEstimate() {
    if (!Array.isArray(probabilities) || !Array.isArray(multipliers)) {
      return null;
    }
    const count = Math.min(probabilities.length, multipliers.length);
    if (count <= 0) {
      return null;
    }

    let weightedSum = 0;
    let totalProbability = 0;

    for (let i = 0; i < count; i++) {
      const probability = Number(probabilities[i]);
      const multiplier = Number(multipliers[i]?.value ?? multipliers[i]);
      if (!Number.isFinite(probability) || probability < 0) {
        continue;
      }
      if (!Number.isFinite(multiplier)) {
        continue;
      }
      weightedSum += probability * multiplier;
      totalProbability += probability;
    }

    if (totalProbability <= 0) {
      return null;
    }

    return weightedSum / totalProbability;
  }

  function getWinChance(minMultiplier = 1) {
    if (!Array.isArray(probabilities) || !Array.isArray(multipliers)) {
      return null;
    }
    const count = Math.min(probabilities.length, multipliers.length);
    if (count <= 0) {
      return null;
    }

    const threshold = Number(minMultiplier);
    let totalProbability = 0;
    let winProbability = 0;

    for (let i = 0; i < count; i++) {
      const probability = Number(probabilities[i]);
      const multiplier = Number(multipliers[i]?.value ?? multipliers[i]);
      if (!Number.isFinite(probability) || probability < 0) {
        continue;
      }
      if (!Number.isFinite(multiplier)) {
        continue;
      }
      totalProbability += probability;
      if (multiplier >= threshold) {
        winProbability += probability;
      }
    }

    if (totalProbability <= 0) {
      return null;
    }

    return winProbability / totalProbability;
  }

  calculateLayout();
  resize();

  const resizeObserver = new ResizeObserver(() => resize());
  resizeObserver.observe(root);
  window.addEventListener("resize", resize);

  return {
    async startRound() {
      markDropStart();

      try {
        const fullBoxCount = rows + 1;

        let probs = probabilities;
        if (!Array.isArray(probs) || probs.length !== fullBoxCount) {
          baseProbabilities = generateBinomialProbabilities(rows);
          rebuildProbabilities();
          probs = probabilities;
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
          return multiplier;
        }

        return -1;
      } finally {
        markDropEnd();
      }
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
        difficulty,
        boxCount,
        multipliers: multipliers.slice(),
        winRateTarget,
        winRateMinMultiplier,
      };
    },

    setProbabilities(weights) {
      if (!Array.isArray(weights) || weights.length !== boxCount) return;
      baseProbabilities = [...weights];
      rebuildProbabilities();
    },

    setWinRate(value, minMultiplier = 1) {
      let nextValue = value;
      let nextMinMultiplier = minMultiplier;
      if (value && typeof value === "object") {
        nextValue = value.value;
        nextMinMultiplier = value.minMultiplier;
      }

      winRateTarget = normalizeWinRateValue(nextValue);
      winRateMinMultiplier = Number.isFinite(nextMinMultiplier)
        ? nextMinMultiplier
        : 1;
      rebuildProbabilities();
    },

    getRtpEstimate() {
      return getRtpEstimate();
    },

    getWinChance({ minMultiplier = 1 } = {}) {
      return getWinChance(minMultiplier);
    },

    setDifficulty(newDifficulty) {
      if (isAnimating) return;
      const normalized = normalizeDifficulty(newDifficulty);
      if (normalized === difficulty) return;
      difficulty = normalized;
      multipliers = getMultipliersForRows(rows, difficulty);
      boxCount = multipliers.length;
      rebuildProbabilities();
      createBoxes();
      updateHistoryDisplay();
    },

    setRows(newRows) {
      if (isAnimating) return;

      const target = Math.round(newRows);
      const clamped = Math.max(minRows, Math.min(maxRows, target));
      if (clamped === rows) return;

      rows = clamped;
      multipliers = getMultipliersForRows(rows, difficulty);
      boxCount = multipliers.length;
      baseProbabilities = generateBinomialProbabilities(rows);
      rebuildProbabilities();
      phys = getPhysForRows(rows);

      resize();
    },
  };
}
