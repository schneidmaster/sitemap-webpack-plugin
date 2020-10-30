/* eslint-env jest */

import webpack from "webpack";
import clean from "rimraf";
import getSubDirsSync from "./utils/get-sub-dirs-sync";
import directoryContains from "./utils/directory-contains";

const successCases = getSubDirsSync(`${__dirname}/cases`);

const OriginalDate = Date;

describe("Success cases", () => {
  successCases.forEach(successCase => {
    const desc = require(`./cases/${successCase}/desc.js`).default;

    describe(desc, () => {
      beforeEach(done => {
        if (successCase === "global-opts") {
          const mockDate = new Date(1577836800000);
          global.Date = class extends Date {
            constructor() {
              return mockDate;
            }
          };
        } else {
          global.Date = OriginalDate;
        }

        clean(`${__dirname}/cases/${successCase}/actual-output`, done);
      });

      it("generates the expected sitemap", done => {
        const webpackConfig = require(`./cases/${successCase}/webpack.config.js`)
          .default;

        webpack(webpackConfig, err => {
          if (err) {
            return done(err);
          }

          const caseDir = `${__dirname}/cases/${successCase}`;
          const expectedDir = `${caseDir}/expected-output/`;
          const actualDir = `${caseDir}/actual-output/`;

          directoryContains(expectedDir, actualDir, (err, result) => {
            if (err) {
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
