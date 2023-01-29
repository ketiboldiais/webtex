import { Node } from './Node.js';
import { BinaryExpr } from './BinaryExpr.js';
import { NodeType, EqOp, IneqOp, UnaryMathOp } from '../types';

export class Equation<A extends Node, B extends Node> extends BinaryExpr<A, B> {
  type: NodeType;
  value: { left: A; op: EqOp; right: B };
  constructor(left: A, op: EqOp, right: B) {
    super(left, op, right);
    this.type = 'equation';
    this.value = { left, op, right };
  }
  get latex() {
    return `{${this.value.left.latex}} {${this.value.op}} {${this.value.right.latex}}`;
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
  get latex() {
    return `{ {${this.value.left.latex}} {${this.value.op}} {${this.value.right.latex}} }`;
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
  get latex() {
    return `{ {${this.value.arg}} {${this.value.op}} }`;
  }
}
