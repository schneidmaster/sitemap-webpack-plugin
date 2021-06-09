import webpack from "webpack";
import webpackConfig from "./cases/basic/webpack.config";
import SitemapPlugin from "../src";
import * as helpers from "../src/helpers";

describe("Errors", () => {
  it("reports generation error from malformed base URL", done => {
    webpack(
      {
        ...webpackConfig,
        plugins: [
          new SitemapPlugin({
            base: "example.com",
            paths: ["/", "/about"]
          })
        ]
      },
      (_err, output) => {
        expect(output?.compilation?.errors[0]).toEqual(
          expect.stringContaining("TypeError [ERR_INVALID_URL]: Invalid URL")
        );
        done();
      }
    );
  });

  it("reports gzip error", done => {
    const spy = jest.spyOn(helpers, "gzip").mockImplementation(() => {
      throw new Error("a gzip error happened");
    });

    webpack(webpackConfig, (_err, output) => {
      expect(output?.compilation?.errors[0]).toEqual(
        expect.stringContaining("a gzip error happened")
      );
      spy.mockRestore();
      done();
    });
  });
});
