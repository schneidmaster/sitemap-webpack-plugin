import zlib from 'zlib';
import generateDate from './date';

export default class SitemapWebpackPlugin {
  constructor(base, paths, options) {
    // Set mandatory values
    this.base = base;
    this.paths = paths;

    // Set options
    if(typeof options === 'undefined') {
      options = {};
    }
    this.fileName = options.fileName || 'sitemap.xml';
    this.lastMod = options.lastMod || false;
    this.changeFreq = options.changeFreq || null;
    this.priority = options.priority || null;
    this.skipGzip = options.skipGzip || false;
    this.formatter = options.formatter || null;
  }

  generate() {
    // Validate configuration
    if(typeof this.base !== 'string') {
      throw new Error('Provided base URL is not a string');
    } else if(this.base.substr(-1) === '/') {
      this.base = this.base.replace(/\/$/, '');
    }
    if(!Array.isArray(this.paths)) {
      throw new Error('Provided paths are not an array');
    }

    // Create sitemap from paths
    let out = '<?xml version="1.0" encoding="UTF-8"?>';
    out += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

    const locs = this.paths.map((path) => {
      if(typeof path === 'object') {
        if(typeof path.path !== 'string') {
          throw new Error(`Path is not a string: ${path}`);
        }
      } else if(typeof path === 'string') {
        path = { path: path };
      } else {
        throw new Error(`Path is not a string: ${path}`);
      }

      let loc = '<url>';

      let stringPath = path.path;
      if(stringPath.substr(0, 1) !== '/') {
        stringPath = `/${path.path}`;
      }
      loc += `<loc>${this.base}${stringPath}</loc>`;

      // Add loc lastMod or default if set.
      if(path.lastMod) {
        loc += `<lastmod>${path.lastMod}</lastmod>`;
      } else if(this.lastMod) {
        loc += `<lastmod>${generateDate()}</lastmod>`;
      }

      // Add loc changeFreq or default if set.
      if(path.changeFreq) {
        loc += `<changefreq>${path.changeFreq}</changefreq>`;
      } else if(this.changeFreq) {
        loc += `<changefreq>${this.changeFreq}</changefreq>`;
      }

      // Add loc priority or default if set.
      if(path.priority) {
        loc += `<priority>${path.priority}</priority>`;
      } else if(this.priority) {
        loc += `<priority>${this.priority}</priority>`;
      }

      loc += '</url>';
      return loc;
    });

    out += locs.join('');
    out += '</urlset>';

    if(this.formatter !== null) {
      out = this.formatter(out);
    }

    return out;
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync('sitemap-webpack-plugin', (compilation, callback) => {
      let sitemap = null;

      try {
        sitemap = this.generate();

        compilation.fileDependencies.add(this.fileName);
        compilation.assets[this.fileName] = {
          source: () => {
            return sitemap;
          },
          size: () => {
            return Buffer.byteLength(sitemap, 'utf8');
          },
        };
      } catch (err) {
        compilation.errors.push(err.stack);
      }

      if(sitemap !== null && this.skipGzip !== true) {
        zlib.gzip(sitemap, (err, compressed) => {
          if(err) {
            compilation.errors.push(err.stack);
          } else {
            compilation.assets[`${this.fileName}.gz`] = {
              source: () => {
                return compressed;
              },
              size: () => {
                return Buffer.byteLength(compressed);
              },
            };
          }
          callback();
        });
      } else {
        callback();
      }
    });
  }
}
