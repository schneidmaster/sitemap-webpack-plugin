[![npm version](https://badge.fury.io/js/sitemap-webpack-plugin.svg)](https://badge.fury.io/js/sitemap-webpack-plugin) [![CircleCI](https://circleci.com/gh/schneidmaster/sitemap-webpack-plugin.svg?style=shield)](https://circleci.com/gh/schneidmaster/sitemap-webpack-plugin) [![Coverage Status](https://coveralls.io/repos/github/schneidmaster/sitemap-webpack-plugin/badge.svg)](https://coveralls.io/github/schneidmaster/sitemap-webpack-plugin)

# sitemap-webpack-plugin

Webpack plugin to generate a sitemap from a list of paths.

## Installation

    npm install sitemap-webpack-plugin --save-dev

For webpack 4 or 5, use the latest version. For webpack <= 3, use version 0.5.x.

## Usage

Add to your webpack config -- see below for examples. The plugin signature is:

    new SitemapPlugin({ base, paths, options })

* `base` is the root URL of your site (e.g. `https://mysite.com`)
* `paths` is the array of locations on your site. These can be simple strings or you can provide objects if you would like to customize each entry; objects must have a `path` attribute and may have other attributes documented [below](#path-specific-options).
* `options` is an optional object of top-level configuration settings.

### Options

The following options may be provided in the `options` argument to the plugin constructor. This library uses the [sitemap](https://www.npmjs.com/package/sitemap) package under the hood, so you can also provide [any other options](https://www.npmjs.com/package/sitemap#example-of-most-of-the-options-you-can-use-for-sitemap) that `sitemap` supports.

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `filename` | `string` | `sitemap.xml` | Name of the sitemap file emitted to your build output |
| `skipgzip` | `boolean` | `false` | Whether to skip generating a gzipped `.xml.gz` sitemap. (By default, both an uncompressed and a compressed sitemap are generated -- the compressed version is generated at `sitemap.xml.gz`, or `[filename].gz` if the `filename` configuration option is set.) |
| `formatter` | `function` | `undefined` | An optional function to format the generated sitemap before it is emitted (for example, if you'd like to pretty-print the XML). The provided function must accept one argument (the unformatted XML) and return the formatted XML as a string. For an example of pretty-printing configuration, see the [formatted test](https://github.com/schneidmaster/sitemap-webpack-plugin/blob/master/test/cases/formatted/webpack.config.ts). |
| `lastmod` | `string` / `boolean` | `false` | The date value for `<lastmod>` on all paths. Can be overridden by path-specific `lastmod` setting. If set to boolean `true`, the current date will be used for all paths; otherwise, the provided date string will be used. |
| `priority` | `number` | `undefined` | A `<priority>` to be set globally on all locations. Can be overridden by path-specific `priority`. |
| `changefreq` | `string` | `undefined` | A `<changefreq>` to be set globally on all locations; list of applicable values based on [sitemaps.org](http://www.sitemaps.org/protocol.html): `always`, `hourly`, `daily`, `weekly`, `monthly`, `yearly`, `never`. Can be overridden by path-specific `changefreq`. |

### Path-specific options

If you choose to provide the paths as an array of objects, the following attributes may be set on each path object. This library uses the [sitemap](https://www.npmjs.com/package/sitemap) package under the hood, so you can also provide [any other options](https://www.npmjs.com/package/sitemap#example-of-most-of-the-options-you-can-use-for-sitemap) that `sitemap` supports.

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `path` (required) | `string` | N/A | The URL path, e.g. `/some/page` |
| `lastmod` | `string` | `false` | The date value for `<lastmod>` -- when this path was last modified. |
| `priority` | `number` | `undefined` | A numerical `<priority>` to be set on the path. |
| `changefreq` | `string` | `undefined` | The `<changefreq>` to be set on the path; list of applicable values based on [sitemaps.org](http://www.sitemaps.org/protocol.html): `always`, `hourly`, `daily`, `weekly`, `monthly`, `yearly`, `never`. |

### Example webpack.config.js

```js
const SitemapPlugin = require('sitemap-webpack-plugin').default;

// Example of simple string paths
const paths = [
  '/foo/',
  '/bar/'
];

// Example of object paths
// Object paths must have a `path` attribute -- others are optional,
// and fall back to global config (if any)
const paths = [
  {
    path: '/foo/',
    lastmod: '2015-01-04',
    priority: 0.8,
    changefreq: 'monthly'
  },
  {
    path: '/bar/',
    lastmod: '2018-02-05',
    priority: 0.5,
    changefreq: 'yearly'
  }
];

// Example webpack configuration -- input/output/etc. omitted for brevity.
export default {
  // Basic usage (output defaults to sitemap.xml)
  plugins: [
    new SitemapPlugin({ base: 'https://mysite.com', paths })
  ]

  // With custom output filename
  plugins: [
    new SitemapPlugin({
      base: 'https://mysite.com',
      paths,
      options: {
        filename: 'map.xml'
      }
    })
  ]

  // Skip generating a gzipped version of the sitemap
  plugins: [
    new SitemapPlugin({
      base: 'https://mysite.com',
      paths,
      options: {
        skipgzip: true
      }
    })
  ]

  // With global options
  plugins: [
    new SitemapPlugin({
      base: 'https://mysite.com',
      paths,
      options: {
        filename: 'map.xml',
        lastmod: true,
        changefreq: 'monthly',
        priority: 0.4
      }
    })
  ]
};
```

## Contributing

1. Fork the repository (https://github.com/schneidmaster/sitemap-webpack-plugin/fork)
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new pull request

## License

MIT
