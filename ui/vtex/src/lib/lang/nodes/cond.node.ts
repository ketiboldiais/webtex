import { ASTNode } from "./abstract.node.js";
import { NodeType } from "./node.type.js";
import { Visitor } from "./visitor.definition.js";

export class Conditional extends ASTNode {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.cond(this);
  }
  private readonly Condition: ASTNode;
  private readonly If: ASTNode;
  private readonly Else: ASTNode;
  constructor(
    Condition: ASTNode,
    If: ASTNode,
    Else: ASTNode,
  ) {
    super(NodeType.conditional);
    this.Condition = Condition;
    this.If = If;
    this.Else = Else;
  }
  /**
   * Returns the if-condition.
   */
  conditionNode() {
    return this.Condition;
  }
  /**
   * Returns the if-block.
   */
  ifNode() {
    return this.If;
  }
  /**
   * Returns the else-block.
   */
  elseNode() {
    return this.Else;
  }
}

export const cond = (
  condition: ASTNode,
  thenBranch: ASTNode,
  elseBranch: ASTNode,
) => new Conditional(condition, thenBranch, elseBranch);
