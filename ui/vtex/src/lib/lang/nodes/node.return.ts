import { Token } from "../token.js";
import { ASTNode } from "./node.ast.js";
import { Visitor } from "./node.visitor.js";

export class Return extends ASTNode {
  accept<t>(visitor: Visitor): t {
    return visitor.returnStmt(this);
  }
  constructor(
    public value: ASTNode,
    public keyword: Token,
  ) {
    super("stmt-return");
  }
}
export const nReturn = (
  value: ASTNode,
  keyword: Token,
) => (
  new Return(value, keyword)
);
