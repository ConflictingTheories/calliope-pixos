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

#ifndef GLES_COMPAT_H
#define GLES_COMPAT_H

/* OpenGL / OpenGL ES compatibility layer */
/* This header normalizes differences between desktop GL and GLES */

#include <stdio.h>
#include "platform/platform.h"

#ifdef USE_GLES
    /* OpenGL ES 2.0/3.0 */
    #include <GLES2/gl2.h>
    #include <GLES2/gl2ext.h>
    
    #ifdef USE_GLES3
        #include <GLES3/gl3.h>
    #endif
    
    /* GLES doesn't have these - provide stubs or alternatives */
    #define GL_CLAMP_TO_BORDER GL_CLAMP_TO_EDGE
    
    /* VAO extensions (available in GLES3 or via extension) */
    #ifdef USE_GLES3
        #define glGenVertexArrays glGenVertexArrays
        #define glBindVertexArray glBindVertexArray
        #define glDeleteVertexArrays glDeleteVertexArrays
    #else
        /* Use OES extension for GLES2 */
        #ifdef GL_OES_vertex_array_object
            #define glGenVertexArrays glGenVertexArraysOES
            #define glBindVertexArray glBindVertexArrayOES
            #define glDeleteVertexArrays glDeleteVertexArraysOES
        #else
            /* Fallback: No VAO support - manage VBOs directly */
            #define PIXOS_NO_VAO 1
            static inline void glGenVertexArrays(GLsizei n, GLuint* arrays) { (void)n; (void)arrays; }
            static inline void glBindVertexArray(GLuint array) { (void)array; }
            static inline void glDeleteVertexArrays(GLsizei n, const GLuint* arrays) { (void)n; (void)arrays; }
        #endif
    #endif
    
#else
    /* Desktop OpenGL */
    #include <GL/glew.h>
#endif

/* Common OpenGL type definitions */
typedef GLuint PixosShaderProgram;
typedef GLuint PixosBuffer;
typedef GLuint PixosTexture;
typedef GLuint PixosFramebuffer;
typedef GLuint PixosVertexArray;

/* Shader version strings */
#ifdef USE_GLES
    #ifdef USE_GLES3
        #define PIXOS_SHADER_VERSION "#version 300 es\n"
        #define PIXOS_SHADER_PRECISION "precision highp float;\nprecision highp int;\n"
        /* GLES3 uses in/out instead of attribute/varying */
        #define PIXOS_IN "in"
        #define PIXOS_OUT "out"
        #define PIXOS_VARYING_IN "in"
        #define PIXOS_VARYING_OUT "out"
        #define PIXOS_FRAG_COLOR "fragColor"
        #define PIXOS_DECLARE_FRAG_COLOR "out vec4 fragColor;\n"
        #define PIXOS_TEXTURE "texture"
    #else
        #define PIXOS_SHADER_VERSION "#version 100\n"
        #define PIXOS_SHADER_PRECISION "precision mediump float;\n"
        /* GLES2 uses attribute/varying */
        #define PIXOS_IN "attribute"
        #define PIXOS_OUT "varying"
        #define PIXOS_VARYING_IN "varying"
        #define PIXOS_VARYING_OUT "varying"
        #define PIXOS_FRAG_COLOR "gl_FragColor"
        #define PIXOS_DECLARE_FRAG_COLOR ""
        #define PIXOS_TEXTURE "texture2D"
    #endif
#else
    #define PIXOS_SHADER_VERSION "#version 330 core\n"
    #define PIXOS_SHADER_PRECISION ""
    #define PIXOS_IN "in"
    #define PIXOS_OUT "out"
    #define PIXOS_VARYING_IN "in"
    #define PIXOS_VARYING_OUT "out"
    #define PIXOS_FRAG_COLOR "fragColor"
    #define PIXOS_DECLARE_FRAG_COLOR "out vec4 fragColor;\n"
    #define PIXOS_TEXTURE "texture"
#endif

/* Helper macros for shader source generation */
#define PIXOS_VERTEX_HEADER PIXOS_SHADER_VERSION PIXOS_SHADER_PRECISION
#define PIXOS_FRAGMENT_HEADER PIXOS_SHADER_VERSION PIXOS_SHADER_PRECISION PIXOS_DECLARE_FRAG_COLOR

/* Attribute location binding (for portability) */
#define PIXOS_ATTRIB_POSITION 0
#define PIXOS_ATTRIB_NORMAL 1
#define PIXOS_ATTRIB_TEXCOORD 2
#define PIXOS_ATTRIB_COLOR 3

/* Check for GL errors (debug helper) */
static inline void pixos_check_gl_error(const char* op) {
#ifndef NDEBUG
    GLenum error;
    while ((error = glGetError()) != GL_NO_ERROR) {
        const char* msg = "Unknown";
        switch (error) {
            case GL_INVALID_ENUM: msg = "GL_INVALID_ENUM"; break;
            case GL_INVALID_VALUE: msg = "GL_INVALID_VALUE"; break;
            case GL_INVALID_OPERATION: msg = "GL_INVALID_OPERATION"; break;
            case GL_OUT_OF_MEMORY: msg = "GL_OUT_OF_MEMORY"; break;
#ifdef GL_INVALID_FRAMEBUFFER_OPERATION
            case GL_INVALID_FRAMEBUFFER_OPERATION: msg = "GL_INVALID_FRAMEBUFFER_OPERATION"; break;
#endif
        }
        fprintf(stderr, "OpenGL error after %s: %s (0x%04X)\n", op, msg, error);
    }
#else
    (void)op;
#endif
}

#endif /* GLES_COMPAT_H */
