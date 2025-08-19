/**
 * Runs all updates for debug information
 * @param {*} self - engine core
 */
export const updateDebugInformation = (self) => {
    updateWebglDebugInformation(self);
    updateFlagDebugInformation(self);
}

/**
 * Webgl Debug Information Panel - Update
 * @param {*} self - engine core
 */
export const updateWebglDebugInformation = (self) => {
    if (self.showWebglDebug && self.webglDebugDiv) {
        const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        const delta = now - self.lastDebugTime;
        const fps = delta > 0 ? (1000.0 / delta).toFixed(1) : '0';
        self.lastDebugTime = now;

        const gl = self.gl;
        let renderer = '';
        let vendor = '';
        let version = '';
        if (gl) {
            try {
                renderer = gl.getParameter(gl.RENDERER);
                vendor = gl.getParameter(gl.VENDOR);
                version = gl.getParameter(gl.VERSION);
            } catch (e) {
                // WebGL context may be lost or parameters unavailable
            }
        }

        const debug = self.renderManager.debug || {};
        self.webglDebugDiv.innerHTML =
            'FPS: ' + fps + '<br>' +
            'Tiles Drawn: ' + (debug.tilesDrawn || 0) + '<br>' +
            'Sprites Drawn: ' + (debug.spritesDrawn || 0) + '<br>' +
            'Objects Drawn: ' + (debug.objectsDrawn || 0) + '<br>' +
            'Renderer: ' + renderer + '<br>' +
            'Vendor: ' + vendor + '<br>' +
            'GL Version: ' + version;
    }
}

/**
 * Updates Flag debug information based on latest values
 * @param {*} self 
 */
export const updateFlagDebugInformation = (self) => {
    if (self.showFlagDebug && self.flagDebugDiv) {
        self.store.set('Debug::Flag::UpdateTime', Date.now());
        const flags = self.store.all();
        console.log({self, keys: JSON.stringify(flags), store: self.store.keys()});
        const data = Object.keys(flags).map((key) => {
            return '' + key + ': ' + JSON.stringify(flags[key]) + '<br>'
        });
        self.flagDebugDiv.innerHTML = 'FLAGS:<br>' + data.join('');
    }
}

/**
 * Display Flag information debug window on the right hand top corner (note: may need to adjust sizing and padding for larger volumes)
 * @param {*} self - engine core
 */
export const attachFlagDebugInfo = (self) => {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.top = '0';
    div.style.right = '0';
    div.style.background = 'rgba(0, 0, 0, 0.6)';
    div.style.color = '#0f0';
    div.style.padding = '4px';
    div.style.fontFamily = 'monospace';
    div.style.fontSize = '12px';
    div.style.zIndex = '10000';
    div.style.pointerEvents = 'none';
    div.style.display = 'none';
    self.flagDebugDiv = div;
    document.body.appendChild(div);
    window.addEventListener('keydown', (e) => {
        if (e.key === 'F4') {
            self.showFlagDebug = !self.showFlagDebug;
            self.store.set('Debug::Flag::showDebug', self.showFlagDebug);
            self.flagDebugDiv.style.display = self.showFlagDebug ? 'block' : 'none';
        }
    });
}

/**
 * Attach webgl debug window to the instance
 * @param {*} self - engine core
 */
export const attachWebglDebugInfo = (self) => {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.top = '0';
    div.style.left = '0';
    div.style.background = 'rgba(0, 0, 0, 0.6)';
    div.style.color = '#0f0';
    div.style.padding = '4px';
    div.style.fontFamily = 'monospace';
    div.style.fontSize = '12px';
    div.style.zIndex = '10000';
    div.style.pointerEvents = 'none';
    div.style.display = 'none';
    self.webglDebugDiv = div;
    document.body.appendChild(div);
    window.addEventListener('keydown', (e) => {
        if (e.key === 'F3') {
            self.showWebglDebug = !self.showWebglDebug;
            self.store.set('Debug::Webgl::showDebug', self.showWebglDebug);
            self.webglDebugDiv.style.display = self.showWebglDebug ? 'block' : 'none';
        }
    });
}