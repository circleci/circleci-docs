module.exports = {
  entry: './js/results',
  output: {
    path: './_site/dist',
    filename: 'bundle.js'
  },
  resolve: {
    modulesDirectories: ['node_modules'],
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      { test: /\.jsx?$/,
        loader: 'babel',
        query: {
          presets: ['es2015','react']
        }
      },
    ]
  }
};
