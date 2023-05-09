import { ASTNode } from "./abstract.node.js";
import { NodeType } from "./node.type.js";
import { Visitor } from "./visitor.definition.js";

export class Str extends ASTNode {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.string(this);
  }
  private val: string;
  constructor(value: string) {
    super(NodeType.string);
    this.val = value;
  }
  value() {
    return this.val;
  }
}

export const str = (value:string) => new Str(value);
