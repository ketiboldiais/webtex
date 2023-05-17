import {ASTNode} from "./abstract.node.js";
import {NodeType} from "./node.type.js";
import {Visitor} from "./visitor.definition.js";

export class PrintNode extends ASTNode {
	accept<T>(visitor: Visitor<T>): T {
		return visitor.print(this);
	}
	private Target: ASTNode;
	constructor(target: ASTNode) {
		super(NodeType.io);
		this.Target=target;
	}
	target() {
		return this.Target;
	}
}

export const printnode = (target:ASTNode) => new PrintNode(target);