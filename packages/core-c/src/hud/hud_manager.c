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

#include "hud_manager.h"
#include "../engine.h"
#include "../render_manager.h"
#include "../platform/platform.h"
#include "../rendering/gles_compat.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

// STB TrueType implementation
#define STB_TRUETYPE_IMPLEMENTATION
#include "../vendor/stb_truetype.h"

// ============================================
// Shader Sources for 2D HUD Rendering
// ============================================

static const char* HUD_VERTEX_SHADER = 
    "#version 330 core\n"
    "layout (location = 0) in vec2 aPos;\n"
    "layout (location = 1) in vec2 aTexCoord;\n"
    "out vec2 TexCoord;\n"
    "uniform mat4 uProjection;\n"
    "uniform vec2 uPosition;\n"
    "uniform vec2 uSize;\n"
    "void main() {\n"
    "    vec2 pos = aPos * uSize + uPosition;\n"
    "    gl_Position = uProjection * vec4(pos, 0.0, 1.0);\n"
    "    TexCoord = aTexCoord;\n"
    "}\n";

static const char* HUD_FRAGMENT_SHADER =
    "#version 330 core\n"
    "in vec2 TexCoord;\n"
    "out vec4 FragColor;\n"
    "uniform vec4 uColor;\n"
    "uniform sampler2D uTexture;\n"
    "uniform bool uUseTexture;\n"
    "uniform bool uIsFont;\n"
    "void main() {\n"
    "    if (uUseTexture) {\n"
    "        vec4 texColor = texture(uTexture, TexCoord);\n"
    "        if (uIsFont) {\n"
    "            FragColor = vec4(uColor.rgb, uColor.a * texColor.r);\n"
    "        } else {\n"
    "            FragColor = texColor * uColor;\n"
    "        }\n"
    "    } else {\n"
    "        FragColor = uColor;\n"
    "    }\n"
    "}\n";

// GLES 2.0 compatible shaders
static const char* HUD_VERTEX_SHADER_GLES = 
    "#version 100\n"
    "attribute vec2 aPos;\n"
    "attribute vec2 aTexCoord;\n"
    "varying vec2 vTexCoord;\n"
    "uniform mat4 uProjection;\n"
    "uniform vec2 uPosition;\n"
    "uniform vec2 uSize;\n"
    "void main() {\n"
    "    vec2 pos = aPos * uSize + uPosition;\n"
    "    gl_Position = uProjection * vec4(pos, 0.0, 1.0);\n"
    "    vTexCoord = aTexCoord;\n"
    "}\n";

static const char* HUD_FRAGMENT_SHADER_GLES =
    "#version 100\n"
    "precision mediump float;\n"
    "varying vec2 vTexCoord;\n"
    "uniform vec4 uColor;\n"
    "uniform sampler2D uTexture;\n"
    "uniform bool uUseTexture;\n"
    "uniform bool uIsFont;\n"
    "void main() {\n"
    "    if (uUseTexture) {\n"
    "        vec4 texColor = texture2D(uTexture, vTexCoord);\n"
    "        if (uIsFont) {\n"
    "            gl_FragColor = vec4(uColor.rgb, uColor.a * texColor.r);\n"
    "        } else {\n"
    "            gl_FragColor = texColor * uColor;\n"
    "        }\n"
    "    } else {\n"
    "        gl_FragColor = uColor;\n"
    "    }\n"
    "}\n";

// ============================================
// Quad Vertices (for 2D rendering)
// ============================================

static float quad_vertices[] = {
    // Position    // TexCoord
    0.0f, 0.0f,    0.0f, 0.0f,
    1.0f, 0.0f,    1.0f, 0.0f,
    1.0f, 1.0f,    1.0f, 1.0f,
    0.0f, 1.0f,    0.0f, 1.0f,
};

static unsigned int quad_indices[] = {
    0, 1, 2,
    2, 3, 0
};

// ============================================
// Helper Functions
// ============================================

static void setup_ortho_projection(mat4* proj, float width, float height) {
    // Orthographic projection: origin at top-left, y increases downward
    *proj = mat4_ortho(0.0f, width, height, 0.0f, -1.0f, 1.0f);
}

static unsigned char* load_file_to_buffer(const char* path, size_t* size) {
    FILE* file = fopen(path, "rb");
    if (!file) {
        fprintf(stderr, "Failed to open file: %s\n", path);
        return NULL;
    }
    
    fseek(file, 0, SEEK_END);
    *size = ftell(file);
    fseek(file, 0, SEEK_SET);
    
    unsigned char* buffer = (unsigned char*)malloc(*size);
    if (!buffer) {
        fclose(file);
        return NULL;
    }
    
    fread(buffer, 1, *size, file);
    fclose(file);
    
    return buffer;
}

// ============================================
// HUD Manager Implementation
// ============================================

int hud_manager_init(HudManager* hud, struct GLEngine* engine) {
    memset(hud, 0, sizeof(HudManager));
    hud->engine = engine;
    hud->render_manager = engine->render_manager;
    hud->screen_width = engine->width;
    hud->screen_height = engine->height;
    
    printf("Initializing HUD Manager...\n");
    
    // Create HUD shader
#ifdef USE_GLES
    hud->ui_shader = shader_create(HUD_VERTEX_SHADER_GLES, HUD_FRAGMENT_SHADER_GLES);
#else
    hud->ui_shader = shader_create(HUD_VERTEX_SHADER, HUD_FRAGMENT_SHADER);
#endif
    
    if (hud->ui_shader.program_id == 0) {
        fprintf(stderr, "Failed to create HUD shader\n");
        return -1;
    }
    printf("HUD shader created (ID: %u)\n", hud->ui_shader.program_id);
    
    // Setup orthographic projection
    setup_ortho_projection(&hud->projection_matrix, 
                          (float)hud->screen_width, 
                          (float)hud->screen_height);
    
    // Create quad VAO/VBO for 2D rendering
    glGenVertexArrays(1, &hud->quad_vao);
    glGenBuffers(1, &hud->quad_vbo);
    
    glBindVertexArray(hud->quad_vao);
    glBindBuffer(GL_ARRAY_BUFFER, hud->quad_vbo);
    glBufferData(GL_ARRAY_BUFFER, sizeof(quad_vertices), quad_vertices, GL_STATIC_DRAW);
    
    // Position attribute
    glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, 4 * sizeof(float), (void*)0);
    glEnableVertexAttribArray(0);
    
    // TexCoord attribute
    glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, 4 * sizeof(float), (void*)(2 * sizeof(float)));
    glEnableVertexAttribArray(1);
    
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    glBindVertexArray(0);
    
    // Initialize menus
    menu_init(&hud->main_menu, "PIXOS ENGINE");
    menu_add_button(&hud->main_menu, "Load Game", 1);
    menu_add_button(&hud->main_menu, "Settings", 2);
    menu_add_button(&hud->main_menu, "Exit", 3);
    hud->main_menu.visible = true;  // Show main menu by default
    hud->active_menu = &hud->main_menu;
    
    menu_init(&hud->pause_menu, "PAUSED");
    menu_add_button(&hud->pause_menu, "Resume", 10);
    menu_add_button(&hud->pause_menu, "Settings", 11);
    menu_add_button(&hud->pause_menu, "Main Menu", 12);
    
    hud->initialized = true;
    printf("HUD Manager initialized successfully\n");
    
    return 0;
}

void hud_manager_destroy(HudManager* hud) {
    if (!hud || !hud->initialized) return;
    
    printf("Destroying HUD Manager...\n");
    
    // Delete font textures
    if (hud->primary_font.loaded) {
        glDeleteTextures(1, &hud->primary_font.texture_id);
    }
    if (hud->secondary_font.loaded) {
        glDeleteTextures(1, &hud->secondary_font.texture_id);
    }
    
    // Free font buffer
    if (hud->font_buffer) {
        free(hud->font_buffer);
        hud->font_buffer = NULL;
    }
    
    // Delete quad VAO/VBO
    if (hud->quad_vao) {
        glDeleteVertexArrays(1, &hud->quad_vao);
    }
    if (hud->quad_vbo) {
        glDeleteBuffers(1, &hud->quad_vbo);
    }
    
    // Delete shader
    shader_destroy(&hud->ui_shader);
    
    // Delete backdrop texture
    if (hud->backdrop_texture) {
        glDeleteTextures(1, &hud->backdrop_texture);
    }
    
    // Delete cutout textures
    for (int i = 0; i < hud->cutout_count; i++) {
        if (hud->cutout_textures[i]) {
            glDeleteTextures(1, &hud->cutout_textures[i]);
        }
    }
    
    hud->initialized = false;
    printf("HUD Manager destroyed\n");
}

void hud_manager_handle_resize(HudManager* hud, int width, int height) {
    hud->screen_width = width;
    hud->screen_height = height;
    setup_ortho_projection(&hud->projection_matrix, (float)width, (float)height);
}

int hud_manager_load_font(HudManager* hud, FontData* font, const char* path, float size) {
    size_t file_size;
    unsigned char* ttf_buffer = load_file_to_buffer(path, &file_size);
    if (!ttf_buffer) {
        return -1;
    }
    
    // Store buffer for later use
    hud->font_buffer = ttf_buffer;
    
    // Initialize font
    stbtt_fontinfo font_info;
    if (!stbtt_InitFont(&font_info, ttf_buffer, stbtt_GetFontOffsetForIndex(ttf_buffer, 0))) {
        fprintf(stderr, "Failed to initialize font: %s\n", path);
        free(ttf_buffer);
        return -1;
    }
    
    // Get font metrics
    int ascent, descent, line_gap;
    stbtt_GetFontVMetrics(&font_info, &ascent, &descent, &line_gap);
    float scale = stbtt_ScaleForPixelHeight(&font_info, size);
    
    font->font_size = size;
    font->ascent = ascent * scale;
    font->descent = descent * scale;
    font->line_height = (ascent - descent + line_gap) * scale;
    
    // Create font atlas bitmap
    int atlas_size = HUD_FONT_ATLAS_SIZE;
    unsigned char* atlas = (unsigned char*)calloc(atlas_size * atlas_size, 1);
    
    // Pack glyphs into atlas
    int x = 0, y = 0;
    int row_height = 0;
    
    for (int c = 32; c < 128; c++) {
        int w, h, xoff, yoff;
        unsigned char* glyph_bitmap = stbtt_GetCodepointBitmap(
            &font_info, 0, scale, c, &w, &h, &xoff, &yoff);
        
        // Move to next row if needed
        if (x + w >= atlas_size) {
            x = 0;
            y += row_height + 1;
            row_height = 0;
        }
        
        // Check if we've run out of atlas space
        if (y + h >= atlas_size) {
            fprintf(stderr, "Font atlas too small for all glyphs\n");
            if (glyph_bitmap) stbtt_FreeBitmap(glyph_bitmap, NULL);
            break;
        }
        
        // Copy glyph to atlas
        if (glyph_bitmap) {
            for (int gy = 0; gy < h; gy++) {
                for (int gx = 0; gx < w; gx++) {
                    atlas[(y + gy) * atlas_size + (x + gx)] = glyph_bitmap[gy * w + gx];
                }
            }
            stbtt_FreeBitmap(glyph_bitmap, NULL);
        }
        
        // Store glyph info
        font->glyphs[c].x0 = (float)x / atlas_size;
        font->glyphs[c].y0 = (float)y / atlas_size;
        font->glyphs[c].x1 = (float)(x + w) / atlas_size;
        font->glyphs[c].y1 = (float)(y + h) / atlas_size;
        font->glyphs[c].xoff = xoff;
        font->glyphs[c].yoff = yoff;
        font->glyphs[c].width = w;
        font->glyphs[c].height = h;
        
        // Get advance width
        int advance, lsb;
        stbtt_GetCodepointHMetrics(&font_info, c, &advance, &lsb);
        font->glyphs[c].xadvance = advance * scale;
        
        // Update position
        x += w + 1;
        if (h > row_height) row_height = h;
    }
    
    // Create OpenGL texture
    glGenTextures(1, &font->texture_id);
    glBindTexture(GL_TEXTURE_2D, font->texture_id);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RED, atlas_size, atlas_size, 0, 
                 GL_RED, GL_UNSIGNED_BYTE, atlas);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    
    free(atlas);
    
    font->loaded = true;
    printf("Font loaded: %s (size: %.1f)\n", path, size);
    
    return 0;
}

void hud_manager_update(HudManager* hud, double delta_time) {
    if (!hud || !hud->initialized) return;
    
    // Update active dialogue
    if (hud->active_dialogue) {
        textbox_update(hud->active_dialogue, delta_time);
    }
    
    // Update textboxes
    for (int i = 0; i < hud->textbox_count; i++) {
        if (hud->textboxes[i].visible) {
            textbox_update(&hud->textboxes[i], delta_time);
        }
    }
}

void hud_manager_render(HudManager* hud) {
    if (!hud || !hud->initialized) return;
    
    // Save OpenGL state
    GLboolean depth_test_enabled;
    glGetBooleanv(GL_DEPTH_TEST, &depth_test_enabled);
    GLboolean cull_face_enabled;
    glGetBooleanv(GL_CULL_FACE, &cull_face_enabled);
    
    // Setup 2D rendering state
    glDisable(GL_DEPTH_TEST);
    glDisable(GL_CULL_FACE);
    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
    
    // Use HUD shader
    shader_use(&hud->ui_shader);
    shader_set_mat4(&hud->ui_shader, "uProjection", hud->projection_matrix.m);
    
    // Draw cutscene elements (backdrop + cutouts)
    hud_draw_cutscene_elements(hud);
    
    // Draw active menu
    if (hud->active_menu && hud->active_menu->visible) {
        menu_render(hud, hud->active_menu);
    }
    
    // Draw buttons
    for (int i = 0; i < hud->button_count; i++) {
        if (hud->buttons[i].visible) {
            hud_draw_button(hud, &hud->buttons[i]);
        }
    }
    
    // Draw textboxes
    for (int i = 0; i < hud->textbox_count; i++) {
        if (hud->textboxes[i].visible) {
            textbox_render(hud, &hud->textboxes[i]);
        }
    }
    
    // Draw active dialogue
    if (hud->active_dialogue && hud->active_dialogue->visible) {
        textbox_render(hud, hud->active_dialogue);
    }
    
    // Draw mode label
    if (hud->show_mode_label && hud->primary_font.loaded) {
        hud_draw_text(hud, hud->mode_label, 12.0f, 12.0f, 18.0f, HUD_COLOR_YELLOW);
    }
    
    // Restore OpenGL state
    if (depth_test_enabled) glEnable(GL_DEPTH_TEST);
    if (cull_face_enabled) glEnable(GL_CULL_FACE);
}

void hud_manager_clear(HudManager* hud) {
    if (!hud) return;
    // The 2D HUD is rendered on top, so "clearing" is just not rendering
    // This is a no-op since we don't use a separate framebuffer
}

// ============================================
// Drawing Functions Implementation
// ============================================

void hud_draw_rect(HudManager* hud, float x, float y, float w, float h, HudColor color) {
    shader_use(&hud->ui_shader);
    
    shader_set_vec2(&hud->ui_shader, "uPosition", x, y);
    shader_set_vec2(&hud->ui_shader, "uSize", w, h);
    shader_set_vec4(&hud->ui_shader, "uColor", color.r, color.g, color.b, color.a);
    shader_set_int(&hud->ui_shader, "uUseTexture", 0);
    shader_set_int(&hud->ui_shader, "uIsFont", 0);
    
    glBindVertexArray(hud->quad_vao);
    glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
    glBindVertexArray(0);
}

void hud_draw_rect_outline(HudManager* hud, float x, float y, float w, float h, 
                           float line_width, HudColor color) {
    // Draw four rectangles for the outline
    hud_draw_rect(hud, x, y, w, line_width, color);                    // Top
    hud_draw_rect(hud, x, y + h - line_width, w, line_width, color);   // Bottom
    hud_draw_rect(hud, x, y, line_width, h, color);                    // Left
    hud_draw_rect(hud, x + w - line_width, y, line_width, h, color);   // Right
}

void hud_draw_button(HudManager* hud, HudButton* button) {
    if (!button->visible) return;
    
    // Draw background
    hud_draw_rect(hud, button->x, button->y, button->width, button->height, 
                  button->colors.background);
    
    // Draw gradient overlay (lighter at top)
    HudColor gradient = {1.0f, 1.0f, 1.0f, button->hovered ? 0.3f : 0.15f};
    hud_draw_rect(hud, button->x, button->y, button->width, button->height / 2, gradient);
    
    // Draw border
    HudColor border_color = button->hovered ? button->colors.hover : button->colors.border;
    hud_draw_rect_outline(hud, button->x, button->y, button->width, button->height, 
                          2.0f, border_color);
    
    // Draw text (centered)
    if (hud->primary_font.loaded) {
        float text_width = hud_measure_text(hud, button->text, 20.0f);
        float text_x = button->x + (button->width - text_width) / 2;
        float text_y = button->y + (button->height - 20.0f) / 2;
        hud_draw_text(hud, button->text, text_x, text_y, 20.0f, button->colors.text);
    }
}

void hud_draw_text(HudManager* hud, const char* text, float x, float y, 
                   float size, HudColor color) {
    if (!hud->primary_font.loaded) return;
    
    FontData* font = &hud->primary_font;
    float scale = size / font->font_size;
    
    shader_use(&hud->ui_shader);
    shader_set_vec4(&hud->ui_shader, "uColor", color.r, color.g, color.b, color.a);
    shader_set_int(&hud->ui_shader, "uUseTexture", 1);
    shader_set_int(&hud->ui_shader, "uIsFont", 1);
    
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, font->texture_id);
    shader_set_int(&hud->ui_shader, "uTexture", 0);
    
    float cursor_x = x;
    float cursor_y = y + font->ascent * scale;
    
    glBindVertexArray(hud->quad_vao);
    
    for (const char* p = text; *p; p++) {
        unsigned char c = *p;
        if (c < 32 || c >= 128) continue;
        
        FontGlyph* g = &font->glyphs[c];
        
        float glyph_x = cursor_x + g->xoff * scale;
        float glyph_y = cursor_y + g->yoff * scale;
        float glyph_w = g->width * scale;
        float glyph_h = g->height * scale;
        
        // Update quad vertices for this glyph
        float vertices[] = {
            0.0f, 0.0f, g->x0, g->y0,
            1.0f, 0.0f, g->x1, g->y0,
            1.0f, 1.0f, g->x1, g->y1,
            0.0f, 1.0f, g->x0, g->y1,
        };
        
        glBindBuffer(GL_ARRAY_BUFFER, hud->quad_vbo);
        glBufferSubData(GL_ARRAY_BUFFER, 0, sizeof(vertices), vertices);
        
        shader_set_vec2(&hud->ui_shader, "uPosition", glyph_x, glyph_y);
        shader_set_vec2(&hud->ui_shader, "uSize", glyph_w, glyph_h);
        
        glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
        
        cursor_x += g->xadvance * scale;
    }
    
    // Restore original quad vertices
    glBindBuffer(GL_ARRAY_BUFFER, hud->quad_vbo);
    glBufferSubData(GL_ARRAY_BUFFER, 0, sizeof(quad_vertices), quad_vertices);
    
    glBindVertexArray(0);
}

void hud_draw_text_centered(HudManager* hud, const char* text, float x, float y,
                            float size, HudColor color) {
    float width = hud_measure_text(hud, text, size);
    hud_draw_text(hud, text, x - width / 2, y, size, color);
}

float hud_measure_text(HudManager* hud, const char* text, float size) {
    if (!hud->primary_font.loaded) return 0.0f;
    
    FontData* font = &hud->primary_font;
    float scale = size / font->font_size;
    float width = 0.0f;
    
    for (const char* p = text; *p; p++) {
        unsigned char c = *p;
        if (c < 32 || c >= 128) continue;
        width += font->glyphs[c].xadvance * scale;
    }
    
    return width;
}

void hud_draw_textured_quad(HudManager* hud, unsigned int texture,
                            float x, float y, float w, float h, bool flip_x) {
    shader_use(&hud->ui_shader);
    
    shader_set_vec2(&hud->ui_shader, "uPosition", x, y);
    shader_set_vec2(&hud->ui_shader, "uSize", flip_x ? -w : w, h);
    shader_set_vec4(&hud->ui_shader, "uColor", 1.0f, 1.0f, 1.0f, 1.0f);
    shader_set_int(&hud->ui_shader, "uUseTexture", 1);
    shader_set_int(&hud->ui_shader, "uIsFont", 0);
    
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, texture);
    shader_set_int(&hud->ui_shader, "uTexture", 0);
    
    glBindVertexArray(hud->quad_vao);
    glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
    glBindVertexArray(0);
}

// ============================================
// TextScrollBox Implementation
// ============================================

void textbox_init(TextScrollBox* box, const char* text, float x, float y, 
                  float width, float height) {
    memset(box, 0, sizeof(TextScrollBox));
    
    if (text) {
        strncpy(box->text, text, HUD_MAX_TEXT_LENGTH - 1);
    }
    
    box->x = x;
    box->y = y;
    box->width = width;
    box->height = height;
    
    // Default style
    box->font_size = 24.0f;
    box->text_color = HUD_COLOR_WHITE;
    box->background_color = HUD_COLOR_DIALOGUE_BG;
    box->border_color = HUD_COLOR_CYAN;
    box->border_width = 3.0f;
    box->border_glow = true;
    
    // Typewriter defaults
    box->typewriter_enabled = true;
    box->typewriter_speed = 30.0f;  // 30 chars per second
    box->typewriter_index = 0;
    box->typewriter_start_time = 0.0;
    box->typewriter_complete = false;
    
    box->speaker_color = HUD_COLOR_CYAN;
    box->visible = true;
    box->dirty = true;
}

void textbox_set_speaker(TextScrollBox* box, const char* speaker) {
    if (speaker) {
        strncpy(box->speaker, speaker, 63);
    } else {
        box->speaker[0] = '\0';
    }
}

void textbox_set_portrait(TextScrollBox* box, unsigned int texture) {
    box->portrait_texture = texture;
    box->has_portrait = (texture != 0);
}

void textbox_set_typewriter(TextScrollBox* box, bool enabled, float speed) {
    box->typewriter_enabled = enabled;
    box->typewriter_speed = speed;
}

static void textbox_reflow(HudManager* hud, TextScrollBox* box) {
    if (!hud->primary_font.loaded) return;
    
    float max_width = box->width - 20.0f;  // Padding
    if (box->has_portrait) max_width -= 84.0f;
    
    // Simple word wrapping
    box->line_count = 0;
    box->total_chars = 0;
    
    char* text = box->text;
    char line[256] = {0};
    int line_pos = 0;
    
    char* word_start = text;
    char* p = text;
    
    while (*p && box->line_count < HUD_MAX_LINES) {
        // Find next word
        while (*p && *p != ' ' && *p != '\n') p++;
        
        // Measure current line + word
        int word_len = p - word_start;
        char temp[256];
        strncpy(temp, line, sizeof(temp) - 1);
        if (line_pos > 0) {
            strncat(temp, " ", sizeof(temp) - strlen(temp) - 1);
        }
        strncat(temp, word_start, word_len < 250 ? word_len : 250);
        
        float width = hud_measure_text(hud, temp, box->font_size);
        
        if (width < max_width || line_pos == 0) {
            // Word fits on current line
            if (line_pos > 0) {
                strcat(line, " ");
                line_pos++;
            }
            strncat(line, word_start, word_len);
            line_pos += word_len;
        } else {
            // Start new line
            strcpy(box->lines[box->line_count], line);
            box->total_chars += strlen(line);
            box->line_count++;
            
            // Start new line with current word
            strncpy(line, word_start, word_len);
            line[word_len] = '\0';
            line_pos = word_len;
        }
        
        // Handle newlines
        if (*p == '\n') {
            strcpy(box->lines[box->line_count], line);
            box->total_chars += strlen(line);
            box->line_count++;
            line[0] = '\0';
            line_pos = 0;
        }
        
        // Skip whitespace
        while (*p == ' ' || *p == '\n') p++;
        word_start = p;
    }
    
    // Add final line
    if (line_pos > 0 && box->line_count < HUD_MAX_LINES) {
        strcpy(box->lines[box->line_count], line);
        box->total_chars += strlen(line);
        box->line_count++;
    }
    
    box->max_scroll = (box->line_count * (box->font_size * 1.25f)) - box->height;
    if (box->max_scroll < 0) box->max_scroll = 0;
    
    box->dirty = false;
}

void textbox_update(TextScrollBox* box, double delta_time) {
    if (!box->typewriter_enabled || box->typewriter_complete) return;
    
    // Update typewriter index based on elapsed time
    double elapsed = box->typewriter_start_time;  // This should be accumulated
    box->typewriter_start_time += delta_time;
    
    int chars_to_show = (int)(box->typewriter_start_time * box->typewriter_speed);
    box->typewriter_index = chars_to_show;
    
    if (box->typewriter_index >= box->total_chars) {
        box->typewriter_complete = true;
        box->typewriter_index = box->total_chars;
    }
}

void textbox_render(HudManager* hud, TextScrollBox* box) {
    if (!box->visible) return;
    
    // Reflow if needed
    if (box->dirty) {
        textbox_reflow(hud, box);
    }
    
    float box_x = box->x;
    float box_width = box->width;
    
    if (box->has_portrait) {
        box_x += 84.0f;
        box_width -= 84.0f;
        
        // Draw portrait frame and image
        hud_draw_rect_outline(hud, box->x, box->y + 36.0f, 80.0f, 80.0f, 2.0f, box->border_color);
        if (box->portrait_texture) {
            hud_draw_textured_quad(hud, box->portrait_texture, 
                                   box->x + 2.0f, box->y + 38.0f, 76.0f, 76.0f, false);
        }
    }
    
    // Draw speaker name
    if (box->speaker[0] != '\0') {
        float name_x = box->has_portrait ? box->x + 90.0f : box->x + 10.0f;
        float name_y = box->y - 28.0f;
        float name_width = hud_measure_text(hud, box->speaker, 18.0f) + 20.0f;
        
        // Name background
        hud_draw_rect(hud, name_x - 10.0f, name_y - 6.0f, name_width, 26.0f, 
                      (HudColor){0.08f, 0.12f, 0.2f, 0.95f});
        hud_draw_rect_outline(hud, name_x - 10.0f, name_y - 6.0f, name_width, 26.0f, 
                              2.0f, box->speaker_color);
        
        // Name text
        hud_draw_text(hud, box->speaker, name_x, name_y, 18.0f, box->speaker_color);
    }
    
    // Draw background
    hud_draw_rect(hud, box_x, box->y, box_width, box->height, box->background_color);
    
    // Draw border
    hud_draw_rect_outline(hud, box_x, box->y, box_width, box->height, 
                          box->border_width, box->border_color);
    
    // Draw text with typewriter effect
    float text_x = box_x + 10.0f;
    float text_y = box->y + 10.0f - box->scroll_y;
    float line_height = box->font_size * 1.25f;
    
    int chars_shown = 0;
    int chars_to_show = box->typewriter_enabled ? box->typewriter_index : box->total_chars;
    
    for (int i = 0; i < box->line_count && chars_shown < chars_to_show; i++) {
        const char* line = box->lines[i];
        int line_len = strlen(line);
        int remaining = chars_to_show - chars_shown;
        
        if (remaining >= line_len) {
            // Show full line
            hud_draw_text(hud, line, text_x, text_y, box->font_size, box->text_color);
            chars_shown += line_len;
        } else {
            // Partial line (typewriter effect)
            char partial[256];
            strncpy(partial, line, remaining);
            partial[remaining] = '\0';
            hud_draw_text(hud, partial, text_x, text_y, box->font_size, box->text_color);
            
            // Draw cursor
            float cursor_x = text_x + hud_measure_text(hud, partial, box->font_size) + 2.0f;
            hud_draw_rect(hud, cursor_x, text_y, 2.0f, box->font_size, box->speaker_color);
            
            chars_shown += remaining;
            break;
        }
        
        text_y += line_height;
    }
}

void textbox_skip_typewriter(TextScrollBox* box) {
    box->typewriter_complete = true;
    box->typewriter_index = box->total_chars;
}

bool textbox_is_complete(TextScrollBox* box) {
    return box->typewriter_complete || !box->typewriter_enabled;
}

void textbox_scroll(TextScrollBox* box, float amount) {
    box->scroll_y += amount;
    if (box->scroll_y < 0) box->scroll_y = 0;
    if (box->scroll_y > box->max_scroll) box->scroll_y = box->max_scroll;
}

// ============================================
// Menu Implementation
// ============================================

void menu_init(HudMenu* menu, const char* title) {
    memset(menu, 0, sizeof(HudMenu));
    if (title) {
        strncpy(menu->title, title, 63);
    }
    menu->selected_index = 0;
    menu->visible = false;
    menu->is_modal = true;
}

int menu_add_button(HudMenu* menu, const char* text, int id) {
    if (menu->button_count >= HUD_MAX_BUTTONS) return -1;
    
    HudButton* btn = &menu->buttons[menu->button_count];
    memset(btn, 0, sizeof(HudButton));
    
    strncpy(btn->text, text, 63);
    btn->id = id;
    btn->visible = true;
    
    // Default colors
    btn->colors.background = (HudColor){0.1f, 0.15f, 0.25f, 0.9f};
    btn->colors.text = HUD_COLOR_WHITE;
    btn->colors.border = HUD_COLOR_CYAN;
    btn->colors.hover = HUD_COLOR_YELLOW;
    
    menu->button_count++;
    return menu->button_count - 1;
}

void menu_navigate(HudMenu* menu, int direction) {
    if (menu->button_count == 0) return;
    
    menu->buttons[menu->selected_index].hovered = false;
    
    menu->selected_index += direction;
    if (menu->selected_index < 0) {
        menu->selected_index = menu->button_count - 1;
    } else if (menu->selected_index >= menu->button_count) {
        menu->selected_index = 0;
    }
    
    menu->buttons[menu->selected_index].hovered = true;
}

int menu_get_selected_id(HudMenu* menu) {
    if (menu->button_count == 0 || menu->selected_index < 0) return -1;
    return menu->buttons[menu->selected_index].id;
}

void menu_render(HudManager* hud, HudMenu* menu) {
    if (!menu->visible) return;
    
    float screen_w = (float)hud->screen_width;
    float screen_h = (float)hud->screen_height;
    
    // Draw semi-transparent backdrop
    hud_draw_rect(hud, 0, 0, screen_w, screen_h, (HudColor){0.0f, 0.0f, 0.0f, 0.7f});
    
    // Calculate menu dimensions
    float btn_width = 250.0f;
    float btn_height = 50.0f;
    float btn_spacing = 10.0f;
    float menu_height = menu->button_count * (btn_height + btn_spacing) + 80.0f;
    
    float menu_x = (screen_w - btn_width) / 2;
    float menu_y = (screen_h - menu_height) / 2;
    
    // Draw title
    if (menu->title[0] != '\0' && hud->primary_font.loaded) {
        hud_draw_text_centered(hud, menu->title, screen_w / 2, menu_y, 32.0f, HUD_COLOR_CYAN);
        menu_y += 60.0f;
    }
    
    // Update button positions and highlight
    for (int i = 0; i < menu->button_count; i++) {
        HudButton* btn = &menu->buttons[i];
        btn->x = menu_x;
        btn->y = menu_y + i * (btn_height + btn_spacing);
        btn->width = btn_width;
        btn->height = btn_height;
        btn->hovered = (i == menu->selected_index);
        
        hud_draw_button(hud, btn);
    }
}

// ============================================
// Cutscene Support Implementation
// ============================================

void hud_set_backdrop(HudManager* hud, unsigned int texture) {
    hud->backdrop_texture = texture;
    hud->has_backdrop = (texture != 0);
}

void hud_clear_backdrop(HudManager* hud) {
    hud->backdrop_texture = 0;
    hud->has_backdrop = false;
}

void hud_add_cutout(HudManager* hud, unsigned int texture, int position) {
    if (hud->cutout_count >= 4) return;
    
    hud->cutout_textures[hud->cutout_count] = texture;
    hud->cutout_positions[hud->cutout_count] = position;
    hud->cutout_count++;
}

void hud_clear_cutouts(HudManager* hud) {
    hud->cutout_count = 0;
    for (int i = 0; i < 4; i++) {
        hud->cutout_textures[i] = 0;
        hud->cutout_positions[i] = 0;
    }
}

void hud_draw_cutscene_elements(HudManager* hud) {
    float screen_w = (float)hud->screen_width;
    float screen_h = (float)hud->screen_height;
    
    // Draw backdrop
    if (hud->has_backdrop && hud->backdrop_texture) {
        hud_draw_textured_quad(hud, hud->backdrop_texture, 0, 0, screen_w, screen_h, false);
    }
    
    // Draw cutouts
    float cutout_size = 200.0f;
    for (int i = 0; i < hud->cutout_count; i++) {
        if (hud->cutout_textures[i] == 0) continue;
        
        float x, y;
        bool flip = false;
        
        if (hud->cutout_positions[i] == 0) {
            // Left
            x = 50.0f;
            y = screen_h / 2 - cutout_size / 2;
        } else {
            // Right (mirrored)
            x = screen_w - 50.0f - cutout_size;
            y = screen_h / 2 - cutout_size / 2;
            flip = true;
        }
        
        hud_draw_textured_quad(hud, hud->cutout_textures[i], x, y, 
                               cutout_size, cutout_size, flip);
    }
}

// ============================================
// Dialogue Functions Implementation
// ============================================

void hud_show_dialogue(HudManager* hud, const char* text, const char* speaker,
                       unsigned int portrait_texture) {
    // Use the first textbox slot for dialogue
    TextScrollBox* box = &hud->textboxes[0];
    
    float screen_h = (float)hud->screen_height;
    float screen_w = (float)hud->screen_width;
    
    textbox_init(box, text, 10.0f, (2.0f * screen_h) / 3.0f, 
                 screen_w - 20.0f, screen_h / 3.0f - 20.0f);
    
    if (speaker) {
        textbox_set_speaker(box, speaker);
    }
    
    if (portrait_texture) {
        textbox_set_portrait(box, portrait_texture);
    }
    
    box->typewriter_start_time = 0.0;
    box->visible = true;
    hud->active_dialogue = box;
}

void hud_update_dialogue(HudManager* hud, double delta_time) {
    if (hud->active_dialogue) {
        textbox_update(hud->active_dialogue, delta_time);
    }
}

bool hud_is_dialogue_complete(HudManager* hud) {
    if (!hud->active_dialogue) return true;
    return textbox_is_complete(hud->active_dialogue);
}

void hud_skip_dialogue(HudManager* hud) {
    if (hud->active_dialogue) {
        textbox_skip_typewriter(hud->active_dialogue);
    }
}

void hud_close_dialogue(HudManager* hud) {
    if (hud->active_dialogue) {
        hud->active_dialogue->visible = false;
        hud->active_dialogue = NULL;
    }
}

// ============================================
// Mode Label Functions Implementation
// ============================================

void hud_set_mode_label(HudManager* hud, const char* mode) {
    snprintf(hud->mode_label, sizeof(hud->mode_label), "MODE: %s", mode ? mode : "");
}

void hud_show_mode_label(HudManager* hud, bool show) {
    hud->show_mode_label = show;
}
