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

#include "texture.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// STB Image implementation - include only once
#define STB_IMAGE_IMPLEMENTATION
#include "stb_image.h"

Texture texture_load(const char* path) {
    Texture tex = {0};
    tex.loaded = false;
    
    // Load image using stb_image
    stbi_set_flip_vertically_on_load(1);  // OpenGL expects origin at bottom-left
    unsigned char* data = stbi_load(path, &tex.width, &tex.height, &tex.channels, 0);
    
    if (!data) {
        fprintf(stderr, "Failed to load texture: %s\n", path);
        return tex;
    }
    
    // Generate and bind texture
    glGenTextures(1, &tex.id);
    glBindTexture(GL_TEXTURE_2D, tex.id);
    
    // Set texture parameters
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    
    // Determine format based on channels
    GLenum format = GL_RGB;
    GLenum internal_format = GL_RGB;
    if (tex.channels == 4) {
        format = GL_RGBA;
        internal_format = GL_RGBA;
    } else if (tex.channels == 1) {
        format = GL_RED;
        internal_format = GL_RED;
    }
    
    // Upload texture data
    glTexImage2D(GL_TEXTURE_2D, 0, internal_format, tex.width, tex.height, 0, format, GL_UNSIGNED_BYTE, data);
    glGenerateMipmap(GL_TEXTURE_2D);
    
    // Store path
    tex.path = strdup(path);
    tex.loaded = true;
    
    // Free image data
    stbi_image_free(data);
    
    glBindTexture(GL_TEXTURE_2D, 0);
    
    printf("Texture loaded: %s (%dx%d, %d channels)\n", path, tex.width, tex.height, tex.channels);
    return tex;
}

Texture texture_load_from_memory(const unsigned char* data, int length) {
    Texture tex = {0};
    tex.loaded = false;
    
    // Load image from memory using stb_image
    stbi_set_flip_vertically_on_load(1);
    unsigned char* pixels = stbi_load_from_memory(data, length, &tex.width, &tex.height, &tex.channels, 0);
    
    if (!pixels) {
        fprintf(stderr, "Failed to load texture from memory\n");
        return tex;
    }
    
    tex = texture_create_from_data(pixels, tex.width, tex.height);
    tex.channels = tex.channels;  // Preserve original channel count
    
    stbi_image_free(pixels);
    return tex;
}

Texture texture_create_from_data(const unsigned char* pixels, int width, int height) {
    Texture tex = {0};
    tex.width = width;
    tex.height = height;
    tex.channels = 4;  // Assume RGBA
    tex.loaded = false;
    tex.path = NULL;
    
    // Generate and bind texture
    glGenTextures(1, &tex.id);
    glBindTexture(GL_TEXTURE_2D, tex.id);
    
    // Set texture parameters
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
    
    // Upload texture data
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, pixels);
    
    tex.loaded = true;
    
    glBindTexture(GL_TEXTURE_2D, 0);
    
    return tex;
}

void texture_bind(Texture* texture, int unit) {
    if (!texture || !texture->loaded) return;
    
    glActiveTexture(GL_TEXTURE0 + unit);
    glBindTexture(GL_TEXTURE_2D, texture->id);
}

void texture_unbind(void) {
    glBindTexture(GL_TEXTURE_2D, 0);
}

void texture_destroy(Texture* texture) {
    if (!texture) return;
    
    if (texture->id != 0) {
        glDeleteTextures(1, &texture->id);
        texture->id = 0;
    }
    
    if (texture->path) {
        free(texture->path);
        texture->path = NULL;
    }
    
    texture->loaded = false;
}
