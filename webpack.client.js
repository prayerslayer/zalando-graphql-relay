const path = require('path'),
  webpack = require('webpack');

module.exports = {
  devtool: 'eval',
  output: {
    path: path.join(__dirname, 'dist', 'client'),
    filename: 'bundle.js'
  },
  entry: [
    'webpack-dev-server/client?http://0.0.0.0:8080', // WebpackDevServer host and port
    'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
    './client/index.js' // Your appʼs entry point
  ],
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['babel'],
        include: path.join(__dirname, 'client')
      }
    ]
  }
}
