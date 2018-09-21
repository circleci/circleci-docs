const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: {
    app: './src-js/app.js'
  },
  output: {
    path: path.join(__dirname, 'jekyll/assets/js'),
    publicPath: '',
    filename: 'assets/js/dist/[name]-[contenthash].min.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: '_includes/app.html',
      templateContent: ({ htmlWebpackPlugin }) =>
        `<script src="{{ "/${
          htmlWebpackPlugin.files.chunks.app.entry
        }" | prepend: site.baseurl }}" type="text/javascript"></script>`,
      inject: false
    })
  ],
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
