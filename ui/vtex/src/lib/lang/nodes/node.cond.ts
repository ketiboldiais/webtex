import { ASTNode } from "./node.ast.js";
import { Block } from "./node.block.js";
import { Visitor } from "./node.visitor.js";

export class Cond extends ASTNode {
  accept<t>(visitor: Visitor): t {
    return visitor.condStmt(this);
  }
  constructor(
    public condition: ASTNode,
    public ifBlock: Block,
    public elseBlock: Block,
  ) {
    super("stmt-cond");
  }
}

export const nCond = (
  condition: ASTNode,
  ifBlock: Block,
  elseBlock: Block,
) => new Cond(condition, ifBlock, elseBlock);
