import { describe, expect, it } from './deps.ts';

import * as BSON from '../mod.ts';
const Long = BSON.Long;

describe('Long', function () {
  it('accepts strings in the constructor', function (done) {
    expect(new Long('0').toString()).toEqual('0');
    expect(new Long('00').toString()).toEqual('0');
    expect(new Long('-1').toString()).toEqual('-1');
    expect(new Long('-1', true).toString()).toEqual('18446744073709551615');
    expect(new Long('123456789123456789').toString()).toEqual(
      '123456789123456789',
    );
    expect(new Long('123456789123456789', true).toString()).toEqual(
      '123456789123456789',
    );
    expect(new Long('13835058055282163712').toString()).toEqual(
      '-4611686018427387904',
    );
    expect(new Long('13835058055282163712', true).toString()).toEqual(
      '13835058055282163712',
    );
  });
});
