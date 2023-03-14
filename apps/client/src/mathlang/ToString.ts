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
  Null,
  Root,
  Sym,
  Tuple,
  UnaryExpr,
  VarDeclaration,
  Vector,
  Visitor,
} from "./nodes/index.js";
import { Num } from "./nodes/num.js";

export class ToString implements Visitor<string> {
  cond(n: CondExpr) {
    const test: string = this.toString(n.condition);
    const consequent: string = this.toString(n.consequent);
    const alternate: string = this.toString(n.alternate);
    return `if (${test}) {${consequent}} else {${alternate}}`;
  }
  group(node: Group): string {
    const expr = this.toString(node.expression);
    return `(` + expr + `)`;
  }
  error(n: Errnode): string {
    return n.value;
  }
  bool(n: Bool): string {
    return `${n.value}`;
  }
  assign(n: Assignment): string {
    const name = n.name;
    const value = this.toString(n.value);
    return `${name} = ${value}`;
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
    return this.stringify(n.value.array);
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
    let fn = n.callee;
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
