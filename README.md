[![npm version](https://badge.fury.io/js/sitemap-webpack-plugin.svg)](https://badge.fury.io/js/sitemap-webpack-plugin) [![CircleCI](https://circleci.com/gh/schneidmaster/sitemap-webpack-plugin.svg?style=shield)](https://circleci.com/gh/schneidmaster/sitemap-webpack-plugin) [![Coverage Status](https://coveralls.io/repos/github/schneidmaster/sitemap-webpack-plugin/badge.svg)](https://coveralls.io/github/schneidmaster/sitemap-webpack-plugin)

# sitemap-webpack-plugin

Webpack plugin to generate a sitemap. Designed to work with [static-site-generator-webpack-plugin](https://github.com/markdalgleish/static-site-generator-webpack-plugin/) (although it also works great by itself).

## Installation

    npm install sitemap-webpack-plugin --save-dev

For webpack 4, use version 0.6 or greater. For webpack <= 3, use version 0.5.x.

## Usage

Add to your webpack config -- see below for examples. The plugin signature is:

    new SitemapPlugin(base, paths, options)

* `base` is the root URL of your site (e.g. 'https://mysite.com')
* `paths` is the array of locations on your site -- this can be the same one you pass to `static-site-generator-webpack-plugin`. If you want to customize each path in the sitemap, you can also pass an array of objects; objects must have a `path` attribute and may have a `lastMod`, `priority`, and/or `changeFreq` attribute. (However, an array of objects will not be directly compatible with `static-site-generator-webpack-plugin`.)
* `options` is an optional object of configurable options -- see below

### Options

* `fileName` (string) -- default `sitemap.xml` -- name of the output file
* `lastMod` (boolean) -- default `false` -- whether to include the current date as the `<lastmod>`. Can be overridden by path-specific `lastMod`.
* `priority` (number) -- default `null` -- a `<priority>` to be set globally on all locations. Can be overridden by path-specific `priority`.
* `changeFreq` (string) -- default `null` -- a `<changefreq>` to be set globally on all locations; list of applicable values based on [sitemaps.org](http://www.sitemaps.org/protocol.html): `always`, `hourly`, `daily`, `weekly`, `monthly`, `yearly`, `never`. Can be overridden by path-specific `changeFreq`.
* `skipGzip` (boolean) -- default `false` -- whether to skip generating a gzipped `.xml.gz` sitemap. (By default, both an uncompressed and a compressed sitemap are generated -- the compressed version is generated at `sitemap.xml.gz`, or `[fileName].gz` if the `fileName` configuration option is set.)
* `formatter` (function) -- default `null` -- an optional function to format the generated sitemap before it is emitted (for example, if you'd like to pretty-print the XML). The provided function must accept one argument (the unformatted XML) and return the formatted XML as a string. For an example of pretty-printing configuration, see the [formatted test](https://github.com/schneidmaster/sitemap-webpack-plugin/blob/master/test/success-cases/formatted/webpack.config.js).

### webpack.config.js

```js
import SitemapPlugin from 'sitemap-webpack-plugin';

// If you are not using babel, note that the plugin is exported on default so you will need e.g. 
const SitemapWebpackPlugin = require('sitemap-webpack-plugin').default;

/* basic paths -- directly compatible with static-site-generator-webpack-plugin */
const paths = [
  '/foo/',
  '/bar/'
];

/* object paths -- more fine-grained but not directly compatible with static-site-generator-webpack-plugin */
/* object paths must have a `path` attribute -- others are optional, and fall back to global config (if any) */
const paths = [
  {
    path: '/foo/',
    lastMod: '2015-01-04',
    priority: '0.8',
    changeFreq: 'monthly'
  }
];

/* you can also convert object paths back into static-site-generator-webpack-plugin compatible paths */
const staticSiteGeneratorCompatiblePaths = paths.map(({path}) => path);

export default {

  /* snip */

  /* basic (output defaults to sitemap.xml) */
  plugins: [
    new SitemapPlugin('https://mysite.com', paths)
  ]

  /* with custom output filename */
  plugins: [
    new SitemapPlugin('https://mysite.com', paths, {
      fileName: 'map.xml'
    })
  ]

  /* skip generating a gzipped version of the sitemap */
  plugins: [
    new SitemapPlugin('https://mysite.com', paths, {
      skipGzip: true
    })
  ]

  /* with global options */
  plugins: [
    new SitemapPlugin('https://mysite.com', paths, {
      fileName: 'map.xml',
      lastMod: true,
      changeFreq: 'monthly',
      priority: '0.4'
    })
  ]

};
```

## Contributing

1. Fork it (https://github.com/schneidmaster/sitemap-webpack-plugin/fork)
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request
