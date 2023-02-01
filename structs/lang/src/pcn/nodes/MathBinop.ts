import { Node } from './Node.js';
import { NodeType, BinaryMathOp } from '../types.js';
import { BinaryExpr } from './BinaryExpr.js';

export class MathBinop<t1 extends Node, t2 extends Node> extends BinaryExpr<
  t1,
  t2
> {
  type: NodeType;
  value: { left: t1; op: BinaryMathOp; right: t2 };
  constructor(left: t1, op: BinaryMathOp, right: t2) {
    super(left, op, right);
    this.type = 'math-binary-expression';
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
