const path = require('path');
const webpack = require('webpack')
require("babel-register");
// Webpack Configuration
const config = {
  // Entry
  entry: './jsx/index.jsx',
  // Output
  output: {
    library: 'commonjs',
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  // Loaders
  module: {
    rules : [
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
      }
    ]
  },
  // Plugins
  plugins: [
    new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser'
      })
  ],
  externals: [
    'react',
    'react-dom',
  ],
  devtool: 'source-map',
  mode: 'production',
};
// Exports
module.exports = config;