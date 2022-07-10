import { describe, expect, it } from './deps.ts';
import { Buffer } from 'https://esm.sh/buffer@6.0.3';

import * as BSON from '../mod.ts';

import { ensureBuffer } from '../mod.ts';

const BSONTypeError = BSON.BSONTypeError;

describe('ensureBuffer tests', function () {
  it('should be a function', function () {
    expect(ensureBuffer).toBeInstanceOf(Function);
  });

  it('should return a view over the exact same memory when a Buffer is passed in', function () {
    const bufferIn = Buffer.alloc(10);
    let bufferOut;

    expect(function () {
      bufferOut = ensureBuffer(bufferIn);
    }).not.toThrow();

    expect(bufferOut).toBeInstanceOf(Buffer);
    //@ts-ignore: no, its not undefined
    expect(bufferOut.buffer).toEqual(bufferIn.buffer);
    //@ts-ignore: no, its not undefined
    expect(bufferOut.byteLength).toEqual(bufferIn.byteLength);
    //@ts-ignore: no, its not undefined
    expect(bufferOut.byteOffset).toEqual(bufferIn.byteOffset);
  });

  it('should wrap a Uint8Array with a buffer', function () {
    const arrayIn = Uint8Array.from([1, 2, 3]);
    let bufferOut;

    expect(function () {
      bufferOut = ensureBuffer(arrayIn);
    }).not.toThrow();

    expect(bufferOut).toBeInstanceOf(Buffer);
    //@ts-ignore: no, its not undefined
    expect(bufferOut.buffer).toEqual(arrayIn.buffer);
  });

  it('should wrap a ArrayBuffer with a buffer', function () {
    const arrayBufferIn = Uint8Array.from([1, 2, 3]).buffer;
    let bufferOut;

    expect(function () {
      bufferOut = ensureBuffer(arrayBufferIn);
    }).not.toThrow();

    expect(bufferOut).toBeInstanceOf(Buffer);
    //@ts-ignore: no, its not undefined
    expect(bufferOut.buffer).toEqual(arrayBufferIn);
  });

  it('should wrap a SharedArrayBuffer with a buffer', function () {
    if (typeof SharedArrayBuffer === 'undefined') {
      console.log('SKIPPING');
      return;
    }
    const arrayBufferIn = new SharedArrayBuffer(3);
    let bufferOut;

    expect(function () {
      bufferOut = ensureBuffer(arrayBufferIn);
    }).not.toThrow();

    expect(bufferOut).toBeInstanceOf(Buffer);
    //@ts-ignore: no, its not undefined
    expect(bufferOut.buffer).toEqual(arrayBufferIn);
  });

  it('should account for the input view byteLength and byteOffset', function () {
    const input = new Uint8Array(new Uint8Array([1, 2, 3, 4, 5]).buffer, 1, 3);
    let bufferOut;

    expect(function () {
      bufferOut = ensureBuffer(input);
    }).not.toThrow();

    expect(bufferOut).toBeInstanceOf(Buffer);
    //@ts-ignore: no, its not undefined
    expect(bufferOut.byteLength).toEqual(3);
    //@ts-ignore: no, its not undefined
    expect(bufferOut.byteOffset).toEqual(1);
  });

  [0, 12, -1, '', 'foo', null, undefined, ['list'], {}, /x/].forEach(
    function (item) {
      it(`should throw if input is ${typeof item}: ${item}`, function () {
        expect(function () {
          //@ts-ignore, we expect this to error out!
          ensureBuffer(item);
        }).toThrow();
      });
    },
  );

  [
    Int8Array,
    Uint8ClampedArray,
    Int16Array,
    Uint16Array,
    Int32Array,
    Uint32Array,
    Float32Array,
    Float64Array,
  ].forEach(function (TypedArray) {
    it(`should throw if input is typed array ${TypedArray.name}`, function () {
      const typedArray = new TypedArray();
      expect(ensureBuffer(typedArray)).toBeInstanceOf(Buffer);
    });
  });
});
