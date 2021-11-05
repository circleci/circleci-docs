const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    app: './src-js/app.js',
    vendor: './src-js/vendor.js',
  },
  output: {
    path: path.join(__dirname, 'jekyll/assets/js'),
    publicPath: '',
    filename: '[name].bundle.js',
  },
  plugins: [
    new webpack.DefinePlugin({
      CIRCLECI_ENVIRONMENT: `"${process.env.NODE_ENV}"`,
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  // Ignore warnings about default exports because some of our legacy
  // code inported in app.js are not modules:
  // - src-js/site/main.js
  // - src-js/site/user.js
  ignoreWarnings: [
    {
      module: /src-js\/app\.js/,
      message: /export 'default'/,
    },
  ],
};
