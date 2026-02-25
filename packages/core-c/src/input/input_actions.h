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

#ifndef INPUT_ACTIONS_H
#define INPUT_ACTIONS_H

#include <stdbool.h>
#include "platform/platform.h"

/* 
 * Input Action System
 * 
 * This provides an abstraction layer between physical inputs (keyboard keys,
 * gamepad buttons) and logical game actions. This allows:
 * - Same code to work on desktop (keyboard) and ARM (gamepad)
 * - Remappable controls
 * - Multiple inputs per action
 */

/* ============================================
 * Game Actions
 * ============================================ */

typedef enum GameAction {
    /* Movement */
    GAME_ACTION_MOVE_UP = 0,
    GAME_ACTION_MOVE_DOWN,
    GAME_ACTION_MOVE_LEFT,
    GAME_ACTION_MOVE_RIGHT,
    
    /* Face buttons */
    GAME_ACTION_CONFIRM,         /* A / Enter / Space */
    GAME_ACTION_CANCEL,          /* B / Escape */
    GAME_ACTION_MENU,            /* Start / Tab */
    GAME_ACTION_MAP,             /* Select / M */
    
    /* Shoulder buttons */
    GAME_ACTION_PREV,            /* L1 / Q */
    GAME_ACTION_NEXT,            /* R1 / E */
    GAME_ACTION_ZOOM_IN,         /* R2 / + */
    GAME_ACTION_ZOOM_OUT,        /* L2 / - */
    
    /* Analog sticks */
    GAME_ACTION_CAMERA_X,        /* Right stick X */
    GAME_ACTION_CAMERA_Y,        /* Right stick Y */
    
    /* Debug/system */
    GAME_ACTION_DEBUG_TOGGLE,    /* F1 */
    GAME_ACTION_FULLSCREEN,      /* F11 */
    GAME_ACTION_QUIT,            /* Alt+F4 / Escape (hold) */
    
    GAME_ACTION_COUNT
} GameAction;

/* Action state */
typedef struct ActionState {
    bool pressed;           /* Currently held down */
    bool just_pressed;      /* Pressed this frame */
    bool just_released;     /* Released this frame */
    float value;            /* Analog value (-1 to 1 for axes) */
} ActionState;

/* Input binding types */
typedef enum InputBindingType {
    BINDING_KEY,            /* Keyboard key */
    BINDING_BUTTON,         /* Gamepad button */
    BINDING_AXIS_POSITIVE,  /* Positive axis direction */
    BINDING_AXIS_NEGATIVE   /* Negative axis direction */
} InputBindingType;

/* Single input binding */
typedef struct InputBinding {
    InputBindingType type;
    int code;               /* Key code, button code, or axis code */
    float dead_zone;        /* For analog inputs */
} InputBinding;

/* Maximum bindings per action */
#define MAX_BINDINGS_PER_ACTION 4

/* Action mapping */
typedef struct ActionMapping {
    GameAction action;
    InputBinding bindings[MAX_BINDINGS_PER_ACTION];
    int binding_count;
} ActionMapping;

/* Input action manager */
typedef struct InputActionManager {
    ActionState actions[GAME_ACTION_COUNT];
    ActionState prev_actions[GAME_ACTION_COUNT];
    ActionMapping mappings[GAME_ACTION_COUNT];
    
    /* Analog axis raw values */
    float axis_left_x;
    float axis_left_y;
    float axis_right_x;
    float axis_right_y;
    
    /* Settings */
    float analog_dead_zone;
    bool invert_y_axis;
    
} InputActionManager;

/**
 * Initialize the input action manager with default bindings.
 */
void input_action_init(InputActionManager* manager);

/**
 * Update action states based on current input.
 * Call this at the start of each frame.
 */
void input_action_update(InputActionManager* manager);

/**
 * Process a raw input event and update action states.
 */
void input_action_process_event(InputActionManager* manager, PlatformInputEvent* event);

/**
 * Check if an action is currently held.
 */
bool input_action_pressed(InputActionManager* manager, GameAction action);

/**
 * Check if an action was just pressed this frame.
 */
bool input_action_just_pressed(InputActionManager* manager, GameAction action);

/**
 * Check if an action was just released this frame.
 */
bool input_action_just_released(InputActionManager* manager, GameAction action);

/**
 * Get analog value for an action (-1 to 1).
 */
float input_action_value(InputActionManager* manager, GameAction action);

/**
 * Get movement vector from directional inputs.
 * Returns normalized vec2 for WASD/D-pad style movement.
 */
void input_action_get_movement(InputActionManager* manager, float* x, float* y);

/**
 * Get camera movement from right stick or mouse drag.
 */
void input_action_get_camera(InputActionManager* manager, float* x, float* y);

/**
 * Add a binding to an action.
 */
void input_action_bind(InputActionManager* manager, GameAction action, 
                       InputBindingType type, int code);

/**
 * Clear all bindings for an action.
 */
void input_action_clear_bindings(InputActionManager* manager, GameAction action);

/**
 * Load key bindings from configuration.
 */
void input_action_load_config(InputActionManager* manager, const char* filepath);

/**
 * Save key bindings to configuration.
 */
void input_action_save_config(InputActionManager* manager, const char* filepath);

/* ============================================
 * Platform-specific Key Codes
 * ============================================ */

/* Unified key codes (matching GLFW for convenience) */
#define KEY_ESCAPE          256
#define KEY_ENTER           257
#define KEY_TAB             258
#define KEY_BACKSPACE       259
#define KEY_INSERT          260
#define KEY_DELETE          261
#define KEY_RIGHT           262
#define KEY_LEFT            263
#define KEY_DOWN            264
#define KEY_UP              265
#define KEY_PAGE_UP         266
#define KEY_PAGE_DOWN       267
#define KEY_HOME            268
#define KEY_END             269
#define KEY_F1              290
#define KEY_F2              291
#define KEY_F3              292
#define KEY_F4              293
#define KEY_F5              294
#define KEY_F11             300
#define KEY_F12             301

#define KEY_SPACE           32
#define KEY_APOSTROPHE      39
#define KEY_COMMA           44
#define KEY_MINUS           45
#define KEY_PERIOD          46
#define KEY_SLASH           47
#define KEY_0               48
#define KEY_1               49
#define KEY_2               50
#define KEY_3               51
#define KEY_4               52
#define KEY_5               53
#define KEY_6               54
#define KEY_7               55
#define KEY_8               56
#define KEY_9               57
#define KEY_SEMICOLON       59
#define KEY_EQUAL           61

#define KEY_A               65
#define KEY_B               66
#define KEY_C               67
#define KEY_D               68
#define KEY_E               69
#define KEY_F               70
#define KEY_G               71
#define KEY_H               72
#define KEY_I               73
#define KEY_J               74
#define KEY_K               75
#define KEY_L               76
#define KEY_M               77
#define KEY_N               78
#define KEY_O               79
#define KEY_P               80
#define KEY_Q               81
#define KEY_R               82
#define KEY_S               83
#define KEY_T               84
#define KEY_U               85
#define KEY_V               86
#define KEY_W               87
#define KEY_X               88
#define KEY_Y               89
#define KEY_Z               90

/* Gamepad buttons (matching SDL/evdev) */
#define GAMEPAD_A           0
#define GAMEPAD_B           1
#define GAMEPAD_X           2
#define GAMEPAD_Y           3
#define GAMEPAD_L1          4
#define GAMEPAD_R1          5
#define GAMEPAD_L2          6
#define GAMEPAD_R2          7
#define GAMEPAD_SELECT      8
#define GAMEPAD_START       9
#define GAMEPAD_L3          10
#define GAMEPAD_R3          11
#define GAMEPAD_DPAD_UP     12
#define GAMEPAD_DPAD_DOWN   13
#define GAMEPAD_DPAD_LEFT   14
#define GAMEPAD_DPAD_RIGHT  15

/* Gamepad axes */
#define GAMEPAD_AXIS_LEFT_X     0
#define GAMEPAD_AXIS_LEFT_Y     1
#define GAMEPAD_AXIS_RIGHT_X    2
#define GAMEPAD_AXIS_RIGHT_Y    3
#define GAMEPAD_AXIS_L2         4
#define GAMEPAD_AXIS_R2         5

/* ============================================
 * RG353V Specific Button Codes (evdev)
 * ============================================ */

#ifdef PLATFORM_ARM_LINUX
/* These are Linux evdev KEY_* codes for RG353V */
#define RG353V_DPAD_UP      103  /* KEY_UP */
#define RG353V_DPAD_DOWN    108  /* KEY_DOWN */
#define RG353V_DPAD_LEFT    105  /* KEY_LEFT */
#define RG353V_DPAD_RIGHT   106  /* KEY_RIGHT */
#define RG353V_A            304  /* BTN_SOUTH */
#define RG353V_B            305  /* BTN_EAST */
#define RG353V_X            307  /* BTN_NORTH */
#define RG353V_Y            308  /* BTN_WEST */
#define RG353V_L1           310  /* BTN_TL */
#define RG353V_R1           311  /* BTN_TR */
#define RG353V_L2           312  /* BTN_TL2 */
#define RG353V_R2           313  /* BTN_TR2 */
#define RG353V_SELECT       314  /* BTN_SELECT */
#define RG353V_START        315  /* BTN_START */
#define RG353V_L3           317  /* BTN_THUMBL */
#define RG353V_R3           318  /* BTN_THUMBR */

/* Analog stick axes (evdev ABS_* codes) */
#define RG353V_AXIS_LEFT_X  0   /* ABS_X */
#define RG353V_AXIS_LEFT_Y  1   /* ABS_Y */
#define RG353V_AXIS_RIGHT_X 3   /* ABS_RX */
#define RG353V_AXIS_RIGHT_Y 4   /* ABS_RY */
#endif

#endif /* INPUT_ACTIONS_H */
