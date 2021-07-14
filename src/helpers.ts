import {
  SitemapStream,
  SitemapIndexStream,
  EnumChangefreq,
  isValidChangeFreq
} from "sitemap";
import { promisify } from "util";
import { sources, Compilation } from "webpack";
import webpackSources from "webpack-sources";
import { gzip as gzipCallback } from "zlib";
import { Path, SitemapPathOptions } from "./types";

// Webpack 4/5 compat
// https://github.com/webpack/webpack/issues/11425#issuecomment-686607633
// istanbul ignore next
const { RawSource } = sources || webpackSources;
export { RawSource };

// gzip function that returns a Promise so it can be awaited
type Gzip = (text: string) => Promise<Buffer>;
export const gzip: Gzip = promisify(gzipCallback);

// Assertion function to ensure that a string is a valid changefreq.
export function assertValidChangefreq(
  changefreq: string
): asserts changefreq is EnumChangefreq {
  if (!isValidChangeFreq(changefreq)) {
    throw new Error(`Invalid changefreq option: ${changefreq}`);
  }
}

// Helper function to determine the publicPath from the compilation.
export function compilationPublicPath(compilation: Compilation): string {
  if (
    compilation.options.output &&
    compilation.options.output.publicPath &&
    compilation.options.output.publicPath !== "auto"
  ) {
    return (compilation.options.output.publicPath as string).replace(/\/$/, "");
  } else {
    return "";
  }
}

// Helper function to emit an asset to a compilation through either the old or new API.
export function compilationEmitAsset(
  compilation: Compilation,
  file: string,
  source: sources.Source
): void {
  if (compilation.emitAsset) {
    compilation.emitAsset(file, source);
  } else {
    compilation.assets[file] = source;
  }
}

// Helper to return an object of attributes combining path and global options.
export function pathAttributes(
  path: Path,
  globalOptions: SitemapPathOptions
): Record<string, unknown> {
  if (typeof path === "string") {
    path = { path };
  }

  const { path: url, changefreq, ...rest } = path;

  const pathAttributes = {
    ...globalOptions,
    ...rest,
    url
  };

  if (changefreq) {
    assertValidChangefreq(changefreq);
    pathAttributes.changefreq = changefreq;
  }

  return pathAttributes;
}

// Helper function to return the correct filename for a sitemap asset.
export function sitemapFilename(
  filename: string,
  extension: string,
  index: number
): string {
  if (index === 0) {
    return `${filename}.${extension}`;
  } else {
    return `${filename}-${index}.${extension}`;
  }
}

// Helper function to convert a stream from the sitemap library into a string
// that can be emitted by webpack.
export function sitemapStreamToString(
  stream: SitemapIndexStream | SitemapStream,
  formatter?: (code: string) => string
): Promise<string> {
  let str = "";

  return new Promise(resolve => {
    stream.on("data", (data: Buffer) => {
      str += data.toString();
    });

    stream.on("end", () => {
      if (formatter) {
        str = formatter(str);
      }

      resolve(str);
    });
  });
}
