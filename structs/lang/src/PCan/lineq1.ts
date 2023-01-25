import { log } from '../utils/index.js';
import { any, a, skipSpace, word, choice } from '../pcox/index.js';
import { GCD } from './mutil.js';
import { ParserError } from '../prex/parser.js';
/* -------------------------------------------------------------------------- */
/*                         ALGEBRAIC EXPRESSION PARSER                        */
/* -------------------------------------------------------------------------- */
/**
 * This is the algebraic expression parser.
 */
type StringTup4 = [string, string, string, string];
const digits = any('digit');
const letter = any('letter');
const plus = a('+');
const minus = a('-');
const div = a('/');
const op = choice(plus, minus);
const natural = digits.map((d) => ({
  out: Number(d.out),
  type: 'natural-number',
}));

const rational = word(natural, skipSpace, div, skipSpace, natural).map((d) => ({
  out: {
    n: d.out[0] as number,
    d: d.out[2] as number,
  },
  type: 'rational-number',
}));

class Frac {
  private n: number;
  private d: number;
  constructor(x: string | number, ε: number = 0.0001) {
    if (typeof x === 'string') {
      const p = rational.parse(x);
      this.n = p.result.n;
      this.d = p.result.d;
      return this;
    }
    return this.fromDec(x, ε);
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
  scale(by: number) {
    this.n = this.n * by;
    this.d = this.d * by;
    return this;
  }
  strung() {
    return `${this.n}/${this.d}`;
  }

  private normalize(n: Frac | string | number) {
    if (n instanceof Frac) return n;
    else return new Frac(n);
  }

  mul(n: Frac | string | number) {
    const arg = this.normalize(n);
    const num = this.n * arg.n;
    const den = this.d * arg.d;
    return new Frac(num / den);
  }
  ['*'](n: Frac | string | number) {
    return this.mul(n);
  }

  div(n: Frac | string | number) {
    const arg = this.normalize(n);
    const num = this.n * arg.d;
    const den = this.d * arg.n;
    return new Frac(num / den);
  }
  ['/'](n: Frac | string | number) {
    return this.div(n);
  }

  add(n: Frac | string | number) {
    const arg = this.normalize(n);
    const gcd = GCD(this.d, arg.d);
    const [n1, d1] = [this.n * gcd, this.d * gcd];
    const [n2, d2] = [arg.n * gcd, arg.d * gcd];
    return new Frac((n1 + n2) / (gcd));
  }
  sub(n: Frac | string | number) {}
}

const fraction = (x: string | number) => {
  return new Frac(x);
};

const x = fraction(1 / 4);
const y = fraction(1 / 4);
const z = x.add(y);
log(z)

type ExprType = '1-variable-linear-expr';

class LinearEquation1 {
  type: ExprType;
  equation: string;
  private terms: StringTup4;
  private coefficients: number[];
  private variable: string;
  private operator: string;
  private value: number;
  constructor(
    terms: StringTup4,
    coefficients: number[],
    variable: string,
    op: string
  ) {
    this.type = '1-variable-linear-expr';
    this.equation = terms.join('');
    this.terms = terms;
    this.coefficients = coefficients;
    this.variable = variable;
    this.operator = op;
    this.value = 0;
  }
  private updateEq() {
    this.equation = this.terms.join('');
  }
  solve() {
    const rhs =
      this.operator === '-'
        ? this.value + this.coefficients[1]
        : this.value - this.coefficients[1];
    return rhs / this.coefficients[0];
  }
  equals(value: number) {
    this.value = value;
    return this;
  }
  op(operator: '-' | '+') {
    this.operator = operator;
    this.terms[2] = operator;
    this.updateEq();
    return this;
  }
  var(variable: string) {
    if (variable.length > 1) {
      variable = `(${variable})`;
    }
    this.terms[1] = variable;
    this.variable = variable;
    this.updateEq();
    return this;
  }
}

const lineq = word(
  digits,
  skipSpace,
  letter,
  skipSpace,
  op,
  skipSpace,
  digits
).map((d) => ({
  type: '1-variable-linear-equation',
  out: {
    eq: d.out as StringTup4,
    coefficients: [Number(d.out[0]), Number(d.out[3])],
    variable: d.out[1] as string,
    op: d.out[2] as string,
  },
}));

const linearEq1 = (src: string) => {
  const res = lineq.parse(src);
  return new LinearEquation1(
    res.result.eq,
    res.result.coefficients,
    res.result.variable,
    res.result.op
  );
};
const eqn = linearEq1('5x + 120').equals(20);
const sol = eqn.solve();
log(sol);
