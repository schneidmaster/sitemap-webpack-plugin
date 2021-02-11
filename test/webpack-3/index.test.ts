import webpack from "webpack";
import webpackConfig from "../cases/basic/webpack.config";

describe("webpack 3", () => {
  it("raises error", () => {
    expect(() => webpack(webpackConfig)).toThrow(
      new Error("Unsupported webpack version; must be 4 or 5")
    );
  });
});
