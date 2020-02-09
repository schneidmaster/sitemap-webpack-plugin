import { SitemapStream, streamToPromise } from "sitemap";
import zlib from "zlib";
import generateDate from "./date";

const normalizeOptions = (options, keys) => {
  keys.forEach(key => {
    if (options[key]) {
      options[key.toLowerCase()] = options[key];
      delete options[key];
    }
  });
  return options;
};

export default class SitemapWebpackPlugin {
  constructor(base, paths, options) {
    // Set mandatory values
    this.base = base;
    this.paths = paths;

    // Set options
    if (typeof options === "undefined") {
      options = {};
    }
    options = normalizeOptions(options, ["lastMod", "changeFreq"]);

    const {
      fileName,
      skipGzip,
      formatter,
      lastmod,
      changefreq,
      priority,
      ...rest
    } = options;
    this.fileName = fileName || "sitemap.xml";
    this.skipGzip = skipGzip || false;
    this.formatter = formatter || null;
    if (lastmod) {
      this.lastmod = generateDate();
    }
    this.changefreq = changefreq;
    this.priority = priority;
    this.options = rest;
  }

  async generate() {
    // Validate configuration
    if (typeof this.base !== "string") {
      throw new Error("Provided base URL is not a string");
    } else if (this.base.substr(-1) === "/") {
      this.base = this.base.replace(/\/$/, "");
    }
    if (!Array.isArray(this.paths)) {
      throw new Error("Provided paths are not an array");
    }

    const sitemap = new SitemapStream({ hostname: this.base });

    this.paths.forEach(path => {
      if (typeof path === "object") {
        if (typeof path.path !== "string") {
          throw new Error(`Path is not a string: ${path}`);
        } else {
          // Clone the object so we can mutate it below without
          // potentially messing up the original we were given.
          path = { ...path };
        }
      } else if (typeof path === "string") {
        path = { path: path };
      } else {
        throw new Error(`Path is not a string: ${path}`);
      }

      path = normalizeOptions(path, ["changeFreq", "lastMod"]);
      const { path: url, changefreq, lastmod, priority, ...rest } = path;

      sitemap.write({
        ...this.options,
        ...rest,
        url,
        changefreq: changefreq || this.changefreq,
        lastmod: lastmod || this.lastmod,
        priority: priority || this.priority
      });
    });

    sitemap.end();
    let output = await streamToPromise(sitemap);
    output = output.toString();
    if (this.formatter !== null) {
      output = this.formatter(output);
    }
    return output;
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      "sitemap-webpack-plugin",
      async (compilation, callback) => {
        let sitemap = null;

        try {
          sitemap = await this.generate();

          compilation.fileDependencies.add(this.fileName);
          compilation.assets[this.fileName] = {
            source: () => {
              return sitemap;
            },
            size: () => {
              return Buffer.byteLength(sitemap, "utf8");
            }
          };
        } catch (err) {
          compilation.errors.push(err.stack);
        }

        if (sitemap !== null && this.skipGzip !== true) {
          zlib.gzip(sitemap, (err, compressed) => {
            if (err) {
              compilation.errors.push(err.stack);
            } else {
              compilation.assets[`${this.fileName}.gz`] = {
                source: () => {
                  return compressed;
                },
                size: () => {
                  return Buffer.byteLength(compressed);
                }
              };
            }
            callback();
          });
        } else {
          callback();
        }
      }
    );
  }
}
