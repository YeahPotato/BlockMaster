/**
 * 形状工具
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

function rotateN(shape, n) {
  let result = shape;
  const times = ((n % 4) + 4) % 4;
  for (let i = 0; i < times; i++) result = rotate90(result);
  return result;
}

function shapeCells(shape) {
  const cells = [];
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      if (shape[i][j] === 1) cells.push([i, j]);
    }
  }
  return cells;
}

function shapeSize(shape) {
  return shapeCells(shape).length;
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

module.exports = { rotate90, rotateN, shapeCells, shapeSize, shapeEquals };
