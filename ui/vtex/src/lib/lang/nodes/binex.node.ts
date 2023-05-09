import { Token } from "../token.js";
import { ASTNode } from "./abstract.node.js";
import { NodeType } from "./node.type.js";
import { Visitor } from "./visitor.definition.js";

export class BinaryExpression extends ASTNode {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.binex(this);
  }
  left: ASTNode;
  op: Token;
  right: ASTNode;
  constructor(left: ASTNode, op: Token, right: ASTNode) {
    super(NodeType.binary);
    this.left = left;
    this.op = op;
    this.right = right;
  }
}

export const binex = (
  left: ASTNode,
  op: Token,
  right: ASTNode,
) => new BinaryExpression(left, op, right);
