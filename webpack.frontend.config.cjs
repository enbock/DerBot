const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  target: 'web',
  entry: './frontend/Application/main.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.frontend.json',
            transpileOnly: true,
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'build/frontend'),
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'frontend/index.html', to: 'index.html' },
        { from: 'frontend/styles.css', to: 'styles.css' },
      ],
    }),
  ],
  devtool: 'source-map',
};
