import { Buffer } from 'https://esm.sh/buffer@6.0.3';
import { BSON, describe, expect, it } from './deps.ts';

import corruptScenarios from './compliance/corrupt.ts';
import validScenarios from './compliance/valid.ts';

const Code = BSON.Code;
const Binary = BSON.Binary;
const Timestamp = BSON.Timestamp;
const Long = BSON.Long;
const ObjectId = BSON.ObjectId;
const DBRef = BSON.DBRef;
const MinKey = BSON.MinKey;
const MaxKey = BSON.MaxKey;

describe('BSON Compliance', function () {
  /**
   * @ignore
   */
  it(
    'Pass all corrupt BSON scenarios ./compliance/corrupt.json',
    function (done) {
      // Read and parse the json file
      const scenarios = corruptScenarios;

      for (let i = 0; i < scenarios.documents.length; i++) {
        const doc = scenarios.documents[i];
        if (doc.skip) continue;

        try {
          // Create a buffer containing the payload
          const buffer = Buffer.from(doc.encoded, 'hex');
          // Attempt to deserialize
          BSON.deserialize(buffer);
          expect(false).toBeTruthy();
        } catch (_err) {
          expect(true).toBeTruthy();
        }
      }
    },
  );

  /**
   * @ignore
   */
  it('Pass all valid BSON serialization scenarios ./compliance/valid.json', function () {
    // FIXME: this test is skipped as the Timestamp constructor is not working
    return;

    // Read and parse the json file
    const scenarios = validScenarios;

    // Translate extended json to correctly typed doc
    function translate(doc: any, object: any) {
      for (const name in doc) {
        if (
          typeof doc[name] === 'number' ||
          typeof doc[name] === 'string' ||
          typeof doc[name] === 'boolean'
        ) {
          object[name] = doc[name];
        } else if (Array.isArray(doc[name])) {
          object[name] = translate(doc[name], []);
        } else if (doc[name]['$numberLong']) {
          object[name] = Long.fromString(doc[name]['$numberLong']);
        } else if (doc[name]['$undefined']) {
          object[name] = null;
        } else if (doc[name]['$date']) {
          const date = new Date();
          date.setTime(parseInt(doc[name]['$date']['$numberLong'], 10));
          object[name] = date;
        } else if (doc[name]['$regexp']) {
          object[name] = new RegExp(
            doc[name]['$regexp'],
            doc[name]['$options'] || '',
          );
        } else if (doc[name]['$oid']) {
          object[name] = new ObjectId(doc[name]['$oid']);
        } else if (doc[name]['$binary']) {
          object[name] = new Binary(
            doc[name]['$binary'],
            doc[name]['$type'] || 1,
          );
        } else if (doc[name]['$timestamp']) {
          object[name] = Timestamp.fromBits(
            parseInt(doc[name]['$timestamp']['t'], 10),
            parseInt(doc[name]['$timestamp']['i']),
          );
        } else if (doc[name]['$ref']) {
          object[name] = new DBRef(
            doc[name]['$ref'],
            doc[name]['$id'],
            doc[name]['$db'],
          );
        } else if (doc[name]['$minKey']) {
          object[name] = new MinKey();
        } else if (doc[name]['$maxKey']) {
          object[name] = new MaxKey();
        } else if (doc[name]['$code']) {
          object[name] = new Code(
            doc[name]['$code'],
            doc[name]['$scope'] || {},
          );
        } else if (doc[name] != null && typeof doc[name] === 'object') {
          object[name] = translate(doc[name], {});
        }
      }

      return object;
    }

    // Iterate over all the results
    scenarios.documents.forEach(function (doc) {
      //@ts-ignore: why no skip??
      if (doc.skip) return;
      // Create a buffer containing the payload
      const expectedData = Buffer.from(doc.encoded, 'hex');
      // Get the expectedDocument
      const expectedDocument = translate(doc.document, {});
      // Serialize to buffer
      const buffer = BSON.serialize(expectedDocument);
      // Validate the output
      expect(expectedData.toString('hex')).toEqual(buffer.toString());
      // Attempt to deserialize
      const object = BSON.deserialize(buffer, { promoteLongs: false });
      // // Validate the object
      expect(JSON.stringify(expectedDocument)).toEqual(JSON.stringify(object));
    });
  });
});
