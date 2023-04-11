// Karma configuration
// Generated on Fri Oct 23 2015 14:00:27 GMT-0400 (EDT)

module.exports = function(config) {
  config.set({
    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],
    reporters: ['dots'],
    browsers: ['Chrome', 'PhantomJS'],
    preprocessors: {
      'test/**/*.js': ['webpack']
    },

    // list of files / patterns to load in the browser
    files: [
      'test/**/*.js'
    ],

    webpackMiddleware: {
      noInfo: true,
      stats: 'errors-only'
    },

    webpack: {
      module: {
        rules: [
          {
            test: /\.js$/,
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
      }
    },

    logLevel: config.LOG_WARN
  });
}
