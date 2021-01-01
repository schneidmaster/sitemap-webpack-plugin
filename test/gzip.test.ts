import webpack from "webpack";
import webpackConfig from "./cases/basic/webpack.config";

jest.mock("zlib", () => {
  return {
    gzip: (
      input: string,
      callback: (error?: Error, result?: Buffer) => void
    ) => {
      callback(new Error("a gzip error happened"));
    }
  };
});

describe("Gzip error", () => {
  it("reports error", done => {
    webpack(webpackConfig, (_err, output) => {
      expect(output?.compilation?.errors[0]).toEqual(
        expect.stringContaining("a gzip error happened")
      );
      done();
    });
  });
});
