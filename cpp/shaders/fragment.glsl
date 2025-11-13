#version 330 core
precision highp float;

in vec2 vTexCoord;

uniform vec3 uColor;
uniform sampler2D uTexture;

out vec4 outColor;

void main(){
    vec4 texColor = texture(uTexture, vTexCoord);
    if (texColor.a < 0.1) discard; // Discard transparent pixels
    outColor = texColor * vec4(uColor, 1.0);
}
