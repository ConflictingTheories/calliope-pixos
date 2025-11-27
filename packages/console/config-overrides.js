const { override, addWebpackAlias, addBabelPlugin } = require('customize-cra');
const path = require('path');

module.exports = override(
  addWebpackAlias({
    'react': path.resolve('./node_modules/react'),
    'react-dom': path.resolve('./node_modules/react-dom'),
    // Map package imports to local source for development so CRA uses a single React copy
    'pixospritz-core': path.resolve(__dirname, '..', 'core', 'src'),
    'pixoscript': path.resolve(__dirname, '..', 'script', 'dist'),
    'pixospritz-math': path.resolve(__dirname, '..', 'math', 'src'),
    'calliope-pixos': path.resolve(__dirname, '..', 'core', 'src'),
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
      }
    }
    return config;
  }
);
