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

#include "mode_manager.h"
#include <string.h>

void mode_manager_init(ModeManager* mm) {
    memset(mm, 0, sizeof(ModeManager));
}

bool mode_manager_register(ModeManager* mm, const char* name,
                           ModeHandlers* handlers) {
    if (mm->count >= MAX_MODES) return false;

    // Check duplicate
    for (int i = 0; i < mm->count; i++) {
        if (strcmp(mm->modes[i].name, name) == 0) return false;
    }

    Mode* m = &mm->modes[mm->count++];
    strncpy(m->name, name, MAX_MODE_NAME - 1);
    m->handlers = *handlers;
    m->handlers.isLua = false;
    return true;
}

bool mode_manager_register_lua(ModeManager* mm, const char* name,
                               const char* setupScript,
                               const char* updateScript) {
    if (mm->count >= MAX_MODES) return false;

    for (int i = 0; i < mm->count; i++) {
        if (strcmp(mm->modes[i].name, name) == 0) return false;
    }

    Mode* m = &mm->modes[mm->count++];
    strncpy(m->name, name, MAX_MODE_NAME - 1);
    memset(&m->handlers, 0, sizeof(ModeHandlers));
    if (setupScript) strncpy(m->handlers.setupScript, setupScript, 255);
    if (updateScript) strncpy(m->handlers.updateScript, updateScript, 255);
    m->handlers.isLua = true;
    return true;
}

bool mode_manager_set(ModeManager* mm, struct World* world,
                      const char* name, void* params) {
    // Find mode
    Mode* next = NULL;
    for (int i = 0; i < mm->count; i++) {
        if (strcmp(mm->modes[i].name, name) == 0) {
            next = &mm->modes[i];
            break;
        }
    }
    if (!next) return false;

    // Teardown current
    if (mm->current && mm->current->handlers.teardown) {
        mm->current->handlers.teardown(world);
    }

    // Switch
    mm->current = next;
    mm->currentParams = params;

    // Setup new
    if (next->handlers.setup) {
        next->handlers.setup(world, params);
    }
    // TODO: If Lua, load and run setupScript

    return true;
}

void mode_manager_update(ModeManager* mm, struct World* world, float dt) {
    if (!mm->current) return;

    if (mm->current->handlers.update) {
        mm->current->handlers.update(world, dt, mm->currentParams);
    }
    // TODO: If Lua, call updateScript
}

bool mode_manager_handle_input(ModeManager* mm, struct World* world) {
    if (!mm->current) return false;

    if (mm->current->handlers.handleInput) {
        return mm->current->handlers.handleInput(world, mm->currentParams);
    }
    return false;
}

const char* mode_manager_current(const ModeManager* mm) {
    return mm->current ? mm->current->name : NULL;
}
