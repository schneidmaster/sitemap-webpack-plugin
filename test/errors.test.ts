import webpack from "webpack";
import webpackConfig from "./cases/basic/webpack.config";
import * as generators from "../src/generators";
import * as helpers from "../src/helpers";

describe("Errors", () => {
  it("reports generation error", done => {
    const spy = jest
      .spyOn(generators, "generateSitemaps")
      .mockImplementation(() => {
        throw new Error("a generation error happened");
      });

    webpack(webpackConfig, (_err, output) => {
      expect(output?.compilation?.errors[0]).toEqual(
        expect.stringContaining("Error: a generation error happened")
      );
      spy.mockRestore();
      done();
    });
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
