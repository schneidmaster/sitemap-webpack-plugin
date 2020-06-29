import { SitemapStream, SitemapIndexStream } from "sitemap";
import { RawSource } from "webpack-sources";
import zlib from "zlib";

const normalizeOptions = (options, keys) => {
  keys.forEach(key => {
    if (options[key]) {
      options[key.toLowerCase()] = options[key];
      delete options[key];
    }
  });
  return options;
};

const streamToString = stream => {
  let str = "";

  return new Promise(resolve => {
    stream.on("data", data => {
      str += data.toString();
    });

    stream.on("end", () => {
      resolve(str);
    });
  });
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
    options = normalizeOptions(options, [
      "changeFreq",
      "fileName",
      "lastMod",
      "skipGzip"
    ]);

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
    this.formatter = formatter || null;
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

  generateSitemap(paths) {
    const sitemap = new SitemapStream({ hostname: this.base });

    paths.forEach(path => {
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
        sitemapOptions.priority = parseFloat(priority || this.priority);
      }
      sitemap.write(sitemapOptions);
    });

    sitemap.end();
    return this.sitemapStreamToString(sitemap);
  }

  async sitemapStreamToString(sitemapStream) {
    let sitemap = await streamToString(sitemapStream);

    if (this.formatter !== null) {
      sitemap = this.formatter(sitemap);
    }

    return sitemap;
  }

  async generate(publicPath) {
    // Validate configuration
    if (typeof this.base !== "string") {
      throw new Error("Provided base URL is not a string");
    } else if (this.base.substr(-1) === "/") {
      this.base = this.base.replace(/\/$/, "");
    }
    if (!Array.isArray(this.paths)) {
      throw new Error("Provided paths are not an array");
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

  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      "sitemap-webpack-plugin",
      async (compilation, callback) => {
        let sitemaps = null;

        const publicPath = (
          (compilation.options.output &&
            compilation.options.output.publicPath) ||
          ""
        ).replace(/\/$/, "");

        try {
          sitemaps = await this.generate(publicPath);

          sitemaps.forEach((sitemap, idx) => {
            const sitemapFilename =
              idx === 0
                ? `${this.filename}.xml`
                : `${this.filename}-${idx}.xml`;
            compilation.fileDependencies.add(sitemapFilename);
            compilation.assets[sitemapFilename] = new RawSource(sitemap);
          });
        } catch (err) {
          compilation.errors.push(err.stack);
        }

        if (sitemaps !== null && this.skipgzip !== true) {
          let sitemapsZipped = 0;
          sitemaps.forEach((sitemap, idx) => {
            const sitemapFilename =
              idx === 0
                ? `${this.filename}.xml.gz`
                : `${this.filename}-${idx}.xml.gz`;
            zlib.gzip(sitemap, (err, compressed) => {
              if (err) {
                compilation.errors.push(err.stack);
              } else {
                compilation.assets[sitemapFilename] = new RawSource(compressed);
              }

              sitemapsZipped++;
              if (sitemapsZipped === sitemaps.length) {
                callback();
              }
            });
          });
        } else {
          callback();
        }
      }
    );
  }
}
