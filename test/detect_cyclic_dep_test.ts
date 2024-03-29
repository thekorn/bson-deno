import { BSON, describe, expect, it } from './deps.ts';

describe('Cyclic Dependencies', function () {
  /**
   * @ignore
   */
  it(
    'Should correctly detect cyclic dependency in nested objects',
    function (done) {
      // Force cyclic dependency
      var a = { b: {} };
      //@ts-ignore: thats js magic
      a.b.c = a;
      try {
        // Attempt to serialize cyclic dependency
        BSON.serialize(a);
      } catch (err) {
        expect('Cannot convert circular structure to BSON').toEqual(
          err.message,
        );
      }
    },
  );

  /**
   * @ignore
   */
  it(
    'Should correctly detect cyclic dependency in deeploy nested objects',
    function (done) {
      // Force cyclic dependency
      var a = { b: { c: [{ d: {} }] } };
      //@ts-ignore: thats js magic
      a.b.c[0].d.a = a;

      try {
        // Attempt to serialize cyclic dependency
        BSON.serialize(a);
      } catch (err) {
        expect('Cannot convert circular structure to BSON').toEqual(
          err.message,
        );
      }
    },
  );

  /**
   * @ignore
   */
  it(
    'Should correctly detect cyclic dependency in nested array',
    function (done) {
      // Force cyclic dependency
      var a = { b: {} };
      //@ts-ignore: thats js magic
      a.b.c = [a];
      try {
        // Attempt to serialize cyclic dependency
        BSON.serialize(a);
      } catch (err) {
        expect('Cannot convert circular structure to BSON').toEqual(
          err.message,
        );
      }
    },
  );
});
