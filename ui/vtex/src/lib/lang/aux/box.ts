const SOME = Symbol("some");
const NONE = Symbol("none");
type SomeBox = typeof SOME;
type EmptyBox = typeof NONE;
type BoxType = SomeBox | EmptyBox;

abstract class Box<T> {
  tag: BoxType;
  constructor(tag: BoxType) {
    this.tag = tag;
  }
  abstract isNone(): boolean;
  abstract isSome(): boolean;
  abstract map<K>(f: (val: T) => K): Box<K>;
  abstract unwrap(fallback: T): T;
}

class Some<T> extends Box<T> {
  value: T;
  constructor(value: T) {
    super(SOME);
    this.value = value;
  }
  isNone(): this is None<never> {
    return false;
  }
  isSome(): this is Some<T> {
    return true;
  }
  map<K>(f: (val: T) => K) {
    return new Some(f(this.value));
  }
  unwrap(fallback: T) {
    return this.value;
  }
}

class None<T> extends Box<T> {
  constructor() {
    super(NONE);
  }
  isNone(): this is Some<never> {
    return true;
  }
  isSome(): this is None<T> {
    return false;
  }
  map<K>(f: (val: T) => K) {
    return this as unknown as Box<K>;
  }
  unwrap(fallback: T): T {
    return fallback;
  }
}

// deno-fmt-ignore
const box = <T>(value?: T | null) =>
  value === null || value === undefined 
    ? new None<T>() 
    : new Some<T>(value);

