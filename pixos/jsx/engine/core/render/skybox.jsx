/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

import { create, normalFromMat4, frustum, perspective, set } from '../../utils/math/matrix4.jsx';
import { Vector, degToRad } from '../../utils/math/vector.jsx';
import { Texture } from '../resource/texture.jsx';
import { fetchSkyboxShaderFiles } from './shaders.jsx';

export default class SkyboxManager {
    /** Light Manager for Scene
     *
     * @param {GLEngine} engine
     */
    constructor(renderManager) {
        if (!SkyboxManager.instance) {
            this.renderManager = renderManager;
            this.engine = renderManager.engine;
            SkyboxManager.instance = this;
        }

        return SkyboxManager.instance;
    }

    init(textureSrc, centre = [0.0, 0.0, 0.0]) {
        if (!this.engine.gl) return;
        this.gl = this.engine.gl;
        this.skyboxTexture = new Texture('skybox.jpg', this.engine);
        // todo - fix this -- should load from zip -- need to get zip more easily from within engine....
        // this.skyboxTexture = this.engine.resourceManager.loadTextureFromZip(textureSrc, this.engine.zip);
        this.skyboxCenter = centre;
        this.program = this.createSkyboxProgram();
        this.buffer = this.createSkyboxBuffer();
    }

    /**
     * Load and Compile Shader Source
     * @param {*} type
     * @param {*} source
     * @returns
     */
    loadShader = (type, source) => {
        const { gl } = this.engine;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        // if error clear
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const log = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error(`An error occurred compiling the shaders: ${log}`);
        }
        return shader;
    }

    /**
     * Initialize Shader Program
     * @param {*} param1
     * @returns
     */
    initShaderProgram = ({ vs: vsSource, fs: fsSource }) => {
        const { gl } = this.engine;
        const self = this;
        const vertexShader = this.loadShader(gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fsSource);

        // generate shader program
        let shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            throw new Error(`WebGL unable to initialize the shader program: ${shaderProgram}`);
        }

        // Set up attribute locations
        shaderProgram.aVertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
        gl.enableVertexAttribArray(shaderProgram.aVertexPosition);

        // Set up uniform locations
        shaderProgram.uSkyboxTexture = gl.getUniformLocation(shaderProgram, 'uSkyboxTexture');
        shaderProgram.uSkyboxCenter = gl.getUniformLocation(shaderProgram, 'uSkyboxCenter');
        shaderProgram.uProjectionMatrix = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');
        shaderProgram.uModelMatrix = gl.getUniformLocation(shaderProgram, 'uModelMatrix');
        shaderProgram.uViewMatrix = gl.getUniformLocation(shaderProgram, 'uViewMatrix');

        // Set up uniform functions
        shaderProgram.setMatrixUniforms = function () {
            const modelMatrix = self.uModelMat;
            const viewMatrix = self.camera.uViewMat;
            const projectionMatrix = self.uProjMat;
            gl.uniformMatrix4fv(this.uProjectionMatrix, false, projectionMatrix);
            gl.uniformMatrix4fv(this.uModelMatrix, false, modelMatrix);
            gl.uniformMatrix4fv(this.uViewMatrix, false, viewMatrix);
        };

        this.shaderProgram = shaderProgram;
        return shaderProgram;
    }

    /**
     * Create Skybox Program
     */
    createSkyboxProgram() {
        const vertexShaderSource = `#version 300 es
        in vec3 aVertexPosition;
        uniform mat4 uProjectionMatrix;
        uniform mat4 uModelMatrix;
        uniform mat4 uViewMatrix;
        void main() {
            gl_Position = uProjectionMatrix * uModelMatrix * uViewMatrix * vec4(aVertexPosition, 1.0);
        }
        `;

        const fragmentShaderSource = `#version 300 es
        precision highp float;
        uniform sampler2D uSkyboxTexture;
        uniform vec3 uSkyboxCenter;
        out vec4 outColor;
        void main() {
            vec3 direction = normalize(gl_FragCoord.xyz - uSkyboxCenter);
            vec4 skyboxColor = texture(uSkyboxTexture, direction.xy);
            float dotProduct = dot(direction, skyboxColor.rgb);
            if (dotProduct < 0.01) {
                discard;
            } else {
                outColor = vec4(dotProduct, dotProduct, dotProduct, 1.0);
            }
        }
        `;

        return this.initShaderProgram({ vs: vertexShaderSource, fs: fragmentShaderSource });
    }

    // basic cube vertex buffer for skybox
    createSkyboxBuffer() {
        this.vertices = [
            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, 1.0, -1.0,
            -1.0, -1.0, -1.0,
            -1.0, 1.0, -1.0,
            -1.0, 1.0, 1.0,
            -1.0, -1.0, 1.0,
            1.0, -1.0, 1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, -1.0,
            -1.0, -1.0, -1.0,
            -1.0, -1.0, 1.0
        ];

        this.numVertices = this.vertices.length / 3;

        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.gl.STATIC_DRAW);
        return buffer;
    }

    // draw skybox
    renderSkybox(projectionMatrix) {
        this.gl.useProgram(this.program);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);

        this.gl.uniformMatrix4fv(this.shaderProgram.uProjectionMatrix, false, projectionMatrix);
        this.gl.uniform3f(this.shaderProgram.uSkyboxCenter, this.skyboxCenter[0], this.skyboxCenter[1], this.skyboxCenter[2]);

        // todo -- texture bind -- need to attach texture which has been loaded.
        this.gl.uniform1i(this.shaderProgram.uSkyboxTexture, 0); // Assuming skybox texture is bound to texture unit 0

        this.gl.enableVertexAttribArray(this.shaderProgram.aVertexPosition);
        this.gl.vertexAttribPointer(this.shaderProgram.aVertexPosition, 3, this.gl.FLOAT, false, 0, 0);

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.numVertices);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        this.gl.useProgram(null);
    }
}
