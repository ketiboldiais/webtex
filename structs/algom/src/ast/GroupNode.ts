import { NODE } from "../structs/enums.js";
import { Visitor } from "./astnode.js";
import { ASTNode } from "./base.js";

export class GroupNode extends ASTNode {
  expression: ASTNode;
  constructor(expression: ASTNode) {
    super(NODE.GROUP);
    this.expression = expression;
  }
  get val() {
    return `(${this.expression.val})`;
  }
  accept<T>(n: Visitor<T>): T {
    return n.group(this);
  }
}
