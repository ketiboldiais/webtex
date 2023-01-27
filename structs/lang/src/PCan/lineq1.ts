import { word, skipSpace } from '../pcox/index.js';
import { StringTup4, letter, op } from './cas.js';
import { number } from './helpers.js';
import { rational } from './frac.js';

type ExprType = '1-variable-linear-equation';

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
    this.type = '1-variable-linear-equation';
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
  solve(format: 'real' | 'fraction' | 'string' = 'real') {
    const rhs =
      this.operator === '-'
        ? this.value + this.coefficients[1]
        : this.value - this.coefficients[1];
    const result = rhs / this.coefficients[0];
    switch (format) {
      case 'fraction':
        return rational(result);
      case 'string':
        return rational(result).string;
      default:
        return result;
    }
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
  number,
  skipSpace,
  letter,
  skipSpace,
  op,
  skipSpace,
  number
).map((d) => ({
  type: '1-variable-linear-equation',
  out: {
    eq: d.out as StringTup4,
    coefficients: [Number(d.out[0]), Number(d.out[3])],
    variable: d.out[1] as string,
    op: d.out[2] as string,
  },
}));

/**
 * Creates a new linear-equation of
 * 1-variable.
 * 
 * @example
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const equation1 = linear1('3/2x + 5').equals(20);
    console.log(equation1);
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Output:
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  LinearEquation1 {
    type: '1-variable-linear-equation',
    equation: '1.5x+5',
    terms: [ 1.5, 'x', '+', 5 ],
    coefficients: [ 1.5, 5 ],
    variable: 'x',
    operator: '+',
    value: 20
   }
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
const linear1 = (src: string) => {
  const res = lineq.parse(src);
  return new LinearEquation1(
    res.result.eq,
    res.result.coefficients,
    res.result.variable,
    res.result.op
  );
};

const equation1 = linear1('3/2x + 5').equals(20);
const solution1 = equation1.solve('real');
console.log(solution1);
