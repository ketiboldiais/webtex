import { ASTNode } from "./abstract.node.js";
import { NodeType } from "./node.type.js";
import { Visitor } from "./visitor.definition.js";

export class Vector extends ASTNode {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.vector(this);
  }
  items: ASTNode[];
  constructor(items: ASTNode[]) {
    super(NodeType.vector);
    this.items = items;
  }
}

export const vector = (items: ASTNode[]) => new Vector(items);
