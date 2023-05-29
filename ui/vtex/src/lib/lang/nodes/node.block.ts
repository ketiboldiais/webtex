import { ASTNode } from "./node.ast.js";
import { Visitor } from "./node.visitor.js";

export class Block extends ASTNode {
  accept<t>(visitor: Visitor): t {
    return visitor.blockStmt(this);
  }
  constructor(
    public stmts: ASTNode[],
  ) {
    super("stmt-block");
  }
}
export const nBlock = (
  statements: ASTNode[],
) => new Block(statements);
