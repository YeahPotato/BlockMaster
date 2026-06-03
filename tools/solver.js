/**
 * 关卡求解器
 * 用于验证关卡是否有解，以及统计解的数量（评估难度）
 *
 * 算法：回溯 + 剪枝
 */

const { getUniqueRotations } = require('./block-shapes');

/**
 * 判断 shape 是否能放在 grid 的 (row, col) 位置（左上角对齐）
 * 要求：
 *   - 形状的每个 1 单元格都要落在 targetCells 中
 *   - 该单元格还没被占用
 */
function canPlace(grid, shape, row, col, targetSet, occupied) {
  const rows = shape.length;
  const cols = shape[0].length;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (shape[i][j] === 1) {
        const r = row + i;
        const c = col + j;
        const key = `${r},${c}`;
        if (!targetSet.has(key)) return false;
        if (occupied.has(key)) return false;
      }
    }
  }
  return true;
}

function placeBlock(shape, row, col, occupied, marker) {
  const cells = [];
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      if (shape[i][j] === 1) {
        const key = `${row + i},${col + j}`;
        occupied.set(key, marker);
        cells.push(key);
      }
    }
  }
  return cells;
}

function removeBlock(cells, occupied) {
  for (const key of cells) {
    occupied.delete(key);
  }
}

/**
 * 求解器主函数
 * @param {Array} targetCells - 目标格子 [[r,c], ...]
 * @param {Array} blocks - 可用块 [{id, shape, color}, ...]
 * @param {number} maxSolutions - 最多找多少个解（默认 5，用于难度评估）
 * @returns {Array} 解的列表
 */
function solve(targetCells, blocks, maxSolutions = 5) {
  const targetSet = new Set(targetCells.map(([r, c]) => `${r},${c}`));
  const occupied = new Map();
  const solutions = [];

  // 预计算每个块的所有旋转
  const blocksWithRotations = blocks.map((b, idx) => ({
    idx,
    rotations: getUniqueRotations(b.shape),
  }));

  // 验证：总格子数必须等于所有块的格子数之和
  let totalShapeCells = 0;
  for (const b of blocks) {
    for (let i = 0; i < b.shape.length; i++) {
      for (let j = 0; j < b.shape[i].length; j++) {
        if (b.shape[i][j] === 1) totalShapeCells++;
      }
    }
  }
  if (totalShapeCells !== targetCells.length) return [];

  // 排序目标格子（行优先，便于"找到第一个空格优先填充"策略）
  const sortedTargets = [...targetCells].sort(
    (a, b) => a[0] - b[0] || a[1] - b[1]
  );

  function backtrack(usedBlocks, currentSolution) {
    if (solutions.length >= maxSolutions) return;

    // 找到第一个未被占用的目标格子
    let target = null;
    for (const [r, c] of sortedTargets) {
      if (!occupied.has(`${r},${c}`)) {
        target = [r, c];
        break;
      }
    }

    if (target === null) {
      // 所有目标格子都被填满 = 找到一个解
      if (usedBlocks.size === blocks.length) {
        solutions.push([...currentSolution]);
      }
      return;
    }

    // 尝试用每个未使用的块填充这个格子
    for (const { idx, rotations } of blocksWithRotations) {
      if (usedBlocks.has(idx)) continue;

      for (let rotIdx = 0; rotIdx < rotations.length; rotIdx++) {
        const shape = rotations[rotIdx];
        // 尝试每种偏移：让 shape 的某个 "1" 落在 target 上
        for (let i = 0; i < shape.length; i++) {
          for (let j = 0; j < shape[i].length; j++) {
            if (shape[i][j] !== 1) continue;
            const row = target[0] - i;
            const col = target[1] - j;

            if (canPlace(null, shape, row, col, targetSet, occupied)) {
              const cells = placeBlock(shape, row, col, occupied, idx);
              usedBlocks.add(idx);
              currentSolution.push({
                blockIdx: idx,
                rotation: rotIdx,
                row,
                col,
              });

              backtrack(usedBlocks, currentSolution);

              currentSolution.pop();
              usedBlocks.delete(idx);
              removeBlock(cells, occupied);

              if (solutions.length >= maxSolutions) return;
            }
          }
        }
      }
    }
  }

  backtrack(new Set(), []);
  return solutions;
}

module.exports = { solve };
