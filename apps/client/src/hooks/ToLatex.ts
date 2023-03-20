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
  Num,
  Root,
  Sym,
  Tuple,
  UnaryExpr,
  VarDeclaration,
  Vector,
  Visitor,
  WhileNode
} from "../algom/astnode.js";

export class ToLatex implements Visitor<string> {
  whileStmnt(node: WhileNode): string {
    return ""
  }
  latexOf(node: ASTNode) {
    if (node !== undefined) {
      return node.accept(this);
    }
    return "";
  }
  chars(node: Chars): string {
    return `\\text{\\textquotedblleft}${node.value}\\text{\\textquotedblright}`;
  }
  group(node: Group): string {
    const content = this.latexOf(node.expression);
    return `\\left(${content}\\right)`;
  }
  null(n: Null): string {
    return "";
  }
  num(node: Num): string {
    return node.latex;
  }
  sym(node: Sym): string {
    return node.latex;
  }
  tuple(node: Tuple): string {
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
  block(n: Block): string {
    return this.latexes(n.body);
  }
  vector(n: Vector): string {
    return this.latexes(n.elements, ", ", ["\\left[", "\\right]"]);
  }
  matrix(node: Matrix): string {
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
  unaryExpr(node: UnaryExpr): string {
    const arg = this.latexOf(node.arg);
    if (node.op === "-" || node.op === "+") {
      return `${node.op}${arg}`;
    }
    return `${arg}${node.op}`;
  }
  callExpr(node: CallExpr): string {
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
  binaryExpr(node: BinaryExpr): string {
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
  varDeclaration(n: VarDeclaration): string {
    return "";
  }
  funDeclaration(n: FunDeclaration): string {
    return "";
  }
  root(node: Root): string {
    let str = "";
    for (let i = 0; i < node.root.length; i++) {
      str += this.latexOf(node.root[i]);
    }
    return str;
  }
  cond(n: CondExpr): string {
    return "";
  }
  assign(n: Assignment): string {
    return "";
  }
  bool(node: Bool): string {
    return `\\text{${node.value}}`;
  }
  error(node: Errnode): string {
    return "";
  }
}
