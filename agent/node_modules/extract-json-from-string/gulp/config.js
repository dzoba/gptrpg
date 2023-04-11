const path = require('path');

module.exports = {
  tests: ['test/**/*.js'],
  lib: ['lib/**/*.js'],
  root: path.resolve(__dirname, '..') + path.sep
};
