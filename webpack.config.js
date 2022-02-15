const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: {
    app: './src/js/app.js',
    vendor: './src/js/vendor.js',
  },
  output: {
    path: path.join(__dirname, 'jekyll/assets/'),
    publicPath: `/${process.env.JEKYLL_BASENAME || 'docs'}/assets/`,
    filename: 'js/[name].bundle.js',
    chunkFilename: 'js/[name].chunk.js',
  },
  plugins: [
    new webpack.DefinePlugin({
      CIRCLECI_ENVIRONMENT: `"${process.env.NODE_ENV}"`,
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].bundle.css',
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
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              url: false,
            },
          },
          'sass-loader',
        ],
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  // Ignore warnings about default exports because some of our legacy
  // code imported in app.js are not modules:
  // - src/js/site/main.js
  // - src/js/site/user.js
  ignoreWarnings: [
    {
      module: /src\/js\/app\.js/,
      message: /export 'default'/,
    },
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({ extractComments: false }),
      new CssMinimizerPlugin(),
    ],
  },
};
