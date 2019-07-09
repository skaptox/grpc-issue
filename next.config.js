module.exports = () => {
  /* eslint-disable */
  const withLess = require("@zeit/next-less");
  const lessToJS = require("less-vars-to-js");
  const withImages = require("next-images");

  const fs = require("fs");
  const path = require("path");
  // Where your antd-custom.less file lives
  const themeVariables = lessToJS(
    fs.readFileSync(path.resolve(__dirname, "./assets/css/theme.less"), "utf8")
  );
  // fix: prevents error when .less files are required by node
  if (typeof require !== "undefined") {
    require.extensions[".less"] = file => {};
  }


  // https://github.com/zeit/next.js/issues/6073
  const withAssetRelocator = (nextConfig = {}) => {
    return Object.assign({}, nextConfig, {
      webpack(config, options) {
        const { isServer } = options;

        if (isServer) {
          config.node = Object.assign({}, config.node, {
            __dirname: false,
            __filename: false
          });

          config.module.rules.unshift({
            test: /\.(m?js|node)$/,
            parser: { amd: false },
            use: {
              loader: "@zeit/webpack-asset-relocator-loader",
              options: {
                outputAssetBase: "assets",
                existingAssetNames: [],
                wrapperCompatibility: true,
                escapeNonAnalyzableRequires: true
              }
            }
          });
        }

        if (typeof nextConfig.webpack === "function") {
          return nextConfig.webpack(config, options);
        }
        return config;
      }
    });
  };

  return withAssetRelocator(
    withImages(
      withLess({
        lessLoaderOptions: {
          javascriptEnabled: true,
          modifyVars: themeVariables // make your antd custom effective
        },
        target: "serverless"
      })
    )
  );
};
