#pragma once

struct Grid {
    int cols = 12;
    int rows = 8;
    float tileSize = 1.0f;

    bool isValidTile(int col, int row) const {
        return col >= 0 && col < cols && row >= 0 && row < rows;
    }
};
