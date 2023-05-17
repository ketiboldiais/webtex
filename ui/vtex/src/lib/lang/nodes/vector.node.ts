import { ASTNode } from "./abstract.node.js";
import { NodeType } from "./node.type.js";
import { Visitor } from "./visitor.definition.js";

export class Vector extends ASTNode {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.vector(this);
  }
  private readonly Value: ASTNode[];
  constructor(items: ASTNode[]) {
    super(NodeType.vector);
    this.Value = items;
  }
  /**
   * Returns this Vectore node’s
   * value.
   */
  value() {
    return this.Value;
  }
  forEach(f: (item:ASTNode)=>void) {
    for (let i = 0; i < this.Value.length; i++) {
      f(this.Value[i]);
    }
    return this;
  }
}

export const vector = (items: ASTNode[]) => new Vector(items);
