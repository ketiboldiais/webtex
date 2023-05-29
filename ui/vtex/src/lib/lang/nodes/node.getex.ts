import { Token } from "../token.js";
import { ASTNode } from "./node.ast.js";
import { Visitor } from "./node.visitor.js";

export class Getex extends ASTNode {
  accept<t>(visitor: Visitor): t {
    return visitor.getex(this);
  }
  constructor(
    public name: Token,
    public obj: ASTNode,
  ) {
    super("getex");
  }
}

export const nGetex = (
  name: Token,
  obj: ASTNode,
) => new Getex(name, obj);
