import { NODE } from "../structs/enums.js";
import { Visitor } from "./astnode.js";
import { ASTNode } from "./base.js";

export class ErrorNode extends ASTNode {
  value: string;
  constructor(message: string) {
    super(NODE.ERROR);
    this.value = message;
  }
  get val() {
    return `error: ${this.value}`;
  }
  accept<T>(n: Visitor<T>): T {
    return n.error(this);
  }
}
