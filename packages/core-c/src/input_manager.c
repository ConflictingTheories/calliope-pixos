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

#include "engine.h"
#include "input_manager.h"
#include "platform/platform.h"
#ifdef USE_GLFW
#include <GLFW/glfw3.h>
#endif
#ifdef PLATFORM_ARM_LINUX
#include "input/input_actions.h"
#include <linux/input.h>
#endif
#include <stdio.h>
#include <string.h>

// Action names for debugging
static const char* ACTION_NAMES[ACTION_COUNT] = {
    "none",
    "move_up", "move_down", "move_left", "move_right",
    "interact", "select",
    "camera_pan_left", "camera_pan_right", "camera_pan_up", "camera_pan_down",
    "camera_zoom_in", "camera_zoom_out",
    "camera_rotate_left", "camera_rotate_right",
    "menu", "run",
    "bind_camera", "fixed_camera",
    "help", "chat", "escape",
    "height_up", "height_down",
    "debug_toggle"
};

// Scroll callback accumulator (static for GLFW callback)
static double scroll_accumulator_x = 0.0;
static double scroll_accumulator_y = 0.0;

#ifdef PLATFORM_ARM_LINUX
// ARM input action manager (shared with platform layer)
static InputActionManager arm_action_manager;
static bool arm_action_manager_initialized = false;

// Soft reset combo state (Start + Select held for 2 seconds)
static bool soft_reset_start_held = false;
static bool soft_reset_select_held = false;
static double soft_reset_combo_start_time = 0.0;
#define SOFT_RESET_HOLD_TIME 2.0

// ARM platform input callback - processes evdev events
static void arm_input_callback(PlatformInputEvent* event, void* user_data) {
    (void)user_data;
    if (!arm_action_manager_initialized) return;
    input_action_process_event(&arm_action_manager, event);
}
#endif

#ifdef USE_GLFW
// GLFW scroll callback
static void scroll_callback(GLFWwindow* window, double xoffset, double yoffset) {
    (void)window;
    scroll_accumulator_x += xoffset;
    scroll_accumulator_y += yoffset;
}
#endif

void input_manager_setup_default_bindings(InputManager* input_manager) {
    // Clear existing bindings
    input_manager->binding_count = 0;
    
#ifdef USE_GLFW
    // Movement
    input_manager_bind_key(input_manager, GLFW_KEY_W, ACTION_MOVE_UP);
    input_manager_bind_key(input_manager, GLFW_KEY_S, ACTION_MOVE_DOWN);
    input_manager_bind_key(input_manager, GLFW_KEY_A, ACTION_MOVE_LEFT);
    input_manager_bind_key(input_manager, GLFW_KEY_D, ACTION_MOVE_RIGHT);
    
    // Arrow keys for camera
    input_manager_bind_key(input_manager, GLFW_KEY_LEFT, ACTION_CAMERA_PAN_LEFT);
    input_manager_bind_key(input_manager, GLFW_KEY_RIGHT, ACTION_CAMERA_PAN_RIGHT);
    input_manager_bind_key(input_manager, GLFW_KEY_UP, ACTION_CAMERA_PAN_UP);
    input_manager_bind_key(input_manager, GLFW_KEY_DOWN, ACTION_CAMERA_PAN_DOWN);
    
    // Camera zoom and rotation
    input_manager_bind_key(input_manager, GLFW_KEY_Q, ACTION_CAMERA_ZOOM_IN);
    input_manager_bind_key(input_manager, GLFW_KEY_E, ACTION_CAMERA_ZOOM_OUT);
    input_manager_bind_key(input_manager, GLFW_KEY_Z, ACTION_CAMERA_ROTATE_LEFT);
    input_manager_bind_key(input_manager, GLFW_KEY_X, ACTION_CAMERA_ROTATE_RIGHT);
    
    // Actions
    input_manager_bind_key(input_manager, GLFW_KEY_K, ACTION_INTERACT);
    input_manager_bind_key(input_manager, GLFW_KEY_M, ACTION_MENU);
    input_manager_bind_key(input_manager, GLFW_KEY_R, ACTION_RUN);
    input_manager_bind_key(input_manager, GLFW_KEY_B, ACTION_BIND_CAMERA);
    input_manager_bind_key(input_manager, GLFW_KEY_C, ACTION_FIXED_CAMERA);
    input_manager_bind_key(input_manager, GLFW_KEY_H, ACTION_HELP);
    input_manager_bind_key(input_manager, GLFW_KEY_SPACE, ACTION_CHAT);
    input_manager_bind_key(input_manager, GLFW_KEY_ESCAPE, ACTION_ESCAPE);
    
    // Height adjustment
    input_manager_bind_key(input_manager, GLFW_KEY_Y, ACTION_HEIGHT_UP);
    input_manager_bind_key(input_manager, GLFW_KEY_F, ACTION_HEIGHT_DOWN);
    
    // Debug
    input_manager_bind_key(input_manager, GLFW_KEY_F3, ACTION_DEBUG_TOGGLE);
#endif
}

void input_manager_bind_key(InputManager* input_manager, int key, ActionType action) {
    if (!input_manager || input_manager->binding_count >= MAX_ACTIONS) return;
    
    KeyBinding* binding = &input_manager->bindings[input_manager->binding_count++];
    binding->key = key;
    binding->action = action;
}

void init_input_manager(InputManager* input_manager, struct GLEngine* engine) {
    memset(input_manager, 0, sizeof(InputManager));
    input_manager->engine = engine;
    strcpy(input_manager->current_mode, "default");
    
    // Setup default key bindings
    input_manager_setup_default_bindings(input_manager);
    
#ifdef USE_GLFW
    // Set up GLFW callbacks
    GLFWwindow* window = (GLFWwindow*)platform_get_glfw_window(engine->platform);
    glfwSetScrollCallback(window, scroll_callback);
    
    // Get initial mouse position
    glfwGetCursorPos(window, &input_manager->mouse_x, &input_manager->mouse_y);
#else
    input_manager->mouse_x = 0;
    input_manager->mouse_y = 0;
    
#ifdef PLATFORM_ARM_LINUX
    // Initialize InputActionManager and register callback for ARM
    if (!arm_action_manager_initialized) {
        input_action_init(&arm_action_manager);
        arm_action_manager_initialized = true;
    }
    platform_set_input_callback(engine->platform, arm_input_callback, input_manager);
    printf("ARM evdev input callback registered\\n");
#endif
#endif
    input_manager->prev_mouse_x = input_manager->mouse_x;
    input_manager->prev_mouse_y = input_manager->mouse_y;
    
    printf("InputManager initialized with %d key bindings\n", input_manager->binding_count);
}

void update_input_manager(InputManager* input_manager) {
    if (!input_manager || !input_manager->engine) return;
    
#ifdef USE_GLFW
    GLFWwindow* window = (GLFWwindow*)platform_get_glfw_window(input_manager->engine->platform);
#endif
    
    // Store previous states
    memcpy(input_manager->prev_action_states, input_manager->action_states, sizeof(input_manager->action_states));
    memcpy(input_manager->prev_mouse_buttons, input_manager->mouse_buttons, sizeof(input_manager->mouse_buttons));
    
    // Reset frame-specific states
    memset(input_manager->action_pressed, 0, sizeof(input_manager->action_pressed));
    memset(input_manager->action_released, 0, sizeof(input_manager->action_released));
    
#ifdef USE_GLFW
    // Update modifier keys
    input_manager->shift_held = glfwGetKey(window, GLFW_KEY_LEFT_SHIFT) == GLFW_PRESS ||
                                 glfwGetKey(window, GLFW_KEY_RIGHT_SHIFT) == GLFW_PRESS;
    input_manager->ctrl_held = glfwGetKey(window, GLFW_KEY_LEFT_CONTROL) == GLFW_PRESS ||
                                glfwGetKey(window, GLFW_KEY_RIGHT_CONTROL) == GLFW_PRESS;
    input_manager->alt_held = glfwGetKey(window, GLFW_KEY_LEFT_ALT) == GLFW_PRESS ||
                               glfwGetKey(window, GLFW_KEY_RIGHT_ALT) == GLFW_PRESS;
    
    // Clear action states before updating
    memset(input_manager->action_states, 0, sizeof(input_manager->action_states));
    
    // Update action states based on key bindings
    for (int i = 0; i < input_manager->binding_count; i++) {
        KeyBinding* binding = &input_manager->bindings[i];
        if (glfwGetKey(window, binding->key) == GLFW_PRESS) {
            input_manager->action_states[binding->action] = true;
        }
    }
#else
    // ARM: Poll evdev input via platform layer and InputActionManager
#ifdef PLATFORM_ARM_LINUX
    // Initialize action manager on first use
    if (!arm_action_manager_initialized) {
        input_action_init(&arm_action_manager);
        arm_action_manager_initialized = true;
    }
    
    // Platform poll_events will invoke our callback which updates arm_action_manager
    platform_poll_events(input_manager->engine->platform);
    
    // Update action manager for edge detection
    input_action_update(&arm_action_manager);
    
    // Map InputActionManager states to InputManager action states
    input_manager->action_states[ACTION_MOVE_UP] = input_action_pressed(&arm_action_manager, ACTION_MOVE_UP);
    input_manager->action_states[ACTION_MOVE_DOWN] = input_action_pressed(&arm_action_manager, ACTION_MOVE_DOWN);
    input_manager->action_states[ACTION_MOVE_LEFT] = input_action_pressed(&arm_action_manager, ACTION_MOVE_LEFT);
    input_manager->action_states[ACTION_MOVE_RIGHT] = input_action_pressed(&arm_action_manager, ACTION_MOVE_RIGHT);
    input_manager->action_states[ACTION_INTERACT] = input_action_pressed(&arm_action_manager, ACTION_CONFIRM);
    input_manager->action_states[ACTION_MENU] = input_action_pressed(&arm_action_manager, ACTION_MENU);
    input_manager->action_states[ACTION_ESCAPE] = input_action_pressed(&arm_action_manager, ACTION_CANCEL);
    input_manager->action_states[ACTION_CAMERA_ZOOM_IN] = input_action_pressed(&arm_action_manager, ACTION_ZOOM_IN);
    input_manager->action_states[ACTION_CAMERA_ZOOM_OUT] = input_action_pressed(&arm_action_manager, ACTION_ZOOM_OUT);
    input_manager->action_states[ACTION_DEBUG_TOGGLE] = input_action_pressed(&arm_action_manager, ACTION_DEBUG_TOGGLE);
    
    // Check for soft reset combo (Start + Select held for SOFT_RESET_HOLD_TIME)
    bool start_pressed = input_action_pressed(&arm_action_manager, ACTION_MENU);
    bool select_pressed = input_action_pressed(&arm_action_manager, ACTION_MAP);
    
    if (start_pressed && select_pressed) {
        if (!soft_reset_start_held || !soft_reset_select_held) {
            // Combo just started
            soft_reset_combo_start_time = platform_get_time(input_manager->engine->platform);
        }
        soft_reset_start_held = true;
        soft_reset_select_held = true;
        
        double held_time = platform_get_time(input_manager->engine->platform) - soft_reset_combo_start_time;
        if (held_time >= SOFT_RESET_HOLD_TIME) {
            printf("[Input] Soft reset combo detected - requesting restart\n");
            input_manager->engine->running = 0;  // Signal engine to stop
            // Note: The init wrapper script will restart us
        }
    } else {
        soft_reset_start_held = start_pressed;
        soft_reset_select_held = select_pressed;
    }
#else
    memset(input_manager->action_states, 0, sizeof(input_manager->action_states));
#endif
#endif
    
    // Calculate pressed/released states
    for (int i = 0; i < ACTION_COUNT; i++) {
        if (input_manager->action_states[i] && !input_manager->prev_action_states[i]) {
            input_manager->action_pressed[i] = true;
        }
        if (!input_manager->action_states[i] && input_manager->prev_action_states[i]) {
            input_manager->action_released[i] = true;
        }
    }
    
#ifdef USE_GLFW
    // Update mouse position
    input_manager->prev_mouse_x = input_manager->mouse_x;
    input_manager->prev_mouse_y = input_manager->mouse_y;
    glfwGetCursorPos(window, &input_manager->mouse_x, &input_manager->mouse_y);
    input_manager->mouse_dx = input_manager->mouse_x - input_manager->prev_mouse_x;
    input_manager->mouse_dy = input_manager->mouse_y - input_manager->prev_mouse_y;
    
    // Update mouse buttons
    input_manager->mouse_buttons[0] = glfwGetMouseButton(window, GLFW_MOUSE_BUTTON_LEFT) == GLFW_PRESS;
    input_manager->mouse_buttons[1] = glfwGetMouseButton(window, GLFW_MOUSE_BUTTON_RIGHT) == GLFW_PRESS;
    input_manager->mouse_buttons[2] = glfwGetMouseButton(window, GLFW_MOUSE_BUTTON_MIDDLE) == GLFW_PRESS;
    
    // Map left mouse button to select action
    if (input_manager->mouse_buttons[0] && !input_manager->prev_mouse_buttons[0]) {
        input_manager->action_pressed[ACTION_SELECT] = true;
    }
    if (input_manager->mouse_buttons[0]) {
        input_manager->action_states[ACTION_SELECT] = true;
    }
    
    // Update scroll
    input_manager->scroll_x = scroll_accumulator_x;
    input_manager->scroll_y = scroll_accumulator_y;
    scroll_accumulator_x = 0.0;
    scroll_accumulator_y = 0.0;
    
    // Handle window close via ESC
    if (input_manager_is_action_pressed(input_manager, ACTION_ESCAPE)) {
        glfwSetWindowShouldClose(window, GLFW_TRUE);
    }
#endif
}

bool input_manager_is_action_held(InputManager* input_manager, ActionType action) {
    if (!input_manager || action < 0 || action >= ACTION_COUNT) return false;
    return input_manager->action_states[action];
}

bool input_manager_is_action_pressed(InputManager* input_manager, ActionType action) {
    if (!input_manager || action < 0 || action >= ACTION_COUNT) return false;
    return input_manager->action_pressed[action];
}

bool input_manager_is_action_released(InputManager* input_manager, ActionType action) {
    if (!input_manager || action < 0 || action >= ACTION_COUNT) return false;
    return input_manager->action_released[action];
}

void input_manager_get_mouse_delta(InputManager* input_manager, double* dx, double* dy) {
    if (!input_manager) return;
    if (dx) *dx = input_manager->mouse_dx;
    if (dy) *dy = input_manager->mouse_dy;
}

void input_manager_get_mouse_position(InputManager* input_manager, double* x, double* y) {
    if (!input_manager) return;
    if (x) *x = input_manager->mouse_x;
    if (y) *y = input_manager->mouse_y;
}

void input_manager_get_scroll(InputManager* input_manager, double* sx, double* sy) {
    if (!input_manager) return;
    if (sx) *sx = input_manager->scroll_x;
    if (sy) *sy = input_manager->scroll_y;
}

bool input_manager_is_mouse_button_held(InputManager* input_manager, int button) {
    if (!input_manager || button < 0 || button >= 8) return false;
    return input_manager->mouse_buttons[button];
}

bool input_manager_is_mouse_button_pressed(InputManager* input_manager, int button) {
    if (!input_manager || button < 0 || button >= 8) return false;
    return input_manager->mouse_buttons[button] && !input_manager->prev_mouse_buttons[button];
}

const char* input_manager_get_action_name(ActionType action) {
    if (action < 0 || action >= ACTION_COUNT) return "unknown";
    return ACTION_NAMES[action];
}
