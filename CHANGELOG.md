# Changelog

## 0.6.0

* Upgrade for compatibility with webpack 4 (breaks compatibility with webpack <=3)

## 0.5.1

* Fix bug where [gzip error would hang compilation](https://github.com/schneidmaster/sitemap-webpack-plugin/pull/11) rather than reporting and continuing

## 0.5.0

* Add optional [formatter configuration](https://github.com/schneidmaster/sitemap-webpack-plugin/pull/7)

## 0.4.0

* Convert plugin source [to ES6](https://github.com/schneidmaster/sitemap-webpack-plugin/pull/6)

## 0.3.0

* Emit gzipped sitemap alongside the unzipped file (skippable with `skipGzip` configuration)

## 0.2.2

* Ignore various [development files](https://github.com/schneidmaster/sitemap-webpack-plugin/commit/00dca118340b9ee5717a3e2e0b305728aa35c69d)

## 0.2.1

* Fix `size` function in emitted asset ([bug](https://github.com/schneidmaster/sitemap-webpack-plugin/commit/87ea98c70f9252a6063f033df590f9a020f89945) where wrong variable name was used)

## 0.2.0

* Change API to accept `base, paths, options` as arguments
* Add `fileName` configuration option
* Allow passing an array of path objects in addition to strings
* Misc other improvements

## 0.1.2

* Update lastmod date [string format](https://github.com/schneidmaster/sitemap-webpack-plugin/pull/3) to match W3C spec

## 0.1.1

* Add global [option properties](https://github.com/schneidmaster/sitemap-webpack-plugin/pull/1) for `lastMod`, `priority`, and `changeFreq`

## 0.1.0

* Initial release
