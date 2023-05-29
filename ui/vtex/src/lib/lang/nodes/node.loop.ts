import { ASTNode } from "./node.ast.js";
import { Block } from "./node.block.js";
import { Visitor } from "./node.visitor.js";

export class Loop extends ASTNode {
  accept<t>(visitor: Visitor<any>): t {
    return visitor.loopStmt(this);
  }
  constructor(
    public condition: ASTNode,
    public body: Block,
  ) {
    super("stmt-loop");
  }
}
export const nLoop = (
  condition: ASTNode,
  body: Block,
) => new Loop(condition, body);
