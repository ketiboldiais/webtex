import { NODE } from "./structs/enums.js";
import { functions, symbols } from "./structs/latex.js";
import { getComplexParts, match, split } from "./structs/stringfn.js";
import { List } from "./structs/list.js";
import { GCD, getFrac, sgn } from "./structs/mathfn.js";
import { ToString } from "./ToString.js";

/* -------------------------------------------------------------------------- */
/* § Visitor Interface                                                        */
/* -------------------------------------------------------------------------- */
export type Atom = Chars | Null | Num | Sym | Bool;

export interface Visitor<T> {
  chars(node: Chars): T;
  null(node: Null): T;
  num(node: Num): T;
  sym(node: Sym): T;
  bool(node: Bool): T;
  group(node: Group): T;
  tuple(node: Tuple): T;
  block(node: Block): T;
  vector(node: Vector): T;
  matrix(node: Matrix): T;
  unaryExpr(node: UnaryExpr): T;
  callExpr(node: CallExpr): T;
  binaryExpr(node: BinaryExpr): T;
  varDeclaration(node: VarDeclaration): T;
  funDeclaration(node: FunDeclaration): T;
  root(node: Root): T;
  cond(node: CondExpr): T;
  assign(node: Assignment): T;
  error(node: Errnode): T;
  whileStmnt(node: WhileNode): T;
}

/* -------------------------------------------------------------------------- */
/* § Abstract: ASTNode                                                        */
/* -------------------------------------------------------------------------- */

export abstract class ASTNode {
  kind: NODE;
  constructor(kind: NODE) {
    this.kind = kind;
  }
  abstract get val(): string;
  get erred() {
    return this.kind === NODE.ERROR;
  }
  get nkind() {
    return NODE[this.kind].toLowerCase().replace("_", "-");
  }
  abstract accept<T>(n: Visitor<T>): T;

  isBlock(): this is Block {
    return this.kind === NODE.BLOCK;
  }
  isCallExpr() {
    return this.kind === NODE.CALL_EXPRESSION;
  }
  isBool(): this is Bool {
    return this.kind === NODE.BOOL;
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
  isNull(): this is Null {
    return this.kind === NODE.NULL;
  }
  isNum(): this is Num {
    return this.kind === NODE.NUMBER;
  }
  isGroup(): this is Group {
    return this.kind === NODE.GROUP;
  }
  isSymbol(): this is Sym {
    return this.kind === NODE.SYMBOL;
  }
  isChars(): this is Chars {
    return this.kind === NODE.CHARS;
  }
  isVarDeclaration(): this is VarDeclaration {
    return this.kind === NODE.VARIABLE_DECLARATION;
  }
  isFunDeclaration(): this is FunDeclaration {
    return this.kind === NODE.FUNCTION_DECLARATION;
  }
  isUnaryExpr(): this is UnaryExpr {
    return this.kind === NODE.UNARY_EXPRESSION;
  }
  isBinex(): this is BinaryExpr {
    return this.kind === NODE.BINARY_EXPRESSION;
  }
  isRoot(): this is Root {
    return this.kind === NODE.ROOT;
  }
}

/* -------------------------------------------------------------------------- */
/* § Root                                                                     */
/* -------------------------------------------------------------------------- */

export class Root extends ASTNode {
  root: ASTNode[];
  error: boolean;
  constructor(root: ASTNode[]) {
    super(NODE.ROOT);
    this.root = root;
    this.error = false;
  }
  get val() {
    return "root";
  }
  accept<T>(n: Visitor<T>): T {
    return n.root(this);
  }
}

/* -------------------------------------------------------------------------- */
/* § Block                                                                    */
/* -------------------------------------------------------------------------- */

export class Block extends ASTNode {
  body: ASTNode[];
  constructor(body: ASTNode[]) {
    super(NODE.BLOCK);
    this.body = body;
  }
  get val() {
    return "block";
  }
  accept<T>(n: Visitor<T>): T {
    return n.block(this);
  }
}

/* -------------------------------------------------------------------------- */
/* § Conditional                                                              */
/* -------------------------------------------------------------------------- */

export class CondExpr extends ASTNode {
  condition: ASTNode;
  consequent: ASTNode;
  alternate: ASTNode;
  constructor(condition: ASTNode, consequent: ASTNode, alternate: ASTNode) {
    super(NODE.COND);
    this.condition = condition;
    this.consequent = consequent;
    this.alternate = alternate;
  }
  get val() {
    return "condExpr";
  }
  accept<T>(v: Visitor<T>) {
    return v.cond(this);
  }
}

/* -------------------------------------------------------------------------- */
/* § While Statement                                                          */
/* -------------------------------------------------------------------------- */

export class WhileNode extends ASTNode {
  condition: ASTNode;
  body: ASTNode;
  constructor(condition: ASTNode, body: ASTNode) {
    super(NODE.WHILE);
    this.condition = condition;
    this.body = body;
  }
  get val() {
    return `while (${this.condition.val}): ${this.body.val}`;
  }
  accept<T>(n: Visitor<T>): T {
    return n.whileStmnt(this);
  }
}

/* -------------------------------------------------------------------------- */
/* § Unary Expression                                                         */
/* -------------------------------------------------------------------------- */

export class UnaryExpr extends ASTNode {
  op: string;
  arg: ASTNode;
  constructor(op: string, arg: ASTNode) {
    super(NODE.UNARY_EXPRESSION);
    this.op = op;
    this.arg = arg;
  }
  get val() {
    return `${this.op}${this.arg.val}`;
  }
  accept<T>(n: Visitor<T>): T {
    return n.unaryExpr(this);
  }
}

/* -------------------------------------------------------------------------- */
/* § Variable Declaration                                                     */
/* -------------------------------------------------------------------------- */

export class VarDeclaration extends ASTNode {
  name: string;
  value: ASTNode;
  line: number;
  constructor(op: string, value: ASTNode, line: number) {
    super(NODE.VARIABLE_DECLARATION);
    this.name = op;
    this.value = value;
    this.line = line;
  }
  get val() {
    return `let ${this.name} = ${this.value.val};`;
  }
  accept<T>(n: Visitor<T>): T {
    return n.varDeclaration(this);
  }
}

/* -------------------------------------------------------------------------- */
/* § Vector                                                                   */
/* -------------------------------------------------------------------------- */

export class Vector extends ASTNode {
  elements: ASTNode[];
  len: number;
  constructor(elements: ASTNode[]) {
    super(NODE.VECTOR);
    this.elements = elements;
    this.len = elements.length;
  }
  get val() {
    return "[" + this.elements.map((v) => v.val).join(", ") + "]";
  }
  accept<T>(n: Visitor<T>): T {
    return n.vector(this);
  }
}

/* -------------------------------------------------------------------------- */
/* § Assignment                                                               */
/* -------------------------------------------------------------------------- */

export class Assignment extends ASTNode {
  name: string;
  value: ASTNode;
  constructor(name: string, value: ASTNode) {
    super(NODE.ASSIGNMENT);
    this.name = name;
    this.value = value;
  }
  get val() {
    return `${this.name} = ${this.value.val}`;
  }
  accept<T>(n: Visitor<T>): T {
    return n.assign(this);
  }
}

/* -------------------------------------------------------------------------- */
/* § Binary Expression                                                        */
/* -------------------------------------------------------------------------- */

export class BinaryExpr extends ASTNode {
  left: ASTNode;
  op: string;
  right: ASTNode;
  constructor(left: ASTNode, op: string, right: ASTNode) {
    super(NODE.BINARY_EXPRESSION);
    this.left = left;
    this.op = op;
    this.right = right;
  }
  get val() {
    return `${this.left.val} ${this.op} ${this.right.val}`;
  }
  accept<T>(n: Visitor<T>): T {
    return n.binaryExpr(this);
  }
}

/* -------------------------------------------------------------------------- */
/* § Call Expression                                                          */
/* -------------------------------------------------------------------------- */

export class CallExpr extends ASTNode {
  callee: string;
  args: ASTNode[];
  length: number;
  native?: Function;
  constructor(callee: string, args: ASTNode[], native?: Function) {
    super(NODE.CALL_EXPRESSION);
    this.callee = callee;
    this.args = args;
    this.length = args.length;
    this.native = native;
  }
  get val() {
    return `${this.callee}(${this.args.map((n) => n.val).join(", ")})`;
  }
  get latexFuncName() {
    if (functions[this.callee]) {
      return functions[this.callee].latex;
    }
    return this.callee;
  }
  accept<T>(n: Visitor<T>): T {
    return n.callExpr(this);
  }
}

export class Null extends ASTNode {
  value: string;
  constructor(value: string = "null") {
    super(NODE.NULL);
    this.value = value;
  }
  get val() {
    return `null`;
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
  get val() {
    return `${this.value}`;
  }
  accept<T>(v: Visitor<T>) {
    return v.bool(this);
  }
  and(other: Bool) {
    return ast.bool(this.value && other.value);
  }
  or(other: Bool) {
    return ast.bool(this.value || other.value);
  }
  nor(other: Bool) {
    return ast.bool(!(this.value || other.value));
  }
  xor(other: Bool) {
    return ast.bool(this.value !== other.value);
  }
  xnor(other: Bool) {
    return ast.bool(this.value === other.value);
  }
  nand(other: Bool) {
    return ast.bool(!(this.value && other.value));
  }
}

export class Sym extends ASTNode {
  value: string;
  isStatic: boolean;
  constructor(value: string, isStatic = false) {
    super(NODE.SYMBOL);
    this.value = value;
    this.isStatic = isStatic;
  }
  get val() {
    return this.value;
  }
  get latex() {
    if (functions[this.value]) {
      return functions[this.value].latex;
    } else if (symbols[this.value]) {
      return symbols[this.value].latex;
    }
    return this.value;
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
  get val() {
    return `"${this.value}"`;
  }
  accept<T>(v: Visitor<T>) {
    return v.chars(this);
  }
}

export class Errnode extends ASTNode {
  value: string;
  constructor(message: string) {
    super(NODE.ERROR);
    this.value = message;
  }
  get val() {
    return `error: ${this.value}`;
  }
  accept<T>(n: Visitor<T>): T {
    return n.error(this);
  }
}

export class FunDeclaration extends ASTNode {
  name: string;
  params: Sym[];
  body: ASTNode;
  constructor(name: string, params: Sym[], body: ASTNode) {
    super(NODE.FUNCTION_DECLARATION);
    this.name = name;
    this.params = params;
    this.body = body;
  }
  get val() {
    return `let ${this.name}(${
      this.params.map((s) => s.val).join(", ")
    }) = ${this.body.val}`;
  }
  get paramlist() {
    return this.params.map((n) => n.value);
  }
  accept<T>(n: Visitor<T>): T {
    return n.funDeclaration(this);
  }
}

export class Group extends ASTNode {
  expression: ASTNode;
  constructor(expression: ASTNode) {
    super(NODE.GROUP);
    this.expression = expression;
  }
  get val() {
    return `(${this.expression.val})`;
  }
  accept<T>(n: Visitor<T>): T {
    return n.group(this);
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
  get val() {
    const vectors = `[${this.vectors.map((v) => v.val).join(", ")}]\n`;
    return `[${vectors}]`;
  }
  toString(n: ASTNode) {
    const ts = new ToString();
    return n.accept(ts);
  }
  accept<T>(node: Visitor<T>): T {
    return node.matrix(this);
  }
  clone() {
    let v: Vector[] = [];
    for (let i = 0; i < this.rows; i++) {
      v.push(this.vectors[i]);
    }
    return new Matrix(v, this.rows, this.columns);
  }
  forall(
    fn: (n: ASTNode, rowIndex: number, columnIndex: number) => any,
  ): any {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.matrix[i][j] = fn(this.matrix[i][j], i, j);
      }
    }
    return this.matrix;
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

export class Tuple extends ASTNode {
  value: List<ASTNode>;
  constructor(elements: List<ASTNode>) {
    super(NODE.TUPLE);
    this.value = elements;
  }
  get val() {
    return "(" + this.value.array.map((d) => d.val).join(", ") + ")";
  }
  static of(list: List<ASTNode>) {
    return new Tuple(list);
  }
  accept<T>(n: Visitor<T>): T {
    return n.tuple(this);
  }
}

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

export function getNUM(n: string) {
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
      return Num.NAN;
    case n === "Inf":
      return Num.INF;
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
  NAN,
  INF,
}

/* -------------------------------------------------------------------------- */
/* § Num                                                                      */
/* -------------------------------------------------------------------------- */
export class Num extends ASTNode {
  value: string;
  #type: NUM;
  constructor(value: string, type: NUM) {
    super(NODE.NUMBER);
    this.value = value;
    this.#type = type;
  }
  static NAN = new Num("NaN", NUM.NAN);
  static INF = new Num("Inf", NUM.INF);
  get val() {
    return this.value;
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
      case NUM.NAN:
        return NaN;
      case NUM.INF:
        return Infinity;
      case NUM.INT:
        return Number.parseInt(this.value);
      case NUM.FLOAT:
        return Number.parseFloat(this.value);
      case NUM.FRACTION:
        const parts = this.value.split("/");
        const n = Number.parseInt(parts[0]);
        const d = Number.parseInt(parts[1]);
        return n / d;
      default:
        return 0;
    }
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
    return new Num(`${result}`, this.type(result));
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
    return new Num(`${result}`, this.type(result));
  }
  mod(x: Num) {
    const a = integer(this.value).N;
    const b = integer(x.value).N;
    const c = ((a % b) + b) % b;
    return ast.int(`${c}`);
  }
  rem(x: Num) {
    const a = integer(this.value).N;
    const b = integer(x.value).N;
    const c = a % b;
    return ast.int(`${c}`);
  }
  div(x: Num) {
    const a = integer(this.value).N;
    const b = integer(x.value).N;
    const c = Math.floor(a / b);
    return ast.int(`${c}`);
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
    return new Num(`${result}`, this.type(result));
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
    return new Num(`${result}`, this.type(result));
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
    return new Num(`${result}`, this.type(result));
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
    return new Num(`${result}`, this.type(result));
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
    return new Num(`${n}/${d}`, NUM.FRACTION);
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
    return new Num(`${n}`, NUM.INT);
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
    return new Num(`${n}`, NUM.FLOAT);
  }
}

/* -------------------------------------------------------------------------- */
/* § Builder                                                                  */
/* -------------------------------------------------------------------------- */

export class ast {
  static int(v: string, base = 10) {
    return new Num(Number.parseInt(v, base).toString(), NUM.INT);
  }
  static redeclareError(name: string) {
    return new Errnode(
      `[Resolver]: Name “${name}” has been declared in the same scope, redeclaration prohibited.`,
    );
  }
  static argsErr(callee: string, expected: number, actual: number) {
    const a1 = expected === 0 ? "no" : `${expected}`;
    const a2 = expected === 1 ? " argument," : " arguments,";
    const a12 = a1 + a2;
    const fName = "Function " + "“" + callee + "”";
    return new Errnode(
      `${fName} requires ${a12} but ${actual} were passed.`,
    );
  }
  static resError(message: string) {
    return new Errnode(`[Resolver]: ${message}`);
  }
  static typeError(message: string) {
    return new Errnode(`[Typechecker]: ${message}`);
  }
  static group(astnode: ASTNode) {
    return new Group(astnode);
  }
  static error(message: string) {
    return new Errnode(message);
  }
  static bool(value: boolean) {
    return new Bool(value);
  }
  static float(v: string) {
    return new Num(v, NUM.FLOAT);
  }
  static callExpr(fn: string, args: ASTNode[], native?: Function) {
    return new CallExpr(fn, args, native);
  }
  static assign(name: string, value: ASTNode) {
    return new Assignment(name, value);
  }
  static complex(v: string) {
    return new Num(v, NUM.COMPLEX);
  }
  static cond(test: ASTNode, consequent: ASTNode, alternate: ASTNode) {
    return new CondExpr(test, consequent, alternate);
  }
  static fraction(s: string) {
    const [a, b] = getFrac(s);
    return new Num(`${a}/${b}`, NUM.FRACTION);
  }
  static decimal(n: number) {
    return new Num(n.toString(), NUM.FLOAT);
  }
  static string(s: string) {
    return new Chars(s);
  }
  static nil = new Null();
  static symbol(s: string, isStatic = false) {
    return new Sym(s, isStatic);
  }
  static algebra2(left: ASTNode, op: string, right: ASTNode) {
    return new BinaryExpr(left, op, right);
  }
  static matrix(matrix: Vector[], rows: number, columns: number) {
    return new Matrix(matrix, rows, columns);
  }
  static vector(elements: ASTNode[]) {
    return new Vector(elements);
  }
  static binex(left: ASTNode, op: string, right: ASTNode) {
    return new BinaryExpr(left, op, right);
  }
  static algebra1(op: string, arg: ASTNode) {
    return new UnaryExpr(op, arg);
  }
  static unex(op: string, arg: ASTNode) {
    return new UnaryExpr(op, arg);
  }
  static tuple(elements: List<ASTNode>) {
    return new Tuple(elements);
  }
  static block(elements: ASTNode[]) {
    return new Block(elements);
  }
  static varDeclaration(name: string, value: ASTNode, line: number) {
    return new VarDeclaration(name, value, line);
  }
  static funDeclaration(name: string, params: Sym[], body: ASTNode) {
    return new FunDeclaration(name, params, body);
  }
  static root(elements: ASTNode[] | string) {
    return typeof elements === "string"
      ? new Root([new Chars(elements)])
      : new Root(elements);
  }
  static whileStmt(condition: ASTNode, body: ASTNode) {
    return new WhileNode(condition, body);
  }
  static isCallExpr(node: any): node is CallExpr {
    return node instanceof CallExpr;
  }
  static isUnex(node: any): node is UnaryExpr {
    return node instanceof UnaryExpr;
  }
  static isBinex(node: any): node is BinaryExpr {
    return node instanceof BinaryExpr;
  }
  static unknown(str: string) {
    return new Sym(str, true);
  }
}

