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

/**
 * Runs all updates for debug information.
 * @param {import('../index.js').default} self - The engine core instance.
 */
import { create, set, translate, rotate } from '../../utils/math/matrix4.js';
import { Vector } from '../../utils/math/vector.js';

export const updateDebugInformation = (self) => {
    updateWebglDebugInformation(self);
    updateFlagDebugInformation(self);
}

/**
 * Updates WebGL debug information panel.
 * @param {import('../index.js').default} self - The engine core instance.
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
 * Updates flag debug information based on latest values.
 * @param {import('../index.js').default} self - The engine core instance.
 */
export const updateFlagDebugInformation = (self) => {
    if (self.showFlagDebug && self.flagDebugDiv) {
        self.store.set('Debug::Flag::UpdateTime', Date.now());
        const flags = self.store.all();
        console.log({ self, keys: JSON.stringify(flags), store: self.store.keys() });
        const data = Object.keys(flags).map((key) => {
            return '' + key + ': ' + JSON.stringify(flags[key]) + '<br>'
        });
        self.flagDebugDiv.innerHTML = 'FLAGS:<br>' + data.join('');
    }
}

/**
 * Attaches flag debug information window to the top-right corner.
 * @param {import('../index.js').default} self - The engine core instance.
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
 * Attaches WebGL debug window to the instance.
 * @param {import('../index.js').default} self - The engine core instance.
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
    // Free Camera toggle (F5) - register with engine keyboard so behavior matches other controls
    try {
        const kb = self.keyboard;
        const kbHook = (ev, type) => {
            // only handle keydown events here for toggles
            if (type !== 'down') return;
            if (ev.key !== 'F5') return;
            try { ev.preventDefault(); ev.stopPropagation(); } catch (err) { }
            // toggle and kick off same activation path below
            self.showFreeCam = !self.showFreeCam;
            self.store.set('Debug::FreeCam::show', self.showFreeCam);
            // trigger a synthetic event to the same handler path by dispatching a custom event on window
            const e = new CustomEvent('pixos:freecam:toggle');
            window.dispatchEvent(e);
        };
        kb.addHook && kb.addHook(kbHook);
        // store hook so it can be removed later if attachWebglDebugInfo is called multiple times
        self._debugFreeCamHook = kbHook;
    } catch (err) { }

    // central handler for activation/deactivation triggered by keyboard hook
    window.addEventListener('pixos:freecam:toggle', () => {
        const rm = self.renderManager;
        if (!rm || !rm.camera) return;
        const canvas = self.canvas || document.body;
        const panSpeed = 0.2;
        const rotSpeed = 0.002;

        // wheel handler -> zoom in/out using camera.zoom
        const onWheel = (we) => {
            try { we.preventDefault(); we.stopPropagation(); } catch (err) { };
            const dz = (we.deltaY > 0 ? 1 : -1) * 0.5;
            try { rm.camera.zoom && rm.camera.zoom(dz); moveCounter++; } catch (err) { }
        };

        // pointer move handler (pointer lock) -> rotate view matrix directly
        const onPointerMove = (me) => {
            const mx = (me.movementX || 0) * 0.002;
            const my = (me.movementY || 0) * 0.002;
            try {
                // convert to angular delta and apply via rotateCam
                const yawDelta = -mx * 1.5; // scale for responsiveness
                const pitchDelta = -my * 1.5;
                if (rm.camera) {
                    rm.camera.yaw += yawDelta;
                    rm.camera.pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, rm.camera.pitch + pitchDelta));
                    rm.camera.updateViewFromAngles && rm.camera.updateViewFromAngles();
                    moveCounter++;
                }
            } catch (err) { }
        };

        // keyboard-driven movement uses keyboard.activeCodes from engine.keyboard
        let rafId = null;
        let statusEl = null;
        let moveCounter = 0;
        let firstTick = true;
        const tick = () => {
            // Use activeCodes which stores the unambiguous key strings (eg 'w', 'ArrowUp')
            const codes = (self.keyboard && self.keyboard.activeCodes) || [];
            const lower = codes.map((c) => (c || '').toString().toLowerCase());
            // WASD movement - translate the view matrix in local camera space
            try {
                const step = 0.5;
                if (rm.camera) {
                    if (lower.indexOf('w') >= 0 || lower.indexOf('arrowup') >= 0) { rm.camera.translateCam('UP'); moveCounter++; }
                    if (lower.indexOf('s') >= 0 || lower.indexOf('arrowdown') >= 0) { rm.camera.translateCam('DOWN'); moveCounter++; }
                    if (lower.indexOf('a') >= 0 || lower.indexOf('arrowleft') >= 0) { rm.camera.translateCam('LEFT'); moveCounter++; }
                    if (lower.indexOf('d') >= 0 || lower.indexOf('arrowright') >= 0) { rm.camera.translateCam('RIGHT'); moveCounter++; }
                    // Q/E yaw
                    if (lower.indexOf('q') >= 0) { rm.camera.yaw -= 0.03; rm.camera.updateViewFromAngles(); moveCounter++; }
                    if (lower.indexOf('e') >= 0) { rm.camera.yaw += 0.03; rm.camera.updateViewFromAngles(); moveCounter++; }
                    // R/F pitch
                    if (lower.indexOf('r') >= 0) { rm.camera.pitch = Math.max(-Math.PI / 2 + 0.01, rm.camera.pitch - 0.03); rm.camera.updateViewFromAngles(); moveCounter++; }
                    if (lower.indexOf('f') >= 0) { rm.camera.pitch = Math.min(Math.PI / 2 - 0.01, rm.camera.pitch + 0.03); rm.camera.updateViewFromAngles(); moveCounter++; }
                }
            } catch (err) { }

            rafId = requestAnimationFrame(tick);
            // update status element so user can see what keys are active (helps debug focus)
            if (!statusEl) {
                statusEl = document.createElement('div');
                statusEl.id = 'pixos-freecam-status';
                statusEl.style.position = 'absolute';
                statusEl.style.top = '8px';
                statusEl.style.left = '50%';
                statusEl.style.transform = 'translateX(-50%)';
                statusEl.style.background = 'rgba(0,0,0,0.6)';
                statusEl.style.color = '#fff';
                statusEl.style.padding = '6px 10px';
                statusEl.style.fontFamily = 'monospace';
                statusEl.style.fontSize = '12px';
                statusEl.style.zIndex = '10002';
                document.body.appendChild(statusEl);
            }
            try {
                // collect camera state safely
                const cam = rm.camera || {};
                if (firstTick) {
                    try { console.log('[FreeCam] FIRST TICK viewMat:', Array.from(rm.camera.uViewMat)); } catch (err) { }
                    firstTick = false;
                }
                const pos = cam.cameraPosition ? [cam.cameraPosition.x, cam.cameraPosition.y, cam.cameraPosition.z] : ['n/a'];
                const yaw = typeof cam.yaw !== 'undefined' ? cam.yaw.toFixed(3) : 'n/a';
                const pitch = typeof cam.pitch !== 'undefined' ? cam.pitch.toFixed(3) : 'n/a';
                const vm = rm.camera && rm.camera.uViewMat ? Array.from(rm.camera.uViewMat).slice(0, 8).map((n) => n.toFixed(3)) : [];
                statusEl.innerText = 'Keys: ' + JSON.stringify(lower) + '\n' +
                    'pointerLock: ' + ((document.pointerLockElement === canvas) ? 'yes' : 'no') + '\n' +
                    'pos: ' + JSON.stringify(pos) + ' yaw:' + yaw + ' pitch:' + pitch + '\n' +
                    'uViewMat (trim): ' + JSON.stringify(vm) + '\n' +
                    'moves: ' + moveCounter;
            } catch (err) { }
        };

        if (self.showFreeCam) {
            // enter freecam
            // keep raw camera matrix; avoid decomposing it here (fragile)
            self._freeCamSaved = create();
            // log the incoming view matrix for diagnosis
            try { console.log('[FreeCam] ENTER - current viewMat:', Array.from(rm.camera.uViewMat)); } catch (err) { }
            set(rm.camera.uViewMat, self._freeCamSaved);
            try {
                self._freeCamSavedState = {
                    position: new Vector(rm.camera.cameraPosition.x, rm.camera.cameraPosition.y, rm.camera.cameraPosition.z),
                    yaw: rm.camera.yaw,
                    pitch: rm.camera.pitch,
                    distance: rm.camera.cameraDistance,
                    target: rm.camera.cameraTarget ? new Vector(rm.camera.cameraTarget.x, rm.camera.cameraTarget.y, rm.camera.cameraTarget.z) : null,
                    viewMat: create(),
                };
                set(rm.camera.uViewMat, self._freeCamSavedState.viewMat);
                try { console.log('[FreeCam] ENTER - savedState.viewMat:', Array.from(self._freeCamSavedState.viewMat)); } catch (err) { }
            } catch (err) { }
            if (self.spritz?.world) self.spritz.world.isPaused = true;
            self._freecamActive = true;

            const info = document.createElement('div');
            info.style.position = 'absolute';
            info.style.bottom = '8px';
            info.style.left = '50%';
            info.style.transform = 'translateX(-50%)';
            info.style.background = 'rgba(0,0,0,0.6)';
            info.style.color = '#fff';
            info.style.padding = '6px 10px';
            info.style.fontFamily = 'monospace';
            info.style.fontSize = '12px';
            info.style.zIndex = '10001';
            info.id = 'pixos-freecam-info';
            info.innerHTML = 'FREE CAM (F5 to exit) &nbsp; WASD/Arrows: move & strafe &nbsp; Q/E: yaw &nbsp; R/F: pitch &nbsp; Wheel: zoom';
            document.body.appendChild(info);

            const onPointerLockChange = () => {
                const locked = document.pointerLockElement === canvas || document.mozPointerLockElement === canvas;
                try {
                    const s = document.getElementById('pixos-freecam-status');
                    if (s) s.innerText = 'Keys: ' + JSON.stringify((self.keyboard && self.keyboard.activeCodes) || []) + ' | pointerLock: ' + (locked ? 'yes' : 'no');
                    try { console.log('[FreeCam] pointerLock change - locked:', locked, 'viewMat:', Array.from(rm.camera.uViewMat)); } catch (err) { }
                } catch (err) { }
            };

            const captureClick = (ev) => {
                ev && ev.preventDefault();
                // focus the wrapper if available (WebGLView sets tabIndex on wrapper)
                try {
                    if (canvas && canvas.parentElement) {
                        canvas.parentElement.focus && canvas.parentElement.focus();
                    }
                } catch (err) { }
                // request pointer lock on canvas
                try { canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock; canvas.requestPointerLock(); } catch (err) { }
            };

            // also mousedown as a final fallback
            document.addEventListener('pointerlockchange', onPointerLockChange);
            document.addEventListener('mozpointerlockchange', onPointerLockChange);

            try { self._bodyOverflowSaved = document.body.style.overflow; document.body.style.overflow = 'hidden'; } catch (err) { }

            // pointer lock request
            try { canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock; canvas.requestPointerLock(); } catch (err) { }

            window.addEventListener('wheel', onWheel, { passive: false, capture: true });
            document.addEventListener('pointermove', onPointerMove, { capture: true });
            // also listen for mousemove for browsers that don't support pointermove while locked
            document.addEventListener('mousemove', onPointerMove, { capture: true });
            rafId = requestAnimationFrame(tick);
            self._freecamHandlers = { onWheel, onPointerMove, rafId, captureClick, onPointerLockChange };
        } else {
            // exit freecam
            if (self._freeCamSavedState) {
                try {
                    try { console.log('[FreeCam] EXIT - restoring savedState.viewMat:', Array.from(self._freeCamSavedState.viewMat)); } catch (err) { }
                    // restore raw view matrix snapshot
                    set(self._freeCamSavedState.viewMat, rm.camera.uViewMat);
                    // restore camera params to ensure consistent tileset-style behavior
                    try {
                        if (rm.camera) {
                            if (typeof self._freeCamSavedState.yaw !== 'undefined') rm.camera.yaw = self._freeCamSavedState.yaw;
                            if (typeof self._freeCamSavedState.pitch !== 'undefined') rm.camera.pitch = self._freeCamSavedState.pitch;
                            if (typeof self._freeCamSavedState.distance !== 'undefined') rm.camera.cameraDistance = self._freeCamSavedState.distance;
                            if (self._freeCamSavedState.target) rm.camera.cameraTarget = self._freeCamSavedState.target;
                            rm.camera.updateViewFromAngles && rm.camera.updateViewFromAngles();
                        }
                    } catch (err) { }
                } catch (err) { }
                self._freeCamSavedState = null;
            } else if (self._freeCamSaved) {
                try {
                    try { console.log('[FreeCam] EXIT - restoring _freeCamSaved:', Array.from(self._freeCamSaved)); } catch (err) { }
                    set(self._freeCamSaved, rm.camera.uViewMat);
                    try { rm.camera.setFromViewMatrix(rm.camera.uViewMat); } catch (err) { }
                } catch (err) { }
            }
            if (self.spritz?.world) self.spritz.world.isPaused = false;
            self._freecamActive = false;
            const info = document.getElementById('pixos-freecam-info'); if (info) document.body.removeChild(info);
            try { document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock; document.exitPointerLock(); } catch (err) { }

            if (self._freecamHandlers) {
                window.removeEventListener('wheel', self._freecamHandlers.onWheel, { capture: true });
                document.removeEventListener('pointermove', self._freecamHandlers.onPointerMove, { capture: true });
                document.removeEventListener('mousemove', self._freecamHandlers.onPointerMove, { capture: true });
                try {
                    if (self._freecamHandlers.onPointerLockChange) {
                        document.removeEventListener('pointerlockchange', self._freecamHandlers.onPointerLockChange);
                        document.removeEventListener('mozpointerlockchange', self._freecamHandlers.onPointerLockChange);
                    }
                } catch (err) { }
                cancelAnimationFrame(self._freecamHandlers.rafId);
                self._freecamHandlers = null;
            }
            try { document.body.style.overflow = self._bodyOverflowSaved ?? ''; } catch (err) { }
            try {
                const s = document.getElementById('pixos-freecam-status');
                if (s) document.body.removeChild(s);
            } catch (err) { }
        }
    });
}