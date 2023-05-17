import { ASTNode } from "./abstract.node.js";
import { NodeType } from "./node.type.js";
import { Visitor } from "./visitor.definition.js";

export class Block extends ASTNode {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.block(this);
  }
  private readonly Statements: ASTNode[];
  constructor(statements: ASTNode[]) {
    super(NodeType.block);
    this.Statements = statements;
  }
  /**
   Returns the nodes parsed
   * under this bock.
   */
  nodes() {
    return this.Statements;
  }
}

export const block = (statements: ASTNode[]) => new Block(statements);

export const isBlockNode = (
  node: ASTNode,
): node is Block => node.nodeType === NodeType.block;
