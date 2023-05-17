import { Token } from "../main.js";
import { ASTNode } from "./abstract.node.js";
import { NodeType } from "./node.type.js";
import { Visitor } from "./visitor.definition.js";

export class UnaryExpression extends ASTNode {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.unary(this);
  }
  private readonly Op: Token;
  private readonly Arg: ASTNode;
  constructor(op: Token, arg: ASTNode) {
    super(NodeType.unary);
    this.Op = op;
    this.Arg = arg;
  }
  /**
   * Returns this unary expression’s
   * operator.
   */
  op() {
    return this.Op.Type;
  }
  /**
   * Returns this unary expression’s
   * argument.
   */
  arg() {
    return this.Arg;
  }
}

export const unary = (
  op: Token,
  arg: ASTNode,
) => new UnaryExpression(op, arg);
