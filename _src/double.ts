import type { EJSONOptions } from './extended_json.ts';

/** @public */
export interface DoubleExtended {
  $numberDouble: string;
}

/**
 * A class representation of the BSON Double type.
 * @public
 * @category BSONType
 */
export class Double {
  get _bsontype(): 'Double' {
    return 'Double';
  }

  value!: number;
  /**
   * Create a Double type
   *
   * @param value - the number we want to represent as a double.
   */
  constructor(value: number) {
    if ((value as unknown) instanceof Number) {
      value = value.valueOf();
    }

    this.value = +value;
  }

  /**
   * Access the number value.
   *
   * @returns returns the wrapped double number.
   */
  valueOf(): number {
    return this.value;
  }

  toJSON(): number {
    return this.value;
  }

  toString(radix?: number): string {
    return this.value.toString(radix);
  }

  /** @internal */
  toExtendedJSON(options?: EJSONOptions): number | DoubleExtended {
    if (
      options && (options.legacy || (options.relaxed && isFinite(this.value)))
    ) {
      return this.value;
    }

    // NOTE: JavaScript has +0 and -0, apparently to model limit calculations. If a user
    // explicitly provided `-0` then we need to ensure the sign makes it into the output
    if (Object.is(Math.sign(this.value), -0)) {
      return { $numberDouble: `-${this.value.toFixed(1)}` };
    }

    let $numberDouble: string;
    if (Number.isInteger(this.value)) {
      $numberDouble = this.value.toFixed(1);
      if ($numberDouble.length >= 13) {
        $numberDouble = this.value.toExponential(13).toUpperCase();
      }
    } else {
      $numberDouble = this.value.toString();
    }

    return { $numberDouble };
  }

  /** @internal */
  static fromExtendedJSON(
    doc: DoubleExtended,
    options?: EJSONOptions,
  ): number | Double {
    const doubleValue = parseFloat(doc.$numberDouble);
    return options && options.relaxed ? doubleValue : new Double(doubleValue);
  }

  /** @internal */
  [Symbol.for('nodejs.util.inspect.custom')](): string {
    return this.inspect();
  }

  inspect(): string {
    const eJSON = this.toExtendedJSON() as DoubleExtended;
    return `new Double(${eJSON.$numberDouble})`;
  }
}
