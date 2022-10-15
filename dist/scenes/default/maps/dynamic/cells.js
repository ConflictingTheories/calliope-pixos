"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dynamicCells = dynamicCells;

// Map
function dynamicCells(cells, Tileset) {
  var result = [];
  cells.forEach(function (row, i) {
    var len = row.size;
    row.forEach(function (cell, j) {
      result[i * len + j] = Tileset[cell];
    });
  });
  return result;
}