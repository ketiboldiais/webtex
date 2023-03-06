import {
  Keyword,
  keywords,
  LEXEME,
  NUM_TOKEN,
  PREC,
  TOKEN,
  Token,
  TokenStream,
} from "./token.js";
const { log } = console;

export namespace algom {
  const hasProp = (obj: Object, p: string) => obj.hasOwnProperty(p);
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
    if (!is.integer(a) || !is.integer(b)) {
      return Infinity;
    }
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
  export function factorial(n: number | string) {
    throw new Error("factorial unimplemented");
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
    func: (v: any): v is Function => typeof v === "function",
    obj: (v: any): v is Object => typeof v === "object",
    number: (v: any): v is number => typeof v === "number",
    string: (v: any): v is string => typeof v === "number",
    bool: (v: any): v is boolean => typeof v === "boolean",
    integer: (v: any) => {
      if (typeof v === "number") return Number.isInteger(v);
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
  export function even(n: number) {
    return n % 2 === 0 ? 1 : 0;
  }
  export function odd(n: number) {
    return n % 2 !== 0 ? 1 : 0;
  }

  /* -------------------------------------------------------------------------- */
  /* § enum: NODE                                                               */
  /* -------------------------------------------------------------------------- */
  enum NODE {
    BLOCK,
    TUPLE,
    VECTOR,
    MATRIX,
    COND,
    NULL,
    BOOL,
    NUMBER,
    SYMBOL,
    CHARS,
    VARIABLE_DECLARATION,
    FUNCTION_DECLARATION,
    ASSIGNMENT,
    ALGEBRAIC_EXPRESSION,
    UNARY_EXPRESSION,
    BINARY_EXPRESSION,
    CALL_EXPRESSION,
    ROOT,
  }

  /* -------------------------------------------------------------------------- */
  /* § Interface: Visitor                                                       */
  /* -------------------------------------------------------------------------- */
  interface Visitor<T> {
    chars(n: Chars): T;
    null(n: Null): T;
    num(n: Num): T;
    sym(n: Sym): T;
    tuple(n: Tuple): T;
    block(n: Block): T;
    vector(n: Vector): T;
    matrix(n: Matrix): T;
    exp(n: Exp): T;
    unaryExpr(n: UnaryExpr): T;
    callExpr(n: CallExpr): T;
    binaryExpr(n: BinaryExpr): T;
    varDeclaration(n: VarDeclaration): T;
    funDeclaration(n: FunDeclaration): T;
    root(n: Root): T;
    cond(n: CondExpr): T;
    assign(n: Assignment): T;
  }

  /* -------------------------------------------------------------------------- */
  /* § Abstract Class: ASTNode                                                  */
  /* -------------------------------------------------------------------------- */
  abstract class ASTNode {
    kind: NODE;
    constructor(kind: NODE) {
      this.kind = kind;
    }
    get nkind() {
      return NODE[this.kind];
    }
    abstract accept<T>(n: Visitor<T>): T;
    isBlock(): this is Block {
      return this.kind === NODE.BLOCK;
    }
    isCallExpr() {
      return this.kind === NODE.CALL_EXPRESSION;
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
  /* § ASTNode: Root                                                            */
  /* -------------------------------------------------------------------------- */
  class Root extends ASTNode {
    root: ASTNode[];
    constructor(root: ASTNode[]) {
      super(NODE.ROOT);
      this.root = root;
    }
    accept<T>(n: Visitor<T>): T {
      return n.root(this);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § ASTNode: Exp                                                             */
  /* -------------------------------------------------------------------------- */
  class Exp extends ASTNode {
    value: ASTNode;
    constructor(value: ASTNode) {
      super(NODE.ALGEBRAIC_EXPRESSION);
      this.value = value;
    }
    accept<T>(n: Visitor<T>): T {
      return n.exp(this);
    }
  }
  /* -------------------------------------------------------------------------- */
  /* § ASTNode: Assignment                                                      */
  /* -------------------------------------------------------------------------- */
  class Assignment extends ASTNode {
    name: string;
    value: ASTNode;
    constructor(name: string, value: ASTNode) {
      super(NODE.ASSIGNMENT);
      this.name = name;
      this.value = value;
    }
    accept<T>(n: Visitor<T>): T {
      return n.assign(this);
    }
  }
  /* -------------------------------------------------------------------------- */
  /* § ASTNode: Block                                                           */
  /* -------------------------------------------------------------------------- */
  class Block extends ASTNode {
    body: ASTNode[];
    constructor(body: ASTNode[]) {
      super(NODE.BLOCK);
      this.body = body;
    }
    accept<T>(n: Visitor<T>): T {
      return n.block(this);
    }
  }
  /* -------------------------------------------------------------------------- */
  /* § ASTNode: Tuple                                                           */
  /* -------------------------------------------------------------------------- */
  class Tuple extends ASTNode {
    elements: ASTNode[];
    constructor(elements: ASTNode[]) {
      super(NODE.TUPLE);
      this.elements = elements;
    }
    accept<T>(n: Visitor<T>): T {
      return n.tuple(this);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § ASTNode: Matrix                                                          */
  /* -------------------------------------------------------------------------- */
  class Matrix extends ASTNode {
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

  /* -------------------------------------------------------------------------- */
  /* § ASTNode: Vector                                                          */
  /* -------------------------------------------------------------------------- */
  class Vector extends ASTNode {
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

  /* -------------------------------------------------------------------------- */
  /* § ASTNode: Null                                                            */
  /* -------------------------------------------------------------------------- */
  class Null extends ASTNode {
    value: null;
    constructor() {
      super(NODE.NULL);
      this.value = null;
    }
    accept<T>(v: Visitor<T>) {
      return v.null(this);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § ASTNode: Num                                                             */
  /* -------------------------------------------------------------------------- */
  type NUMBER = Int | Float | Fraction;
  enum NUM {
    FRACTION,
    FLOAT,
    INT,
    COMPLEX,
  }
  class Num extends ASTNode {
    value: string;
    #type: NUM;
    constructor(value: string | number, type: NUM) {
      super(NODE.NUMBER);
      this.value = typeof value === "number" ? value.toString() : value;
      this.#type = type;
    }
    get raw() {
      switch (this.#type) {
        case NUM.INT:
          return algom.toInt(this.value);
        case NUM.FLOAT:
          return algom.toFloat(this.value);
        case NUM.FRACTION:
          const parts = this.value.split("/");
          const n = algom.toInt(parts[0]);
          const d = algom.toInt(parts[1]);
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
    and(n: Num) {
      return this.isTrue && n.isTrue ? ast.TRUE : ast.FALSE;
    }
    or(n: Num) {
      return this.isTrue || n.isTrue ? ast.TRUE : ast.FALSE;
    }
    nor(n: Num) {
      return this.or(n).isTrue ? ast.FALSE : ast.TRUE;
    }
    xor(n: Num) {
      return this.raw !== n.raw ? ast.TRUE : ast.FALSE;
    }
    xnor(n: Num) {
      return this.xor(n).isTrue ? ast.FALSE : ast.TRUE;
    }
    nand(n: Num) {
      return this.and(n).isTrue ? ast.FALSE : ast.TRUE;
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
          return new Float(algom.toFloat(this.value));
        case NUM.FRACTION:
          const parts = this.value.split("/");
          const n = algom.toInt(parts[0]);
          const d = algom.toInt(parts[1]);
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
        const b = algom.toInt(x.value);
        const aN = a.N;
        const aB = a.D;
        const N = aN ** b;
        const D = aB ** b;
        return algom.simplify(N, D);
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
      const a = algom.integer(this.value).N;
      const b = algom.integer(x.value).N;
      return ast.integer(((a % b) + b) % b);
    }
    rem(x: Num) {
      const a = algom.integer(this.value).N;
      const b = algom.integer(x.value).N;
      return ast.integer(a % b);
    }
    div(x: Num) {
      const a = algom.integer(this.value).N;
      const b = algom.integer(x.value).N;
      return ast.integer(Math.floor(a / b));
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
        return algom.simplify(
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
        const tND = algom.simplify(tN, tD);
        const xN = x.numval.N;
        const xD = x.numval.D;
        const xND = algom.simplify(xN, xD);
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
        return algom.simplify(
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
        return algom.simplify(
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
        return algom.simplify(
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
      const a = algom.simplify(this.numval.N, this.numval.D);
      const b = algom.simplify(x.numval.N, x.numval.D);
      const result = a.numval.N === b.numval.N &&
          a.numval.D === b.numval.D
        ? 1
        : 0;
      return new Num(result, NUM.INT);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § Aux: Fraction                                                            */
  /* -------------------------------------------------------------------------- */
  class Fraction extends Num {
    N: number;
    D: number;
    constructor(n: number, d: number) {
      super(`${n}/${d}`, NUM.FRACTION);
      this.N = n;
      this.D = d;
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § Aux: Int                                                                 */
  /* -------------------------------------------------------------------------- */
  class Int {
    N: number;
    constructor(n: number) {
      this.N = n;
    }
    get D() {
      return 1;
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § Aux: Complex                                                             */
  /* -------------------------------------------------------------------------- */
  class Complex {
    real: number;
    imaginary: number;
    constructor(real: number, imaginary: string) {
      this.real = real;
      this.imaginary = algom.toInt(imaginary.split("i")[0]);
    }
    get D() {
      return 1;
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § Aux: Float                                                               */
  /* -------------------------------------------------------------------------- */
  class Float {
    N: number;
    constructor(n: number) {
      this.N = n;
    }
    get D() {
      return 1;
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § ASTNode: Conditional                                                     */
  /* -------------------------------------------------------------------------- */
  class CondExpr extends ASTNode {
    condition: ASTNode;
    consequent: ASTNode;
    alternate: ASTNode;
    constructor(condition: ASTNode, consequent: ASTNode, alternate: ASTNode) {
      super(NODE.COND);
      this.condition = condition;
      this.consequent = consequent;
      this.alternate = alternate;
    }
    accept<T>(v: Visitor<T>) {
      return v.cond(this);
    }
  }
  /* -------------------------------------------------------------------------- */
  /* § ASTNode: Sym                                                             */
  /* -------------------------------------------------------------------------- */
  enum SYMBOL {
    CONSTANT,
    VARIABLE,
  }
  export class Sym extends ASTNode {
    value: string;
    type: SYMBOL;
    constructor(value: string, type: SYMBOL) {
      super(NODE.SYMBOL);
      this.value = value;
      this.type = type;
    }
    accept<T>(v: Visitor<T>) {
      return v.sym(this);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § ASTNode: Chars                                                           */
  /* -------------------------------------------------------------------------- */
  class Chars extends ASTNode {
    value: string;
    constructor(value: string) {
      super(NODE.CHARS);
      this.value = value;
    }
    accept<T>(v: Visitor<T>) {
      return v.chars(this);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § ASTNode: Function Declaration                                            */
  /* -------------------------------------------------------------------------- */
  class FunDeclaration extends ASTNode {
    name: string;
    params: Sym[];
    body: ASTNode;
    constructor(name: string, params: Sym[], body: ASTNode) {
      super(NODE.FUNCTION_DECLARATION);
      this.name = name;
      this.params = params;
      this.body = body;
    }
    accept<T>(n: Visitor<T>): T {
      return n.funDeclaration(this);
    }
  }
  /* -------------------------------------------------------------------------- */
  /* § ASTNode: Variable Declaration                                            */
  /* -------------------------------------------------------------------------- */
  class VarDeclaration extends ASTNode {
    name: string;
    value: ASTNode;
    constructor(op: string, value: ASTNode) {
      super(NODE.VARIABLE_DECLARATION);
      this.name = op;
      this.value = value;
    }
    accept<T>(n: Visitor<T>): T {
      return n.varDeclaration(this);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § ASTNode: CallExpr                                                        */
  /* -------------------------------------------------------------------------- */
  class CallExpr extends ASTNode {
    functionName: string;
    args: ASTNode[];
    length: number;
    native?: FunctionEntry;
    constructor(functionName: string, args: ASTNode[], native?: FunctionEntry) {
      super(NODE.CALL_EXPRESSION);
      this.functionName = functionName;
      this.args = args;
      this.length = args.length;
      this.native = native;
    }
    accept<T>(n: Visitor<T>): T {
      return n.callExpr(this);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § ASTNode: UnaryExpr                                                       */
  /* -------------------------------------------------------------------------- */
  class UnaryExpr extends ASTNode {
    op: string;
    arg: ASTNode;
    constructor(op: string, arg: ASTNode) {
      super(NODE.UNARY_EXPRESSION);
      this.op = op;
      this.arg = arg;
    }
    accept<T>(n: Visitor<T>): T {
      return n.unaryExpr(this);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § ASTNode: BinaryExpr                                                      */
  /* -------------------------------------------------------------------------- */
  class BinaryExpr extends ASTNode {
    left: ASTNode;
    op: string;
    right: ASTNode;
    constructor(left: ASTNode, op: string, right: ASTNode) {
      super(NODE.BINARY_EXPRESSION);
      this.left = left;
      this.op = op;
      this.right = right;
    }
    accept<T>(n: Visitor<T>): T {
      return n.binaryExpr(this);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § BUILDER: AST                                                             */
  /* -------------------------------------------------------------------------- */
  export class ast {
    static int(v: string, base = 10) {
      return new Num(algom.toInt(v, base).toString(), NUM.INT);
    }
    static exp(v: ASTNode) {
      return new Exp(v);
    }
    static TRUE = new Num(1, NUM.INT);
    static FALSE = new Num(0, NUM.INT);
    static float(v: string) {
      return new Num(v, NUM.FLOAT);
    }
    static callExpr(fn: string, args: ASTNode[], native?: FunctionEntry) {
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
      const [a, b] = algom.getFrac(s);
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
    static symbol(s: string, type: SYMBOL) {
      return new Sym(s, type);
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
    static tuple(elements: ASTNode[]) {
      return new Tuple(elements);
    }
    static block(elements: ASTNode[]) {
      return new Block(elements);
    }
    static varDeclaration(name: string, value: ASTNode) {
      return new VarDeclaration(name, value);
    }
    static funDeclaration(name: string, params: Sym[], body: ASTNode) {
      return new FunDeclaration(name, params, body);
    }
    static root(elements: ASTNode[] | string) {
      return typeof elements === "string"
        ? new Root([new Chars(elements)])
        : new Root(elements);
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
  }

  /* -------------------------------------------------------------------------- */
  /* § Visitor: ToPrefix                                                        */
  /* -------------------------------------------------------------------------- */
  class ToPrefix implements Visitor<string> {
    cond(n: CondExpr) {
      const test: string = this.toPrefix(n.condition) + "\n";
      const consequent: string = "\t" + this.toPrefix(n.consequent) + "\n";
      const alternate: string = "\t" + " else " + this.toPrefix(n.alternate);
      return `(cond ${test} ${consequent} ${alternate})`;
    }
    exp(n: Exp): string {
      return `(${n.value})`;
    }
    assign(n: Assignment): string {
      const name = n.name;
      const value = this.toPrefix(n.value);
      return `(assign ${name} ${value})`;
    }
    chars(n: Chars): string {
      return `"` + n.value + `"`;
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
      return this.stringify(n.elements);
    }
    block(n: Block): string {
      let result = "(";
      for (let i = 0; i < n.body.length; i++) {
        result += this.toPrefix(n.body[i]);
      }
      return result + ")";
    }
    vector(n: Vector): string {
      return this.stringify(n.elements);
    }
    unaryExpr(n: UnaryExpr): string {
      let op = n.op;
      let result = this.toPrefix(n.arg);
      const out = `(` + op + result + `)`;
      return out;
    }
    binaryExpr(n: BinaryExpr): string {
      let left = this.toPrefix(n.left);
      let right = this.toPrefix(n.right);
      return `(` + n.op + " " + left + " " + right + `)`;
    }
    varDeclaration(n: VarDeclaration): string {
      const name = n.name;
      return `(define ` + name + " " + this.toPrefix(n.value) + `)`;
    }
    root(n: Root): string {
      let result: string[] = [];
      n.root.forEach((n) => result.push(this.toPrefix(n)));
      const out = result.join("\n");
      return `(` + out + `)`;
    }
    funDeclaration(node: FunDeclaration): string {
      const name = node.name;
      const params = this.stringify(node.params);
      const body = this.toPrefix(node.body);
      return `(fun ${name} ${params} ${body})`;
    }
    matrix(n: Matrix): string {
      let elements: string[] = [];
      n.vectors.forEach((v) => elements.push("\t" + this.toPrefix(v)));
      const Es = "(\n" + elements.join("\n") + "\n)";
      return Es;
    }
    callExpr(n: CallExpr): string {
      let fn = n.functionName;
      let arglist = this.stringify(n.args);
      return fn + arglist;
    }
    stringify(
      nodes: ASTNode[],
      separator = " ",
      delims = ["(", ")"],
      prefix = "",
      postfix = "",
    ) {
      let out: string[] = [];
      nodes.forEach((n) => prefix + out.push(this.toPrefix(n)) + postfix);
      const [leftDelim, rightDelim] = delims;
      return leftDelim + out.join(separator) + rightDelim;
    }
    toPrefix(n: ASTNode) {
      return n.accept(this);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § Visitor: ToString                                                        */
  /* -------------------------------------------------------------------------- */
  class ToString implements Visitor<string> {
    cond(n: CondExpr) {
      const test: string = this.toString(n.condition);
      const consequent: string = this.toString(n.consequent);
      const alternate: string = this.toString(n.alternate);
      return `if (${test}) {${consequent}} else {${alternate}}`;
    }
    exp(n: Exp): string {
      return this.toString(n.value);
    }
    assign(n: Assignment): string {
      const name = n.name;
      const value = this.toString(n.value);
      return `${name} := ${value}`;
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
      return this.stringify(n.elements, ", ", ["(", ")"]);
    }
    block(n: Block): string {
      let result = "";
      for (let i = 0; i < n.body.length; i++) {
        result += this.toString(n.body[i]) + "\n";
      }
      return result;
    }
    vector(n: Vector): string {
      return this.stringify(n.elements, ", ", ["[", "]"]);
    }
    unaryExpr(n: UnaryExpr): string {
      let op = n.op;
      let result = this.toString(n.arg);
      const out = op + `(` + result + `)`;
      return out;
    }
    binaryExpr(n: BinaryExpr): string {
      if (n.op === "*" && n.left.isNum() && n.right.isSymbol()) {
        return n.left.value + n.right.value;
      }
      let left = this.toString(n.left);
      let right = this.toString(n.right);
      const op = (n.op !== "^" && n.op !== "/") ? ` ${n.op} ` : n.op;
      return left + op + right;
    }
    varDeclaration(n: VarDeclaration): string {
      return this.toString(n.value);
    }
    root(n: Root): string {
      let result: string[] = [];
      n.root.forEach((n) => result.push(this.toString(n)));
      const out = result.join("");
      return out;
    }
    funDeclaration(node: FunDeclaration): string {
      const name = node.name;
      const params = this.stringify(node.params, ", ", ["(", ")"]);
      const body = this.toString(node.body);
      return name + params + "{" + body + "}";
    }
    matrix(n: Matrix): string {
      let elements: string[] = [];
      n.vectors.forEach((v) => elements.push("\t" + this.toString(v)));
      const Es = "[\n" + elements.join("\n") + "\n]";
      return Es;
    }
    callExpr(n: CallExpr): string {
      let fn = n.functionName;
      let arglist = this.stringify(n.args);
      return fn + arglist;
    }
    stringify(
      nodes: ASTNode[],
      separator = ", ",
      delims = ["(", ")"],
      prefix = "",
      postfix = "",
    ) {
      let out: string[] = [];
      nodes.forEach((n) => prefix + out.push(this.toString(n)) + postfix);
      const [leftDelim, rightDelim] = delims;
      return leftDelim + out.join(separator) + rightDelim;
    }
    toString(n: ASTNode) {
      return n.accept(this);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § INTERPRETER                                                              */
  /* -------------------------------------------------------------------------- */
  class Interpreter implements Visitor<ASTNode> {
    environment: Environment;
    str: ToString;
    constructor(environment = new Environment()) {
      this.environment = environment;
      this.str = new ToString();
    }
    private evalMath(nodeargs: ASTNode[], native: FunctionEntry) {
      let args: number[] = [];
      nodeargs.forEach((node) => {
        const num = this.evaluate(node);
        num.isNum() && args.push(num.raw);
      });
      const result = Library.execute({ fn: native, args });
      switch (typeof result) {
        case "number":
          const build = algom.match.int(`${result}`) ? ast.int : ast.float;
          return build(`${result}`);
        default:
          return ast.nil;
      }
    }
    stringify(n: ASTNode) {
      return n.accept(this.str);
    }
    /* -------------------------------------------------------------------------- */
    /* § Interpret Algebraic Expression                                           */
    /* -------------------------------------------------------------------------- */
    exp(n: Exp): ASTNode {
      return ast.string(this.stringify(n));
    }
    /* -------------------------------------------------------------------------- */
    /* § Interpret Call Expression                                                */
    /* -------------------------------------------------------------------------- */
    callExpr(node: CallExpr): ASTNode {
      const { native } = node;
      if (native) {
        switch (native.argtype) {
          case NODE.NUMBER:
            return this.evalMath(node.args, native);
          default:
            throw new Error("Unhandled argtype in native.");
        }
      } else {
        const { functionName, args } = node;
        const callee = this.environment.lookup(functionName);
        if (callee.isFunDeclaration()) {
          const { params, body } = callee;
          const env = new Environment(this.environment);
          params.forEach((n, i) => env.declare(n.value, args[i]));
          const ip = new Interpreter(env);
          const result = body.accept(ip);
          return result;
        }
        return ast.nil;
      }
    }
    /* -------------------------------------------------------------------------- */
    /* § Interpret Assignment                                                     */
    /* -------------------------------------------------------------------------- */
    assign(n: Assignment): ASTNode {
      const value = this.evaluate(n.value);
      this.environment.assign(n.name, value);
      return value;
    }
    /* -------------------------------------------------------------------------- */
    /* § Interpret Matrix                                                         */
    /* -------------------------------------------------------------------------- */
    matrix(n: Matrix): ASTNode {
      return n;
    }
    /* -------------------------------------------------------------------------- */
    /* § Interpret Chars (string)                                                 */
    /* -------------------------------------------------------------------------- */
    chars(n: Chars): ASTNode {
      return n;
    }
    /* -------------------------------------------------------------------------- */
    /* § Intepret Null                                                            */
    /* -------------------------------------------------------------------------- */
    null(n: Null): ASTNode {
      return n;
    }
    /* -------------------------------------------------------------------------- */
    /* § Interpret Number                                                         */
    /* -------------------------------------------------------------------------- */
    num(n: Num): ASTNode {
      return n;
    }
    /* -------------------------------------------------------------------------- */
    /* § Interpret Symbol                                                         */
    /* -------------------------------------------------------------------------- */
    sym(node: Sym): ASTNode {
      const v = this.environment.lookup(node.value);
      if (v === null) return node;
      return v;
    }
    /* -------------------------------------------------------------------------- */
    /* § Interpret Conditional                                                    */
    /* -------------------------------------------------------------------------- */
    cond(n: CondExpr): ASTNode {
      const test = this.evaluate(n.condition);
      if (test.isNum() && test.raw > 0) {
        return this.evaluate(n.consequent);
      }
      return this.evaluate(n.alternate);
    }
    /* -------------------------------------------------------------------------- */
    /* § Interpret Function Declaration                                           */
    /* -------------------------------------------------------------------------- */
    funDeclaration(node: FunDeclaration): ASTNode {
      const { name } = node;
      this.environment.declare(name, node);
      return ast.nil;
    }
    /* -------------------------------------------------------------------------- */
    /* § Interpret Tuple                                                          */
    /* -------------------------------------------------------------------------- */
    tuple(n: Tuple): ASTNode {
      return n;
    }
    /* -------------------------------------------------------------------------- */
    /* § Interpret Block                                                          */
    /* -------------------------------------------------------------------------- */
    block(node: Block): ASTNode {
      return this.executeBlock(node.body, new Environment(this.environment));
    }
    private executeBlock(statements: ASTNode[], environment: Environment) {
      const previous = this.environment;
      this.environment = environment;
      let result: ASTNode = ast.nil;
      for (let i = 0; i < statements.length; i++) {
        result = this.evaluate(statements[i]);
      }
      this.environment = previous;
      return result;
    }
    /* -------------------------------------------------------------------------- */
    /* § Interpret Vector                                                         */
    /* -------------------------------------------------------------------------- */
    vector(n: Vector): ASTNode {
      return n;
    }
    /* -------------------------------------------------------------------------- */
    /* § Interpret Unary Expression                                               */
    /* -------------------------------------------------------------------------- */
    unaryExpr(n: UnaryExpr): ASTNode {
      return n;
    }
    private isSymFrac(n: ASTNode) {
      return n.isBinex() &&
        n.op === "/" &&
        n.left.isSymbol() &&
        n.right.isSymbol();
    }
    /* -------------------------------------------------------------------------- */
    /* § Interpret Binary Expression                                              */
    /* -------------------------------------------------------------------------- */
    binaryExpr(n: BinaryExpr): ASTNode {
      const left = this.evaluate(n.left);
      const right = this.evaluate(n.right);
      if (left.isMatrix() && right.isMatrix()) {
        switch (n.op) {
          case "+":
            return left.add(right);
        }
      }
      if (n.op === "to") {
        const prefix1Right = this.isSymFrac(right) || right.isSymbol();
        let L = this.stringify(left);
        let R = this.stringify(right);
        if (prefix1Right) R = "1" + R;
        log([L, R]);
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
          case "%":
          case "rem":
            return left.rem(right);
          case "//":
            return left.div(right);
          case "mod":
            return left.mod(right);
          case "and":
            return left.and(right);
          case ">":
            return left.gt(right);
          case ">=":
            return left.gte(right);
          case "<":
            return left.lt(right);
          case "<=":
            return left.lte(right);
          case "=":
            return left.equals(right);
          case "and":
            return left.and(right);
          case "or":
            return left.or(right);
          case "nor":
            return left.nor(right);
          case "xor":
            return left.xor(right);
          case "xnor":
            return left.xnor(right);
          case "nand":
            return left.nand(right);
        }
      }
      return ast.binex(left, n.op, right);
    }
    varDeclaration(node: VarDeclaration): ASTNode {
      const value = this.evaluate(node.value);
      this.environment.declare(node.name, value);
      return value;
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

  /* -------------------------------------------------------------------------- */
  /* § LEXER                                                                    */
  /* -------------------------------------------------------------------------- */
  interface Lexer {
    source: string;
    start: number;
    current: number;
    previousToken: Token;
    currentToken: Token;
    end: number;
    line: number;
    numtype: NUM_TOKEN;
  }
  class Lexer {
    init(source: string) {
      this.source = source;
      this.start = 0;
      this.current = 0;
      this.end = source.length;
      this.previousToken = Token.nil;
      this.currentToken = Token.nil;
      this.line = 1;
      return this;
    }

    private get atEnd() {
      return this.start >= this.end;
    }
    private errorToken(message: string) {
      return new Token(TOKEN.ERROR, message, this.line);
    }
    private token(type: TOKEN, lex?: string) {
      this.previousToken = this.currentToken;
      const lexeme = lex ?? this.source.substring(this.start, this.current);
      const line = this.line;
      const out = new Token(type, lexeme, line);
      this.currentToken = out;
      return out;
    }
    private get peek(): LEXEME {
      return this.source[this.current] as LEXEME;
    }
    private peekNext(by: number = 1): string {
      if (this.atEnd) return "";
      return this.source[this.current + by] as LEXEME;
    }
    private advance() {
      this.current++;
      const out = this.source[this.current - 1] as LEXEME;
      return out;
    }

    private skipWhitespace() {
      while (true) {
        const c = this.peek;
        switch (c) {
          case " ":
          case "\r":
          case "\t":
            this.advance();
            break;
          case "\n":
            this.line += 1;
            this.advance();
            break;
          default:
            return;
        }
      }
    }
    getToken() {
      this.skipWhitespace();
      this.start = this.current;
      if (this.atEnd) return this.token(TOKEN.EOF);
      const c = this.advance();
      if (this.isAlpha(c)) return this.identifier();
      if (this.isDigit(c)) {
        this.numtype = TOKEN.INTEGER;
        return this.number();
      }
      switch (c) {
        case `,`:
          return this.token(TOKEN.COMMA);
        case `(`:
          return this.token(TOKEN.LEFT_PAREN);
        case `)`:
          return this.token(TOKEN.RIGHT_PAREN);
        case `[`:
          return this.token(TOKEN.LEFT_BRACKET);
        case `]`:
          return this.token(TOKEN.RIGHT_BRACKET);
        case `{`:
          return this.token(TOKEN.LEFT_BRACE);
        case `}`:
          return this.token(TOKEN.RIGHT_BRACE);
        case `'`:
          return this.token(TOKEN.SINGLE_QUOTE);
        case `;`:
          return this.token(TOKEN.SEMICOLON);
        case `+`:
          return this.token(TOKEN.PLUS);
        case "-":
          if (this.isDigit(this.peek)) {
            this.advance();
            this.numtype = TOKEN.INTEGER;
            return this.number();
          }
          if (this.previousToken.isNumber || this.previousToken.isSymbol) {
            return this.token(TOKEN.MINUS);
          }
          return this.token(TOKEN.UNARY_MINUS);
        case "?":
          return this.token(TOKEN.EROTEME);
        case ":":
          return this.token(this.match("=") ? TOKEN.ASSIGN : TOKEN.COLON);
        case "&":
          return this.token(TOKEN.AMP);
        case "*":
          return this.token(TOKEN.STAR);
        case "/":
          return this.token(this.match("/") ? TOKEN.DIV : TOKEN.SLASH);
        case "%":
          return this.token(TOKEN.PERCENT);
        case "~":
          return this.token(TOKEN.TILDE);
        case "|":
          return this.token(TOKEN.VBAR);
        case ".":
          return this.token(TOKEN.DOT);
        case "^":
          return this.token(TOKEN.CARET);
        case "!":
          return this.token(this.match("=") ? TOKEN.NEQ : TOKEN.BANG);
        case "=":
          return this.token(this.match("=") ? TOKEN.DEQUAL : TOKEN.EQUAL);
        case "<":
          return this.token(
            this.match("=")
              ? TOKEN.LTE
              : this.match("<")
              ? TOKEN.LSHIFT
              : TOKEN.LT,
          );
        case ">":
          return this.token(
            this.match("=")
              ? TOKEN.LTE
              : this.match(">")
              ? TOKEN.RSHIFT
              : TOKEN.LT,
          );
        case `"`:
          return this.string;
      }

      return this.errorToken(`unrecognized token: ‘${c}’`);
    }
    private get seesScientific() {
      return (this.peek === "e" || this.peek === "E") &&
        (this.peekNext() === "-" || this.peekNext() === "+" ||
          this.isDigit(this.peekNext()));
    }
    private get stillSeesNumber() {
      return (this.isDigit(this.peekNext())) &&
        (this.peek === "." || this.peek === "/");
    }
    private number() {
      while (this.isDigit(this.peek)) this.advance();
      if (this.prev === "0") {
        if (this.match("b")) return this.binary;
        if (this.match("o")) return this.octal;
        if (this.match("x")) return this.hex;
      }
      if (this.stillSeesNumber) {
        if (this.peek === ".") this.numtype = TOKEN.FLOAT;
        if (this.peek === "/") this.numtype = TOKEN.FRACTION;
        this.advance();
        while (this.isDigit(this.peek)) this.advance();
      }
      if (this.seesScientific) {
        this.advance();
        this.scientific;
      }
      if (
        this.peek === ("i") &&
        (!this.isAlpha(this.peekNext()))
      ) {
        this.advance();
        this.numtype = TOKEN.COMPLEX;
      }
      return this.numberToken;
    }
    get numberToken() {
      return this.token(this.numtype);
    }
    private get scientific() {
      this.advance();
      this.number();
      this.numtype = TOKEN.SCINUM;
      return this.numberToken;
    }
    private get binary() {
      while (this.peek === "0" || this.peek === "1") {
        this.advance();
      }
      this.numtype = TOKEN.BINARY;
      return this.numberToken;
    }
    private get octal() {
      while ("0" <= this.peek && this.peek <= "7") {
        this.advance();
      }
      this.numtype = TOKEN.OCTAL;
      return this.numberToken;
    }
    private get prev() {
      return this.source[this.current - 1];
    }
    private get hex() {
      while (
        (this.peek >= "0" && this.peek <= "9") ||
        (this.peek >= "a" && this.peek <= "f") ||
        (this.peek >= "A" && this.peek <= "F")
      ) {
        this.advance();
      }
      this.numtype = TOKEN.HEX;
      return this.numberToken;
    }
    private isDigit(c: string) {
      return c >= "0" && c <= "9";
    }
    private isAlpha(c: string) {
      return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || (c === "_");
    }
    private identifier() {
      while (this.isAlpha(this.peek) || this.isDigit(this.peek)) this.advance();
      const remaining = this.source.substring(this.start, this.current);
      if (keywords.hasOwnProperty(remaining)) {
        const type = keywords[remaining as Keyword];
        return this.token(type);
      }
      return this.token(TOKEN.SYMBOL);
    }
    private get string() {
      while (this.peek !== `"` && !this.atEnd) {
        if (this.peek === `\n`) this.line += 1;
        this.advance();
      }
      if (this.atEnd) return this.errorToken(`Unterminated string.`);
      this.advance();
      return this.token(TOKEN.STRING, "atom");
    }
    private match(expected: LEXEME) {
      if (this.atEnd) return false;
      if (this.source[this.current] !== expected) return false;
      this.current += 1;
      return true;
    }
    get nextChar() {
      return this.source[this.start + 1];
    }
    get previousChar() {
      return this.source[this.current - 1];
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § ENVIRONMENT                                                              */
  /* -------------------------------------------------------------------------- */
  class Environment {
    values: Map<string, ASTNode>;
    parent?: Environment;
    constructor(parent?: Environment) {
      this.values = new Map();
      this.parent = parent;
    }
    private throwError(message: string) {
      throw new Error(`[Runtime Error]: ${message}.`);
    }
    assign(name: string, value: ASTNode) {
      if (this.values.has(name)) {
        this.values.set(name, value);
      }
      if (this.parent === undefined) {
        this.throwError(`Cannot assign to nonexistent variable ${name}.`);
      }
      this.parent!.assign(name, value);
    }
    /**
     * Adds a new variable to the environment's
     * variable record.
     */
    declare(name: string, value: ASTNode): ASTNode {
      if (this.values.has(name)) {
        this.throwError(`Variable ${name} has been declared.`);
      }
      this.values.set(name, value);
      return value;
    }
    lookup(name: string): ASTNode {
      if (this.values.has(name)) {
        return this.values.get(name)!;
      }
      if (this.parent === undefined) {
        return ast.nil;
      }
      return this.parent!.lookup(name);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § LIBRARY                                                                  */
  /* -------------------------------------------------------------------------- */
  interface FunctionEntry {
    fn: Function;
    arity: number;
    argtype: NODE;
  }
  interface LibraryArgs {
    numericConstants: [string, number][];
    functions: [string, FunctionEntry][];
  }
  interface ExecuteArgs<T> {
    fn: FunctionEntry;
    args: T[];
  }
  class Library {
    numericConstants: Map<string, number>;
    functions: Map<string, FunctionEntry>;
    constructor({ numericConstants, functions }: LibraryArgs) {
      this.numericConstants = new Map(numericConstants);
      this.functions = new Map(functions);
    }
    hasNamedValue(name: string) {
      return this.numericConstants.has(name);
    }
    getFunction(name: string) {
      return this.functions.get(name);
    }
    getNumericConstant(name: string) {
      const result = this.numericConstants.get(name);
      if (result === undefined) {
        throw new Error(`[Library]: No constant named ${name}.`);
      }
      return result;
    }
    hasFunction(name: string) {
      return this.functions.has(name);
    }
    hasNumericConstant(name: string) {
      return this.functions.has(name);
    }
    static execute<T>({ fn, args }: ExecuteArgs<T>) {
      const result = fn.fn.apply(null, args);
      return result;
    }
    addFunction(name: string, def: FunctionEntry) {
      this.functions.set(name, def);
      return this;
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § ABSTRACT: CALC                                                           */
  /* -------------------------------------------------------------------------- */

  const corelib = new Library({
    numericConstants: [
      ["e", Math.E],
      ["PI", Math.PI],
      ["LN2", Math.LN2],
      ["LN10", Math.LN10],
      ["LOG2E", Math.LOG2E],
      ["LOG10E", Math.LOG10E],
      ["SQRT1_2", Math.SQRT1_2],
      ["SQRT2", Math.SQRT2],
    ],
    functions: [
      ["abs", { fn: Math.abs, arity: 1, argtype: NODE.NUMBER }],
      ["acos", { fn: Math.acos, arity: 1, argtype: NODE.NUMBER }],
      ["acosh", { fn: Math.acosh, arity: 1, argtype: NODE.NUMBER }],
      ["asin", { fn: Math.asin, arity: 1, argtype: NODE.NUMBER }],
      ["asinh", { fn: Math.asinh, arity: 1, argtype: NODE.NUMBER }],
      ["atan", { fn: Math.atan, arity: 1, argtype: NODE.NUMBER }],
      ["atanh", { fn: Math.atanh, arity: 1, argtype: NODE.NUMBER }],
      ["atan2", { fn: Math.atan2, arity: 1, argtype: NODE.NUMBER }],
      ["cbrt", { fn: Math.cbrt, arity: 1, argtype: NODE.NUMBER }],
      ["ceil", { fn: Math.ceil, arity: 1, argtype: NODE.NUMBER }],
      ["clz32", { fn: Math.clz32, arity: 1, argtype: NODE.NUMBER }],
      ["cos", { fn: Math.cos, arity: 1, argtype: NODE.NUMBER }],
      ["cosh", { fn: Math.cosh, arity: 1, argtype: NODE.NUMBER }],
      ["exp", { fn: Math.exp, arity: 1, argtype: NODE.NUMBER }],
      ["expm1", { fn: Math.expm1, arity: 1, argtype: NODE.NUMBER }],
      ["floor", { fn: Math.floor, arity: 1, argtype: NODE.NUMBER }],
      ["fround", { fn: Math.fround, arity: 1, argtype: NODE.NUMBER }],
      ["gcd", { fn: algom.GCD, arity: 2, argtype: NODE.NUMBER }],
      ["hypot", { fn: Math.hypot, arity: 150, argtype: NODE.NUMBER }],
      ["imul", { fn: Math.imul, arity: 2, argtype: NODE.NUMBER }],
      ["log", { fn: Math.log, arity: 1, argtype: NODE.NUMBER }],
      ["ln", { fn: Math.log, arity: 1, argtype: NODE.NUMBER }],
      ["log1p", { fn: Math.log1p, arity: 1, argtype: NODE.NUMBER }],
      ["log10", { fn: Math.log10, arity: 1, argtype: NODE.NUMBER }],
      ["log2", { fn: Math.log2, arity: 1, argtype: NODE.NUMBER }],
      ["lg", { fn: Math.log2, arity: 1, argtype: NODE.NUMBER }],
      ["max", { fn: Math.max, arity: 150, argtype: NODE.NUMBER }],
      ["min", { fn: Math.min, arity: 150, argtype: NODE.NUMBER }],
      ["pow", { fn: Math.pow, arity: 2, argtype: NODE.NUMBER }],
      ["random", { fn: Math.random, arity: 0, argtype: NODE.NUMBER }],
      ["round", { fn: Math.round, arity: 1, argtype: NODE.NUMBER }],
      ["sign", { fn: Math.sign, arity: 1, argtype: NODE.NUMBER }],
      ["sin", { fn: Math.sin, arity: 1, argtype: NODE.NUMBER }],
      ["sinh", { fn: Math.sinh, arity: 1, argtype: NODE.NUMBER }],
      ["sqrt", { fn: Math.sqrt, arity: 1, argtype: NODE.NUMBER }],
      ["tan", { fn: Math.tan, arity: 1, argtype: NODE.NUMBER }],
      ["tanh", { fn: Math.tanh, arity: 1, argtype: NODE.NUMBER }],
      ["trunc", { fn: Math.trunc, arity: 1, argtype: NODE.NUMBER }],
      ["even", { fn: algom.even, arity: 1, argtype: NODE.NUMBER }],
      ["odd", { fn: algom.odd, arity: 1, argtype: NODE.NUMBER }],
    ],
  });

  /* -------------------------------------------------------------------------- */
  /* § PARSER                                                                   */
  /* -------------------------------------------------------------------------- */
  interface Parser {
    /**
     * An error message indicating an
     * error during the parse. If
     * no error occurred, the field
     * is the empty string.
     */
    error: string | null;
    /**
     * The result of the parsing
     * is an array of ASTs.
     * If only one statement (an expression
     * terminated by a semicolon) is entered,
     * the result will have a length of 1.
     */
    result: Root;
    /**
     * Parses the input source, returning
     * an ASTNode. The parse result
     * is accessible via the result property.
     * If an error occurred during the parse,
     * the result property will contain an
     * error astnode.
     */
    parse(source: string): this;
  }
  class Parser {
    token: Token = Token.nil;
    lastToken: Token = Token.nil;
    private lastNode: ASTNode = ast.nil;
    private scanner: Lexer = new Lexer();
    private idx: number = 1;
    private funcNames: Set<string> = new Set();
    private source: string = "";
    constructor() {
      this.error = null;
    }
    static build(op: string, params: string[]) {
      const input = Parser.make(op, params);
      const p = new Parser();
      return p.parse(input);
    }

    static make(op: string, params: string[]) {
      let input = "";
      let args = params.map((s) => s.length > 0 ? `(${s})` : s);
      if (/^[a-zA-Z]/.test(op)) {
        input = `${op}(${args.join(", ")})`;
      }
      input = args.join(` ${op} `);
      return input;
    }

    /* -------------------------------------------------------------------------- */
    /* § Parse                                                                    */
    /* -------------------------------------------------------------------------- */
    /**
     * Initializes the input source string
     * for scanning.
     */
    private init(source: string) {
      this.source = source;
      this.scanner.init(source);
      this.token = this.scanner.getToken();
    }
    public parse(source: string) {
      this.init(source);
      const result = this.stmntList();
      if (this.error !== null) {
        this.result = ast.root(this.error);
      } else {
        this.result = ast.root(result);
      }
      return this;
    }

    private stmntList() {
      const statements: ASTNode[] = [this.stmnt()];
      while (!this.token.isEOF) {
        statements.push(this.stmnt());
      }
      return statements;
    }

    private stmnt() {
      switch (true) {
        case this.match([TOKEN.IF]):
          return this.conditional();
        case this.match([TOKEN.LET]):
          return this.variableDeclaration();
        case this.match([TOKEN.LEFT_BRACE]):
          return this.block();
        default:
          return this.exprStmt();
      }
    }

    evaluate(n: ASTNode) {
      const i = new Interpreter();
      return n.accept(i);
    }

    private conditional() {
      this.eat(TOKEN.LEFT_PAREN, this.expected("("));
      const test = this.expression();
      this.eat(TOKEN.RIGHT_PAREN, this.expected(")"));
      const consequent: ASTNode = this.stmnt();
      const alternate: ASTNode = this.match([TOKEN.ELSE])
        ? this.stmnt()
        : ast.nil;
      return ast.cond(test, consequent, alternate);
    }

    private block() {
      const statements: ASTNode[] = [];
      while (!this.check(TOKEN.RIGHT_BRACE) && !this.token.isEOF) {
        statements.push(this.stmnt());
      }
      this.eat(TOKEN.RIGHT_BRACE, this.expected("}"));
      return ast.block(statements);
    }

    private variableDeclaration() {
      const name = this.eat(
        TOKEN.SYMBOL,
        this.expected("variable-name"),
      );
      let init: ASTNode = ast.nil;
      if (this.match([TOKEN.LEFT_PAREN])) {
        return this.functionDeclaration(name);
      }
      if (this.match([TOKEN.ASSIGN])) init = this.expression();
      this.eat(TOKEN.SEMICOLON, this.expected(";"));
      return ast.varDeclaration(name, init);
    }

    private functionDeclaration(name: string) {
      this.funcNames.add(name);
      let params: Sym[] = [];
      if (!this.check(TOKEN.RIGHT_PAREN)) {
        do {
          const n = this.eat(TOKEN.SYMBOL, "Expected symbol.");
          params.push(ast.symbol(n, SYMBOL.VARIABLE));
        } while (this.match([TOKEN.COMMA]));
        this.eat(TOKEN.RIGHT_PAREN, this.expected(")"));
      } else this.eat(TOKEN.RIGHT_PAREN, this.expected(")"));
      this.eat(TOKEN.ASSIGN, this.expected(":="));
      const body: ASTNode = this.match([TOKEN.LEFT_BRACE])
        ? this.stmnt()
        : this.exprStmt();
      return ast.funDeclaration(name, params, body);
    }

    private exprStmt() {
      const expr = this.expression();
      (this.source[this.idx]) &&
        this.eat(TOKEN.SEMICOLON, this.expected(";"));
      return expr;
    }

    private lit(node: (lexeme: string) => ASTNode) {
      const previousToken = this.advance();
      let newnode = node(previousToken.lexeme);
      if (newnode.isNum() && this.token.isSymbol) {
        if (this.isVariableName(this.token.lexeme)) {
          const sym = this.advance();
          let rhs = ast.symbol(sym.lexeme, SYMBOL.VARIABLE);
          newnode = ast.binex(newnode, "*", rhs);
        }
        if (corelib.hasFunction(this.token.lexeme)) {
          const sym = this.advance();
          const s = ast.symbol(sym.lexeme, SYMBOL.VARIABLE);
          let rhs = this.callexpr(s);
          newnode = ast.binex(newnode, "*", rhs);
        }
      }
      if (this.token.isLeftParen) {
        const rhs = this.parend();
        newnode = ast.binex(newnode, "*", rhs);
      }
      this.lastNode = newnode;
      return newnode;
    }

    private expression(minbp = PREC.NONE) {
      if (minbp === PREC.APEX) return ast.nil;
      let lhs: ASTNode = ast.nil;
      switch (true) {
        case this.token.isAtomic:
          lhs = this.literal();
          break;
        case this.token.isLeftParen:
          lhs = this.parend();
          if (this.token.isLeftParen && !this.lastNode.isCallExpr()) {
            const rhs = this.parend();
            lhs = ast.binex(lhs, "*", rhs);
          }
          break;
        case this.token.isLeftBracket:
          lhs = this.array();
          break;
        case this.token.isVbar:
          lhs = this.absoluteValue();
          break;
      }
      while (this.token.isOperable) {
        const op = this.token;
        let rhs: ASTNode = ast.nil;
        if (op.isEOF) break;
        if (!op.isOperator) this.expectedOp();
        if (op.isPrefix||op.isPostfix) {
          if (op.bp < minbp) break;
          this.advance();
          rhs = this.expression(op.bp);
          lhs = this.makeExpr(lhs, op.lexeme, rhs);
          continue;
        }
        if (op.bp < minbp) break;
        this.advance();
        rhs = this.expression(op.bp);
        lhs = this.makeExpr(lhs, op.lexeme, rhs);
      }
      return lhs;
    }

    private makeExpr(lhs: ASTNode, operator: string, rhs: ASTNode) {
      let expr: ASTNode = ast.nil;
      switch (true) {
        case (!lhs.isNull() && !rhs.isNull()):
          expr = ast.binex(lhs, operator, rhs);
          break;
        case (!lhs.isNull() && rhs.isNull()):
          expr = ast.unex(operator, lhs);
          break;
        case (lhs.isNull() && !rhs.isNull()):
          expr = ast.unex(operator, rhs);
          break;
      }
      this.lastNode = expr;
      return expr;
    }

    private literal() {
      switch (this.token.type) {
        case TOKEN.SYMBOL:
          return this.id();
        case TOKEN.INTEGER:
          return this.lit((lexeme) => ast.int(lexeme));
        case TOKEN.FLOAT:
          return this.lit((lexeme) => ast.float(lexeme));
        case TOKEN.OCTAL:
          return this.lit((lexeme) => ast.int(lexeme, 8));
        case TOKEN.HEX:
          return this.lit((lexeme) => ast.int(lexeme, 16));
        case TOKEN.BINARY:
          return this.lit((lexeme) => ast.int(lexeme, 2));
        case TOKEN.FRACTION:
          return this.lit((lexeme) => ast.fraction(lexeme));
        case TOKEN.SCINUM:
          const prevToken = this.advance();
          return this.expand(prevToken.lexeme);
        case TOKEN.TRUE:
          return this.lit(() => ast.TRUE);
        case TOKEN.FALSE:
          return this.lit(() => ast.FALSE);
        case TOKEN.STRING:
          return this.lit((lexeme) => ast.string(lexeme));
        case TOKEN.NULL:
          return this.lit(() => ast.nil);
        case TOKEN.COMPLEX:
          throw new Error("complex unimplemented");
        default:
          this.panic();
          return ast.nil;
      }
    }

    private absoluteValue() {
      this.eat(TOKEN.VBAR, this.expected("|"));
      const expr = this.expression(PREC.NONE);
      this.eat(TOKEN.VBAR, this.expected("|"));
      return ast.callExpr("abs", [expr], corelib.getFunction("abs"));
    }

    private parend(): ASTNode {
      this.eat(TOKEN.LEFT_PAREN, this.expected("("));
      const expr = this.expression(PREC.NONE);
      if (this.match([TOKEN.COMMA])) {
        let elements = [expr];
        do {
          elements.push(this.expression());
        } while (this.match([TOKEN.COMMA]));
        this.eat(TOKEN.RIGHT_PAREN, this.expected(")"));
        return ast.tuple(elements);
      } else this.eat(TOKEN.RIGHT_PAREN, this.expected(")"));
      return expr;
    }

    private expectedOp() {
      const lexeme = this.token.lexeme;
      const message = `Expected operator, got [${lexeme}]`;
      throw new Error(message);
    }

    private isVariableName(name: string) {
      return (!this.funcNames.has(name) && !corelib.hasFunction(name)) ||
        corelib.hasNamedValue(name);
    }

    private id(): ASTNode {
      const name = this.eat(TOKEN.SYMBOL, this.expected("id"));
      let node = ast.symbol(name, SYMBOL.VARIABLE);
      if (this.check(TOKEN.LEFT_PAREN)) {
        return this.callexpr(node);
      }
      if (this.match([TOKEN.ASSIGN])) {
        const value = this.expression();
        return ast.assign(name, value);
      }
      return node;
    }

    private callexpr(node: Sym): ASTNode {
      if (this.isVariableName(node.value)) {
        let rhs = this.parend();
        return ast.binex(node, "*", rhs);
      }
      this.eat(TOKEN.LEFT_PAREN, this.expected("("));
      let params: ASTNode[] = [];
      if (!this.check(TOKEN.RIGHT_PAREN)) {
        do {
          let param = this.expression();
          params.push(param);
        } while (this.match([TOKEN.COMMA]));
        this.eat(TOKEN.RIGHT_PAREN, this.expected(")"));
      } else this.eat(TOKEN.RIGHT_PAREN, this.expected(")"));
      return ast.callExpr(node.value, params, corelib.getFunction(node.value));
    }

    private array() {
      let builder: "matrix" | "vector" = "vector";
      let elements: ASTNode[] = [];
      this.eat(TOKEN.LEFT_BRACKET, this.expected("["));
      let element = this.expression();
      let rows = 0;
      let cols = 0;
      if (element instanceof Vector) {
        cols = element.len;
        rows += 1;
        builder = "matrix";
      }
      elements.push(element);
      while (this.match([TOKEN.COMMA])) {
        let expr = this.expression();
        if (builder === "matrix" && (!expr.isVector())) {
          throw new Error("Matrices must only have vector elements.");
        }
        if (expr instanceof Vector) {
          builder = "matrix";
          rows += 1;
          if (cols !== expr.len) this.croak("No jagged arrays permitted");
        }
        elements.push(expr);
      }
      this.eat(TOKEN.RIGHT_BRACKET, this.expected("]"));
      return builder === "matrix"
        ? ast.matrix(elements as Vector[], rows, cols)
        : ast.vector(elements);
    }

    /**
     * Sets the parser's error property.
     * If the error property is set, then the parser
     * will return an error node.
     */
    private croak(message: string) {
      message = `Line[${this.token.line}]: ${message}`;
      this.error = message;
      throw new Error(message);
    }

    /** Returns an expected error string. */
    private expected(s: string) {
      return `Expected ${s}`;
    }
    /**
     * Special handling for scientific numbers.
     * To simplify the type system, we convert
     * these numbers into a compound expression `a^b`,
     * where `a` is a `float` or `integer`.
     */
    private expand(lexeme: string) {
      const [a, b] = algom.split(lexeme, "e");
      const left = algom.is.integer(a) ? ast.int(a) : ast.float(a);
      const right = algom.is.integer(b) ? ast.int(b) : ast.float(b);
      return ast.binex(left, "^", right);
    }

    /**
     * Returns true if any of the supplied
     * token types matches. False otherwise.
     * If a match is found, the next token
     * is requested from the lexer.
     */
    private match(tokenTypes: TOKEN[]) {
      for (let i = 0; i < tokenTypes.length; i++) {
        const tokentype = tokenTypes[i];
        if (this.check(tokentype)) {
          this.advance();
          return true;
        }
      }
      return false;
    }

    private check(type: TOKEN) {
      if (type === TOKEN.EOF) return false;
      return this.token.type === type;
    }

    eval() {
      const n = new Interpreter();
      const out = this.result.accept(n);
      return n.stringify(out);
    }

    toString(out: ASTNode = this.result) {
      const s = new ToString();
      return out.accept(s);
    }

    get ast() {
      return this.tree("ast");
    }

    tree(format: "ast" | "s-expression" = "ast") {
      if (format === "s-expression") {
        const prefix = new ToPrefix();
        return this.result.accept(prefix);
      }
      return Parser.treeString(this.result, (node) => {
        if (node instanceof ASTNode) node.kind = node.nkind as any;
      });
    }

    private panic() {
      const line = this.token.line;
      const lexeme = this.token.lexeme;
      const typename = this.token.typename;
      const plexeme = this.lastToken.lexeme;
      const ptypename = this.lastToken.typename;
      const lastNode = this.lastNode.nkind;
      const line0 = `Parsing Error: Unexpected token.\n`;
      const line1 = `\tToken: ${typename}[${lexeme}]\n`;
      const line2 = `\tLine: ${line}\n`;
      const line3 = `\tLast token: ${ptypename}[${plexeme}]\n`;
      const line4 = `\tLast node parsed: ${lastNode}`;
      const message = line0 + line1 + line2 + line3 + line4;
      throw new Error(message);
    }

    private eat(tokenType: TOKEN, message: string) {
      const token = this.token;
      if (token.type === TOKEN.EOF) {
        this.croak(`${message} at end.`);
      }
      if (token.type === TOKEN.ERROR || token.type !== tokenType) {
        this.croak(`${message}, got ${token.lexeme}`);
      }
      this.advance();
      return token.lexeme;
    }
    private advance() {
      this.lastToken = this.token;
      this.token = this.scanner.getToken();
      this.idx = this.scanner.current;
      return this.lastToken;
    }
    /* -------------------------------------------------------------------------- */
    /* § Tokenize                                                                 */
    /* -------------------------------------------------------------------------- */
    /**
     * Generates an array of tokens from
     * the input source. This method isn't
     * used by the parser, but is useful
     * for debugging expressions. The
     * result property always has at least
     * one ASTNode. By default, it contains
     * the empty astnode, an object with the shape:
     * ~~~
     * {value: 'null', kind: 'null' }
     * ~~~
     * Note that the value is a string `'null'`,
     * not the literal `null`. If an error
     * occurred during parsing, then the result
     * field contains a single error astnode:
     * ~~~
     * {value: [error-message], kind: 'error' }
     * ~~~
     * where [error-message] is a string.
     */
    static tokenize(source: string): TokenStream {
      let out: Token[] = [];
      const lexer = new Lexer();
      lexer.init(source);
      while (true) {
        const token = lexer.getToken();
        out.push(token);
        if (token.type === TOKEN.EOF) break;
      }
      return new TokenStream(out);
    }

    static treeString<T extends Object>(Obj: T, cbfn?: (node: any) => void) {
      const prefix = (key: keyof T, last: boolean) => {
        let str = last ? "└" : "├";
        if (key) str += "─ ";
        else str += "──┐";
        return str;
      };
      const getKeys = (obj: T) => {
        const keys: (keyof T)[] = [];
        for (const branch in obj) {
          if (!hasProp(obj, branch) || is.func(obj[branch])) continue;
          keys.push(branch);
        }
        return keys;
      };
      const grow = (
        key: keyof T,
        root: any,
        last: boolean,
        prevstack: ([T, boolean])[],
        cb: (str: string) => any,
      ) => {
        cbfn && cbfn(root);
        let line = "";
        let index = 0;
        let lastKey = false;
        let circ = false;
        let stack = prevstack.slice(0);
        if (stack.push([root, last]) && stack.length > 0) {
          prevstack.forEach(function (lastState, idx) {
            if (idx > 0) line += (lastState[1] ? " " : "│") + "  ";
            if (!circ && lastState[0] === root) circ = true;
          });
          line += prefix(key, last) + key.toString();
          if (!is.obj(root)) line += ": " + root;
          circ && (line += " (circular ref.)");
          cb(line);
        }
        if (!circ && is.obj(root)) {
          const keys = getKeys(root);
          keys.forEach((branch) => {
            lastKey = ++index === keys.length;
            grow(branch, root[branch], lastKey, stack, cb);
          });
        }
      };
      let output = "";
      const obj = Object.assign({}, Obj);
      grow(
        "." as keyof T,
        obj,
        false,
        [],
        (line: string) => (output += line + "\n"),
      );
      return output;
    }
  }
  export const parser = new Parser();
  export function parse(input: string) {
    return parser.parse(input);
  }
  export function valof(input: string) {
    return parser.parse(input).eval();
  }
}
/* -------------------------------------------------------------------------- */
/* § Live Testing                                                             */
/* -------------------------------------------------------------------------- */

const expr = `4! + 2`;
const res = algom.parse(expr).ast;
log(res);
