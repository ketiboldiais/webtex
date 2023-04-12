import { NODE } from "../structs/enums.js";
import { Visitor } from "./astnode.js";
import { ASTNode } from "./base.js";

export class StringNode extends ASTNode {
  value: string;
  constructor(value: string) {
    super(NODE.STRING);
    this.value = value;
  }
  get val() {
    return `"${this.value}"`;
  }
  accept<T>(v: Visitor<T>) {
    return v.chars(this);
  }
}
