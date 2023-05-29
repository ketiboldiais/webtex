import { List, list } from "../list.js";
import { ASTNode } from "./node.ast.js";
import { Visitor } from "./node.visitor.js";

export class Tuple extends ASTNode {
  accept<t>(visitor: Visitor<any>): t {
    return visitor.tuple(this);
  }
  list: List<ASTNode>;
  constructor(elements: ASTNode[]) {
    super("tuple");
    this.list = list(...elements);
  }
  array() {
    return this.list.toArray();
  }
}

export const nTuple = (
  elements: ASTNode[],
) => new Tuple(elements);
