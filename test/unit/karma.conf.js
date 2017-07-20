var webpackConfig = require('../../build/webpack.test.conf')

module.exports = function (config) {
  config.set({
    browsers: ['PhantomJS'],
    frameworks: ['mocha', 'sinon-chai', 'source-map-support'],
    reporters: ['spec', 'coverage'],
    files: ['./index.ts'],
    preprocessors: {
      './index.ts': ['webpack', 'sourcemap']
    },
    webpack: webpackConfig,
    mime: {
      'text/x-typescript': ['ts']
    },
    webpackMiddleware: {
      noInfo: true
    },
    coverageReporter: {
      dir: './coverage',
      reporters: [
        { type: 'lcov', subdir: '.' },
        { type: 'text-summary' }
      ]
    }
  })
}