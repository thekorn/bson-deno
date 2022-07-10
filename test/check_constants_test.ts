import { BSON, describe, expect, it } from './deps.ts';

describe('BSON Constants', () => {
  describe('Binary Subtype', () => {
    /*
     subtype	::=
     |  "\x00"  Generic binary subtype
     |  "\x01"  Function
     |  "\x02"  Binary (Old)
     |  "\x03"  UUID (Old)
     |  "\x04"  UUID
     |  "\x05"  MD5
     |  "\x06"  Encrypted BSON value
     |  "\x80"  User defined
    */
    it('Default should be 0', () => {
      expect(BSON.BSON_BINARY_SUBTYPE_DEFAULT).toEqual(0);
      expect(BSON.Binary.SUBTYPE_DEFAULT).toEqual(0);
    });
    it('Function should be 1', () => {
      expect(BSON.BSON_BINARY_SUBTYPE_FUNCTION).toEqual(1);
      expect(BSON.Binary.SUBTYPE_FUNCTION).toEqual(1);
    });
    it('Binary (Old) should be 2', () => {
      expect(BSON.BSON_BINARY_SUBTYPE_BYTE_ARRAY).toEqual(2);
      expect(BSON.Binary.SUBTYPE_BYTE_ARRAY).toEqual(2);
    });
    it('UUID (Old) should be 3', () => {
      expect(BSON.BSON_BINARY_SUBTYPE_UUID).toEqual(3);
      expect(BSON.Binary.SUBTYPE_UUID_OLD).toEqual(3);
    });
    it('UUID should be 4', () => {
      expect(BSON.BSON_BINARY_SUBTYPE_UUID_NEW).toEqual(4);
      expect(BSON.Binary.SUBTYPE_UUID).toEqual(4);
    });
    it('MD5 should be 5', () => {
      expect(BSON.BSON_BINARY_SUBTYPE_MD5).toEqual(5);
      expect(BSON.Binary.SUBTYPE_MD5).toEqual(5);
    });

    it('Encrypted should be 6', () => {
      expect(BSON.BSON_BINARY_SUBTYPE_ENCRYPTED).toEqual(6);
      expect(BSON.Binary.SUBTYPE_ENCRYPTED).toEqual(6);
    });

    it('Column should be 7', () => {
      expect(BSON.BSON_BINARY_SUBTYPE_COLUMN).toEqual(7);
      expect(BSON.Binary.SUBTYPE_COLUMN).toEqual(7);
    });
  });
  describe('BSON Type indicators', () => {
    /*
      | "\x01" 64-bit binary floating point
      | "\x02" UTF-8 string
      | "\x03" Embedded document
      | "\x04" Array
      | "\x05" Binary data
      | "\x06" Undefined (value) — Deprecated
      | "\x07" ObjectId
      | "\x08" Boolean
      | "\x09" UTC date time
      | "\x0A" Null value
      | "\x0B" Regular expression
      | "\x0C" DBPointer — Deprecated
      | "\x0D" JavaScript code
      | "\x0E" Symbol. — Deprecated
      | "\x0F" JavaScript code w/ scope — Deprecated
      | "\x10" 32-bit integer
      | "\x11" Timestamp
      | "\x12" 64-bit integer
      | "\x13" 128-bit decimal floating point
      | "\xFF" Min key
      | "\x7F" Max key
     */

    it('64-bit binary floating point should be 0x01', () => {
      expect(BSON.BSON_DATA_NUMBER).toEqual(0x01);
    });
    it('UTF-8 string should be 0x02', () => {
      expect(BSON.BSON_DATA_STRING).toEqual(0x02);
    });
    it('Embedded document should be 0x03', () => {
      expect(BSON.BSON_DATA_OBJECT).toEqual(0x03);
    });
    it('Array should be 0x04', () => {
      expect(BSON.BSON_DATA_ARRAY).toEqual(0x04);
    });
    it('Binary data should be 0x05', () => {
      expect(BSON.BSON_DATA_BINARY).toEqual(0x05);
    });
    it('Undefined (value) — Deprecated should be 0x06', () => {
      expect(BSON.BSON_DATA_UNDEFINED).toEqual(0x06);
    });
    it('ObjectId should be 0x07', () => {
      expect(BSON.BSON_DATA_OID).toEqual(0x07);
    });
    it('Boolean should be 0x08', () => {
      expect(BSON.BSON_DATA_BOOLEAN).toEqual(0x08);
    });
    it('UTC date time should be 0x09', () => {
      expect(BSON.BSON_DATA_DATE).toEqual(0x09);
    });
    it('Null value should be 0x0A', () => {
      expect(BSON.BSON_DATA_NULL).toEqual(0x0a);
    });
    it('Regular expression should be 0x0B', () => {
      expect(BSON.BSON_DATA_REGEXP).toEqual(0x0b);
    });
    it('DBPointer — Deprecated should be 0x0C', () => {
      expect(BSON.BSON_DATA_DBPOINTER).toEqual(0x0c);
    });
    it('JavaScript code should be 0x0D', () => {
      expect(BSON.BSON_DATA_CODE).toEqual(0x0d);
    });
    it('Symbol. — Deprecated should be 0x0E', () => {
      expect(BSON.BSON_DATA_SYMBOL).toEqual(0x0e);
    });
    it('JavaScript code w/ scope — Deprecated should be 0x0F', () => {
      expect(BSON.BSON_DATA_CODE_W_SCOPE).toEqual(0x0f);
    });
    it('32-bit integer should be 0x10', () => {
      expect(BSON.BSON_DATA_INT).toEqual(0x10);
    });
    it('Timestamp should be 0x11', () => {
      expect(BSON.BSON_DATA_TIMESTAMP).toEqual(0x11);
    });
    it('64-bit integer should be 0x12', () => {
      expect(BSON.BSON_DATA_LONG).toEqual(0x12);
    });
    it('128-bit decimal floating point should be 0x13', () => {
      expect(BSON.BSON_DATA_DECIMAL128).toEqual(0x13);
    });
    it('Min key should be 0xFF', () => {
      expect(BSON.BSON_DATA_MIN_KEY).toEqual(0xff);
    });
    it('Max key should be 0x7F', () => {
      expect(BSON.BSON_DATA_MAX_KEY).toEqual(0x7f);
    });
  });
});
