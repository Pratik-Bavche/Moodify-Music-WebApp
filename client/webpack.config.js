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
    /Can't resolve 'fs'/,
    /Can't resolve 'fs' in/,
    /node_modules\/face-api\.js/,
    /face-api\.js.*fs/,
    {
      module: /node_modules\/face-api\.js/,
    },
    (warning) => {
      if (warning.message) {
        return warning.message.includes("Can't resolve 'fs'") || 
               warning.message.includes("face-api.js");
      }
      return false;
    },
  ],
};
