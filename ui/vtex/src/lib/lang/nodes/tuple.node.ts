import { ASTNode } from "./abstract.node.js";
import { NodeType } from "./node.type.js";
import { Visitor } from "./visitor.definition.js";

export class Tuple<N extends ASTNode> extends ASTNode {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.tuple(this);
  }
  items: N[];
  constructor(items: N[]) {
    super(NodeType.tuple);
    this.items = items;
  }
	filter<X extends ASTNode>(
		predicate: (
			value: ASTNode,
			index: number,
			array: ASTNode[]
		) => value is X, 
	) {
		const items = this.items.filter(predicate) as unknown as X[];
		return new Tuple(items);
	}
}

export const tuplenode = (items: ASTNode[]) => new Tuple(items);
