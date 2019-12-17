const path = require("path");

module.exports = {
  entry: "./src/index.ts",
  mode: 'development',
  output: {
    filename: "bundle.min.js",
    path: path.resolve(__dirname, "dist"),
    library: "kyber",
    libraryTarget: "umd",
    globalObject: 'this'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
          }
        }
      },
      {
        test: /\.ts?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
              plugins: ["@babel/plugin-syntax-bigint"]
            }
          },
          "ts-loader"
        ]
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  }
};
