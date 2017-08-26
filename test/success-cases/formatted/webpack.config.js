import SitemapPlugin from '../../../src/';
import { StatsWriterPlugin } from 'webpack-stats-plugin';
import prettydata from 'pretty-data';

const prettyPrint = (xml) => {
  return prettydata.pd.xml(xml);
};

export default {
  output: {
    filename: 'index.js',
    path: `${__dirname}/actual-output`,
    libraryTarget: 'umd',
  },

  plugins: [
    new SitemapPlugin('https://mysite.com', ['/', '/about'], {
      formatter: prettyPrint,
    }),
    new StatsWriterPlugin(), // Causes the asset's `size` method to be called
  ],
};
