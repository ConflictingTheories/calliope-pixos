#pragma once

#include <glm/glm.hpp>

enum class Direction {
    None = 0,
    Up = 1,
    Down = 2,
    Left = 3,
    Right = 4
};

namespace DirectionUtils {
    inline glm::vec3 toOffset(Direction dir) {
        switch (dir) {
            case Direction::Up: return glm::vec3(0, 1, 0);
            case Direction::Down: return glm::vec3(0, -1, 0);
            case Direction::Left: return glm::vec3(-1, 0, 0);
            case Direction::Right: return glm::vec3(1, 0, 0);
            default: return glm::vec3(0, 0, 0);
        }
    }

    inline Direction reverse(Direction dir) {
        switch (dir) {
            case Direction::Up: return Direction::Down;
            case Direction::Down: return Direction::Up;
            case Direction::Left: return Direction::Right;
            case Direction::Right: return Direction::Left;
            default: return Direction::None;
        }
    }
}
