/**
 * 关卡生成器
 *
 * 思路（反向构造法）：
 * 1. 在网格内随机放置 N 个不重叠的积木块
 * 2. 把放置后形成的形状作为"目标区域"
 * 3. 把使用的块打乱顺序作为"可用块"
 * 4. 用求解器验证：解的数量是否合理
 * 5. 评估难度，输出 JSON
 */

const { SHAPES, COLORS, rotate90, getUniqueRotations, shapeSize } = require('./block-shapes');
const { solve } = require('./solver');

// ============ 难度配置表 ============
// 难度 1-10，对应不同章节
const DIFFICULTY_CONFIGS = {
  1: { gridW: 5, gridH: 5, blockCount: 3, shapePool: ['1', 'I2', 'I3'] },
  2: { gridW: 5, gridH: 5, blockCount: 4, shapePool: ['I2', 'I3', 'L3'] },
  3: { gridW: 6, gridH: 6, blockCount: 4, shapePool: ['I3', 'L3', 'O'] },
  4: { gridW: 6, gridH: 6, blockCount: 5, shapePool: ['L3', 'O', 'T', 'L'] },
  5: { gridW: 7, gridH: 7, blockCount: 5, shapePool: ['O', 'T', 'L', 'J', 'S'] },
  6: { gridW: 7, gridH: 7, blockCount: 6, shapePool: ['T', 'L', 'J', 'S', 'Z'] },
  7: { gridW: 8, gridH: 8, blockCount: 6, shapePool: ['I4', 'O', 'T', 'L', 'J', 'S', 'Z'] },
  8: { gridW: 8, gridH: 8, blockCount: 7, shapePool: ['I4', 'O', 'T', 'L', 'J', 'S', 'Z', 'P'] },
  9: { gridW: 9, gridH: 9, blockCount: 7, shapePool: ['I4', 'T', 'L', 'J', 'S', 'Z', 'P', 'U'] },
  10: { gridW: 10, gridH: 10, blockCount: 8, shapePool: ['I4', 'T', 'L', 'J', 'S', 'Z', 'P', 'U', 'W', 'PLUS'] },
};

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 在网格中尝试放置一个形状（任意位置 + 任意旋转）
 * 返回放置成功的格子列表（如果成功），失败返回 null
 */
function tryPlaceShape(grid, gridW, gridH, shape) {
  // 随机尝试旋转
  const rotations = getUniqueRotations(shape);
  const rotation = randPick(rotations);
  const rh = rotation.length;
  const rw = rotation[0].length;

  if (rh > gridH || rw > gridW) return null;

  // 随机找位置（最多尝试 30 次）
  for (let attempt = 0; attempt < 30; attempt++) {
    const row = randInt(0, gridH - rh);
    const col = randInt(0, gridW - rw);

    // 检查是否可以放置
    let canPlace = true;
    const cells = [];
    for (let i = 0; i < rh && canPlace; i++) {
      for (let j = 0; j < rw && canPlace; j++) {
        if (rotation[i][j] === 1) {
          if (grid[row + i][col + j] !== 0) {
            canPlace = false;
          } else {
            cells.push([row + i, col + j]);
          }
        }
      }
    }

    if (canPlace) {
      // 实际放置（用唯一标记，便于后续提取）
      const marker = Math.random();
      for (const [r, c] of cells) {
        grid[r][c] = marker;
      }
      return { rotation, row, col, cells, marker };
    }
  }

  return null;
}

/**
 * 生成一个关卡
 * @param {number} difficulty - 1-10
 * @returns {Object|null} 关卡对象，失败返回 null
 */
function generateLevel(difficulty) {
  const config = DIFFICULTY_CONFIGS[difficulty];
  if (!config) return null;

  const { gridW, gridH, blockCount, shapePool } = config;

  // 多次尝试，直到生成合理关卡
  for (let attempt = 0; attempt < 50; attempt++) {
    const grid = Array.from({ length: gridH }, () => new Array(gridW).fill(0));
    const placedBlocks = [];

    // 随机放置 blockCount 个块
    let success = true;
    for (let i = 0; i < blockCount; i++) {
      const shapeName = randPick(shapePool);
      const shape = SHAPES[shapeName];
      const result = tryPlaceShape(grid, gridW, gridH, shape);
      if (!result) {
        success = false;
        break;
      }
      placedBlocks.push({
        shapeName,
        originalShape: shape, // 保存原始未旋转的形状
        cells: result.cells,
      });
    }

    if (!success || placedBlocks.length < blockCount) continue;

    // 提取目标区域
    const targetCells = [];
    for (let i = 0; i < gridH; i++) {
      for (let j = 0; j < gridW; j++) {
        if (grid[i][j] !== 0) targetCells.push([i, j]);
      }
    }

    // 构造可用块列表（每个块用原始形状，颜色随机分配）
    const availableBlocks = placedBlocks.map((b, idx) => ({
      id: `${b.shapeName}_${idx}`,
      shapeName: b.shapeName,
      shape: b.originalShape,
      color: COLORS[idx % COLORS.length],
    }));

    // 用求解器验证（最多找 6 个解）
    const solutions = solve(targetCells, availableBlocks, 6);

    if (solutions.length === 0) continue; // 无解，重新生成
    if (solutions.length > 5 && difficulty >= 3) continue; // 解太多，对中高难度太简单

    // 难度评级
    const difficultyScore = computeDifficulty(availableBlocks, solutions.length);

    return {
      gridSize: { width: gridW, height: gridH },
      targetCells,
      availableBlocks: shuffle(availableBlocks),
      solutionCount: solutions.length,
      difficultyScore,
    };
  }

  return null;
}

/**
 * 难度评分（综合考量）
 */
function computeDifficulty(blocks, solutionCount) {
  const totalCells = blocks.reduce((sum, b) => sum + shapeSize(b.shape), 0);
  const blockCount = blocks.length;
  const rotatableCount = blocks.filter((b) => getUniqueRotations(b.shape).length > 1).length;

  // 块数 * 2 + 总格子 * 0.5 + 可旋转块数 * 1.5 - 解数量 * 2
  const score = blockCount * 2 + totalCells * 0.5 + rotatableCount * 1.5 - solutionCount * 2;
  return Math.max(1, Math.round(score));
}

module.exports = {
  generateLevel,
  DIFFICULTY_CONFIGS,
};
