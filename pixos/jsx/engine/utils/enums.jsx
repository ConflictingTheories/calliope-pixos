/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2022 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

// Mouse event enumeration
export const Mouse = {
  DOWN: 1,
  UP: 2,
  MOVE: 3,
};

// Directions enumeration & methods
export const Direction = {
  None: 0, //0000
  Right: 1, //0001
  Up: 2, //0010
  Left: 4, //0100
  Down: 8, //1000
  All: 15, //1111

  fromOffset(dp) {
    if (dp[0] > 0) return Direction.Right;
    if (dp[0] < 0) return Direction.Left;
    if (dp[1] > 0) return Direction.Down;
    if (dp[1] < 0) return Direction.Up;
    return 0;
  },

  toOffset(dir) {
    switch (dir) {
      case Direction.Right:
        return [1, 0];
      case Direction.Up:
        return [0, -1];
      case Direction.Left:
        return [-1, 0];
      case Direction.Down:
        return [0, 1];
    }
    return [0, 0];
  },

  reverse(dir) {
    switch (dir) {
      case Direction.Right:
        return Direction.Left;
      case Direction.Up:
        return Direction.Down;
      case Direction.Left:
        return Direction.Right;
      case Direction.Down:
        return Direction.Up;
    }
    return Direction.None;
  },

  rotate(dir, ccw = false) {
    switch (dir) {
      case Direction.Right:
        return ccw ? Direction.Top : Direction.Down;
      case Direction.Up:
        return ccw ? Direction.Left : Direction.Right;
      case Direction.Left:
        return ccw ? Direction.Down : Direction.Top;
      case Direction.Down:
        return ccw ? Direction.Right : Direction.Left;
    }
    return Direction.None;
  },
  // sprite sequence facing
  spriteSequence(dir) {
    switch (dir) {
      case Direction.Right:
        return "right";
      case Direction.Up:
        return "up";
      case Direction.Left:
        return "left";
      case Direction.Down:
        return "down";
    }
    return "down";
  },
  // object sequence rotation (TODO)
  objectSequence(dir) {
    switch (dir) {
      case Direction.Right:
        return [0, 90, 0];
      case Direction.Up:
        return [0, 0, 0];
      case Direction.Left:
        return [0, -90, 0];
      case Direction.Down:
        return [0, 180, 0];
    }
    return [0, 0, 0];
  },
};
