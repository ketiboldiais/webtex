import { ASTNode } from "./abstract.node.js";
import { NodeType } from "./node.type.js";
import { Visitor } from "./visitor.definition.js";

export class Bool extends ASTNode {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.bool(this);
  }
  value: boolean;
  constructor(value: boolean) {
    super(NodeType.bool);
    this.value = value;
  }
}

export const falseNode = new Bool(false);
export const trueNode = new Bool(true);
