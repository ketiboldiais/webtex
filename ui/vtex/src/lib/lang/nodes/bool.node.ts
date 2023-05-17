import { ASTNode } from "./abstract.node.js";
import { NodeType } from "./node.type.js";
import { Visitor } from "./visitor.definition.js";

export class Bool extends ASTNode {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.bool(this);
  }
  private readonly Value: boolean;
  constructor(value: boolean) {
    super(NodeType.bool);
    this.Value = value;
  }
  /**
   * Returns this node’s boolean
   * literal.
   */
  lit() {
    return this.Value;
  }
}

export const falseNode = new Bool(false);
export const trueNode = new Bool(true);


