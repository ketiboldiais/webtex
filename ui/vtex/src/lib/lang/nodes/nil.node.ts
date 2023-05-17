import { ASTNode } from "./abstract.node.js";
import { nodeTypeGuard } from "./node.guard.js";
import { NodeType } from "./node.type.js";
import { Visitor } from "./visitor.definition.js";

export class Nil extends ASTNode {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.nil(this);
  }
  private val: null;
  constructor() {
    super(NodeType.null);
    this.val = null;
  }
  line() {
    return -1;
  }
  value() {
    return this.val;
  }
}

export const nilNode = new Nil();

export const isNilNode = nodeTypeGuard<Nil>(NodeType.null);
