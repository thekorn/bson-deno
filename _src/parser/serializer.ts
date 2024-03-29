import { Binary } from '../binary.ts';
import type { BSONSymbol, DBRef, Document, MaxKey } from '../bson.ts';
import type { Code } from '../code.ts';
import * as constants from '../constants.ts';
import type { DBRefLike } from '../db_ref.ts';
import type { Decimal128 } from '../decimal128.ts';
import type { Double } from '../double.ts';
import { BSONError } from '../error.ts';
import type { Int32 } from '../int_32.ts';
import { Long } from '../long.ts';
import type { MinKey } from '../min_key.ts';
import type { ObjectId } from '../objectid.ts';
import type { BSONRegExp } from '../regexp.ts';
import { ByteUtils } from '../utils/byte_utils.ts';
import {
  isAnyArrayBuffer,
  isBigInt64Array,
  isBigUInt64Array,
  isDate,
  isMap,
  isRegExp,
  isUint8Array,
} from './utils.ts';

/** @public */
export interface SerializeOptions {
  /** the serializer will check if keys are valid. */
  checkKeys?: boolean;
  /** serialize the javascript functions **(default:false)**. */
  serializeFunctions?: boolean;
  /** serialize will not emit undefined fields **(default:true)** */
  ignoreUndefined?: boolean;
  /** @internal Resize internal buffer */
  minInternalBufferSize?: number;
  /** the index in the buffer where we wish to start serializing into */
  index?: number;
}

const regexp = /\x00/; // eslint-disable-line no-control-regex
const ignoreKeys = new Set(['$db', '$ref', '$id', '$clusterTime']);

/*
 * isArray indicates if we are writing to a BSON array (type 0x04)
 * which forces the "key" which really an array index as a string to be written as ascii
 * This will catch any errors in index as a string generation
 */

function serializeString(
  buffer: Uint8Array,
  key: string,
  value: string,
  index: number,
) {
  // Encode String type
  buffer[index++] = constants.BSON_DATA_STRING;
  // Number of written bytes
  const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
  // Encode the name
  index = index + numberOfWrittenBytes + 1;
  buffer[index - 1] = 0;
  // Write the string
  const size = ByteUtils.encodeUTF8Into(buffer, value, index + 4);
  // Write the size of the string to buffer
  buffer[index + 3] = ((size + 1) >> 24) & 0xff;
  buffer[index + 2] = ((size + 1) >> 16) & 0xff;
  buffer[index + 1] = ((size + 1) >> 8) & 0xff;
  buffer[index] = (size + 1) & 0xff;
  // Update index
  index = index + 4 + size;
  // Write zero
  buffer[index++] = 0;
  return index;
}

const NUMBER_SPACE = new DataView(new ArrayBuffer(8), 0, 8);
const FOUR_BYTE_VIEW_ON_NUMBER = new Uint8Array(NUMBER_SPACE.buffer, 0, 4);
const EIGHT_BYTE_VIEW_ON_NUMBER = new Uint8Array(NUMBER_SPACE.buffer, 0, 8);

function serializeNumber(
  buffer: Uint8Array,
  key: string,
  value: number,
  index: number,
) {
  const isNegativeZero = Object.is(value, -0);

  const type = !isNegativeZero &&
      Number.isSafeInteger(value) &&
      value <= constants.BSON_INT32_MAX &&
      value >= constants.BSON_INT32_MIN
    ? constants.BSON_DATA_INT
    : constants.BSON_DATA_NUMBER;

  if (type === constants.BSON_DATA_INT) {
    NUMBER_SPACE.setInt32(0, value, true);
  } else {
    NUMBER_SPACE.setFloat64(0, value, true);
  }

  const bytes = type === constants.BSON_DATA_INT
    ? FOUR_BYTE_VIEW_ON_NUMBER
    : EIGHT_BYTE_VIEW_ON_NUMBER;

  buffer[index++] = type;

  const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
  index = index + numberOfWrittenBytes;
  buffer[index++] = 0x00;

  buffer.set(bytes, index);
  index += bytes.byteLength;

  return index;
}

function serializeNull(
  buffer: Uint8Array,
  key: string,
  _: unknown,
  index: number,
) {
  // Set long type
  buffer[index++] = constants.BSON_DATA_NULL;

  // Number of written bytes
  const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);

  // Encode the name
  index = index + numberOfWrittenBytes;
  buffer[index++] = 0;
  return index;
}

function serializeBoolean(
  buffer: Uint8Array,
  key: string,
  value: boolean,
  index: number,
) {
  // Write the type
  buffer[index++] = constants.BSON_DATA_BOOLEAN;
  // Number of written bytes
  const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
  // Encode the name
  index = index + numberOfWrittenBytes;
  buffer[index++] = 0;
  // Encode the boolean value
  buffer[index++] = value ? 1 : 0;
  return index;
}

function serializeDate(
  buffer: Uint8Array,
  key: string,
  value: Date,
  index: number,
) {
  // Write the type
  buffer[index++] = constants.BSON_DATA_DATE;
  // Number of written bytes
  const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
  // Encode the name
  index = index + numberOfWrittenBytes;
  buffer[index++] = 0;

  // Write the date
  const dateInMilis = Long.fromNumber(value.getTime());
  const lowBits = dateInMilis.getLowBits();
  const highBits = dateInMilis.getHighBits();
  // Encode low bits
  buffer[index++] = lowBits & 0xff;
  buffer[index++] = (lowBits >> 8) & 0xff;
  buffer[index++] = (lowBits >> 16) & 0xff;
  buffer[index++] = (lowBits >> 24) & 0xff;
  // Encode high bits
  buffer[index++] = highBits & 0xff;
  buffer[index++] = (highBits >> 8) & 0xff;
  buffer[index++] = (highBits >> 16) & 0xff;
  buffer[index++] = (highBits >> 24) & 0xff;
  return index;
}

function serializeRegExp(
  buffer: Uint8Array,
  key: string,
  value: RegExp,
  index: number,
) {
  // Write the type
  buffer[index++] = constants.BSON_DATA_REGEXP;
  // Number of written bytes
  const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);

  // Encode the name
  index = index + numberOfWrittenBytes;
  buffer[index++] = 0;
  if (value.source && value.source.match(regexp) != null) {
    throw new BSONError(
      'value ' + value.source + ' must not contain null bytes',
    );
  }
  // Adjust the index
  index = index + ByteUtils.encodeUTF8Into(buffer, value.source, index);
  // Write zero
  buffer[index++] = 0x00;
  // Write the parameters
  if (value.ignoreCase) buffer[index++] = 0x69; // i
  if (value.global) buffer[index++] = 0x73; // s
  if (value.multiline) buffer[index++] = 0x6d; // m

  // Add ending zero
  buffer[index++] = 0x00;
  return index;
}

function serializeBSONRegExp(
  buffer: Uint8Array,
  key: string,
  value: BSONRegExp,
  index: number,
) {
  // Write the type
  buffer[index++] = constants.BSON_DATA_REGEXP;
  // Number of written bytes
  const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
  // Encode the name
  index = index + numberOfWrittenBytes;
  buffer[index++] = 0;

  // Check the pattern for 0 bytes
  if (value.pattern.match(regexp) != null) {
    // The BSON spec doesn't allow keys with null bytes because keys are
    // null-terminated.
    throw new BSONError(
      'pattern ' + value.pattern + ' must not contain null bytes',
    );
  }

  // Adjust the index
  index = index + ByteUtils.encodeUTF8Into(buffer, value.pattern, index);
  // Write zero
  buffer[index++] = 0x00;
  // Write the options
  const sortedOptions = value.options.split('').sort().join('');
  index = index + ByteUtils.encodeUTF8Into(buffer, sortedOptions, index);
  // Add ending zero
  buffer[index++] = 0x00;
  return index;
}

function serializeMinMax(
  buffer: Uint8Array,
  key: string,
  value: MinKey | MaxKey,
  index: number,
) {
  // Write the type of either min or max key
  if (value === null) {
    buffer[index++] = constants.BSON_DATA_NULL;
  } else if (value._bsontype === 'MinKey') {
    buffer[index++] = constants.BSON_DATA_MIN_KEY;
  } else {
    buffer[index++] = constants.BSON_DATA_MAX_KEY;
  }

  // Number of written bytes
  const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
  // Encode the name
  index = index + numberOfWrittenBytes;
  buffer[index++] = 0;
  return index;
}

function serializeObjectId(
  buffer: Uint8Array,
  key: string,
  value: ObjectId,
  index: number,
) {
  // Write the type
  buffer[index++] = constants.BSON_DATA_OID;
  // Number of written bytes
  const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);

  // Encode the name
  index = index + numberOfWrittenBytes;
  buffer[index++] = 0;

  // Write the objectId into the shared buffer
  if (isUint8Array(value.id)) {
    buffer.set(value.id.subarray(0, 12), index);
  } else {
    throw new BSONError(
      'object [' + JSON.stringify(value) + '] is not a valid ObjectId',
    );
  }

  // Adjust index
  return index + 12;
}

function serializeBuffer(
  buffer: Uint8Array,
  key: string,
  value: Uint8Array,
  index: number,
) {
  // Write the type
  buffer[index++] = constants.BSON_DATA_BINARY;
  // Number of written bytes
  const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
  // Encode the name
  index = index + numberOfWrittenBytes;
  buffer[index++] = 0;
  // Get size of the buffer (current write point)
  const size = value.length;
  // Write the size of the string to buffer
  buffer[index++] = size & 0xff;
  buffer[index++] = (size >> 8) & 0xff;
  buffer[index++] = (size >> 16) & 0xff;
  buffer[index++] = (size >> 24) & 0xff;
  // Write the default subtype
  buffer[index++] = constants.BSON_BINARY_SUBTYPE_DEFAULT;
  // Copy the content form the binary field to the buffer
  buffer.set(value, index);
  // Adjust the index
  index = index + size;
  return index;
}

function serializeObject(
  buffer: Uint8Array,
  key: string,
  value: Document,
  index: number,
  checkKeys: boolean,
  depth: number,
  serializeFunctions: boolean,
  ignoreUndefined: boolean,
  path: Set<Document>,
) {
  if (path.has(value)) {
    throw new BSONError('Cannot convert circular structure to BSON');
  }

  path.add(value);

  // Write the type
  buffer[index++] = Array.isArray(value)
    ? constants.BSON_DATA_ARRAY
    : constants.BSON_DATA_OBJECT;
  // Number of written bytes
  const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
  // Encode the name
  index = index + numberOfWrittenBytes;
  buffer[index++] = 0;
  const endIndex = serializeInto(
    buffer,
    value,
    checkKeys,
    index,
    depth + 1,
    serializeFunctions,
    ignoreUndefined,
    path,
  );

  path.delete(value);

  return endIndex;
}

function serializeDecimal128(
  buffer: Uint8Array,
  key: string,
  value: Decimal128,
  index: number,
) {
  buffer[index++] = constants.BSON_DATA_DECIMAL128;
  // Number of written bytes
  const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
  // Encode the name
  index = index + numberOfWrittenBytes;
  buffer[index++] = 0;
  // Write the data from the value
  buffer.set(value.bytes.subarray(0, 16), index);
  return index + 16;
}

function serializeLong(
  buffer: Uint8Array,
  key: string,
  value: Long,
  index: number,
) {
  // Write the type
  buffer[index++] = value._bsontype === 'Long'
    ? constants.BSON_DATA_LONG
    : constants.BSON_DATA_TIMESTAMP;
  // Number of written bytes
  const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
  // Encode the name
  index = index + numberOfWrittenBytes;
  buffer[index++] = 0;
  // Write the date
  const lowBits = value.getLowBits();
  const highBits = value.getHighBits();
  // Encode low bits
  buffer[index++] = lowBits & 0xff;
  buffer[index++] = (lowBits >> 8) & 0xff;
  buffer[index++] = (lowBits >> 16) & 0xff;
  buffer[index++] = (lowBits >> 24) & 0xff;
  // Encode high bits
  buffer[index++] = highBits & 0xff;
  buffer[index++] = (highBits >> 8) & 0xff;
  buffer[index++] = (highBits >> 16) & 0xff;
  buffer[index++] = (highBits >> 24) & 0xff;
  return index;
}

function serializeInt32(
  buffer: Uint8Array,
  key: string,
  value: Int32 | number,
  index: number,
) {
  value = value.valueOf();
  // Set int type 32 bits or less
  buffer[index++] = constants.BSON_DATA_INT;
  // Number of written bytes
  const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
  // Encode the name
  index = index + numberOfWrittenBytes;
  buffer[index++] = 0;
  // Write the int value
  buffer[index++] = value & 0xff;
  buffer[index++] = (value >> 8) & 0xff;
  buffer[index++] = (value >> 16) & 0xff;
  buffer[index++] = (value >> 24) & 0xff;
  return index;
}

function serializeDouble(
  buffer: Uint8Array,
  key: string,
  value: Double,
  index: number,
) {
  // Encode as double
  buffer[index++] = constants.BSON_DATA_NUMBER;

  // Number of written bytes
  const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);

  // Encode the name
  index = index + numberOfWrittenBytes;
  buffer[index++] = 0;

  // Write float
  NUMBER_SPACE.setFloat64(0, value.value, true);
  buffer.set(EIGHT_BYTE_VIEW_ON_NUMBER, index);

  // Adjust index
  index = index + 8;
  return index;
}

function serializeFunction(
  buffer: Uint8Array,
  key: string,
  value: Function,
  index: number,
) {
  buffer[index++] = constants.BSON_DATA_CODE;
  // Number of written bytes
  const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
  // Encode the name
  index = index + numberOfWrittenBytes;
  buffer[index++] = 0;
  // Function string
  const functionString = value.toString();

  // Write the string
  const size = ByteUtils.encodeUTF8Into(buffer, functionString, index + 4) + 1;
  // Write the size of the string to buffer
  buffer[index] = size & 0xff;
  buffer[index + 1] = (size >> 8) & 0xff;
  buffer[index + 2] = (size >> 16) & 0xff;
  buffer[index + 3] = (size >> 24) & 0xff;
  // Update index
  index = index + 4 + size - 1;
  // Write zero
  buffer[index++] = 0;
  return index;
}

function serializeCode(
  buffer: Uint8Array,
  key: string,
  value: Code,
  index: number,
  checkKeys = false,
  depth = 0,
  serializeFunctions = false,
  ignoreUndefined = true,
  path: Set<Document>,
) {
  if (value.scope && typeof value.scope === 'object') {
    // Write the type
    buffer[index++] = constants.BSON_DATA_CODE_W_SCOPE;
    // Number of written bytes
    const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
    // Encode the name
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;

    // Starting index
    let startIndex = index;

    // Serialize the function
    // Get the function string
    const functionString = value.code;
    // Index adjustment
    index = index + 4;
    // Write string into buffer
    const codeSize =
      ByteUtils.encodeUTF8Into(buffer, functionString, index + 4) + 1;
    // Write the size of the string to buffer
    buffer[index] = codeSize & 0xff;
    buffer[index + 1] = (codeSize >> 8) & 0xff;
    buffer[index + 2] = (codeSize >> 16) & 0xff;
    buffer[index + 3] = (codeSize >> 24) & 0xff;
    // Write end 0
    buffer[index + 4 + codeSize - 1] = 0;
    // Write the
    index = index + codeSize + 4;

    // Serialize the scope value
    const endIndex = serializeInto(
      buffer,
      value.scope,
      checkKeys,
      index,
      depth + 1,
      serializeFunctions,
      ignoreUndefined,
      path,
    );
    index = endIndex - 1;

    // Writ the total
    const totalSize = endIndex - startIndex;

    // Write the total size of the object
    buffer[startIndex++] = totalSize & 0xff;
    buffer[startIndex++] = (totalSize >> 8) & 0xff;
    buffer[startIndex++] = (totalSize >> 16) & 0xff;
    buffer[startIndex++] = (totalSize >> 24) & 0xff;
    // Write trailing zero
    buffer[index++] = 0;
  } else {
    buffer[index++] = constants.BSON_DATA_CODE;
    // Number of written bytes
    const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
    // Encode the name
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    // Function string
    const functionString = value.code.toString();
    // Write the string
    const size = ByteUtils.encodeUTF8Into(buffer, functionString, index + 4) +
      1;
    // Write the size of the string to buffer
    buffer[index] = size & 0xff;
    buffer[index + 1] = (size >> 8) & 0xff;
    buffer[index + 2] = (size >> 16) & 0xff;
    buffer[index + 3] = (size >> 24) & 0xff;
    // Update index
    index = index + 4 + size - 1;
    // Write zero
    buffer[index++] = 0;
  }

  return index;
}

function serializeBinary(
  buffer: Uint8Array,
  key: string,
  value: Binary,
  index: number,
) {
  // Write the type
  buffer[index++] = constants.BSON_DATA_BINARY;
  // Number of written bytes
  const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
  // Encode the name
  index = index + numberOfWrittenBytes;
  buffer[index++] = 0;
  // Extract the buffer
  const data = value.buffer;
  // Calculate size
  let size = value.position;
  // Add the deprecated 02 type 4 bytes of size to total
  if (value.sub_type === Binary.SUBTYPE_BYTE_ARRAY) size = size + 4;
  // Write the size of the string to buffer
  buffer[index++] = size & 0xff;
  buffer[index++] = (size >> 8) & 0xff;
  buffer[index++] = (size >> 16) & 0xff;
  buffer[index++] = (size >> 24) & 0xff;
  // Write the subtype to the buffer
  buffer[index++] = value.sub_type;

  // If we have binary type 2 the 4 first bytes are the size
  if (value.sub_type === Binary.SUBTYPE_BYTE_ARRAY) {
    size = size - 4;
    buffer[index++] = size & 0xff;
    buffer[index++] = (size >> 8) & 0xff;
    buffer[index++] = (size >> 16) & 0xff;
    buffer[index++] = (size >> 24) & 0xff;
  }

  // Write the data to the object
  buffer.set(data, index);
  // Adjust the index
  index = index + value.position;
  return index;
}

function serializeSymbol(
  buffer: Uint8Array,
  key: string,
  value: BSONSymbol,
  index: number,
) {
  // Write the type
  buffer[index++] = constants.BSON_DATA_SYMBOL;
  // Number of written bytes
  const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
  // Encode the name
  index = index + numberOfWrittenBytes;
  buffer[index++] = 0;
  // Write the string
  const size = ByteUtils.encodeUTF8Into(buffer, value.value, index + 4) + 1;
  // Write the size of the string to buffer
  buffer[index] = size & 0xff;
  buffer[index + 1] = (size >> 8) & 0xff;
  buffer[index + 2] = (size >> 16) & 0xff;
  buffer[index + 3] = (size >> 24) & 0xff;
  // Update index
  index = index + 4 + size - 1;
  // Write zero
  buffer[index++] = 0x00;
  return index;
}

function serializeDBRef(
  buffer: Uint8Array,
  key: string,
  value: DBRef,
  index: number,
  depth: number,
  serializeFunctions: boolean,
  path: Set<Document>,
) {
  // Write the type
  buffer[index++] = constants.BSON_DATA_OBJECT;
  // Number of written bytes
  const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);

  // Encode the name
  index = index + numberOfWrittenBytes;
  buffer[index++] = 0;

  let startIndex = index;
  let output: DBRefLike = {
    $ref: value.collection || value.namespace, // "namespace" was what library 1.x called "collection"
    $id: value.oid,
  };

  if (value.db != null) {
    output.$db = value.db;
  }

  output = Object.assign(output, value.fields);
  const endIndex = serializeInto(
    buffer,
    output,
    false,
    index,
    depth + 1,
    serializeFunctions,
    true,
    path,
  );

  // Calculate object size
  const size = endIndex - startIndex;
  // Write the size
  buffer[startIndex++] = size & 0xff;
  buffer[startIndex++] = (size >> 8) & 0xff;
  buffer[startIndex++] = (size >> 16) & 0xff;
  buffer[startIndex++] = (size >> 24) & 0xff;
  // Set index
  return endIndex;
}

export function serializeInto(
  buffer: Uint8Array,
  object: Document,
  checkKeys: boolean,
  startingIndex: number,
  depth: number,
  serializeFunctions: boolean,
  ignoreUndefined: boolean,
  path: Set<Document> | null,
): number {
  if (path == null) {
    // We are at the root input
    if (object == null) {
      // ONLY the root should turn into an empty document
      // BSON Empty document has a size of 5 (LE)
      buffer[0] = 0x05;
      buffer[1] = 0x00;
      buffer[2] = 0x00;
      buffer[3] = 0x00;
      // All documents end with null terminator
      buffer[4] = 0x00;
      return 5;
    }

    if (Array.isArray(object)) {
      throw new BSONError(
        'serialize does not support an array as the root input',
      );
    }
    if (typeof object !== 'object') {
      throw new BSONError(
        'serialize does not support non-object as the root input',
      );
    } else if ('_bsontype' in object && typeof object._bsontype === 'string') {
      throw new BSONError(`BSON types cannot be serialized as a document`);
    } else if (
      isDate(object) ||
      isRegExp(object) ||
      isUint8Array(object) ||
      isAnyArrayBuffer(object)
    ) {
      throw new BSONError(
        `date, regexp, typedarray, and arraybuffer cannot be BSON documents`,
      );
    }

    path = new Set();
  }

  // Push the object to the path
  path.add(object);

  // Start place to serialize into
  let index = startingIndex + 4;

  // Special case isArray
  if (Array.isArray(object)) {
    // Get object keys
    for (let i = 0; i < object.length; i++) {
      const key = `${i}`;
      let value = object[i];

      // Is there an override value
      if (typeof value?.toBSON === 'function') {
        value = value.toBSON();
      }

      if (typeof value === 'string') {
        index = serializeString(buffer, key, value, index);
      } else if (typeof value === 'number') {
        index = serializeNumber(buffer, key, value, index);
      } else if (typeof value === 'bigint') {
        throw new BSONError('Unsupported type BigInt, please use Decimal128');
      } else if (typeof value === 'boolean') {
        index = serializeBoolean(buffer, key, value, index);
      } else if (value instanceof Date || isDate(value)) {
        index = serializeDate(buffer, key, value, index);
      } else if (value === undefined) {
        index = serializeNull(buffer, key, value, index);
      } else if (value === null) {
        index = serializeNull(buffer, key, value, index);
      } else if (
        value['_bsontype'] === 'ObjectId' || value['_bsontype'] === 'ObjectID'
      ) {
        index = serializeObjectId(buffer, key, value, index);
      } else if (isUint8Array(value)) {
        index = serializeBuffer(buffer, key, value, index);
      } else if (value instanceof RegExp || isRegExp(value)) {
        index = serializeRegExp(buffer, key, value, index);
      } else if (typeof value === 'object' && value['_bsontype'] == null) {
        index = serializeObject(
          buffer,
          key,
          value,
          index,
          checkKeys,
          depth,
          serializeFunctions,
          ignoreUndefined,
          path,
        );
      } else if (value['_bsontype'] === 'Decimal128') {
        index = serializeDecimal128(buffer, key, value, index);
      } else if (
        value['_bsontype'] === 'Long' || value['_bsontype'] === 'Timestamp'
      ) {
        index = serializeLong(buffer, key, value, index);
      } else if (value['_bsontype'] === 'Double') {
        index = serializeDouble(buffer, key, value, index);
      } else if (typeof value === 'function' && serializeFunctions) {
        index = serializeFunction(buffer, key, value, index);
      } else if (value['_bsontype'] === 'Code') {
        index = serializeCode(
          buffer,
          key,
          value,
          index,
          checkKeys,
          depth,
          serializeFunctions,
          ignoreUndefined,
          path,
        );
      } else if (value['_bsontype'] === 'Binary') {
        index = serializeBinary(buffer, key, value, index);
      } else if (value['_bsontype'] === 'Symbol') {
        index = serializeSymbol(buffer, key, value, index);
      } else if (value['_bsontype'] === 'DBRef') {
        index = serializeDBRef(
          buffer,
          key,
          value,
          index,
          depth,
          serializeFunctions,
          path,
        );
      } else if (value['_bsontype'] === 'BSONRegExp') {
        index = serializeBSONRegExp(buffer, key, value, index);
      } else if (value['_bsontype'] === 'Int32') {
        index = serializeInt32(buffer, key, value, index);
      } else if (
        value['_bsontype'] === 'MinKey' || value['_bsontype'] === 'MaxKey'
      ) {
        index = serializeMinMax(buffer, key, value, index);
      } else if (typeof value['_bsontype'] !== 'undefined') {
        throw new BSONError(
          `Unrecognized or invalid _bsontype: ${String(value['_bsontype'])}`,
        );
      }
    }
  } else if (object instanceof Map || isMap(object)) {
    const iterator = object.entries();
    let done = false;

    while (!done) {
      // Unpack the next entry
      const entry = iterator.next();
      done = !!entry.done;
      // Are we done, then skip and terminate
      if (done) continue;

      // Get the entry values
      const key = entry.value[0];
      const value = entry.value[1];

      // Check the type of the value
      const type = typeof value;

      // Check the key and throw error if it's illegal
      if (typeof key === 'string' && !ignoreKeys.has(key)) {
        if (key.match(regexp) != null) {
          // The BSON spec doesn't allow keys with null bytes because keys are
          // null-terminated.
          throw new BSONError('key ' + key + ' must not contain null bytes');
        }

        if (checkKeys) {
          if ('$' === key[0]) {
            throw new BSONError('key ' + key + ' must not start with \'$\'');
          } else if (~key.indexOf('.')) {
            throw new BSONError('key ' + key + ' must not contain \'.\'');
          }
        }
      }

      if (type === 'string') {
        index = serializeString(buffer, key, value, index);
      } else if (type === 'number') {
        index = serializeNumber(buffer, key, value, index);
      } else if (
        type === 'bigint' || isBigInt64Array(value) || isBigUInt64Array(value)
      ) {
        throw new BSONError('Unsupported type BigInt, please use Decimal128');
      } else if (type === 'boolean') {
        index = serializeBoolean(buffer, key, value, index);
      } else if (value instanceof Date || isDate(value)) {
        index = serializeDate(buffer, key, value, index);
      } else if (
        value === null || (value === undefined && ignoreUndefined === false)
      ) {
        index = serializeNull(buffer, key, value, index);
      } else if (
        value['_bsontype'] === 'ObjectId' || value['_bsontype'] === 'ObjectID'
      ) {
        index = serializeObjectId(buffer, key, value, index);
      } else if (isUint8Array(value)) {
        index = serializeBuffer(buffer, key, value, index);
      } else if (value instanceof RegExp || isRegExp(value)) {
        index = serializeRegExp(buffer, key, value, index);
      } else if (type === 'object' && value['_bsontype'] == null) {
        index = serializeObject(
          buffer,
          key,
          value,
          index,
          checkKeys,
          depth,
          serializeFunctions,
          ignoreUndefined,
          path,
        );
      } else if (type === 'object' && value['_bsontype'] === 'Decimal128') {
        index = serializeDecimal128(buffer, key, value, index);
      } else if (
        value['_bsontype'] === 'Long' || value['_bsontype'] === 'Timestamp'
      ) {
        index = serializeLong(buffer, key, value, index);
      } else if (value['_bsontype'] === 'Double') {
        index = serializeDouble(buffer, key, value, index);
      } else if (value['_bsontype'] === 'Code') {
        index = serializeCode(
          buffer,
          key,
          value,
          index,
          checkKeys,
          depth,
          serializeFunctions,
          ignoreUndefined,
          path,
        );
      } else if (typeof value === 'function' && serializeFunctions) {
        index = serializeFunction(buffer, key, value, index);
      } else if (value['_bsontype'] === 'Binary') {
        index = serializeBinary(buffer, key, value, index);
      } else if (value['_bsontype'] === 'Symbol') {
        index = serializeSymbol(buffer, key, value, index);
      } else if (value['_bsontype'] === 'DBRef') {
        index = serializeDBRef(
          buffer,
          key,
          value,
          index,
          depth,
          serializeFunctions,
          path,
        );
      } else if (value['_bsontype'] === 'BSONRegExp') {
        index = serializeBSONRegExp(buffer, key, value, index);
      } else if (value['_bsontype'] === 'Int32') {
        index = serializeInt32(buffer, key, value, index);
      } else if (
        value['_bsontype'] === 'MinKey' || value['_bsontype'] === 'MaxKey'
      ) {
        index = serializeMinMax(buffer, key, value, index);
      } else if (typeof value['_bsontype'] !== 'undefined') {
        throw new BSONError(
          `Unrecognized or invalid _bsontype: ${String(value['_bsontype'])}`,
        );
      }
    }
  } else {
    if (typeof object?.toBSON === 'function') {
      // Provided a custom serialization method
      object = object.toBSON();
      if (object != null && typeof object !== 'object') {
        throw new BSONError('toBSON function did not return an object');
      }
    }

    // Iterate over all the keys
    for (const key of Object.keys(object)) {
      let value = object[key];
      // Is there an override value
      if (typeof value?.toBSON === 'function') {
        value = value.toBSON();
      }

      // Check the type of the value
      const type = typeof value;

      // Check the key and throw error if it's illegal
      if (typeof key === 'string' && !ignoreKeys.has(key)) {
        if (key.match(regexp) != null) {
          // The BSON spec doesn't allow keys with null bytes because keys are
          // null-terminated.
          throw new BSONError('key ' + key + ' must not contain null bytes');
        }

        if (checkKeys) {
          if ('$' === key[0]) {
            throw new BSONError('key ' + key + ' must not start with \'$\'');
          } else if (~key.indexOf('.')) {
            throw new BSONError('key ' + key + ' must not contain \'.\'');
          }
        }
      }

      if (type === 'string') {
        index = serializeString(buffer, key, value, index);
      } else if (type === 'number') {
        index = serializeNumber(buffer, key, value, index);
      } else if (type === 'bigint') {
        throw new BSONError('Unsupported type BigInt, please use Decimal128');
      } else if (type === 'boolean') {
        index = serializeBoolean(buffer, key, value, index);
      } else if (value instanceof Date || isDate(value)) {
        index = serializeDate(buffer, key, value, index);
      } else if (value === undefined) {
        if (ignoreUndefined === false) {
          index = serializeNull(buffer, key, value, index);
        }
      } else if (value === null) {
        index = serializeNull(buffer, key, value, index);
      } else if (
        value['_bsontype'] === 'ObjectId' || value['_bsontype'] === 'ObjectID'
      ) {
        index = serializeObjectId(buffer, key, value, index);
      } else if (isUint8Array(value)) {
        index = serializeBuffer(buffer, key, value, index);
      } else if (value instanceof RegExp || isRegExp(value)) {
        index = serializeRegExp(buffer, key, value, index);
      } else if (type === 'object' && value['_bsontype'] == null) {
        index = serializeObject(
          buffer,
          key,
          value,
          index,
          checkKeys,
          depth,
          serializeFunctions,
          ignoreUndefined,
          path,
        );
      } else if (type === 'object' && value['_bsontype'] === 'Decimal128') {
        index = serializeDecimal128(buffer, key, value, index);
      } else if (
        value['_bsontype'] === 'Long' || value['_bsontype'] === 'Timestamp'
      ) {
        index = serializeLong(buffer, key, value, index);
      } else if (value['_bsontype'] === 'Double') {
        index = serializeDouble(buffer, key, value, index);
      } else if (value['_bsontype'] === 'Code') {
        index = serializeCode(
          buffer,
          key,
          value,
          index,
          checkKeys,
          depth,
          serializeFunctions,
          ignoreUndefined,
          path,
        );
      } else if (typeof value === 'function' && serializeFunctions) {
        index = serializeFunction(buffer, key, value, index);
      } else if (value['_bsontype'] === 'Binary') {
        index = serializeBinary(buffer, key, value, index);
      } else if (value['_bsontype'] === 'Symbol') {
        index = serializeSymbol(buffer, key, value, index);
      } else if (value['_bsontype'] === 'DBRef') {
        index = serializeDBRef(
          buffer,
          key,
          value,
          index,
          depth,
          serializeFunctions,
          path,
        );
      } else if (value['_bsontype'] === 'BSONRegExp') {
        index = serializeBSONRegExp(buffer, key, value, index);
      } else if (value['_bsontype'] === 'Int32') {
        index = serializeInt32(buffer, key, value, index);
      } else if (
        value['_bsontype'] === 'MinKey' || value['_bsontype'] === 'MaxKey'
      ) {
        index = serializeMinMax(buffer, key, value, index);
      } else if (typeof value['_bsontype'] !== 'undefined') {
        throw new BSONError(
          `Unrecognized or invalid _bsontype: ${String(value['_bsontype'])}`,
        );
      }
    }
  }

  // Remove the path
  path.delete(object);

  // Final padding byte for object
  buffer[index++] = 0x00;

  // Final size
  const size = index - startingIndex;
  // Write the size of the object
  buffer[startingIndex++] = size & 0xff;
  buffer[startingIndex++] = (size >> 8) & 0xff;
  buffer[startingIndex++] = (size >> 16) & 0xff;
  buffer[startingIndex++] = (size >> 24) & 0xff;
  return index;
}
