import { NODE } from "../structs/enums.js";
import { List } from "../structs/list.js";
import { Visitor } from "./astnode.js";
import { ASTNode } from "./base.js";

export class TupleNode extends ASTNode {
  value: List<ASTNode>;
  constructor(elements: List<ASTNode>) {
    super(NODE.TUPLE);
    this.value = elements;
  }
  get val() {
    return "(" + this.value.array.map((d) => d.val).join(", ") + ")";
  }
  static of(list: List<ASTNode>) {
    return new TupleNode(list);
  }
  accept<T>(n: Visitor<T>): T {
    return n.tuple(this);
  }
}
