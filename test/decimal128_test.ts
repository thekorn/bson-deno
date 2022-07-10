import { BSON, describe, expect, it } from './deps.ts';

import { Buffer } from 'https://esm.sh/buffer@6.0.3';

const Decimal128 = BSON.Decimal128;

var NAN = Buffer.from(
  [
    0x7c,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
  ].reverse(),
);
var INF_NEGATIVE_BUFFER = Buffer.from(
  [
    0xf8,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
  ].reverse(),
);
var INF_POSITIVE_BUFFER = Buffer.from(
  [
    0x78,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
  ].reverse(),
);

describe('Decimal128', function () {
  /**
   * @ignore
   */
  it('fromString invalid input', function (done) {
    expect(function () {
      Decimal128.fromString('E02');
    }).toThrow();
    expect(function () {
      Decimal128.fromString('E+02');
    }).toThrow();
    expect(function () {
      Decimal128.fromString('e+02');
    }).toThrow();
    expect(function () {
      Decimal128.fromString('.');
    }).toThrow();
    expect(function () {
      Decimal128.fromString('.e');
    }).toThrow();
    expect(function () {
      Decimal128.fromString('');
    }).toThrow();
    expect(function () {
      Decimal128.fromString('invalid');
    }).toThrow();
    expect(function () {
      Decimal128.fromString('in');
    }).toThrow();
    expect(function () {
      Decimal128.fromString('i');
    }).toThrow();
    expect(function () {
      Decimal128.fromString('..1');
    }).toThrow();
    expect(function () {
      Decimal128.fromString('1abcede');
    }).toThrow();
    expect(function () {
      Decimal128.fromString('1.24abc');
    }).toThrow();
    expect(function () {
      Decimal128.fromString('1.24abcE+02');
    }).toThrow();
    expect(function () {
      Decimal128.fromString('1.24E+02abc2d');
    }).toThrow();
  });

  it('fromString NaN input', function (done) {
    var result = Decimal128.fromString('NaN');
    expect(NAN).toEqual(result.bytes);
    result = Decimal128.fromString('+NaN');
    expect(NAN).toEqual(result.bytes);
    result = Decimal128.fromString('-NaN');
    expect(NAN).toEqual(result.bytes);
    result = Decimal128.fromString('-nan');
    expect(NAN).toEqual(result.bytes);
    result = Decimal128.fromString('+nan');
    expect(NAN).toEqual(result.bytes);
    result = Decimal128.fromString('nan');
    expect(NAN).toEqual(result.bytes);
    result = Decimal128.fromString('Nan');
    expect(NAN).toEqual(result.bytes);
    result = Decimal128.fromString('+Nan');
    expect(NAN).toEqual(result.bytes);
    result = Decimal128.fromString('-Nan');
    expect(NAN).toEqual(result.bytes);
  });

  it('fromString infinity input', function (done) {
    var result = Decimal128.fromString('Infinity');
    expect(INF_POSITIVE_BUFFER).toEqual(result.bytes);
    result = Decimal128.fromString('+Infinity');
    expect(INF_POSITIVE_BUFFER).toEqual(result.bytes);
    result = Decimal128.fromString('+Inf');
    expect(INF_POSITIVE_BUFFER).toEqual(result.bytes);
    result = Decimal128.fromString('-Inf');
    expect(INF_NEGATIVE_BUFFER).toEqual(result.bytes);
    result = Decimal128.fromString('-Infinity');
    expect(INF_NEGATIVE_BUFFER).toEqual(result.bytes);
  });

  it('fromString simple', function (done) {
    // Create decimal from string value 1
    var result = Decimal128.fromString('1');
    var bytes = Buffer.from(
      [
        0x30,
        0x40,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x01,
      ].reverse(),
    );
    expect(bytes).toEqual(result.bytes);

    // Create decimal from string value 0
    result = Decimal128.fromString('0');
    bytes = Buffer.from(
      [
        0x30,
        0x40,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
      ].reverse(),
    );
    expect(bytes).toEqual(result.bytes);

    // Create decimal from string value -0
    result = Decimal128.fromString('-0');
    bytes = Buffer.from(
      [
        0xb0,
        0x40,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
      ].reverse(),
    );
    expect(bytes).toEqual(result.bytes);

    // Create decimal from string value -1
    result = Decimal128.fromString('-1');
    bytes = Buffer.from(
      [
        0xb0,
        0x40,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x01,
      ].reverse(),
    );
    expect(bytes).toEqual(result.bytes);

    // Create decimal from string value 12345678901234567
    result = Decimal128.fromString('12345678901234567');
    bytes = Buffer.from(
      [
        0x30,
        0x40,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x2b,
        0xdc,
        0x54,
        0x5d,
        0x6b,
        0x4b,
        0x87,
      ].reverse(),
    );
    expect(bytes).toEqual(result.bytes);

    // Create decimal from string value 989898983458
    result = Decimal128.fromString('989898983458');
    bytes = Buffer.from(
      [
        0x30,
        0x40,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0xe6,
        0x7a,
        0x93,
        0xc8,
        0x22,
      ].reverse(),
    );
    expect(bytes).toEqual(result.bytes);

    // Create decimal from string value -12345678901234567
    result = Decimal128.fromString('-12345678901234567');
    bytes = Buffer.from(
      [
        0xb0,
        0x40,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x2b,
        0xdc,
        0x54,
        0x5d,
        0x6b,
        0x4b,
        0x87,
      ].reverse(),
    );
    expect(bytes).toEqual(result.bytes);

    // Create decimal from string value 0.12345
    result = Decimal128.fromString('0.12345');
    bytes = Buffer.from(
      [
        0x30,
        0x36,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x30,
        0x39,
      ].reverse(),
    );
    expect(bytes).toEqual(result.bytes);

    // Create decimal from string value 0.0012345
    result = Decimal128.fromString('0.0012345');
    bytes = Buffer.from(
      [
        0x30,
        0x32,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x30,
        0x39,
      ].reverse(),
    );
    expect(bytes).toEqual(result.bytes);

    // Create decimal from string value 00012345678901234567
    result = Decimal128.fromString('00012345678901234567');
    bytes = Buffer.from(
      [
        0x30,
        0x40,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x2b,
        0xdc,
        0x54,
        0x5d,
        0x6b,
        0x4b,
        0x87,
      ].reverse(),
    );
    expect(bytes).toEqual(result.bytes);
  });

  it('fromString scientific format', function (done) {
    // Create decimal from string value 10e0
    var result = Decimal128.fromString('10e0');
    var bytes = Buffer.from(
      [
        0x30,
        0x40,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x0a,
      ].reverse(),
    );
    expect(bytes).toEqual(result.bytes);

    // Create decimal from string value 1e1
    result = Decimal128.fromString('1e1');
    bytes = Buffer.from(
      [
        0x30,
        0x42,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x01,
      ].reverse(),
    );
    expect(bytes).toEqual(result.bytes);

    // Create decimal from string value 10e-1
    result = Decimal128.fromString('10e-1');
    bytes = Buffer.from(
      [
        0x30,
        0x3e,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x0a,
      ].reverse(),
    );
    expect(bytes).toEqual(result.bytes);

    // Create decimal from string value 12345678901234567e6111
    result = Decimal128.fromString('12345678901234567e6111');
    bytes = Buffer.from(
      [
        0x5f,
        0xfe,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x2b,
        0xdc,
        0x54,
        0x5d,
        0x6b,
        0x4b,
        0x87,
      ].reverse(),
    );
    expect(bytes).toEqual(result.bytes);

    // Create decimal from string value 1e-6176
    result = Decimal128.fromString('1e-6176');
    bytes = Buffer.from(
      [
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x01,
      ].reverse(),
    );
    expect(bytes).toEqual(result.bytes);

    // Create decimal from string value "-100E-10
    result = Decimal128.fromString('-100E-10');
    bytes = Buffer.from(
      [
        0xb0,
        0x2c,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x64,
      ].reverse(),
    );
    expect(bytes).toEqual(result.bytes);

    // Create decimal from string value 10.50E8
    result = Decimal128.fromString('10.50E8');
    bytes = Buffer.from(
      [
        0x30,
        0x4c,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x04,
        0x1a,
      ].reverse(),
    );
    expect(bytes).toEqual(result.bytes);
  });

  it('fromString large format', function (done) {
    // Create decimal from string value 12345689012345789012345
    var result = Decimal128.fromString('12345689012345789012345');
    var bytes = Buffer.from(
      [
        0x30,
        0x40,
        0x00,
        0x00,
        0x00,
        0x00,
        0x02,
        0x9d,
        0x42,
        0xda,
        0x3a,
        0x76,
        0xf9,
        0xe0,
        0xd9,
        0x79,
      ].reverse(),
    );
    expect(bytes).toEqual(result.bytes);

    // Create decimal from string value 1234567890123456789012345678901234
    result = Decimal128.fromString('1234567890123456789012345678901234');
    bytes = Buffer.from(
      [
        0x30,
        0x40,
        0x3c,
        0xde,
        0x6f,
        0xff,
        0x97,
        0x32,
        0xde,
        0x82,
        0x5c,
        0xd0,
        0x7e,
        0x96,
        0xaf,
        0xf2,
      ].reverse(),
    );
    expect(bytes).toEqual(result.bytes);

    // Create decimal from string value 9.999999999999999999999999999999999E+6144
    result = Decimal128.fromString('9.999999999999999999999999999999999E+6144');
    bytes = Buffer.from(
      [
        0x5f,
        0xff,
        0xed,
        0x09,
        0xbe,
        0xad,
        0x87,
        0xc0,
        0x37,
        0x8d,
        0x8e,
        0x63,
        0xff,
        0xff,
        0xff,
        0xff,
      ].reverse(),
    );
    expect(bytes).toEqual(result.bytes);

    // Create decimal from string value 9.999999999999999999999999999999999E-6143
    result = Decimal128.fromString('9.999999999999999999999999999999999E-6143');
    bytes = Buffer.from(
      [
        0x00,
        0x01,
        0xed,
        0x09,
        0xbe,
        0xad,
        0x87,
        0xc0,
        0x37,
        0x8d,
        0x8e,
        0x63,
        0xff,
        0xff,
        0xff,
        0xff,
      ].reverse(),
    );
    expect(bytes).toEqual(result.bytes);

    // Create decimal from string value 5.192296858534827628530496329220095E+33
    result = Decimal128.fromString('5.192296858534827628530496329220095E+33');
    bytes = Buffer.from(
      [
        0x30,
        0x40,
        0xff,
        0xff,
        0xff,
        0xff,
        0xff,
        0xff,
        0xff,
        0xff,
        0xff,
        0xff,
        0xff,
        0xff,
        0xff,
        0xff,
      ].reverse(),
    );
    expect(bytes).toEqual(result.bytes);
  });

  it('fromString exponent normalization', function (done) {
    // Create decimal from string value 1000000000000000000000000000000000000000

    result = Decimal128.fromString('1000000000000000000000000000000000000000');
    bytes = Buffer.from(
      [
        0x30,
        0x4c,
        0x31,
        0x4d,
        0xc6,
        0x44,
        0x8d,
        0x93,
        0x38,
        0xc1,
        0x5b,
        0x0a,
        0x00,
        0x00,
        0x00,
        0x00,
      ].reverse(),
    );
    expect(bytes).toEqual(result.bytes);

    // Create decimal from string value 10000000000000000000000000000000000
    result = Decimal128.fromString('10000000000000000000000000000000000');
    bytes = Buffer.from(
      [
        0x30,
        0x42,
        0x31,
        0x4d,
        0xc6,
        0x44,
        0x8d,
        0x93,
        0x38,
        0xc1,
        0x5b,
        0x0a,
        0x00,
        0x00,
        0x00,
        0x00,
      ].reverse(),
    );
    expect(bytes).toEqual(result.bytes);

    // Create decimal from string value 1000000000000000000000000000000000
    result = Decimal128.fromString('1000000000000000000000000000000000');
    bytes = Buffer.from(
      [
        0x30,
        0x40,
        0x31,
        0x4d,
        0xc6,
        0x44,
        0x8d,
        0x93,
        0x38,
        0xc1,
        0x5b,
        0x0a,
        0x00,
        0x00,
        0x00,
        0x00,
      ].reverse(),
    );
    expect(bytes).toEqual(result.bytes);

    var str =
      '100000000000000000000000000000000000000000000000000000000000000000000' +
      '000000000000000000000000000000000000000000000000000000000000000000000' +
      '000000000000000000000000000000000000000000000000000000000000000000000' +
      '000000000000000000000000000000000000000000000000000000000000000000000' +
      '000000000000000000000000000000000000000000000000000000000000000000000' +
      '000000000000000000000000000000000000000000000000000000000000000000000' +
      '000000000000000000000000000000000000000000000000000000000000000000000' +
      '000000000000000000000000000000000000000000000000000000000000000000000' +
      '000000000000000000000000000000000000000000000000000000000000000000000' +
      '000000000000000000000000000000000000000000000000000000000000000000000' +
      '000000000000000000000000000000000000000000000000000000000000000000000' +
      '000000000000000000000000000000000000000000000000000000000000000000000' +
      '000000000000000000000000000000000000000000000000000000000000000000000' +
      '000000000000000000000000000000000000000000000000000000000000000000000' +
      '0000000000000000000000000000000000';

    // Create decimal from string value str

    var result = Decimal128.fromString(str);
    var bytes = Buffer.from(
      [
        0x37,
        0xcc,
        0x31,
        0x4d,
        0xc6,
        0x44,
        0x8d,
        0x93,
        0x38,
        0xc1,
        0x5b,
        0x0a,
        0x00,
        0x00,
        0x00,
        0x00,
      ].reverse(),
    );
    expect(bytes).toEqual(result.bytes);

    // this should throw error according to spec.
    // Create decimal from string value 1E-6177

    // var result = Decimal128.fromString('1E-6177');
    // var bytes = Buffer.from(
    //   [
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00
    //   ].reverse()
    // );
    // expect(bytes).toEqual(result.bytes);
  });

  it('fromString from string zeros', function (done) {
    // Create decimal from string value 0
    var result = Decimal128.fromString('0');
    var bytes = Buffer.from(
      [
        0x30,
        0x40,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
      ].reverse(),
    );
    expect(bytes).toEqual(result.bytes);

    // Create decimal from string value 0e-611
    result = Decimal128.fromString('0e-611');
    bytes = Buffer.from(
      [
        0x2b,
        0x7a,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
      ].reverse(),
    );
    expect(bytes).toEqual(result.bytes);

    // Create decimal from string value 0e+6000
    result = Decimal128.fromString('0e+6000');
    bytes = Buffer.from(
      [
        0x5f,
        0x20,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
      ].reverse(),
    );
    expect(bytes).toEqual(result.bytes);

    // Create decimal from string value 1E-6177
    result = Decimal128.fromString('-0e-1');
    bytes = Buffer.from(
      [
        0xb0,
        0x3e,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
      ].reverse(),
    );
    expect(bytes).toEqual(result.bytes);
  });

  it('fromString from string round', function (done) {
    // Create decimal from string value 10E-6177
    var result = Decimal128.fromString('10E-6177');
    var bytes = Buffer.from(
      [
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x01,
      ].reverse(),
    );

    expect(bytes).toEqual(result.bytes);

    // // Create decimal from string value 15E-6177
    // result = Decimal128.fromString('15E-6177');
    // bytes = Buffer.from(
    //   [
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x02
    //   ].reverse()
    // );
    // expect(bytes).toEqual(result.bytes);

    // // var array = new Array(6179);
    // // for(var i = 0; i < array.length; i++) array[i] = '0';
    // // array[1] = '.';
    // // array[6177] = '1';
    // // array[6178] = '5';
    // // // Create decimal from string value array
    // // result = Decimal128.fromString(array.join(''));
    // // bytes = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    // //   , 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02].reverse());
    // // expect(bytes).toEqual(result.bytes);

    // // Create decimal from string value 251E-6178
    // result = Decimal128.fromString('251E-6178');
    // bytes = Buffer.from(
    //   [
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x03
    //   ].reverse()
    // );
    // expect(bytes).toEqual(result.bytes);

    // // Create decimal from string value 250E-6178
    // result = Decimal128.fromString('250E-6178');
    // bytes = Buffer.from(
    //   [
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x02
    //   ].reverse()
    // );
    // expect(bytes).toEqual(result.bytes);

    // // Create decimal from string value 10000000000000000000000000000000006
    // result = Decimal128.fromString('10000000000000000000000000000000006');
    // bytes = Buffer.from(
    //   [
    //     0x30,
    //     0x42,
    //     0x31,
    //     0x4d,
    //     0xc6,
    //     0x44,
    //     0x8d,
    //     0x93,
    //     0x38,
    //     0xc1,
    //     0x5b,
    //     0x0a,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x01
    //   ].reverse()
    // );
    // expect(bytes).toEqual(result.bytes);

    // // Create decimal from string value 10000000000000000000000000000000003
    // result = Decimal128.fromString('10000000000000000000000000000000003');
    // bytes = Buffer.from(
    //   [
    //     0x30,
    //     0x42,
    //     0x31,
    //     0x4d,
    //     0xc6,
    //     0x44,
    //     0x8d,
    //     0x93,
    //     0x38,
    //     0xc1,
    //     0x5b,
    //     0x0a,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00
    //   ].reverse()
    // );
    // expect(bytes).toEqual(result.bytes);

    // // Create decimal from string value 10000000000000000000000000000000005
    // result = Decimal128.fromString('10000000000000000000000000000000005');
    // bytes = Buffer.from(
    //   [
    //     0x30,
    //     0x42,
    //     0x31,
    //     0x4d,
    //     0xc6,
    //     0x44,
    //     0x8d,
    //     0x93,
    //     0x38,
    //     0xc1,
    //     0x5b,
    //     0x0a,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00
    //   ].reverse()
    // );
    // expect(bytes).toEqual(result.bytes);

    // // Create decimal from string value 100000000000000000000000000000000051
    // result = Decimal128.fromString('100000000000000000000000000000000051');
    // bytes = Buffer.from(
    //   [
    //     0x30,
    //     0x44,
    //     0x31,
    //     0x4d,
    //     0xc6,
    //     0x44,
    //     0x8d,
    //     0x93,
    //     0x38,
    //     0xc1,
    //     0x5b,
    //     0x0a,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x01
    //   ].reverse()
    // );
    // expect(bytes).toEqual(result.bytes);

    // // Create decimal from string value 10000000000000000000000000000000006E6111
    // result = Decimal128.fromString('10000000000000000000000000000000006E6111');
    // bytes = Buffer.from(
    //   [
    //     0x78,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00
    //   ].reverse()
    // );
    // expect(bytes).toEqual(result.bytes);

    // // Create decimal from string value 12980742146337069071326240823050239
    // result = Decimal128.fromString('12980742146337069071326240823050239');
    // bytes = Buffer.from(
    //   [
    //     0x30,
    //     0x42,
    //     0x40,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00
    //   ].reverse()
    // );
    // expect(bytes).toEqual(result.bytes);

    // // Create decimal from string value 99999999999999999999999999999999999
    // result = Decimal128.fromString('99999999999999999999999999999999999');
    // bytes = Buffer.from(
    //   [
    //     0x30,
    //     0x44,
    //     0x31,
    //     0x4d,
    //     0xc6,
    //     0x44,
    //     0x8d,
    //     0x93,
    //     0x38,
    //     0xc1,
    //     0x5b,
    //     0x0a,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00
    //   ].reverse()
    // );
    // expect(bytes).toEqual(result.bytes);

    // // Create decimal from string value 9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999
    // result = Decimal128.fromString(
    //   '9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999'
    // );
    // bytes = Buffer.from(
    //   [
    //     0x30,
    //     0xc6,
    //     0x31,
    //     0x4d,
    //     0xc6,
    //     0x44,
    //     0x8d,
    //     0x93,
    //     0x38,
    //     0xc1,
    //     0x5b,
    //     0x0a,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00
    //   ].reverse()
    // );
    // expect(bytes).toEqual(result.bytes);

    // // Create decimal from string value 9999999999999999999999999999999999E6111
    // result = Decimal128.fromString('9999999999999999999999999999999999E6111');
    // bytes = Buffer.from(
    //   [
    //     0x5f,
    //     0xff,
    //     0xed,
    //     0x09,
    //     0xbe,
    //     0xad,
    //     0x87,
    //     0xc0,
    //     0x37,
    //     0x8d,
    //     0x8e,
    //     0x63,
    //     0xff,
    //     0xff,
    //     0xff,
    //     0xff
    //   ].reverse()
    // );
    // expect(bytes).toEqual(result.bytes);

    // // Create decimal from string value 99999999999999999999999999999999999E6144
    // result = Decimal128.fromString('99999999999999999999999999999999999E6144');
    // bytes = Buffer.from(
    //   [
    //     0x78,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00
    //   ].reverse()
    // );
    // expect(bytes).toEqual(result.bytes);
  });

  it('toString infinity', function (done) {
    var decimal = new Decimal128(
      Buffer.from(
        [
          0x78,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
        ].reverse(),
      ),
    );
    expect('Infinity').toEqual(decimal.toString());

    decimal = new Decimal128(
      Buffer.from(
        [
          0xf8,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
        ].reverse(),
      ),
    );
    expect('-Infinity').toEqual(decimal.toString());
  });

  it('toString NaN', function (done) {
    var decimal = new Decimal128(
      Buffer.from(
        [
          0x7c,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
        ].reverse(),
      ),
    );
    expect('NaN').toEqual(decimal.toString());

    decimal = new Decimal128(
      Buffer.from(
        [
          0xfc,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
        ].reverse(),
      ),
    );
    expect('NaN').toEqual(decimal.toString());

    decimal = new Decimal128(
      Buffer.from(
        [
          0x7e,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
        ].reverse(),
      ),
    );
    expect('NaN').toEqual(decimal.toString());

    decimal = new Decimal128(
      Buffer.from(
        [
          0xfe,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
        ].reverse(),
      ),
    );
    expect('NaN').toEqual(decimal.toString());

    decimal = new Decimal128(
      Buffer.from(
        [
          0x7e,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x12,
        ].reverse(),
      ),
    );
    expect('NaN').toEqual(decimal.toString());
  });

  it('toString regular', function (done) {
    var decimal = new Decimal128(
      Buffer.from(
        [
          0x30,
          0x40,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x01,
        ].reverse(),
      ),
    );
    expect('1').toEqual(decimal.toString());

    decimal = new Decimal128(
      Buffer.from(
        [
          0x30,
          0x40,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
        ].reverse(),
      ),
    );
    expect('0').toEqual(decimal.toString());

    decimal = new Decimal128(
      Buffer.from(
        [
          0x30,
          0x40,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x02,
        ].reverse(),
      ),
    );
    expect('2').toEqual(decimal.toString());

    decimal = new Decimal128(
      Buffer.from(
        [
          0xb0,
          0x40,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x01,
        ].reverse(),
      ),
    );
    expect('-1').toEqual(decimal.toString());

    decimal = new Decimal128(
      Buffer.from(
        [
          0xb0,
          0x40,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
        ].reverse(),
      ),
    );
    expect('-0').toEqual(decimal.toString());

    decimal = new Decimal128(
      Buffer.from(
        [
          0x30,
          0x3e,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x01,
        ].reverse(),
      ),
    );
    expect('0.1').toEqual(decimal.toString());

    decimal = new Decimal128(
      Buffer.from(
        [
          0x30,
          0x34,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x04,
          0xd2,
        ].reverse(),
      ),
    );
    expect('0.001234').toEqual(decimal.toString());

    decimal = new Decimal128(
      Buffer.from(
        [
          0x30,
          0x40,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x1c,
          0xbe,
          0x99,
          0x1a,
          0x14,
        ].reverse(),
      ),
    );
    expect('123456789012').toEqual(decimal.toString());

    decimal = new Decimal128(
      Buffer.from(
        [
          0x30,
          0x2a,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x07,
          0x5a,
          0xef,
          0x40,
        ].reverse(),
      ),
    );
    expect('0.00123400000').toEqual(decimal.toString());

    decimal = new Decimal128(
      Buffer.from(
        [
          0x2f,
          0xfc,
          0x3c,
          0xde,
          0x6f,
          0xff,
          0x97,
          0x32,
          0xde,
          0x82,
          0x5c,
          0xd0,
          0x7e,
          0x96,
          0xaf,
          0xf2,
        ].reverse(),
      ),
    );
    expect('0.1234567890123456789012345678901234').toEqual(decimal.toString());
  });

  it('toString scientific', function (done) {
    var decimal = new Decimal128(
      Buffer.from(
        [
          0x5f,
          0xfe,
          0x31,
          0x4d,
          0xc6,
          0x44,
          0x8d,
          0x93,
          0x38,
          0xc1,
          0x5b,
          0x0a,
          0x00,
          0x00,
          0x00,
          0x00,
        ].reverse(),
      ),
    );
    expect('1.000000000000000000000000000000000E+6144').toEqual(
      decimal.toString(),
    );

    decimal = new Decimal128(
      Buffer.from(
        [
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x01,
        ].reverse(),
      ),
    );
    expect('1E-6176').toEqual(decimal.toString());

    decimal = new Decimal128(
      Buffer.from(
        [
          0x80,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x01,
        ].reverse(),
      ),
    );
    expect('-1E-6176').toEqual(decimal.toString());

    decimal = new Decimal128(
      Buffer.from(
        [
          0x31,
          0x08,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x09,
          0x18,
          0x4d,
          0xb6,
          0x3e,
          0xb1,
        ].reverse(),
      ),
    );
    expect('9.999987654321E+112').toEqual(decimal.toString());

    decimal = new Decimal128(
      Buffer.from(
        [
          0x5f,
          0xff,
          0xed,
          0x09,
          0xbe,
          0xad,
          0x87,
          0xc0,
          0x37,
          0x8d,
          0x8e,
          0x63,
          0xff,
          0xff,
          0xff,
          0xff,
        ].reverse(),
      ),
    );
    expect('9.999999999999999999999999999999999E+6144').toEqual(
      decimal.toString(),
    );

    decimal = new Decimal128(
      Buffer.from(
        [
          0x00,
          0x01,
          0xed,
          0x09,
          0xbe,
          0xad,
          0x87,
          0xc0,
          0x37,
          0x8d,
          0x8e,
          0x63,
          0xff,
          0xff,
          0xff,
          0xff,
        ].reverse(),
      ),
    );
    expect('9.999999999999999999999999999999999E-6143').toEqual(
      decimal.toString(),
    );

    decimal = new Decimal128(
      Buffer.from(
        [
          0x30,
          0x40,
          0xff,
          0xff,
          0xff,
          0xff,
          0xff,
          0xff,
          0xff,
          0xff,
          0xff,
          0xff,
          0xff,
          0xff,
          0xff,
          0xff,
        ].reverse(),
      ),
    );
    expect('5192296858534827628530496329220095').toEqual(decimal.toString());

    decimal = new Decimal128(
      Buffer.from(
        [
          0x30,
          0x4c,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x04,
          0x1a,
        ].reverse(),
      ),
    );
    expect('1.050E+9').toEqual(decimal.toString());

    decimal = new Decimal128(
      Buffer.from(
        [
          0x30,
          0x42,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x04,
          0x1a,
        ].reverse(),
      ),
    );
    expect('1.050E+4').toEqual(decimal.toString());

    decimal = new Decimal128(
      Buffer.from(
        [
          0x30,
          0x40,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x69,
        ].reverse(),
      ),
    );
    expect('105').toEqual(decimal.toString());

    decimal = new Decimal128(
      Buffer.from(
        [
          0x30,
          0x42,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x69,
        ].reverse(),
      ),
    );
    expect('1.05E+3').toEqual(decimal.toString());

    decimal = new Decimal128(
      Buffer.from(
        [
          0x30,
          0x46,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x01,
        ].reverse(),
      ),
    );
    expect('1E+3').toEqual(decimal.toString());
  });

  it('toString zeros', function (done) {
    var decimal = new Decimal128(
      Buffer.from(
        [
          0x30,
          0x40,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
        ].reverse(),
      ),
    );
    expect('0').toEqual(decimal.toString());

    decimal = new Decimal128(
      Buffer.from(
        [
          0x32,
          0x98,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
        ].reverse(),
      ),
    );
    expect('0E+300').toEqual(decimal.toString());

    decimal = new Decimal128(
      Buffer.from(
        [
          0x2b,
          0x90,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
        ].reverse(),
      ),
    );
    expect('0E-600').toEqual(decimal.toString());
  });

  /* it('Serialize and Deserialize tests', function (done) {
    // Test all methods around a simple serialization at object top level
    var doc = { value: Decimal128.fromString('1') };
    var buffer = BSON.serialize(doc);
    var size = BSON.calculateObjectSize(doc);
    var back = BSON.deserialize(buffer);

    expect(buffer.length).toEqual(size);
    expect(doc).toEqual(back);
    expect('1').toEqual(doc.value.toString());
    expect('{"value":{"$numberDecimal":"1"}}').toEqual(JSON.stringify(doc, null));

    // Test all methods around a simple serialization at array top level
    //@ts-ignore: FIXME
    doc = { value: [Decimal128.fromString('1')] };
    buffer = BSON.serialize(doc);
    size = BSON.calculateObjectSize(doc);
    back = BSON.deserialize(buffer);

    expect(buffer.length).toEqual(size);
    expect(doc).toEqual(back);
    //@ts-ignore: FIXME
    expect('1').toEqual(doc.value[0].toString());

    // Test all methods around a simple serialization at nested object
    //@ts-ignore: FIXME
    doc = { value: { a: Decimal128.fromString('1') } };
    buffer = BSON.serialize(doc);
    size = BSON.calculateObjectSize(doc);
    back = BSON.deserialize(buffer);

    expect(buffer.length).toEqual(size);
    expect(doc).toEqual(back);
    //@ts-ignore: FIXME
    expect('1').toEqual(doc.value.a.toString());
  }); */

  // FIXME: this needs some typescript love
  /*   it('Support toBSON and toObject methods for custom mapping', function (done) {
      // Create a custom object
      var MyCustomDecimal = function (value) {
        this.value = value instanceof Decimal128 ? value.toString() : value;
      };

      MyCustomDecimal.prototype.toBSON = function () {
        return Decimal128.fromString(this.value);
      };

      // Add a custom mapper for the type
      const saveToObject = Decimal128.prototype.toObject;
      try {
        Decimal128.prototype.toObject = function () {
          return new MyCustomDecimal(this);
        };

        // Test all methods around a simple serialization at object top level
        var doc = { value: new MyCustomDecimal('1') };
        var buffer = BSON.serialize(doc);
        var back = BSON.deserialize(buffer);
        expect(back.value instanceof MyCustomDecimal).to.be.ok;
        expect('1').toEqual(back.value.value);
      } finally {
        // prevent this test from breaking later tests which may re-use the same class
        Decimal128.prototype.toObject = saveToObject;
      }
    }); */

  it('accepts strings in the constructor', () => {
    expect(new Decimal128('0').toString()).toEqual('0');
    expect(new Decimal128('00').toString()).toEqual('0');
    expect(new Decimal128('0.5').toString()).toEqual('0.5');
    expect(new Decimal128('-0.5').toString()).toEqual('-0.5');
    expect(new Decimal128('-0.0097').toString()).toEqual('-0.0097');
    expect(new Decimal128('-0.0011').toString()).toEqual('-0.0011');
    expect(new Decimal128('-0.00110').toString()).toEqual('-0.00110');
    expect(new Decimal128('0.0011').toString()).toEqual('0.0011');
    expect(new Decimal128('0.00110').toString()).toEqual('0.00110');
    expect(new Decimal128('-1e400').toString()).toEqual('-1E+400');
  });

  /*   it('throws correct error for invalid constructor argument type', () => {
      const constructorArgErrMsg = 'Decimal128 must take a Buffer or string';

      expect(() => new Decimal128(-0)).toThrow(constructorArgErrMsg);
      expect(() => new Decimal128(-1)).toThrow(constructorArgErrMsg);
      expect(() => new Decimal128(10)).toThrow(constructorArgErrMsg);
      expect(() => new Decimal128(1111111111111111)).toThrow(constructorArgErrMsg);
    });

    it('throws correct error for an invalid Buffer constructor argument', () => {
      const byteLengthErrMsg = 'Decimal128 must take a Buffer of 16 bytes';

      expect(() => new Decimal128(new Uint8Array(0))).toThrow(byteLengthErrMsg);
      expect(() => new Decimal128(Buffer.alloc(0))).toThrow(byteLengthErrMsg);
      expect(() => new Decimal128(new Uint8Array(3))).toThrow(byteLengthErrMsg);
      expect(() => new Decimal128(Buffer.alloc(3))).toThrow(byteLengthErrMsg);
      expect(() => new Decimal128(new Uint8Array(17))).toThrow(byteLengthErrMsg);
      expect(() => new Decimal128(Buffer.alloc(17))).toThrow(byteLengthErrMsg);
    });

    it('does not throw error for an empty Buffer of correct length constructor argument', () => {
      expect(() => new Decimal128(Buffer.alloc(16))).not.toThrow();
      expect(() => new Decimal128(new Uint8Array(16))).not.toThrow();
    }); */
});
