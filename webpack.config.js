const path = require('path');
const webpack = require('webpack');
require('babel-register');
// Webpack Configuration
const config = {
  // Entry
  entry: './pixospritz/src/index.jsx',
  // Output
  output: {
    library: {
      name: 'calliope-pixos',
      type: 'umd',
      export: 'default',
    },
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    globalObject: 'this',
  },
  resolve: {
    alias: {
      '@Components': path.resolve(__dirname, 'pixospritz/src/components'),
      '@Engine': path.resolve(__dirname, 'pixospritz/src/engine'),
      '@Sprites': path.resolve(__dirname, 'pixospritz/src/sprites'),
      '@Tilesets': path.resolve(__dirname, 'pixospritz/src/tilesets'),
      '@Spritz': path.resolve(__dirname, 'pixospritz/src/spritz'),
    },
    fallback: {
      buffer: require.resolve('buffer/'),
    },
  },
  // Loaders
  module: {
    rules: [
      // JavaScript/JSX Files
      {
        test: /\.js[x]?$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      // CSS Files
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  // Plugins
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ],
  externals: {
    react: {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react',
    },
    'react-dom': {
      root: 'ReactDOM',
      commonjs2: 'react-dom',
      commonjs: 'react-dom',
      amd: 'react-dom',
    },
  },
  devtool: 'source-map',
  mode: 'production',
};
// Exports
module.exports = config;
