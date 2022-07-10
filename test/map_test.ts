import { describe, expect, it } from './deps.ts';

import * as BSON from '../mod.ts';
const M = BSON.Map;

describe('Map', function () {
  /**
   * @ignore
   */
  it('should correctly exercise the map', function (done) {
    var m = new M([
      ['a', 1],
      ['b', 2],
    ]);

    expect(m.has('a')).toBeTruthy();
    expect(m.has('b')).toBeTruthy();
    expect(1).toEqual(m.get('a'));
    expect(2).toEqual(m.get('b'));
    expect(m.set('a', 3) === m).toBeTruthy();
    expect(m.has('a')).toBeTruthy();
    expect(3).toEqual(m.get('a'));

    // Get the values
    const iterator = m.values();
    expect(3).toEqual(iterator.next().value);
    expect(2).toEqual(iterator.next().value);
    expect(true).toEqual(iterator.next().done);

    // Get the entries
    const iterator1 = m.entries();
    expect(['a', 3]).toEqual(iterator1.next().value);
    expect(['b', 2]).toEqual(iterator1.next().value);
    expect(true).toEqual(iterator1.next().done);

    // Get the keys
    const iterator2 = m.keys();
    expect('a').toEqual(iterator2.next().value);
    expect('b').toEqual(iterator2.next().value);
    expect(true).toEqual(iterator2.next().done);

    // Collect values
    //@ts-ignore, okay, no type here
    var values = [];
    // Get entries forEach
    m.forEach(function (value, key, map) {
      expect(value != null).toBeTruthy();
      expect(key != null).toBeTruthy();
      expect(map != null).toBeTruthy();
      //@ts-ignore, what any?
      expect(m === this).toBeTruthy();
      values.push([key, value]);
    }, m);

    expect([
      ['a', 3],
      ['b', 2],
      //@ts-ignore
    ]).toEqual(values);

    // Modify the state
    expect(true).toEqual(m.delete('a'));
    m.set('c', 5);
    m.set('a', 7);

    // Validate order is preserved
    // Get the keys
    const iterator3 = m.keys();
    expect('b').toEqual(iterator3.next().value);
    expect('c').toEqual(iterator3.next().value);
    expect('a').toEqual(iterator3.next().value);
    expect(true).toEqual(iterator3.next().done);

    // Get the entries
    const iterator4 = m.entries();
    expect(['b', 2]).toEqual(iterator4.next().value);
    expect(['c', 5]).toEqual(iterator4.next().value);
    expect(['a', 7]).toEqual(iterator4.next().value);
    expect(true).toEqual(iterator4.next().done);

    // Get the values
    const iterator5 = m.values();
    expect(2).toEqual(iterator5.next().value);
    expect(5).toEqual(iterator5.next().value);
    expect(7).toEqual(iterator5.next().value);
    expect(true).toEqual(iterator5.next().done);
  });

  //FIXME: buffer serialize is not working
  /**
   * @ignore
   */
  /*   it('should serialize a map', function (done) {
      // Serialize top level map only
      var m = new M([
        ['a', 1],
        ['b', 2]
      ]);
      // Serialize the map
      var data = BSON.serialize(m, false, true);
      // Deserialize the data
      var object = BSON.deserialize(data);
      expect({ a: 1, b: 2 }).toEqual(object);

      // Serialize nested maps
      var m1 = new M([
        ['a', 1],
        ['b', 2]
      ]);
      m = new M([['c', m1]]);
      // Serialize the map
      data = BSON.serialize(m, false, true);
      // Deserialize the data
      object = BSON.deserialize(data);
      expect({ c: { a: 1, b: 2 } }).toEqual(object);

      // Serialize top level map only
      m = new M([
        ['1', 1],
        ['0', 2]
      ]);
      // Serialize the map, validating that the order in the resulting BSON is preserved
      data = BSON.serialize(m, false, true);
      expect('13000000103100010000001030000200000000').toEqual(data.toString('hex'));
    }); */

  /**
   * @ignore
   */
  /* it('should not crash due to object that looks like map', function (done) {
    // Serialize top level map only
    var m = { entries: 'test' };
    // Serialize the map
    var data = BSON.serialize(m, false, true);
    // Deserialize the data
    var object = BSON.deserialize(data);
    expect(m).toEqual(object);
  }); */
});
