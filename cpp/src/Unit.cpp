#include "Unit.h"

Unit::Unit(int id, const std::string& name, int col, int row, int hp, int mp, bool isAlly, const Vec3& color)
    : id(id), name(name), col(col), row(row), hp(hp), maxHp(hp), mp(mp), maxMp(mp), isAlly(isAlly), color(color) {
    displayPos = vec3(col * 1.0f, 0.0f, row * 1.0f);
}

void Unit::takeDamage(int dmg) {
    hp = std::max(0, hp - dmg);
    if (hp == 0) {
        color = vec3(0.5f, 0.5f, 0.5f); // Tint dead units gray
    }
}
