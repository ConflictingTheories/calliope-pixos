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

#ifndef SHADERS_GLES_H
#define SHADERS_GLES_H

/* 
 * OpenGL ES 2.0/3.0 compatible shaders
 * These shaders work on ARM devices with Mali GPUs (RG353V, etc.)
 * 
 * Key differences from desktop OpenGL 3.3:
 * - Use precision qualifiers for floats
 * - GLES2: attribute/varying instead of in/out
 * - GLES2: gl_FragColor instead of custom output
 * - GLES2: texture2D() instead of texture()
 * - Limited number of varying variables
 * - No geometry shaders
 */

/* ============================================
 * MAIN VERTEX SHADER (Lit + Textured)
 * ============================================ */
static const char* MAIN_VERTEX_SHADER_GLES =
#ifdef USE_GLES3
    "#version 300 es\n"
    "precision highp float;\n"
    "\n"
    "layout (location = 0) in vec3 aVertexPosition;\n"
    "layout (location = 1) in vec3 aVertexNormal;\n"
    "layout (location = 2) in vec2 aTextureCoord;\n"
#else
    "#version 100\n"
    "precision mediump float;\n"
    "\n"
    "attribute vec3 aVertexPosition;\n"
    "attribute vec3 aVertexNormal;\n"
    "attribute vec2 aTextureCoord;\n"
#endif
    "\n"
    "uniform mat4 uModelMatrix;\n"
    "uniform mat4 uViewMatrix;\n"
    "uniform mat4 uProjectionMatrix;\n"
    "uniform vec3 uCameraPosition;\n"
    "uniform vec3 uScale;\n"
    "\n"
#ifdef USE_GLES3
    "out vec3 vFragPos;\n"
    "out vec3 vWorldNormal;\n"
    "out vec2 vTextureCoord;\n"
    "out vec3 vViewDir;\n"
#else
    "varying vec3 vFragPos;\n"
    "varying vec3 vWorldNormal;\n"
    "varying vec2 vTextureCoord;\n"
    "varying vec3 vViewDir;\n"
#endif
    "\n"
    "void main() {\n"
    "    vec3 scaledPosition = aVertexPosition * uScale;\n"
    "    vec4 worldPos = uModelMatrix * vec4(scaledPosition, 1.0);\n"
    "    vFragPos = vec3(worldPos);\n"
    "    vTextureCoord = aTextureCoord;\n"
    "    // Compute normal matrix inline (transpose of inverse)\n"
    "    mat3 normalMatrix = mat3(uModelMatrix);\n"
    "    vWorldNormal = normalize(normalMatrix * aVertexNormal);\n"
    "    vViewDir = normalize(uCameraPosition - vFragPos);\n"
    "    gl_Position = uProjectionMatrix * uViewMatrix * worldPos;\n"
    "}\n";

/* ============================================
 * MAIN FRAGMENT SHADER (Lit + Textured)
 * ============================================ */
static const char* MAIN_FRAGMENT_SHADER_GLES =
#ifdef USE_GLES3
    "#version 300 es\n"
    "precision highp float;\n"
    "\n"
    "in vec3 vFragPos;\n"
    "in vec3 vWorldNormal;\n"
    "in vec2 vTextureCoord;\n"
    "in vec3 vViewDir;\n"
    "\n"
    "out vec4 fragColor;\n"
#else
    "#version 100\n"
    "precision mediump float;\n"
    "\n"
    "varying vec3 vFragPos;\n"
    "varying vec3 vWorldNormal;\n"
    "varying vec2 vTextureCoord;\n"
    "varying vec3 vViewDir;\n"
#endif
    "\n"
    /* Light structure - reduced for mobile */
    "#define MAX_LIGHTS 8\n"
    "\n"
    "uniform vec3 uLightPositions[MAX_LIGHTS];\n"
    "uniform vec3 uLightColors[MAX_LIGHTS];\n"
    "uniform vec3 uLightAttenuations[MAX_LIGHTS];\n"
    "uniform int uLightCount;\n"
    "\n"
    "uniform sampler2D uSampler;\n"
    "uniform bool uUseSampler;\n"
    "uniform vec3 uDiffuseColor;\n"
    "uniform vec4 uColorMultiplier;\n"
    "uniform bool uIsSelected;\n"
    "uniform float uAmbientStrength;\n"
    "\n"
    "float getAttenuation(int lightIndex) {\n"
    "    vec3 toLight = uLightPositions[lightIndex] - vFragPos;\n"
    "    float distance = length(toLight);\n"
    "    vec3 atten = uLightAttenuations[lightIndex];\n"
    "    return 1.0 / (1.0 + atten.x + atten.y * distance + atten.z * distance * distance);\n"
    "}\n"
    "\n"
    "vec3 calculateLighting(vec3 baseColor) {\n"
    "    vec3 ambient = uAmbientStrength * baseColor;\n"
    "    vec3 result = ambient;\n"
    "    vec3 normal = normalize(vWorldNormal);\n"
    "    \n"
    "    for (int i = 0; i < MAX_LIGHTS; i++) {\n"
    "        if (i >= uLightCount) break;\n"
    "        \n"
    "        vec3 lightDir = normalize(uLightPositions[i] - vFragPos);\n"
    "        float diff = max(dot(normal, lightDir), 0.0);\n"
    "        vec3 diffuse = diff * uLightColors[i];\n"
    "        \n"
    "        // Specular (Blinn-Phong)\n"
    "        vec3 halfDir = normalize(lightDir + vViewDir);\n"
    "        float spec = pow(max(dot(normal, halfDir), 0.0), 32.0);\n"
    "        vec3 specular = 0.3 * spec * uLightColors[i];\n"
    "        \n"
    "        float attenuation = getAttenuation(i);\n"
    "        result += attenuation * (diffuse + specular) * baseColor;\n"
    "    }\n"
    "    \n"
    "    return clamp(result, 0.0, 1.0);\n"
    "}\n"
    "\n"
    "void main() {\n"
    "    vec4 baseColor;\n"
    "    \n"
    "    if (uUseSampler) {\n"
#ifdef USE_GLES3
    "        baseColor = texture(uSampler, vTextureCoord);\n"
#else
    "        baseColor = texture2D(uSampler, vTextureCoord);\n"
#endif
    "        if (baseColor.a < 0.1) discard;\n"
    "    } else {\n"
    "        baseColor = vec4(uDiffuseColor, 1.0);\n"
    "    }\n"
    "    \n"
    "    vec3 litColor = calculateLighting(baseColor.rgb);\n"
    "    litColor *= uColorMultiplier.rgb;\n"
    "    \n"
    "    if (uIsSelected) {\n"
    "        litColor = mix(litColor, vec3(1.0, 1.0, 0.0), 0.3);\n"
    "    }\n"
    "    \n"
#ifdef USE_GLES3
    "    fragColor = vec4(litColor, baseColor.a * uColorMultiplier.a);\n"
#else
    "    gl_FragColor = vec4(litColor, baseColor.a * uColorMultiplier.a);\n"
#endif
    "}\n";

/* ============================================
 * SPRITE VERTEX SHADER (Billboarded)
 * ============================================ */
static const char* SPRITE_VERTEX_SHADER_GLES =
#ifdef USE_GLES3
    "#version 300 es\n"
    "precision highp float;\n"
    "\n"
    "layout (location = 0) in vec3 aVertexPosition;\n"
    "layout (location = 2) in vec2 aTextureCoord;\n"
    "\n"
    "out vec2 vTextureCoord;\n"
    "out vec3 vFragPos;\n"
#else
    "#version 100\n"
    "precision mediump float;\n"
    "\n"
    "attribute vec3 aVertexPosition;\n"
    "attribute vec2 aTextureCoord;\n"
    "\n"
    "varying vec2 vTextureCoord;\n"
    "varying vec3 vFragPos;\n"
#endif
    "\n"
    "uniform mat4 uModelMatrix;\n"
    "uniform mat4 uViewMatrix;\n"
    "uniform mat4 uProjectionMatrix;\n"
    "uniform vec3 uScale;\n"
    "uniform bool uBillboard;\n"
    "\n"
    "void main() {\n"
    "    vec3 scaledPosition = aVertexPosition * uScale;\n"
    "    \n"
    "    if (uBillboard) {\n"
    "        // Extract camera right and up vectors from view matrix\n"
    "        vec3 right = vec3(uViewMatrix[0][0], uViewMatrix[1][0], uViewMatrix[2][0]);\n"
    "        vec3 up = vec3(uViewMatrix[0][1], uViewMatrix[1][1], uViewMatrix[2][1]);\n"
    "        \n"
    "        // Get world position from model matrix\n"
    "        vec3 worldCenter = vec3(uModelMatrix[3]);\n"
    "        \n"
    "        // Billboard position\n"
    "        vec3 worldPos = worldCenter + right * scaledPosition.x + up * scaledPosition.y;\n"
    "        vFragPos = worldPos;\n"
    "        gl_Position = uProjectionMatrix * uViewMatrix * vec4(worldPos, 1.0);\n"
    "    } else {\n"
    "        vec4 worldPos = uModelMatrix * vec4(scaledPosition, 1.0);\n"
    "        vFragPos = vec3(worldPos);\n"
    "        gl_Position = uProjectionMatrix * uViewMatrix * worldPos;\n"
    "    }\n"
    "    \n"
    "    vTextureCoord = aTextureCoord;\n"
    "}\n";

/* ============================================
 * SPRITE FRAGMENT SHADER
 * ============================================ */
static const char* SPRITE_FRAGMENT_SHADER_GLES =
#ifdef USE_GLES3
    "#version 300 es\n"
    "precision highp float;\n"
    "\n"
    "in vec2 vTextureCoord;\n"
    "in vec3 vFragPos;\n"
    "\n"
    "out vec4 fragColor;\n"
#else
    "#version 100\n"
    "precision mediump float;\n"
    "\n"
    "varying vec2 vTextureCoord;\n"
    "varying vec3 vFragPos;\n"
#endif
    "\n"
    "uniform sampler2D uSampler;\n"
    "uniform vec4 uColorMultiplier;\n"
    "uniform bool uIsSelected;\n"
    "uniform float uAmbientStrength;\n"
    "\n"
    "void main() {\n"
#ifdef USE_GLES3
    "    vec4 texColor = texture(uSampler, vTextureCoord);\n"
#else
    "    vec4 texColor = texture2D(uSampler, vTextureCoord);\n"
#endif
    "    if (texColor.a < 0.1) discard;\n"
    "    \n"
    "    vec3 color = texColor.rgb * uColorMultiplier.rgb;\n"
    "    \n"
    "    // Apply ambient\n"
    "    color = color * (uAmbientStrength + (1.0 - uAmbientStrength) * 0.5);\n"
    "    \n"
    "    if (uIsSelected) {\n"
    "        color = mix(color, vec3(1.0, 1.0, 0.0), 0.3);\n"
    "    }\n"
    "    \n"
#ifdef USE_GLES3
    "    fragColor = vec4(color, texColor.a * uColorMultiplier.a);\n"
#else
    "    gl_FragColor = vec4(color, texColor.a * uColorMultiplier.a);\n"
#endif
    "}\n";

/* ============================================
 * TILE VERTEX SHADER
 * ============================================ */
static const char* TILE_VERTEX_SHADER_GLES =
#ifdef USE_GLES3
    "#version 300 es\n"
    "precision highp float;\n"
    "\n"
    "layout (location = 0) in vec3 aVertexPosition;\n"
    "layout (location = 1) in vec3 aVertexNormal;\n"
    "layout (location = 2) in vec2 aTextureCoord;\n"
    "\n"
    "out vec2 vTextureCoord;\n"
    "out vec3 vWorldNormal;\n"
    "out vec3 vFragPos;\n"
#else
    "#version 100\n"
    "precision mediump float;\n"
    "\n"
    "attribute vec3 aVertexPosition;\n"
    "attribute vec3 aVertexNormal;\n"
    "attribute vec2 aTextureCoord;\n"
    "\n"
    "varying vec2 vTextureCoord;\n"
    "varying vec3 vWorldNormal;\n"
    "varying vec3 vFragPos;\n"
#endif
    "\n"
    "uniform mat4 uModelMatrix;\n"
    "uniform mat4 uViewMatrix;\n"
    "uniform mat4 uProjectionMatrix;\n"
    "uniform vec3 uScale;\n"
    "\n"
    "void main() {\n"
    "    vec3 scaledPosition = aVertexPosition * uScale;\n"
    "    vec4 worldPos = uModelMatrix * vec4(scaledPosition, 1.0);\n"
    "    vFragPos = vec3(worldPos);\n"
    "    vTextureCoord = aTextureCoord;\n"
    "    mat3 normalMatrix = mat3(uModelMatrix);\n"
    "    vWorldNormal = normalize(normalMatrix * aVertexNormal);\n"
    "    gl_Position = uProjectionMatrix * uViewMatrix * worldPos;\n"
    "}\n";

/* ============================================
 * TILE FRAGMENT SHADER
 * ============================================ */
static const char* TILE_FRAGMENT_SHADER_GLES =
#ifdef USE_GLES3
    "#version 300 es\n"
    "precision highp float;\n"
    "\n"
    "in vec2 vTextureCoord;\n"
    "in vec3 vWorldNormal;\n"
    "in vec3 vFragPos;\n"
    "\n"
    "out vec4 fragColor;\n"
#else
    "#version 100\n"
    "precision mediump float;\n"
    "\n"
    "varying vec2 vTextureCoord;\n"
    "varying vec3 vWorldNormal;\n"
    "varying vec3 vFragPos;\n"
#endif
    "\n"
    "uniform sampler2D uSampler;\n"
    "uniform vec4 uColorMultiplier;\n"
    "uniform float uAmbientStrength;\n"
    "uniform bool uIsSelected;\n"
    "\n"
    "void main() {\n"
#ifdef USE_GLES3
    "    vec4 texColor = texture(uSampler, vTextureCoord);\n"
#else
    "    vec4 texColor = texture2D(uSampler, vTextureCoord);\n"
#endif
    "    if (texColor.a < 0.1) discard;\n"
    "    \n"
    "    // Simple directional light from above\n"
    "    vec3 lightDir = normalize(vec3(0.3, 1.0, 0.5));\n"
    "    float diff = max(dot(normalize(vWorldNormal), lightDir), 0.0);\n"
    "    vec3 color = texColor.rgb * (uAmbientStrength + diff * (1.0 - uAmbientStrength));\n"
    "    \n"
    "    color *= uColorMultiplier.rgb;\n"
    "    \n"
    "    if (uIsSelected) {\n"
    "        color = mix(color, vec3(1.0, 1.0, 0.0), 0.3);\n"
    "    }\n"
    "    \n"
#ifdef USE_GLES3
    "    fragColor = vec4(color, texColor.a * uColorMultiplier.a);\n"
#else
    "    gl_FragColor = vec4(color, texColor.a * uColorMultiplier.a);\n"
#endif
    "}\n";

/* ============================================
 * PICKER VERTEX SHADER (Object Selection)
 * ============================================ */
static const char* PICKER_VERTEX_SHADER_GLES =
#ifdef USE_GLES3
    "#version 300 es\n"
    "precision highp float;\n"
    "\n"
    "layout (location = 0) in vec3 aVertexPosition;\n"
#else
    "#version 100\n"
    "precision mediump float;\n"
    "\n"
    "attribute vec3 aVertexPosition;\n"
#endif
    "\n"
    "uniform mat4 uModelMatrix;\n"
    "uniform mat4 uViewMatrix;\n"
    "uniform mat4 uProjectionMatrix;\n"
    "uniform vec3 uScale;\n"
    "\n"
    "void main() {\n"
    "    vec3 scaledPosition = aVertexPosition * uScale;\n"
    "    vec4 worldPos = uModelMatrix * vec4(scaledPosition, 1.0);\n"
    "    gl_Position = uProjectionMatrix * uViewMatrix * worldPos;\n"
    "}\n";

/* ============================================
 * PICKER FRAGMENT SHADER
 * ============================================ */
static const char* PICKER_FRAGMENT_SHADER_GLES =
#ifdef USE_GLES3
    "#version 300 es\n"
    "precision highp float;\n"
    "\n"
    "out vec4 fragColor;\n"
#else
    "#version 100\n"
    "precision mediump float;\n"
#endif
    "\n"
    "uniform vec4 uPickColor;\n"
    "\n"
    "void main() {\n"
#ifdef USE_GLES3
    "    fragColor = uPickColor;\n"
#else
    "    gl_FragColor = uPickColor;\n"
#endif
    "}\n";

/* ============================================
 * SIMPLE 2D SHADER (for HUD/UI)
 * ============================================ */
static const char* SIMPLE2D_VERTEX_SHADER_GLES =
#ifdef USE_GLES3
    "#version 300 es\n"
    "precision highp float;\n"
    "\n"
    "layout (location = 0) in vec2 aPosition;\n"
    "layout (location = 2) in vec2 aTexCoord;\n"
    "\n"
    "out vec2 vTexCoord;\n"
#else
    "#version 100\n"
    "precision mediump float;\n"
    "\n"
    "attribute vec2 aPosition;\n"
    "attribute vec2 aTexCoord;\n"
    "\n"
    "varying vec2 vTexCoord;\n"
#endif
    "\n"
    "uniform mat4 uProjection;\n"
    "\n"
    "void main() {\n"
    "    gl_Position = uProjection * vec4(aPosition, 0.0, 1.0);\n"
    "    vTexCoord = aTexCoord;\n"
    "}\n";

static const char* SIMPLE2D_FRAGMENT_SHADER_GLES =
#ifdef USE_GLES3
    "#version 300 es\n"
    "precision highp float;\n"
    "\n"
    "in vec2 vTexCoord;\n"
    "\n"
    "out vec4 fragColor;\n"
#else
    "#version 100\n"
    "precision mediump float;\n"
    "\n"
    "varying vec2 vTexCoord;\n"
#endif
    "\n"
    "uniform sampler2D uTexture;\n"
    "uniform vec4 uColor;\n"
    "uniform bool uUseTexture;\n"
    "\n"
    "void main() {\n"
    "    vec4 color;\n"
    "    if (uUseTexture) {\n"
#ifdef USE_GLES3
    "        color = texture(uTexture, vTexCoord) * uColor;\n"
#else
    "        color = texture2D(uTexture, vTexCoord) * uColor;\n"
#endif
    "    } else {\n"
    "        color = uColor;\n"
    "    }\n"
#ifdef USE_GLES3
    "    fragColor = color;\n"
#else
    "    gl_FragColor = color;\n"
#endif
    "}\n";

#endif /* SHADERS_GLES_H */
