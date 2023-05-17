import { Token } from "../main.js";
import { ASTNode } from "./abstract.node.js";
import { NodeType } from "./node.type.js";
import { Visitor } from "./visitor.definition.js";

export class BinaryExpression extends ASTNode {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.binex(this);
  }
  private readonly Left: ASTNode;
  private readonly Op: Token;
  private readonly Right: ASTNode;
  constructor(left: ASTNode, op: Token, right: ASTNode) {
    super(NodeType.binary);
    this.Left = left;
    this.Op = op;
    this.Right = right;
  }
  line() {
    return this.Op.Line;
  }
  
  /**
   * Returns this binary expression’s
   * left-node operand.
   */
  leftNode() {
    return this.Left;
  }
  /**
   * Returns this binary expression’s
   * right-node operand.
   */
  rightNode() {
    return this.Right;
  }
  /**
   * Returns this binary expression’s
   * operator.
   */
  op() {
    return this.Op.Type;
  }
}

export const binex = (
  left: ASTNode,
  op: Token,
  right: ASTNode,
) => new BinaryExpression(left, op, right);
