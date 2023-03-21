import { NODE } from "../structs/enums.js";
import { Visitor } from "./astnode.js";
import { ASTNode } from "./base.js";

export class AssignmentNode extends ASTNode {
  name: string;
  value: ASTNode;
  constructor(name: string, value: ASTNode) {
    super(NODE.ASSIGNMENT);
    this.name = name;
    this.value = value;
  }
  get val() {
    return `${this.name} = ${this.value.val}`;
  }
  accept<T>(n: Visitor<T>): T {
    return n.assign(this);
  }
}
