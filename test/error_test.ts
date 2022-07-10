import { BSON, describe, expect, it } from './deps.ts';

const BSONTypeError = BSON.BSONTypeError;
const BSONError = BSON.BSONError;

describe('BSONTypeError', function () {
  it('should evaluate true on instanceof BSONTypeError and TypeError', function () {
    //@ts-ignore, is the message ootional?
    const bsonTypeErr = new BSONTypeError();
    expect(bsonTypeErr instanceof BSONTypeError).toBeTruthy();
    expect(bsonTypeErr instanceof TypeError).toBeTruthy();
    expect(bsonTypeErr).toBeInstanceOf(BSONTypeError);
    expect(bsonTypeErr).toBeInstanceOf(TypeError);
  });

  it('should correctly set BSONTypeError name and message properties', function () {
    const bsonTypeErr = new BSONTypeError('This is a BSONTypeError message');
    expect(bsonTypeErr.name).toEqual('BSONTypeError');
    expect(bsonTypeErr.message).toEqual('This is a BSONTypeError message');
  });
});

describe('BSONError', function () {
  it('should evaluate true on instanceof BSONError and Error', function () {
    //@ts-ignore, is the message ootional?
    const bsonErr = new BSONError();
    expect(bsonErr instanceof BSONError).toBeTruthy();
    expect(bsonErr instanceof Error).toBeTruthy();
    expect(bsonErr).toBeInstanceOf(BSONError);
    expect(bsonErr).toBeInstanceOf(Error);
  });

  it('should correctly set BSONError name and message properties', function () {
    const bsonErr = new BSONError('This is a BSONError message');
    expect(bsonErr.name).toEqual('BSONError');
    expect(bsonErr.message).toEqual('This is a BSONError message');
  });
});
