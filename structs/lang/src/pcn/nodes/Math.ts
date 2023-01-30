import { Node, BinaryExpr, Id } from './index.js';
import { NodeType, BinaryMathOp, NumberType } from '../types.js';
import { modulo } from '../../prx/math.js';

type NumBuilder = keyof typeof num;

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
  digits(): number[] {
    if (this.type === 'big-number') {
      return this.value as number[];
    }
    return [...this.norm.toString()].map((d) => Number(d));
  }
  add(n: Numeric): Numeric {
    const builder = num[this.cast(this.type, n.type)];
    return builder(this.norm + n.norm);
  }
  subtract(n: Numeric): Numeric {
    const builder = num[this.cast(this.type, n.type)];
    return builder(this.norm - n.norm);
  }
  multiply(n: Numeric): Numeric {
    const builder = num[this.cast(this.type, n.type)];
    return builder(this.norm * n.norm);
  }
  divide(n: Numeric): Numeric {
    const builder = num[this.cast(this.type, n.type)];
    return builder(this.norm / n.norm);
  }
  power(n: Numeric): Numeric {
    const builder = num[this.cast(this.type, n.type)];
    return builder(this.norm ** n.norm);
  }
  quot(n: Numeric): Numeric {
    const builder = num[this.cast(this.type, n.type)];
    return builder(Math.floor(Math.floor(this.norm) / Math.floor(this.norm)));
  }
  rem(n: Numeric): Numeric {
    const builder = num[this.cast(this.type, n.type)];
    return builder(this.norm % n.norm);
  }
  mod(n: Numeric): Numeric {
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

export class LongInt extends Numeric {
  value: number[];
  type: NumberType;
  constructor(value: number[]) {
    super(value, 'big-number');
    this.value = value;
    this.type = 'big-number';
  }
  /**
   * Adds the numeric operand 𝑛 to the BigNum.
   * Adding any numeric to a LongInt will result
   * in a LongInt.
   */
  add(n: Numeric): Numeric {
    let arg = n.digits(); // get the operand’s digits.

    // if the operand has more or less digits than the BigNum, we pad.
    if (arg.length < this.value.length) {
      arg = [...arg.join('').padStart(this.value.length, '0')].map((d) =>
        Number(d)
      );
    }
    
    let carry = 0;

    let result = [...arg];
    for (let i = this.value.length - 1; i >= 0; i--) {
      result[i] = modulo(this.value[i] + arg[i] + carry, 10);
      if (arg[i] + this.value[i] + carry >= 10) carry = 1;
      else carry = 0;
    }
    if (carry) result.unshift(carry);
    return new LongInt(result);
  }
  subtract(n: Numeric): Numeric {
    let arg = n.digits();
    if (arg.length < this.value.length) {
      arg = [...arg.join('').padStart(this.value.length, '0')].map((d) =>
        Number(d)
      );
    }
    let carry = 0;
    let result = [...arg];
    for (let i = this.value.length - 1; i >= 0; i--) {
      result[i] = modulo(this.value[i] - arg[i] + carry, 10);
      if (arg[i] - this.value[i] + carry >= 10) carry = -1;
      else carry = 0;
    }
    return new LongInt(result);
  }
}

const num = {
  integer: (a: number) => new Integer(a),
  inf: (n: number) => new Inf(),
  natural: (n: number) => new Natural(n),
  bignum: (...digits: number[]) => new LongInt(digits),
  rational: (x: number) => {
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
  real: (r: number) => new Real(r),
  scientific: (x: number) => {
    const s = x.toString().length;
    const res = x.toExponential(s < 20 ? s : 10).split(/e\+?/);
    return new Scientific([Number(res[0]), Number(res[1])]);
  },
};

const j = num.bignum(9, 9, 9);
const k = num.integer(1);
console.log(j.subtract(k));
