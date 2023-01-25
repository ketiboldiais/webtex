import { log } from '../../utils/index.js';
import { any, a, skipSpace, word, choice } from '../../PCox/index.js';
import { ParserError } from '../parser.js';
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
const op = choice(plus, minus);

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
