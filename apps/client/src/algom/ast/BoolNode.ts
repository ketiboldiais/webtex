import { NODE } from "../structs/enums.js";
import { ast, Visitor } from "./astnode.js";
import { ASTNode } from "./base.js";

export class BoolNode extends ASTNode {
  value: boolean;
  constructor(value: boolean) {
    super(NODE.BOOL);
    this.value = value;
  }
  get val() {
    return `${this.value}`;
  }
  accept<T>(v: Visitor<T>) {
    return v.bool(this);
  }
  and(other: BoolNode) {
    return ast.bool(this.value && other.value);
  }
  or(other: BoolNode) {
    return ast.bool(this.value || other.value);
  }
  nor(other: BoolNode) {
    return ast.bool(!(this.value || other.value));
  }
  xor(other: BoolNode) {
    return ast.bool(this.value !== other.value);
  }
  xnor(other: BoolNode) {
    return ast.bool(this.value === other.value);
  }
  nand(other: BoolNode) {
    return ast.bool(!(this.value && other.value));
  }
}
