import { Node } from './Node.js';
import { NodeType, BinaryOp } from '../types.js';

export class BinaryExpr<A extends Node, B extends Node> extends Node {
  type: NodeType;
  value: { left: A; op: BinaryOp; right: B };
  constructor(left: A, op: BinaryOp, right: B) {
    super({ left, op, right }, 'binary-expression');
    this.type = 'binary-expression';
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
