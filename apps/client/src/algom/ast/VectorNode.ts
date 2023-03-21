import { NODE } from "../structs/enums.js";
import { Visitor } from "./astnode.js";
import { ASTNode } from "./base.js";

export class VectorNode extends ASTNode {
  elements: ASTNode[];
  len: number;
  constructor(elements: ASTNode[]) {
    super(NODE.VECTOR);
    this.elements = elements;
    this.len = elements.length;
  }
  get val() {
    return "[" + this.elements.map((v) => v.val).join(", ") + "]";
  }
  accept<T>(n: Visitor<T>): T {
    return n.vector(this);
  }
}
