import { ASTNode } from "./node.ast.js";
import { Visitor } from "./node.visitor.js";

export class VectorExpr extends ASTNode {
  accept<t>(visitor: Visitor): t {
    return visitor.vector(this);
  }
  nodes: ASTNode[];
  constructor(elements: ASTNode[]) {
    super("vector");
    this.nodes = elements;
  }
  get elements() {
    return this.nodes;
  }
}

export const nVector = (elements: ASTNode[]) => (
  new VectorExpr(elements)
);
