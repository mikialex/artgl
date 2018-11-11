var path = require('path');
var webpack = require('webpack');
var HtmlwebpackPlugin = require('html-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

var ROOT_PATH = path.resolve(__dirname);
var APP_PATH = path.resolve(ROOT_PATH, 'src');
var BUILD_PATH = path.resolve(ROOT_PATH, 'dist');

module.exports = {
  entry: {
    app: path.resolve(APP_PATH, 'index.ts'),
  },
  devtool: 'eval-source-map',
  devServer: {
    // contentBase: path.resolve(__dirname, 'dist'),    
    hot: true,
    quiet: true,
  },
  output: {
    filename: '[name].bundle.js',
    path: BUILD_PATH
  },  
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    // alias: {
    //   // '@': resolve('src'),
    // }
  },
  module: {
    rules: [{
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
    ]
  },
  
  plugins: [
    new HtmlwebpackPlugin({
      title: 'artifact',
      template: path.resolve(__dirname, 'index.html'),
      filename: 'index.html',
      chunks: ['app', 'vendors'],
      inject: 'head'
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new FriendlyErrorsWebpackPlugin()
  ]
};