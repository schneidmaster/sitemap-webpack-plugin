/* global describe it beforeEach afterEach */

import { expect } from 'chai';
import Timecop from 'timecop';

import generateDate from '../src/date';

describe('generateDate', () => {
  beforeEach( (done) => {
    Timecop.install();
    done();
  });

  it('generates the current date in the correct format', (done) => {
    Timecop.freeze(new Date(2012, 1, 5, 14, 30));
    expect(generateDate()).to.eq('2012-02-05');
    done();
  });

  afterEach( (done) => {
    Timecop.uninstall();
    done();
  });
});
