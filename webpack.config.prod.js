const path = require('path');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const ROOT_PATH = path.resolve(__dirname);
const APP_PATH = path.resolve(ROOT_PATH, 'src');
const BUILD_PATH = path.resolve(ROOT_PATH, 'package');

module.exports = {
  mode: "production",
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
    // before use this, mode should change to develop.
    // new BundleAnalyzerPlugin({
    //   openAnalyzer: true,
    // }),
  ]
};