const nil = Symbol("nil");

export class Box<T> {
  constructor(private value: T | typeof nil) {}

  static of<T>(value: T): Box<T> {
    return (value === null || value === undefined)
      ? Box.none()
      : Box.some(value);
  }

  isNothing(): boolean {
    return this.value === nil;
  }

  static some<T>(value: T): Box<T> {
    return new Box<T>(value);
  }

  static none<T>(): Box<T> {
    return new Box<T>(nil);
  }

  join(): Box<T> {
    return (this.value instanceof Box)
      ? (this.value.isNothing() ? Box.none<T>() : this.value)
      : this;
  }

  unwrap(fallback: T): T {
    return this.value === nil ? fallback : this.value;
  }

  map<U>(f: (value: T) => U | null | undefined): Box<U> {
    if (this.value === nil) return Box.none<U>();
    const res = f(this.value);
    if (res === null || res === undefined) return Box.none();
    return Box.some(res);
  }

  chain<U>(f: (value: T) => Box<U>): Box<U> {
    // deno-fmt-ignore
    return (this.value===nil) 
      ? Box.none<U>()
      : f(this.value);
  }
}

// deno-fmt-ignore
export const box = <T>(value?:T|null) => (
  (value === null) || (value===undefined)
) ? Box.none<T>() : Box.of(value);
