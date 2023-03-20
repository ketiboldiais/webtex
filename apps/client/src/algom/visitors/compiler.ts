import { Fn } from "../fn.js";
import {
  Assignment,
  ASTNode,
  BinaryExpr,
  Block,
  Bool,
  CallExpr,
  Chars,
  CondExpr,
  Errnode,
  FunDeclaration,
  Group,
  Matrix,
  Num,
  Root,
  Sym,
  Tuple,
  UnaryExpr,
  VarDeclaration,
  Vector,
  WhileNode,
  Visitor,
} from "../astnode.js";
import { corelib, Scope } from "../scope.js";

type RuntimeValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | number[]
  | boolean[]
  | null[]
  | void
  | RuntimeValue[]
  | Fn
  | Runtimeval;

export class Compile implements Visitor<RuntimeValue> {
  scope: Scope;
  err: string;
  constructor(scope = new Scope()) {
    this.scope = scope;
    this.err = "";
  }

  setScope(scope: Scope) {
    this.scope = scope;
  }
  
  whileStmnt(node: WhileNode): RuntimeValue {
    let result:RuntimeValue = null;
    while (this.execute(node.condition)) {
      result = this.execute(node.body);
    }
    return result;
  }

  group(n: Group): any {
    return this.execute(n.expression);
  }
  interpret(nodes: ASTNode[]) {
    for (let i = 0; i < nodes.length; i++) {
      this.execute(nodes[i]);
    }
  }
  execute(n: ASTNode) {
    return n.accept(this);
  }
  bool(n: Bool): boolean {
    return n.value;
  }
  chars(n: Chars): string {
    return n.value;
  }
  null(): null {
    return null;
  }
  num(n: Num): number {
    return n.raw;
  }
  sym(n: Sym) {
    if (corelib.hasConstant(n.value)) {
      const result = corelib.getNumericConstant(n.value);
      if (result !== undefined) return result;
    }
    let res = this.scope.get(n.value);
    if (res instanceof ASTNode) res = this.execute(res);
    return res;
  }
  error(n: Errnode): string {
    this.err = n.value;
    return n.value;
  }
  tuple(n: Tuple) {
    const elements = n.value.map((node) => this.execute(node));
    const result: RuntimeValue[] = elements.array.map((n) => this.execute(n));
    return result;
  }
  block(n: Block) {
    return this.executeBlock(n.body, this.scope);
  }
  execNodes(statements: ASTNode[], env: Scope): any {
    const previous = this.scope;
    this.scope = env;
    let result = [];
    for (let i = 0; i < statements.length; i++) {
      result.push(this.execute(statements[i]));
    }
    this.scope = previous;
    return result;
  }
  executeBlock(statements: ASTNode[], env: Scope): RuntimeValue {
    const previous = this.scope;
    this.scope = env;
    let result = null;
    for (let i = 0; i < statements.length; i++) {
      result = this.execute(statements[i]);
    }
    this.scope = previous;
    return result;
  }
  vector(n: Vector) {
    const elements: RuntimeValue[] = n.elements.map((node) =>
      this.execute(node)
    );
    return elements;
  }
  matrix(n: Matrix) {
    const matrix: RuntimeValue[][] = n.forall((n) => this.execute(n));
    return matrix;
  }
  unaryExpr(n: UnaryExpr): RuntimeValue {
    const arg = this.execute(n.arg);
    const op = n.op;
    switch (op) {
      case "-":
        return -arg;
      case "!":
        return !arg;
    }
    this.err = `Could not evaluate ${n.op} at runtime.`;
    return null;
  }
  callExpr(n: CallExpr) {
    if (n.callee === "abs" && n.length === 1 && n.args[0].isNum()) {
      return n.args[0].abs;
    }
    const fn = this.scope.get(n.callee);
    let args: RuntimeValue[] = [];
    for (let i = 0; i < n.args.length; i++) {
      args.push(this.execute(n.args[i]));
    }
    if (n.native) {
      return n.native.apply(null, args);
    }
    if (fn instanceof Fn) {
      const res = fn.call(this, args);
      return res;
    }
    this.err = `Could not evaluate function ${n.callee} at runtime.`;
    return null;
  }
  compute(left: number, op: string, right: number) {
    switch (op) {
      case "+":
        return left + right;
      case "-":
        return left - right;
      case "*":
        return left * right;
      case "/":
        return left / right;
      case "^":
        return left ** right;
      case "mod":
        return ((left % right) + left) % right;
      case "%":
      case "rem":
        return left % right;
      case "//":
        return Math.floor(left / right);
      case ">":
        return left > right;
      case ">=":
        return left >= right;
      case "<":
        return left < right;
      case "<=":
        return left <= right;
      case "!=":
        return left !== right;
      default:
        return null;
    }
  }

  logic(left: boolean, op: string, right: boolean) {
    switch (op) {
      case "and":
        return left && right;
      case "or":
        return left || right;
      case "nor":
        return !(left || right);
      case "xor":
        return left !== right;
      case "xnor":
        return left === right;
      case "nand":
        return !(left && right);
      case "==":
      case "=":
        return left === right;
      default:
        return false;
    }
  }

  binaryExpr(n: BinaryExpr): RuntimeValue {
    const left: RuntimeValue = this.execute(n.left);
    const right: RuntimeValue = this.execute(n.right);
    const op = n.op;
    if (typeof left === "number" && typeof right === "number") {
      return this.compute(left, op, right);
    }
    if (typeof left === "boolean" && typeof right === "boolean") {
      return this.logic(left, op, right);
    }
    this.err = `Could not evaluate binary operator ${n.op} at runtime.`;
    return null;
  }
  varDeclaration(node: VarDeclaration): RuntimeValue {
    let value = null;
    if (!node.value.isNull()) {
      value = this.execute(node.value);
    }
    return this.scope.define(node.name, value);
  }

  funDeclaration(node: FunDeclaration): Fn {
    const fn = new Fn(node.name, node.paramlist, node.body);
    this.scope.define(node.name, fn);
    return fn;
  }

  cond(n: CondExpr): RuntimeValue {
    if (this.execute(n.condition)) {
      return this.execute(n.consequent);
    } else return this.execute(n.alternate);
  }
  assign(n: Assignment): RuntimeValue {
    const value = this.execute(n.value);
    this.scope.assign(n.name, value);
    return value;
  }
  root(n: Root): Runtimeval {
    let result = this.scope;
    for (let i = 0; i < n.root.length; i++) {
      result = this.execute(n.root[i]);
    }
    return new Runtimeval(result);
  }
}

export class Runtimeval extends Scope {
  result: any;
  err: null | string;
  constructor(result: any, err: null | string = null) {
    super();
    this.result = result;
    this.err = err;
  }
}
