import { log } from "./dev";
import { Token } from "./tokentype";
import { Environment } from "./parser";

type ClassProps<T> = {
  [P in keyof T]: T[P] extends (...args: any[]) => any ? never
    : P;
}[keyof T];

type FieldsOf<ClassName> = { [P in ClassProps<ClassName>]: ClassName[P] };
type Cstr<T = {}> = new (...args: any[]) => T;

export namespace math {
  export const match = {
    /**
     * Returns true if the string is an integer:
     * ~~~
     * {..., -1, -2, 0, 1, 2, ...}
     * ~~~
     */
    int: (s: string) => /^-?(0|[1-9]\d*)(?<!-0)$/.test(s),
    /**
     * Returns true if the string is a floating point number.
     * ~~~
     * {..., -1.21, -2.8, 0.02, 1.0, 2.008, ...}
     * ~~~
     */
    float: (s: string) => /^(?!-0(\.0+)?$)-?(0|[1-9]\d*)(\.\d+)?$/.test(s),
    /**
     * Returns true if the string is an unsigned integer.
     * ~~~
     * {0, 1, 2, 3, 4, ...}
     * ~~~
     */
    uInt: (s: string) => /^(0|[1-9]\d*)$/.test(s),
    /**
     * Returns true if the string is an unsigned float.
     * ~~~
     * {0.001, 1.5, 2.91, 3.3, 4.0192, ...}
     * ~~~
     */
    uFloat: (s: string) => /^(0|[1-9]\d*)(\.\d+)?$/.test(s),
    /**
     * Returns true if the string is a scientific number
     * of integers.
     * ~~~
     * {..., -1e5, 2e3, 8e10, ...}
     * ~~~
     */
    iSci: (s: string) => /^(?!-0)-?(0|[1-9]\d*)(e-?(0|[1-9]\d*))?$/i.test(s),
    /**
     * Returns true if the string is a scientific number
     * of floats.
     * ~~~
     * {..., -1.4e5.17, 2.1e3.0, 8.93e1.42, ...}
     * ~~~
     */
    fSci: (s: string) =>
      /^(?!-0(\.0+)?(e|$))-?(0|[1-9]\d*)(\.\d+)?(e-?(0|[1-9]\d*))?$/i.test(s),
    hex: (s: string) => /^0x[0-9a-f]+$/i.test(s),
    binary: (s: string) => /^0b[0-1]+$/i.test(s),
    octal: (s: string) => /^0o[0-8]+$/i.test(s),
    frac: (s: string) => /^(-?[1-9][0-9]*|0)\/[1-9][0-9]*/.test(s),
  };
  export function GCD(a: number, b: number) {
    let t = 1;
    while (b !== 0) {
      t = b;
      b = a % b;
      a = t;
    }
    return a;
  }
  export function abs(n: number) {
    return Math.abs(n);
  }
  export function simplify(n: number, d: number) {
    const sign = sgn(n) * sgn(d);
    const N = abs(n);
    const D = abs(d);
    const f = GCD(n, d);
    const numer = (sign * n) / f;
    const denom = D / f;
    const res = `${numer}/${denom}`;
    return new Num(res, NUM.FRACTION);
  }
  export const is = {
    number: (v: any): v is number => typeof v === "number",
    string: (v: any): v is string => typeof v === "number",
    bool: (v: any): v is boolean => typeof v === "boolean",
    function: (v: any): v is Function => typeof v === "function",
    integer: (v: any) => {
      if (typeof v === "number") {
        return Number.isInteger(v);
      }
      return match.int(v);
    },
  };
  export function sgn(x: number) {
    return x === 0 ? 0 : x > 0 ? 1 : -1;
  }
  export const toInt = Number.parseInt;
  export const toFloat = Number.parseFloat;
  export const floor = Math.floor;
  export const isNaN = Number.isNaN;
  export const split = (s: string, splitter: string) => s.split(splitter);
  export function integer(n: string | number) {
    if (typeof n === "number") return new Int(n);
    switch (true) {
      case match.binary(n):
        return new Int(toInt(n, 2));
      case match.hex(n):
        return new Int(toInt(n, 16));
      case match.octal(n):
        return new Int(toInt(n, 8));
      case match.float(n):
        n = floor(toFloat(n));
        return new Int(n);
      case match.iSci(n): {
        const [a, b] = split(n, "e");
        const x = toInt(a);
        const y = toInt(b);
        return new Int(x ** y);
      }
      case match.fSci(n): {
        const [a, b] = split(n, "e");
        const x = floor(toFloat(a));
        const y = floor(toFloat(b));
        return new Int(x ** y);
      }
      case match.frac(n): {
        const [a, b] = split(n, "/");
        const x = toInt(a);
        const y = toInt(b);
        return new Int(x ** y);
      }
    }

    return new Int(NaN);
  }
  export function getFrac(n: string) {
    const [a, b] = split(n, "/");
    const x = toInt(a);
    const y = toInt(b);
    return [x, y];
  }
}

enum NODE {
  BLOCK,
  TUPLE,
  VECTOR,
  MATRIX,
  NULL,
  BOOL,
  NUMBER,
  SYMBOL,
  CHARS,
  DEFINITION,
  UNARY_EXPRESSION,
  BINARY_EXPRESSION,
  ROOT,
}

export abstract class Expr {
  kind: NODE;
  constructor(kind: NODE) {
    this.kind = kind;
  }
}

interface Visitor<T> {
  bool(n: Bool): T;
  chars(n: Chars): T;
  null(n: Null): T;
  num(n: Num): T;
  sym(n: Sym): T;
  tuple(n: Tuple): T;
  block(n: Block): T;
  vector(n: Vector): T;
  matrix(n: Matrix): T;
  unaryExpr(n: UnaryExpr): T;
  binaryExpr(n: BinaryExpr): T;
  definition(n: Definition): T;
  root(n: Root): T;
}

export abstract class ASTNode {
  kind: NODE;
  constructor(kind: NODE) {
    this.kind = kind;
  }
  abstract accept<T>(n: Visitor<T>): T;
  isBlock(): this is Block {
    return this.kind === NODE.BLOCK;
  }
  isTuple(): this is Tuple {
    return this.kind === NODE.TUPLE;
  }
  isVector(): this is Vector {
    return this.kind === NODE.VECTOR;
  }
  isMatrix(): this is Matrix {
    return this.kind === NODE.MATRIX;
  }
  isNull(): this is Tuple {
    return this.kind === NODE.TUPLE;
  }
  isBool(): this is Bool {
    return this.kind === NODE.BOOL;
  }

  isNum(): this is Num {
    return this.kind === NODE.NUMBER;
  }

  isSymbol(): this is Num {
    return this.kind === NODE.SYMBOL;
  }

  isChars(): this is Chars {
    return this.kind === NODE.CHARS;
  }

  isDefinition(): this is Definition {
    return this.kind === NODE.DEFINITION;
  }
  isUnaryExpr(): this is UnaryExpr {
    return this.kind === NODE.UNARY_EXPRESSION;
  }
  isBinaryExpr(): this is BinaryExpr {
    return this.kind === NODE.BINARY_EXPRESSION;
  }
  isRoot(): this is Root {
    return this.kind === NODE.ROOT;
  }
}

export class Root extends ASTNode {
  root: ASTNode[];
  constructor(root: ASTNode[]) {
    super(NODE.ROOT);
    this.root = root;
  }
  accept<T>(n: Visitor<T>): T {
    return n.root(this);
  }
}

export class Block extends ASTNode {
  elements: ASTNode[];
  constructor(elements: ASTNode[]) {
    super(NODE.BLOCK);
    this.elements = elements;
  }
  accept<T>(n: Visitor<T>): T {
    return n.block(this);
  }
}

export class Tuple extends ASTNode {
  elements: ASTNode[];
  constructor(elements: ASTNode[]) {
    super(NODE.TUPLE);
    this.elements = elements;
  }
  accept<T>(n: Visitor<T>): T {
    return n.tuple(this);
  }
}

export class Matrix extends ASTNode {
  vectors: Vector[];
  rows: number;
  columns: number;
  matrix: ASTNode[][];
  constructor(vectors: Vector[], rows: number, columns: number) {
    super(NODE.MATRIX);
    this.vectors = vectors;
    this.rows = rows;
    this.columns = columns;
    this.matrix = [];
    for (let i = 0; i < this.rows; i++) {
      this.matrix.push(this.vectors[i].elements);
    }
  }
  toString(n: ASTNode) {
    const ts = new ToString();
    return n.accept(ts);
  }
  accept<T>(n: Visitor<T>): T {
    return n.matrix(this);
  }
  clone() {
    let v: Vector[] = [];
    for (let i = 0; i < this.rows; i++) {
      v.push(this.vectors[i]);
    }
    return new Matrix(v, this.rows, this.columns);
  }
  map(fn: (n: ASTNode, rowIndex: number, columnIndex: number) => ASTNode) {
    let out = this.clone();
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        out.matrix[i][j] = fn(this.matrix[i][j], i, j);
      }
    }
    return out;
  }

  ith(i: number, j: number): ASTNode {
    return this.matrix[i][j];
  }

  add(matrix: Matrix) {
    const out = this.clone();
    out.map((n, r, c) => {
      let element = matrix.ith(r, c);
      if (n.isNum() && element.isNum()) {
        return n.add(element);
      } else {
        return ast.binex(n, "+", element);
      }
    });
    return out;
  }
}
export class Vector extends ASTNode {
  elements: ASTNode[];
  len: number;
  constructor(elements: ASTNode[]) {
    super(NODE.VECTOR);
    this.elements = elements;
    this.len = elements.length;
  }
  accept<T>(n: Visitor<T>): T {
    return n.vector(this);
  }
}

export class Null extends ASTNode {
  value: null;
  constructor() {
    super(NODE.NULL);
    this.value = null;
  }
  accept<T>(v: Visitor<T>) {
    return v.null(this);
  }
}

export class Bool extends ASTNode {
  value: boolean;
  constructor(value: boolean) {
    super(NODE.BOOL);
    this.value = value;
  }
  accept<T>(v: Visitor<T>) {
    return v.bool(this);
  }
}

type NUMBER = Int | Float | Fraction;

enum NUM {
  FRACTION,
  FLOAT,
  INT,
  COMPLEX,
}

export class Num extends ASTNode {
  value: string;
  #type: NUM;
  constructor(value: string | number, type: NUM) {
    super(NODE.NUMBER);
    this.value = typeof value === "number" ? value.toString() : value;
    this.#type = type;
  }
  accept<T>(v: Visitor<T>) {
    return v.num(this);
  }
  get isFraction() {
    return this.#type === NUM.FRACTION;
  }
  get typename() {
    return this.#type;
  }
  get numval(): NUMBER {
    switch (this.#type) {
      case NUM.INT:
        const res = new Int(Number.parseInt(this.value));
        return res;
      case NUM.FLOAT:
        return new Float(math.toFloat(this.value));
      case NUM.FRACTION:
        const parts = this.value.split("/");
        const n = math.toInt(parts[0]);
        const d = math.toInt(parts[1]);
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
      const b = math.toInt(x.value);
      const aN = a.N;
      const aB = a.D;
      const N = aN ** b;
      const D = aB ** b;
      return math.simplify(N, D);
    }
    if (this.hasFrac(x)) {
      throw new Error("pow for fractional exponents unimplemented");
    }
    const a = this.numval.N;
    const b = x.numval.N;
    const result = a ** b;
    return new Num(result, this.type(result));
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
      return math.simplify(
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
    return new Num(result, NUM.INT);
  }
  gt(x: Num) {
    let result = 1;
    if (this.hasFrac(x)) {
      const L = this.lte(x);
      result = L.value === "1" ? 0 : 1;
    } else result = this.numval.N > x.numval.D ? 1 : 0;
    return new Num(result, NUM.INT);
  }
  lt(x: Num) {
    let result = 1;
    if (this.hasFrac(x)) {
      const L = this.lte(x);
      const R = this.equals(x);
      result = L.value === "1" && R.value === "0" ? 1 : 0;
    } else result = this.numval.N < x.numval.D ? 1 : 0;
    return new Num(result, NUM.INT);
  }
  lte(x: Num) {
    let result = 1;
    if (this.hasFrac(x)) {
      const tN = this.numval.N;
      const tD = this.numval.D;
      const tND = math.simplify(tN, tD);
      const xN = x.numval.N;
      const xD = x.numval.D;
      const xND = math.simplify(xN, xD);
      const thisN = tND.numval.N;
      const otherD = xND.numval.D;
      const thisD = tND.numval.D;
      const otherN = xND.numval.N;
      result = thisN * otherD <= otherN * thisD ? 1 : 0;
    } else result = this.numval.N <= x.numval.N ? 1 : 0;
    return new Num(result, NUM.INT);
  }
  minus(x: Num) {
    let result = 0;
    if (this.hasFrac(x)) {
      return math.simplify(
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
      return math.simplify(
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
      return math.simplify(
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
    const a = math.simplify(this.numval.N, this.numval.D);
    const b = math.simplify(x.numval.N, x.numval.D);
    const result = a.numval.N === b.numval.N &&
        a.numval.D === b.numval.D
      ? 1
      : 0;
    return new Num(result, NUM.INT);
  }
}

export class Fraction extends Num {
  N: number;
  D: number;
  constructor(n: number, d: number) {
    super(`${n}/${d}`, NUM.FRACTION);
    this.N = n;
    this.D = d;
  }
}

export class Int {
  N: number;
  constructor(n: number) {
    this.N = n;
  }
  get D() {
    return 1;
  }
}
export class Complex {
  real: number;
  imaginary: number;
  constructor(real: number, imaginary: string) {
    this.real = real;
    this.imaginary = math.toInt(imaginary.split("i")[0]);
  }
  get D() {
    return 1;
  }
}

export class Float {
  N: number;
  constructor(n: number) {
    this.N = n;
  }
  get D() {
    return 1;
  }
}

export class Sym extends ASTNode {
  value: string;
  constructor(value: string) {
    super(NODE.SYMBOL);
    this.value = value;
  }
  accept<T>(v: Visitor<T>) {
    return v.sym(this);
  }
}

export class Chars extends ASTNode {
  value: string;
  constructor(value: string) {
    super(NODE.CHARS);
    this.value = value;
  }
  accept<T>(v: Visitor<T>) {
    return v.chars(this);
  }
}

export class Definition extends ASTNode {
  op: string;
  params: ASTNode[];
  body: ASTNode;
  constructor(op: string, params: ASTNode[], body: ASTNode) {
    super(NODE.DEFINITION);
    this.op = op;
    this.params = params;
    this.body = body;
  }
  accept<T>(n: Visitor<T>): T {
    return n.definition(this);
  }
}

export enum EXPR {
  ARITHMETIC = "arithmetic",
  ALGEBRAIC = "algebraic",
}

export class UnaryExpr extends ASTNode {
  op: string;
  arg: ASTNode[];
  type: EXPR;
  constructor(op: string, arg: ASTNode[], type: EXPR) {
    super(NODE.UNARY_EXPRESSION);
    this.op = op;
    this.arg = arg;
    this.type = type;
  }
  accept<T>(n: Visitor<T>): T {
    return n.unaryExpr(this);
  }
}

export class BinaryExpr extends ASTNode {
  left: ASTNode;
  op: string;
  right: ASTNode;
  type: EXPR;
  constructor(left: ASTNode, op: string, right: ASTNode, type: EXPR) {
    super(NODE.BINARY_EXPRESSION);
    this.left = left;
    this.op = op;
    this.right = right;
    this.type = type;
  }
  accept<T>(n: Visitor<T>): T {
    return n.binaryExpr(this);
  }
}

export class ast {
  static int(v: string, base = 10) {
    return new Num(math.toInt(v, base).toString(), NUM.INT);
  }
  static float(v: string) {
    return new Num(v, NUM.FLOAT);
  }
  static complex(v: string) {
    return new Num(v, NUM.COMPLEX);
  }
  static bool(v: boolean) {
    return new Bool(v);
  }
  static fraction(s: string) {
    const [a, b] = math.getFrac(s);
    return new Num(`${a}/${b}`, NUM.FRACTION);
  }
  static integer(n: number) {
    return new Num(n.toString(), NUM.INT);
  }
  static decimal(n: number) {
    return new Num(n.toString(), NUM.FLOAT);
  }

  static string(s: string) {
    return new Chars(s);
  }
  static nil = new Null();

  static symbol(s: string) {
    return new Sym(s);
  }
  static algebra2(left: ASTNode, op: string, right: ASTNode) {
    return new BinaryExpr(left, op, right, EXPR.ALGEBRAIC);
  }
  static matrix(matrix: Vector[], rows: number, columns: number) {
    return new Matrix(matrix, rows, columns);
  }
  static vector(elements: ASTNode[]) {
    return new Vector(elements);
  }
  static binex(
    left: ASTNode,
    op: string,
    right: ASTNode,
    type = EXPR.ARITHMETIC,
  ) {
    return new BinaryExpr(left, op, right, type);
  }
  static algebra1(op: string, arg: ASTNode[]) {
    return new UnaryExpr(op, arg, EXPR.ALGEBRAIC);
  }
  static unex(op: string, arg: ASTNode[], type = EXPR.ARITHMETIC) {
    return new UnaryExpr(op, arg, type);
  }
  static tuple(elements: ASTNode[]) {
    return new Tuple(elements);
  }
  static block(elements: ASTNode[]) {
    return new Block(elements);
  }
  static def(op: string, params: ASTNode[], body: ASTNode) {
    return new Definition(op, params, body);
  }
  static root(elements: ASTNode[] | string) {
    return typeof elements === "string"
      ? new Root([new Chars(elements)])
      : new Root(elements);
  }
}

export function print(OBJ: Object) {
  function makePrefix(key: string, last: boolean) {
    var str = last ? "└" : "├";
    if (key) {
      str += "─ ";
    } else {
      str += "──┐";
    }
    return str;
  }

  function filterKeys(obj: Object) {
    var keys = [];
    for (var branch in obj) {
      if (!obj.hasOwnProperty(branch)) {
        continue;
      }
      keys.push(branch);
    }
    return keys;
  }

  function growBranch(
    key: string,
    root: any,
    last: boolean,
    lastStates: ([string, boolean])[],
    showValues = true,
    hideFunctions = true,
    callback: (str: string) => any,
  ) {
    if (root instanceof ASTNode) {
      root.kind = `${NODE[root.kind]}`.toLowerCase() as any;
    }
    let line = "";
    let index = 0;
    let lastKey = false;
    let circular = false;
    let lastStatesCopy = lastStates.slice(0);
    if (lastStatesCopy.push([root, last]) && lastStates.length > 0) {
      lastStates.forEach(function (lastState, idx) {
        if (idx > 0) {
          line += (lastState[1] ? " " : "│") + "  ";
        }
        if (!circular && lastState[0] === root) {
          circular = true;
        }
      });
      line += makePrefix(key, last) + key;
      if (showValues && (typeof root !== "object" || root instanceof Date)) {
        line += ": " + root;
      }
      circular && (line += " (circular ref.)");
      callback(line);
    }
    if (!circular && typeof root === "object") {
      var keys = filterKeys(root);
      keys.forEach(function (branch) {
        lastKey = ++index === keys.length;
        growBranch(
          branch,
          root[branch],
          lastKey,
          lastStatesCopy,
          showValues,
          hideFunctions,
          callback,
        );
      });
    }
  }
  let tree = "";
  const obj = Object.assign({}, OBJ);
  (obj as Root).kind = "AST" as any;
  growBranch(".", obj, false, [], true, true, function (line: string) {
    tree += line + "\n";
  });
  return tree;
}

export class ToString implements Visitor<string> {
  bool(n: Bool): string {
    return `${n.value}`;
  }
  chars(n: Chars): string {
    return n.value;
  }
  null(n: Null): string {
    return "null";
  }
  num(n: Num): string {
    return n.value;
  }
  sym(n: Sym): string {
    return n.value;
  }
  tuple(n: Tuple): string {
    let result: string[] = [];
    n.elements.forEach((n) => result.push(this.toString(n)));
    const out = `[` + result.join(",") + `]`;
    return out;
  }
  block(n: Block): string {
    let result = "";
    for (let i = 0; i < n.elements.length; i++) {
      result += this.toString(n.elements[i]) + "\n";
    }
    return result;
  }
  vector(n: Vector): string {
    let result: string[] = [];
    n.elements.forEach((n) => result.push(this.toString(n)));
    const out = `[` + result.join(", ") + `]`;
    return out;
  }
  unaryExpr(n: UnaryExpr): string {
    let op = n.op;
    let result: string[] = [];
    n.arg.forEach((n) => result.push(this.toString(n)));
    const out = op + `(` + result.join(",") + `)`;
    return out;
  }
  binaryExpr(n: BinaryExpr): string {
    let left = this.toString(n.left);
    let right = this.toString(n.right);
    return left + n.op + right;
  }

  definition(n: Definition): string {
    return this.toString(n.body);
  }
  root(n: Root): string {
    let result: string[] = [];
    n.root.forEach((n) => result.push(this.toString(n)));
    const out = result.join("");
    return out;
  }
  matrix(n: Matrix): string {
    let elements: string[] = [];
    n.vectors.forEach((v) => elements.push("\t" + this.toString(v)));
    const Es = "[\n" + elements.join("\n") + "\n]";
    return Es;
  }
  toString(n: ASTNode) {
    return n.accept(this);
  }
}

export class Interpreter implements Visitor<ASTNode> {
  environment: Environment;
  str: ToString;
  constructor(env: Environment) {
    this.environment = env;
    this.str = new ToString();
  }
  matrix(n: Matrix): ASTNode {
    // let out:ASTNode[] = [];
    return n;
  }
  stringify(n: ASTNode) {
    return n.accept(this.str);
  }
  bool(n: Bool): ASTNode {
    return n;
  }
  chars(n: Chars): ASTNode {
    return n;
  }
  null(n: Null): ASTNode {
    return n;
  }
  num(n: Num): ASTNode {
    return n;
  }
  sym(n: Sym): ASTNode {
    const res = this.environment.lookup(n.value);
    if (res) {
      return this.evaluate(res);
    }
    return new Chars(n.value);
  }
  tuple(n: Tuple): ASTNode {
    return n;
  }
  block(n: Block): ASTNode {
    return n;
  }
  vector(n: Vector): ASTNode {
    return n;
  }
  unaryExpr(n: UnaryExpr): ASTNode {
    return n;
  }
  binaryExpr(n: BinaryExpr): ASTNode {
    const left = this.evaluate(n.left);
    const right = this.evaluate(n.right);
    if (left.isMatrix() && right.isMatrix()) {
      switch (n.op) {
        case "+":
          return left.add(right);
      }
    }
    if (left.isNum() && right.isNum()) {
      switch (n.op) {
        case "+":
          return left.add(right);
        case "-":
          return left.minus(right);
        case "*":
          return left.times(right);
        case "/":
          return left.divide(right);
        case "^":
          return left.pow(right);
      }
    }
    return ast.binex(left, n.op, right, n.type);
  }
  definition(n: Definition): ASTNode {
    throw new Error("Method not implemented.");
  }
  root(n: Root): ASTNode {
    let result: ASTNode = new Null();
    for (let i = 0; i < n.root.length; i++) {
      result = this.evaluate(n.root[i]);
    }
    return result;
  }
  evaluate(n: ASTNode) {
    return n.accept(this);
  }
}
