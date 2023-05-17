import { Visitor } from "./visitor.definition.js";
import { NodeType } from "./node.type.js";


// § Abstract ASTNode ================================================
/**
 * All AST nodes are extends of the abstract data type `ASTNode`.
 * This class only holds one field, `type`, which serves as a
 * way of identifying the ASTNode via a typeguard.
 *
 * By convention, all AST Nodes are prefaced with a `$`.
 */
export abstract class ASTNode {
  nodeType: NodeType;
  constructor(nodeType: NodeType) {
    this.nodeType = nodeType;
  }
  abstract accept<T>(visitor: Visitor<T>): T;
}
