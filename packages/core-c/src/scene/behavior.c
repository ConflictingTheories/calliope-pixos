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

#include "behavior.h"
#include <string.h>

void behavior_set_init(BehaviorSet* bs) {
    bs->count = 0;
    bs->onInteract[0] = '\0';
    bs->onEnter[0] = '\0';
    bs->onExit[0] = '\0';
    bs->onUpdate[0] = '\0';
    memset(bs->behaviors, 0, sizeof(bs->behaviors));
}

bool behavior_set_add(BehaviorSet* bs, BehaviorType type, const char* id) {
    if (bs->count >= MAX_BEHAVIORS_PER_OBJECT) return false;

    // Check duplicate
    for (int i = 0; i < bs->count; i++) {
        if (strcmp(bs->behaviors[i].id, id) == 0) return false;
    }

    Behavior* b = &bs->behaviors[bs->count++];
    b->type = type;
    strncpy(b->id, id, MAX_BEHAVIOR_ID - 1);
    return true;
}

Behavior* behavior_set_find(BehaviorSet* bs, const char* id) {
    for (int i = 0; i < bs->count; i++) {
        if (strcmp(bs->behaviors[i].id, id) == 0) {
            return &bs->behaviors[i];
        }
    }
    return NULL;
}

bool behavior_set_has_any(const BehaviorSet* bs) {
    if (bs->count > 0) return true;
    if (bs->onInteract[0]) return true;
    if (bs->onEnter[0]) return true;
    if (bs->onExit[0]) return true;
    if (bs->onUpdate[0]) return true;
    return false;
}
