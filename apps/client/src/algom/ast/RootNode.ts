import { ASTNode } from "./base.js";
import { NODE } from "../structs/enums.js";
import { Visitor } from "./astnode.js";

export class Root extends ASTNode {
  root: ASTNode[];
  error: boolean;
  constructor(root: ASTNode[]) {
    super(NODE.ROOT);
    this.root = root;
    this.error = false;
  }
  get val() {
    return "root";
  }
  accept<T>(n: Visitor<T>): T {
    return n.root(this);
  }
}
