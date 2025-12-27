#ifndef INPUT_MANAGER_H
#define INPUT_MANAGER_H

// Forward declaration
struct GLEngine;

/**
 * InputManager - Centralized input handling for keyboard, mouse, and gamepad.
 */
typedef struct {
    struct GLEngine* engine;
    // Placeholder for future fields like key states, etc.
} InputManager;

/**
 * Initializes the input manager.
 * @param input_manager Pointer to InputManager struct.
 * @param engine Pointer to GLEngine.
 */
void init_input_manager(InputManager* input_manager, GLEngine* engine);

/**
 * Updates the input state.
 * @param input_manager Pointer to InputManager struct.
 */
void update_input_manager(InputManager* input_manager);

#endif // INPUT_MANAGER_H
