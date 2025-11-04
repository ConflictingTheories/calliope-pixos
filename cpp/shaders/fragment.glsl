#version 330 core
precision highp float;

in vec3 vNormal;
in vec3 vWorldPos;

uniform vec3 uColor;
uniform vec3 uLightDir;

out vec4 outColor;

void main(){
    float N=max(dot(normalize(vNormal),normalize(uLightDir)),.1);
    vec3 col=uColor*(.4+.6*N);
    outColor=vec4(col,1.);
}
