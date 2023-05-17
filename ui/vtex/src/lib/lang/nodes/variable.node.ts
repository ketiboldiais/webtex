import { Token } from "../main.js";
import { ASTNode } from "./abstract.node.js";
import { NodeType } from "./node.type.js";
import { Sym, sym } from "./symbol.node.js";
import { Visitor } from "./visitor.definition.js";

export class VariableDeclaration extends ASTNode {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.varDef(this);
  }
  private readonly Name: Sym;
  private readonly Value: ASTNode;
  constructor(name: Sym, body: ASTNode) {
    super(NodeType.variableDeclaration);
    this.Name = name;
    this.Value = body;
  }
  symName() {
    return this.Name;
  }
  /**
   * Returns this variable’s
   * name.
   */
  variableName() {
    return this.Name.id();
  }
  /**
   * Returns this variable’s
   * bound value.
   */
  value() {
    return this.Value;
  }
}

export const varDef = (
  name: Token,
  body: ASTNode,
) => new VariableDeclaration(sym(name, true), body);

export const constantDef = (
  name: Token,
  body: ASTNode,
) => new VariableDeclaration(sym(name, false), body);
