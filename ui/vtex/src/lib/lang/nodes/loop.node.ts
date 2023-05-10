import {ASTNode} from "./abstract.node";
import {Visitor} from "./visitor.definition";



export class Loop extends ASTNode {
	accept<T>(visitor: Visitor<T>): T {
		return visitor.loop(this);
	}
	
}

