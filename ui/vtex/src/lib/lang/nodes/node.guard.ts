import { NodeType } from "./node.type.js";
import { ASTNode } from "./abstract.node.js";

// deno-fmt-ignore
export const nodeTypeGuard = <T extends ASTNode>(
	type: NodeType
) => (
	node: ASTNode
): node is T => node.nodeType === type;
