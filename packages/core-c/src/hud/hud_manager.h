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

#ifndef HUD_MANAGER_H
#define HUD_MANAGER_H

#include <stdbool.h>
#include "math/vector.h"
#include "math/matrix4.h"
#include "rendering/shader.h"

// Forward declarations
struct GLEngine;
struct RenderManager;

// Maximum values
#define HUD_MAX_BUTTONS 32
#define HUD_MAX_TEXTBOXES 8
#define HUD_MAX_TEXT_LENGTH 1024
#define HUD_MAX_LINES 64
#define HUD_FONT_ATLAS_SIZE 512

// ============================================
// Color Structures
// ============================================

typedef struct {
    float r, g, b, a;
} HudColor;

// Predefined colors
#define HUD_COLOR_WHITE   (HudColor){1.0f, 1.0f, 1.0f, 1.0f}
#define HUD_COLOR_BLACK   (HudColor){0.0f, 0.0f, 0.0f, 1.0f}
#define HUD_COLOR_RED     (HudColor){1.0f, 0.0f, 0.0f, 1.0f}
#define HUD_COLOR_GREEN   (HudColor){0.0f, 1.0f, 0.0f, 1.0f}
#define HUD_COLOR_BLUE    (HudColor){0.0f, 0.0f, 1.0f, 1.0f}
#define HUD_COLOR_YELLOW  (HudColor){1.0f, 1.0f, 0.0f, 1.0f}
#define HUD_COLOR_CYAN    (HudColor){0.49f, 0.83f, 0.98f, 1.0f}  // #7dd3fc
#define HUD_COLOR_DIALOGUE_BG  (HudColor){0.08f, 0.12f, 0.2f, 0.92f}

typedef struct {
    HudColor background;
    HudColor text;
    HudColor border;
    HudColor hover;
} ButtonColors;

// ============================================
// Font Glyph Information
// ============================================

typedef struct {
    float x0, y0, x1, y1;       // Texture coordinates
    float xoff, yoff;           // Offset from current position
    float xadvance;             // Advance to next character
    int width, height;          // Glyph dimensions
} FontGlyph;

typedef struct {
    unsigned int texture_id;    // OpenGL texture ID for font atlas
    FontGlyph glyphs[256];      // ASCII glyph data
    float font_size;            // Current font size
    float line_height;          // Height of a line
    float ascent;               // Ascent from baseline
    float descent;              // Descent from baseline
    bool loaded;
} FontData;

// ============================================
// Button Structure
// ============================================

typedef struct {
    float x, y;                 // Position
    float width, height;        // Size
    char text[64];              // Button text
    ButtonColors colors;        // Color scheme
    bool visible;
    bool hovered;
    bool pressed;
    int id;                     // Unique button ID for callbacks
} HudButton;

// ============================================
// TextScrollBox - Dialogue/Scrolling Text
// ============================================

typedef struct {
    float x, y;                 // Position
    float width, height;        // Size
    char text[HUD_MAX_TEXT_LENGTH];
    char lines[HUD_MAX_LINES][256];
    int line_count;
    float scroll_y;
    float max_scroll;
    
    // Style
    float font_size;
    HudColor text_color;
    HudColor background_color;
    HudColor border_color;
    float border_width;
    bool border_glow;
    
    // Typewriter effect
    bool typewriter_enabled;
    float typewriter_speed;     // Characters per second
    int typewriter_index;       // Current char index
    double typewriter_start_time;
    bool typewriter_complete;
    int total_chars;
    
    // Speaker name
    char speaker[64];
    HudColor speaker_color;
    
    // Portrait
    unsigned int portrait_texture;
    bool has_portrait;
    
    bool visible;
    bool dirty;                 // Needs re-layout
} TextScrollBox;

// ============================================
// Menu Structure
// ============================================

typedef struct {
    char title[64];
    HudButton buttons[HUD_MAX_BUTTONS];
    int button_count;
    int selected_index;
    bool visible;
    bool is_modal;              // Blocks input to rest of game
} HudMenu;

// ============================================
// HUD Manager
// ============================================

typedef struct HudManager {
    struct GLEngine* engine;
    struct RenderManager* render_manager;
    
    // Fonts
    FontData primary_font;
    FontData secondary_font;
    unsigned char* font_buffer;  // TTF file buffer
    
    // UI Shader
    Shader ui_shader;
    
    // Orthographic projection for 2D rendering
    mat4 projection_matrix;
    
    // Geometry buffers for 2D rendering
    unsigned int quad_vao;
    unsigned int quad_vbo;
    
    // Buttons
    HudButton buttons[HUD_MAX_BUTTONS];
    int button_count;
    
    // Text boxes
    TextScrollBox textboxes[HUD_MAX_TEXTBOXES];
    int textbox_count;
    
    // Active menu (e.g., main menu, pause menu)
    HudMenu* active_menu;
    HudMenu main_menu;
    HudMenu pause_menu;
    
    // Backdrop for cutscenes
    unsigned int backdrop_texture;
    bool has_backdrop;
    
    // Cutout images (character portraits in cutscenes)
    unsigned int cutout_textures[4];
    int cutout_positions[4];    // 0 = left, 1 = right
    int cutout_count;
    
    // Current dialogue state
    TextScrollBox* active_dialogue;
    
    // Mode label
    char mode_label[32];
    bool show_mode_label;
    
    // Screen dimensions (cached)
    int screen_width;
    int screen_height;
    
    // Flash effect
    bool flash_active;
    HudColor flash_color;
    float flash_duration;
    float flash_timer;
    
    // Fade effect
    bool fade_active;
    HudColor fade_color;
    float fade_duration;
    float fade_timer;
    float fade_target_alpha;
    float fade_start_alpha;
    
    bool initialized;
} HudManager;

// ============================================
// HUD Manager Functions
// ============================================

/**
 * Initialize the HUD manager
 */
int hud_manager_init(HudManager* hud, struct GLEngine* engine);

/**
 * Destroy the HUD manager and free resources
 */
void hud_manager_destroy(HudManager* hud);

/**
 * Handle window resize
 */
void hud_manager_handle_resize(HudManager* hud, int width, int height);

/**
 * Load a font from TTF file
 */
int hud_manager_load_font(HudManager* hud, FontData* font, const char* path, float size);

/**
 * Update HUD state (called each frame)
 */
void hud_manager_update(HudManager* hud, double delta_time);

/**
 * Render all HUD elements
 */
void hud_manager_render(HudManager* hud);

/**
 * Clear the HUD overlay
 */
void hud_manager_clear(HudManager* hud);

// ============================================
// Drawing Functions
// ============================================

/**
 * Draw a filled rectangle
 */
void hud_draw_rect(HudManager* hud, float x, float y, float w, float h, HudColor color);

/**
 * Draw a rectangle outline
 */
void hud_draw_rect_outline(HudManager* hud, float x, float y, float w, float h, 
                           float line_width, HudColor color);

/**
 * Draw a button with gradient effect
 */
void hud_draw_button(HudManager* hud, HudButton* button);

/**
 * Draw text at position
 */
void hud_draw_text(HudManager* hud, const char* text, float x, float y, 
                   float size, HudColor color);

/**
 * Draw text centered at position
 */
void hud_draw_text_centered(HudManager* hud, const char* text, float x, float y,
                            float size, HudColor color);

/**
 * Measure text width
 */
float hud_measure_text(HudManager* hud, const char* text, float size);

/**
 * Draw a textured quad (for portraits, backdrops)
 */
void hud_draw_textured_quad(HudManager* hud, unsigned int texture,
                            float x, float y, float w, float h, bool flip_x);

// ============================================
// TextScrollBox Functions
// ============================================

/**
 * Initialize a text scroll box
 */
void textbox_init(TextScrollBox* box, const char* text, float x, float y, 
                  float width, float height);

/**
 * Set text scroll box options
 */
void textbox_set_speaker(TextScrollBox* box, const char* speaker);
void textbox_set_portrait(TextScrollBox* box, unsigned int texture);
void textbox_set_typewriter(TextScrollBox* box, bool enabled, float speed);

/**
 * Update text scroll box (for typewriter effect)
 */
void textbox_update(TextScrollBox* box, double delta_time);

/**
 * Render text scroll box
 */
void textbox_render(HudManager* hud, TextScrollBox* box);

/**
 * Skip typewriter animation
 */
void textbox_skip_typewriter(TextScrollBox* box);

/**
 * Check if typewriter is complete
 */
bool textbox_is_complete(TextScrollBox* box);

/**
 * Scroll the text box
 */
void textbox_scroll(TextScrollBox* box, float amount);

// ============================================
// Menu Functions
// ============================================

/**
 * Initialize a menu
 */
void menu_init(HudMenu* menu, const char* title);

/**
 * Add a button to the menu
 */
int menu_add_button(HudMenu* menu, const char* text, int id);

/**
 * Navigate menu selection
 */
void menu_navigate(HudMenu* menu, int direction);

/**
 * Get currently selected button ID
 */
int menu_get_selected_id(HudMenu* menu);

/**
 * Render a menu
 */
void menu_render(HudManager* hud, HudMenu* menu);

// ============================================
// Cutscene Support Functions
// ============================================

/**
 * Set backdrop image for cutscenes
 */
void hud_set_backdrop(HudManager* hud, unsigned int texture);

/**
 * Clear backdrop
 */
void hud_clear_backdrop(HudManager* hud);

/**
 * Add cutout image (character portrait)
 */
void hud_add_cutout(HudManager* hud, unsigned int texture, int position);

/**
 * Clear all cutouts
 */
void hud_clear_cutouts(HudManager* hud);

/**
 * Draw cutscene elements (backdrop + cutouts)
 */
void hud_draw_cutscene_elements(HudManager* hud);

// ============================================
// Dialogue Functions
// ============================================

/**
 * Show dialogue with text (creates/reuses dialogue textbox)
 */
void hud_show_dialogue(HudManager* hud, const char* text, const char* speaker,
                       unsigned int portrait_texture);

/**
 * Update dialogue (typewriter, etc.)
 */
void hud_update_dialogue(HudManager* hud, double delta_time);

/**
 * Check if current dialogue is complete
 */
bool hud_is_dialogue_complete(HudManager* hud);

/**
 * Skip current dialogue animation
 */
void hud_skip_dialogue(HudManager* hud);

/**
 * Close current dialogue
 */
void hud_close_dialogue(HudManager* hud);

// ============================================
// Mode Label Functions
// ============================================

/**
 * Set the mode label (displayed in top-left)
 */
void hud_set_mode_label(HudManager* hud, const char* mode);

/**
 * Show/hide mode label
 */
void hud_show_mode_label(HudManager* hud, bool show);

#endif // HUD_MANAGER_H
