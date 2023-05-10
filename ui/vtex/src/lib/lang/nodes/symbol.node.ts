import { Token } from "../token.js";
import { ASTNode } from "./abstract.node.js";
import { NodeType } from "./node.type.js";
import { Visitor } from "./visitor.definition.js";

export class Sym extends ASTNode {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.symbol(this);
  }
  private symbol: Token;
  constructor(symbol: Token) {
    super(NodeType.symbol);
    this.symbol = symbol;
  }
  value() {
    return this.symbol.lexeme;
  }
}

export const sym = (token: Token) => new Sym(token);

export const isSymbolNode = (
  node: ASTNode
): node is Sym => (
  node.nodeType === NodeType.symbol
);
