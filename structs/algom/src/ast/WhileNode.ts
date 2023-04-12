import { NODE } from "../structs/enums.js";
import { Visitor } from "./astnode.js";
import { ASTNode } from "./base.js";

export class WhileNode extends ASTNode {
  condition: ASTNode;
  body: ASTNode;
  constructor(condition: ASTNode, body: ASTNode) {
    super(NODE.WHILE);
    this.condition = condition;
    this.body = body;
  }
  get val() {
    return `while (${this.condition.val}): ${this.body.val}`;
  }
  accept<T>(n: Visitor<T>): T {
    return n.whileStmnt(this);
  }
}
