import { ASTNode } from "./abstract.node.js";
import { NodeType } from "./node.type.js";
import { Visitor } from "./visitor.definition.js";

export class Loop extends ASTNode {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.loop(this);
  }
  private readonly Condition: ASTNode;
  private readonly Body: ASTNode;
  constructor(condition: ASTNode, body: ASTNode) {
    super(NodeType.loop);
    this.Condition = condition;
    this.Body = body;
  }
  /**
   * Returns this loop’s condition.
   * Note that all loop nodes reduce
   * to while-loops at runtime.
   */
  conditionNode() {
    return this.Condition;
  }
  /**
   * Returns this loop’s body.
   */
  bodyNode() {
    return this.Body;
  }
}

export const loop = (
  condition: ASTNode,
  body: ASTNode,
) => new Loop(condition, body);
