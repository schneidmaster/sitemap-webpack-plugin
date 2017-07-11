/* global __dirname */

import SitemapPlugin from '../../../src/';
import { StatsWriterPlugin } from 'webpack-stats-plugin';

export default {
  output: {
    filename: 'index.js',
    path: `${__dirname}/actual-output`,
    libraryTarget: 'umd'
  },

  plugins: [
    new SitemapPlugin('https://mysite.com', ['/', '/about']),
    new StatsWriterPlugin() // Causes the asset's `size` method to be called
  ]
};
