// Map
export function dynamicCells(cells, Tileset) {
  let result = [];
  cells.forEach((row, i) => {
    let len = row.size;
    row.forEach((cell, j) => {
      result[i * len + j] = Tileset[cell];
    });
  });
  return result;
}
