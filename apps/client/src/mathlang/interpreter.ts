import { ToString } from "./ToString.js";
import { Compile } from "./compiler.js";
import { Fn } from "./fn.js";
import {
  Assignment,
  ast,
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
  N,
  Null,
  Num,
  Root,
  Sym,
  Tuple,
  UnaryExpr,
  VarDeclaration,
  Vector,
  Visitor,
} from "./nodes/index.js";
import { corelib, Scope } from "./scope.js";
import { NODE } from "./structs/enums.js";
import { List } from "./structs/list.js";

function compute(left: Num, op: string, right: Num): ASTNode | undefined {
  switch (op) {
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
    case ">":
      return left.gt(right);
    case ">=":
      return left.gte(right);
    case "<":
      return left.lt(right);
    case "<=":
      return left.lte(right);
    case "==":
      return left.equals(right);
  }
}
function mergeTuples(a: Tuple | ASTNode, b: Tuple | ASTNode) {
  let L: List<ASTNode> = new List();
  switch (true) {
    case (a.isTuple() && b.isTuple()):
      L = (a as Tuple).value.concat((b as Tuple).value);
      break;
    case (a.isTuple() && !b.isTuple()):
      L = (a as Tuple).value.push(b);
      break;
    case (!a.isTuple() && b.isTuple()):
      L = (b as Tuple).value.push(a);
      break;
    case (!a.isTuple() && !b.isTuple()):
      L = List.of(a, b);
      break;
  }
  return Tuple.of(L);
}

export class Interpreter implements Visitor<ASTNode> {
  str: ToString;
  scope: Scope;
  compiler: Compile;
  constructor(scope = new Scope(), compiler = new Compile()) {
    this.str = new ToString();
    this.scope = scope;
    this.compiler = compiler;
  }
  stringify(n: ASTNode) {
    return n.accept(this.str);
  }
  group(n: Group): ASTNode {
    return this.exec(n.expression);
  }
  error(n: Errnode): ASTNode {
    return n;
  }

  funDeclaration(node: FunDeclaration): ASTNode {
    const fn = new Fn(node.name, node.paramlist, node.body);
    this.scope.define(node.name, fn);
    return ast.nil;
  }

  private prepNumFn(
    native: Function,
    args: ASTNode[],
    callee: string,
    arglen: number,
  ): any {
    let nargs: number[] = [];
    const L = native.length;
    if (args.length < L) {
      return ast.argsErr(callee, L, arglen);
    }
    args.forEach((num, i) => {
      num.kind === NODE.NUMBER && nargs.push((num as Num).raw);
    });
    console.log(nargs);
    return native.apply(null, nargs);
  }

  private prepNumArrayFn(
    native: Function,
    args: ASTNode[],
    callee: string,
    arglen: number,
  ) {
    let nargs: number[][] = [];
    const L = native.length;
    if (args.length < L) {
      return ast.argsErr(callee, L, arglen);
    }
    args.forEach((vect, i) => {
      if (i < L && vect.kind === NODE.VECTOR) {
        const arg = this.compiler.execNodes(
          (vect as Vector).elements,
          this.scope,
        );
        console.log(arg);
        if (Array.isArray(arg) && typeof arg[0] === "number") {
          nargs.push(arg);
        }
      }
    });
    
    return native.apply(null, nargs);
  }

  callExpr(node: CallExpr): ASTNode {
    const args: ASTNode[] = [];
    const callee = node.callee;
    const arglen = node.length;
    for (let i = 0; i < arglen; i++) {
      args.push(this.exec(node.args[i]));
    }
    if (node.native) {
      const argtype = corelib.argOf(callee);
      let result: any = null;
      switch (argtype) {
        case "number":
          result = this.prepNumFn(node.native, args, callee, arglen);
          break;
        case "number-array":
          result = this.prepNumArrayFn(node.native, args, callee, arglen);
          break;
      }
      if (Array.isArray(result) && typeof result[0] === "number") {
        const L = result.length;
        const elements: ASTNode[] = [];
        for (let i = 0; i < L; i++) elements.push(N(`${result[i]}`));
        return ast.vector(elements);
      }
      switch (typeof result) {
        case "number":
          return N(`${result}`);
        case "boolean":
          return ast.bool(result);
        case "string":
          return ast.string(result);
        case "undefined":
        default:
          return ast.typeError("Invalid native call.");
      }
    }
    const fn = this.scope.get(callee);
    if (fn === null) {
      return ast.resError(`No function named ${callee} exists.`);
    }
    if (fn instanceof Fn) {
      if (arglen < fn.length) return ast.argsErr(callee, fn.length, arglen);
      return fn.interpret(this, args);
    }
    return ast.nil;
  }

  varDeclaration(node: VarDeclaration): ASTNode {
    let value: ASTNode = ast.nil;
    if (!node.value.isNull()) {
      value = this.exec(node.value);
    }
    const res = this.scope.define(node.name, value);
    if (res === null) {
      return ast.redeclareError(node.name);
    }
    return res;
  }

  assign(node: Assignment): ASTNode {
    const value = this.exec(node.value);
    this.scope.assign(node.name, value);
    return value;
  }
  sym(node: Sym): ASTNode {
    const n = corelib.getNumericConstant(node.value);
    if (n) return N(n.toString());
    const value = this.scope.get(node.value);
    if (value === null || value === undefined) {
      return ast.resError(`No variable named ${node.value} exists.`);
    }
    return value;
  }
  matrix(n: Matrix): ASTNode {
    return n;
  }
  chars(n: Chars): ASTNode {
    return n;
  }
  bool(n: Bool): ASTNode {
    return n;
  }
  null(n: Null): ASTNode {
    return n;
  }
  num(n: Num): ASTNode {
    return n;
  }
  cond(n: CondExpr): ASTNode {
    const test = this.exec(n.condition);
    if (test.isBool() && test.value) {
      return this.exec(n.consequent);
    }
    return this.exec(n.alternate);
  }

  tuple(n: Tuple): ASTNode {
    return Tuple.of(n.value.map((v) => this.exec(v)));
  }

  block(node: Block): ASTNode {
    return this.execBlock(node.body, this.scope);
  }
  execBlock(statements: ASTNode[], env: Scope) {
    const prev = this.scope;
    this.scope = env;
    let result: ASTNode = ast.nil;
    for (let i = 0; i < statements.length; i++) {
      if (result.erred) return result;
      result = this.exec(statements[i]);
    }
    this.scope = prev;
    return result;
  }

  vector(n: Vector): ASTNode {
    return n;
  }

  unaryExpr(n: UnaryExpr): ASTNode {
    return n;
  }

  binaryExpr(n: BinaryExpr): ASTNode {
    const left = this.exec(n.left);
    if (left.erred) return left;
    const right = this.exec(n.right);
    if (right.erred) return right;
    const op = n.op;
    if ((left.isTuple() || right.isTuple())) {
      switch (op) {
        case "++":
          return mergeTuples(left, right);
        default:
          return ast.typeError(`Operand ${op} doesn’t work with tuples.`);
      }
    }
    if (left.isMatrix() && right.isMatrix()) {
      switch (n.op) {
        case "+":
          return left.add(right);
        default:
          return ast.typeError(`Operand ${op} doesn’t work with matrices.`);
      }
    }
    if (left.isNum() && right.isNum()) {
      const result = compute(left, n.op, right);
      if (result) return result;
    }
    return ast.error(`Unknown use of operator ${n.op}`);
  }

  root(node: Root): ASTNode {
    if (node.error) return node.root[0];
    let result: ASTNode = ast.nil;
    for (let i = 0; i < node.root.length; i++) {
      if (result.erred) return result;
      result = this.exec(node.root[i]);
    }
    return result;
  }

  exec(node: ASTNode) {
    if (node.erred) return node;
    return node.accept(this);
  }
}
