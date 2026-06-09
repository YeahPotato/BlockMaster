/**
 * 方块拼图 - 题目生成器
 * 负责生成可拼接的方块组合
 */

class PuzzleGenerator {
  // 基础方块形状库（用 1x1 单元格表示）
  static SHAPES = {
    // 1x1
    I1: [[1]],
    // 1x2
    I2: [[1, 1]],
    // 2x1
    I2V: [[1], [1]],
    // 2x2
    I22: [[1, 1], [1, 1]],
    // L 形
    L: [[1, 0], [1, 0], [1, 1]],
    L2: [[1, 1], [1, 0], [1, 0]],
    L3: [[0, 1], [0, 1], [1, 1]],
    L4: [[1, 1], [0, 1], [0, 1]],
    // T 形
    T: [[1, 1, 1], [0, 1, 0]],
    T2: [[0, 1, 0], [1, 1, 1]],
    // Z 形
    Z: [[1, 1, 0], [0, 1, 1]],
    Z2: [[0, 1, 1], [1, 1, 0]],
    // 3x1
    I3: [[1, 1, 1]],
    // 1x3
    I3V: [[1], [1], [1]],
    // L 形 4 格
    L4A: [[1, 1], [1, 0], [1, 0]],
    L4B: [[1, 0], [1, 0], [1, 1]],
    // T 形 4 格
    T4: [[1, 1, 1], [0, 1, 0]],
    // 步形
    STEP: [[1, 1, 1], [1, 0, 0]],
    STEP2: [[1, 1], [1, 0], [1, 0]],
  };

  // 方块颜色
  static COLORS = [
    '#FF6B6B', // 红
    '#FFA94D', // 橙
    '#FFD43B', // 黄
    '#69DB7C', // 绿
    '#4DABF7', // 蓝
    '#9775FA', // 紫
    '#F783AC', // 粉
  ];

  /**
   * 根据关卡生成题目
   * @param {number} level 关卡数
   * @returns {object} 题目数据
   */
  static generate(level) {
    // 关卡配置
    const blockCount = level < 4 ? 3 : 4; // 3 关后增加到 4 个方块
    const difficulty = level < 4 ? 1 : Math.min(3, Math.floor((level - 3) / 3) + 1);

    // 根据难度选择可用形状
    const availableShapes = this._getShapesByDifficulty(difficulty);

    // 随机选择方块
    const blocks = this._selectBlocks(availableShapes, blockCount);

    // 计算目标区域（方块拼接后的形状）
    const targetShape = this._mergeBlocks(blocks);

    return {
      level,
      blockCount,
      difficulty,
      blocks, // 不打乱，保持原始顺序
      targetShape, // 目标形状（用于验证）
    };
  }

  /**
   * 根据难度获取可用形状
   */
  static _getShapesByDifficulty(difficulty) {
    switch (difficulty) {
      case 1:
        // 简单：只用基础形状
        return ['I1', 'I2', 'I2V', 'I22', 'L', 'L2', 'L3', 'L4'];
      case 2:
        // 中等：加入 T、Z 形
        return ['I1', 'I2', 'I2V', 'I22', 'L', 'L2', 'L3', 'L4', 'T', 'T2', 'Z', 'Z2'];
      case 3:
      default:
        // 困难：所有形状
        return Object.keys(this.SHAPES);
    }
  }

  /**
   * 选择方块
   * 保证方块能拼成方正的区域
   */
  static _selectBlocks(availableShapes, count) {
    const blocks = [];
    const maxAttempts = 100;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      blocks.length = 0;

      // 随机选择方块
      for (let i = 0; i < count; i++) {
        const shapeKey = availableShapes[Math.floor(Math.random() * availableShapes.length)];
        const shape = this.SHAPES[shapeKey];
        const color = this.COLORS[i % this.COLORS.length];
        
        blocks.push({
          id: i,
          shapeKey,
          shape: this._deepCopy(shape),
          color,
          rotation: 0, // 当前旋转角度（0, 90, 180, 270）
        });
      }

      // 验证是否能拼成方正区域
      const merged = this._mergeBlocks(blocks);
      if (merged) {
        return blocks; // 不打乱，保持原始顺序
      }
    }

    // 如果多次尝试失败，使用预设组合
    return this._fallbackBlocks(count);
  }

  /**
   * 合并方块成目标形状
   * 使用回溯算法找到一种拼接方案
   */
  static _mergeBlocks(blocks) {
    const totalCells = blocks.reduce((sum, b) => 
      sum + b.shape.reduce((s, row) => s + row.reduce((r, cell) => r + cell, 0), 0), 0
    , 0);

    // 计算目标区域大小（尽量方正）
    const side = Math.ceil(Math.sqrt(totalCells));
    const width = Math.min(side, 6); // 限制最大宽度
    const height = Math.ceil(totalCells / width);

    // 创建目标区域
    const target = Array(height).fill(null).map(() => Array(width).fill(0));

    // 尝试放置方块
    const placements = []; // 记录每个方块的放置位置

    const canPlace = (blockIdx, x, y, shape) => {
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c] === 1) {
            const tx = x + c;
            const ty = y + r;
            if (tx < 0 || tx >= width || ty < 0 || ty >= height) return false;
            if (target[ty][tx] !== 0) return false;
          }
        }
      }
      return true;
    };

    const placeBlock = (blockIdx, x, y, shape) => {
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c] === 1) {
            target[y + r][x + c] = blocks[blockIdx].id + 1;
          }
        }
      }
    };

    const removeBlock = (blockIdx, x, y, shape) => {
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c] === 1) {
            target[y + r][x + c] = 0;
          }
        }
      }
    };

    const solve = (blockIdx = 0) => {
      if (blockIdx === blocks.length) return true;

      const block = blocks[blockIdx];

      // 尝试所有位置和旋转
      for (let rot = 0; rot < 4; rot++) {
        const rotated = this._rotateShape(block.shape, rot);
        for (let y = 0; y <= height - rotated.length; y++) {
          for (let x = 0; x <= width - rotated[0].length; x++) {
            if (canPlace(blockIdx, x, y, rotated)) {
              placeBlock(blockIdx, x, y, rotated);
              placements.push({ x, y, rotation: rot });
              if (solve(blockIdx + 1)) {
                return true;
              }
              removeBlock(blockIdx, x, y, rotated);
              placements.pop();
            }
          }
        }
      }
      return false;
    };

    if (solve()) {
      return {
        width,
        height,
        target,
        placements,
      };
    }
    return null;
  }

  /**
   * 旋转形状
   */
  static _rotateShape(shape, rotations) {
    let result = shape;
    for (let i = 0; i < rotations; i++) {
      result = this._rotate90(result);
    }
    return result;
  }

  /**
   * 90度旋转
   */
  static _rotate90(shape) {
    const newShape = [];
    for (let c = 0; c < shape[0].length; c++) {
      const newRow = [];
      for (let r = shape.length - 1; r >= 0; r--) {
        newRow.push(shape[r][c]);
      }
      newShape.push(newRow);
    }
    return newShape;
  }

  /**
   * 深拷贝
   */
  static _deepCopy(arr) {
    return arr.map(row => [...row]);
  }

  /**
   * 打乱数组
   */
  static _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * 预设方块组合（备用）
   */
  static _fallbackBlocks(count) {
    const presets = [
      // 3 个方块
      [
        { id: 0, shape: this._deepCopy(this.SHAPES.I22), color: this.COLORS[0] },
        { id: 1, shape: this._deepCopy(this.SHAPES.L), color: this.COLORS[1] },
        { id: 2, shape: this._deepCopy(this.SHAPES.I2), color: this.COLORS[2] },
      ],
      // 4 个方块
      [
        { id: 0, shape: this._deepCopy(this.SHAPES.I22), color: this.COLORS[0] },
        { id: 1, shape: this._deepCopy(this.SHAPES.I2), color: this.COLORS[1] },
        { id: 2, shape: this._deepCopy(this.SHAPES.L), color: this.COLORS[2] },
        { id: 3, shape: this._deepCopy(this.SHAPES.I2V), color: this.COLORS[3] },
      ],
    ];

    return this._shuffle([...presets[count - 3]]);
  }

  /**
   * 计算方块的边界
   */
  static getBounds(shape) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] === 1) {
          minX = Math.min(minX, c);
          minY = Math.min(minY, r);
          maxX = Math.max(maxX, c);
          maxY = Math.max(maxY, r);
        }
      }
    }
    
    return {
      width: maxX - minX + 1,
      height: maxY - minY + 1,
      minX, minY,
    };
  }
}

module.exports = PuzzleGenerator;
