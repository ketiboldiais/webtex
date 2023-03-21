import { NODE } from "../structs/enums.js";
import { Visitor } from "./astnode.js";
import { ASTNode } from "./base.js";

export class BlockNode extends ASTNode {
  body: ASTNode[];
  constructor(body: ASTNode[]) {
    super(NODE.BLOCK);
    this.body = body;
  }
  get val() {
    return "block";
  }
  accept<T>(n: Visitor<T>): T {
    return n.block(this);
  }
}
