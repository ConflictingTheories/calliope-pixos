/*
 * ---------------------------------------------------------------
 *        Calliope - Pixos Engine - GENERATED FILE
 * ---------------------------------------------------------------
 * THIS FILE IS AUTO-GENERATED FROM specs/*.json
 * DO NOT EDIT MANUALLY - Changes will be overwritten!
 * 
 * Event type constants for engine events
 * 
 * Generated: 2026-01-09T23:04:58.069Z
 * ---------------------------------------------------------------
 */

#ifndef PIXOS_GENERATED_EVENTS_H
#define PIXOS_GENERATED_EVENTS_H

/* Event type identifiers */
typedef enum {
    /* Core engine lifecycle events */
    EVENT_ENGINE_INIT = 0,
    EVENT_ENGINE_START = 1,
    EVENT_ENGINE_STOP = 2,
    EVENT_ENGINE_PAUSE = 3,
    EVENT_ENGINE_RESUME = 4,
    EVENT_ENGINE_TICK = 5,
    EVENT_ENGINE_RENDER = 6,
    EVENT_ENGINE_ERROR = 7,
    EVENT_ENGINE_RESIZE = 8,

    /* User input events */
    EVENT_KEY_DOWN = 9,
    EVENT_KEY_UP = 10,
    EVENT_MOUSE_DOWN = 11,
    EVENT_MOUSE_UP = 12,
    EVENT_MOUSE_MOVE = 13,
    EVENT_MOUSE_WHEEL = 14,
    EVENT_TOUCH_START = 15,
    EVENT_TOUCH_MOVE = 16,
    EVENT_TOUCH_END = 17,
    EVENT_GAMEPAD_CONNECT = 18,
    EVENT_GAMEPAD_DISCONNECT = 19,
    EVENT_GAMEPAD_BUTTON = 20,
    EVENT_GAMEPAD_AXIS = 21,

    /* Scene/zone management events */
    EVENT_ZONE_LOAD = 22,
    EVENT_ZONE_READY = 23,
    EVENT_ZONE_ENTER = 24,
    EVENT_ZONE_EXIT = 25,
    EVENT_ZONE_CHANGE = 26,
    EVENT_WORLD_LOAD = 27,
    EVENT_WORLD_READY = 28,

    /* Entity lifecycle and interaction events */
    EVENT_ENTITY_SPAWN = 29,
    EVENT_ENTITY_DESTROY = 30,
    EVENT_ENTITY_MOVE = 31,
    EVENT_ENTITY_COLLIDE = 32,
    EVENT_ENTITY_INTERACT = 33,
    EVENT_SPRITE_ANIMATE = 34,
    EVENT_AVATAR_SPAWN = 35,
    EVENT_NPC_SPAWN = 36,
    EVENT_TRIGGER_ENTER = 37,
    EVENT_TRIGGER_EXIT = 38,

    /* Audio system events */
    EVENT_AUDIO_PLAY = 39,
    EVENT_AUDIO_STOP = 40,
    EVENT_AUDIO_PAUSE = 41,
    EVENT_AUDIO_RESUME = 42,
    EVENT_AUDIO_END = 43,
    EVENT_MUSIC_CHANGE = 44,
    EVENT_BPM_DETECTED = 45,

    /* Multiplayer/network events */
    EVENT_NET_CONNECT = 46,
    EVENT_NET_DISCONNECT = 47,
    EVENT_NET_RECONNECT = 48,
    EVENT_NET_ERROR = 49,
    EVENT_PLAYER_JOIN = 50,
    EVENT_PLAYER_LEAVE = 51,
    EVENT_PLAYER_UPDATE = 52,
    EVENT_CHAT_MESSAGE = 53,

    /* User interface events */
    EVENT_MENU_OPEN = 54,
    EVENT_MENU_CLOSE = 55,
    EVENT_MENU_SELECT = 56,
    EVENT_DIALOG_OPEN = 57,
    EVENT_DIALOG_CLOSE = 58,
    EVENT_DIALOG_CHOICE = 59,
    EVENT_HUD_UPDATE = 60,
    EVENT_CUTSCENE_START = 61,
    EVENT_CUTSCENE_END = 62,
    EVENT_TRANSITION_START = 63,
    EVENT_TRANSITION_END = 64,

    /* State persistence events */
    EVENT_SAVE_START = 65,
    EVENT_SAVE_COMPLETE = 66,
    EVENT_SAVE_ERROR = 67,
    EVENT_LOAD_START = 68,
    EVENT_LOAD_COMPLETE = 69,
    EVENT_LOAD_ERROR = 70,
    EVENT_CHECKPOINT = 71,
    EVENT_AUTOSAVE = 72,
    EVENT_IMPORT_SAVE = 73,

    /* Scripting system events */
    EVENT_SCRIPT_LOAD = 74,
    EVENT_SCRIPT_ERROR = 75,
    EVENT_CALLBACK_TRIGGER = 76,
    EVENT_ACTION_START = 77,
    EVENT_ACTION_END = 78,
    EVENT_FLAG_CHANGE = 79

} EventType;

#define EVENT_COUNT 80

#ifdef PIXOS_DEBUG
/* Event names for debugging */
static const char* EVENT_NAMES[EVENT_COUNT] = {
    "ENGINE_INIT",
    "ENGINE_START",
    "ENGINE_STOP",
    "ENGINE_PAUSE",
    "ENGINE_RESUME",
    "ENGINE_TICK",
    "ENGINE_RENDER",
    "ENGINE_ERROR",
    "ENGINE_RESIZE",
    "KEY_DOWN",
    "KEY_UP",
    "MOUSE_DOWN",
    "MOUSE_UP",
    "MOUSE_MOVE",
    "MOUSE_WHEEL",
    "TOUCH_START",
    "TOUCH_MOVE",
    "TOUCH_END",
    "GAMEPAD_CONNECT",
    "GAMEPAD_DISCONNECT",
    "GAMEPAD_BUTTON",
    "GAMEPAD_AXIS",
    "ZONE_LOAD",
    "ZONE_READY",
    "ZONE_ENTER",
    "ZONE_EXIT",
    "ZONE_CHANGE",
    "WORLD_LOAD",
    "WORLD_READY",
    "ENTITY_SPAWN",
    "ENTITY_DESTROY",
    "ENTITY_MOVE",
    "ENTITY_COLLIDE",
    "ENTITY_INTERACT",
    "SPRITE_ANIMATE",
    "AVATAR_SPAWN",
    "NPC_SPAWN",
    "TRIGGER_ENTER",
    "TRIGGER_EXIT",
    "AUDIO_PLAY",
    "AUDIO_STOP",
    "AUDIO_PAUSE",
    "AUDIO_RESUME",
    "AUDIO_END",
    "MUSIC_CHANGE",
    "BPM_DETECTED",
    "NET_CONNECT",
    "NET_DISCONNECT",
    "NET_RECONNECT",
    "NET_ERROR",
    "PLAYER_JOIN",
    "PLAYER_LEAVE",
    "PLAYER_UPDATE",
    "CHAT_MESSAGE",
    "MENU_OPEN",
    "MENU_CLOSE",
    "MENU_SELECT",
    "DIALOG_OPEN",
    "DIALOG_CLOSE",
    "DIALOG_CHOICE",
    "HUD_UPDATE",
    "CUTSCENE_START",
    "CUTSCENE_END",
    "TRANSITION_START",
    "TRANSITION_END",
    "SAVE_START",
    "SAVE_COMPLETE",
    "SAVE_ERROR",
    "LOAD_START",
    "LOAD_COMPLETE",
    "LOAD_ERROR",
    "CHECKPOINT",
    "AUTOSAVE",
    "IMPORT_SAVE",
    "SCRIPT_LOAD",
    "SCRIPT_ERROR",
    "CALLBACK_TRIGGER",
    "ACTION_START",
    "ACTION_END",
    "FLAG_CHANGE",
};
#endif /* PIXOS_DEBUG */

#endif /* PIXOS_GENERATED_EVENTS_H */
