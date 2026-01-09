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

#include "../platform/platform.h"
#include "../engine.h"
#include "../hud/hud_manager.h"
#include "../platform/platform.h"
#include "../vendor/cJSON.h"
#include "cutscene_manager.h"

#ifdef ENABLE_AUDIO
#include "../audio/audio_manager.h"
#endif

// #ifdef ENABLE_LUA
// #include "../scripting/lua_manager.h"
// #endif

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

// ============================================
// Cutscene Manager Implementation
// ============================================

int cutscene_manager_init(struct CutsceneManager* cm, struct GLEngine* engine) {
    if (!cm || !engine) return -1;
    
    memset(cm, 0, sizeof(CutsceneManager));
    cm->engine = engine;
    cm->initialized = true;
    
    printf("Cutscene Manager initialized\n");
    return 0;
}

void cutscene_manager_destroy(struct CutsceneManager* cm) {
    if (!cm || !cm->initialized) return;
    
    // Clean up textures
    if (cm->backdrop_texture) {
        // Would delete texture here
        cm->backdrop_texture = 0;
    }
    
    for (int i = 0; i < cm->cutout_count; i++) {
        if (cm->cutouts[i].texture) {
            // Would delete texture here
            cm->cutouts[i].texture = 0;
        }
    }
    
    cm->initialized = false;
    printf("Cutscene Manager destroyed\n");
}

int cutscene_register(struct CutsceneManager* cm, const char* name, 
                      CutsceneStep* steps, int step_count) {
    if (!cm || !name || !steps || step_count <= 0) return -1;
    if (cm->scene_count >= CUTSCENE_MAX_SCENES) {
        fprintf(stderr, "Maximum number of cutscenes reached\n");
        return -1;
    }
    if (step_count > CUTSCENE_MAX_STEPS) {
        fprintf(stderr, "Too many steps in cutscene\n");
        return -1;
    }
    
    // Check if already registered
    for (int i = 0; i < cm->scene_count; i++) {
        if (strcmp(cm->scenes[i].name, name) == 0) {
            // Update existing
            memcpy(cm->scenes[i].steps, steps, sizeof(CutsceneStep) * step_count);
            cm->scenes[i].step_count = step_count;
            return 0;
        }
    }
    
    // Add new
    CutsceneDefinition* def = &cm->scenes[cm->scene_count];
    strncpy(def->name, name, CUTSCENE_MAX_NAME_LENGTH - 1);
    memcpy(def->steps, steps, sizeof(CutsceneStep) * step_count);
    def->step_count = step_count;
    def->registered = true;
    cm->scene_count++;
    
    printf("Registered cutscene: %s (%d steps)\n", name, step_count);
    return 0;
}

bool cutscene_is_registered(struct CutsceneManager* cm, const char* name) {
    if (!cm || !name) return false;
    
    for (int i = 0; i < cm->scene_count; i++) {
        if (strcmp(cm->scenes[i].name, name) == 0) {
            return true;
        }
    }
    return false;
}

int cutscene_start(struct CutsceneManager* cm, const char* name) {
    if (!cm || !name) return -1;
    
    // Find the cutscene
    int scene_index = -1;
    for (int i = 0; i < cm->scene_count; i++) {
        if (strcmp(cm->scenes[i].name, name) == 0) {
            scene_index = i;
            break;
        }
    }
    
    if (scene_index < 0) {
        fprintf(stderr, "Cutscene not found: %s\n", name);
        return -1;
    }
    
    // Start playback
    cm->active = true;
    cm->current_scene_index = scene_index;
    cm->current_step_index = 0;
    cm->step_start_time = cm->engine->time;
    cm->waiting_for_step = false;
    
    // Clear visual state
    cm->has_backdrop = false;
    cm->cutout_count = 0;
    cm->dialogue_active = false;
    cm->transitioning = false;
    
    printf("Starting cutscene: %s\n", name);
    return 0;
}

void cutscene_skip(struct CutsceneManager* cm) {
    if (!cm) return;
    
    cm->active = false;
    cm->transitioning = false;
    cm->dialogue_active = false;
    
    // Clear HUD dialogue if active
    if (cm->engine->hud) {
        hud_close_dialogue(cm->engine->hud);
    }
    
    printf("Cutscene skipped\n");
}

bool cutscene_is_running(struct CutsceneManager* cm) {
    return cm && cm->active;
}

// ============================================
// Step Execution
// ============================================

static void execute_step(struct CutsceneManager* cm, CutsceneStep* step) {
    switch (step->type) {
        case CUTSCENE_STEP_WAIT:
            cm->step_duration = step->params.wait.wait_ms / 1000.0;
            cm->waiting_for_step = true;
            break;
            
        case CUTSCENE_STEP_TRANSITION:
            cm->transitioning = true;
            cm->transition_effect = step->params.transition.effect;
            cm->transition_direction = step->params.transition.direction;
            cm->transition_start_time = cm->engine->time;
            cm->transition_duration = step->duration_ms / 1000.0;
            cm->transition_progress = 0.0f;
            cm->step_duration = step->duration_ms / 1000.0;
            cm->waiting_for_step = true;
            break;
            
        case CUTSCENE_STEP_LOAD_ZONE:
            // TODO: Implement zone loading
            printf("Cutscene: Load zone '%s'\n", step->params.load_zone.zone_name);
            cm->waiting_for_step = false;  // Continue immediately for now
            break;
            
        case CUTSCENE_STEP_SET_BACKDROP:
            // TODO: Load texture from path
            printf("Cutscene: Set backdrop '%s'\n", step->params.backdrop.texture_path);
            cm->has_backdrop = true;
            cm->waiting_for_step = false;
            break;
            
        case CUTSCENE_STEP_SHOW_CUTOUT:
            if (cm->cutout_count < CUTSCENE_MAX_CUTOUTS) {
                // TODO: Load texture from path
                printf("Cutscene: Show cutout '%s' at %s\n", 
                       step->params.cutout.texture_path,
                       step->params.cutout.position == 0 ? "left" : "right");
                cm->cutouts[cm->cutout_count].position = step->params.cutout.position;
                cm->cutouts[cm->cutout_count].active = true;
                cm->cutout_count++;
            }
            cm->waiting_for_step = false;
            break;
            
        case CUTSCENE_STEP_CLEAR_CUTOUTS:
            cm->cutout_count = 0;
            cm->waiting_for_step = false;
            break;
            
        case CUTSCENE_STEP_DIALOGUE:
            if (cm->engine->hud) {
                hud_show_dialogue(cm->engine->hud,
                                  step->params.dialogue.text,
                                  step->params.dialogue.speaker[0] ? step->params.dialogue.speaker : NULL,
                                  0);  // TODO: Load portrait texture
                cm->dialogue_active = true;
                cm->waiting_for_step = true;
                // Dialogue completion is checked in update
            }
            break;
            
        case CUTSCENE_STEP_WAIT_INPUT:
            cm->waiting_for_step = true;
            // Will advance on input (checked in update)
            break;
            
        case CUTSCENE_STEP_PLAY_SOUND:
#ifdef ENABLE_AUDIO
            if (cm->engine->audio) {
                audio_manager_play_sfx(cm->engine->audio, 
                                       step->params.audio.sound_path,
                                       step->params.audio.volume);
            }
#endif
            cm->waiting_for_step = false;
            break;
            
        case CUTSCENE_STEP_PLAY_MUSIC:
#ifdef ENABLE_AUDIO
            if (cm->engine->audio) {
                audio_manager_play_bgm(cm->engine->audio,
                                        step->params.audio.sound_path,
                                        step->params.audio.loop,
                                        step->params.audio.volume);
            }
#endif
            cm->waiting_for_step = false;
            break;
            
        case CUTSCENE_STEP_SET_FLAG:
            // TODO: Implement game flags
            printf("Cutscene: Set flag '%s' = %d\n", 
                   step->params.flag.flag_name, step->params.flag.value);
            cm->waiting_for_step = false;
            break;
            
        case CUTSCENE_STEP_ACTION:
#ifdef ENABLE_LUA
            if (cm->engine->lua) {
                // lua_manager_call_function(cm->engine->lua, 
                //                           step->params.action.callback_name, NULL);
            }
#endif
            cm->waiting_for_step = false;
            break;
            
        case CUTSCENE_STEP_SPRITE_ACTION:
            // TODO: Implement sprite actions
            printf("Cutscene: Sprite action '%s' on '%s'\n",
                   step->params.sprite_action.action_name,
                   step->params.sprite_action.sprite_id);
            cm->waiting_for_step = false;
            break;
            
        default:
            cm->waiting_for_step = false;
            break;
    }
}

static bool check_step_complete(struct CutsceneManager* cm, CutsceneStep* step) {
    double elapsed = cm->engine->time - cm->step_start_time;
    
    switch (step->type) {
        case CUTSCENE_STEP_WAIT:
        case CUTSCENE_STEP_TRANSITION:
            return elapsed >= cm->step_duration;
            
        case CUTSCENE_STEP_DIALOGUE:
            // Check if dialogue is complete and player pressed confirm
            if (cm->engine->hud) {
                if (hud_is_dialogue_complete(cm->engine->hud)) {
                    // Check for confirm input
                    InputManager* im = cm->engine->input_manager;
                    if (im && input_manager_is_action_pressed(im, ACTION_INTERACT)) {
                        hud_close_dialogue(cm->engine->hud);
                        cm->dialogue_active = false;
                        return true;
                    }
                }
            }
            return false;
            
        case CUTSCENE_STEP_WAIT_INPUT:
            // Check for any confirm input
            if (cm->engine->input_manager) {
                return input_manager_is_action_pressed(cm->engine->input_manager, ACTION_INTERACT);
            }
            return false;
            
        default:
            return true;  // Immediate steps complete instantly
    }
}

void cutscene_manager_update(struct CutsceneManager* cm, double delta_time) {
    if (!cm || !cm->active) return;
    
    CutsceneDefinition* scene = &cm->scenes[cm->current_scene_index];
    
    // Check if cutscene is complete
    if (cm->current_step_index >= scene->step_count) {
        cm->active = false;
        printf("Cutscene complete\n");
        
        // Clean up
        if (cm->engine->hud) {
            hud_close_dialogue(cm->engine->hud);
            hud_clear_backdrop(cm->engine->hud);
            hud_clear_cutouts(cm->engine->hud);
        }
        return;
    }
    
    CutsceneStep* current_step = &scene->steps[cm->current_step_index];
    
    // Execute step if not waiting
    if (!cm->waiting_for_step) {
        cm->step_start_time = cm->engine->time;
        execute_step(cm, current_step);
    }
    
    // Update transition progress
    if (cm->transitioning) {
        double elapsed = cm->engine->time - cm->transition_start_time;
        cm->transition_progress = (float)(elapsed / cm->transition_duration);
        if (cm->transition_progress > 1.0f) {
            cm->transition_progress = 1.0f;
            cm->transitioning = false;
        }
    }
    
    // Check if step is complete
    if (cm->waiting_for_step && check_step_complete(cm, current_step)) {
        cm->waiting_for_step = false;
        cm->current_step_index++;
    }
}

void cutscene_render(struct CutsceneManager* cm) {
    if (!cm || !cm->engine->hud) return;
    
    HudManager* hud = cm->engine->hud;
    
    // Render backdrop
    if (cm->has_backdrop && cm->backdrop_texture) {
        hud_draw_textured_quad(hud, cm->backdrop_texture, 
                               0, 0, 
                               (float)hud->screen_width, 
                               (float)hud->screen_height, false);
    }
    
    // Render cutouts
    for (int i = 0; i < cm->cutout_count; i++) {
        if (cm->cutouts[i].active && cm->cutouts[i].texture) {
            float cutout_size = 200.0f;
            float x, y;
            bool flip = false;
            
            if (cm->cutouts[i].position == 0) {
                x = 50.0f;
            } else {
                x = (float)hud->screen_width - 50.0f - cutout_size;
                flip = true;
            }
            y = (float)hud->screen_height / 2.0f - cutout_size / 2.0f;
            
            hud_draw_textured_quad(hud, cm->cutouts[i].texture, 
                                   x, y, cutout_size, cutout_size, flip);
        }
    }
    
    // Render transition overlay
    if (cm->transitioning) {
        float alpha = 0.0f;
        
        switch (cm->transition_effect) {
            case TRANSITION_FADE:
                if (cm->transition_direction == TRANSITION_DIR_OUT) {
                    alpha = cm->transition_progress;
                } else {
                    alpha = 1.0f - cm->transition_progress;
                }
                hud_draw_rect(hud, 0, 0, 
                              (float)hud->screen_width, 
                              (float)hud->screen_height,
                              (HudColor){0.0f, 0.0f, 0.0f, alpha});
                break;
                
            // TODO: Implement other transition effects
            default:
                break;
        }
    }
}

// ============================================
// Step Builder Functions
// ============================================

CutsceneStep cutscene_step_wait(int ms) {
    CutsceneStep step = {0};
    step.type = CUTSCENE_STEP_WAIT;
    step.params.wait.wait_ms = ms;
    return step;
}

CutsceneStep cutscene_step_transition(TransitionEffect effect, 
                                       TransitionDirection direction, 
                                       int duration_ms) {
    CutsceneStep step = {0};
    step.type = CUTSCENE_STEP_TRANSITION;
    step.duration_ms = duration_ms;
    step.params.transition.effect = effect;
    step.params.transition.direction = direction;
    return step;
}

CutsceneStep cutscene_step_load_zone(const char* zone_name, bool use_transition) {
    CutsceneStep step = {0};
    step.type = CUTSCENE_STEP_LOAD_ZONE;
    if (zone_name) {
        strncpy(step.params.load_zone.zone_name, zone_name, 63);
    }
    step.params.load_zone.use_transition = use_transition;
    return step;
}

CutsceneStep cutscene_step_dialogue(const char* text, const char* speaker,
                                     const char* portrait_path) {
    CutsceneStep step = {0};
    step.type = CUTSCENE_STEP_DIALOGUE;
    if (text) {
        strncpy(step.params.dialogue.text, text, 511);
    }
    if (speaker) {
        strncpy(step.params.dialogue.speaker, speaker, 63);
    }
    if (portrait_path) {
        strncpy(step.params.dialogue.portrait_path, portrait_path, 127);
    }
    return step;
}

CutsceneStep cutscene_step_set_backdrop(const char* texture_path) {
    CutsceneStep step = {0};
    step.type = CUTSCENE_STEP_SET_BACKDROP;
    if (texture_path) {
        strncpy(step.params.backdrop.texture_path, texture_path, 127);
    }
    return step;
}

CutsceneStep cutscene_step_show_cutout(const char* texture_path, int position) {
    CutsceneStep step = {0};
    step.type = CUTSCENE_STEP_SHOW_CUTOUT;
    if (texture_path) {
        strncpy(step.params.cutout.texture_path, texture_path, 127);
    }
    step.params.cutout.position = position;
    return step;
}

CutsceneStep cutscene_step_clear_cutouts(void) {
    CutsceneStep step = {0};
    step.type = CUTSCENE_STEP_CLEAR_CUTOUTS;
    return step;
}

CutsceneStep cutscene_step_play_sound(const char* sound_path, float volume) {
    CutsceneStep step = {0};
    step.type = CUTSCENE_STEP_PLAY_SOUND;
    if (sound_path) {
        strncpy(step.params.audio.sound_path, sound_path, 127);
    }
    step.params.audio.volume = volume;
    step.params.audio.loop = false;
    return step;
}

CutsceneStep cutscene_step_play_music(const char* music_path, float volume, bool loop) {
    CutsceneStep step = {0};
    step.type = CUTSCENE_STEP_PLAY_MUSIC;
    if (music_path) {
        strncpy(step.params.audio.sound_path, music_path, 127);
    }
    step.params.audio.volume = volume;
    step.params.audio.loop = loop;
    return step;
}

CutsceneStep cutscene_step_set_flag(const char* flag_name, int value) {
    CutsceneStep step = {0};
    step.type = CUTSCENE_STEP_SET_FLAG;
    if (flag_name) {
        strncpy(step.params.flag.flag_name, flag_name, 63);
    }
    step.params.flag.value = value;
    return step;
}

CutsceneStep cutscene_step_action(const char* callback_name) {
    CutsceneStep step = {0};
    step.type = CUTSCENE_STEP_ACTION;
    if (callback_name) {
        strncpy(step.params.action.callback_name, callback_name, 63);
    }
    return step;
}

CutsceneStep cutscene_step_wait_input(void) {
    CutsceneStep step = {0};
    step.type = CUTSCENE_STEP_WAIT_INPUT;
    return step;
}

// ============================================
// JSON Loading
// ============================================

static CutsceneStepType parse_step_type(const char* type_str) {
    if (!type_str) return CUTSCENE_STEP_NONE;
    
    if (strcmp(type_str, "wait") == 0) return CUTSCENE_STEP_WAIT;
    if (strcmp(type_str, "transition") == 0) return CUTSCENE_STEP_TRANSITION;
    if (strcmp(type_str, "load_zone") == 0) return CUTSCENE_STEP_LOAD_ZONE;
    if (strcmp(type_str, "action") == 0) return CUTSCENE_STEP_ACTION;
    if (strcmp(type_str, "set_backdrop") == 0) return CUTSCENE_STEP_SET_BACKDROP;
    if (strcmp(type_str, "show_cutout") == 0) return CUTSCENE_STEP_SHOW_CUTOUT;
    if (strcmp(type_str, "clear_cutouts") == 0) return CUTSCENE_STEP_CLEAR_CUTOUTS;
    if (strcmp(type_str, "dialogue") == 0) return CUTSCENE_STEP_DIALOGUE;
    if (strcmp(type_str, "wait_input") == 0) return CUTSCENE_STEP_WAIT_INPUT;
    if (strcmp(type_str, "play_sound") == 0) return CUTSCENE_STEP_PLAY_SOUND;
    if (strcmp(type_str, "play_music") == 0) return CUTSCENE_STEP_PLAY_MUSIC;
    if (strcmp(type_str, "set_flag") == 0) return CUTSCENE_STEP_SET_FLAG;
    
    return CUTSCENE_STEP_NONE;
}

static TransitionEffect parse_transition_effect(const char* effect_str) {
    if (!effect_str) return TRANSITION_FADE;
    
    if (strcmp(effect_str, "fade") == 0) return TRANSITION_FADE;
    if (strcmp(effect_str, "wipe_left") == 0) return TRANSITION_WIPE_LEFT;
    if (strcmp(effect_str, "wipe_right") == 0) return TRANSITION_WIPE_RIGHT;
    if (strcmp(effect_str, "wipe_up") == 0) return TRANSITION_WIPE_UP;
    if (strcmp(effect_str, "wipe_down") == 0) return TRANSITION_WIPE_DOWN;
    if (strcmp(effect_str, "dissolve") == 0) return TRANSITION_DISSOLVE;
    if (strcmp(effect_str, "pixelate") == 0) return TRANSITION_PIXELATE;
    
    return TRANSITION_FADE;
}

int cutscene_load_from_json_string(struct CutsceneManager* cm, const char* name, 
                                   const char* json_string) {
    if (!cm || !name || !json_string) return -1;
    
    cJSON* json = cJSON_Parse(json_string);
    if (!json) {
        fprintf(stderr, "Failed to parse cutscene JSON: %s\n", cJSON_GetErrorPtr());
        return -1;
    }
    
    // Get steps array
    cJSON* steps_array = cJSON_GetObjectItem(json, "steps");
    if (!steps_array || !cJSON_IsArray(steps_array)) {
        fprintf(stderr, "Cutscene JSON missing 'steps' array\n");
        cJSON_Delete(json);
        return -1;
    }
    
    int step_count = cJSON_GetArraySize(steps_array);
    if (step_count > CUTSCENE_MAX_STEPS) {
        step_count = CUTSCENE_MAX_STEPS;
    }
    
    CutsceneStep steps[CUTSCENE_MAX_STEPS] = {0};
    
    for (int i = 0; i < step_count; i++) {
        cJSON* step_json = cJSON_GetArrayItem(steps_array, i);
        if (!step_json) continue;
        
        cJSON* type_item = cJSON_GetObjectItem(step_json, "type");
        if (!type_item || !cJSON_IsString(type_item)) continue;
        
        CutsceneStep* step = &steps[i];
        step->type = parse_step_type(type_item->valuestring);
        
        // Parse common parameters
        cJSON* duration = cJSON_GetObjectItem(step_json, "duration");
        if (duration && cJSON_IsNumber(duration)) {
            step->duration_ms = duration->valueint;
        }
        
        // Parse type-specific parameters
        switch (step->type) {
            case CUTSCENE_STEP_WAIT: {
                cJSON* ms = cJSON_GetObjectItem(step_json, "ms");
                if (ms && cJSON_IsNumber(ms)) {
                    step->params.wait.wait_ms = ms->valueint;
                }
                break;
            }
            
            case CUTSCENE_STEP_TRANSITION: {
                cJSON* effect = cJSON_GetObjectItem(step_json, "effect");
                if (effect && cJSON_IsString(effect)) {
                    step->params.transition.effect = parse_transition_effect(effect->valuestring);
                }
                cJSON* direction = cJSON_GetObjectItem(step_json, "direction");
                if (direction && cJSON_IsString(direction)) {
                    step->params.transition.direction = 
                        strcmp(direction->valuestring, "in") == 0 ? 
                        TRANSITION_DIR_IN : TRANSITION_DIR_OUT;
                }
                break;
            }
            
            case CUTSCENE_STEP_LOAD_ZONE: {
                cJSON* zone = cJSON_GetObjectItem(step_json, "zone");
                if (zone && cJSON_IsString(zone)) {
                    strncpy(step->params.load_zone.zone_name, zone->valuestring, 63);
                }
                break;
            }
            
            case CUTSCENE_STEP_DIALOGUE: {
                cJSON* text = cJSON_GetObjectItem(step_json, "text");
                if (text && cJSON_IsString(text)) {
                    strncpy(step->params.dialogue.text, text->valuestring, 511);
                }
                cJSON* speaker = cJSON_GetObjectItem(step_json, "speaker");
                if (speaker && cJSON_IsString(speaker)) {
                    strncpy(step->params.dialogue.speaker, speaker->valuestring, 63);
                }
                cJSON* portrait = cJSON_GetObjectItem(step_json, "portrait");
                if (portrait && cJSON_IsString(portrait)) {
                    strncpy(step->params.dialogue.portrait_path, portrait->valuestring, 127);
                }
                break;
            }
            
            case CUTSCENE_STEP_SET_BACKDROP: {
                cJSON* backdrop = cJSON_GetObjectItem(step_json, "backdrop");
                if (backdrop && cJSON_IsString(backdrop)) {
                    strncpy(step->params.backdrop.texture_path, backdrop->valuestring, 127);
                }
                break;
            }
            
            case CUTSCENE_STEP_SHOW_CUTOUT: {
                cJSON* texture = cJSON_GetObjectItem(step_json, "texture");
                if (texture && cJSON_IsString(texture)) {
                    strncpy(step->params.cutout.texture_path, texture->valuestring, 127);
                }
                cJSON* position = cJSON_GetObjectItem(step_json, "position");
                if (position && cJSON_IsString(position)) {
                    step->params.cutout.position = 
                        strcmp(position->valuestring, "right") == 0 ? 1 : 0;
                }
                break;
            }
            
            case CUTSCENE_STEP_SET_FLAG: {
                cJSON* flag_name = cJSON_GetObjectItem(step_json, "flag");
                if (flag_name && cJSON_IsString(flag_name)) {
                    strncpy(step->params.flag.flag_name, flag_name->valuestring, 63);
                }
                cJSON* value = cJSON_GetObjectItem(step_json, "value");
                if (value && cJSON_IsNumber(value)) {
                    step->params.flag.value = value->valueint;
                }
                break;
            }
            
            case CUTSCENE_STEP_ACTION: {
                cJSON* callback = cJSON_GetObjectItem(step_json, "callback");
                if (callback && cJSON_IsString(callback)) {
                    strncpy(step->params.action.callback_name, callback->valuestring, 63);
                }
                break;
            }
            
            default:
                break;
        }
    }
    
    cJSON_Delete(json);
    
    return cutscene_register(cm, name, steps, step_count);
}

int cutscene_load_from_json(struct CutsceneManager* cm, const char* json_path) {
    if (!cm || !json_path) return -1;
    
    // Read file
    FILE* file = fopen(json_path, "rb");
    if (!file) {
        fprintf(stderr, "Failed to open cutscene file: %s\n", json_path);
        return -1;
    }
    
    fseek(file, 0, SEEK_END);
    long file_size = ftell(file);
    fseek(file, 0, SEEK_SET);
    
    char* buffer = (char*)malloc(file_size + 1);
    if (!buffer) {
        fclose(file);
        return -1;
    }
    
    fread(buffer, 1, file_size, file);
    buffer[file_size] = '\0';
    fclose(file);
    
    // Extract name from filename
    const char* filename = strrchr(json_path, '/');
    if (!filename) filename = json_path;
    else filename++;
    
    char name[64];
    strncpy(name, filename, sizeof(name) - 1);
    char* dot = strrchr(name, '.');
    if (dot) *dot = '\0';
    
    int result = cutscene_load_from_json_string(cm, name, buffer);
    free(buffer);
    
    return result;
}
