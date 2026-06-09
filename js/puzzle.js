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
    // 4x1
    I4: [[1, 1, 1, 1]],
    // 1x4
    I4V: [[1], [1], [1], [1]],
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

  // 固定的游戏区域大小
  static BOARD_SIZE = 10;

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
    let blocks = this._selectBlocks(availableShapes, blockCount);

    // 计算放置区域（在 10x10 区域内的规整形状）
    const result = this._generatePlacementArea(blocks, difficulty);

    if (!result) {
      // 如果生成失败，使用预设
      return this._generateFallback(level, blockCount);
    }

    // 打乱方块的顺序和旋转方向
    this._shuffleBlocks(blocks);

    return {
      level,
      blockCount,
      difficulty,
      blocks, // 打乱后的方块
      placementArea: result.placementArea, // 放置区域轮廓
      placements: result.placements, // 正确答案
      totalCells: result.totalCells,
    };
  }

  /**
   * 根据难度获取可用形状
   */
  static _getShapesByDifficulty(difficulty) {
    switch (difficulty) {
      case 1:
        // 简单：只用基础形状
        return ['I2', 'I2V', 'I22', 'L', 'L2', 'L3', 'L4', 'I3'];
      case 2:
        // 中等：加入 T、Z 形
        return ['I2', 'I2V', 'I22', 'L', 'L2', 'L3', 'L4', 'T', 'T2', 'Z', 'Z2', 'I3', 'I4'];
      case 3:
      default:
        // 困难：所有形状
        return Object.keys(this.SHAPES).filter(k => k !== 'I1');
    }
  }

  /**
   * 选择方块
   */
  static _selectBlocks(availableShapes, count) {
    const blocks = [];
    const usedShapes = new Set();

    for (let i = 0; i < count; i++) {
      // 随机选择一个未使用的形状
      let shapeKey;
      let attempts = 0;
      do {
        shapeKey = availableShapes[Math.floor(Math.random() * availableShapes.length)];
        attempts++;
      } while (usedShapes.has(shapeKey) && attempts < 5);
      
      if (usedShapes.has(shapeKey)) {
        shapeKey = availableShapes[Math.floor(Math.random() * availableShapes.length)];
      }
      
      usedShapes.add(shapeKey);
      
      const shape = this._deepCopy(this.SHAPES[shapeKey]);
      const color = this.COLORS[i % this.COLORS.length];
      
      blocks.push({
        id: i,
        shapeKey,
        shape,
        color,
        rotation: 0,
        originalShape: this._deepCopy(shape), // 保存原始形状
      });
    }

    return blocks;
  }

  /**
   * 生成放置区域
   * 在 10x10 的区域内生成一个规整的放置区域
   */
  static _generatePlacementArea(blocks, difficulty) {
    const boardSize = this.BOARD_SIZE;
    const totalCells = blocks.reduce((sum, b) => 
      sum + b.shape.reduce((s, row) => s + row.reduce((r, cell) => r + cell, 0), 0), 0
    , 0);

    // 根据难度决定放置区域的大小
    let areaWidth, areaHeight;
    if (difficulty === 1) {
      // 简单：2x3 或 3x2
      areaWidth = Math.min(3, Math.ceil(Math.sqrt(totalCells)));
      areaHeight = Math.ceil(totalCells / areaWidth);
    } else if (difficulty === 2) {
      // 中等：3x3 或 3x4
      areaWidth = Math.min(4, Math.ceil(Math.sqrt(totalCells)));
      areaHeight = Math.ceil(totalCells / areaWidth);
    } else {
      // 困难：4x4 或更大
      areaWidth = Math.min(5, Math.ceil(Math.sqrt(totalCells)));
      areaHeight = Math.ceil(totalCells / areaWidth);
    }

    // 确保不超过方块总数
    if (areaWidth * areaHeight > totalCells) {
      areaHeight = Math.ceil(totalCells / areaWidth);
    }

    // 在 10x10 区域内随机选择放置位置
    const maxX = Math.max(1, boardSize - areaWidth);
    const maxY = Math.max(1, boardSize - areaHeight);
    const startX = Math.floor(Math.random() * maxX);
    const startY = Math.floor(Math.random() * maxY);

    // 创建放置区域轮廓
    const placementArea = Array(boardSize).fill(null).map(() => Array(boardSize).fill(0));
    for (let r = 0; r < areaHeight; r++) {
      for (let c = 0; c < areaWidth; c++) {
        placementArea[startY + r][startX + c] = 1;
      }
    }

    // 计算放置方案
    const placements = [];
    const usedArea = Array(boardSize).fill(null).map(() => Array(boardSize).fill(0));
    
    for (const cell of placementArea.flat()) {
      if (cell === 1) break;
    }

    // 尝试放置方块
    const canPlace = (block, x, y, shape) => {
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c] === 1) {
            const tx = x + c;
            const ty = y + r;
            if (tx < 0 || tx >= boardSize || ty < 0 || ty >= boardSize) return false;
            if (usedArea[ty][tx] !== 0) return false;
            if (placementArea[ty][tx] !== 1) return false; // 必须在放置区域内
          }
        }
      }
      return true;
    };

    const placeBlock = (block, x, y, shape) => {
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c] === 1) {
            usedArea[y + r][x + c] = block.id + 1;
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
        for (let y = startY; y < startY + areaHeight; y++) {
          for (let x = startX; x < startX + areaWidth; x++) {
            if (canPlace(block, x, y, rotated)) {
              placeBlock(block, x, y, rotated);
              placements.push({ x, y, rotation: rot });
              if (solve(blockIdx + 1)) {
                return true;
              }
              // 回溯
              for (let r = 0; r < rotated.length; r++) {
                for (let c = 0; c < rotated[r].length; c++) {
                  if (rotated[r][c] === 1) {
                    usedArea[y + r][x + c] = 0;
                  }
                }
              }
              placements.pop();
            }
          }
        }
      }
      return false;
    };

    if (solve()) {
      return {
        placementArea,
        placements,
        totalCells: totalCells,
        areaWidth,
        areaHeight,
        startX,
        startY,
      };
    }
    return null;
  }

  /**
   * 打乱方块的顺序和旋转方向
   */
  static _shuffleBlocks(blocks) {
    // 打乱顺序
    for (let i = blocks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
    }

    // 随机旋转
    for (const block of blocks) {
      const randomRot = Math.floor(Math.random() * 4);
      block.shape = this._rotateShape(block.originalShape, randomRot);
      block.rotation = randomRot;
    }
  }

  /**
   * 预设题目（备用）
   */
  static _generateFallback(level, blockCount) {
    const presets = [
      // 3 个方块
      {
        blocks: [
          { id: 0, shapeKey: 'I22', shape: this._deepCopy(this.SHAPES.I22), color: this.COLORS[0], rotation: 0 },
          { id: 1, shapeKey: 'L', shape: this._deepCopy(this.SHAPES.L), color: this.COLORS[1], rotation: 0 },
          { id: 2, shapeKey: 'I2', shape: this._deepCopy(this.SHAPES.I2), color: this.COLORS[2], rotation: 0 },
        ],
        placementArea: [
          [1,1,1,1,0,0,0,0,0,0],
          [1,1,1,1,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
        ],
        placements: [{ x: 0, y: 0, rotation: 0 }, { x: 2, y: 0, rotation: 0 }, { x: 0, y: 1, rotation: 0 }],
        totalCells: 12,
      },
      // 4 个方块
      {
        blocks: [
          { id: 0, shapeKey: 'I22', shape: this._deepCopy(this.SHAPES.I22), color: this.COLORS[0], rotation: 0 },
          { id: 1, shapeKey: 'I2', shape: this._deepCopy(this.SHAPES.I2), color: this.COLORS[1], rotation: 0 },
          { id: 2, shapeKey: 'L', shape: this._deepCopy(this.SHAPES.L), color: this.COLORS[2], rotation: 0 },
          { id: 3, shapeKey: 'I2V', shape: this._deepCopy(this.SHAPES.I2V), color: this.COLORS[3], rotation: 0 },
        ],
        placementArea: [
          [1,1,1,1,0,0,0,0,0,0],
          [1,1,1,1,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
        ],
        placements: [{ x: 0, y: 0, rotation: 0 }, { x: 2, y: 0, rotation: 0 }, { x: 0, y: 1, rotation: 0 }, { x: 3, y: 1, rotation: 0 }],
        totalCells: 14,
      },
    ];

    const preset = presets[blockCount - 3];
    this._shuffleBlocks(preset.blocks);
    return {
      level,
      blockCount,
      difficulty: level < 4 ? 1 : 2,
      blocks: preset.blocks,
      placementArea: preset.placementArea,
      placements: preset.placements,
      totalCells: preset.totalCells,
    };
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
