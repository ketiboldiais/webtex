import { Token } from "../main.js";
import { ASTNode } from "./abstract.node.js";
import { NodeType } from "./node.type.js";
import { Visitor } from "./visitor.definition.js";

export class Sym extends ASTNode {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.symbol(this);
  }
  private readonly sym: Token;
  private readonly Mutable: boolean;
  constructor(value: Token, Mutable: boolean = false) {
    super(NodeType.symbol);
    this.sym = value;
    this.Mutable = Mutable;
  }
  /**
   * Returns true if this 
   * symbol is mutable. The default
   * is immutable.
   */
  isMutable() {
    return this.Mutable;
  }
  symbol() {
    return this.sym;
  }
  line() {
    return this.sym.Line;
  }
  column() {
    return this.sym.Column;
  }
  /**
   * Returns this symbol’s
   * string-value name.
   */
  id() {
    return this.sym.Lexeme;
  }
}

export const sym = (
  token: Token,
  mutable: boolean = false,
) => new Sym(token, mutable);

export const isSymbolNode = (
  node: ASTNode,
): node is Sym => (
  node.nodeType === NodeType.symbol
);
