import { Token } from "../token.js";
import { ASTNode } from "./node.ast.js";
import { Visitor } from "./node.visitor.js";

export class Setex extends ASTNode {
  accept<t>(visitor: Visitor): t {
    return visitor.setex(this);
  }
  constructor(
    public name: Token,
    public obj: ASTNode,
    public value: ASTNode,
  ) {
    super("setex");
  }
}

export const nSetex = (
  name: Token,
  obj: ASTNode,
  value: ASTNode,
) => new Setex(name, obj, value);
