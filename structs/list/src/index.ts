class NODE<T> {
  key: number | string;
  data: T;
  next: NODE<T> | null = null;
  prev: NODE<T> | null = null;

  constructor(data: T, key?: number | string) {
    this.key = key ?? 0;
    this.data = data;
  }
}

/**
 * @param data
 * The data field takes a generic.
 * Any data can be stored in a node.
 * @param key
 * An optional number or string value to
 * be used as a unique identifier.
 * If no value is provided, the value
 * defaults to 0.
 * @returns A new NODE object. This is an
 * object with two properties, `next` and `prev`.
 * Both properties expect a NODE of the same
 * type or the literal `null`.
 * @public
 */

export const node = <T>(data: T, key?: string | number) => new NODE(data, key);
