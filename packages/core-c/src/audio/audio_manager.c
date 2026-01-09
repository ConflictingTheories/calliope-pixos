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
 * Audio Manager Implementation
 * Uses miniaudio for cross-platform audio playback
 */

#define MINIAUDIO_IMPLEMENTATION
#include "../vendor/miniaudio.h"

#include "audio_manager.h"
#include <stdio.h>
#include <string.h>
#include <math.h>

// Static helper to clamp volume
static float clamp_volume(float vol) {
    if (vol < 0.0f) return 0.0f;
    if (vol > 1.0f) return 1.0f;
    return vol;
}

// Initialize the audio manager
int audio_manager_init(AudioManager* am) {
    if (am == NULL) {
        return -1;
    }
    
    // Clear state
    memset(am, 0, sizeof(AudioManager));
    
    // Allocate engine
    ma_engine* engine = (ma_engine*)malloc(sizeof(ma_engine));
    if (engine == NULL) {
        fprintf(stderr, "[Audio] Failed to allocate engine\n");
        return -1;
    }
    
    // Configure engine
    ma_engine_config config = ma_engine_config_init();
    config.channels = 2;
    config.sampleRate = 44100;
    
    // Initialize engine
    ma_result result = ma_engine_init(&config, engine);
    if (result != MA_SUCCESS) {
        fprintf(stderr, "[Audio] Failed to initialize engine: %d\n", result);
        free(engine);
        return -1;
    }
    
    am->engine = engine;
    am->master_volume = 1.0f;
    am->bgm_volume = 0.8f;
    am->sfx_volume = 1.0f;
    am->bgm_state = AUDIO_STATE_STOPPED;
    am->initialized = true;
    
    printf("[Audio] Audio manager initialized\n");
    return 0;
}

// Shutdown and cleanup audio manager
void audio_manager_destroy(AudioManager* am) {
    if (am == NULL || !am->initialized) {
        return;
    }
    
    // Stop and free BGM
    if (am->bgm_sound != NULL) {
        ma_sound* sound = (ma_sound*)am->bgm_sound;
        ma_sound_stop(sound);
        ma_sound_uninit(sound);
        free(sound);
        am->bgm_sound = NULL;
    }
    
    // Stop and free all SFX
    for (int i = 0; i < MAX_SFX_INSTANCES; i++) {
        if (am->sfx_sounds[i] != NULL) {
            ma_sound* sound = (ma_sound*)am->sfx_sounds[i];
            ma_sound_stop(sound);
            ma_sound_uninit(sound);
            free(sound);
            am->sfx_sounds[i] = NULL;
        }
    }
    
    // Shutdown engine
    if (am->engine != NULL) {
        ma_engine* engine = (ma_engine*)am->engine;
        ma_engine_uninit(engine);
        free(engine);
        am->engine = NULL;
    }
    
    am->initialized = false;
    printf("[Audio] Audio manager destroyed\n");
}

// Update audio manager (handles fades, etc.)
void audio_manager_update(AudioManager* am, float delta_time) {
    if (am == NULL || !am->initialized) {
        return;
    }
    
    // Handle fade in/out
    if (am->bgm_state == AUDIO_STATE_FADING_IN || am->bgm_state == AUDIO_STATE_FADING_OUT) {
        am->fade_timer += delta_time;
        
        if (am->fade_timer >= am->fade_duration) {
            // Fade complete
            am->fade_timer = am->fade_duration;
            
            if (am->bgm_state == AUDIO_STATE_FADING_IN) {
                am->bgm_state = AUDIO_STATE_PLAYING;
            } else {
                // Fade out complete - stop the sound
                am->bgm_state = AUDIO_STATE_STOPPED;
                if (am->bgm_sound != NULL) {
                    ma_sound* sound = (ma_sound*)am->bgm_sound;
                    ma_sound_stop(sound);
                }
            }
        }
        
        // Calculate interpolated volume
        float t = am->fade_timer / am->fade_duration;
        float volume = am->fade_start_vol + (am->fade_end_vol - am->fade_start_vol) * t;
        
        if (am->bgm_sound != NULL) {
            ma_sound* sound = (ma_sound*)am->bgm_sound;
            ma_sound_set_volume(sound, volume * am->master_volume);
        }
    }
    
    // Cleanup finished SFX
    for (int i = 0; i < MAX_SFX_INSTANCES; i++) {
        if (am->sfx_sounds[i] != NULL) {
            ma_sound* sound = (ma_sound*)am->sfx_sounds[i];
            if (!ma_sound_is_playing(sound)) {
                ma_sound_uninit(sound);
                free(sound);
                am->sfx_sounds[i] = NULL;
            }
        }
    }
}

// Play background music
int audio_manager_play_bgm(AudioManager* am, const char* path, bool loop, float fade_in) {
    if (am == NULL || !am->initialized || path == NULL) {
        return -1;
    }
    
    ma_engine* engine = (ma_engine*)am->engine;
    
    // Stop current BGM if playing
    if (am->bgm_sound != NULL) {
        ma_sound* sound = (ma_sound*)am->bgm_sound;
        ma_sound_stop(sound);
        ma_sound_uninit(sound);
        free(sound);
        am->bgm_sound = NULL;
    }
    
    // Allocate new sound
    ma_sound* sound = (ma_sound*)malloc(sizeof(ma_sound));
    if (sound == NULL) {
        fprintf(stderr, "[Audio] Failed to allocate BGM sound\n");
        return -1;
    }
    
    // Initialize sound from file (streaming for BGM)
    ma_uint32 flags = MA_SOUND_FLAG_STREAM;
    ma_result result = ma_sound_init_from_file(engine, path, flags, NULL, NULL, sound);
    if (result != MA_SUCCESS) {
        fprintf(stderr, "[Audio] Failed to load BGM '%s': %d\n", path, result);
        free(sound);
        return -1;
    }
    
    // Configure sound
    ma_sound_set_looping(sound, loop);
    
    // Handle fade in
    if (fade_in > 0.0f) {
        ma_sound_set_volume(sound, 0.0f);
        am->fade_duration = fade_in;
        am->fade_timer = 0.0f;
        am->fade_start_vol = 0.0f;
        am->fade_end_vol = am->bgm_volume;
        am->bgm_state = AUDIO_STATE_FADING_IN;
    } else {
        ma_sound_set_volume(sound, am->bgm_volume * am->master_volume);
        am->bgm_state = AUDIO_STATE_PLAYING;
    }
    
    // Start playback
    ma_sound_start(sound);
    
    // Store state
    am->bgm_sound = sound;
    am->bgm_loop = loop;
    strncpy(am->bgm_path, path, sizeof(am->bgm_path) - 1);
    am->bgm_path[sizeof(am->bgm_path) - 1] = '\0';
    
    printf("[Audio] Playing BGM: %s (loop=%d, fade=%.2f)\n", path, loop, fade_in);
    return 0;
}

// Stop background music
void audio_manager_stop_bgm(AudioManager* am, float fade_out) {
    if (am == NULL || !am->initialized || am->bgm_sound == NULL) {
        return;
    }
    
    if (fade_out > 0.0f) {
        // Start fade out
        am->fade_duration = fade_out;
        am->fade_timer = 0.0f;
        am->fade_start_vol = am->bgm_volume;
        am->fade_end_vol = 0.0f;
        am->bgm_state = AUDIO_STATE_FADING_OUT;
    } else {
        // Immediate stop
        ma_sound* sound = (ma_sound*)am->bgm_sound;
        ma_sound_stop(sound);
        ma_sound_uninit(sound);
        free(sound);
        am->bgm_sound = NULL;
        am->bgm_state = AUDIO_STATE_STOPPED;
    }
}

// Pause background music
void audio_manager_pause_bgm(AudioManager* am) {
    if (am == NULL || !am->initialized || am->bgm_sound == NULL) {
        return;
    }
    
    if (am->bgm_state == AUDIO_STATE_PLAYING || am->bgm_state == AUDIO_STATE_FADING_IN) {
        ma_sound* sound = (ma_sound*)am->bgm_sound;
        ma_sound_stop(sound);  // miniaudio uses stop for pause (preserves position)
        am->bgm_state = AUDIO_STATE_PAUSED;
    }
}

// Resume paused background music
void audio_manager_resume_bgm(AudioManager* am) {
    if (am == NULL || !am->initialized || am->bgm_sound == NULL) {
        return;
    }
    
    if (am->bgm_state == AUDIO_STATE_PAUSED) {
        ma_sound* sound = (ma_sound*)am->bgm_sound;
        ma_sound_start(sound);
        am->bgm_state = AUDIO_STATE_PLAYING;
    }
}

// Check if BGM is currently playing
bool audio_manager_is_bgm_playing(AudioManager* am) {
    if (am == NULL || !am->initialized || am->bgm_sound == NULL) {
        return false;
    }
    
    return am->bgm_state == AUDIO_STATE_PLAYING || 
           am->bgm_state == AUDIO_STATE_FADING_IN ||
           am->bgm_state == AUDIO_STATE_FADING_OUT;
}

// Set BGM volume
void audio_manager_set_bgm_volume(AudioManager* am, float volume) {
    if (am == NULL || !am->initialized) {
        return;
    }
    
    am->bgm_volume = clamp_volume(volume);
    
    if (am->bgm_sound != NULL && am->bgm_state == AUDIO_STATE_PLAYING) {
        ma_sound* sound = (ma_sound*)am->bgm_sound;
        ma_sound_set_volume(sound, am->bgm_volume * am->master_volume);
    }
}

// Get current BGM volume
float audio_manager_get_bgm_volume(AudioManager* am) {
    if (am == NULL) {
        return 0.0f;
    }
    return am->bgm_volume;
}

// Play a sound effect
int audio_manager_play_sfx(AudioManager* am, const char* path, float volume) {
    if (am == NULL || !am->initialized || path == NULL) {
        return -1;
    }
    
    ma_engine* engine = (ma_engine*)am->engine;
    
    // Find an empty slot
    int slot = -1;
    for (int i = 0; i < MAX_SFX_INSTANCES; i++) {
        if (am->sfx_sounds[i] == NULL) {
            slot = i;
            break;
        }
    }
    
    if (slot == -1) {
        fprintf(stderr, "[Audio] No SFX slots available\n");
        return -1;
    }
    
    // Allocate new sound
    ma_sound* sound = (ma_sound*)malloc(sizeof(ma_sound));
    if (sound == NULL) {
        fprintf(stderr, "[Audio] Failed to allocate SFX sound\n");
        return -1;
    }
    
    // Initialize sound from file (decode for low latency SFX)
    ma_uint32 flags = MA_SOUND_FLAG_DECODE;
    ma_result result = ma_sound_init_from_file(engine, path, flags, NULL, NULL, sound);
    if (result != MA_SUCCESS) {
        fprintf(stderr, "[Audio] Failed to load SFX '%s': %d\n", path, result);
        free(sound);
        return -1;
    }
    
    // Configure and play
    float final_volume = clamp_volume(volume) * am->sfx_volume * am->master_volume;
    ma_sound_set_volume(sound, final_volume);
    ma_sound_start(sound);
    
    am->sfx_sounds[slot] = sound;
    return slot;
}

// Stop a specific sound effect
void audio_manager_stop_sfx(AudioManager* am, int sfx_index) {
    if (am == NULL || !am->initialized) {
        return;
    }
    
    if (sfx_index >= 0 && sfx_index < MAX_SFX_INSTANCES && am->sfx_sounds[sfx_index] != NULL) {
        ma_sound* sound = (ma_sound*)am->sfx_sounds[sfx_index];
        ma_sound_stop(sound);
        ma_sound_uninit(sound);
        free(sound);
        am->sfx_sounds[sfx_index] = NULL;
    }
}

// Stop all sound effects
void audio_manager_stop_all_sfx(AudioManager* am) {
    if (am == NULL || !am->initialized) {
        return;
    }
    
    for (int i = 0; i < MAX_SFX_INSTANCES; i++) {
        if (am->sfx_sounds[i] != NULL) {
            ma_sound* sound = (ma_sound*)am->sfx_sounds[i];
            ma_sound_stop(sound);
            ma_sound_uninit(sound);
            free(sound);
            am->sfx_sounds[i] = NULL;
        }
    }
}

// Set SFX master volume
void audio_manager_set_sfx_volume(AudioManager* am, float volume) {
    if (am == NULL || !am->initialized) {
        return;
    }
    
    am->sfx_volume = clamp_volume(volume);
}

// Set master volume (affects all audio)
void audio_manager_set_master_volume(AudioManager* am, float volume) {
    if (am == NULL || !am->initialized) {
        return;
    }
    
    am->master_volume = clamp_volume(volume);
    
    // Update BGM volume
    if (am->bgm_sound != NULL && am->bgm_state == AUDIO_STATE_PLAYING) {
        ma_sound* sound = (ma_sound*)am->bgm_sound;
        ma_sound_set_volume(sound, am->bgm_volume * am->master_volume);
    }
}

// Get master volume
float audio_manager_get_master_volume(AudioManager* am) {
    if (am == NULL) {
        return 0.0f;
    }
    return am->master_volume;
}

// Mute all audio
void audio_manager_mute(AudioManager* am) {
    if (am == NULL || !am->initialized || am->engine == NULL) {
        return;
    }
    
    ma_engine* engine = (ma_engine*)am->engine;
    ma_engine_set_volume(engine, 0.0f);
}

// Unmute all audio
void audio_manager_unmute(AudioManager* am) {
    if (am == NULL || !am->initialized || am->engine == NULL) {
        return;
    }
    
    ma_engine* engine = (ma_engine*)am->engine;
    ma_engine_set_volume(engine, am->master_volume);
}
