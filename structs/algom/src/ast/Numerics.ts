import { NODE } from "../structs/enums.js";
import { match, split } from "../structs/stringfn.js";
import { Visitor } from "./astnode.js";
import { ASTNode } from "./base.js";

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

enum ntype {
  float = 1,
  ratio = 2,
  int = 3,
  complex = 4,
}

const op = {
  add: (a: number, b: number) => a + b,
  ADD: (a: bigint, b: bigint) => a + b,
  minus: (a: number, b: number) => a - b,
  MINUS: (a: bigint, b: bigint) => a - b,
  times: (a: number, b: number) => a * b,
  TIMES: (a: bigint, b: bigint) => a * b,
  divide: (a: number, b: number) => a / b,
  DIVIDE: (a: bigint, b: bigint) => a / b,
  rem: (a: number, b: number) => a % b,
  mod: (n: number, d: number) => ((n % d) + d) % d,
  eq: (a: number, b: number) => (a === b ? 1 : 0),
  neq: (a: number, b: number) => (a === b ? 0 : 1),
  lt: (a: number, b: number) => (a < b ? 1 : 0),
  gt: (a: number, b: number) => (a > b ? 1 : 0),
  lte: (a: number, b: number) => (a <= b ? 1 : 0),
  gte: (a: number, b: number) => (a >= b ? 1 : 0),
  floor: (x: number) => (Math.floor(x)),
  abs: (a: number) => (Math.abs(a)),
  gcd(a: number, b: number) {
    a = this.abs(this.floor(a));
    b = this.abs(this.floor(b));
    let t = 1;
    while (b !== 0) {
      t = b;
      b = a % b;
      a = t;
    }
    return a;
  },
};

export abstract class N extends ASTNode {
  type: ntype;
  constructor(type: ntype) {
    super(NODE.NUMBER);
    this.type = type;
  }
  get is_finite() {
    return Number.isFinite(this.value);
  }
  get is_inf() {
    return !this.is_finite;
  }
  get is_nan() {
    return Number.isNaN(this.value);
  }
  get is_one() {
    return this.value === 1;
  }
  get is_zero() {
    return this.value === 0;
  }
  get is_e() {
    return this.value === Math.E;
  }
  get is_pi() {
    return this.value === Math.PI;
  }
  abstract clone(value: () => number): Integer | Real | Rational;
  abstract get value(): number;
  binop(
    op: (a: number, b: number) => number,
    arg: N,
  ): Integer | Real | Rational {
    return this.clone(() => op(this.value, arg.value));
  }
  get str(): string {
    return isFrac(this) ? `${this.a.value}/${this.b.value}` : `${this.value}`;
  }
  add(other: N) {
    return this.binop(op.add, other);
  }
  minus(other: N) {
    return this.binop(op.minus, other);
  }
  times(other: N) {
    return this.binop(op.times, other);
  }
  div(other: N) {
    return this.binop(op.divide, other);
  }
  rem(other: N) {
    const res = op.rem(this.value, other.value);
    return int(res);
  }
  mod(other: N) {
    const res = op.mod(this.value, other.value);
    return int(res);
  }
  atan2(other: N) {
    return this.clone(() => Math.atan2(this.value, other.value));
  }
  pow(other: N) {
    return this.clone(() => Math.pow(this.value, other.value));
  }
  cmap1(fn: (n: number) => number) {
    return this.clone(() => fn(this.value));
  }
  equals(other: N) {
    return this.binop(op.eq, other);
  }
  lt(other: N) {
    return this.binop(op.lt, other);
  }
  gt(other: N) {
    return this.binop(op.gt, other);
  }
  lte(other: N) {
    return this.binop(op.lte, other);
  }
  gte(other: N) {
    return this.binop(op.gte, other);
  }
  toFrac(tolerance?: number) {
    return frac(...ratio(this.value, tolerance));
  }
}

export function gcd(a: N, b: N) {
  return int(op.gcd(a.value, b.value));
}

export function cos(x: N) {
  return x.cmap1(Math.cos);
}

export function sin(x: N) {
  return x.cmap1(Math.sin);
}

export function tan(x: N) {
  return x.cmap1(Math.tan);
}

export function num(n: number) {
  return (((n ^ 0) === n) ? int(n) : float(n));
}

export function abs(x: N) {
  const value = x.value;
  return x.clone(() => (value < 0 ? value * -1 : value));
}

export function sign(x: N) {
  const value = x.value;
  return x.clone(() => (value === 0 ? 0 : (value < 0 ? -1 : 1)));
}

export function sqrt(x: N) {
  const value = x.value;
  return x.clone(() => Math.sqrt(value));
}

export class Integer extends N {
  get val(): string {
    return `${this.value}`;
  }
  accept<T>(n: Visitor<T>): T {
    return n.int(this);
  }
  x: () => number;
  type: ntype;
  constructor(value: () => number) {
    super(ntype.int);
    this.x = value;
    this.type = ntype.int;
  }
  get value() {
    return this.x();
  }
  clone(n: () => number): Real | Integer {
    return ((n() ^ 0) === n()) ? new Integer(n) : new Real(n);
  }
}

export class Real extends N {
  get val(): string {
    return `${this.value}`;
  }
  accept<T>(node: Visitor<T>): T {
    return node.real(this);
  }
  x: () => number;
  type: ntype;
  constructor(value: () => number) {
    super(ntype.float);
    this.x = value;
    this.type = ntype.float;
  }
  get value() {
    return this.x();
  }
  clone(n: () => number) {
    return ((n() ^ 0) === n()) ? new Integer(n) : new Real(n);
  }
}

export class Rational extends N {
  get val(): string {
    return `${this.a.value}/${this.b.value}`;
  }
  accept<T>(node: Visitor<T>): T {
    return node.frac(this);
  }
  a: Integer;
  b: Integer;
  type: ntype;
  x: () => number;
  constructor([a, b]: [Integer, Integer]) {
    super(ntype.ratio);
    this.a = a;
    this.b = b;
    this.type = ntype.ratio;
    this.x = () => a.value / b.value;
  }
  get value() {
    return this.a.value / this.b.value;
  }
  clone(other: () => number): Integer | Real | Rational {
    return frac(...ratio(other()));
  }
}

export function int(n: number) {
  return new Integer(() => Math.floor(n));
}
export function float(n: number) {
  return new Real(() => n);
}
export function frac(a: number, b: number) {
  return new Rational([int(a), int(b)]);
}
function ratio(x: number, tolerance = 0.000001): [number, number] {
  if ((x % 1) === 0) return [x, 1];
  if (x === 0) return [0, 1];
  if (x < 0) x = -x;
  let num = 1;
  let den = 1;
  const iterate = () => {
    let r = num / den;
    if (Math.abs((r - x) / x) < tolerance) return;
    if (r < x) num++;
    else den++;
    iterate();
  };
  iterate();
  return [num, den];
}
function isInt(x: any): x is Integer {
  return (x && x.type === ntype.int);
}
function isFrac(x: any): x is Rational {
  return (x && x.type === ntype.ratio);
}
function isFloat(x: any): x is Real {
  return x && (x.type && x.type === ntype.float) ||
    ((x.value % 1) !== 0);
}

export const C = {
  pi: float(Math.PI),
  e: float(Math.E),
  one: int(1),
  zero: int(0),
  sqrt2: float(Math.SQRT2),
  ln2: float(Math.LN2),
  ln10: float(Math.LN10),
  log2e: float(Math.LOG2E),
  log10e: float(Math.LOG10E),
  sqrt1_2: float(Math.SQRT1_2),
  nan: int(NaN),
  inf: int(Infinity),
  ninf: int(-Infinity),
};

class V {
  elements: N[];
  constructor(elements: N[]) {
    this.elements = elements;
  }
  get size() {
    return this.elements.length;
  }
  private index(i: number) {
    return (i % this.size);
  }
  sim(v: V) {
    return this.size === v.size;
  }
  ith(index: number) {
    return this.elements[this.index(index - 1)];
  }
  set(index: number) {
    return {
      as: (element: N) => {
        this.elements[this.index(index - 1)] = element;
        return this;
      },
    };
  }
  get value() {
    return this.elements.map((n) => n.value);
  }
  get str() {
    return "[" + this.elements.map((n) => n.str).join(", ") + "]";
  }
  get isEmpty() {
    return this.size === 0;
  }
  map(fn: (n: N, r: number) => N) {
    const res = this.elements.map((e, r) => fn(e, r + 1));
    return vector(res);
  }
  reduce<t>(
    callback: (
      previousValue: t,
      currentValue: N,
      currentIndex: number,
    ) => t,
    init: t,
  ) {
    let i = 0;
    const fn = (A: N[], initVal: t): t => {
      if (A.length === 0) return initVal;
      else {
        const popped = A.shift();
        if (popped === undefined) return initVal;
        const update = callback(initVal, popped, i++);
        return fn(A, update);
      }
    };
    return fn(this.elements, init);
  }
  private ap2(v: V, f: (a: number, b: number) => number) {
    const res = this.elements.map((n, r) => n.binop(f, v.ith(r + 1)));
    return vector(res);
  }
  ap(f: (a: number) => number) {
    return vector(this.elements.map((n) => n.cmap1(f)));
  }
  add(v: V) {
    return this.ap2(v, op.add);
  }
  minus(v: V) {
    return this.ap2(v, op.minus);
  }
  times(v: V) {
    return this.ap2(v, op.times);
  }
  div(v: V) {
    return this.ap2(v, op.divide);
  }
  rem(v: V) {
    return this.ap2(v, op.rem);
  }
  mod(v: V) {
    return this.ap2(v, op.mod);
  }
  inc(c: N) {
    return this.map((n) => (n.add(c)));
  }
  dec(c: N) {
    return this.map((n) => (n.minus(c)));
  }
  pow(c: N) {
    return this.map((n) => (n.pow(c)));
  }
  scale(c: N) {
    return this.map((n) => (n.times(c)));
  }
  equals(that: V) {
    return this.size === that.size &&
      (this.reduce((p, c, i) => p && c.equals(that.ith(i + 1)).is_one, true));
  }
  /** Returns the L^1 (Manhattan Norm) of the current vector. */
  get L1() {
    return this.reduce((p, c) => p.add(abs(c)), C.zero);
  }
  /** Returns the L^2 (Euclidean Norm) of the current vector. */
  get L2() {
    return this.reduce(
      (p, c) => sqrt((p.pow(int(2))).add(c.pow(int(2)))),
      C.zero,
    );
  }
  get max() {
    return this.reduce((p, c) => (c.gt(p).is_one ? c : p), C.ninf as N);
  }
  norm(of: "1" | "2" | "euclidean" | "manhattan" | "infinity" | "max" = "2") {
    switch (of) {
      case "euclidean":
      case "2":
        return this.L2;
      case "manhattan":
      case "1":
        return this.L1;
      case "infinity":
      case "max":
      default:
        return abs(this.max);
    }
  }
  toFrac(tolerance?: number) {
    return this.map((n) => n.toFrac(tolerance));
  }
}

function vector(elements: N[]) {
  return new V(elements);
}
