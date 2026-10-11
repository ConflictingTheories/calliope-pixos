/**
 * Common Lighting Calculations
 * Shared GLSL fragment for both JS (WebGL) and C (OpenGL) engines
 * 
 * Include this in fragment shaders that need lighting:
 * #include "lighting.glsl"
 */

// Maximum number of lights supported
#define MAX_LIGHTS 8

// Light types
#define LIGHT_TYPE_POINT 0
#define LIGHT_TYPE_DIRECTIONAL 1
#define LIGHT_TYPE_SPOT 2

// Light structure (must match engine uniform layout)
struct Light {
    vec3 position;
    vec3 direction;
    vec3 color;
    float intensity;
    float range;
    float innerAngle;
    float outerAngle;
    int type;
    bool enabled;
    bool castShadow;
};

// Calculate attenuation for point/spot lights
float calculateAttenuation(float distance, float range) {
    // Inverse square falloff with range limit
    float attenuation = 1.0 / (1.0 + distance * distance);
    
    // Smooth falloff at range boundary
    float rangeAttenuation = 1.0 - smoothstep(range * 0.75, range, distance);
    
    return attenuation * rangeAttenuation;
}

// Calculate spot light cone factor
float calculateSpotFactor(vec3 lightDir, vec3 spotDir, float innerAngle, float outerAngle) {
    float theta = dot(lightDir, normalize(-spotDir));
    float epsilon = innerAngle - outerAngle;
    return clamp((theta - outerAngle) / epsilon, 0.0, 1.0);
}

// Diffuse lighting (Lambert)
float calculateDiffuse(vec3 normal, vec3 lightDir) {
    return max(dot(normal, lightDir), 0.0);
}

// Specular lighting (Blinn-Phong)
float calculateSpecular(vec3 normal, vec3 lightDir, vec3 viewDir, float shininess) {
    vec3 halfDir = normalize(lightDir + viewDir);
    float specAngle = max(dot(normal, halfDir), 0.0);
    return pow(specAngle, shininess);
}

// Calculate contribution from a single light
vec3 calculateLightContribution(
    Light light,
    vec3 fragPos,
    vec3 normal,
    vec3 viewDir,
    vec3 albedo,
    float shininess
) {
    if (!light.enabled) {
        return vec3(0.0);
    }
    
    vec3 lightDir;
    float attenuation = 1.0;
    
    if (light.type == LIGHT_TYPE_DIRECTIONAL) {
        // Directional light - no attenuation
        lightDir = normalize(-light.direction);
    } else {
        // Point or spot light
        vec3 toLight = light.position - fragPos;
        float distance = length(toLight);
        lightDir = normalize(toLight);
        attenuation = calculateAttenuation(distance, light.range);
        
        if (light.type == LIGHT_TYPE_SPOT) {
            // Apply spot cone
            float spotFactor = calculateSpotFactor(
                lightDir, 
                light.direction, 
                light.innerAngle, 
                light.outerAngle
            );
            attenuation *= spotFactor;
        }
    }
    
    // Diffuse
    float diff = calculateDiffuse(normal, lightDir);
    vec3 diffuse = diff * albedo * light.color;
    
    // Specular
    float spec = calculateSpecular(normal, lightDir, viewDir, shininess);
    vec3 specular = spec * light.color;
    
    return (diffuse + specular) * light.intensity * attenuation;
}

// Calculate total lighting from all lights
vec3 calculateTotalLighting(
    Light lights[MAX_LIGHTS],
    int numLights,
    vec3 fragPos,
    vec3 normal,
    vec3 viewDir,
    vec3 albedo,
    vec3 ambient,
    float shininess
) {
    // Start with ambient
    vec3 result = ambient * albedo;
    
    // Add contribution from each light
    for (int i = 0; i < MAX_LIGHTS; i++) {
        if (i >= numLights) break;
        result += calculateLightContribution(
            lights[i],
            fragPos,
            normal,
            viewDir,
            albedo,
            shininess
        );
    }
    
    return result;
}

// Simple ambient occlusion approximation
float calculateAO(vec3 normal, vec3 up) {
    float ao = dot(normal, up) * 0.5 + 0.5;
    return mix(0.5, 1.0, ao);
}

// Fresnel effect for rim lighting
float calculateFresnel(vec3 normal, vec3 viewDir, float power) {
    float fresnel = 1.0 - max(dot(normal, viewDir), 0.0);
    return pow(fresnel, power);
}
