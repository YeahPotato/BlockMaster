/**
 * 积木块形状定义
 * 每个形状是一个 2D 数组，1 表示有方块，0 表示无方块
 */

const SHAPES = {
  // ===== 1 格 =====
  '1': [[1]],

  // ===== 2 格 =====
  I2: [[1, 1]],

  // ===== 3 格 =====
  I3: [[1, 1, 1]],
  L3: [
    [1, 0],
    [1, 1],
  ],

  // ===== 4 格（俄罗斯方块经典 7 种） =====
  I4: [[1, 1, 1, 1]],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [1, 1, 1],
    [0, 1, 0],
  ],
  L: [
    [1, 0],
    [1, 0],
    [1, 1],
  ],
  J: [
    [0, 1],
    [0, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
  ],

  // ===== 5 格（高难度） =====
  P: [
    [1, 1],
    [1, 1],
    [1, 0],
  ],
  U: [
    [1, 0, 1],
    [1, 1, 1],
  ],
  PLUS: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0],
  ],
  W: [
    [1, 0, 0],
    [1, 1, 0],
    [0, 1, 1],
  ],
};

/**
 * 顺时针旋转 90 度
 */
function rotate90(shape) {
  const rows = shape.length;
  const cols = shape[0].length;
  const result = [];
  for (let i = 0; i < cols; i++) {
    const newRow = [];
    for (let j = rows - 1; j >= 0; j--) {
      newRow.push(shape[j][i]);
    }
    result.push(newRow);
  }
  return result;
}

/**
 * 获取形状的所有不重复旋转（最多 4 个）
 */
function getUniqueRotations(shape) {
  const rotations = [shape];
  let current = shape;
  for (let i = 0; i < 3; i++) {
    current = rotate90(current);
    if (!rotations.some((r) => shapeEquals(r, current))) {
      rotations.push(current);
    }
  }
  return rotations;
}

function shapeEquals(a, b) {
  if (a.length !== b.length) return false;
  if (a[0].length !== b[0].length) return false;
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a[0].length; j++) {
      if (a[i][j] !== b[i][j]) return false;
    }
  }
  return true;
}

/**
 * 获取形状的方块数（即"格子数"）
 */
function shapeSize(shape) {
  let count = 0;
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      if (shape[i][j]) count++;
    }
  }
  return count;
}

/**
 * 颜色调色板（默认 7 色）
 */
const COLORS = [
  '#FF6B6B', // 红
  '#FFA94D', // 橙
  '#FFD43B', // 黄
  '#51CF66', // 绿
  '#339AF0', // 蓝
  '#845EF7', // 紫
  '#F783AC', // 粉
];

module.exports = {
  SHAPES,
  COLORS,
  rotate90,
  getUniqueRotations,
  shapeEquals,
  shapeSize,
};
