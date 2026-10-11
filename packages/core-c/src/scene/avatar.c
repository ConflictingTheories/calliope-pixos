/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine           **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
** PixoSpritz Dual License - see LICENSE.          **
** Free for education, non-commercial use, and     **
** individual non-profit artists (CC-BY-NC-SA-4.0) **
** Commercial use requires a purchased license.    **
** ----------------------------------------------- **
\*                                                 */

#include "avatar.h"
#include <string.h>

void avatar_init(Avatar* avatar, const char* id) {
    memset(avatar, 0, sizeof(Avatar));
    strncpy(avatar->id, id, MAX_AVATAR_ID - 1);
    avatar->speed = 4.0f;  // 4 tiles per second
    avatar->facing = 4;     // South (down)
}

void avatar_set_pos(Avatar* avatar, float x, float y, float z) {
    avatar->pos[0] = x;
    avatar->pos[1] = y;
    avatar->pos[2] = z;
}

void avatar_move(Avatar* avatar, float dx, float dy) {
    if (avatar->fixed) return;
    avatar->pos[0] += dx;
    avatar->pos[1] += dy;
    // Update facing based on movement
    if (dx > 0.1f) avatar->facing = 2;       // East
    else if (dx < -0.1f) avatar->facing = 6;  // West
    else if (dy > 0.1f) avatar->facing = 4;   // South
    else if (dy < -0.1f) avatar->facing = 0;  // North
}

bool avatar_give_item(Avatar* avatar, const char* item_id) {
    if (avatar->inventory_count >= 32) return false;
    strncpy(avatar->inventory[avatar->inventory_count++],
            item_id, MAX_AVATAR_ID - 1);
    return true;
}

bool avatar_has_item(const Avatar* avatar, const char* item_id) {
    for (int i = 0; i < avatar->inventory_count; i++) {
        if (strcmp(avatar->inventory[i], item_id) == 0) return true;
    }
    return false;
}
