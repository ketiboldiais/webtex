import { ASTNode } from "./node.ast.js";
import { Visitor } from "./node.visitor.js";

export class Group extends ASTNode {
  accept<t>(visitor: Visitor): t {
    return visitor.group(this);
  }
  expr: ASTNode;
  constructor(expr: ASTNode) {
    super("group");
    this.expr = expr;
  }
}

export const nGroup = (
  node: ASTNode,
) => new Group(node);
