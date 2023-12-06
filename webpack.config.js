const path = require('path');
const webpack = require('webpack');
require('babel-register');
// Webpack Configuration
const config = {
  // Entry
  entry: './pixos/jsx/index.jsx',
  // Output
  output: {
    library: 'calliope-pixos',
    libraryTarget: 'commonjs2',
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  resolve: {
    alias: {
      '@Components': path.resolve(__dirname, 'pixos/jsx/components'),
      '@Engine': path.resolve(__dirname, 'pixos/jsx/engine'),
      '@Sprites': path.resolve(__dirname, 'pixos/jsx/sprites'),
      '@Tilesets': path.resolve(__dirname, 'pixos/jsx/tilesets'),
      '@Spritz': path.resolve(__dirname, 'pixos/jsx/spritz'),
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
        test: /\.jsx$/,
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
