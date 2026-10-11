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

#ifndef AVATAR_H
#define AVATAR_H

#include "sprite.h"
#include <stdbool.h>

#define MAX_AVATAR_ID 64

/**
 * Avatar - Player-controlled character.
 * Matches JS Avatar class.
 */
typedef struct Avatar {
    char id[MAX_AVATAR_ID];
    Sprite sprite;              // Visual representation
    float pos[3];               // World position
    int currentMap;             // Zone index (or map ID hash)
    char currentMapId[MAX_AVATAR_ID];
    int facing;                 // Direction (0-7)
    bool fixed;                 // Cannot move
    float speed;                // Tiles per second
    // Inventory (simple item IDs)
    char inventory[32][MAX_AVATAR_ID];
    int inventory_count;
} Avatar;

// Create avatar with ID
void avatar_init(Avatar* avatar, const char* id);

// Set position
void avatar_set_pos(Avatar* avatar, float x, float y, float z);

// Move by delta (respects fixed flag)
void avatar_move(Avatar* avatar, float dx, float dy);

// Add item to inventory (returns false if full)
bool avatar_give_item(Avatar* avatar, const char* item_id);

// Check if has item
bool avatar_has_item(const Avatar* avatar, const char* item_id);

#endif // AVATAR_H
