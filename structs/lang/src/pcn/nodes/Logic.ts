import { Node, BinaryExpr } from './index.js';
import { BinaryLogicOp, NodeType, UnaryLogicOp } from '../types.js';

export class Bool extends Node {
  type: NodeType;
  value: boolean;
  constructor(value: boolean) {
    super(value, 'boolean');
    this.value = value;
    this.type = 'boolean';
  }
}

export class BinLogExpr<A extends Node, B extends Node> extends BinaryExpr<A, B> {
  type: NodeType;
  value: { left: A; op: BinaryLogicOp; right: B };
  constructor(left: A, op: BinaryLogicOp, right: B) {
    super(left, op, right);
    this.type = 'logical-binary-expression';
    this.value = { left, op, right };
  }
}

export class UniLogExpr<T extends Node> extends Node {
  type: NodeType;
  value: { arg: T; op: UnaryLogicOp };
  constructor(arg: T, op: UnaryLogicOp) {
    super({ arg, op }, 'logical-unary-expression');
    this.type = 'logical-unary-expression';
    this.value = { arg, op };
  }
}
