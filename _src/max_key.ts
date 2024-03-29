/** @public */
export interface MaxKeyExtended {
  $maxKey: 1;
}

/**
 * A class representation of the BSON MaxKey type.
 * @public
 * @category BSONType
 */
export class MaxKey {
  get _bsontype(): 'MaxKey' {
    return 'MaxKey';
  }

  /** @internal */
  toExtendedJSON(): MaxKeyExtended {
    return { $maxKey: 1 };
  }

  /** @internal */
  static fromExtendedJSON(): MaxKey {
    return new MaxKey();
  }

  /** @internal */
  [Symbol.for('nodejs.util.inspect.custom')](): string {
    return this.inspect();
  }

  inspect(): string {
    return 'new MaxKey()';
  }
}
