import { ToString } from "../ToString";
import { NODE } from "../structs/enums";
import { functions, symbols } from "../structs/latex";
import { List } from "../structs/list";
import { NUM, Num } from "./num.js";
import { getFrac } from "../structs/mathfn";

export abstract class ASTNode {
  kind: NODE;
  constructor(kind: NODE) {
    this.kind = kind;
  }
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

export interface Visitor<T> {
  chars(n: Chars): T;
  group(n: Group): T;
  null(n: Null): T;
  num(n: Num): T;
  sym(n: Sym): T;
  tuple(n: Tuple): T;
  block(n: Block): T;
  vector(n: Vector): T;
  matrix(n: Matrix): T;
  unaryExpr(n: UnaryExpr): T;
  callExpr(n: CallExpr): T;
  binaryExpr(n: BinaryExpr): T;
  varDeclaration(n: VarDeclaration): T;
  funDeclaration(n: FunDeclaration): T;
  root(n: Root): T;
  cond(n: CondExpr): T;
  assign(n: Assignment): T;
  bool(n: Bool): T;
  error(n: Errnode): T;
}

export class Root extends ASTNode {
  root: ASTNode[];
  error: boolean;
  constructor(root: ASTNode[]) {
    super(NODE.ROOT);
    this.root = root;
    this.error = false;
  }
  accept<T>(n: Visitor<T>): T {
    return n.root(this);
  }
}

export class UnaryExpr extends ASTNode {
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
  accept<T>(n: Visitor<T>): T {
    return n.varDeclaration(this);
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

export class Assignment extends ASTNode {
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
  accept<T>(n: Visitor<T>): T {
    return n.binaryExpr(this);
  }
}

export class Block extends ASTNode {
  body: ASTNode[];
  constructor(body: ASTNode[]) {
    super(NODE.BLOCK);
    this.body = body;
  }
  accept<T>(n: Visitor<T>): T {
    return n.block(this);
  }
}

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
  accept<T>(v: Visitor<T>) {
    return v.cond(this);
  }
}

export class Null extends ASTNode {
  value: string;
  constructor(value: string = "null") {
    super(NODE.NULL);
    this.value = value;
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

export enum SYMBOL {
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
  static of(list: List<ASTNode>) {
    return new Tuple(list);
  }
  accept<T>(n: Visitor<T>): T {
    return n.tuple(this);
  }
}

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
  static isCallExpr(node: any): node is CallExpr {
    return node instanceof CallExpr;
  }

  static isUnex(node: any): node is UnaryExpr {
    return node instanceof UnaryExpr;
  }

  static isBinex(node: any): node is BinaryExpr {
    return node instanceof BinaryExpr;
  }
  static placeHolder(str: string) {
    return new Null(str);
  }
}
