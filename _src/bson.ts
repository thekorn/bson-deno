import { Binary, UUID } from './binary.ts';
import { Code } from './code.ts';
import { DBRef } from './db_ref.ts';
import { Decimal128 } from './decimal128.ts';
import { Double } from './double.ts';
import { Int32 } from './int_32.ts';
import { Long } from './long.ts';
import { MaxKey } from './max_key.ts';
import { MinKey } from './min_key.ts';
import { ObjectId } from './objectid.ts';
import { internalCalculateObjectSize } from './parser/calculate_size.ts';
// Parts of the parser
import {
  DeserializeOptions,
  internalDeserialize,
} from './parser/deserializer.ts';
import { serializeInto, SerializeOptions } from './parser/serializer.ts';
import { BSONRegExp } from './regexp.ts';
import { BSONSymbol } from './symbol.ts';
import { Timestamp } from './timestamp.ts';
import { ByteUtils } from './utils/byte_utils.ts';
export type {
  BinaryExtended,
  BinaryExtendedLegacy,
  BinarySequence,
  UUIDExtended,
} from './binary.ts';
export type { CodeExtended } from './code.ts';
export type { DBRefLike } from './db_ref.ts';
export type { Decimal128Extended } from './decimal128.ts';
export type { DoubleExtended } from './double.ts';
export type { EJSONOptions } from './extended_json.ts';
export type { Int32Extended } from './int_32.ts';
export type { LongExtended } from './long.ts';
export type { MaxKeyExtended } from './max_key.ts';
export type { MinKeyExtended } from './min_key.ts';
export type { ObjectIdExtended, ObjectIdLike } from './objectid.ts';
export type { BSONRegExpExtended, BSONRegExpExtendedLegacy } from './regexp.ts';
export type { BSONSymbolExtended } from './symbol.ts';
export type {
  LongWithoutOverrides,
  TimestampExtended,
  TimestampOverrides,
} from './timestamp.ts';
export type { LongWithoutOverridesClass } from './timestamp.ts';
export type { DeserializeOptions, SerializeOptions };

export {
  Binary,
  BSONRegExp,
  BSONSymbol,
  Code,
  DBRef,
  Decimal128,
  Double,
  Int32,
  Long,
  MaxKey,
  MinKey,
  ObjectId,
  Timestamp,
  UUID,
};
export { BSONError } from './error.ts';
export { BSONType } from './constants.ts';
export { EJSON } from './extended_json.ts';

/** @public */
export interface Document {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/** @internal */
// Default Max Size
const MAXSIZE = 1024 * 1024 * 17;

// Current Internal Temporary Serialization Buffer
let buffer = ByteUtils.allocate(MAXSIZE);

/**
 * Sets the size of the internal serialization buffer.
 *
 * @param size - The desired size for the internal serialization buffer
 * @public
 */
export function setInternalBufferSize(size: number): void {
  // Resize the internal serialization buffer if needed
  if (buffer.length < size) {
    buffer = ByteUtils.allocate(size);
  }
}

/**
 * Serialize a Javascript object.
 *
 * @param object - the Javascript object to serialize.
 * @returns Buffer object containing the serialized object.
 * @public
 */
export function serialize(
  object: Document,
  options: SerializeOptions = {},
): Uint8Array {
  // Unpack the options
  const checkKeys = typeof options.checkKeys === 'boolean'
    ? options.checkKeys
    : false;
  const serializeFunctions = typeof options.serializeFunctions === 'boolean'
    ? options.serializeFunctions
    : false;
  const ignoreUndefined = typeof options.ignoreUndefined === 'boolean'
    ? options.ignoreUndefined
    : true;
  const minInternalBufferSize =
    typeof options.minInternalBufferSize === 'number'
      ? options.minInternalBufferSize
      : MAXSIZE;

  // Resize the internal serialization buffer if needed
  if (buffer.length < minInternalBufferSize) {
    buffer = ByteUtils.allocate(minInternalBufferSize);
  }

  // Attempt to serialize
  const serializationIndex = serializeInto(
    buffer,
    object,
    checkKeys,
    0,
    0,
    serializeFunctions,
    ignoreUndefined,
    null,
  );

  // Create the final buffer
  const finishedBuffer = ByteUtils.allocate(serializationIndex);

  // Copy into the finished buffer
  finishedBuffer.set(buffer.subarray(0, serializationIndex), 0);

  // Return the buffer
  return finishedBuffer;
}

/**
 * Serialize a Javascript object using a predefined Buffer and index into the buffer,
 * useful when pre-allocating the space for serialization.
 *
 * @param object - the Javascript object to serialize.
 * @param finalBuffer - the Buffer you pre-allocated to store the serialized BSON object.
 * @returns the index pointing to the last written byte in the buffer.
 * @public
 */
export function serializeWithBufferAndIndex(
  object: Document,
  finalBuffer: Uint8Array,
  options: SerializeOptions = {},
): number {
  // Unpack the options
  const checkKeys = typeof options.checkKeys === 'boolean'
    ? options.checkKeys
    : false;
  const serializeFunctions = typeof options.serializeFunctions === 'boolean'
    ? options.serializeFunctions
    : false;
  const ignoreUndefined = typeof options.ignoreUndefined === 'boolean'
    ? options.ignoreUndefined
    : true;
  const startIndex = typeof options.index === 'number' ? options.index : 0;

  // Attempt to serialize
  const serializationIndex = serializeInto(
    buffer,
    object,
    checkKeys,
    0,
    0,
    serializeFunctions,
    ignoreUndefined,
    null,
  );

  finalBuffer.set(buffer.subarray(0, serializationIndex), startIndex);

  // Return the index
  return startIndex + serializationIndex - 1;
}

/**
 * Deserialize data as BSON.
 *
 * @param buffer - the buffer containing the serialized set of BSON documents.
 * @returns returns the deserialized Javascript Object.
 * @public
 */
export function deserialize(
  buffer: Uint8Array,
  options: DeserializeOptions = {},
): Document {
  return internalDeserialize(ByteUtils.toLocalBufferType(buffer), options);
}

/** @public */
export type CalculateObjectSizeOptions = Pick<
  SerializeOptions,
  'serializeFunctions' | 'ignoreUndefined'
>;

/**
 * Calculate the bson size for a passed in Javascript object.
 *
 * @param object - the Javascript object to calculate the BSON byte size for
 * @returns size of BSON object in bytes
 * @public
 */
export function calculateObjectSize(
  object: Document,
  options: CalculateObjectSizeOptions = {},
): number {
  options = options || {};

  const serializeFunctions = typeof options.serializeFunctions === 'boolean'
    ? options.serializeFunctions
    : false;
  const ignoreUndefined = typeof options.ignoreUndefined === 'boolean'
    ? options.ignoreUndefined
    : true;

  return internalCalculateObjectSize(
    object,
    serializeFunctions,
    ignoreUndefined,
  );
}

/**
 * Deserialize stream data as BSON documents.
 *
 * @param data - the buffer containing the serialized set of BSON documents.
 * @param startIndex - the start index in the data Buffer where the deserialization is to start.
 * @param numberOfDocuments - number of documents to deserialize.
 * @param documents - an array where to store the deserialized documents.
 * @param docStartIndex - the index in the documents array from where to start inserting documents.
 * @param options - additional options used for the deserialization.
 * @returns next index in the buffer after deserialization **x** numbers of documents.
 * @public
 */
export function deserializeStream(
  data: Uint8Array | ArrayBuffer,
  startIndex: number,
  numberOfDocuments: number,
  documents: Document[],
  docStartIndex: number,
  options: DeserializeOptions,
): number {
  const internalOptions = Object.assign(
    { allowObjectSmallerThanBufferSize: true, index: 0 },
    options,
  );
  const bufferData = ByteUtils.toLocalBufferType(data);

  let index = startIndex;
  // Loop over all documents
  for (let i = 0; i < numberOfDocuments; i++) {
    // Find size of the document
    const size = bufferData[index] |
      (bufferData[index + 1] << 8) |
      (bufferData[index + 2] << 16) |
      (bufferData[index + 3] << 24);
    // Update options with index
    internalOptions.index = index;
    // Parse the document at this point
    documents[docStartIndex + i] = internalDeserialize(
      bufferData,
      internalOptions,
    );
    // Adjust index by the document size
    index = index + size;
  }

  // Return object containing end index of parsing and list of documents
  return index;
}
