import { ASTNode } from "./abstract.node.js";
import { NodeType } from "./node.type.js";
import { Visitor } from "./visitor.definition.js";

export class Block extends ASTNode {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.block(this);
  }
  statements: ASTNode[];
  constructor(statements: ASTNode[]) {
    super(NodeType.block);
    this.statements = statements;
  }
}

export const block = (statements:ASTNode[]) => new Block(statements);
