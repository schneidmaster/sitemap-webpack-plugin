# sitemap-webpack-plugin

Webpack plugin to generate a sitemap. Designed to work with [static-site-generator-webpack-plugin](https://github.com/markdalgleish/static-site-generator-webpack-plugin/).

## Installation

    npm install sitemap-webpack-plugin --save-dev

## Usage

Add to your webpack config -- see below for an example. The plugin signature is:

    new SitemapPlugin(base, paths, filename)

* `base` is the root URL of your site (e.g. 'https://mysite.com')
* `paths` is the array of locations on your site -- this can be the same one you pass to `static-site-generator-webpack-plugin`
* `filename` is the name of the output file -- the default is `sitemap.xml`

### Options

* `beautify` [boolean] default `true`
* `lastMod` [boolean] default `false`
* `priority` [number] default `null`
* `changeFreq` [string] default `null`, list of applicable values based on [sitemaps.org](http://www.sitemaps.org/protocol.html)
* `xslt` [string] default `null`, stylesheet url for the sitemap xml file based on [w3.org](https://www.w3.org/2002/xmlspec/)

```
always
hourly
daily
weekly
monthly
yearly
never
```

### webpack.config.js

```js
var SitemapPlugin = require('sitemap-webpack-plugin');

var paths = [
  '/foo/',
  '/bar/'
];

module.exports = {

  /* snip */

  plugins: [
    new SitemapPlugin('https://mysite.com', paths, 'map.xml')
  ]

  /* with options */

  plugins: [
    new SitemapPlugin(
      'https://mysite.com',paths, 'map.xml',
      {
        beautify: true,
        lastMod: true,
        changeFreq: 'monthly',
        priority: 0.4,
        xslt: '/url/to/xsl-stylesheet.xsl'
      }
    )
  ]

};
```



## Contributing

1. Fork it ( https://github.com/schneidmaster/sitemap-webpack-plugin/fork )
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request
