const path = require('path');

// Ref: https://nextjs.org/docs/api-reference/next.config.js/introduction
module.exports = (phase, { defaultConfig }) => {
  return {
    ...defaultConfig,
    env: {
      // make client-side use process.env.PHASE
      PHASE: process.env.PHASE,
    },
    sassOptions: {
      includePaths: [path.join(__dirname, 'styles')],
    },
  };
};
