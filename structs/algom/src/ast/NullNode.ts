import { NODE } from "../structs/enums.js";
import { Visitor } from "./astnode.js";
import { ASTNode } from "./base.js";

export class NullNode extends ASTNode {
  value: string;
  constructor(value: string = "null") {
    super(NODE.NULL);
    this.value = value;
  }
  get val() {
    return `null`;
  }
  accept<T>(v: Visitor<T>) {
    return v.null(this);
  }
}
