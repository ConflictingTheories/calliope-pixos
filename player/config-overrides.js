const { override, addWebpackAlias, addBabelPlugin } = require('customize-cra');
const path = require('path');

module.exports = override(
  addWebpackAlias({
    'react': path.resolve('./node_modules/react'),
    'react-dom': path.resolve('./node_modules/react-dom'),
    // Map package import to local source for development so CRA uses a single React copy
    'calliope-pixos': path.resolve(__dirname, '..', 'pixospritz', 'src'),
    '@Components': path.resolve(__dirname, '..', 'pixospritz', 'src', 'components'),
    '@Engine': path.resolve(__dirname, '..', 'pixospritz', 'src', 'engine'),
    '@Sprites': path.resolve(__dirname, '..', 'pixospritz', 'src', 'sprites'),
    '@Tilesets': path.resolve(__dirname, '..', 'pixospritz', 'src', 'tilesets'),
    '@Spritz': path.resolve(__dirname, '..', 'pixospritz', 'src', 'spritz'),
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
    const pixosSource = path.resolve(__dirname, '..', 'pixospritz', 'src');
    if (config.module && Array.isArray(config.module.rules)) {
      const oneOfRule = config.module.rules.find((r) => r.oneOf);
      if (oneOfRule && Array.isArray(oneOfRule.oneOf)) {
        const babelRule = oneOfRule.oneOf.find((rule) => rule && rule.loader && rule.loader.indexOf('babel-loader') !== -1);
        if (babelRule) {
          if (Array.isArray(babelRule.include)) {
            babelRule.include.push(pixosSource);
          } else if (babelRule.include) {
            babelRule.include = [babelRule.include, pixosSource];
          } else {
            babelRule.include = [pixosSource];
          }
        }
      }
    }
    return config;
  }
);
