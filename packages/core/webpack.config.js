const path = require('path');
const webpack = require('webpack');

// Webpack Configuration for pixospritz-core
const config = {
  // Entry
  entry: './src/index.jsx',
  // Output
  output: {
    library: {
      name: 'pixospritz-core',
      type: 'umd',
      export: 'default',
    },
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    globalObject: 'this',
  },
  resolve: {
    alias: {
      '@Components': path.resolve(__dirname, 'src/components'),
      '@Engine': path.resolve(__dirname, 'src/engine'),
      '@Sprites': path.resolve(__dirname, 'src/sprites'),
      '@Tilesets': path.resolve(__dirname, 'src/tilesets'),
      '@Spritz': path.resolve(__dirname, 'src/spritz'),
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
