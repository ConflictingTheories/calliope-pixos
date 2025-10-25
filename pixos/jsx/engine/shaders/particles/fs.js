export default function() {
  return `
    precision mediump float;

    varying vec2 vTextureCoord;
    varying vec3 vColor;

    void main(void) {
      // Simple particle color (could be extended with texture sampling)
      gl_FragColor = vec4(vColor, 1.0);
    }
  `;
}
