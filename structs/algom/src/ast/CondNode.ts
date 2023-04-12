import { NODE } from "../structs/enums.js";
import { Visitor } from "./astnode.js";
import { ASTNode } from "./base.js";

export class IfElseNode extends ASTNode {
  condition: ASTNode;
  consequent: ASTNode;
  alternate: ASTNode;
  constructor(condition: ASTNode, consequent: ASTNode, alternate: ASTNode) {
    super(NODE.COND);
    this.condition = condition;
    this.consequent = consequent;
    this.alternate = alternate;
  }
  get val() {
    return "condExpr";
  }
  accept<T>(v: Visitor<T>) {
    return v.cond(this);
  }
}
