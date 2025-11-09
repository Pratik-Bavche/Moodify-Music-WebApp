const path = require('path');

module.exports = {
  resolve: {
    fallback: {
      "fs": false,
      "path": false,
      "os": false,
      "crypto": false,
      "stream": false,
      "util": false,
      "buffer": false
    }
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
  ignoreWarnings: [
    /Failed to parse source map/,
    /Module not found: Error: Can't resolve 'fs'/,
  ],
};
