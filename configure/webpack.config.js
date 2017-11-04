const path = require('path');
const fs = require('fs');

const nodeModules = {};
fs
  .readdirSync('node_modules')
  .filter(x => ['.bin'].indexOf(x) === -1)
  .forEach(mod => {
    nodeModules[mod] = `commonjs ${mod}`;
  });

module.exports = {
  entry: ['babel-polyfill', './src/index.js'],
  target: 'node',
  output: {
    path: path.join(__dirname, 'bundledOutputs'),
    filename: '[name].js',
  },
  externals: nodeModules,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [path.resolve(__dirname, 'node_modules')],
        include: [path.resolve(__dirname, 'src')],
        loader: 'babel-loader',
      },
      {
        test: /\.(re|ml)$/,
        use: {
          loader: 'bs-loader',
          options: {
            module: 'es6',
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.re', '.ml', '.js'],
  },
};
