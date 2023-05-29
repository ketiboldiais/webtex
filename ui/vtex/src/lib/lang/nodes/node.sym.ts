import { Token } from "../token.js";
import { ASTNode, nodeGuard } from "./node.ast.js";
import { Visitor } from "./node.visitor.js";

export class Sym extends ASTNode {
  accept<t>(visitor: Visitor): t {
    return visitor.sym(this);
  }
  symbol: Token;
  constructor(symbol: Token) {
    super("symbol");
    this.symbol = symbol;
  }
}

export const nSym = (
  s: Token,
) => new Sym(s);

export const is_nSym = nodeGuard<Sym>("symbol");
