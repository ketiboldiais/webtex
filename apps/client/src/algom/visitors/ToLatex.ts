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

export class ToLatex implements Visitor<string> {
  frac(node: Rational): string {
    return node.val;
  }
  real(node: Real): string {
    return node.val;
  }
  int(node: Integer): string {
    return node.val;
  }
  whileStmnt(node: WhileNode): string {
    return "";
  }
  latexOf(node: ASTNode) {
    if (node !== undefined) {
      return node.accept(this);
    }
    return "";
  }
  chars(node: StringNode): string {
    return `\\text{\\textquotedblleft}${node.value}\\text{\\textquotedblright}`;
  }
  group(node: GroupNode): string {
    const content = this.latexOf(node.expression);
    return `\\left(${content}\\right)`;
  }
  null(_: NullNode): string {
    return "";
  }
  sym(node: SymbolNode): string {
    return node.latex;
  }
  tuple(node: TupleNode): string {
    const elements: string[] = [];
    node.value.forEach((n) => elements.push(this.latexOf(n)));
    const content = elements.join(", ");
    return `\\left(${content}\\right)`;
  }
  latexes(elements: ASTNode[], sep = ", ", delim = ["\\left(", "\\right)"]) {
    let str = [];
    const L = elements.length;
    for (let i = 0; i < L; i++) {
      if (elements[i] !== undefined) {
        str.push(elements[i].accept(this));
      }
    }
    const es = str.join(sep);
    return delim[0] + es + delim[1];
  }
  block(n: BlockNode): string {
    return this.latexes(n.body);
  }
  vector(n: VectorNode): string {
    return this.latexes(n.elements, ", ", ["\\left[", "\\right]"]);
  }
  matrix(node: MatrixNode): string {
    const matrix = node.matrix;
    const rows = node.rows;
    const cols = node.columns;
    const mtx: string[] = [];
    for (let i = 0; i < rows; i++) {
      let str: string[] = [];
      for (let j = 0; j < cols; j++) {
        const n = matrix[i][j];
        str.push(this.latexOf(n));
      }
      mtx.push(str.join(" & "));
    }
    const out = mtx.join(" \\\\ ");
    return `\\begin{bmatrix} ${out} \\end{bmatrix}`;
  }
  unaryExpr(node: UnaryExprNode): string {
    const arg = this.latexOf(node.arg);
    if (node.op === "-" || node.op === "+") {
      return `${node.op}${arg}`;
    }
    return `${arg}${node.op}`;
  }
  callExpr(node: CallNode): string {
    const args = this.latexes(node.args, ", ", ["", ""]);
    if (node.callee === "ceil") {
      return `\\lceil${args}\\rceil`;
    }
    if (node.callee === "floor") {
      return `\\lfloor${args}\\rfloor`;
    }
    if (node.callee === "cbrt") {
      return `\\sqrt[3]{${args}}`;
    }
    if (node.callee === "abs") {
      return `\\lvert{${args}}\\rvert`;
    }
    if (node.callee === "sqrt") {
      return `\\sqrt{${args}}`;
    }
    const name = node.latexFuncName;
    return `${name}\\left(${args}\\right)`;
  }
  binaryExpr(node: BinaryExprNode): string {
    const op = node.op;
    if (
      (node.left.isNum() || node.left.isGroup()) && node.right.isSymbol() &&
      op === "*"
    ) {
      const L = this.latexOf(node.left);
      const R = this.latexOf(node.right);
      return `${L}${R}`;
    }
    const left = this.latexOf(node.left);
    const right = this.latexOf(node.right);
    if (op === "/") return `\\dfrac{${left}}{${right}}`;
    if (op === "^") return `${left}${op}{${right}}`;
    if (op === "*") return `${left} \\times ${right}`;
    return `${left} ${op} ${right}`;
  }
  varDeclaration(n: VarDeclareNode): string {
    return "";
  }
  funDeclaration(n: FunctionNode): string {
    return "";
  }
  root(node: Root): string {
    let str = "";
    for (let i = 0; i < node.root.length; i++) {
      str += this.latexOf(node.root[i]);
    }
    return str;
  }
  cond(n: IfElseNode): string {
    return "";
  }
  assign(n: AssignmentNode): string {
    return "";
  }
  bool(node: BoolNode): string {
    return `\\text{${node.value}}`;
  }
  error(node: ErrorNode): string {
    return "";
  }
}
