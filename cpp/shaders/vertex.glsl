#version 330 core

layout(location = 0) in vec3 aVertexPosition;
layout(location = 1) in vec3 aVertexNormal;
layout(location = 2) in vec2 aTextureCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
uniform vec3 u_scale;
uniform vec3 uCameraPosition;

out vec4 vWorldVertex;
out vec3 vWorldNormal;
out vec3 vTransformedNormal;
out vec4 vPosition;
out vec2 vTextureCoord;
out vec3 vFragPos;
out vec3 vViewDir;
out vec3 vLightDir;

void main() {
    vec3 scaledPosition = aVertexPosition * u_scale;
    vec4 modelPosition = uModelMatrix * vec4(scaledPosition, 1.0);

    vWorldVertex = uModelMatrix * vec4(aVertexPosition, 1.0);
    vPosition = modelPosition;
    vTextureCoord = aTextureCoord;
    vTransformedNormal = uNormalMatrix * aVertexNormal;
    vWorldNormal = normalize(mat3(uModelMatrix) * aVertexNormal);
    vFragPos = vec3(modelPosition);
    vViewDir = normalize(uCameraPosition - vFragPos);
    vLightDir = vViewDir; // Updated in fragment shader using light uniforms; supply sane default.

    gl_Position = uProjectionMatrix * uViewMatrix * modelPosition;
}
