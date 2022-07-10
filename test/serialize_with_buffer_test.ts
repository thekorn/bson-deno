import { BSON, describe, expect, it } from './deps.ts';
import { Buffer } from 'https://esm.sh/buffer@6.0.3';

describe('serializeWithBuffer', function () {
  /**
   * @ignore
   */
  it(
    'correctly serialize into buffer using serializeWithBufferAndIndex',
    function (done) {
      // Create a buffer
      var b = Buffer.alloc(256);
      // Serialize from index 0
      var r = BSON.serializeWithBufferAndIndex({ a: 1 }, b);
      expect(11).toEqual(r);

      // Serialize from index r+1
      r = BSON.serializeWithBufferAndIndex({ a: 1 }, b, {
        index: r + 1,
      });
      expect(23).toEqual(r);

      // Deserialize the buffers
      var doc = BSON.deserialize(b.slice(0, 12));
      expect({ a: 1 }).toEqual(doc);
      doc = BSON.deserialize(b.slice(12, 24));
      expect({ a: 1 }).toEqual(doc);
    },
  );

  it(
    'correctly serialize 3 different docs into buffer using serializeWithBufferAndIndex',
    function (done) {
      const MAXSIZE = 1024 * 1024 * 17;
      let bf = Buffer.alloc(MAXSIZE);

      const data = [
        {
          a: 1,
          b: new Date('2019-01-01'),
        },
        {
          a: 2,
          b: new Date('2019-01-02'),
        },
        {
          a: 3,
          b: new Date('2019-01-03'),
        },
      ];

      let idx = 0;
      data.forEach((item) => {
        idx = BSON.serializeWithBufferAndIndex(item, bf, {
          index: idx,
        }) + 1;
      });

      expect(BSON.deserialize(bf.slice(0, 23))).toEqual(data[0]);
      expect(BSON.deserialize(bf.slice(23, 46))).toEqual(data[1]);
      expect(BSON.deserialize(bf.slice(46, 69))).toEqual(data[2]);
    },
  );
});
