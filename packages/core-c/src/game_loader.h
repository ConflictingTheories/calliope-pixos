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

#ifndef GAME_LOADER_H
#define GAME_LOADER_H

#include <stdbool.h>

// Forward declarations
struct GLEngine;
struct ArchiveHandle;

// Maximum number of games in the selector
#define MAX_GAMES 64
#define MAX_GAME_NAME 128
#define MAX_GAME_PATH 256

// Game loading modes
typedef enum GameLoaderMode {
    LOADER_MODE_SINGLE,     // /spritz - Single game, boot directly
    LOADER_MODE_SELECTOR,   // /spritzes - Multiple games, show selector
    LOADER_MODE_DESKTOP     // Desktop mode - load from any path
} GameLoaderMode;

// Game entry for the selector
typedef struct GameEntry {
    char name[MAX_GAME_NAME];
    char path[MAX_GAME_PATH];
    char author[MAX_GAME_NAME];
    char description[256];
    char version[16];
    bool valid;
} GameEntry;

// Game loader state
typedef struct GameLoader {
    GameLoaderMode mode;
    
    // Game list (for selector mode)
    GameEntry games[MAX_GAMES];
    int game_count;
    int selected_index;
    
    // Currently loaded game
    struct ArchiveHandle* current_archive;
    char current_game_path[MAX_GAME_PATH];
    bool game_loaded;
    
    // Paths
    char single_game_path[MAX_GAME_PATH];   // /spritz/spritz.pxz
    char games_directory[MAX_GAME_PATH];     // /spritzes/
    
    // UI state
    bool show_selector;
    float scroll_offset;
} GameLoader;

/**
 * Initialize the game loader
 * Detects mode based on available paths:
 * - If /spritz/spritz.pxz exists: LOADER_MODE_SINGLE
 * - If /spritzes/ exists with .pxz files: LOADER_MODE_SELECTOR
 * - Otherwise: LOADER_MODE_DESKTOP
 * 
 * @param loader Pointer to GameLoader struct
 * @param engine Pointer to engine
 * @return 0 on success, -1 on failure
 */
int game_loader_init(GameLoader* loader, struct GLEngine* engine);

/**
 * Detect the loader mode based on filesystem
 * @param loader Pointer to GameLoader struct
 */
void game_loader_detect_mode(GameLoader* loader);

/**
 * Scan for games in the spritzes directory
 * @param loader Pointer to GameLoader struct
 * @return Number of games found
 */
int game_loader_scan_games(GameLoader* loader);

/**
 * Load the single game (for LOADER_MODE_SINGLE)
 * @param loader Pointer to GameLoader struct
 * @param engine Pointer to engine
 * @return 0 on success, -1 on failure
 */
int game_loader_load_single(GameLoader* loader, struct GLEngine* engine);

/**
 * Load a specific game by index (for LOADER_MODE_SELECTOR)
 * @param loader Pointer to GameLoader struct
 * @param engine Pointer to engine
 * @param index Game index in the list
 * @return 0 on success, -1 on failure
 */
int game_loader_load_game(GameLoader* loader, struct GLEngine* engine, int index);

/**
 * Load a game by path (for LOADER_MODE_DESKTOP)
 * @param loader Pointer to GameLoader struct
 * @param engine Pointer to engine
 * @param path Path to .pxz file
 * @return 0 on success, -1 on failure
 */
int game_loader_load_path(GameLoader* loader, struct GLEngine* engine, const char* path);

/**
 * Unload the current game
 * @param loader Pointer to GameLoader struct
 * @param engine Pointer to engine
 */
void game_loader_unload_game(GameLoader* loader, struct GLEngine* engine);

/**
 * Update the game selector UI
 * @param loader Pointer to GameLoader struct
 * @param engine Pointer to engine
 */
void game_loader_update_selector(GameLoader* loader, struct GLEngine* engine);

/**
 * Render the game selector UI
 * @param loader Pointer to GameLoader struct
 * @param engine Pointer to engine
 */
void game_loader_render_selector(GameLoader* loader, struct GLEngine* engine);

/**
 * Move selection up in the game list
 * @param loader Pointer to GameLoader struct
 */
void game_loader_select_prev(GameLoader* loader);

/**
 * Move selection down in the game list
 * @param loader Pointer to GameLoader struct
 */
void game_loader_select_next(GameLoader* loader);

/**
 * Confirm selection and load the selected game
 * @param loader Pointer to GameLoader struct
 * @param engine Pointer to engine
 * @return 0 on success, -1 on failure
 */
int game_loader_confirm_selection(GameLoader* loader, struct GLEngine* engine);

/**
 * Get current loader mode as string
 * @param mode Loader mode
 * @return Mode string
 */
const char* game_loader_mode_string(GameLoaderMode mode);

/**
 * Cleanup the game loader
 * @param loader Pointer to GameLoader struct
 * @param engine Pointer to engine
 */
void game_loader_destroy(GameLoader* loader, struct GLEngine* engine);

#endif // GAME_LOADER_H
