const { override, addWebpackAlias, addBabelPlugin } = require('customize-cra');
const webpack = require('webpack');
const path = require('path');

// Resolve React from the monorepo root where it's actually installed
const monorepoRoot = path.resolve(__dirname, '..', '..');

module.exports = override(
  addWebpackAlias({
    'react': path.resolve(monorepoRoot, 'node_modules', 'react'),
    'react-dom': path.resolve(monorepoRoot, 'node_modules', 'react-dom'),
    // Map package imports to local source for development so CRA uses a single React copy
    'pixospritz-core': path.resolve(__dirname, '..', 'core', 'src'),
    'pixospritz-math': path.resolve(__dirname, '..', 'math', 'src'),
    'pixoscript': path.resolve(__dirname, '..', 'script', 'dist'),
    '@Components': path.resolve(__dirname, '..', 'core', 'src', 'components'),
    '@Engine': path.resolve(__dirname, '..', 'core', 'src', 'engine'),
    '@Sprites': path.resolve(__dirname, '..', 'core', 'src', 'sprites'),
    '@Tilesets': path.resolve(__dirname, '..', 'core', 'src', 'tilesets'),
    '@Spritz': path.resolve(__dirname, '..', 'core', 'src', 'spritz'),
  }),
  addBabelPlugin('@babel/plugin-proposal-nullish-coalescing-operator'),
  addBabelPlugin('@babel/plugin-proposal-optional-chaining'),
  // Allow importing outside of the CRA src/ directory by removing ModuleScopePlugin
  (config) => {
    if (config.resolve && config.resolve.plugins) {
      config.resolve.plugins = config.resolve.plugins.filter(
        (plugin) => plugin.constructor.name !== 'ModuleScopePlugin'
      );
    }
    
    // Add process polyfill for browser environment
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      })
    );
    
    // Also allow Babel to process the pixospritz source outside of CRA src/ directory
    const pixosSource = path.resolve(__dirname, '..', 'core', 'src');
    const mathSource = path.resolve(__dirname, '..', 'math', 'src');
    if (config.module && Array.isArray(config.module.rules)) {
      const oneOfRule = config.module.rules.find((r) => r.oneOf);
      if (oneOfRule && Array.isArray(oneOfRule.oneOf)) {
        const babelRule = oneOfRule.oneOf.find((rule) => rule && rule.loader && rule.loader.indexOf('babel-loader') !== -1);
        if (babelRule) {
          if (Array.isArray(babelRule.include)) {
            babelRule.include.push(pixosSource, mathSource);
          } else if (babelRule.include) {
            babelRule.include = [babelRule.include, pixosSource, mathSource];
          } else {
            babelRule.include = [pixosSource, mathSource];
          }
        }

        // Exclude script dist from source-map-loader to avoid warnings
        oneOfRule.oneOf.unshift({
          test: /\.js$/,
          include: path.resolve(__dirname, '..', 'script', 'dist'),
          use: [],
          enforce: 'pre'
        });
      }
    }
    return config;
  }
);
