import { Environment } from "./env.js";
import { log } from "./dev.js";

export type RelationOperator = "<" | ">" | ">=" | "<=" | "==" | "!=" | "=";
export type BitwiseOperator = "&" | "^|" | "<<" | ">>" | ">>>" | "~";
export type FunctionOperator = "call" | "list" | "set" | "tuple";
export type LogicOperator =
  | "nor"
  | "not"
  | "or"
  | "xor"
  | "xnor"
  | "and"
  | "nand"
  | "?";
export type ArithmeticOperator =
  | "+"
  | "-"
  | "*"
  | "/"
  | "%"
  | "^"
  | "!"
  | "mod"
  | "rem"
  | "to";
export type VarDefine = ":=";
export type OPERATOR =
  | RelationOperator
  | VarDefine
  | BitwiseOperator
  | FunctionOperator
  | LogicOperator
  | ArithmeticOperator;

export type NumType =
  | ATOM.INT
  | ATOM.FLOAT
  | ATOM.FRACTION
  | ATOM.COMPLEX;

export enum ATOM {
  INT,
  FLOAT,
  FRACTION,
  COMPLEX,
  STRING,
  SYMBOL,
  ERROR,
  NULL,
}
export enum EXPR {
  ROOT,
  SUBTREE,
  TUPLE,
  RELATION,
  ARITHMETIC,
  ALGEBRAIC,
  BITWISE,
  LOGIC,
  FUNCTION_CALL,
  VARIABLE_CALL,
  VARIABLE_DEF,
  FUNCTION_DEF,
}

export type NodeKind = ATOM | EXPR;

export abstract class AST {
  kind: NodeKind;
  atomic: boolean;
  constructor(kind: NodeKind, atomic: boolean) {
    this.kind = kind;
    this.atomic = atomic;
  }

  abstract eval(env?: Environment): AST;
  abstract map(fn: (n: AST | string) => void): void;
  abstract toString(): string;
  isNum(): this is Num {
    return this instanceof Num;
  }
  isBinex(): this is BinaryExpr {
    return this instanceof BinaryExpr;
  }
  isTuple(): this is Tuple {
    return this.kind === EXPR.TUPLE;
  }
  isRoot(): this is Root {
    return this.kind === EXPR.ROOT;
  }
  isNull(): this is Nil {
    return this.kind === ATOM.NULL;
  }
  isArithmetic(): this is BinaryExpr {
    return this.kind === EXPR.ARITHMETIC;
  }
  isSubtree(): this is Subtree {
    return this.kind === EXPR.SUBTREE;
  }
  isError(): this is Error {
    return this.kind === ATOM.ERROR;
  }
  isInt(): this is Num {
    return this.kind === ATOM.INT;
  }
  isFloat(): this is Num {
    return this.kind === ATOM.FLOAT;
  }
  isFraction(): this is Num {
    return this.kind === ATOM.FRACTION;
  }
  isComplex(): this is Num {
    return this.kind === ATOM.COMPLEX;
  }
  isString(): this is Str {
    return this.kind === ATOM.STRING;
  }
  isSymbol(): this is Sym {
    return this.kind === ATOM.SYMBOL;
  }
  isRelation(): this is Relation {
    return this.kind === EXPR.RELATION;
  }
  isAtomic(): this is Atom {
    return this.atomic === true;
  }
  isAlgebraic() {
    return this.kind === EXPR.ALGEBRAIC;
  }
  isBitwise() {
    return this.kind === EXPR.BITWISE;
  }
  isLogic() {
    return this.kind === EXPR.LOGIC;
  }
}

export class Nil extends AST {
  constructor() {
    super(ATOM.NULL, true);
  }
  eval() {
    return this;
  }
  toString() {
    return "null";
  }
  map(fn: (n: AST | string) => void) {
    fn("null");
  }
}

export const NIL = new Nil();

export class Root extends AST {
  root: AST[];
  environment: Environment;
  constructor(root: AST[], environment: Environment) {
    super(EXPR.ROOT, false);
    this.root = root;
    this.kind = EXPR.ROOT;
    this.environment = environment;
  }
  eval() {
    let result: AST | string = new Nil();
    for (let i = 0; i < this.root.length; i++) {
      result = this.root[i].eval(this.environment);
    }
    return result;
  }
  map(fn: (n: AST) => void) {
    for (let i = 0; i < this.root.length; i++) {
      fn(this.root[i]);
    }
  }
  toString() {
    let res = "";
    for (let i = 0; i < this.root.length; i++) {
      res += this.root[i].toString();
    }
    return res;
  }
}

export class Subtree extends AST {
  root: AST[];
  constructor(root: AST[]) {
    super(EXPR.SUBTREE, false);
    this.root = root;
  }
  eval(env: Environment) {
    let result: AST | string = new Nil();
    for (let i = 0; i < this.root.length; i++) {
      result = this.root[i].eval(env);
    }
    log(result);
    return result;
  }
  map(fn: (n: AST) => void) {
    for (let i = 0; i < this.root.length; i++) {
      fn(this.root[i]);
    }
  }
  toString() {
    let res = "";
    for (let i = 0; i < this.root.length; i++) {
      res += this.root[i].toString();
    }
    return res;
  }
}

export class Atom extends AST {
  value: string;
  constructor(value: string, kind: ATOM) {
    super(kind, true);
    this.value = value;
  }
  eval(_env: Environment) {
    return this;
  }
  map(fn: (n: AST | string) => void) {
    fn(this.value);
  }
  toString() {
    return this.value;
  }
}

export class Err extends AST {
  message: string;
  constructor(message: string) {
    super(ATOM.ERROR, true);
    this.message = message;
  }
  toString() {
    return this.message;
  }
  eval() {
    return this;
  }
  map(fn: (n: AST | string) => void) {
    fn(this.message);
  }
}

export class Str extends AST {
  value: string;
  constructor(value: string) {
    super(ATOM.STRING, true);
    this.value = value;
  }
  eval(): AST {
    return this;
  }
  map(fn: (n: AST | string) => void) {
    fn(this.value);
  }
  toString() {
    return this.value;
  }
}

export class Sym extends AST {
  value: string;
  constructor(value: string) {
    super(ATOM.SYMBOL, true);
    this.value = value;
  }
  toString() {
    return this.value;
  }
  eval(env: Environment): AST {
    if (env === undefined) return this;
    const out = env.lookup(this.value);
    if (out !== undefined) return out;
    return this;
  }
  map(fn: (n: AST | string) => void) {
    fn(this.value);
  }
}

const { parseInt, parseFloat } = Number;

class Integer {
  N: number;
  constructor(n: number | string) {
    this.N = typeof n === "string" ? parseInt(n) : n;
  }
  get D() {
    return 1;
  }
}

class Float {
  N: number;
  constructor(n: number | string) {
    this.N = typeof n === "string" ? parseFloat(n) : n;
  }
  get D() {
    return 1;
  }
}

class Fraction {
  N: number;
  D: number;
  constructor(n: number | string, d: number | string) {
    this.N = typeof n === "string" ? parseInt(n) : n;
    this.D = typeof d === "string" ? parseInt(d) : d;
  }
}

export class Num extends Atom {
  kind: NumType;
  constructor(value: string | number, kind: NumType = ATOM.INT) {
    super(value.toString(), kind);
    this.value = value.toString();
    this.kind = kind;
  }
  static sign(x: number) {
    return x === 0 ? 0 : x > 0 ? 1 : -1;
  }
  static abs(x: number) {
    return x < 0 ? x * -1 : x;
  }
  static GCD(a: number, b: number) {
    let t = 1;
    while (b !== 0) {
      t = b;
      b = a % b;
      a = t;
    }
    return a;
  }
  static int(value: string | number) {
    return new Num(value, ATOM.INT);
  }
  static float(value: string | number) {
    return new Num(value, ATOM.FLOAT);
  }
  static frac(value: string | number) {
    return new Num(value, ATOM.FRACTION);
  }
  static reduce(n: number, d: number) {
    const sgn = this.sign(n) * this.sign(d);
    const N = Num.abs(n);
    const D = Num.abs(d);
    const f = Num.GCD(N, D);
    const numer = (sgn * n) / f;
    const denom = D / f;
    const res = `${numer}/${denom}`;
    return new Num(res, ATOM.FRACTION);
  }
  get numval() {
    switch (this.kind) {
      case ATOM.INT:
        return new Integer(this.value);
      case ATOM.FLOAT:
        return new Float(this.value);
      case ATOM.FRACTION:
        const parts = this.value.split("/");
        const n = parts[0] === undefined ? 1 : parts[0];
        const d = parts[1] === undefined ? 1 : parts[1];
        return new Fraction(n, d);
      default:
        throw new Error(`Unimplemented: ${this.kind}`);
    }
  }
  hasFrac(x: Num) {
    return this.isFraction() || x.isFraction();
  }
  type(result: number): NumType {
    return Number.isInteger(result) ? ATOM.INT : ATOM.FLOAT;
  }
  divide(x: Num) {
    let result = 0;
    if (this.hasFrac(x)) {
      return Num.reduce(
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
    let result = 1;
    if (this.hasFrac(x)) {
      const GT = this.gt(x);
      const EQ = this.equals(x);
      result = GT.value === "1" && EQ.value === "1" ? 1 : 0;
    } else result = this.numval.N >= x.numval.D ? 1 : 0;
    return new Num(result, ATOM.INT);
  }
  gt(x: Num) {
    let result = 1;
    if (this.hasFrac(x)) {
      const L = this.lte(x);
      result = L.value === "1" ? 0 : 1;
    } else result = this.numval.N > x.numval.D ? 1 : 0;
    return new Num(result, ATOM.INT);
  }
  lt(x: Num) {
    let result = 1;
    if (this.hasFrac(x)) {
      const L = this.lte(x);
      const R = this.equals(x);
      result = L.value === "1" && R.value === "0" ? 1 : 0;
    } else result = this.numval.N < x.numval.D ? 1 : 0;
    return new Num(result, ATOM.INT);
  }
  lte(x: Num) {
    let result = 1;
    if (this.hasFrac(x)) {
      const tN = this.numval.N;
      const tD = this.numval.D;
      const tND = Num.reduce(tN, tD);
      const xN = x.numval.N;
      const xD = x.numval.D;
      const xND = Num.reduce(xN, xD);
      const thisN = tND.numval.N;
      const otherD = xND.numval.D;
      const thisD = tND.numval.D;
      const otherN = xND.numval.N;
      result = thisN * otherD <= otherN * thisD ? 1 : 0;
    } else result = this.numval.N <= x.numval.N ? 1 : 0;
    return new Num(result, ATOM.INT);
  }
  minus(x: Num) {
    let result = 0;
    if (this.hasFrac(x)) {
      return Num.reduce(
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
    if (this.hasFrac(x)) {
      return Num.reduce(
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
      return Num.reduce(
        this.numval.N * x.numval.N,
        this.numval.D * x.numval.D,
      );
    }
    const a = this.numval.N;
    const b = x.numval.N;
    result = a * b;
    return new Num(result, this.type(result));
  }
  equals(x: Num) {
    const a = Num.reduce(this.numval.N, this.numval.D);
    const b = Num.reduce(x.numval.N, x.numval.D);
    const result = a.numval.N === b.numval.N &&
        a.numval.D === b.numval.D
      ? 1
      : 0;
    return new Num(result, ATOM.INT);
  }
}

export class Relation extends AST {
  left: AST;
  op: RelationOperator;
  right: AST;
  constructor(left: AST, op: RelationOperator, right: AST) {
    super(EXPR.RELATION, false);
    this.left = left;
    this.op = op;
    this.right = right;
  }
  eval(env: Environment) {
    let left = this.left.eval(env);
    let right = this.right.eval(env);
    return this;
  }
  map(fn: (n: AST | string) => void) {
    fn(this.left);
    fn(this.op);
    fn(this.right);
  }
  toString() {
    if (this.left.isAtomic() && this.right.isAtomic()) {
      return `${this.left.value} ${this.op} ${this.right.value}`;
    }
    return `${this.left.toString()} ${this.op} ${this.right.toString()}`;
  }
}

export class Lit {
  static string(value: string) {
    return new Str(value);
  }
  static integer(value: string | number) {
    return new Num(value, ATOM.INT);
  }
  static complex(value: string) {
    return new Num(value, ATOM.COMPLEX);
  }
  static float(value: string) {
    return new Num(value, ATOM.FLOAT);
  }
  static nil() {
    return new Nil();
  }
  static fraction(value: string) {
    return new Num(value, ATOM.FRACTION);
  }
  static symbol(value: string) {
    return new Sym(value);
  }
}

export class Expr {
  static tuple(elements: AST[]) {
    return new Tuple(elements);
  }
  static variableDefinition(op: Sym, init: AST) {
    return new Definition(op, [], init, EXPR.VARIABLE_DEF);
  }
  static functionDefinition(op: Sym, params: AST[], body: AST) {
    return new Definition(op, params, body, EXPR.FUNCTION_DEF);
  }
  static arithmeticBinary(left: AST, op: OPERATOR, right: AST) {
    return new BinaryExpr(left, op, right, EXPR.ARITHMETIC);
  }
  static functionCall(op: string, args: AST[], category: REF) {
    return new UnaryExpr(op, new Tuple(args), EXPR.FUNCTION_CALL, category);
  }
  // static algebraUnary(op: OPERATOR, arg: AST) {
  // return new UnaryExpr(op, arg, EXPR.ALGEBRAIC);
  // }
  // static unaryArithmetic(op: OPERATOR, arg: AST) {
  // return new UnaryExpr(op, arg, EXPR.ARITHMETIC);
  // }
  static binaryRelation(left: AST, op: string, right: AST) {
    return new Relation(left, op as RelationOperator, right);
  }
  static algebraBinary(left: AST, op: OPERATOR, right: AST) {
    return new BinaryExpr(left, op, right, EXPR.ALGEBRAIC);
  }
}

import { a, chain, of, P, regex, term } from "./combinators";
import { Parser } from "./index.js";

const x = regex(/^[a-zA-Z_]+/);
const y = regex(/^[a-zA-Z_]+/);

function rule<T, t extends any[]>(parts: t, callback: (s: string[]) => T) {
  let ps: P<string>[] = [];
  for (let i = 0; i < parts.length; i++) {
    const n = parts[i];
    if (typeof n === "string") {
      ps.push(a(n));
    } else {
      ps.push(n as P<string>);
    }
  }
  return (s: string) => {
    const parsing = chain(ps).run(s);
    if (parsing.err || parsing.res.length !== parts.length) return null;
    return callback(parsing.res);
  };
}

export const linearRules1 = [
  /** Rule: x + 0 = 0 */
  rule([x, "+", "0"], (d) => Lit.symbol(d[0])),
  /** Rule: 0 + x = 0 */
  rule(["0", "+", x], (d) => Lit.symbol(d[0])),
  /** Rule: x + x = 2x */
  rule([x, "+", x], (d) => {
    if (d[0] === d[2]) {
      const two = Lit.integer(2);
      const n = Lit.symbol(d[0]);
      return Expr.algebraBinary(two, "*", n);
    }
    return null;
  }),
  /** Rule: x - 0 = x */
  rule([x, "-", 0], (d) => Lit.symbol(d[0])),
  /** Rule: x - x = 0 */
  rule([x, "-", x], (d) => {
    if (d[0] === d[2]) return Lit.integer(0);
    return null;
  }),
  /** Rule: - - x = x */
  rule(["-", "-", x], (d) => Lit.symbol(d[2])),
  /** Rule: x * 1 = x */
  rule([x, "*", "1"], (d) => Lit.symbol(d[0])),
  /** Rule: 1 * x = x; */
  rule(["1", "*", x], (d) => Lit.symbol(d[2])),
  /** Rule: x * 0 = 0 */
  rule([x, "*", "0"], () => Lit.integer(0)),
  /** Rule: x * x = x^2 */
  rule([x, "*", x], (d) => {
    if (d[0] === d[2]) {
      const sym = Lit.symbol(d[0]);
      const n = Lit.integer(2);
      return Expr.algebraBinary(sym, "^", n);
    }
    return null;
  }),
  /** Rule: x / 0 = NaN */
  rule([x, "/", "0"], () => Lit.integer(NaN)),
  /** Rule: 0 / x = 0 */
  rule(["0", "/", x], () => Lit.integer(0)),
  /** Rule: x / 1 = x */
  rule([x, "/", "1"], (d) => Lit.symbol(d[0])),
  /** Rule: x/x = 1 */
  rule([x, "/", x], (_) => Lit.integer(1)),
  /** Rule 0^0 = NaN */
  rule(["0", "^", "0"], (_) => Lit.integer(NaN)),
  /** Rule: x^0 = 1 */
  rule([x, "^", "0"], (_) => Lit.integer(1)),
  /** Rule: 0^x = 0 */
  rule(["0", "^", x], (_) => Lit.integer(0)),
  /** Rule: 1^x = 1 */
  rule(["1", "^", x], (_) => Lit.integer(1)),
  /** Rule: x^1 = x */
  rule([x, "^", "1"], (d) => Lit.symbol(d[0])),
  /** Rule x^-1 = 1/x */
  rule([x, "^", "-1"], (d) => {
    const X = Lit.symbol(d[0]);
    const one = Lit.integer(1);
    return Expr.algebraBinary(one, "/", X);
  }),
  /** Rule x * (y/x) = y */
  rule([x, "*", "(", y, "/", x, ")"], (d) => {
    if (d[0] !== d[3] && d[3] !== d[5] && d[0] === d[5]) {
      return Lit.symbol(d[3]);
    }
    return null;
  }),
  /** Rule (y/x) * x = y */
  rule(["(", y, "/", x, ")", "*", x], (d) => {
    if (d[1] !== d[3] && d[1] !== d[6]) {
      return Lit.symbol(d[1]);
    }
    return null;
  }),
  /** Rule (y * x) / x = y */
  rule(["(", y, "*", x, ")", "/", x], (d) => {
    if (d[1] !== d[3] && d[1] !== d[6]) {
      return Lit.symbol(d[1]);
    }
    return null;
  }),
  /** Rule: (x * y) / x = y */
  rule(["(", x, "*", y, ")", "/", x], (d) => {
    if (d[1] !== d[3] && d[1] === d[6]) {
      return Lit.symbol(d[3]);
    }
    return null;
  }),
  /** Rule: x + - x */
  rule([x, "+", "-", x], (d) => {
    if (d[0] === d[3]) {
      return Lit.integer(0);
    }
    return null;
  }),
  /** Rule: (x + y) - x = y */
  rule(["(", x, "+", y, ")", "-", x], (d) => {
    if (d[1] !== d[3] && d[1] === d[6]) {
      return Lit.symbol(d[3]);
    }
    return null;
  }),
  rule(
    [term(of("real-number")), "*", x, "-", term(of("real-number")), "*", x],
    (d) => {
      if (d[0] === d[4] && d[2] === d[6]) {
        return Lit.integer(0);
      }
      return null;
    },
  ),
];

const logRules = [
  rule(["log", "(", "1", ")"], (_) => Lit.integer(0)),
  rule(["log", "(", "0", ")"], (_) => Lit.integer(NaN)),
  rule(["log", "(", "e", ")"], (_) => Lit.integer(1)),
  rule(["log", "(", "e", "^", "x", ")"], (_) => Lit.integer(1)),
];

const sineRules = [
  rule(["sin", "(", "0", ")"], (_) => Lit.integer(0)),
  rule(["sin", "(", "PI", ")"], (_) => Lit.integer(0)),
  rule(["sin", "(", "PI", "/", "2", ")"], (_) => Lit.integer(1)),
];
type RuleSet = ((s: string) => AST | null)[];
const cosineRules = [
  rule(["cos", "(", "0", ")"], (_) => Lit.integer(1)),
  rule(["cos", "(", "PI", ")"], (_) => Lit.integer(-1)),
  rule(["cos", "(", "PI", "/", "2", ")"], (_) => Lit.integer(0)),
];

function apply(rules: RuleSet, input: string) {
  let res = null;
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    res = rule(input);
    if (res !== null) return res;
  }
}

export class BinaryExpr extends AST {
  left: AST;
  op: OPERATOR;
  right: AST;
  kind: NodeKind;
  constructor(left: AST, op: OPERATOR, right: AST, kind: NodeKind) {
    super(kind, false);
    this.left = left;
    this.op = op;
    this.right = right;
    this.kind = kind;
  }
  map(fn: (n: AST | string) => void) {
    fn(this.left);
    fn(this.op);
    fn(this.right);
  }
  evalBinaryAlgebra1() {
    let res: null | (AST) = null;
    const left = this.left.toString();
    const right = this.right.toString();
    const eq = left + " " + this.op + " " + right;
    for (let i = 0; i < linearRules1.length; i++) {
      const rule = linearRules1[i];
      res = rule(eq);
      if (res !== null) return res;
    }
  }
  toString() {
    let left = "";
    let op = this.op === "^" ? "^" : ` ${this.op} `;
    let right = "";
    if (this.left.isAtomic() && this.right.isAtomic()) {
      left = this.left.value;
      right = this.right.value;
      return left + op + right;
    }
    if (this.left.isAtomic() && this.right.isBinex()) {
      left = this.left.value;
      right = "(" + this.right.toString() + ")";
      return left + op + right;
    }
    if (this.right.isAtomic() && this.left.isBinex()) {
      right = this.right.value;
      left = "(" + this.left.toString() + ")";
      return left + op + right;
    }
    return `${this.left.toString()} ${this.op} ${this.right.toString()}`;
  }
  eval(env: Environment) {
    if (this.left.isBinex()) {
      this.left = this.left.eval(env);
    }
    if (this.right.isBinex()) {
      this.right = this.right.eval(env);
    }
    if (this.right.isBinex() && this.right.isAlgebraic()) {
      const res = this.right.evalBinaryAlgebra1();
      if (res !== undefined) this.right = res;
    }
    if (this.left.isBinex() && this.left.isAlgebraic()) {
      const res = this.left.evalBinaryAlgebra1();
      if (res !== undefined) this.left = res;
    }
    let left = this.left.eval(env);
    let right = this.right.eval(env);
    if (left instanceof Num && right instanceof Num) {
      switch (this.op) {
        case "+":
          return left.add(right);
        case "-":
          return left.minus(right);
        case "*":
          return left.times(right);
        case "/":
          return left.divide(right);
        default:
          throw new Error(`Unimplemented: ${this.op}`);
      }
    }
    return this;
  }
}
export type REF = "core" | "list" | "set" | "array" | "matrix" | "user";

export class UnaryExpr extends AST {
  op: string;
  args: Tuple;
  kind: NodeKind;
  arglen: number;
  category: REF;
  constructor(op: string, args: Tuple, kind: NodeKind, category: REF) {
    super(kind, false);
    this.op = op;
    this.args = args;
    this.kind = kind;
    this.arglen = args.length;
    this.category = category;
  }
  get operator() {
    switch (this.category) {
      case "array":
        return "array";
      case "list":
        return "list";
      case "set":
        return "set";
      case "matrix":
        return "matrix";
      default:
        return this.op;
    }
  }
  get delimiters() {
    switch (this.category) {
      case "array":
      case "matrix":
        return ["[", "]"];
      case "core":
      case "user":
      case "list":
        return ["(", ")"];
      case "set":
        return ["{", "}"];
      default:
        return ["(", ")"];
    }
  }
  toString(): string {
    const [leftDelim, rightDelim] = this.delimiters;
    let res = this.operator + leftDelim + this.args.toString() + rightDelim;
    return res;
  }
  eval(): AST {
    const args = this.args.eval();
    if (args.isNum() || args.isSymbol()) {
      const str = this.op + "(" + args.value + ")";
      let out;
      if (this.op === "cos") {
        out = apply(cosineRules, str);
        if (out !== undefined) return out;
      }
      if (this.op === "sin") {
        out = apply(sineRules, str);
        if (out !== undefined) return out;
      }
      if (this.op === "log") {
        out = apply(logRules, str);
        if (out !== undefined) return out;
      }
    }
    // return new UnaryExpr(this.op, new Tuple([args]), this.kind, this.category);
    return this;
  }
  map(fn: (n: AST | string) => void) {
    fn(this.op);
    this.args.forEach((arg) => fn(arg));
  }
}

export class Tuple extends AST {
  elements: AST[];
  length: number;
  constructor(elements: AST[]) {
    super(EXPR.TUPLE, false);
    this.elements = elements;
    this.length = elements.length;
  }
  forEach(fn: (n: AST) => void) {
    this.elements.forEach(fn);
  }
  toString(): string {
    let out: string[] = [];
    this.elements.forEach((n) => out.push(n.toString()));
    let res = out.join(",");
    return res;
  }
  map(fn: (n: AST | string) => void) {
    fn(this);
  }
  eval(): AST {
    let res = null;
    this.elements.forEach((n) => res = n.eval());
    if (res !== null) return res;
    return this;
  }
}

export class Definition extends AST {
  op: Sym;
  args: AST[];
  body: AST;
  kind: NodeKind;
  constructor(op: Sym, args: AST[], body: AST, kind: NodeKind) {
    super(kind, false);
    this.op = op;
    this.args = args;
    this.body = body;
    this.kind = kind;
  }
  eval(env: Environment): AST {
    return this.body.eval(env);
  }
  map(fn: (n: AST | string) => void) {
    fn(this.op);
    this.args.forEach((arg) => fn(arg));
    fn(this.body);
  }
  toString() {
    let op = `${this.op.value}`;
    this.args.forEach((arg) => op += arg.toString());
    op += this.body.toString();
    return op;
  }
}

class Matrix {
  matrix: number[][];
  rows: number;
  cols: number;
  constructor(matrix: number[][]) {
    this.matrix = matrix;
    this.rows = matrix.length;
    this.cols = this.matrix[0].length;
    let isJagged = false;
    let lastLength = null;
    for (let i = 0; i < this.rows; i++) {
      if (lastLength === null) {
        lastLength = this.matrix[i].length;
      } else if (lastLength === this.matrix[i].length) {
        continue;
      } else {
        isJagged = true;
        break;
      }
    }
    if (isJagged) throw new Error("Jagged array found.");
  }
  forEachRow(fn: (n: number[]) => number[]) {
    const mtx = this.clone();
    for (let i = 0; i < this.matrix.length; i++) {
      mtx.matrix[i]=fn(this.matrix[i]);
    }
    return mtx;
  }
  clone() {
    let out:number[][] = [];
    for (let i = 0; i < this.rows; i++) {
      out.push([]);
      for (let j = 0; j < this.cols; j++) {
        out[i][j] = this.matrix[i][j];
      }
    }
    return new Matrix(out);
  }
  forEachCol(fn: (n: number) => number) {
    const mtx = this.clone();
    for (let i = 0; i < this.matrix.length; i++) {
      for (let j = 0; j < this.matrix[i].length; j++) {
        mtx.matrix[i][j]=fn(this.matrix[i][j]);
      }
    }
    return mtx;
  }
}

