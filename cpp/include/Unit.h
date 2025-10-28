#pragma once
#include "MathUtils.h"
#include <string>

struct Unit
{
    int id;
    std::string name;
    int col, row;
    int hp, maxHp;
    int mp, maxMp;
    bool isAlly;
    Vec3 color;

    Unit(int id, const std::string &name, int col, int row, int hp, int mp, bool isAlly, const Vec3 &color);
    void takeDamage(int dmg);
    bool isDead() const { return hp <= 0; }
};
