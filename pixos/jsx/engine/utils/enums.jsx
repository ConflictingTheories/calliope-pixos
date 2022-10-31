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

// Degrees to Radians
function degToRad(degrees) {
  return (degrees * Math.PI) / 180;
}

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

  // determine which camera facing applies
  adjustCameraDirection(vec) {
    console.log({vec, check: Math.abs(vec.z)});
    if (Math.abs(vec.z) < 1 && vec.z >= 0) {
      return 'N';
    } else if (Math.abs(vec.z) < 2 && vec.z >= 0) {
      return vec.z > 0 ? 'NW' : 'SE';
    } else if (Math.abs(vec.z) < 3 && vec.z >= 2) {
      return vec.z > 0 ? 'W' : 'E';
    } else if (Math.abs(vec.z) > 3 && vec.z < 4) {
      return vec.z > 0 ? 'SW' : 'NE';
    } else if (Math.round(vec.z) == 4) {
      return 'S';
    } else {
      return 'N';
    }
  },

  // sprite sequence facing
  spriteSequence(dir, camera = 'N') {
    switch (camera) {
      case 'N':
        switch (dir) {
          case Direction.Up:
            return 'N';
          case Direction.Right:
            return 'E';
          case Direction.Down:
            return 'S';
          case Direction.Left:
            return 'W';
        }
      case 'E':
        switch (dir) {
          case Direction.Up:
            return 'E';
          case Direction.Right:
            return 'S';
          case Direction.Down:
            return 'W';
          case Direction.Left:
            return 'N';
        }
      case 'S':
        switch (dir) {
          case Direction.Up:
            return 'S';
          case Direction.Right:
            return 'W';
          case Direction.Down:
            return 'N';
          case Direction.Left:
            return 'E';
        }
      case 'W':
        switch (dir) {
          case Direction.Up:
            return 'W';
          case Direction.Right:
            return 'N';
          case Direction.Down:
            return 'E';
          case Direction.Left:
            return 'S';
        }
      case 'NE':
        switch (dir) {
          case Direction.Up:
            return 'NE';
          case Direction.Right:
            return 'SE';
          case Direction.Down:
            return 'SW';
          case Direction.Left:
            return 'NW';
        }
      case 'SE':
        switch (dir) {
          case Direction.Up:
            return 'SE';
          case Direction.Right:
            return 'SW';
          case Direction.Down:
            return 'NW';
          case Direction.Left:
            return 'NE';
        }
      case 'SW':
        switch (dir) {
          case Direction.Up:
            return 'NE';
          case Direction.Right:
            return 'SE';
          case Direction.Down:
            return 'SW';
          case Direction.Left:
            return 'NW';
        }
      case 'NW':
        switch (dir) {
          case Direction.Up:
            return 'NW';
          case Direction.Right:
            return 'NE';
          case Direction.Down:
            return 'SE';
          case Direction.Left:
            return 'SW';
        }
    }

    return 'S';
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
