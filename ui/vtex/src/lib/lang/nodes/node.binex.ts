import { Token } from "../token.js";
import { ASTNode } from "./node.ast.js";
import { Visitor } from "./node.visitor.js";

export class Binex extends ASTNode {
  accept<t>(visitor: Visitor): t {
    return visitor.binex(this);
  }
  left: ASTNode;
  op: Token;
  right: ASTNode;
  constructor(left: ASTNode, op: Token, right: ASTNode) {
    super("binex");
    this.left = left;
    this.op = op;
    this.right = right;
  }
}

export const nBinex = (
  left: ASTNode,
  op: Token,
  right: ASTNode,
) => new Binex(left, op, right);
