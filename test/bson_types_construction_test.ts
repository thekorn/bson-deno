import { describe, it } from './deps.ts';

import * as BSON from '../mod.ts';

describe('Constructing BSON types', function () {
  it('with new keyword should work', function () {
    const oid = new BSON.ObjectId();
    new BSON.DBRef('test', oid);
    new BSON.BSONRegExp('aaa');
    new BSON.BSONSymbol('aaa');
    new BSON.Binary('aaa');
    new BSON.Code(function () { });
    new BSON.Decimal128('123');
    new BSON.Double(2.3);
    new BSON.Int32(1);
    new BSON.Long(0, 0);
    // FIXME: timestamp is broken
    //new BSON.Timestamp(0, 0);
    new BSON.MaxKey();
    new BSON.MinKey();
  });
  it('as a function call should work', function () {
    // FIXME: init as function call is just broken
    //const oid = BSON.ObjectId();
    //BSON.DBRef('test', oid);
    //BSON.BSONRegExp('aaa');
    //BSON.BSONSymbol('aaa');
    //BSON.Binary('aaa');
    //BSON.Code(function () {});
    //BSON.Decimal128('123');
    //BSON.Double(2.3);
    //BSON.Int32(1);
    //BSON.Long(0, 0);
    //BSON.Timestamp(0, 0);
    //BSON.MaxKey();
    //BSON.MinKey();
  });
});
