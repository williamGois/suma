const path = require('path');
const slsw = require("serverless-webpack");
const nodeExternals = require('webpack-node-externals')

module.exports = {
  devtool: 'source-map',
  entry: slsw.lib.entries,
  target: 'node',
  externals: [nodeExternals({
    modulesDir: path.resolve(__dirname, './node_modules'),
  })],
  mode: slsw.lib.webpack.isLocal ? "development" : "production",
  optimization: {
    minimize: false
  },
  performance: {
    hints: slsw.lib.webpack.isLocal ? false : "warning"
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, './dist/'),
    filename: '[name].js', // this should match the first part of function handler in serverless.yml
  },
  stats: 'minimal',
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  }
};