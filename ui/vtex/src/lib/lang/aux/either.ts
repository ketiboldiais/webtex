export class Left<T> {
  readonly value: T;

  private constructor(error: T) {
    this.value = error;
  }

  isLeft(): this is Left<T> {
    return true;
  }

  isRight(): this is Right<never> {
    return false;
  }

  map<X>(f: (value: T) => X): Left<X> {
    return this as unknown as Left<X>;
  }

  static of<U>(error: U): Left<U> {
    return new Left(error);
  }
}

export const left = <T>(x: T) => Left.of(x);

export class Right<T> {
  readonly value: T;
  private constructor(value: T) {
    this.value = value;
  }
  isLeft(): this is Left<never> {
    return false;
  }
  isRight(): this is Right<T> {
    return true;
  }
  static of<U>(value: U): Right<U> {
    return new Right(value);
  }
  map<X>(f: (value: T) => X): Right<X> {
    return new Right(f(this.value));
  }

}

export const right = <T>(x: T) => Right.of(x);

export type Either<T, U> = Left<T> | Right<U>;

const either = <T, U>(left: Left<T>, right: Right<U>) => ({
  given: (
    condition: boolean,
  ): Either<T, U> => condition ? right : left,
});

const n = 100;

const res = either(
  left(200),
  right(5),
).given(n < 200);
