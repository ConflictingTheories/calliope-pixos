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

#ifndef INPUT_MANAGER_H
#define INPUT_MANAGER_H

#include <stdbool.h>

// Forward declaration
struct GLEngine;

// Maximum number of actions
#define MAX_ACTIONS 64
#define MAX_ACTION_NAME 32

// Action identifiers
typedef enum ActionType {
    ACTION_NONE = 0,
    ACTION_MOVE_UP,
    ACTION_MOVE_DOWN,
    ACTION_MOVE_LEFT,
    ACTION_MOVE_RIGHT,
    ACTION_INTERACT,
    ACTION_SELECT,
    ACTION_CAMERA_PAN_LEFT,
    ACTION_CAMERA_PAN_RIGHT,
    ACTION_CAMERA_PAN_UP,
    ACTION_CAMERA_PAN_DOWN,
    ACTION_CAMERA_ZOOM_IN,
    ACTION_CAMERA_ZOOM_OUT,
    ACTION_CAMERA_ROTATE_LEFT,
    ACTION_CAMERA_ROTATE_RIGHT,
    ACTION_MENU,
    ACTION_RUN,
    ACTION_BIND_CAMERA,
    ACTION_FIXED_CAMERA,
    ACTION_HELP,
    ACTION_CHAT,
    ACTION_ESCAPE,
    ACTION_HEIGHT_UP,
    ACTION_HEIGHT_DOWN,
    ACTION_DEBUG_TOGGLE,
    ACTION_COUNT
} ActionType;

/**
 * KeyBinding - Maps a GLFW key to an action.
 */
typedef struct KeyBinding {
    int key;                // GLFW key code
    ActionType action;
} KeyBinding;

/**
 * InputManager - Centralized input handling for keyboard, mouse, and gamepad.
 */
typedef struct InputManager {
    struct GLEngine* engine;
    
    // Key bindings
    KeyBinding bindings[MAX_ACTIONS];
    int binding_count;
    
    // Current action states
    bool action_states[ACTION_COUNT];
    bool action_pressed[ACTION_COUNT];   // Just pressed this frame
    bool action_released[ACTION_COUNT];  // Just released this frame
    bool prev_action_states[ACTION_COUNT];
    
    // Mouse state
    double mouse_x;
    double mouse_y;
    double prev_mouse_x;
    double prev_mouse_y;
    double mouse_dx;
    double mouse_dy;
    double scroll_x;
    double scroll_y;
    bool mouse_buttons[8];
    bool prev_mouse_buttons[8];
    
    // Modifiers
    bool shift_held;
    bool ctrl_held;
    bool alt_held;
    
    // Input mode
    char current_mode[32];
} InputManager;

/**
 * Initializes the input manager with default key bindings.
 * @param input_manager Pointer to InputManager struct.
 * @param engine Pointer to GLEngine.
 */
void init_input_manager(InputManager* input_manager, struct GLEngine* engine);

/**
 * Sets up default key bindings.
 * @param input_manager Pointer to InputManager struct.
 */
void input_manager_setup_default_bindings(InputManager* input_manager);

/**
 * Binds a key to an action.
 * @param input_manager Pointer to InputManager struct.
 * @param key GLFW key code.
 * @param action Action to bind.
 */
void input_manager_bind_key(InputManager* input_manager, int key, ActionType action);

/**
 * Updates the input state (call once per frame).
 * @param input_manager Pointer to InputManager struct.
 */
void update_input_manager(InputManager* input_manager);

/**
 * Checks if an action is currently held.
 * @param input_manager Pointer to InputManager struct.
 * @param action Action to check.
 * @return true if the action is active.
 */
bool input_manager_is_action_held(InputManager* input_manager, ActionType action);

/**
 * Checks if an action was just pressed this frame.
 * @param input_manager Pointer to InputManager struct.
 * @param action Action to check.
 * @return true if the action was just pressed.
 */
bool input_manager_is_action_pressed(InputManager* input_manager, ActionType action);

/**
 * Checks if an action was just released this frame.
 * @param input_manager Pointer to InputManager struct.
 * @param action Action to check.
 * @return true if the action was just released.
 */
bool input_manager_is_action_released(InputManager* input_manager, ActionType action);

/**
 * Gets the mouse delta since last frame.
 * @param input_manager Pointer to InputManager struct.
 * @param dx Output for X delta.
 * @param dy Output for Y delta.
 */
void input_manager_get_mouse_delta(InputManager* input_manager, double* dx, double* dy);

/**
 * Gets the current mouse position.
 * @param input_manager Pointer to InputManager struct.
 * @param x Output for X position.
 * @param y Output for Y position.
 */
void input_manager_get_mouse_position(InputManager* input_manager, double* x, double* y);

/**
 * Gets the scroll wheel delta.
 * @param input_manager Pointer to InputManager struct.
 * @param sx Output for X scroll.
 * @param sy Output for Y scroll.
 */
void input_manager_get_scroll(InputManager* input_manager, double* sx, double* sy);

/**
 * Checks if a mouse button is held.
 * @param input_manager Pointer to InputManager struct.
 * @param button Mouse button (0=left, 1=right, 2=middle).
 * @return true if held.
 */
bool input_manager_is_mouse_button_held(InputManager* input_manager, int button);

/**
 * Checks if a mouse button was just pressed.
 * @param input_manager Pointer to InputManager struct.
 * @param button Mouse button.
 * @return true if just pressed.
 */
bool input_manager_is_mouse_button_pressed(InputManager* input_manager, int button);

/**
 * Gets the name of an action.
 * @param action The action type.
 * @return String name of the action.
 */
const char* input_manager_get_action_name(ActionType action);

#endif // INPUT_MANAGER_H
