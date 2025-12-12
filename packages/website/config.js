// PixoSpritz Website Configuration
// Environment-specific settings for local, staging, and production

const config = {
    // Environment detection
    environment: (() => {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('local')) {
            return 'local';
        } else if (hostname.includes('staging') || hostname.includes('netlify.app')) {
            return 'staging';
        } else {
            return 'production';
        }
    })(),

    // Base URLs for different environments
    urls: {
        local: {
            console: 'console/index.html',
            editor: 'editor/index.html',
            demo: 'console/index.html',
            docs: 'docs.html'
        },
        staging: {
            console: '/packages/console/build/index.html',
            editor: '/packages/editor/build/index.html',
            demo: '/packages/console/build/index.html?packageUrl=https://github.com/ConflictingTheories/calliope-pixos/releases/download/v0.1.0-alpha/default-spritz.zip',
            docs: 'docs.html'
        },
        production: {
            console: '/packages/console/build/index.html',
            editor: '/packages/editor/build/index.html',
            demo: '/packages/console/build/index.html?packageUrl=https://github.com/ConflictingTheories/calliope-pixos/releases/download/v0.1.0-alpha/default-spritz.zip',
            docs: 'docs.html'
        }
    },

    // Get current environment URLs
    get current() {
        return this.urls[this.environment];
    },

    // Feature flags
    features: {
        enableAnalytics: false,
        enableEasterEgg: true,
        enableDynamicGames: true
    },

    // API endpoints (if needed in future)
    api: {
        games: 'data/games.json',
        docs: 'docs/'
    }
};

// Make config globally available
window.PixoSpritzConfig = config;

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
}
