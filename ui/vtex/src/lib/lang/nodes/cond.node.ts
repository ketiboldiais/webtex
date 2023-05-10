import { ASTNode } from "./abstract.node.js";
import { NodeType } from "./node.type.js";
import { Visitor } from "./visitor.definition.js";

export class Conditional extends ASTNode {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.cond(this);
  }
  condition: ASTNode;
  thenBranch: ASTNode;
  elseBranch: ASTNode;
  constructor(
    condition: ASTNode,
    thenBranch: ASTNode,
    elseBranch: ASTNode,
  ) {
    super(NodeType.conditional);
    this.condition = condition;
    this.thenBranch = thenBranch;
    this.elseBranch = elseBranch;
  }
}

export const cond = (
  condition: ASTNode,
  thenBranch: ASTNode,
  elseBranch: ASTNode,
) => new Conditional(condition, thenBranch, elseBranch);
