import { Node, BinaryExpr, Id } from './index.js';
import { NodeType, BinaryMathOp, NumberType } from '../types.js';
import { modulo } from '../../prx/math.js';
import {
  a,
  an,
  any,
  choice,
  many,
  maybe,
  not,
  some,
  word,
} from '../../pcx/index.js';
import { log } from '../../utils/index.js';

type NumBuilder = keyof typeof num;

const aMinusSign = a('-');
const aPoint = a('.');
const zero = a('0');
const anE = an('E');
const aNaturalNumber = word(not(zero), any('digit')).or(zero);
// console.log(aNaturalNumber.run('0'))
const anInteger = word(maybe(aMinusSign), aNaturalNumber).map((d) => ({
  out: d.out.flat().join(''),
}));
// console.log(anInteger.run('-1285'))
const aDecimal = word(anInteger, aPoint, aNaturalNumber).map((d) => ({
  out: d.out.flat().join(''),
}));
// console.log(aDecimal.run('0.2839'))
const aScientificNumber = word(aDecimal.or(anInteger), anE, anInteger).map(
  (d) => ({
    out: d.out.flat().join(''),
  })
);
const aNumber = choice(aNaturalNumber, anInteger, aDecimal, aScientificNumber);
log(aNumber.run('-12E8'));

export class AlgebraicExpression extends Node {
  value: { name: Id; body: Node[]; params: Id[] };
  type: NodeType;
  constructor(name: Id, body: Node[], params: Id[] = []) {
    super({ name, body, params }, 'algebraic-expression');
    this.value = { name, body, params };
    this.type = 'algebraic-expression';
  }
  read() {
    return this.value;
  }
  push(kv: Node) {
    this.value.body.push(kv);
  }
  addParam(id: Id) {
    this.value.params.push(id);
  }
}

export class MathBinop<A extends Node, B extends Node> extends BinaryExpr<
  A,
  B
> {
  type: NodeType;
  value: { left: A; op: BinaryMathOp; right: B };
  constructor(left: A, op: BinaryMathOp, right: B) {
    super(left, op, right);
    this.type = 'math-binary-expression';
    this.value = { left, op, right };
  }
  get latex() {
    return `{ {${this.value.left.latex}} {${this.op}} {${this.value.right.latex}} }`;
  }
  get op() {
    return this.value.op;
  }
  get left() {
    return this.value.left;
  }
  get right() {
    return this.value.right;
  }
}

export class Numeric extends Node {
  value: number | [number, number] | number[];
  type: NumberType;
  constructor(value: number | [number, number] | number[], type: NumberType) {
    super(value, type);
    this.value = value;
    this.type = type;
  }
  get norm(): number {
    switch (this.type) {
      case 'integer':
      case 'natural':
      case 'real':
        return this.value as number;
      case 'rational':
        return (
          (this.value as [number, number])[0] /
          (this.value as [number, number])[1]
        );
      case 'scientific':
        return (
          (this.value as [number, number])[0] *
          10 ** (this.value as [number, number])[1]
        );
      default:
        return Infinity;
    }
  }

  cast(a: NumberType, b: NumberType): NumBuilder {
    if (a === 'inf' || b === 'inf') return 'inf';
    if (a === b) return a as any; // revisit
    switch (a) {
      case 'integer':
        switch (b) {
          case 'natural':
            return 'natural';
          case 'rational':
            return 'rational';
          case 'real':
            return 'real';
          case 'scientific':
            return 'scientific';
        }
      case 'natural':
        switch (b) {
          case 'integer':
            return 'natural';
          case 'rational':
            return 'rational';
          case 'real':
            return 'real';
          case 'scientific':
            return 'scientific';
        }
      case 'rational':
        switch (b) {
          case 'integer':
            return 'rational';
          case 'natural':
            return 'rational';
          case 'real':
            return 'rational';
          case 'scientific':
            return 'scientific';
        }
      case 'real':
        switch (b) {
          case 'integer':
            return 'real';
          case 'natural':
            return 'real';
          case 'rational':
            return 'real';
          case 'scientific':
            return 'scientific';
        }
      case 'scientific':
        return 'scientific';
      default:
        return 'inf';
    }
  }
  get digits(): number[] {
    if (this.type === 'bigN') {
      return this.value as number[];
    }
    return [...this.norm.toString()].map((d) => Number(d));
  }
  add(n: Numeric): Numeric {
    if (n.type === 'bigN') {
      const a = new BigN(this.digits);
      const b = new BigN(n.digits);
      return a.add(b);
    }
    const builder = num[this.cast(this.type, n.type)];
    return builder(this.norm + n.norm);
  }
  subtract(n: Numeric): Numeric {
    if (n.type === 'bigN') {
      const a = new BigN(this.digits);
      const b = new BigN(n.digits);
      return a.subtract(b);
    }
    const builder = num[this.cast(this.type, n.type)];
    return builder(this.norm - n.norm);
  }
  multiply(n: Numeric): Numeric {
    if (n.type === 'bigN') {
      const a = new BigN(this.digits);
      const b = new BigN(n.digits);
      return a.multiply(b);
    }
    const builder = num[this.cast(this.type, n.type)];
    return builder(this.norm * n.norm);
  }
  divide(n: Numeric): Numeric {
    if (n.type === 'bigN') {
      const a = new BigN(this.digits);
      const b = new BigN(n.digits);
      return a.quot(b);
    }
    const builder = num[this.cast(this.type, n.type)];
    return builder(this.norm / n.norm);
  }
  power(n: Numeric): Numeric {
    if (n.type === 'bigN') {
      const a = new BigN(this.digits);
      const b = new BigN(n.digits);
      return a.power(b);
    }
    const builder = num[this.cast(this.type, n.type)];
    return builder(this.norm ** n.norm);
  }
  quot(n: Numeric): Numeric {
    if (n.type === 'bigN') {
      const a = new BigN(this.digits);
      const b = new BigN(n.digits);
      return a.quot(b);
    }
    const builder = num[this.cast(this.type, n.type)];
    return builder(Math.floor(Math.floor(this.norm) / Math.floor(this.norm)));
  }
  rem(n: Numeric): Numeric {
    if (n.type === 'bigN') {
      const a = new BigN(this.digits);
      const b = new BigN(n.digits);
      return a.rem(b);
    }
    const builder = num[this.cast(this.type, n.type)];
    return builder(this.norm % n.norm);
  }
  mod(n: Numeric): Numeric {
    if (n.type === 'bigN') {
      const a = new BigN(this.digits);
      const b = new BigN(n.digits);
      return a.mod(b);
    }
    const builder = num[this.cast(this.type, n.type)];
    return builder(modulo(this.norm, n.norm));
  }
}

export class Inf extends Numeric {
  value: number;
  type: 'inf';
  constructor() {
    super(Infinity, 'inf');
    this.value = Infinity;
    this.type = 'inf';
  }
  get latex() {
    return `\\infty`;
  }
}

export class Rational extends Numeric {
  value: [number, number];
  type: NumberType;
  constructor(value: [number, number]) {
    super(value, 'rational');
    this.value = value;
    this.type = 'rational';
  }
  get latex() {
    return `\\frac{${this.value[0]}}{${this.value[1]}}`;
  }
}

export class Integer extends Numeric {
  value: number;
  type: NumberType;
  constructor(value: number) {
    super(value, 'integer');
    this.value = value | 0;
    this.type = 'integer';
  }
  get latex() {
    return `${this.value}`;
  }
}

export class Real extends Numeric {
  value: number;
  type: NumberType;
  constructor(value: number) {
    super(value, 'real');
    this.value = value;
    this.type = 'real';
  }
  get latex() {
    return `${this.value}`;
  }
}

export class Natural extends Numeric {
  value: number;
  type: NumberType;
  constructor(value: number) {
    super(value, 'natural');
    this.value = value;
    this.type = 'natural';
  }
  get latex() {
    return `${this.value}`;
  }
}

export class Scientific extends Numeric {
  value: [number, number];
  type: NumberType;
  constructor(value: [number, number]) {
    super(value, 'scientific');
    this.value = value;
    this.type = 'scientific';
  }
  get latex() {
    return `{ {${this.value[0]}} {\\times} {10^${this.value[1]}} }`;
  }
}

export class BigN extends Numeric {
  value: number[];
  type: NumberType;
  private isFloat: boolean;
  constructor(value: number[] | string, isFloat: boolean = false) {
    if (typeof value === 'string') {
      throw new Error('bad');
    }
    super(value, 'bigN');
    this.value = value;
    this.type = 'bigN';
    this.isFloat = isFloat;
  }
  get digits(): number[] {
    return this.value;
  }
  power(n: Numeric): Numeric {
    const a = BigInt(n.digits.join(''));
    const b = BigInt(this.value.join(''));
    const c = a ** b;
    const res = [...c.toString()].map((d) => Number(d));
    return new BigN(res);
  }
  quot(n: Numeric): Numeric {
    const a = BigInt(n.digits.join(''));
    const b = BigInt(this.value.join(''));
    const c = a / b;
    const res = [...c.toString()].map((d) => Number(d));
    return new BigN(res);
  }
  mod(n: Numeric): Numeric {
    const a = BigInt(n.digits.join(''));
    const b = BigInt(this.value.join(''));
    const c = (a % b) + (b % b);
    const res = [...c.toString()].map((d) => Number(d));
    return new BigN(res);
  }

  rem(n: Numeric): Numeric {
    const a = BigInt(n.digits.join(''));
    const b = BigInt(this.value.join(''));
    const c = b % a;
    const res = [...c.toString()].map((d) => Number(d));
    return new BigN(res);
  }
  /**
   * Adds the numeric operand 𝑛 to the LongInt.
   * Adding any numeric to a LongInt will result
   * in a LongInt.
   *
   * Time complexity: 𝒪(𝑛)
   */
  add(n: Numeric): Numeric {
    const [a, b] = this.pad(this.value, n.digits);
    const r = BigInt(a.join(''));
    const s = BigInt(b.join(''));
    const result = [...(r + s).toString()].map((d) => Number(d));
    return new BigN(result);
  }

  /**
   * Subtracts the numeric operand 𝑛 from the LongInt.
   * Subtracting any numeric to a LongInt will result
   * in a LongInt.
   *
   * Time complexity: 𝒪(𝑛)
   */
  subtract(n: Numeric): Numeric {
    const [a, b] = this.pad(this.value, n.digits);
    let carry = 0;
    let result = [...b];
    for (let i = this.value.length - 1; i >= 0; i--) {
      result[i] = modulo(this.value[i] - b[i] + carry, 10);
      if (b[i] - a[i] + carry >= 10) carry = -1;
      else carry = 0;
    }
    return new BigN(result);
  }

  private pad(d1: number[], d2: number[]) {
    const [a, size, b] =
      d1.length > d2.length ? [d2, d1.length, d1] : [d1, d2.length, d2];
    const [u, v] = [
      [...a.join('').padStart(size, '0')].map((d) => Number(d)),
      b,
    ];
    if (d1.length >= d2.length) {
      return [v, u];
    }
    return [u, v];
  }

  /**
   * Multiplies the numeric operand.
   */
  multiply(N: Numeric): Numeric {
    const [r, s] = this.pad(N.digits, this.value);
    const n1 = r.join('');
    const n2 = s.join('');
    function multiply(x: string, y: string): bigint {
      if (BigInt(x) < 10n && BigInt(y) < 10n) {
        return BigInt(x) * BigInt(y);
      }
      const xHalf = Math.floor(x.length / 2);
      const yHalf = Math.floor(y.length / 2);
      const a = String(x).substring(0, xHalf);
      const b = String(x).substring(xHalf);
      const c = String(y).substring(0, yHalf);
      const d = String(y).substring(yHalf);
      return merge(a, b, c, d);
    }
    function merge(a: string, b: string, c: string, d: string): bigint {
      const n = BigInt(a.length + b.length);
      const half = n / 2n;
      const ac = multiply(a, c);
      const bd = multiply(b, d);
      const ad = multiply(a, d);
      const bc = multiply(b, c);
      return 10n ** n * ac + 10n ** half * (ad + bc) + bd;
    }
    const p = multiply(n1, n2);
    let answer = [...p.toString()].map((d) => Number(d));
    return new BigN(answer);
  }
}

const num = {
  integer: (a: number | string) => new Integer(Number(a)),
  inf: (n: number | string) => new Inf(),
  natural: (n: number | string) => new Natural(Number(n)),
  bigN: (digits: number | string) => {
    if (typeof digits === 'string') {
      const ds = word<string[]>(maybe(a('-')), any('digit')).run(digits);
      if (ds.err) {
        const A = new Array(digits.length).fill(0);
        return new BigN(A);
      } else {
        const B = [...ds.out[0]].map((d) => Number(d));
        return new BigN(B);
      }
    }
    return new BigN([digits]);
  },
  rational: (x: number | string) => {
    if (typeof x === 'string') x = Number(x);
    let n = 0;
    let d = 0;
    if (x === 0) {
      return new Rational([n, d]);
    }
    const a = Math.abs(x);
    n = 0;
    d = 1;
    let r: number;
    while (true) {
      r = n / d;
      if (Math.abs((r - a) / a) < 0.00001) break;
      if (r < a) n++;
      else d++;
    }
    n = x < 0 ? -n : n;
    d = d;
    return new Rational([n, d]);
  },
  real: (r: number | string) => new Real(Number(r)),
  scientific: (x: number) => {
    const s = x.toString().length;
    const res = x.toExponential(s < 20 ? s : 10).split(/e\+?/);
    return new Scientific([Number(res[0]), Number(res[1])]);
  },
};

const x = num.integer(`581`);
const y = num.bigN(`28`);
console.log(x.power(y));
