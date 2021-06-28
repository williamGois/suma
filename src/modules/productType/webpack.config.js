const path = require('path');
const slsw = require("serverless-webpack");
const nodeExternals = require('webpack-node-externals')
// const TerserPlugin = require('terser-webpack-plugin');
// const slsw = require("serverless-webpack");

module.exports = {
  devtool: 'source-map',
  // entry: ["./src/functions/user/create.v1.js"  ],
  entry: slsw.lib.entries,
  target: 'node',
  externals: [nodeExternals({
    modulesDir: path.resolve(__dirname, './node_modules'),
  })],
  // mode: "development",
  mode: slsw.lib.webpack.isLocal ? "development" : "production",
  optimization: {
    // Do not minimize the code.
    minimize: false
    // minimizer: [
    //   new TerserPlugin({
    //     terserOptions: {
    //       keep_classnames: true
    //     }
    //   })
    // ]
  },
  // resolve: {
  //   alias: {
  //     "@serv": path.join(__dirname, ".."),
  //     "@perm": path.join(__dirname, "../../permissions"),
  //     "@schm": path.join(__dirname, "../../schemas")
  //   }
  // },
  performance: {
    // Turn off size warnings for entry points
    hints: slsw.lib.webpack.isLocal ? false : "warning"
    // hints: false
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