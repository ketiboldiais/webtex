/**
 * Computes the sum of two numbers, `x`
 * and `y`. This function has an arity of 2.
 * For an n-ary sum, see {@link sum}.
 *
 * @example
 * ```
 * const x = add(1,2) // 3
 * ```
 */
export const add = (x: number, y: number) => x + y;

/**
 * Computes the sum of all the numeric
 * arguments passed.
 *
 * @example
 * ```
 * const x = sum(1,2,3,4); // 10
 * ```
 */
export const sum = (...xs: number[]) => {
  let out = 0;
  for (let i = 0; i < xs.length; i++) {
    out += xs[i];
  }
  return out;
};

/**
 * Computes the difference of two numbers, `x`
 * and `y`. This function has an arity of 2.
 *
 * @example
 * ```
 * const x = minus(7,3) // 4
 * ```
 */
export const minus = (x: number, y: number) => x - y;

/**
 * Computes the left-difference of the given terms
 * (`difl` is short for “difference left”). Given
 * terms:
 * ```
 * (x₁, x₂, ..., xₙ)
 * ```
 * returns
 * ```
 * x₁ - x₂ - ... - xₙ
 * ```
 * Note that subtraction is a non-commutative
 * operation: `a - b ≠ b - a`. Term ordering
 * matters. An accompanying right difference
 * method can be found in {@link difr}.
 *
 * @example
 * ```
 * const x = difl(5,4,3,2,1); // -5
 * ```
 */
export const difl = (...terms: number[]) => {
  let out = terms[0];
  for (let i = 1; i < terms.length; i++) {
    out -= terms[i];
  }
  return out;
};

/**
 * Computes the right-difference of the given terms
 * (`difr` is short for “difference right”). Given
 * terms:
 * ```
 * (x₁, x₂, ..., xₙ)
 * ```
 * returns
 * ```
 * xₙ - xₙ₋₁ - ... - x₁
 * ```
 * Note that subtraction is a non-commutative
 * operation: `a - b ≠ b - a`. Term ordering
 * matters. An accompanying right difference
 * method can be found in {@link difl}.
 *
 * @example
 * ```
 * const x = difr(5,4,3,2,1); // -13
 * ```
 */
export const difr = (...terms: number[]) => {
  const L = terms.length - 1;
  let out = terms[L];
  for (let i = L - 1; i >= 0; i--) {
    out -= terms[i];
  }
  return out;
};

/**
 * Computes the product of two numbers, `x` and
 * `y`.
 *
 * @example
 * ```
 * const x = times(4,8) // 32
 * ```
 */
export const times = (x: number, y: number) => x * y;

/**
 * Computes the product of the supplied terms.
 * @example
 * ```
 * const x = product(3,4,2,5); // 120
 * ```
 */
export const product = (...terms: number[]) => {
  const L = terms.length;
  let out = 1;
  for (let i = 0; i < L; i++) {
    out *= terms[i];
  }
  return out;
};

/**
 * Computes the integer quotient of the supplied
 * terms.
 *
 * _Comment_. This operation follows the mathematical
 * definition of integer division. If either of the
 * operands are negative, the result is floored. This
 * is in contrast to the implementation of integer
 * division in C, where the result is truncated towards
 * zero.
 *
 * @example
 * ```
 * const x = quot(2,3) // 0
 * const y = quot(-2,3) // -1
 * const z = quot(-9,2) // -5
 * ```
 */
export const quot = (x: number, y: number) => Math.floor(x / y);

/**
 * Computes the divison of two numbers.
 *
 * @example
 * ```
 * const x = div(1,2) // 0.5
 * ```
 */
export const div = (x: number, y: number) => x / y;

/**
 * Computes the integer remainder of the two supplied
 * arguments (`x % y`). For the modulo operation,
 * see {@link mod}.
 *
 * _Comment_. It is highly unlikely that you would
 * ever need this operator. The vast, vast majority
 * of cases using the `%` operator never utilize a
 * negative remainder. Implementing `%` as a signed
 * remainder is a mistake that languages have persisted
 * because of history. It’s almost certainly the case
 * that what you need is the {@link mod} operator, not
 * `rem`.
 *
 * @example
 * ```
 * const a = rem(13,5) // 3
 * const b = rem(-13,5) // -3
 * const c = rem(4,2) // 0
 * const d = rem(-4,2) // -0
 * ```
 */
export const rem = (x: number, y: number) => x % y;

/**
 * Computes the modulo of the two supplied arguments.
 *
 * @example
 * ```
 * const x = mod(5,22) // 5
 * const x = mod(-2,22) // 20
 * const x = mod(-21,22) // 1
 * const x = mod(0,22) // 0
 * ```
 */
export const mod = (x: number, y: number) => ((x % y) + y) % y;

/**
 * Returns the power of the two supplied arguments.
 */
export const pow = (x: number, y: number) => Math.pow(x, y);

/**
 * Returns the `n`th root of `x`.
 */
export const root = (x: number, n: number) => Math.pow(x, 1 / n);

/**
 * Returns true if the two supplied arguments are
 * equal, false otherwise.
 */
export const equal = (x: number, y: number) => x === y;

/**
 * Returns true if the two supplied arguments are not
 * equal, false otherwise.
 */
export const neq = (x: number, y: number) => x !== y;

/**
 * Returns true if `x < y`, false otherwise.
 */
export const lt = (x: number, y: number) => x < y;

/**
 * Returns true if `x > y`, false otherwise.
 */
export const gt = (x: number, y: number) => x > y;

/**
 * Returns true if `x <= y`, false otherwise.
 */
export const lte = (x: number, y: number) => x <= y;

/**
 * Returns true if `x >= y`, false otherwise.
 */
export const gte = (x: number, y: number) => x >= y;

/**
 * Returns true if `x` is even, false otherwise.
 * @example
 * ```
 * const a = even(2) // true
 * const b = even(3) // false
 * const c = even(0) // true
 * const d = even(3.5) // false
 * ```
 */
export const even = (x: number) => x % 2 === 0;

/**
 * Returns true if `x` is odd, false otherwise.
 * @example
 * ```
 * const a = even(2) // false
 * const b = even(3) // true
 * const c = even(0) // false
 * const d = even(3.5) // false
 * ```
 */
export const odd = (x: number) => x % 2 !== 0;

/**
 * Returns the floor of `x`.
 */
export const floor = (x: number) => Math.floor(x);

/**
 * Returns the ceiling of `x`.
 */
export const ceil = (x: number) => Math.ceil(x);

export const geq = (x:number, y:number) => x >= y;
export const leq = (x:number, y:number) => x <= y;
export const percent = (x:number, y:number) => (100 * x) / y;