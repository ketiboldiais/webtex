import { Token } from "../token.js";
import { ASTNode, nodeGuard } from "./node.ast.js";
import { Visitor } from "./node.visitor.js";

export class Assign extends ASTNode {
  accept<t>(visitor: Visitor): t {
    return visitor.assign(this);
  }
  constructor(
    public name: Token,
    public value: ASTNode,
  ) {
    super("assign");
  }
}

export const nAssign = (
  symbol: Token,
  value: ASTNode,
) => new Assign(symbol, value);

export const is_nAssign = nodeGuard<Assign>("assign");
