#version 330 core
layout(location=0) in vec3 aPosition;
layout(location=1) in vec2 aTexCoord;

uniform mat4 uProj;

out vec2 vTexCoord;

void main(){
    vTexCoord = aTexCoord;
    gl_Position = uProj * vec4(aPosition, 1.0);
}
