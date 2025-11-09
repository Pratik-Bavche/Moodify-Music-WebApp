module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add fallbacks for Node.js modules
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "fs": false,
        "path": false,
        "os": false,
        "crypto": false,
        "stream": false,
        "util": false,
        "buffer": false
      };

      // Ignore warnings about 'fs' module in face-api.js
      webpackConfig.ignoreWarnings = [
        ...(webpackConfig.ignoreWarnings || []),
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
      ];

      return webpackConfig;
    },
  },
};

