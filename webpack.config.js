const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    app: './src-js/app.js'
  },
  output: {
    path: path.join(__dirname, 'jekyll/assets/js/'),
    filename: '[name].min.js'
  },
  plugins: [
    new webpack.ProvidePlugin({
      React: 'react',
      ReactDOM: 'react-dom'
    })
  ],
  module: {
    rules: [
      {
        test: /\*.js/,
        use: {
          loader: 'babel-loader',
          query: {
            presets: ['es2015', 'react']
          }
        }
      }
    ]
  }
};
