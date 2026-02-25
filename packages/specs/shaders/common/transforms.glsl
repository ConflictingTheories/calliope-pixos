/**
 * Common Transform Calculations
 * Shared GLSL functions for vertex transformations
 * 
 * Include this in vertex shaders:
 * #include "transforms.glsl"
 */

// Billboard types
#define BILLBOARD_NONE 0
#define BILLBOARD_SPHERICAL 1      // Face camera fully
#define BILLBOARD_CYLINDRICAL 2    // Face camera horizontally only (Y-axis locked)
#define BILLBOARD_SCREEN 3         // Align to screen plane

/**
 * Create a billboard rotation matrix that faces the camera
 * @param viewMatrix The camera's view matrix
 * @param billboardType Type of billboarding to apply
 * @return 3x3 rotation matrix for billboard orientation
 */
mat3 createBillboardMatrix(mat4 viewMatrix, int billboardType) {
    if (billboardType == BILLBOARD_NONE) {
        return mat3(1.0);
    }
    
    // Extract camera right and up vectors from view matrix
    vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
    vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
    vec3 forward = vec3(viewMatrix[0][2], viewMatrix[1][2], viewMatrix[2][2]);
    
    if (billboardType == BILLBOARD_CYLINDRICAL) {
        // Lock Y-axis, only rotate around it
        up = vec3(0.0, 1.0, 0.0);
        right = normalize(cross(up, forward));
        forward = cross(right, up);
    } else if (billboardType == BILLBOARD_SCREEN) {
        // Align exactly to screen plane
        right = vec3(1.0, 0.0, 0.0);
        up = vec3(0.0, 1.0, 0.0);
        forward = vec3(0.0, 0.0, 1.0);
    }
    
    return mat3(right, up, forward);
}

/**
 * Transform a vertex position for billboard rendering
 * @param localPos Local vertex position (usually quad corners)
 * @param worldPos World position of the billboard center
 * @param scale Scale of the billboard
 * @param viewMatrix Camera view matrix
 * @param projMatrix Camera projection matrix
 * @param billboardType Type of billboarding
 * @return Clip space position
 */
vec4 billboardTransform(
    vec3 localPos,
    vec3 worldPos,
    vec2 scale,
    mat4 viewMatrix,
    mat4 projMatrix,
    int billboardType
) {
    mat3 billboardRot = createBillboardMatrix(viewMatrix, billboardType);
    
    // Apply scale and rotation to local position
    vec3 scaledPos = vec3(localPos.x * scale.x, localPos.y * scale.y, localPos.z);
    vec3 rotatedPos = billboardRot * scaledPos;
    
    // Add to world position
    vec4 worldVertex = vec4(worldPos + rotatedPos, 1.0);
    
    // Transform to clip space
    return projMatrix * viewMatrix * worldVertex;
}

/**
 * Apply isometric projection offset
 * Standard 2:1 isometric ratio
 */
vec2 toIsometric(vec3 worldPos) {
    float isoX = (worldPos.x - worldPos.z) * 0.5;
    float isoY = (worldPos.x + worldPos.z) * 0.25 - worldPos.y * 0.5;
    return vec2(isoX, isoY);
}

/**
 * Convert screen coordinates to world ray
 * For picking/raycasting
 */
vec3 screenToWorldRay(vec2 screenPos, vec2 screenSize, mat4 invProjMatrix, mat4 invViewMatrix) {
    // Normalize to [-1, 1]
    vec2 ndc = (screenPos / screenSize) * 2.0 - 1.0;
    ndc.y = -ndc.y; // Flip Y
    
    // Create clip space position
    vec4 clipPos = vec4(ndc, -1.0, 1.0);
    
    // Transform to view space
    vec4 viewPos = invProjMatrix * clipPos;
    viewPos = vec4(viewPos.xy, -1.0, 0.0);
    
    // Transform to world space
    vec3 worldDir = (invViewMatrix * viewPos).xyz;
    
    return normalize(worldDir);
}

/**
 * Calculate sprite depth for proper sorting
 * Considers Y position for top-down games
 */
float calculateSpriteDepth(vec3 worldPos, float yBias) {
    // Base depth from Z
    float depth = worldPos.z;
    
    // Add Y bias for proper sprite stacking
    depth += worldPos.y * yBias;
    
    return depth;
}

/**
 * UV coordinate transformations for sprite sheets
 */
vec2 transformUV(vec2 uv, vec2 frameOffset, vec2 frameSize, vec2 sheetSize) {
    vec2 normalizedOffset = frameOffset / sheetSize;
    vec2 normalizedSize = frameSize / sheetSize;
    return normalizedOffset + uv * normalizedSize;
}

/**
 * Flip UV coordinates
 */
vec2 flipUV(vec2 uv, bool flipX, bool flipY) {
    if (flipX) uv.x = 1.0 - uv.x;
    if (flipY) uv.y = 1.0 - uv.y;
    return uv;
}

/**
 * Rotate UV coordinates
 * @param uv UV coordinates
 * @param angle Rotation in radians
 * @param center Rotation center (usually 0.5, 0.5)
 */
vec2 rotateUV(vec2 uv, float angle, vec2 center) {
    float s = sin(angle);
    float c = cos(angle);
    vec2 offset = uv - center;
    return vec2(
        offset.x * c - offset.y * s,
        offset.x * s + offset.y * c
    ) + center;
}

/**
 * Calculate parallax offset for depth effects
 */
vec2 parallaxOffset(vec2 uv, vec3 viewDir, float height, float scale) {
    float h = height * scale;
    vec2 offset = viewDir.xy / viewDir.z * h;
    return uv - offset;
}
