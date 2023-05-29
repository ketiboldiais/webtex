import { Token } from "../token.js";
import { ASTNode } from "./node.ast.js";
import { Block } from "./node.block.js";
import { Visitor } from "./node.visitor.js";

export class FunDef extends ASTNode {
  accept<t>(visitor: Visitor): t {
    return visitor.funStmt(this);
  }
  constructor(
    public name: Token,
    public params: Token[],
    public body: Block,
  ) {
    super("stmt-fn");
  }
}
export const nFnDef = (
  name: Token,
  params: Token[],
  body: Block,
) => new FunDef(name, params, body);
