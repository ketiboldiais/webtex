import { NODE } from "../structs/enums.js";
import { Visitor } from "./astnode.js";
import { ASTNode } from "./base.js";

export class BinaryExprNode extends ASTNode {
  left: ASTNode;
  op: string;
  right: ASTNode;
  constructor(left: ASTNode, op: string, right: ASTNode) {
    super(NODE.BINARY_EXPRESSION);
    this.left = left;
    this.op = op;
    this.right = right;
  }
  get val() {
    return `${this.left.val} ${this.op} ${this.right.val}`;
  }
  accept<T>(n: Visitor<T>): T {
    return n.binaryExpr(this);
  }
}
