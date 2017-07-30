import webpack from 'webpack';
import path from 'path';

export default {
  devtool: 'source-map',
  entry: './src/client.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'scraper.js',
    libraryTarget: 'commonjs2',
    publicPath: ''
  },
  target: 'node',
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node-modules/,
        use: [
          'babel-loader',
          'eslint-loader'
        ]
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
    ]
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
      options: {
        context: __dirname
      }
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
      __PRODUCTION__: true,
      __DEVELOPMENT__: false,
      __DEVTOOLS__: false,
      __TEST__: false
    }),
  ],
  resolve: {
      modules: [
          'node_modules',
          'src'
      ],
      // Define extensions that will be automatically resolved
      // without having to specify the extension in the import.
      extensions: ['.json', '.js']
  }
};
