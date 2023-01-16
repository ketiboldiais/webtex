import { flow, pipe } from 'fp-ts/lib/function.js';
import type { State } from './index.js';

export const { log: show } = console;

export class make {
  public static new<Target>(): With<Target, {}> {
    return new Builder<Target, {}>({});
  }
}

export interface With<Target, Supplied> {
  with<T extends Omit<Target, keyof Supplied>, K extends keyof T>(
    key: K,
    value: T[K]
  ): keyof Omit<Omit<Target, keyof Supplied>, K> extends never
    ? Build<Target>
    : With<Target, Supplied & Pick<T, K>>;
}

export interface Build<Target> {
  build(): Target;
}

export class Builder<Target, Supplied>
  implements Build<Target>, With<Target, Supplied>
{
  constructor(private target: Partial<Target>) {}
  with<T extends Omit<Target, keyof Supplied>, K extends keyof T>(
    key: K,
    value: T[K]
  ) {
    const target: Partial<Target> = { ...this.target, [key]: value };
    return new Builder<Target, Supplied & Pick<T, K>>(target);
  }
  build() {
    return this.target as Target;
  }
}

export const output = <T>(out: T) => make.new<State<T>>().with('out', out);

export const isString = (x: any) => typeof x === 'string';
export const isEmpty = (s: string) => s === '';

type Condition<T> = (x: T) => boolean;
type Check<T> = [Condition<T>, 'soft' | 'hard'];

const check = <T>(x: T, ...checks: Condition<T>[]): boolean => {
  for (let i = 0; i < checks.length; i++) {
    if (!checks[i](x)) return false;
  }
  return true;
};

const { isInteger, isSafeInteger, isFinite } = Number;
const isNumber = (n: any) => typeof n === 'number';
const isNotNaN = (n: any) => !Number.isNaN(n);
const isFin = (n: any) => check(n, isNumber, isFinite);
const isReal = (n: any) => check(n, isFin, isNotNaN);
const isInt = (n: any) => check(n, isReal, isInteger, isSafeInteger);
const isNeg = (n: any) => check(n, isReal, (x: number) => x < 0);
const isNegInt = (n: any) => check(n, isInt, (x: number) => x < 0);
const isPos = (n: any) => check(n, isReal, (x: number) => x > 0);
const isZero = (n: any) => check(n, isInt, (n) => n === 0);
const isPosInt = (n: any) => check(n, isInt, (x: number) => x > 0);
const isNonNegInt = (n: any) => isZero(n) || isPosInt(n);
const isNonPosInt = (n: any) => isZero(n) || isNegInt(n);

export {
  isNumber,
  isNotNaN,
  isFin,
  isReal,
  isInt,
  isNeg,
  isNegInt,
  isPos,
  isZero,
  isPosInt,
  isNonNegInt,
  isNonPosInt,
};

type Comp = '<' | '<=';
type Range = [number, Comp, number, Comp, number];

/** Tests if a given input falls within the range */
const ranTest = (rng: Range) =>
  (rng[1] === '<' ? rng[0] < rng[2] : rng[0] <= rng[2]) &&
  (rng[3] === '<' ? rng[2] < rng[4] : rng[2] <= rng[4]);

const cmp = (...ranges: Range[]) => {
  for (const r of ranges) {
    if (ranTest(r)) return true;
  }
  return false;
};

const codify = (c: string) => c.charCodeAt(0);

/** Returns `true` if `x` is an ASCII digit, false otherwise. */
const isDigit = (x: string) => cmp([48, '<=', codify(x), '<=', 57]);

/** Returns `true` if `x` is an ASCII uppercase letter, false otherwise. */
const isUpperLatin = (x: string) => cmp([65, '<=', codify(x), '<=', 90]);

/** Returns `true` if `x` is an ASCII lowercase letter, false otherwise. */
const isLowerLatin = (x: string) => cmp([97, '<=', codify(x), '<=', 122]);

/** Returns `true` if `x` is an ASCII letter (upper of lowercase), false otherwise. */
const isLatin = (x: string) => isUpperLatin(x) || isLowerLatin(x);

/** Returns `true` if `x` is neither a lower nor a digit, false otherwise. */
const isNonAlphaNum = (x: string) =>
  cmp(
    [33, '<=', codify(x), '<=', 47],
    [58, '<=', codify(x), '<=', 96],
    [123, '<=', codify(x), '<=', 126]
  );

/** Returns `true` if `x` is a digit _or_ letter, false otherwise. */
const isAlphaNum = (x: string) => isDigit(x) || isLatin(x);

export {
  ranTest,
  cmp,
  codify,
  isDigit,
  isUpperLatin,
  isLowerLatin,
  isLatin,
  isNonAlphaNum,
  isAlphaNum,
};

const print = (s: State<any>) => {
  if (s.err) console.log(s.erm);
  else console.log(s);
};

export { print };

type Branch<a, r> = [a, (arg: a, cases: a[]) => r];

type Path<a, r> = Branch<a, r>[];

/**
 * Pattern matcher. Given a pair `[c,f]`, where `c` is a
 * value and `f` is a function, executes `c` if the `input`
 * passed matches `c`. Otherwise, executes the last by default.
 */
const branch =
  <a, r>(...cases: Path<a, r>) =>
  (input: a) => {
    const arglist = cases.map((d) => d[0]);
    for (const [pattern, act] of cases) {
      if (pattern === input) return act(pattern, arglist);
    }
    return cases[cases.length][1](cases[cases.length][0], arglist);
  };

export { branch };
