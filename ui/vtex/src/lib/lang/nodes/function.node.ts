import { ASTNode } from "./abstract.node.js";
import { NodeType } from "./node.type.js";
import { Sym } from "./symbol.node.js";
import { Visitor } from "./visitor.definition.js";

export class FunctionDeclaration extends ASTNode {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.funcDef(this);
  }
  constructor(
    private readonly Name: Sym,
    private readonly Parameters: Sym[],
    private readonly Body: ASTNode,
  ) {
    super(NodeType.functionDeclaration);
    this.Name = Name;
    this.Parameters = Parameters;
    this.Body = Body;
  }
  value() {
    return this.Body;
  }
  arity() {
    return this.Parameters.length;
  }
  params() {
    return this.Parameters;
  }
  name() {
    return this.Name.value();
  }
}

export const fnDef = (
  sym: Sym,
  params: Sym[],
  body: ASTNode,
) => new FunctionDeclaration(sym, params, body);
