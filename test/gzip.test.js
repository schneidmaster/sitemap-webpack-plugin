/* global jest describe it expect */

import webpack from 'webpack';

jest.mock('zlib', () => {
  return {
    gzip: (input, callback) => {
      callback({
        stack: 'a gzip error happened'
      });
    }
  };
});

describe('Gzip error', () => {
  it('reports error', (done) => {
    const webpackConfig = require('./success-cases/basic/webpack.config.js').default;

    webpack(webpackConfig, (_err, output) => {
      expect(output.compilation.errors[0]).toEqual('a gzip error happened');
      done();
    });
  });
});
