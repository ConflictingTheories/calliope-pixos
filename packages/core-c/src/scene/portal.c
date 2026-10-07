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

#include "portal.h"
#include <string.h>

void portal_manager_init(PortalManager* pm) {
    pm->count = 0;
    memset(pm->portals, 0, sizeof(pm->portals));
}

bool portal_manager_add(PortalManager* pm, const char* id, int x, int y,
                        const char* targetMap, const char* targetPortal) {
    if (pm->count >= MAX_PORTALS_PER_ZONE) return false;

    // Check for duplicate ID
    for (int i = 0; i < pm->count; i++) {
        if (strcmp(pm->portals[i].id, id) == 0) {
            return false; // Duplicate
        }
    }

    Portal* p = &pm->portals[pm->count++];
    strncpy(p->id, id, MAX_PORTAL_ID - 1);
    p->x = x;
    p->y = y;
    strncpy(p->targetMap, targetMap, MAX_PORTAL_ID - 1);
    if (targetPortal) {
        strncpy(p->targetPortal, targetPortal, MAX_PORTAL_ID - 1);
    } else {
        p->targetPortal[0] = '\0';
    }
    return true;
}

Portal* portal_manager_find(PortalManager* pm, const char* id) {
    for (int i = 0; i < pm->count; i++) {
        if (strcmp(pm->portals[i].id, id) == 0) {
            return &pm->portals[i];
        }
    }
    return NULL;
}

Portal* portal_manager_at(PortalManager* pm, int x, int y) {
    for (int i = 0; i < pm->count; i++) {
        if (pm->portals[i].x == x && pm->portals[i].y == y) {
            return &pm->portals[i];
        }
    }
    return NULL;
}

void portal_manager_clear(PortalManager* pm) {
    pm->count = 0;
}
