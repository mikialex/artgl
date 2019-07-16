var path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

var ROOT_PATH = path.resolve(__dirname);
var APP_PATH = path.resolve(ROOT_PATH, 'src');
var BUILD_PATH = path.resolve(ROOT_PATH, 'package');

module.exports = {
  entry: {
    app: path.resolve(APP_PATH, 'export.ts'),
  },
  devtool: 'source-map',
  output: {
    filename: 'artgl.js',
    path: BUILD_PATH
  },  
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [{
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  
  plugins: [
    new BundleAnalyzerPlugin({
      openAnalyzer: true,
    }),
  ]
};