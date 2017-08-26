/* eslint-env jest */

import webpack from 'webpack';

jest.mock('zlib', () => {
  return {
    gzip: (input, callback) => {
      callback(new Error('a gzip error happened'));
    },
  };
});

describe('Gzip error', () => {
  it('reports error', (done) => {
    const webpackConfig = require('./success-cases/basic/webpack.config.js').default;

    webpack(webpackConfig, (_err, output) => {
      expect(output.compilation.errors[0]).toEqual(expect.stringContaining('a gzip error happened'));
      done();
    });
  });
});
