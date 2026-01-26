/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine           **
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
 * MobileOptimizer - Mobile browser specific optimizations
 * Handles display optimization, input handling, and performance for mobile devices
 */
export default class MobileOptimizer {
    constructor(engine) {
        this.engine = engine;
        this.isMobile = this._detectMobile();
        this.isIOS = this._detectIOS();
        this.isAndroid = this._detectAndroid();
        this.device = this._detectDevice();

        // Performance settings
        this.maxDrawCalls = 500; // Lower limit for mobile
        this.maxParticles = 200;
        this.targetFPS = 60;

        // Display settings
        this.pixelDensity = window.devicePixelRatio || 1;
        this.viewport = {
            width: window.innerWidth,
            height: window.innerHeight,
        };

        this.init();
    }

    /**
     * Initialize mobile optimizations
     */
    init() {
        if (!this.isMobile) return;

        this._setupViewport();
        this._setupFullscreen();
        this._setupTouchInput();
        this._setupPerformance();
        this._setupOrientationHandling();
    }

    /**
     * Setup viewport for mobile
     * @private
     */
    _setupViewport() {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            const meta = document.createElement('meta');
            meta.name = 'viewport';
            meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
            document.head.appendChild(meta);
        }

        // Disable user scaling
        document.addEventListener('gesturestart', (e) => e.preventDefault());

        // Prevent double-tap zoom
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    /**
     * Setup fullscreen handling
     * @private
     */
    _setupFullscreen() {
        const canvas = this.engine?.renderer?.canvas;
        if (!canvas) return;

        // iOS fullscreen
        canvas.addEventListener('click', () => {
            this._requestFullscreen(canvas);
        });

        // Handle status bar color
        if (this.isIOS) {
            const meta = document.createElement('meta');
            meta.name = 'apple-mobile-web-app-capable';
            meta.content = 'yes';
            document.head.appendChild(meta);

            const statusBar = document.createElement('meta');
            statusBar.name = 'apple-mobile-web-app-status-bar-style';
            statusBar.content = 'black-translucent';
            document.head.appendChild(statusBar);
        }
    }

    /**
     * Request fullscreen
     * @private
     */
    _requestFullscreen(canvas) {
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen();
        } else if (canvas.webkitRequestFullscreen) {
            canvas.webkitRequestFullscreen();
        } else if (canvas.mozRequestFullScreen) {
            canvas.mozRequestFullScreen();
        } else if (canvas.msRequestFullscreen) {
            canvas.msRequestFullscreen();
        }
    }

    /**
     * Setup touch input optimization
     * @private
     */
    _setupTouchInput() {
        const canvas = this.engine?.renderer?.canvas;
        if (!canvas) return;

        // Improve touch responsiveness
        canvas.style.touchAction = 'manipulation';

        // Prevent default touch behaviors
        canvas.addEventListener('touchmove', (e) => {
            if (e.target === canvas) {
                e.preventDefault();
            }
        }, { passive: false });

        // Handle touch events with lower latency
        const touchHandler = (e) => {
            // Convert touch to pointer events for consistency
            if (e.touches) {
                const touch = e.touches[0];
                const pointerEvent = new PointerEvent('pointermove', {
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                    pointerId: touch.identifier,
                    isPrimary: e.touches.length === 1,
                });
                canvas.dispatchEvent(pointerEvent);
            }
        };

        canvas.addEventListener('touchstart', touchHandler, { passive: true });
        canvas.addEventListener('touchmove', touchHandler, { passive: true });
        canvas.addEventListener('touchend', touchHandler, { passive: true });
    }

    /**
     * Setup performance optimizations
     * @private
     */
    _setupPerformance() {
        // Reduce particle effects on low-end devices
        if (this.device === 'low-end') {
            this.maxParticles = 50;
            this.maxDrawCalls = 200;
        }

        // Use lower quality textures on bandwidth-limited connections
        if (this._hasSlowConnection()) {
            if (this.engine.renderer) {
                this.engine.renderer.textureQuality = 'low';
            }
        }

        // Enable power-saving mode if battery is low
        if ('getBattery' in navigator) {
            navigator.getBattery().then((battery) => {
                if (battery.level < 0.2) {
                    this._enablePowerSavingMode();
                }
                battery.onlevelchange = () => {
                    if (battery.level < 0.2) {
                        this._enablePowerSavingMode();
                    }
                };
            });
        }
    }

    /**
     * Setup orientation handling
     * @private
     */
    _setupOrientationHandling() {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this._handleOrientationChange();
            }, 100);
        });

        // Handle resize from browser chrome
        window.addEventListener('resize', () => {
            this._updateViewport();
        });
    }

    /**
     * Handle orientation change
     * @private
     */
    _handleOrientationChange() {
        this._updateViewport();

        if (this.engine.camera) {
            const canvas = this.engine.renderer?.canvas;
            if (canvas) {
                const aspectRatio = canvas.clientWidth / canvas.clientHeight;
                this.engine.camera.setAspectRatio(aspectRatio);
            }
        }
    }

    /**
     * Update viewport dimensions
     * @private
     */
    _updateViewport() {
        const canvas = this.engine?.renderer?.canvas;
        if (!canvas) return;

        this.viewport.width = window.innerWidth;
        this.viewport.height = window.innerHeight;

        // Account for device pixel ratio
        canvas.width = this.viewport.width * this.pixelDensity;
        canvas.height = this.viewport.height * this.pixelDensity;
        canvas.style.width = `${this.viewport.width}px`;
        canvas.style.height = `${this.viewport.height}px`;

        if (this.engine.gl) {
            this.engine.gl.viewport(0, 0, canvas.width, canvas.height);
        }
    }

    /**
     * Enable power saving mode
     * @private
     */
    _enablePowerSavingMode() {
        this.targetFPS = 30;
        this.maxDrawCalls = 100;
        this.maxParticles = 20;

        console.log('Power saving mode enabled: FPS capped at 30');
    }

    /**
     * Detect if running on mobile device
     * @private
     * @returns {boolean}
     */
    _detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        );
    }

    /**
     * Detect iOS
     * @private
     * @returns {boolean}
     */
    _detectIOS() {
        return /iPhone|iPad|iPod/.test(navigator.userAgent);
    }

    /**
     * Detect Android
     * @private
     * @returns {boolean}
     */
    _detectAndroid() {
        return /Android/.test(navigator.userAgent);
    }

    /**
     * Detect device tier
     * @private
     * @returns {string} 'high-end', 'mid-range', or 'low-end'
     */
    _detectDevice() {
        // Check CPU count
        const cores = navigator.hardwareConcurrency || 1;

        // Check RAM (rough estimate from device)
        let ram = 2; // Default to 2GB
        if (navigator.deviceMemory) {
            ram = navigator.deviceMemory;
        }

        // Simple heuristic
        if (cores >= 4 && ram >= 4) return 'high-end';
        if (cores >= 2 && ram >= 2) return 'mid-range';
        return 'low-end';
    }

    /**
     * Check for slow connection
     * @private
     * @returns {boolean}
     */
    _hasSlowConnection() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            return (
                connection.saveData === true ||
                connection.effectiveType === '4g' ||
                connection.effectiveType === '3g' ||
                connection.effectiveType === 'slow-2g' ||
                connection.effectiveType === '2g'
            );
        }
        return false;
    }

    /**
     * Get safe rendering bounds accounting for notches/safe areas
     * @returns {{top: number, left: number, right: number, bottom: number}}
     */
    getSafeArea() {
        const vars = getComputedStyle(document.documentElement);

        return {
            top: parseInt(vars.getPropertyValue('--safe-area-inset-top')) || 0,
            left: parseInt(vars.getPropertyValue('--safe-area-inset-left')) || 0,
            right: parseInt(vars.getPropertyValue('--safe-area-inset-right')) || 0,
            bottom: parseInt(vars.getPropertyValue('--safe-area-inset-bottom')) || 0,
        };
    }

    /**
     * Get recommended render resolution based on device
     * @returns {{width: number, height: number}}
     */
    getRecommendedResolution() {
        if (this.device === 'high-end') {
            return {
                width: window.innerWidth * this.pixelDensity,
                height: window.innerHeight * this.pixelDensity,
            };
        } else if (this.device === 'mid-range') {
            return {
                width: window.innerWidth * 0.75,
                height: window.innerHeight * 0.75,
            };
        } else {
            return {
                width: window.innerWidth * 0.5,
                height: window.innerHeight * 0.5,
            };
        }
    }
}
