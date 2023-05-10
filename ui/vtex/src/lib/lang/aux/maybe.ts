export class Maybe<T> {
  value: T | null;
  constructor(value: T | null) {
    this.value = value;
  }
  isNothing() {
    return this.value === null || this.value === undefined;
  }

  static some<T>(value: T) {
    return new Maybe(value);
  }

  static none<T>() {
    return new Maybe<T>(null);
  }

  static of<T>(value: T | null): Maybe<T> {
    return value ? Maybe.some(value) : Maybe.none<T>();
  }

  onlyIf<K extends T>(condition: (val: T) => val is K) {
    const val = this.value;
    if (val===null) return Maybe.none<K>();
    if (condition(val)) {
      return Maybe.some(val as K);
    }
    return Maybe.some<K>(val as K);
  }
  
  ap<K>(f: (x: T) => K) {
    const val = this.value;
    if (val === null) {
      return this;
    }
    const res = f(val);
    if (res === null) {
      return this;
    }
    return res;
  }

  map<K>(fn: (value: T) => K | null): Maybe<K> {
    return this.value === null
      ? (this as unknown as Maybe<K>)
      : Maybe.of<K>(fn(this.value));
  }

  unwrap(defaultValue: T): T {
    return this.value === null ? defaultValue : this.value;
  }
}

export const box = <T>(value: T) => new Maybe(value);

