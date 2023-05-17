import { print } from "../utils.js";

export type Either<A, B> = Left<A> | Right<B>;

export class Left<T> {
  private value: T;
  constructor(value: T) {
    this.value = value;
  }
  map<X>(f: (x: never) => X): Right<X> {
    return this as any;
  }
  isLeft(): this is Left<T> {
    return true;
  }
  isRight(): this is never {
    return false;
  }
  chain<X, S>(f: (x: never) => Either<X, S>): Left<T> {
    return this;
  }
  read<K>(value: K): K {
    return value;
  }
  flatten(): Left<T> {
    return this;
  }
  unwrap() {
    return this.value;
  }
  ap<X,B>(f: Left<T>|Right<(x:X) => B>) {
    return this as any as Right<B>;
  }
}
export class Right<T> {
  private value: T;
  constructor(value: T) {
    this.value = value;
  }
  map<X>(f: (x: T) => X): Either<never, X> {
    return new Right(f(this.value));
  }
  isLeft(): this is never {
    return false;
  }
  isRight(): this is Right<T> {
    return true;
  }
  chain<N, X>(f: (x: T) => Either<N, X>): Either<never, X> {
    return f(this.value) as Either<never, X>;
  }
  flatten(): Right<(T extends Right<(infer T)> ? T : never)> {
    return ((this.value instanceof Right<T> ||
        this.value instanceof Left<never>)
      ? this.value
      : this) as Right<(T extends Right<(infer T)> ? T : never)>;
  }
  read<K>(_: K): T {
    return this.value;
  }
  unwrap() {
    return this.value;
  }
  ap<X,B>(f:Left<X>|Right<(x:T) => B>) {
    if (f.isLeft()) return f as any as Right<T>;
    return this.map(f.value);
  }
}
export const left = <T>(x: T): Either<T, never> => new Left(x);
export const right = <T>(x: T): Either<never, T> => new Right(x);
export const either = <T>(x: T): Either<never, T> => new Right(x);

