import { NODE } from "../structs/enums.js";
import { Visitor } from "./astnode.js";
import { ASTNode } from "./base.js";

export class VarDeclareNode extends ASTNode {
  name: string;
  value: ASTNode;
  line: number;
  constructor(op: string, value: ASTNode, line: number) {
    super(NODE.VARIABLE_DECLARATION);
    this.name = op;
    this.value = value;
    this.line = line;
  }
  get val() {
    return `let ${this.name} = ${this.value.val};`;
  }
  accept<T>(n: Visitor<T>): T {
    return n.varDeclaration(this);
  }
}
