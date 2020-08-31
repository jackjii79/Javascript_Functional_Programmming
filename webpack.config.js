const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: {
    client: './src/public/client.js',
  },
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'url-loader',
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: 'assets',
          to: path.resolve(__dirname, 'dist'),
          context: path.resolve(__dirname, 'src', 'public'),
          toType: 'dir',
        },
        {
          from: 'index.html',
          to: path.resolve(__dirname, 'dist'),
          context: path.resolve(__dirname, 'src', 'public'),
          toType: 'dir',
        },
      ],
      options: {
        concurrency: 100,
      },
    }),
  ],
};
