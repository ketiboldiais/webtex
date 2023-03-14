import { Fn } from "./fn.js";
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
  Root,
  Sym,
  Tuple,
  UnaryExpr,
  VarDeclaration,
  Vector,
  Visitor,
} from "./nodes/node.js";
import { Num } from "./nodes/num.js";
import { corelib, Scope } from "./scope.js";

export class Compile implements Visitor<any> {
  scope: Scope;
  err: string;
  constructor() {
    this.scope = new Scope();
    this.err = "";
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
  bool(n: Bool) {
    return n.value;
  }
  chars(n: Chars) {
    return n.value;
  }
  null() {
    return null;
  }
  num(n: Num) {
    return n.raw;
  }
  sym(n: Sym) {
    if (corelib.hasConstant(n.value)) {
      return corelib.getNumericConstant(n.value);
    }
    const res = this.scope.get(n.value);
    return res;
  }
  error(n: Errnode) {
    this.err = n.value;
    return n.value;
  }
  tuple(n: Tuple) {
    const elements = n.value.map((node) => this.execute(node));
    return elements.array;
  }
  block(n: Block) {
    return this.executeBlock(n.body, this.scope);
  }
  executeBlock(statements: ASTNode[], env: Scope): any {
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
    const elements: any[] = n.elements.map((node) => this.execute(node));
    return elements;
  }
  matrix(n: Matrix) {
    const matrix: any = n.forall((n) => this.execute(n));
    return matrix;
  }
  unaryExpr(n: UnaryExpr): any {
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
    let args: any[] = [];
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
  binaryExpr(n: BinaryExpr) {
    const left: any = this.execute(n.left);
    const right: any = this.execute(n.right);
    const op = n.op;
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
    }
    this.err = `Could not evaluate binary operator ${n.op} at runtime.`;
  }
  varDeclaration(node: VarDeclaration): any {
    let value = null;
    if (!node.value.isNull()) {
      value = this.execute(node.value);
    }
    return this.scope.define(node.name, value);
  }
  funDeclaration(node: FunDeclaration) {
    const fn = new Fn(node.name, node.paramlist, node.body);
    this.scope.define(node.name, fn);
    return fn;
  }

  cond(n: CondExpr): any {
    if (this.execute(n.condition)) {
      return this.execute(n.consequent);
    } else return this.execute(n.alternate);
  }
  assign(n: Assignment): any {
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
