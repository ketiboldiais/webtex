import { ratio } from './cas.js';
class Rational {
  private n: number;
  private d: number;
  constructor(x: string | number, ε: number = 0.0001) {
    if (typeof x === 'string') {
      const p = ratio.parse(x);
      this.n = p.result.n;
      this.d = p.result.d;
      return this;
    }
    return this.fromDec(x, ε);
  }

  private normalize(n: Rational | string | number) {
    if (n instanceof Rational) return n;
    else return new Rational(n);
  }

  private fromDec(x: number, ε: number) {
    if (x === 0) {
      this.n = 0;
      this.d = 1;
      return this;
    }
    const a = Math.abs(x);
    let n = 0;
    let d = 1;
    let r: number;
    while (true) {
      r = n / d;
      if (Math.abs((r - a) / a) < ε) break;
      if (r < a) n++;
      else d++;
    }
    this.n = x < 0 ? -n : n;
    this.d = d;
    return this;
  }

  private _adder(
    n: Rational | string | number,
    cb: (AB: number, BC: number) => number
  ) {
    const arg = this.normalize(n);
    const B = this.d;
    const D = arg.d;
    const BD = B * D;
    const A = this.n;
    const C = arg.n;
    const AD = A * D;
    const BC = B * C;
    return new Rational(cb(AD, BC) / BD);
  }

  /**
	 * Returns the floating-point value of the 
	 * fraction (a JavaScript `number`).
	 * 
	 * @example
	 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			const x = frac('1/5');
			console.log(x.real); // 0.2

			const y = frac(7/23);
			console.log(y.real); // 0.30434782608695654
	 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	 */
  get real() {
    return this.n / this.d;
  }

  /**
	 * Returns the fraction’s string representation.
	 * 
	 * @example
	 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			const x = frac(0.5); 
			console.log(x.string) // '1/2'

			const y = frac(0.33333);
			console.log(y.string); // '1/3'
	 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	 * 
	 */
  get string() {
    return `${this.n}/${this.d}`;
  }

  scale(by: number) {
    this.n = this.n * by;
    this.d = this.d * by;
    return this;
  }

  mul(n: Rational | string | number) {
    const arg = this.normalize(n);
    const num = this.n * arg.n;
    const den = this.d * arg.d;
    return new Rational(num / den);
  }

  div(n: Rational | string | number) {
    const arg = this.normalize(n);
    const num = this.n * arg.d;
    const den = this.d * arg.n;
    return new Rational(num / den);
  }

  /**
   * Computes fraction addition.
   * That is, given the fraction `A/B`
   * and the argument `n = C/D`,
   * returns the sum `(AD + BC)/BD`.
   */
  add(n: Rational | string | number) {
    return this._adder(n, (a, b) => a + b);
  }

  /**
   * Computes fraction subtraction.
   * That is, given the fraction `A/B`
   * and the argument `n = C/D`,
   * returns the difference `(AD - BC)/BD`.
   */
  sub(n: Rational | string | number) {
    return this._adder(n, (a, b) => a - b);
  }
}

/**
 * Creates a new fraction, an object of the form
 * `{n:number, d:number}`, where `n` is the
 * numerator and `d` is the denominator.
 * 
 * @example
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		const a = frac('1/8');
		console.log(a); // Rational {n:1, d:8}

		const b = frac(0.66666);
		console.log(b); // Rational {n:2, d:3}
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
export const rational = (x: string | number) => {
  return new Rational(x);
};
