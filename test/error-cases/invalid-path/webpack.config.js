import SitemapPlugin from '../../../src/';

export default {
  output: {
    filename: 'index.js',
    path: `${__dirname}/actual-output`,
    libraryTarget: 'umd',
  },

  plugins: [
    new SitemapPlugin('https://mysite.com', [42]),
  ],
};
