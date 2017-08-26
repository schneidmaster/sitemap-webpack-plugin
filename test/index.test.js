/* eslint-env jest */

import webpack from 'webpack';
import clean from 'rimraf';
import getSubDirsSync from './utils/get-sub-dirs-sync';
import directoryContains from './utils/directory-contains';

const successCases = getSubDirsSync(`${__dirname}/success-cases`);
const errorCases = getSubDirsSync(`${__dirname}/error-cases`);

describe('Success cases', () => {
  successCases.forEach((successCase) => {
    const desc = require(`./success-cases/${successCase}/desc.js`).default;

    describe(desc, () => {
      beforeEach((done) => {
        clean(`${__dirname}/success-cases/${successCase}/actual-output`, done);
      });

      it('generates the expected sitemap', (done) => {
        const webpackConfig = require(`./success-cases/${successCase}/webpack.config.js`).default;

        webpack(webpackConfig, (err) => {
          if(err) {
            return done(err);
          }

          const caseDir = `${__dirname}/success-cases/${successCase}`;
          const expectedDir = `${caseDir}/expected-output/`;
          const actualDir = `${caseDir}/actual-output/`;

          directoryContains(expectedDir, actualDir, (err, result) => {
            if(err) {
              return done(err);
            }

            expect(result).toEqual(true);
            done();
          });
        });
      });
    });
  });
});

describe('Error cases', () => {
  errorCases.forEach((errorCase) => {
    const desc = require(`./error-cases/${errorCase}/desc.js`).default;

    describe(desc, () => {
      beforeEach((done) => {
        clean(`${__dirname}/error-cases/${errorCase}/actual-output`, done);
      });

      it('generates the expected error', (done) => {
        const webpackConfig = require(`./error-cases/${errorCase}/webpack.config.js`).default;
        const expectedError = require(`./error-cases/${errorCase}/expected-error.js`).default;

        webpack(webpackConfig, (_err, stats) => {
          const actualError = stats.compilation.errors[0].toString().split('\n')[0];
          expect(actualError).toEqual(expectedError);
          done();
        });
      });
    });
  });
});
