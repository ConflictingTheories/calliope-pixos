#version 330 core

const float Near = 0.1;
const float Far = 50.0;

struct PointLight {
    float enabled;
    vec3 color;
    vec3 position;
    vec3 attenuation;
    vec3 direction;
    vec3 scatteringCoefficients;
    float density;
};

in vec4 vWorldVertex;
in vec3 vWorldNormal;
in vec3 vTransformedNormal;
in vec4 vPosition;
in vec2 vTextureCoord;
in vec3 vFragPos;
in vec3 vViewDir;
in vec3 vLightDir;

uniform PointLight uLights[32];
uniform sampler2D uDepthMap;
uniform vec4 u_id;

uniform float runTransition;
uniform float useSampler;
uniform float useDiffuse;
uniform float isSelected;
uniform vec4 uColorMultiplier;
uniform sampler2D uSampler;
uniform sampler2D uDiffuseMap;

uniform vec3 uDiffuse;
uniform vec3 uSpecular;
uniform float uSpecularExponent;

uniform vec3 uLightColor;

out vec4 FragColor;

float getAttenuation(PointLight light) {
    vec3 toLight = light.position - vPosition.xyz;
    float distanceFromLight = length(toLight);
    float attenuation = 1.0 / (
        1.0 + light.attenuation.x +
        light.attenuation.y * distanceFromLight +
        light.attenuation.z * distanceFromLight * distanceFromLight
    );
    return attenuation;
}

vec3 getReflectedLightColor(vec3 baseColor) {
    vec3 reflectedLightColor = vec3(0.0);

    for (int i = 0; i < 32; ++i) {
        if (uLights[i].enabled <= 0.5) {
            continue;
        }

        vec3 normal = normalize(vWorldNormal);
        vec3 toLight = normalize(uLights[i].position - vFragPos);

        float cosAngle;
        if (useSampler == 1.0) {
            cosAngle = 0.67;
            cosAngle += dot(normalize(vViewDir), toLight);
        } else {
            cosAngle = clamp(dot(normal, toLight), 0.0, 1.0);
        }

        vec3 diffuseColor = uLights[i].color * cosAngle;

        vec3 reflection = normalize(2.0 * dot(normal, toLight) * normal - toLight);
        vec3 toCamera = normalize(vViewDir);
        float specAngle = clamp(dot(reflection, toCamera), 0.0, 1.0);
        vec3 specularColor = uLights[i].color * pow(specAngle, uSpecularExponent);

        float attenuation = getAttenuation(uLights[i]);
        reflectedLightColor += attenuation * (diffuseColor + specularColor);
    }

    return clamp(0.5 * baseColor + reflectedLightColor, 0.0, 1.0);
}

vec3 calculateDiffuse() {
    vec4 texelColors = texture(uDiffuseMap, vTextureCoord);
    vec3 color = uDiffuse;
    if (useDiffuse == 1.0 && texelColors != vec4(0.0)) {
        color = texelColors.rgb + color;
    }
    return color;
}

vec3 calculateSampler(vec4 texelColors) {
    if (texelColors.a < 0.1) {
        discard;
    }
    return texelColors.rgb;
}

float linearizeDepth(float depth) {
    float z = depth * 2.0 - 1.0;
    return (2.0 * Near * Far) / (Far + Near - z * (Far - Near));
}

vec4 fogEffect(vec4 color4) {
    float depth = linearizeDepth(gl_FragCoord.z) / Far;
    vec4 depthVec4 = vec4(vec3(pow(depth, 1.4)), 1.0);
    return (color4 * (1.0 - depth)) + depthVec4;
}

vec4 volumetricCalculation(vec4 color4) {
    vec3 finalColor = vec3(0.0);

    for (int i = 0; i < 32; ++i) {
        if (uLights[i].enabled <= 0.5) {
            continue;
        }

        float distance = length(uLights[i].position - vec3(vWorldVertex));
        float scattering = exp(-uLights[i].density * distance);
        vec3 scatteredLight = uLights[i].color * scattering * uLights[i].scatteringCoefficients;
        finalColor += scatteredLight;
    }

    return color4 * vec4(finalColor, 1.0);
}

void main() {
    if (runTransition == 1.0) {
        FragColor = vec4(0.0);
        return;
    }

    vec4 finalColor = vec4(0.0);

    if (useSampler == 1.0) {
        vec4 texelColors = texture(uSampler, vTextureCoord);
        vec3 baseColor = calculateSampler(texelColors);
        vec4 color4 = vec4(getReflectedLightColor(baseColor), texelColors.a);
        finalColor = volumetricCalculation(vec4(baseColor, texelColors.a)) * fogEffect(color4);
    } else {
        vec3 baseColor = calculateDiffuse();
        vec4 color4 = vec4(getReflectedLightColor(baseColor), 1.0);
        finalColor = volumetricCalculation(vec4(baseColor, 1.0)) * fogEffect(color4);
    }

    if (isSelected == 1.0) {
        finalColor *= uColorMultiplier;
    }

    FragColor = finalColor;
}
