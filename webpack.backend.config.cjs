const path = require('path');

module.exports = {
  mode: 'development',
  target: 'node',
  entry: './backend/Application/main.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.backend.json',
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
    path: path.resolve(__dirname, 'build/backend'),
    module: true,
    library: {
      type: 'module',
    },
  },
  experiments: {
    outputModule: true,
  },
  devtool: 'source-map',
  externals: {
    // Exclude node_modules from bundle
  },
  externalsPresets: {
    node: true,
  },
};
