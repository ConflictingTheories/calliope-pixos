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

/**
 * Audio Manager for Pixos Engine
 * Uses miniaudio for cross-platform audio playback
 * Supports background music (BGM) and sound effects (SFX)
 */

#ifndef AUDIO_MANAGER_H
#define AUDIO_MANAGER_H

#include <stdbool.h>
#include <stdint.h>

// Forward declaration
typedef struct AudioManager AudioManager;

// Maximum concurrent sound effects
#define MAX_SFX_INSTANCES 16

// Audio track state
typedef enum {
    AUDIO_STATE_STOPPED,
    AUDIO_STATE_PLAYING,
    AUDIO_STATE_PAUSED,
    AUDIO_STATE_FADING_IN,
    AUDIO_STATE_FADING_OUT
} AudioState;

/**
 * Audio Manager structure
 * Manages BGM and SFX playback
 */
struct AudioManager {
    void* engine;           // miniaudio engine (ma_engine*)
    void* bgm_sound;        // Current BGM (ma_sound*)
    void* sfx_sounds[MAX_SFX_INSTANCES]; // SFX pool
    
    // BGM state
    AudioState bgm_state;
    char bgm_path[256];     // Current BGM file path
    float bgm_volume;       // BGM volume (0.0 - 1.0)
    bool bgm_loop;          // Whether BGM loops
    
    // Master volumes
    float master_volume;    // Master volume (0.0 - 1.0)
    float sfx_volume;       // SFX volume (0.0 - 1.0)
    
    // Fade state
    float fade_duration;    // Fade duration in seconds
    float fade_timer;       // Current fade timer
    float fade_start_vol;   // Volume at fade start
    float fade_end_vol;     // Target volume
    
    // Initialization flag
    bool initialized;
};

/**
 * Initialize the audio manager
 * @param am Pointer to AudioManager
 * @return 0 on success, -1 on failure
 */
int audio_manager_init(AudioManager* am);

/**
 * Shutdown and cleanup audio manager
 * @param am Pointer to AudioManager
 */
void audio_manager_destroy(AudioManager* am);

/**
 * Update audio manager (handles fades, etc.)
 * @param am Pointer to AudioManager
 * @param delta_time Time since last frame in seconds
 */
void audio_manager_update(AudioManager* am, float delta_time);

// ============================================
// Background Music (BGM) Functions
// ============================================

/**
 * Play background music
 * @param am Pointer to AudioManager
 * @param path Path to audio file (MP3, WAV, OGG, FLAC supported)
 * @param loop Whether to loop the music
 * @param fade_in Fade in duration in seconds (0 for immediate)
 * @return 0 on success, -1 on failure
 */
int audio_manager_play_bgm(AudioManager* am, const char* path, bool loop, float fade_in);

/**
 * Stop background music
 * @param am Pointer to AudioManager
 * @param fade_out Fade out duration in seconds (0 for immediate)
 */
void audio_manager_stop_bgm(AudioManager* am, float fade_out);

/**
 * Pause background music
 * @param am Pointer to AudioManager
 */
void audio_manager_pause_bgm(AudioManager* am);

/**
 * Resume paused background music
 * @param am Pointer to AudioManager
 */
void audio_manager_resume_bgm(AudioManager* am);

/**
 * Check if BGM is currently playing
 * @param am Pointer to AudioManager
 * @return true if playing, false otherwise
 */
bool audio_manager_is_bgm_playing(AudioManager* am);

/**
 * Set BGM volume
 * @param am Pointer to AudioManager
 * @param volume Volume (0.0 - 1.0)
 */
void audio_manager_set_bgm_volume(AudioManager* am, float volume);

/**
 * Get current BGM volume
 * @param am Pointer to AudioManager
 * @return Current volume (0.0 - 1.0)
 */
float audio_manager_get_bgm_volume(AudioManager* am);

// ============================================
// Sound Effects (SFX) Functions
// ============================================

/**
 * Play a sound effect
 * @param am Pointer to AudioManager
 * @param path Path to audio file
 * @param volume Volume (0.0 - 1.0, relative to sfx_volume)
 * @return SFX instance index on success, -1 on failure
 */
int audio_manager_play_sfx(AudioManager* am, const char* path, float volume);

/**
 * Stop a specific sound effect
 * @param am Pointer to AudioManager
 * @param sfx_index Index returned by play_sfx
 */
void audio_manager_stop_sfx(AudioManager* am, int sfx_index);

/**
 * Stop all sound effects
 * @param am Pointer to AudioManager
 */
void audio_manager_stop_all_sfx(AudioManager* am);

/**
 * Set SFX master volume
 * @param am Pointer to AudioManager
 * @param volume Volume (0.0 - 1.0)
 */
void audio_manager_set_sfx_volume(AudioManager* am, float volume);

// ============================================
// Master Volume Functions
// ============================================

/**
 * Set master volume (affects all audio)
 * @param am Pointer to AudioManager
 * @param volume Volume (0.0 - 1.0)
 */
void audio_manager_set_master_volume(AudioManager* am, float volume);

/**
 * Get master volume
 * @param am Pointer to AudioManager
 * @return Current master volume (0.0 - 1.0)
 */
float audio_manager_get_master_volume(AudioManager* am);

/**
 * Mute all audio
 * @param am Pointer to AudioManager
 */
void audio_manager_mute(AudioManager* am);

/**
 * Unmute all audio
 * @param am Pointer to AudioManager
 */
void audio_manager_unmute(AudioManager* am);

#endif // AUDIO_MANAGER_H
