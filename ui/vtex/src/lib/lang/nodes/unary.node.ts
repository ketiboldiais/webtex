import {Token} from "../token.js";
import {ASTNode} from "./abstract.node.js";
import {NodeType} from "./node.type.js";
import {Visitor} from "./visitor.definition.js";

export class UnaryExpression extends ASTNode {
	accept<T>(visitor: Visitor<T>): T {
		return visitor.unary(this);
	}
	private op: Token;
	private arg: ASTNode;
	constructor(op:Token, arg:ASTNode) {
		super(NodeType.unary)
		this.op=op;
		this.arg=arg;
	}
	operator() {
		return this.op.type;
	}
	operand() {
		return this.arg;
	}
}

export const unary = (
	op: Token,
	arg:ASTNode,
) => new UnaryExpression(op, arg);