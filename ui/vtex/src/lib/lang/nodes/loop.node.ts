import { ASTNode } from "./abstract.node.js";
import { NodeType } from "./node.type.js";
import { Visitor } from "./visitor.definition.js";

export class Loop extends ASTNode {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.loop(this);
  }
  condition: ASTNode;
  body: ASTNode;
  constructor(condition: ASTNode, body: ASTNode) {
    super(NodeType.loop);
    this.condition = condition;
    this.body = body;
  }
}

export const loop = (
  condition: ASTNode,
  body: ASTNode,
) => new Loop(condition, body);
