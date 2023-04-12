import { NODE } from "../structs/enums.js";
import { Visitor } from "./astnode.js";
import { ASTNode } from "./base.js";

export class UnaryExprNode extends ASTNode {
  op: string;
  arg: ASTNode;
  constructor(op: string, arg: ASTNode) {
    super(NODE.UNARY_EXPRESSION);
    this.op = op;
    this.arg = arg;
  }
  get val() {
    return `${this.op}${this.arg.val}`;
  }
  accept<T>(n: Visitor<T>): T {
    return n.unaryExpr(this);
  }
}
