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

#ifndef MODE_MANAGER_H
#define MODE_MANAGER_H

#include <stdbool.h>

#define MAX_MODE_NAME 64
#define MAX_MODES 16

// Forward declarations
struct World;
struct LuaState;

/**
 * Mode handlers (function pointers, or Lua refs).
 */
typedef struct ModeHandlers {
    // C function handlers (NULL if using Lua)
    void (*setup)(struct World* world, void* params);
    void (*teardown)(struct World* world);
    void (*update)(struct World* world, float dt, void* params);
    bool (*handleInput)(struct World* world, void* params);

    // Lua script paths (empty if using C handlers)
    char setupScript[256];
    char updateScript[256];

    bool isLua;
} ModeHandlers;

/**
 * Registered mode.
 */
typedef struct Mode {
    char name[MAX_MODE_NAME];
    ModeHandlers handlers;
} Mode;

/**
 * ModeManager - Switches between game modes (explore, battle, etc.)
 * Matches JS ModeManager.
 */
typedef struct ModeManager {
    Mode modes[MAX_MODES];
    int count;
    Mode* current;
    void* currentParams;
} ModeManager;

// Initialize
void mode_manager_init(ModeManager* mm);

// Register a mode with C handlers
bool mode_manager_register(ModeManager* mm, const char* name,
                           ModeHandlers* handlers);

// Register a mode with Lua scripts
bool mode_manager_register_lua(ModeManager* mm, const char* name,
                               const char* setupScript,
                               const char* updateScript);

// Switch to a mode (calls teardown on old, setup on new)
bool mode_manager_set(ModeManager* mm, struct World* world,
                      const char* name, void* params);

// Update current mode
void mode_manager_update(ModeManager* mm, struct World* world, float dt);

// Handle input (returns true if consumed)
bool mode_manager_handle_input(ModeManager* mm, struct World* world);

// Get current mode name (NULL if none)
const char* mode_manager_current(const ModeManager* mm);

#endif // MODE_MANAGER_H
