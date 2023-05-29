import { Token } from "../token.js";
import { ASTNode } from "./node.ast.js";
import { Visitor } from "./node.visitor.js";

export class VarDef extends ASTNode {
  accept<t>(visitor: Visitor): t {
    return visitor.varStmt(this);
  }
  constructor(
    public name: Token,
    public body: ASTNode,
  ) {
    super("stmt-var");
  }
}
export const nVarDef = (
  name: Token,
  body: ASTNode,
) => new VarDef(name, body);
