import { NODE } from "../structs/enums.js";
import { GCD, sgn } from "../structs/mathfn.js";
import { getComplexParts, match, split } from "../structs/stringfn.js";
import { ast, ASTNode, Visitor } from "./node.js";

export function simplify(n: number, d: number) {
  const sign = sgn(n) * sgn(d);
  const N = Math.abs(n);
  const D = Math.abs(d);
  const f = GCD(n, d);
  const numer = (sign * n) / f;
  const denom = D / f;
  const res = `${numer}/${denom}`;
  return new Num(res, NUM.FRACTION);
}

export function toNumeric(n: string) {
  switch (true) {
    case match.isBinary(n):
      return Number.parseInt(n, 2);
    case match.isHex(n):
      return Number.parseInt(n, 16);
    case match.isOctal(n):
      return Number.parseInt(n, 8);
    case match.isFloat(n):
      return Number.parseFloat(n);
    case match.isSci(n): {
      const [a, b] = split(n, "e");
      const x = Number(a);
      const y = Number(b);
      return x * (10 ** y);
    }
    case match.isFrac(n): {
      const [a, b] = split(n, "/");
      const x = Number.parseInt(a);
      const y = Number.parseFloat(b);
      return x / y;
    }
    case n === "NaN":
      return NaN;
    case n === "Inf":
      return Infinity;
    default:
      return NaN;
  }
}

export function N(n: string) {
  switch (true) {
    case match.isBinary(n):
      return ast.int(n, 2);
    case match.isHex(n):
      return ast.int(n, 16);
    case match.isOctal(n):
      return ast.int(n, 8);
    case match.isFloat(n):
      return ast.float(n);
    case match.isSci(n): {
      const [a, b] = split(n, "e");
      const x = Number(a);
      const y = Number(b);
      return ast.float(`${x}${y}`);
    }
    case match.isFrac(n): {
      const [a, b] = split(n, "/");
      const x = Number.parseInt(a);
      const y = Number.parseFloat(b);
      return ast.float(`${x / y}`);
    }
    case n === "NaN":
      return ast.integer(NaN);
    case n === "Inf":
      return ast.integer(Infinity);
    default:
      return ast.int("NaN");
  }
}
export function integer(n: string | number) {
  if (typeof n === "number") return new Int(n);
  switch (true) {
    case match.isBinary(n):
      return new Int(Number.parseInt(n, 2));
    case match.isHex(n):
      return new Int(Number.parseInt(n, 16));
    case match.isOctal(n):
      return new Int(Number.parseInt(n, 8));
    case match.isFloat(n):
      n = Math.floor(Number.parseFloat(n));
      return new Int(n);
    case match.isSci(n): {
      const [a, b] = split(n, "e");
      const x = Number(a);
      const y = Number(b);
      return new Int(x ** y);
    }
    case match.isFrac(n): {
      const [a, b] = split(n, "/");
      const x = Number.parseInt(a);
      const y = Number.parseInt(b);
      return new Int(x ** y);
    }
  }
  return new Int(NaN);
}
export type NUMBER = Int | Float | Fraction;
export enum NUM {
  FRACTION,
  FLOAT,
  INT,
  COMPLEX,
  BINARY,
  OCTAL,
  HEX,
  SCIENTIFIC,
}
export class Num extends ASTNode {
  value: string;
  #type: NUM;
  constructor(value: string | number, type: NUM) {
    super(NODE.NUMBER);
    this.value = typeof value === "number" ? value.toString() : value;
    this.#type = type;
  }
  get abs() {
    return this.numval.Abs;
  }
  get isInteger() {
    return this.#type === NUM.INT;
  }
  get latex() {
    switch (this.#type) {
      case NUM.COMPLEX:
        return `${this.value}i`;
      case NUM.FLOAT:
        return `${this.value}`;
      case NUM.BINARY:
        return `${this.value}_{[2]}`;
      case NUM.HEX:
        return `${this.value}_{[16]}`;
      case NUM.OCTAL:
        return `${this.value}_{[8]}`;
      case NUM.FRACTION:
        const parts = this.value.split("/");
        const n = parts[0] === undefined ? "" : parts[0];
        const d = parts[1] === undefined ? "" : parts[1];
        return `\\dfrac{${n}}{${d}}`;
      case NUM.SCIENTIFIC:
        const [b, e] = this.value.split("E");
        return `${b} \\times 10^{${e}}`;
      default:
        return this.value;
    }
  }
  get raw() {
    switch (this.#type) {
      case NUM.INT:
        return Number.parseInt(this.value);
      case NUM.FLOAT:
        return Number.parseFloat(this.value);
      case NUM.FRACTION:
        const parts = this.value.split("/");
        const n = Number.parseInt(parts[0]);
        const d = Number.parseInt(parts[1]);
        return n / d;
    }
    return NaN;
  }
  get isTrue() {
    return this.raw > 0;
  }
  get isFalse() {
    return this.raw <= 0;
  }

  accept<T>(v: Visitor<T>) {
    return v.num(this);
  }
  get isComplex() {
    return this.#type === NUM.COMPLEX;
  }
  get isFraction() {
    return this.#type === NUM.FRACTION;
  }
  get typename() {
    return this.#type;
  }
  get numval(): NUMBER {
    switch (this.#type) {
      case NUM.COMPLEX:
        const [r, i] = getComplexParts(this.value);
        const real = toNumeric(r);
        const img = toNumeric(i);
        const complex = new Complex(real, img);
        return complex;
      case NUM.INT:
        const res = new Int(Number.parseInt(this.value));
        return res;
      case NUM.FLOAT:
        return new Float(Number.parseFloat(this.value));
      case NUM.FRACTION:
        const parts = this.value.split("/");
        const n = Number.parseInt(parts[0]);
        const d = Number.parseInt(parts[1]);
        return new Fraction(n, d);
      default:
        return new Int(0);
    }
  }
  nthRoot(x: Num) {
    if (this.hasFrac(x)) {
      throw new Error("method unimplemented");
    }
    const a = this.numval.N;
    const b = x.numval.N;
    const result = Math.pow(a, 1 / b);
    return new Num(result, this.type(result));
  }
  pow(x: Num) {
    if (this.#type === NUM.FRACTION && x.#type === NUM.INT) {
      const a = ast.fraction(this.value).numval;
      const b = Number.parseInt(x.value);
      const aN = a.N;
      const aB = a.D;
      const N = aN ** b;
      const D = aB ** b;
      return simplify(N, D);
    }
    if (this.hasFrac(x)) {
      throw new Error("pow for fractional exponents unimplemented");
    }
    const a = this.numval.N;
    const b = x.numval.N;
    const result = a ** b;
    return new Num(result, this.type(result));
  }
  mod(x: Num) {
    const a = integer(this.value).N;
    const b = integer(x.value).N;
    return ast.integer(((a % b) + b) % b);
  }
  rem(x: Num) {
    const a = integer(this.value).N;
    const b = integer(x.value).N;
    return ast.integer(a % b);
  }
  div(x: Num) {
    const a = integer(this.value).N;
    const b = integer(x.value).N;
    return ast.integer(Math.floor(a / b));
  }

  hasComplex(x: Num) {
    return this.isComplex || x.isComplex;
  }
  hasFrac(x: Num) {
    return this.isFraction || x.isFraction;
  }
  type(result: number): NUM {
    return Number.isInteger(result) ? NUM.INT : NUM.FLOAT;
  }
  divide(x: Num) {
    let result = 0;
    if (this.hasFrac(x)) {
      return simplify(
        this.numval.N * x.numval.D,
        this.numval.D * x.numval.N,
      );
    }
    const a = this.numval.N;
    const b = x.numval.N;
    result = a / b;
    return new Num(result, this.type(result));
  }
  gte(x: Num) {
    let result = false;
    if (this.hasFrac(x)) {
      const GT = this.gt(x);
      const EQ = this.equals(x);
      result = GT.value && EQ.value;
    } else result = this.numval.N >= x.numval.D;
    return ast.bool(result);
  }
  equals(x: Num) {
    const a = simplify(this.numval.N, this.numval.D);
    const b = simplify(x.numval.N, x.numval.D);
    const result = a.numval.N === b.numval.N && a.numval.D === b.numval.D;
    return ast.bool(result);
  }
  gt(x: Num) {
    let result = false;
    if (this.hasFrac(x)) {
      result = this.lte(x).value;
    } else result = this.numval.N > x.numval.D;
    return ast.bool(result);
  }
  lt(x: Num) {
    let result = false;
    if (this.hasFrac(x)) {
      const L = this.lte(x);
      const R = this.equals(x);
      result = L.value && R.value;
    } else result = this.numval.N < x.numval.D;
    return ast.bool(result);
  }
  lte(x: Num) {
    let result = false;
    if (this.hasFrac(x)) {
      const tN = this.numval.N;
      const tD = this.numval.D;
      const tND = simplify(tN, tD);
      const xN = x.numval.N;
      const xD = x.numval.D;
      const xND = simplify(xN, xD);
      const thisN = tND.numval.N;
      const otherD = xND.numval.D;
      const thisD = tND.numval.D;
      const otherN = xND.numval.N;
      result = thisN * otherD <= otherN * thisD;
    } else result = this.numval.N <= x.numval.N;
    return ast.bool(result);
  }
  minus(x: Num) {
    let result = 0;
    if (this.hasFrac(x)) {
      return simplify(
        this.numval.N * x.numval.D - x.numval.N * this.numval.D,
        this.numval.D * x.numval.D,
      );
    }
    const a = this.numval.N;
    const b = x.numval.N;
    result = a - b;
    return new Num(result, this.type(result));
  }
  add(x: Num) {
    let result = 0;
    if (this.hasComplex(x)) {
      const r1 = this.numval.R;
      const r2 = x.numval.R;
      const i1 = this.numval.I;
      const i2 = x.numval.I;
      const R = `${r1 + r2}`;
      const I = `${i1 + i2}i`;
      const cpx = `${R} + ${I}`;
      return new Num(cpx, NUM.COMPLEX);
    }
    if (this.hasFrac(x)) {
      return simplify(
        this.numval.N * x.numval.D + x.numval.N * this.numval.D,
        this.numval.D * x.numval.D,
      );
    }
    const a = this.numval.N;
    const b = x.numval.N;
    result = a + b;
    return new Num(result, this.type(result));
  }
  times(x: Num) {
    let result = 0;
    if (this.hasFrac(x)) {
      return simplify(
        this.numval.N * x.numval.N,
        this.numval.D * x.numval.D,
      );
    }
    const a = this.numval.N;
    const b = x.numval.N;
    result = a * b;
    return new Num(result, this.type(result));
  }
}

interface NumVal {
  get I(): number;
  get D(): number;
  get N(): number;
  get R(): number;
  get Abs(): number;
}

export class Fraction implements NumVal {
  N: number;
  D: number;
  constructor(n: number, d: number) {
    this.N = n;
    this.D = d;
  }
  get Abs() {
    return Math.abs(this.N / this.D);
  }
  get R() {
    return this.N / this.D;
  }
  get I() {
    return 0;
  }
  static of(n: number, d: number) {
    return new Num(`${a}/${b}`, NUM.FRACTION);
  }
}

export class Int implements NumVal {
  N: number;
  constructor(n: number) {
    this.N = n;
  }
  get Abs() {
    return Math.abs(this.N);
  }
  get R() {
    return this.N;
  }
  get D() {
    return 1;
  }
  get I() {
    return 0;
  }
  static of(n: number) {
    return new Num(n, NUM.INT);
  }
}

export class Complex implements NumVal {
  a: number;
  b: number;
  constructor(a: number, b: number) {
    this.a = a;
    this.b = b;
  }
  get Abs() {
    const a2 = this.a ** 2;
    const b2 = this.b ** 2;
    const h = a2 + b2;
    return Math.sqrt(h);
  }
  get R() {
    return this.a;
  }
  get N() {
    return this.a;
  }
  get D() {
    return 1;
  }
  get I() {
    return this.b;
  }
  add(other: Complex) {
    const A = this.a + other.a;
    const B = this.b + other.b;
    return new Complex(A, B);
  }
  minus(other: Complex) {
    const A = this.a - other.a;
    const B = this.b - other.b;
    return new Complex(A, B);
  }
  static of(a: number, b: number) {
    return new Num(`${a} + ${b}i`, NUM.COMPLEX);
  }
}

export class Float implements NumVal {
  N: number;
  constructor(n: number) {
    this.N = n;
  }
  get Abs() {
    return Math.abs(this.N);
  }
  get R() {
    return this.N;
  }
  get D() {
    return 1;
  }
  get I() {
    return 0;
  }
  static of(n: number) {
    return new Num(n, NUM.FLOAT);
  }
}

const a = Int.of(4);
const b = Complex.of(2, 3);
