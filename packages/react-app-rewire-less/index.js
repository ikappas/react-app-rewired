const path = require("path");
const { getFileLoader, getCssRules } = require("react-app-rewired");

function createRewireLess(lessLoaderOptions = {}) {
  return function(config, env) {
    const lessExtension = /\.less$/;

    const fileLoader = getFileLoader(config.module.rules);
    fileLoader.exclude.push(lessExtension);

    const cssRules = getCssRules(config.module.rules);

    let lessRules;
    if (env === "production") {
      lessRules = {
        test: lessExtension,
        loader: [
          // TODO: originally this part is wrapper in extract-text-webpack-plugin
          //       which we cannot do, so some things like relative publicPath
          //       will not work.
          //       https://github.com/timarney/react-app-rewired/issues/33
          ...cssRules.loader,
          { loader: "less-loader", options: lessLoaderOptions }
        ]
      };
    } else {
      lessRules = {
        test: lessExtension,
        use: [
          ...cssRules.use,
          { loader: "less-loader", options: lessLoaderOptions }
        ]
      };
    }

    const oneOfRule = config.module.rules.find((rule) => rule.oneOf !== undefined);
    if (oneOfRule) {
      oneOfRule.oneOf.unshift(lessRules);
    }
    else {
      // Fallback to previous behaviour of adding to the end of the rules list.
      config.module.rules.push(lessRules);
    }

    return config;
  };
}

const rewireLess = createRewireLess();

rewireLess.withLoaderOptions = createRewireLess;

module.exports = rewireLess;
