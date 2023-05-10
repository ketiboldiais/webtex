import {ASTNode} from "./abstract.node.js";
import {NodeType} from "./node.type.js";
import {Sym} from "./symbol.node.js";
import {Visitor} from "./visitor.definition.js";

export class Assign extends ASTNode {
	accept<T>(visitor: Visitor<T>): T {
		return visitor.assign(this);
	}
	private sym: Sym;
	private body: ASTNode;
	constructor(sym:Sym, body:ASTNode) {
		super(NodeType.assign);
		this.sym=sym;
		this.body=body;
	}
	name() {
		return this.sym.value();
	}
	value() {
		return this.body;
	}
	symbol() {
		return this.sym;
	}
}

export const assignment = (
	name:Sym,
	body:ASTNode
) => new Assign(name, body);

export const isAssignmentNode = (
	node:ASTNode
): node is Assign => node.nodeType === NodeType.assign