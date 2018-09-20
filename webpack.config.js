const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    app: './src-js/app.js'
  },
  output: {
    // We need the flexibility to build a js file to one place and an html file
    // in another, which are in different places in the jekyll directory tree.
    // We set a fairly high level path and empty default path so that we can get
    // this flexibility.
    path: path.join(__dirname, 'jekyll/'),
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
        test: /\*.js/,
        use: {
          loader: 'babel-loader',
          query: {
            presets: ['es2015']
          }
        }
      }
    ]
  }
};
