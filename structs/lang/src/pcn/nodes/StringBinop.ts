import { Node, BinaryExpr } from './index.js';
import { NodeType, BinaryStringOp } from '../types.js';

export class StringBinop<A extends Node, B extends Node> extends BinaryExpr<
  A,
  B
> {
  type: NodeType;
  value: { left: A; op: BinaryStringOp; right: B };
  constructor(left: A, op: BinaryStringOp, right: B) {
    super(left, op, right);
    this.type = 'string-binary-expression';
    this.value = { left, op, right };
  }
  get op() {
    return this.value.op;
  }
  get left() {
    return this.value.left;
  }
  get right() {
    return this.value.right;
  }
}
