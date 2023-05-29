import { ASTNode } from "./node.ast.js";
import { Sym } from "./node.sym.js";
import { Visitor } from "./node.visitor.js";

export class Call extends ASTNode {
  accept<t>(visitor: Visitor): t {
    return visitor.callex(this);
  }
  callee: Sym;
  args: ASTNode[];
  constructor(callee: Sym, args: ASTNode[]) {
    super("call");
    this.callee = callee;
    this.args = args;
  }
}
export const nCall = (callee: Sym, args: ASTNode[]) => (
  new Call(callee, args)
);
