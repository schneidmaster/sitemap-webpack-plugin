import { JSONSchema7 } from "json-schema";
import { validate } from "schema-utils";
import {
  SitemapStream,
  SitemapIndexStream,
  SitemapItemLoose,
  EnumChangefreq,
  streamToPromise
} from "sitemap";
import * as webpack from "webpack";
import webpackSources from "webpack-sources";
import * as util from "util";
import * as zlib from "zlib";
import schema from "./schema.json";

type Gzip = (text: string) => Promise<Buffer>;
const gzip: Gzip = util.promisify(zlib.gzip);

// Webpack 4/5 compat
// https://github.com/webpack/webpack/issues/11425#issuecomment-686607633
// istanbul ignore next
const { RawSource } = webpack.sources || webpackSources;

type PathOpts = {
  changefreq?: EnumChangefreq;
  lastmod?: string;
  priority?: number;
};

type Path =
  | string
  | (PathOpts & {
      path: string;
    });

type ConfigurationOptions = SitemapItemLoose & {
  filename?: string;
  skipgzip?: boolean;
  formatter?: (code: string) => string;
  lastmod?: null | string | boolean;
  changefreq?: EnumChangefreq;
  priority?: number;
};

type Configuration = {
  base: string;
  paths: Array<Path>;
  options: ConfigurationOptions;
};

export default class SitemapWebpackPlugin {
  private base: string;
  private paths: Array<Path>;
  private filename: string;
  private skipgzip: boolean;
  private formatter?: (code: string) => string;
  private lastmod?: string;
  private changefreq?: EnumChangefreq;
  private priority?: number;
  private options: SitemapItemLoose;

  constructor(configuration: Configuration) {
    validate(schema as JSONSchema7, configuration, {
      name: "SitemapWebpackPlugin"
    });

    const { base, paths, options = {} as ConfigurationOptions } = configuration;

    // Set mandatory values
    this.base = base;
    this.paths = paths;

    const {
      filename,
      skipgzip,
      formatter,
      lastmod,
      changefreq,
      priority,
      ...rest
    } = options;
    this.filename = filename ? filename.replace(/\.xml$/, "") : "sitemap";
    this.skipgzip = skipgzip || false;
    this.formatter = formatter;
    if (lastmod) {
      if (typeof lastmod === "string") {
        this.lastmod = lastmod;
      } else {
        this.lastmod = new Date().toISOString().split("T")[0];
      }
    }
    this.changefreq = changefreq;
    this.priority = priority;
    this.options = rest;
  }

  async generateSitemap(paths: Array<Path>): Promise<string> {
    const sitemap = new SitemapStream({ hostname: this.base });

    paths.forEach(path => {
      if (typeof path === "string") {
        path = { path };
      }

      const { path: url, changefreq, lastmod, priority, ...rest } = path;

      const sitemapOptions = {
        ...this.options,
        ...rest,
        url
      };
      if (changefreq || this.changefreq) {
        sitemapOptions.changefreq = changefreq || this.changefreq;
      }
      if (lastmod || this.lastmod) {
        sitemapOptions.lastmod = lastmod || this.lastmod;
      }
      if (priority || this.priority) {
        sitemapOptions.priority = priority || this.priority;
      }
      sitemap.write(sitemapOptions);
    });

    sitemap.end();
    return this.sitemapStreamToString(sitemap);
  }

  async sitemapStreamToString(
    sitemapStream: SitemapIndexStream | SitemapStream
  ): Promise<string> {
    const sitemapBuffer = await streamToPromise(sitemapStream);
    let sitemap = sitemapBuffer.toString();

    if (this.formatter) {
      sitemap = this.formatter(sitemap);
    }

    return sitemap;
  }

  async generate(publicPath: string): Promise<Array<string>> {
    if (this.base.substr(-1) === "/") {
      this.base = this.base.replace(/\/$/, "");
    }

    if (this.paths.length <= 50000) {
      const sitemap = await this.generateSitemap(this.paths);
      return [sitemap];
    } else {
      const output = [];
      const indexExt = this.skipgzip ? "xml" : "xml.gz";

      const sitemapIndex = new SitemapIndexStream();
      let index = 1;

      for (let i = 0; i < this.paths.length; i += 45000) {
        const sitemap = await this.generateSitemap(
          this.paths.slice(i, i + 45000)
        );
        output.push(sitemap);

        sitemapIndex.write(
          `${this.base}${publicPath}/${this.filename}-${index}.${indexExt}`
        );
        index++;
      }

      sitemapIndex.end();
      const sitemapIndexStr = await this.sitemapStreamToString(sitemapIndex);
      output.unshift(sitemapIndexStr);

      return output;
    }
  }

  async run(compilation: webpack.Compilation): Promise<void> {
    let sitemaps = null;

    let publicPath = "";

    if (
      compilation.options.output &&
      compilation.options.output.publicPath &&
      compilation.options.output.publicPath !== "auto"
    ) {
      publicPath = (compilation.options.output.publicPath as string).replace(
        /\/$/,
        ""
      );
    }

    try {
      sitemaps = await this.generate(publicPath);

      sitemaps.forEach((sitemap, idx) => {
        const sitemapFilename =
          idx === 0 ? `${this.filename}.xml` : `${this.filename}-${idx}.xml`;
        compilation.emitAsset(sitemapFilename, new RawSource(sitemap, false));
      });
    } catch (err) {
      compilation.errors.push(err.stack);
    }

    if (sitemaps !== null && this.skipgzip !== true) {
      for (let idx = 0; idx < sitemaps.length; idx++) {
        const sitemap = sitemaps[idx];
        const sitemapFilename =
          idx === 0
            ? `${this.filename}.xml.gz`
            : `${this.filename}-${idx}.xml.gz`;
        try {
          const compressed = await gzip(sitemap);
          compilation.emitAsset(
            sitemapFilename,
            new RawSource(compressed, false)
          );
        } catch (err) {
          compilation.errors.push(err.stack);
        }
      }
    }
  }

  apply(compiler: webpack.Compiler): void {
    switch (webpack.version[0]) {
      case "5":
        compiler.hooks.compilation.tap(
          "sitemap-webpack-plugin",
          compilation => {
            compilation.hooks.processAssets.tapPromise(
              {
                name: "sitemap-webpack-plugin",
                stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL
              },
              async () => this.run(compilation)
            );
          }
        );
        break;

      // istanbul ignore next
      case "4":
        compiler.hooks.emit.tapPromise(
          "sitemap-webpack-plugin",
          async compilation => this.run(compilation)
        );
        break;

      // istanbul ignore next
      default:
        throw new Error("Unsupported webpack version; must be 4 or 5");
    }
  }
}
