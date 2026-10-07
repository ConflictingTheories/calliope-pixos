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

#ifndef PORTAL_H
#define PORTAL_H

#include <stdbool.h>

#define MAX_PORTAL_ID 64
#define MAX_PORTALS_PER_ZONE 32

/**
 * Portal - Links two maps together.
 * Matches JS PortalManager and spec §9.
 */
typedef struct Portal {
    char id[MAX_PORTAL_ID];
    int x, y;                       // Tile position
    char targetMap[MAX_PORTAL_ID];  // Map ID to travel to
    char targetPortal[MAX_PORTAL_ID]; // Portal ID to arrive at (empty = defaultSpawn)
} Portal;

/**
 * PortalManager - Manages portals for a zone.
 */
typedef struct PortalManager {
    Portal portals[MAX_PORTALS_PER_ZONE];
    int count;
} PortalManager;

// Initialize portal manager
void portal_manager_init(PortalManager* pm);

// Add a portal (returns false if full or duplicate ID)
bool portal_manager_add(PortalManager* pm, const char* id, int x, int y,
                        const char* targetMap, const char* targetPortal);

// Find portal by ID (returns NULL if not found)
Portal* portal_manager_find(PortalManager* pm, const char* id);

// Find portal at tile position (returns NULL if none)
Portal* portal_manager_at(PortalManager* pm, int x, int y);

// Clear all portals
void portal_manager_clear(PortalManager* pm);

#endif // PORTAL_H
