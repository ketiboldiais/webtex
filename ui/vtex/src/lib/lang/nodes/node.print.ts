import { ASTNode } from "./node.ast.js";
import { Visitor } from "./node.visitor.js";

export class PrintNode extends ASTNode {
  accept<t>(visitor: Visitor<any>): t {
    return visitor.printStmt(this);
  }
  constructor(public target: ASTNode) {
    super("stmt-print");
  }
}
export const nPrint = (
  target: ASTNode,
) => new PrintNode(target);
