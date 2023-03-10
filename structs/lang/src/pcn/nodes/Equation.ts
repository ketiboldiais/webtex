import { Node, BinaryExpr } from './index.js';
import { NodeType, EqOp, IneqOp, UnaryMathOp } from '../types.js';

export class Equation<A extends Node, B extends Node> extends BinaryExpr<A, B> {
  type: NodeType;
  value: { left: A; op: EqOp; right: B };
  constructor(left: A, op: EqOp, right: B) {
    super(left, op, right);
    this.type = 'equation';
    this.value = { left, op, right };
  }
}

export class Inequation<A extends Node, B extends Node> extends BinaryExpr<
  A,
  B
> {
  type: NodeType;
  value: { left: A; op: IneqOp; right: B };
  constructor(left: A, op: IneqOp, right: B) {
    super(left, op, right);
    this.type = 'inequation';
    this.value = { left, op, right };
  }
}

export class FactorialExpression<T extends Node> extends Node {
  type: NodeType;
  value: { arg: T; op: UnaryMathOp };
  constructor(arg: T, op: UnaryMathOp) {
    super(arg, op);
    this.type = 'factorial-expression';
    this.value = { arg, op };
  }
}
