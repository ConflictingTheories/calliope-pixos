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

#ifndef BEHAVIOR_H
#define BEHAVIOR_H

#include <stdbool.h>

#define MAX_BEHAVIOR_ID 64
#define MAX_BEHAVIORS_PER_OBJECT 8

// Built-in behavior types (matches JS BehaviorManager and spec §10)
typedef enum {
    BEHAVIOR_WANDER,
    BEHAVIOR_DIALOG,
    BEHAVIOR_CHEST,
    BEHAVIOR_TRIGGER,
    BEHAVIOR_DOOR,
    BEHAVIOR_CUSTOM  // Script-driven
} BehaviorType;

/**
 * Behavior - Declarative logic attached to a scene object.
 */
typedef struct Behavior {
    BehaviorType type;
    char id[MAX_BEHAVIOR_ID];
    // Params (union for different behavior types)
    union {
        struct { float radius; float speed; } wander;
        struct { char greeting[256]; } dialog;
        struct { bool locked; } chest;
        struct { bool once; float radius; } trigger;
        struct { char portalId[MAX_BEHAVIOR_ID]; } door;
    } params;
} Behavior;

/**
 * BehaviorSet - Collection of behaviors on one object.
 */
typedef struct BehaviorSet {
    Behavior behaviors[MAX_BEHAVIORS_PER_OBJECT];
    int count;
    // Script hooks (file paths, empty if none)
    char onInteract[256];
    char onEnter[256];
    char onExit[256];
    char onUpdate[256];
} BehaviorSet;

// Initialize empty behavior set
void behavior_set_init(BehaviorSet* bs);

// Add a behavior (returns false if full)
bool behavior_set_add(BehaviorSet* bs, BehaviorType type, const char* id);

// Find behavior by ID (returns NULL if not found)
Behavior* behavior_set_find(BehaviorSet* bs, const char* id);

// Check if object has any behaviors or hooks
bool behavior_set_has_any(const BehaviorSet* bs);

#endif // BEHAVIOR_H
