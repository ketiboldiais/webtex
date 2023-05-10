import { List } from "../aux/list.js";
import { ASTNode } from "./abstract.node.js";
import { NodeType } from "./node.type.js";
import { Visitor } from "./visitor.definition.js";

export class Tuple<T extends ASTNode = ASTNode> extends ASTNode {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.tuple(this);
  }
  items: List<T>;
  constructor(items: T[]) {
    super(NodeType.tuple);
    this.items = new List<T>().add(items);
  }
}

export const tuple = <T extends ASTNode>(items: T[]) => new Tuple(items);

export const isTupleNode = (
  node: ASTNode,
): node is Tuple => node.nodeType === NodeType.tuple;
