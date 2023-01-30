import { Node, BinaryExpr } from './index.js';
// import { BinaryExpr } from './BinaryExpr.ts';
import { NodeType, BinaryMathOp } from '../types.js';

export class MathBinop<A extends Node, B extends Node> extends BinaryExpr<
  A,
  B
> {
  type: NodeType;
  value: { left: A; op: BinaryMathOp; right: B };
  constructor(left: A, op: BinaryMathOp, right: B) {
    super(left, op, right);
    this.type = 'math-binary-expression';
    this.value = { left, op, right };
  }
  get latex() {
    return `{ {${this.value.left.latex}} {${this.op}} {${this.value.right.latex}} }`;
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
