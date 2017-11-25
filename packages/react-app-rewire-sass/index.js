const path = require('path');
const { getFileLoader, getCssRules } = require('react-app-rewired');

function createRewireSass(sassLoaderOptions = {}) {
  return function (config, env) {
    const sassExtension = /\.scss$/;

    const fileLoader = getFileLoader(config.module.rules);
    fileLoader.exclude.push(sassExtension);

    const cssRules = getCssRules(config.module.rules);

    let sassRules;
    if (env === 'production') {
      sassRules = {
        test: sassExtension,
        loader: [
          // TODO: originally this part is wrapper in extract-text-webpack-plugin
          //       which we cannot do, so some things like relative publicPath
          //       will not work.
          //       https://github.com/timarney/react-app-rewired/issues/33
          ...cssRules.loader,
          { loader: require.resolve('sass-loader'), options: sassLoaderOptions }
        ]
      };
    }
    else {
      sassRules = {
        test: sassExtension,
        use: [
          ...cssRules.use,
          { loader: require.resolve('sass-loader'), options: sassLoaderOptions }
        ]
      };
    }

    const oneOfRule = config.module.rules.find((rule) => rule.oneOf !== undefined);
    if (oneOfRule) {
      oneOfRule.oneOf.unshift(sassRules);
    }
    else {
      // Fallback to previous behavior of adding to the end of the rules list.
      config.module.rules.push(sassRules);
    }

    return config;
  }
}

const rewireSass = createRewireSass();

rewireSass.withLoaderOptions = createRewireSass;

module.exports = rewireSass;
