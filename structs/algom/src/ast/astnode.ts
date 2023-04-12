import { List } from "../structs/list.js";
import { getFrac } from "../structs/mathfn.js";
import { ASTNode } from "./base.js";
import { Root } from "./RootNode.js";
import { BlockNode } from "./BlockNode.js";
import { IfElseNode } from "./CondNode.js";
import { WhileNode } from "./WhileNode.js";
import { UnaryExprNode } from "./UnaryExprNode.js";
import { VarDeclareNode } from "./VarDeclareNode.js";
import { AssignmentNode } from "./VarAssignNode.js";
import { BinaryExprNode } from "./BinaryExprNode.js";
import { VectorNode } from "./VectorNode.js";
import { CallNode } from "./CallNode.js";
import { NullNode } from "./NullNode.js";
import { BoolNode } from "./BoolNode.js";
import { SymbolNode } from "./SymbolNode.js";
import { StringNode } from "./StringNode.js";
import { ErrorNode } from "./ErrNode.js";
import { FunctionNode } from "./FunctionNode.js";
import { GroupNode } from "./GroupNode.js";
import { MatrixNode } from "./MatrixNode.js";
import { TupleNode } from "./TupleNode.js";
import { float, frac, int, Integer, Rational, Real } from "./Numerics.js";

export type Atom =
  | StringNode
  | NullNode
  | Rational
  | Real
  | Integer
  | SymbolNode
  | BoolNode;

export interface Visitor<T> {
  chars(node: StringNode): T;
  null(node: NullNode): T;
  sym(node: SymbolNode): T;
  bool(node: BoolNode): T;
  group(node: GroupNode): T;
  tuple(node: TupleNode): T;
  block(node: BlockNode): T;
  vector(node: VectorNode): T;
  matrix(node: MatrixNode): T;
  unaryExpr(node: UnaryExprNode): T;
  callExpr(node: CallNode): T;
  binaryExpr(node: BinaryExprNode): T;
  varDeclaration(node: VarDeclareNode): T;
  funDeclaration(node: FunctionNode): T;
  root(node: Root): T;
  cond(node: IfElseNode): T;
  assign(node: AssignmentNode): T;
  error(node: ErrorNode): T;
  whileStmnt(node: WhileNode): T;
  int(node: Integer): T;
  real(node: Real): T;
  frac(node: Rational): T;
}

export class ast {
  static int(v: string, base?: number) {
    if (base) {
      return int(Number.parseInt(v, base));
    }
    return int((v as any) * 1);
  }
  static redeclareError(name: string) {
    return new ErrorNode(
      `[Resolver]: Name “${name}” already declared, redeclaration prohibited.`,
    );
  }
  static argsErr(callee: string, expected: number, actual: number) {
    const a1 = expected === 0 ? "no" : `${expected}`;
    const a2 = expected === 1 ? " argument," : " arguments,";
    const a12 = a1 + a2;
    const fName = "Function " + "“" + callee + "”";
    return new ErrorNode(
      `${fName} requires ${a12} but ${actual} were passed.`,
    );
  }
  static resError(message: string) {
    return new ErrorNode(`[Resolver]: ${message}`);
  }
  static typeError(message: string) {
    return new ErrorNode(`[Typechecker]: ${message}`);
  }
  static group(astnode: ASTNode) {
    return new GroupNode(astnode);
  }
  static error(message: string) {
    return new ErrorNode(message);
  }
  static bool(value: boolean) {
    return new BoolNode(value);
  }
  static float(v: string) {
    return float((v as any) * 1);
  }
  static callExpr(fn: string, args: ASTNode[], native?: Function) {
    return new CallNode(fn, args, native);
  }
  static assign(name: string, value: ASTNode) {
    return new AssignmentNode(name, value);
  }
  static complex(v: string) {
    throw new Error("Complex unimplemented");
  }
  static cond(test: ASTNode, consequent: ASTNode, alternate: ASTNode) {
    return new IfElseNode(test, consequent, alternate);
  }
  static fraction(s: string) {
    const [a, b] = getFrac(s);
    return frac(a, b);
  }
  static string(s: string) {
    return new StringNode(s);
  }
  static nil = new NullNode();
  static symbol(s: string, isStatic = false) {
    return new SymbolNode(s, isStatic);
  }
  static algebra2(left: ASTNode, op: string, right: ASTNode) {
    return new BinaryExprNode(left, op, right);
  }
  static matrix(matrix: VectorNode[], rows: number, columns: number) {
    return new MatrixNode(matrix, rows, columns);
  }
  static vector(elements: ASTNode[]) {
    return new VectorNode(elements);
  }
  static binex(left: ASTNode, op: string, right: ASTNode) {
    return new BinaryExprNode(left, op, right);
  }
  static algebra1(op: string, arg: ASTNode) {
    return new UnaryExprNode(op, arg);
  }
  static unex(op: string, arg: ASTNode) {
    return new UnaryExprNode(op, arg);
  }
  static tuple(elements: List<ASTNode>) {
    return new TupleNode(elements);
  }
  static block(elements: ASTNode[]) {
    return new BlockNode(elements);
  }
  static varDeclaration(name: string, value: ASTNode, line: number) {
    return new VarDeclareNode(name, value, line);
  }
  static funDeclaration(name: string, params: SymbolNode[], body: ASTNode) {
    return new FunctionNode(name, params, body);
  }
  static root(elements: ASTNode[] | string) {
    return typeof elements === "string"
      ? new Root([new StringNode(elements)])
      : new Root(elements);
  }
  static whileStmt(condition: ASTNode, body: ASTNode) {
    return new WhileNode(condition, body);
  }
  static isCallExpr(node: any): node is CallNode {
    return node instanceof CallNode;
  }
  static isUnex(node: any): node is UnaryExprNode {
    return node instanceof UnaryExprNode;
  }
  static isBinex(node: any): node is BinaryExprNode {
    return node instanceof BinaryExprNode;
  }
  static unknown(str: string) {
    return new SymbolNode(str, true);
  }
}

class box<t> {
  v: t;
  constructor(v: t) {
    this.v = v;
  }
  map<j>(f: (x: t) => j) {
    const val = f(this.value);
    return new box(() => val);
  }
  get value() {
    return this.v;
  }
}
