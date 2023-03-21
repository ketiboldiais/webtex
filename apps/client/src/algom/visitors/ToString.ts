import { Visitor } from "../ast/astnode.js";
import {
  ASTNode,
  AssignmentNode,
  BinaryExprNode,
  BlockNode,
  BoolNode,
  CallNode,
  IfElseNode,
  ErrorNode,
  FunctionNode,
  GroupNode,
  Integer,
  MatrixNode,
  NullNode,
  Rational,
  Real,
  Root,
  StringNode,
  SymbolNode,
  TupleNode,
  UnaryExprNode,
  VarDeclareNode,
  VectorNode,
  WhileNode,
} from "../ast/index.js";

export class ToString implements Visitor<string> {
  cond(n: IfElseNode) {
    const test: string = this.toString(n.condition);
    const consequent: string = this.toString(n.consequent);
    const alternate: string = this.toString(n.alternate);
    return `if (${test}) {${consequent}} else {${alternate}}`;
  }
  frac(node: Rational): string {
    return node.val;
  }
  real(node: Real): string {
    return node.val;
  }
  int(node: Integer): string {
    return node.val;
  }
  group(node: GroupNode): string {
    const expr = this.toString(node.expression);
    return `(` + expr + `)`;
  }
  whileStmnt(node: WhileNode): string {
    return "";
  }
  error(n: ErrorNode): string {
    return n.value;
  }
  bool(n: BoolNode): string {
    return `${n.value}`;
  }
  assign(n: AssignmentNode): string {
    const name = n.name;
    const value = this.toString(n.value);
    return `${name} = ${value}`;
  }
  chars(n: StringNode): string {
    return n.value;
  }
  null(n: NullNode): string {
    return "null";
  }
  sym(n: SymbolNode): string {
    return n.value;
  }
  tuple(n: TupleNode): string {
    return this.stringify(n.value.array);
  }
  block(n: BlockNode): string {
    let result = "";
    for (let i = 0; i < n.body.length; i++) {
      result += this.toString(n.body[i]) + "\n";
    }
    return result;
  }
  vector(n: VectorNode): string {
    return this.stringify(n.elements, ", ", ["[", "]"]);
  }
  unaryExpr(n: UnaryExprNode): string {
    let op = n.op;
    let result = this.toString(n.arg);
    const out = op + `(` + result + `)`;
    return out;
  }
  binaryExpr(n: BinaryExprNode): string {
    if (n.op === "*" && n.left.isNum() && n.right.isSymbol()) {
      return n.left.value + n.right.value;
    }
    let left = this.toString(n.left);
    let right = this.toString(n.right);
    const op = (n.op !== "^" && n.op !== "/") ? ` ${n.op} ` : n.op;
    return left + op + right;
  }
  varDeclaration(n: VarDeclareNode): string {
    return this.toString(n.value);
  }
  root(n: Root): string {
    let result: string[] = [];
    n.root.forEach((n) => result.push(this.toString(n)));
    const out = result.join("");
    return out;
  }
  funDeclaration(node: FunctionNode): string {
    const name = node.name;
    const params = this.stringify(node.params, ", ", ["(", ")"]);
    const body = this.toString(node.body);
    return name + params + "{" + body + "}";
  }
  matrix(n: MatrixNode): string {
    let elements: string[] = [];
    n.vectors.forEach((v) => elements.push("\t" + this.toString(v)));
    const Es = "[\n" + elements.join("\n") + "\n]";
    return Es;
  }
  callExpr(n: CallNode): string {
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
