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

  map(fn: (value: T) => T | null): Maybe<T> {
    return this.value === null ? this : Maybe.of<T>(fn(this.value));
  }

  unwrap(defaultValue: T): T {
    return this.value === null ? defaultValue : this.value;
  }
}

export const box = <T>(value: T) => new Maybe(value);