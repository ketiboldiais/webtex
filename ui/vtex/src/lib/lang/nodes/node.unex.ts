import { Token } from "../token.js";
import { ASTNode } from "./node.ast.js";
import { Visitor } from "./node.visitor.js";

export class Unex extends ASTNode {
  accept<t>(visitor: Visitor): t {
    return visitor.unex(this);
  }
  op: Token;
  arg: ASTNode;
  constructor(op: Token, arg: ASTNode) {
    super("unex");
    this.op = op;
    this.arg = arg;
  }
}
export const nUnex = (op: Token, arg: ASTNode) => (
  new Unex(op, arg)
);
