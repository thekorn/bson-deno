import * as path from "https://deno.land/std@0.170.0/path/mod.ts";
import { assertBuffersEqual } from './tools/utils.ts';
import { BSON, describe, expect, it, Buffer } from './deps.ts';

const __dirname = path.dirname(path.fromFileUrl(import.meta.url));
const Binary = BSON.Binary;

describe('BSON - Node only', function () {
  it(
    'Should Correctly Serialize and Deserialize a big Binary object',
    function (done) {
      var data = Deno.readFileSync(
        path.resolve(__dirname, './data/test_gs_weird_bug.png'),
      );
      var bin = new Binary();
      bin.write(data, 0);
      var doc = { doc: bin };
      var serialized_data = BSON.serialize(doc);

      var serialized_data2 = Buffer.alloc(BSON.calculateObjectSize(doc));
      BSON.serializeWithBufferAndIndex(doc, serialized_data2);
      assertBuffersEqual(serialized_data, serialized_data2);

      var deserialized_data = BSON.deserialize(serialized_data);
      expect(doc.doc.value()).toEqual(deserialized_data.doc.value());
    },
  );
});

describe('Full BSON - Node only', function () {
  it(
    'Should Correctly Serialize and Deserialize a big Binary object',
    function (done) {
      var data = Deno.readFileSync(
        path.resolve(__dirname, './data/test_gs_weird_bug.png'),
      );
      var bin = new Binary();
      bin.write(data, 0);
      var doc = { doc: bin };
      var serialized_data = BSON.serialize(doc);
      var deserialized_data = BSON.deserialize(serialized_data);
      expect(doc.doc.value()).toEqual(deserialized_data.doc.value());
    },
  );

  //it('Should Correctly Deserialize bson file from mongodump', function (done) {
  //  var data = Deno.readFileSync(path.resolve(__dirname, './data/test.bson'));
  //  data = Buffer.from(data);
  //  var docs: string | any[] = [];
  //  var bsonIndex = 0;
  //  while (bsonIndex < data.length)
  //    bsonIndex = BSON.deserializeStream(data, bsonIndex, 1, docs, docs.length, { isArray: true });
  //
  //  expect(docs.length).toEqual(1);
  //});
});
