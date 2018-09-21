const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: {
    app: './src-js/app.js'
  },
  output: {
    path: path.join(__dirname, 'jekyll/assets/js'),
    publicPath: '',
    filename: 'dist/[name].min.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  optimization: {
    minimizer: [new UglifyJsPlugin()]
  }
};
