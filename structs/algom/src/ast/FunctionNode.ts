import { NODE } from "../structs/enums.js";
import { SymbolNode } from "./SymbolNode.js";
import { Visitor } from "./astnode.js";
import { ASTNode } from "./base.js";

export class FunctionNode extends ASTNode {
  name: string;
  params: SymbolNode[];
  body: ASTNode;
  constructor(name: string, params: SymbolNode[], body: ASTNode) {
    super(NODE.FUNCTION_DECLARATION);
    this.name = name;
    this.params = params;
    this.body = body;
  }
  get val() {
    return `let ${this.name}(${
      this.params.map((s) => s.val).join(", ")
    }) = ${this.body.val}`;
  }
  get paramlist() {
    return this.params.map((n) => n.value);
  }
  accept<T>(n: Visitor<T>): T {
    return n.funDeclaration(this);
  }
}
