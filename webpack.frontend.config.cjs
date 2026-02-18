const path = require('path');

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
  devtool: 'source-map',
};
