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

#ifndef CUTSCENE_MANAGER_H
#define CUTSCENE_MANAGER_H

#include <stdbool.h>

// Forward declarations
struct GLEngine;
struct HudManager;

// Maximum values
#define CUTSCENE_MAX_STEPS 64
#define CUTSCENE_MAX_SCENES 32
#define CUTSCENE_MAX_NAME_LENGTH 64
#define CUTSCENE_MAX_CUTOUTS 4

// ============================================
// Cutscene Step Types
// ============================================

typedef enum {
    CUTSCENE_STEP_NONE = 0,
    CUTSCENE_STEP_WAIT,             // Wait for specified milliseconds
    CUTSCENE_STEP_TRANSITION,       // Screen transition (fade in/out)
    CUTSCENE_STEP_LOAD_ZONE,        // Load a new zone
    CUTSCENE_STEP_ACTION,           // Run a custom action (Lua callback)
    CUTSCENE_STEP_SET_BACKDROP,     // Set backdrop image
    CUTSCENE_STEP_SHOW_CUTOUT,      // Show character cutout
    CUTSCENE_STEP_CLEAR_CUTOUTS,    // Clear all cutouts
    CUTSCENE_STEP_DIALOGUE,         // Show dialogue text
    CUTSCENE_STEP_WAIT_INPUT,       // Wait for player input
    CUTSCENE_STEP_PLAY_SOUND,       // Play a sound effect
    CUTSCENE_STEP_PLAY_MUSIC,       // Play background music
    CUTSCENE_STEP_SET_FLAG,         // Set a game flag
    CUTSCENE_STEP_SPRITE_ACTION,    // Trigger sprite action
} CutsceneStepType;

// ============================================
// Transition Effects
// ============================================

typedef enum {
    TRANSITION_NONE = 0,
    TRANSITION_FADE,
    TRANSITION_WIPE_LEFT,
    TRANSITION_WIPE_RIGHT,
    TRANSITION_WIPE_UP,
    TRANSITION_WIPE_DOWN,
    TRANSITION_DISSOLVE,
    TRANSITION_PIXELATE,
} TransitionEffect;

typedef enum {
    TRANSITION_DIR_IN = 0,
    TRANSITION_DIR_OUT,
} TransitionDirection;

// ============================================
// Cutscene Step Structure
// ============================================

typedef struct {
    CutsceneStepType type;
    
    // Common parameters
    int duration_ms;
    
    // Type-specific parameters (union for memory efficiency)
    union {
        // WAIT
        struct {
            int wait_ms;
        } wait;
        
        // TRANSITION
        struct {
            TransitionEffect effect;
            TransitionDirection direction;
        } transition;
        
        // LOAD_ZONE
        struct {
            char zone_name[64];
            bool use_transition;
        } load_zone;
        
        // ACTION (Lua callback)
        struct {
            char callback_name[64];
        } action;
        
        // SET_BACKDROP
        struct {
            char texture_path[128];
        } backdrop;
        
        // SHOW_CUTOUT
        struct {
            char texture_path[128];
            int position;  // 0 = left, 1 = right
        } cutout;
        
        // DIALOGUE
        struct {
            char text[512];
            char speaker[64];
            char portrait_path[128];
        } dialogue;
        
        // PLAY_SOUND / PLAY_MUSIC
        struct {
            char sound_path[128];
            float volume;
            bool loop;
        } audio;
        
        // SET_FLAG
        struct {
            char flag_name[64];
            int value;
        } flag;
        
        // SPRITE_ACTION
        struct {
            char sprite_id[64];
            char action_name[64];
        } sprite_action;
    } params;
    
} CutsceneStep;

// ============================================
// Cutscene Definition
// ============================================

typedef struct {
    char name[CUTSCENE_MAX_NAME_LENGTH];
    CutsceneStep steps[CUTSCENE_MAX_STEPS];
    int step_count;
    bool registered;
} CutsceneDefinition;

// ============================================
// Cutout State
// ============================================

typedef struct {
    unsigned int texture;
    int position;  // 0 = left, 1 = right
    bool active;
} CutoutState;

// ============================================
// Cutscene Manager
// ============================================

typedef struct CutsceneManager {
    struct GLEngine* engine;
    
    // Registered cutscenes
    CutsceneDefinition scenes[CUTSCENE_MAX_SCENES];
    int scene_count;
    
    // Current playback state
    bool active;
    int current_scene_index;
    int current_step_index;
    double step_start_time;
    double step_duration;
    bool waiting_for_step;
    
    // Transition state
    bool transitioning;
    TransitionEffect transition_effect;
    TransitionDirection transition_direction;
    float transition_progress;  // 0.0 to 1.0
    double transition_start_time;
    double transition_duration;
    
    // Backdrop state
    unsigned int backdrop_texture;
    bool has_backdrop;
    
    // Cutout states
    CutoutState cutouts[CUTSCENE_MAX_CUTOUTS];
    int cutout_count;
    
    // Dialogue state (points to HUD's textbox)
    bool dialogue_active;
    
    bool initialized;
} CutsceneManager;

// ============================================
// Cutscene Manager Functions
// ============================================

/**
 * Initialize the cutscene manager
 */
int cutscene_manager_init(CutsceneManager* cm, struct GLEngine* engine);

/**
 * Destroy the cutscene manager
 */
void cutscene_manager_destroy(CutsceneManager* cm);

/**
 * Register a cutscene definition
 * @param cm Cutscene manager
 * @param name Cutscene name
 * @param steps Array of steps
 * @param step_count Number of steps
 * @return 0 on success, -1 on failure
 */
int cutscene_register(CutsceneManager* cm, const char* name, 
                      CutsceneStep* steps, int step_count);

/**
 * Check if a cutscene is registered
 */
bool cutscene_is_registered(CutsceneManager* cm, const char* name);

/**
 * Start playing a cutscene by name
 * @param cm Cutscene manager
 * @param name Cutscene name
 * @return 0 on success, -1 if not found
 */
int cutscene_start(CutsceneManager* cm, const char* name);

/**
 * Skip the currently playing cutscene
 */
void cutscene_skip(CutsceneManager* cm);

/**
 * Check if a cutscene is currently running
 */
bool cutscene_is_running(CutsceneManager* cm);

/**
 * Update the cutscene manager (call each frame)
 * @param cm Cutscene manager
 * @param delta_time Time since last frame in seconds
 */
void cutscene_update(CutsceneManager* cm, double delta_time);

/**
 * Render cutscene elements (backdrop, cutouts, transitions)
 * Called by HUD manager
 */
void cutscene_render(CutsceneManager* cm);

// ============================================
// Step Builder Functions
// ============================================

/**
 * Create a wait step
 */
CutsceneStep cutscene_step_wait(int ms);

/**
 * Create a transition step
 */
CutsceneStep cutscene_step_transition(TransitionEffect effect, 
                                       TransitionDirection direction, 
                                       int duration_ms);

/**
 * Create a load zone step
 */
CutsceneStep cutscene_step_load_zone(const char* zone_name, bool use_transition);

/**
 * Create a dialogue step
 */
CutsceneStep cutscene_step_dialogue(const char* text, const char* speaker,
                                     const char* portrait_path);

/**
 * Create a set backdrop step
 */
CutsceneStep cutscene_step_set_backdrop(const char* texture_path);

/**
 * Create a show cutout step
 */
CutsceneStep cutscene_step_show_cutout(const char* texture_path, int position);

/**
 * Create a clear cutouts step
 */
CutsceneStep cutscene_step_clear_cutouts(void);

/**
 * Create a play sound step
 */
CutsceneStep cutscene_step_play_sound(const char* sound_path, float volume);

/**
 * Create a play music step
 */
CutsceneStep cutscene_step_play_music(const char* music_path, float volume, bool loop);

/**
 * Create a set flag step
 */
CutsceneStep cutscene_step_set_flag(const char* flag_name, int value);

/**
 * Create a Lua action step
 */
CutsceneStep cutscene_step_action(const char* callback_name);

/**
 * Create a wait for input step
 */
CutsceneStep cutscene_step_wait_input(void);

// ============================================
// JSON Loading
// ============================================

/**
 * Load a cutscene from JSON
 * @param cm Cutscene manager
 * @param json_path Path to JSON file
 * @return 0 on success, -1 on failure
 */
int cutscene_load_from_json(CutsceneManager* cm, const char* json_path);

/**
 * Load a cutscene from JSON string
 * @param cm Cutscene manager
 * @param name Cutscene name
 * @param json_string JSON content
 * @return 0 on success, -1 on failure
 */
int cutscene_load_from_json_string(CutsceneManager* cm, const char* name, 
                                    const char* json_string);

#endif // CUTSCENE_MANAGER_H
