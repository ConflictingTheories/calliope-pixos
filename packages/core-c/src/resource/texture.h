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

#ifndef TEXTURE_H
#define TEXTURE_H

#include <GL/glew.h>
#include <stdbool.h>

/**
 * Texture - Represents a loaded OpenGL texture.
 */
typedef struct Texture {
    GLuint id;
    int width;
    int height;
    int channels;
    bool loaded;
    char* path;
} Texture;

/**
 * Loads a texture from a file path.
 * @param path Path to the image file (PNG, JPG, etc.)
 * @return Texture struct with loaded texture data
 */
Texture texture_load(const char* path);

/**
 * Loads a texture from memory buffer.
 * @param data Pointer to image data
 * @param length Length of the data buffer
 * @return Texture struct with loaded texture data
 */
Texture texture_load_from_memory(const unsigned char* data, int length);

/**
 * Creates a texture from raw RGBA data.
 * @param pixels Pointer to RGBA pixel data
 * @param width Width of the texture
 * @param height Height of the texture
 * @return Texture struct
 */
Texture texture_create_from_data(const unsigned char* pixels, int width, int height);

/**
 * Binds a texture to a specific texture unit.
 * @param texture Pointer to the texture
 * @param unit Texture unit (0-15 typically)
 */
void texture_bind(Texture* texture, int unit);

/**
 * Unbinds the current texture.
 */
void texture_unbind(void);

/**
 * Destroys a texture and frees resources.
 * @param texture Pointer to the texture to destroy
 */
void texture_destroy(Texture* texture);

#endif // TEXTURE_H
