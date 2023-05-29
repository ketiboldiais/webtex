export class Fraction {
  /**
   * The denominator of the fraction.
   */
  N: number;
  /**
   * The numerator of the fraction.
   */
  D: number;
  constructor(N: number, D: number) {
    this.N = N;
    this.D = D;
  }
}

export const frac = (numerator: number, denominator: number) =>
  new Fraction(
    numerator,
    denominator,
  );

  
