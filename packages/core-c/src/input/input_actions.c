/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine           **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

#include "input_actions.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

/* Default dead zone for analog inputs */
#define DEFAULT_DEAD_ZONE 0.15f

/* Helper to add a binding */
static void add_binding(InputActionManager* manager, GameAction action, 
                        InputBindingType type, int code) {
    ActionMapping* mapping = &manager->mappings[action];
    if (mapping->binding_count >= MAX_BINDINGS_PER_ACTION) {
        fprintf(stderr, "[Input] Max bindings reached for action %d\n", action);
        return;
    }
    
    InputBinding* binding = &mapping->bindings[mapping->binding_count++];
    binding->type = type;
    binding->code = code;
    binding->dead_zone = DEFAULT_DEAD_ZONE;
}

void input_action_init(InputActionManager* manager) {
    memset(manager, 0, sizeof(InputActionManager));
    
    manager->analog_dead_zone = DEFAULT_DEAD_ZONE;
    manager->invert_y_axis = false;
    
    /* Set up default keyboard bindings */
    
    /* Movement - WASD + Arrows */
    add_binding(manager, GAME_ACTION_MOVE_UP, BINDING_KEY, KEY_W);
    add_binding(manager, GAME_ACTION_MOVE_UP, BINDING_KEY, KEY_UP);
    add_binding(manager, GAME_ACTION_MOVE_DOWN, BINDING_KEY, KEY_S);
    add_binding(manager, GAME_ACTION_MOVE_DOWN, BINDING_KEY, KEY_DOWN);
    add_binding(manager, GAME_ACTION_MOVE_LEFT, BINDING_KEY, KEY_A);
    add_binding(manager, GAME_ACTION_MOVE_LEFT, BINDING_KEY, KEY_LEFT);
    add_binding(manager, GAME_ACTION_MOVE_RIGHT, BINDING_KEY, KEY_D);
    add_binding(manager, GAME_ACTION_MOVE_RIGHT, BINDING_KEY, KEY_RIGHT);
    
    /* Face buttons */
    add_binding(manager, GAME_ACTION_CONFIRM, BINDING_KEY, KEY_SPACE);
    add_binding(manager, GAME_ACTION_CONFIRM, BINDING_KEY, KEY_ENTER);
    add_binding(manager, GAME_ACTION_CANCEL, BINDING_KEY, KEY_ESCAPE);
    add_binding(manager, GAME_ACTION_MENU, BINDING_KEY, KEY_TAB);
    add_binding(manager, GAME_ACTION_MAP, BINDING_KEY, KEY_M);
    
    /* Shoulder buttons */
    add_binding(manager, GAME_ACTION_PREV, BINDING_KEY, KEY_Q);
    add_binding(manager, GAME_ACTION_NEXT, BINDING_KEY, KEY_E);
    add_binding(manager, GAME_ACTION_ZOOM_IN, BINDING_KEY, KEY_EQUAL);
    add_binding(manager, GAME_ACTION_ZOOM_OUT, BINDING_KEY, KEY_MINUS);
    
    /* Debug */
    add_binding(manager, GAME_ACTION_DEBUG_TOGGLE, BINDING_KEY, KEY_F1);
    add_binding(manager, GAME_ACTION_FULLSCREEN, BINDING_KEY, KEY_F11);
    
#ifdef PLATFORM_ARM_LINUX
    /* Add gamepad bindings for RG353V */
    
    /* D-pad movement */
    add_binding(manager, GAME_ACTION_MOVE_UP, BINDING_KEY, RG353V_DPAD_UP);
    add_binding(manager, GAME_ACTION_MOVE_DOWN, BINDING_KEY, RG353V_DPAD_DOWN);
    add_binding(manager, GAME_ACTION_MOVE_LEFT, BINDING_KEY, RG353V_DPAD_LEFT);
    add_binding(manager, GAME_ACTION_MOVE_RIGHT, BINDING_KEY, RG353V_DPAD_RIGHT);
    
    /* Left stick movement */
    add_binding(manager, GAME_ACTION_MOVE_RIGHT, BINDING_AXIS_POSITIVE, RG353V_AXIS_LEFT_X);
    add_binding(manager, GAME_ACTION_MOVE_LEFT, BINDING_AXIS_NEGATIVE, RG353V_AXIS_LEFT_X);
    add_binding(manager, GAME_ACTION_MOVE_DOWN, BINDING_AXIS_POSITIVE, RG353V_AXIS_LEFT_Y);
    add_binding(manager, GAME_ACTION_MOVE_UP, BINDING_AXIS_NEGATIVE, RG353V_AXIS_LEFT_Y);
    
    /* Face buttons */
    add_binding(manager, GAME_ACTION_CONFIRM, BINDING_BUTTON, RG353V_A);
    add_binding(manager, GAME_ACTION_CANCEL, BINDING_BUTTON, RG353V_B);
    add_binding(manager, GAME_ACTION_MENU, BINDING_BUTTON, RG353V_START);
    add_binding(manager, GAME_ACTION_MAP, BINDING_BUTTON, RG353V_SELECT);
    
    /* Shoulder buttons */
    add_binding(manager, GAME_ACTION_PREV, BINDING_BUTTON, RG353V_L1);
    add_binding(manager, GAME_ACTION_NEXT, BINDING_BUTTON, RG353V_R1);
    add_binding(manager, GAME_ACTION_ZOOM_OUT, BINDING_BUTTON, RG353V_L2);
    add_binding(manager, GAME_ACTION_ZOOM_IN, BINDING_BUTTON, RG353V_R2);
    
    /* Right stick for camera */
    /* These are handled specially in input_action_get_camera */
    
#else
    /* Add gamepad bindings for desktop (GLFW gamepad codes) */
    add_binding(manager, GAME_ACTION_MOVE_UP, BINDING_BUTTON, GAMEPAD_DPAD_UP);
    add_binding(manager, GAME_ACTION_MOVE_DOWN, BINDING_BUTTON, GAMEPAD_DPAD_DOWN);
    add_binding(manager, GAME_ACTION_MOVE_LEFT, BINDING_BUTTON, GAMEPAD_DPAD_LEFT);
    add_binding(manager, GAME_ACTION_MOVE_RIGHT, BINDING_BUTTON, GAMEPAD_DPAD_RIGHT);
    
    add_binding(manager, GAME_ACTION_CONFIRM, BINDING_BUTTON, GAMEPAD_A);
    add_binding(manager, GAME_ACTION_CANCEL, BINDING_BUTTON, GAMEPAD_B);
    add_binding(manager, GAME_ACTION_MENU, BINDING_BUTTON, GAMEPAD_START);
    add_binding(manager, GAME_ACTION_MAP, BINDING_BUTTON, GAMEPAD_SELECT);
    
    add_binding(manager, GAME_ACTION_PREV, BINDING_BUTTON, GAMEPAD_L1);
    add_binding(manager, GAME_ACTION_NEXT, BINDING_BUTTON, GAMEPAD_R1);
#endif
    
    printf("[Input] Action manager initialized with default bindings\n");
}

void input_action_update(InputActionManager* manager) {
    /* Save previous state for edge detection */
    memcpy(manager->prev_actions, manager->actions, sizeof(manager->actions));
    
    /* Update just_pressed and just_released flags */
    for (int i = 0; i < GAME_ACTION_COUNT; i++) {
        ActionState* curr = &manager->actions[i];
        ActionState* prev = &manager->prev_actions[i];
        
        curr->just_pressed = curr->pressed && !prev->pressed;
        curr->just_released = !curr->pressed && prev->pressed;
    }
}

void input_action_process_event(InputActionManager* manager, PlatformInputEvent* event) {
    if (!manager || !event) return;
    
    /* Handle axis events for analog sticks */
    if (event->type == PLATFORM_INPUT_AXIS) {
        float normalized = event->value;
        
        /* Normalize axis value to -1..1 range if needed */
        /* Most axes are 0-255 or -32768 to 32767 */
        if (event->value > 1.0f || event->value < -1.0f) {
            if (event->value > 255) {
                /* Signed 16-bit */
                normalized = event->value / 32767.0f;
            } else {
                /* Unsigned 8-bit centered at 128 */
                normalized = (event->value - 128.0f) / 127.0f;
            }
        }
        
        /* Apply dead zone */
        if (fabsf(normalized) < manager->analog_dead_zone) {
            normalized = 0.0f;
        }
        
        /* Store raw axis values */
#ifdef PLATFORM_ARM_LINUX
        if (event->code == RG353V_AXIS_LEFT_X) manager->axis_left_x = normalized;
        else if (event->code == RG353V_AXIS_LEFT_Y) manager->axis_left_y = normalized;
        else if (event->code == RG353V_AXIS_RIGHT_X) manager->axis_right_x = normalized;
        else if (event->code == RG353V_AXIS_RIGHT_Y) manager->axis_right_y = normalized;
#else
        if (event->code == GAMEPAD_AXIS_LEFT_X) manager->axis_left_x = normalized;
        else if (event->code == GAMEPAD_AXIS_LEFT_Y) manager->axis_left_y = normalized;
        else if (event->code == GAMEPAD_AXIS_RIGHT_X) manager->axis_right_x = normalized;
        else if (event->code == GAMEPAD_AXIS_RIGHT_Y) manager->axis_right_y = normalized;
#endif
    }
    
    /* Find matching bindings for this event */
    for (int a = 0; a < GAME_ACTION_COUNT; a++) {
        ActionMapping* mapping = &manager->mappings[a];
        
        for (int b = 0; b < mapping->binding_count; b++) {
            InputBinding* binding = &mapping->bindings[b];
            bool match = false;
            float value = 0.0f;
            
            switch (binding->type) {
                case BINDING_KEY:
                    if (event->type == PLATFORM_INPUT_KEY && event->code == binding->code) {
                        match = true;
                        value = (event->state == PLATFORM_INPUT_PRESSED) ? 1.0f : 0.0f;
                    }
                    break;
                    
                case BINDING_BUTTON:
                    if (event->type == PLATFORM_INPUT_BUTTON && event->code == binding->code) {
                        match = true;
                        value = (event->state == PLATFORM_INPUT_PRESSED) ? 1.0f : 0.0f;
                    }
                    break;
                    
                case BINDING_AXIS_POSITIVE:
                    if (event->type == PLATFORM_INPUT_AXIS && event->code == binding->code) {
                        float normalized = event->value;
                        if (event->value > 1.0f) {
                            normalized = event->value / 32767.0f;
                        }
                        if (normalized > binding->dead_zone) {
                            match = true;
                            value = normalized;
                        } else if (normalized <= 0) {
                            match = true;
                            value = 0.0f;
                        }
                    }
                    break;
                    
                case BINDING_AXIS_NEGATIVE:
                    if (event->type == PLATFORM_INPUT_AXIS && event->code == binding->code) {
                        float normalized = event->value;
                        if (event->value > 1.0f || event->value < -1.0f) {
                            normalized = event->value / 32767.0f;
                        }
                        if (normalized < -binding->dead_zone) {
                            match = true;
                            value = -normalized;
                        } else if (normalized >= 0) {
                            match = true;
                            value = 0.0f;
                        }
                    }
                    break;
            }
            
            if (match) {
                manager->actions[a].pressed = (value > 0.5f);
                manager->actions[a].value = fmaxf(manager->actions[a].value, value);
            }
        }
    }
}

bool input_action_pressed(InputActionManager* manager, GameAction action) {
    if (!manager || action >= GAME_ACTION_COUNT) return false;
    return manager->actions[action].pressed;
}

bool input_action_just_pressed(InputActionManager* manager, GameAction action) {
    if (!manager || action >= GAME_ACTION_COUNT) return false;
    return manager->actions[action].just_pressed;
}

bool input_action_just_released(InputActionManager* manager, GameAction action) {
    if (!manager || action >= GAME_ACTION_COUNT) return false;
    return manager->actions[action].just_released;
}

float input_action_value(InputActionManager* manager, GameAction action) {
    if (!manager || action >= GAME_ACTION_COUNT) return 0.0f;
    return manager->actions[action].value;
}

void input_action_get_movement(InputActionManager* manager, float* x, float* y) {
    if (!manager || !x || !y) return;
    
    *x = 0.0f;
    *y = 0.0f;
    
    /* Digital movement from d-pad/keyboard */
    if (manager->actions[GAME_ACTION_MOVE_RIGHT].pressed) *x += 1.0f;
    if (manager->actions[GAME_ACTION_MOVE_LEFT].pressed) *x -= 1.0f;
    if (manager->actions[GAME_ACTION_MOVE_DOWN].pressed) *y += 1.0f;
    if (manager->actions[GAME_ACTION_MOVE_UP].pressed) *y -= 1.0f;
    
    /* Add analog stick movement */
    *x += manager->axis_left_x;
    *y += manager->axis_left_y;
    
    /* Clamp to unit circle */
    float mag = sqrtf(*x * *x + *y * *y);
    if (mag > 1.0f) {
        *x /= mag;
        *y /= mag;
    }
}

void input_action_get_camera(InputActionManager* manager, float* x, float* y) {
    if (!manager || !x || !y) return;
    
    *x = manager->axis_right_x;
    *y = manager->axis_right_y;
    
    if (manager->invert_y_axis) {
        *y = -*y;
    }
}

void input_action_bind(InputActionManager* manager, GameAction action,
                       InputBindingType type, int code) {
    if (!manager || action >= GAME_ACTION_COUNT) return;
    add_binding(manager, action, type, code);
}

void input_action_clear_bindings(InputActionManager* manager, GameAction action) {
    if (!manager || action >= GAME_ACTION_COUNT) return;
    manager->mappings[action].binding_count = 0;
}

void input_action_load_config(InputActionManager* manager, const char* filepath) {
    (void)manager;
    (void)filepath;
    /* TODO: Implement JSON config loading */
    printf("[Input] Config loading not yet implemented: %s\n", filepath);
}

void input_action_save_config(InputActionManager* manager, const char* filepath) {
    (void)manager;
    (void)filepath;
    /* TODO: Implement JSON config saving */
    printf("[Input] Config saving not yet implemented: %s\n", filepath);
}
