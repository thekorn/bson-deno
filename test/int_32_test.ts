import { context, describe, expect, it } from './deps.ts';

import * as BSON from '../mod.ts';
const Int32 = BSON.Int32;

describe('Int32', function () {
  context('Constructor', function () {
    const strHexValue = '0x2a';
    const hexValue = 0x2a;
    const octalValue = 0o52;
    const value = 42;
    const upperBoundValue = 0x7fffffff;
    const lowerBoundValue = -0x80000000;
    const outOfUpperBoundValue = 0x80000000;
    const outOfLowerBoundValue = -0x80000001;

    it('should accept primitive numbers', function (done) {
      expect(new Int32(value).valueOf()).toEqual(value);
    });

    it('should accept number objects', function (done) {
      expect(new Int32(new Number(value) as number).valueOf()).toEqual(value);
    });

    it('should accept string Hex', function (done) {
      expect(new Int32(strHexValue).valueOf()).toEqual(value);
    });

    it('should accept hex', function (done) {
      expect(new Int32(hexValue).valueOf()).toEqual(value);
    });

    it('should accept octal', function (done) {
      expect(new Int32(octalValue).valueOf()).toEqual(value);
    });

    it('should accept int32 minimum input of -0x80000000', function (done) {
      expect(new Int32(lowerBoundValue).valueOf()).toEqual(lowerBoundValue);
    });

    it('should accept int32 maximum input of 0x7fffffff', function (done) {
      expect(new Int32(upperBoundValue).valueOf()).toEqual(upperBoundValue);
    });

    it(
      'should truncate the input bits to int32 for inputs smaller than -0x80000000',
      function (done) {
        expect(new Int32(outOfLowerBoundValue).valueOf()).toEqual(0x7fffffff);
      },
    );

    it(
      'should truncate the input bits to int32 for inputs larger than 0x7fffffff',
      function (done) {
        expect(new Int32(outOfUpperBoundValue).valueOf()).toEqual(-0x80000000);
      },
    );

    it('should equal zero', function () {
      const prop = 'key';
      const zero = BSON.serialize({ [prop]: new Int32(0) }).toString();
      // should equal zero
      ['fortyTwo', '42fortyTwo', '0', 0, Infinity, 'Infinity'].forEach(
        (value) => {
          expect(BSON.serialize({ [prop]: new Int32(value) }).toString())
            .toEqual(zero);
          expect(BSON.serialize({ [prop]: new Int32(+value) }).toString())
            .toEqual(zero);
        },
      );
    });

    it('should have serialization consistency across different representations of 42', function () {
      const prop = 'key';
      const fortyTwo = BSON.serialize({ [prop]: new Int32(value) }).toString();
      // should equal fortyTwo
      [strHexValue, hexValue, octalValue].forEach((value) => {
        expect(BSON.serialize({ [prop]: new Int32(value) }).toString()).toEqual(
          fortyTwo,
        );
        expect(BSON.serialize({ [prop]: new Int32(+value) }).toString())
          .toEqual(fortyTwo);
      });
    });
  });

  describe('toString', () => {
    it('should serialize to a string', () => {
      const testNumber = 0x7fffffff;
      const int32 = new Int32(testNumber);
      expect(int32.toString()).toEqual(testNumber.toString());
    });

    const testRadices = [2, 8, 10, 16, 22];

    for (const radix of testRadices) {
      it(`should support radix argument: ${radix}`, () => {
        const testNumber = 0x7fffffff;
        const int32 = new Int32(testNumber);
        expect(int32.toString(radix)).toEqual(testNumber.toString(radix));
      });
    }
  });
});
