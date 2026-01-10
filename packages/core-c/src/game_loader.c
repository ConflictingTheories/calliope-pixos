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

#include "game_loader.h"
#include "engine.h"
#include "resource/archive_loader.h"
#include "input_manager.h"
#include "hud/hud_manager.h"
#include "rendering/gles_compat.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <dirent.h>
#include <sys/stat.h>

// Default paths for ARM embedded mode
#ifdef PLATFORM_ARM_LINUX
    #define SINGLE_GAME_PATH "/spritz/spritz.pxz"
    #define GAMES_DIRECTORY "/spritzes/"
#else
    // Desktop development paths
    #define SINGLE_GAME_PATH "./spritz/spritz.pxz"
    #define GAMES_DIRECTORY "./spritzes/"
#endif

// Check if a file exists
static bool file_exists(const char* path) {
    struct stat st;
    return stat(path, &st) == 0 && S_ISREG(st.st_mode);
}

// Check if a directory exists
static bool dir_exists(const char* path) {
    struct stat st;
    return stat(path, &st) == 0 && S_ISDIR(st.st_mode);
}

// Get file extension
static const char* get_extension(const char* filename) {
    const char* dot = strrchr(filename, '.');
    if (!dot || dot == filename) return "";
    return dot + 1;
}

int game_loader_init(GameLoader* loader, struct GLEngine* engine) {
    if (!loader || !engine) return -1;
    
    memset(loader, 0, sizeof(GameLoader));
    
    // Set default paths
    strncpy(loader->single_game_path, SINGLE_GAME_PATH, MAX_GAME_PATH - 1);
    strncpy(loader->games_directory, GAMES_DIRECTORY, MAX_GAME_PATH - 1);
    
    // Detect mode based on filesystem
    game_loader_detect_mode(loader);
    
    printf("[GameLoader] Initialized in %s mode\n", game_loader_mode_string(loader->mode));
    
    // Scan for games if in selector mode
    if (loader->mode == LOADER_MODE_SELECTOR) {
        int count = game_loader_scan_games(loader);
        printf("[GameLoader] Found %d games in %s\n", count, loader->games_directory);
        
        if (count == 0) {
            printf("[GameLoader] No games found, falling back to desktop mode\n");
            loader->mode = LOADER_MODE_DESKTOP;
        } else if (count == 1) {
            // Only one game, might as well load it directly
            printf("[GameLoader] Only one game found, loading directly\n");
            return game_loader_load_game(loader, engine, 0);
        } else {
            loader->show_selector = true;
        }
    } else if (loader->mode == LOADER_MODE_SINGLE) {
        // Load the single game immediately
        return game_loader_load_single(loader, engine);
    }
    
    return 0;
}

void game_loader_detect_mode(GameLoader* loader) {
    if (!loader) return;
    
    // Check for single game mode first
    if (file_exists(loader->single_game_path)) {
        loader->mode = LOADER_MODE_SINGLE;
        printf("[GameLoader] Found single game at %s\n", loader->single_game_path);
        return;
    }
    
    // Check for games directory
    if (dir_exists(loader->games_directory)) {
        loader->mode = LOADER_MODE_SELECTOR;
        printf("[GameLoader] Found games directory at %s\n", loader->games_directory);
        return;
    }
    
    // Default to desktop mode
    loader->mode = LOADER_MODE_DESKTOP;
    printf("[GameLoader] No embedded games found, using desktop mode\n");
}

int game_loader_scan_games(GameLoader* loader) {
    if (!loader) return 0;
    
    loader->game_count = 0;
    
    DIR* dir = opendir(loader->games_directory);
    if (!dir) {
        fprintf(stderr, "[GameLoader] Cannot open games directory: %s\n", loader->games_directory);
        return 0;
    }
    
    struct dirent* entry;
    while ((entry = readdir(dir)) != NULL && loader->game_count < MAX_GAMES) {
        // Skip hidden files and directories
        if (entry->d_name[0] == '.') continue;
        
        // Check for .pxz extension
        if (strcasecmp(get_extension(entry->d_name), "pxz") != 0) continue;
        
        // Build full path
        char full_path[MAX_GAME_PATH];
        snprintf(full_path, MAX_GAME_PATH, "%s%s", loader->games_directory, entry->d_name);
        
        // Verify it's a valid file
        if (!file_exists(full_path)) continue;
        
        // Add to list
        GameEntry* game = &loader->games[loader->game_count];
        memset(game, 0, sizeof(GameEntry));
        strncpy(game->path, full_path, MAX_GAME_PATH - 1);
        
        // Extract name from filename (without extension)
        strncpy(game->name, entry->d_name, MAX_GAME_NAME - 1);
        char* ext = strrchr(game->name, '.');
        if (ext) *ext = '\0';
        
        // Try to load manifest for more details
        ArchiveHandle archive;
        if (archive_open(&archive, full_path) == 0) {
            if (archive_load_manifest(&archive) == 0) {
                const GameManifest* manifest = archive_get_manifest(&archive);
                if (manifest) {
                    strncpy(game->name, manifest->name, MAX_GAME_NAME - 1);
                    strncpy(game->author, manifest->author, MAX_GAME_NAME - 1);
                    strncpy(game->description, manifest->description, 255);
                    strncpy(game->version, manifest->version, 15);
                }
            }
            archive_close(&archive);
        }
        
        game->valid = true;
        loader->game_count++;
        
        printf("[GameLoader] Found game: %s (%s)\n", game->name, game->path);
    }
    
    closedir(dir);
    return loader->game_count;
}

int game_loader_load_single(GameLoader* loader, struct GLEngine* engine) {
    if (!loader || !engine) return -1;
    
    printf("[GameLoader] Loading single game: %s\n", loader->single_game_path);
    return game_loader_load_path(loader, engine, loader->single_game_path);
}

int game_loader_load_game(GameLoader* loader, struct GLEngine* engine, int index) {
    if (!loader || !engine) return -1;
    if (index < 0 || index >= loader->game_count) return -1;
    
    GameEntry* game = &loader->games[index];
    if (!game->valid) return -1;
    
    printf("[GameLoader] Loading game %d: %s\n", index, game->name);
    return game_loader_load_path(loader, engine, game->path);
}

int game_loader_load_path(GameLoader* loader, struct GLEngine* engine, const char* path) {
    if (!loader || !engine || !path) return -1;
    
    // Unload any existing game
    if (loader->game_loaded) {
        game_loader_unload_game(loader, engine);
    }
    
    // Load the game package
    int result = game_package_load(engine, path);
    if (result != 0) {
        fprintf(stderr, "[GameLoader] Failed to load game package: %s\n", path);
        return -1;
    }
    
    strncpy(loader->current_game_path, path, MAX_GAME_PATH - 1);
    loader->current_archive = game_package_get_archive(engine);
    loader->game_loaded = true;
    loader->show_selector = false;
    
    printf("[GameLoader] Successfully loaded: %s\n", path);
    return 0;
}

void game_loader_unload_game(GameLoader* loader, struct GLEngine* engine) {
    if (!loader || !engine) return;
    
    if (loader->game_loaded) {
        game_package_unload(engine);
        loader->current_archive = NULL;
        loader->current_game_path[0] = '\0';
        loader->game_loaded = false;
        
        printf("[GameLoader] Game unloaded\n");
    }
}

void game_loader_update_selector(GameLoader* loader, struct GLEngine* engine) {
    if (!loader || !engine || !loader->show_selector) return;
    
    InputManager* input = engine->input_manager;
    
    // Navigation
    if (input_manager_is_action_pressed(input, ACTION_MOVE_UP)) {
        game_loader_select_prev(loader);
    }
    if (input_manager_is_action_pressed(input, ACTION_MOVE_DOWN)) {
        game_loader_select_next(loader);
    }
    
    // Confirm selection
    if (input_manager_is_action_pressed(input, ACTION_INTERACT) ||
        input_manager_is_action_pressed(input, ACTION_SELECT)) {
        game_loader_confirm_selection(loader, engine);
    }
}

void game_loader_render_selector(GameLoader* loader, struct GLEngine* engine) {
    if (!loader || !engine || !loader->show_selector) return;
    if (!engine->hud) return;
    
    HudManager* hud = engine->hud;
    
    // Clear screen with dark background
    glClearColor(0.1f, 0.1f, 0.15f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT);
    
    // Title
    hud_manager_draw_text(hud, "Select a Game", 
                          engine->width / 2.0f - 100.0f, 30.0f,
                          1.5f, (float[]){1.0f, 0.8f, 0.2f, 1.0f});
    
    // Game list
    float y_offset = 100.0f;
    float item_height = 60.0f;
    
    for (int i = 0; i < loader->game_count && i < 8; i++) {
        GameEntry* game = &loader->games[i];
        float y = y_offset + i * item_height;
        
        // Highlight selected item
        if (i == loader->selected_index) {
            // Draw selection background
            glEnable(GL_BLEND);
            glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
            // Simple quad would go here - using HUD for now
            
            hud_manager_draw_text(hud, "> ", 20.0f, y, 1.2f, 
                                  (float[]){1.0f, 0.5f, 0.8f, 1.0f});
        }
        
        // Game name
        hud_manager_draw_text(hud, game->name, 50.0f, y, 1.0f,
                              (float[]){1.0f, 1.0f, 1.0f, 1.0f});
        
        // Author/version if available
        if (game->author[0] != '\0') {
            char info[128];
            snprintf(info, 128, "by %s", game->author);
            hud_manager_draw_text(hud, info, 50.0f, y + 20.0f, 0.6f,
                                  (float[]){0.7f, 0.7f, 0.7f, 1.0f});
        }
    }
    
    // Instructions
    hud_manager_draw_text(hud, "Up/Down: Navigate   A/Enter: Select", 
                          20.0f, engine->height - 40.0f, 0.7f,
                          (float[]){0.5f, 0.5f, 0.6f, 1.0f});
}

void game_loader_select_prev(GameLoader* loader) {
    if (!loader || loader->game_count == 0) return;
    
    loader->selected_index--;
    if (loader->selected_index < 0) {
        loader->selected_index = loader->game_count - 1;
    }
}

void game_loader_select_next(GameLoader* loader) {
    if (!loader || loader->game_count == 0) return;
    
    loader->selected_index++;
    if (loader->selected_index >= loader->game_count) {
        loader->selected_index = 0;
    }
}

int game_loader_confirm_selection(GameLoader* loader, struct GLEngine* engine) {
    if (!loader || !engine) return -1;
    if (loader->game_count == 0) return -1;
    
    return game_loader_load_game(loader, engine, loader->selected_index);
}

const char* game_loader_mode_string(GameLoaderMode mode) {
    switch (mode) {
        case LOADER_MODE_SINGLE: return "SINGLE";
        case LOADER_MODE_SELECTOR: return "SELECTOR";
        case LOADER_MODE_DESKTOP: return "DESKTOP";
        default: return "UNKNOWN";
    }
}

void game_loader_destroy(GameLoader* loader, struct GLEngine* engine) {
    if (!loader) return;
    
    game_loader_unload_game(loader, engine);
    memset(loader, 0, sizeof(GameLoader));
}
