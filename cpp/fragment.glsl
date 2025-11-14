#version 330 core
precision highp float;

uniform vec3 uColor;
uniform sampler2D uTexture;

in vec2 vTexCoord;
out vec4 outColor;

void main(){
    vec4 tex = texture(uTexture, vTexCoord);
    outColor = tex * vec4(uColor, 1.0);
}
