// Map
export function dynamicCells(cells, Tileset) {
  // handle cells generator
  if (typeof cells === 'string') {
    return cells;
  }
  let result = [];
  cells.forEach((row, i) => {
    let len = row.length;
    row.forEach((cell, j) => {
      result[i * len + j] = Tileset[cell];
    });
  });
  return result;
}
