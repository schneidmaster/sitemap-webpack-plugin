/* eslint-env jest */

import Timekeeper from 'timekeeper';

import generateDate from '../src/date';

describe('generateDate', () => {
  it('generates the current date in the correct format', (done) => {
    Timekeeper.freeze(new Date(2012, 1, 5, 14, 30));
    expect(generateDate()).toEqual('2012-02-05');
    Timekeeper.reset();
    done();
  });
});
