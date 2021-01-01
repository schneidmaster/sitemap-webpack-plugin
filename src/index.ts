import { JSONSchema7 } from "json-schema";
import { validate } from "schema-utils";
import {
  SitemapStream,
  SitemapIndexStream,
  SitemapItemLoose,
  EnumChangefreq,
  isValidChangeFreq
} from "sitemap";
import { sources, version, Compiler, Compilation } from "webpack";
import webpackSources from "webpack-sources";
import { promisify } from "util";
import { gzip as gzipCallback } from "zlib";
import schema from "./schema.json";

type Gzip = (text: string) => Promise<Buffer>;
const gzip: Gzip = promisify(gzipCallback);

// Webpack 4/5 compat
// https://github.com/webpack/webpack/issues/11425#issuecomment-686607633
// istanbul ignore next
const { RawSource } = sources || webpackSources;

type SitemapOpts = Omit<SitemapItemLoose, "url" | "lastmod" | "changefreq"> & {
  lastmod?: string | boolean;
  changefreq?: string | EnumChangefreq;
};

type PathOpts = SitemapOpts & {
  path: string;
};

type Path = string | PathOpts;

type ConfigurationOptions = SitemapOpts & {
  filename?: string;
  skipgzip?: boolean;
  formatter?: (code: string) => string;
};

type Configuration = {
  base: string;
  paths: Array<Path>;
  options?: ConfigurationOptions;
};

function assertValidChangefreq(
  changefreq: string
): asserts changefreq is EnumChangefreq {
  if (!isValidChangeFreq(changefreq)) {
    throw new Error(`Invalid changefreq option: ${changefreq}`);
  }
}

function streamToString(
  stream: SitemapIndexStream | SitemapStream
): Promise<string> {
  let str = "";

  return new Promise(resolve => {
    stream.on("data", (data: Buffer) => {
      str += data.toString();
    });

    stream.on("end", () => {
      resolve(str);
    });
  });
}

export default class SitemapWebpackPlugin {
  private base: string;
  private paths: Array<Path>;
  private filename: string;
  private skipgzip: boolean;
  private formatter?: (code: string) => string;
  private lastmod?: string;
  private changefreq?: EnumChangefreq;
  private priority?: number;
  private options: SitemapOpts;

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
    if (changefreq) {
      assertValidChangefreq(changefreq);
      this.changefreq = changefreq;
    }
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
      if (changefreq) {
        assertValidChangefreq(changefreq);
      }
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
    let sitemap = await streamToString(sitemapStream);

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

  async run(compilation: Compilation): Promise<void> {
    let sitemaps: Array<string> = [];
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

    if (this.skipgzip !== true) {
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

  apply(compiler: Compiler): void {
    switch (version[0]) {
      case "5":
        compiler.hooks.compilation.tap(
          "sitemap-webpack-plugin",
          compilation => {
            compilation.hooks.processAssets.tapPromise(
              {
                name: "sitemap-webpack-plugin",
                stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL
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
