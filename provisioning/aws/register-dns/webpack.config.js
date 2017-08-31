const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'lib'),
    library: 'index',
    libraryTarget: 'commonjs2',
  },
  externals: [
    function (context, request, callback) {
      if (/^aws-sdk/.test(request)) {
        return callback(null, `commonjs ${request}`);
      }
      callback();
    },
  ], // plugins: [new webpack.IgnorePlugin(/aws-sdk/)],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
};
