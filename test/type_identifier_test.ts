import { BSON, describe, expect, it } from './deps.ts';
const {
  Binary,
  Code,
  DBRef,
  Decimal128,
  Double,
  Int32,
  Long,
  MaxKey,
  MinKey,
  ObjectId,
  BSONRegExp,
  BSONSymbol,
  Timestamp,
  UUID,
} = BSON;

describe('_bsontype identifier', () => {
  // The two out of the norm types:
  it('should be equal to ObjectID for ObjectId', () => {
    expect(ObjectId.prototype._bsontype).toEqual('ObjectID');
  });
  it('should be equal to Symbol for BSONSymbol', () => {
    expect(BSONSymbol.prototype._bsontype).toEqual('Symbol');
  });
  // FIXME: timestamp is broken
  /* it('should be equal to Timestamp for Timestamp', () => {
    // TODO(NODE-2624): Make Timestamp hold its long value on a property rather than be a subclass
    // Timestamp overrides the value in its constructor
    const timestamp = new Timestamp({ i: 0, t: 0 });
    expect(timestamp._bsontype).toEqual('Timestamp');
    expect(Object.getPrototypeOf(timestamp)._bsontype).toEqual('Long');
  }); */

  // All equal to their constructor names
  it('should be equal to Binary for Binary', () => {
    expect(Binary.prototype._bsontype).toEqual('Binary');
  });
  it('should be equal to Code for Code', () => {
    expect(Code.prototype._bsontype).toEqual('Code');
  });
  it('should be equal to DBRef for DBRef', () => {
    expect(DBRef.prototype._bsontype).toEqual('DBRef');
  });
  it('should be equal to Decimal128 for Decimal128', () => {
    expect(Decimal128.prototype._bsontype).toEqual('Decimal128');
  });
  it('should be equal to Double for Double', () => {
    expect(Double.prototype._bsontype).toEqual('Double');
  });
  it('should be equal to Int32 for Int32', () => {
    expect(Int32.prototype._bsontype).toEqual('Int32');
  });
  it('should be equal to Long for Long', () => {
    expect(Long.prototype._bsontype).toEqual('Long');
  });
  it('should be equal to MaxKey for MaxKey', () => {
    expect(MaxKey.prototype._bsontype).toEqual('MaxKey');
  });
  it('should be equal to MinKey for MinKey', () => {
    expect(MinKey.prototype._bsontype).toEqual('MinKey');
  });
  it('should be equal to BSONRegExp for BSONRegExp', () => {
    expect(BSONRegExp.prototype._bsontype).toEqual('BSONRegExp');
  });
  it('should be equal to Binary for UUID', () => {
    expect(UUID.prototype._bsontype).toEqual('Binary');
  });
});
