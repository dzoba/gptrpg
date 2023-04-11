const webpack = require('webpack');
const package = require('./package');

module.exports = {
  entry: {
    'extract-json-from-string': require.resolve(`./${package.main}`),
    'extract-json-from-string.min': require.resolve(`./${package.main}`)
  },
  output: {
    library: 'extractJson',
    libraryTarget: 'window',
    path: `${__dirname}/dist`,
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /lib.*\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ['env', { modules: false }]
              ]
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      include: /\.min\.js$/,
      minimize: true
    })
  ]
};
