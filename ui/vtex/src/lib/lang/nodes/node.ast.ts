import { Visitor } from "./node.visitor.js";
import { NType } from "./node.typings.js";

export abstract class ASTNode {
  type: NType;
  constructor(type: NType) {
    this.type = type;
  }
  is(type: NType) {
    return this.type === type;
  }
  numeric() {
    const ntype = this.type;
    return (
      ntype === "int" ||
      ntype === "float" ||
      ntype === "hex" ||
      ntype === "octal" ||
      ntype === "binary" ||
      ntype === "Inf" ||
      ntype === "NaN"
    );
  }
  atomic() {
    const ntype = this.type;
    return (
      ntype === "int" ||
      ntype === "hex" ||
      ntype === "octal" ||
      ntype === "float" ||
      ntype === "bool" ||
      ntype === "null" ||
      ntype === "Inf" ||
      ntype === "NaN" ||
      ntype === "string" ||
      ntype === "binary"
    );
  }
  abstract accept<t>(visitor: Visitor): t;
}

// deno-fmt-ignore
export const nodeGuard = <T extends ASTNode>(
  typename: NType
) => (node: ASTNode): node is T => (
  node.type === typename
);
