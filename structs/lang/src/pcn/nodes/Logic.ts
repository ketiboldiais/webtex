import { Node } from './Node';
import { BinaryExpr } from './BinaryExpr.js';
import { BinaryLogicOp, NodeType, UnaryLogicOp } from '../types';

export class Bool extends Node {
  type: NodeType;
  value: boolean;
  constructor(value: boolean) {
    super(value, 'boolean');
    this.value = value;
    this.type = 'boolean';
  }
  get latex() {
    return this.value ? `\\top` : `\\bot`;
  }
}

export class AndExpr<A extends Node, B extends Node> extends BinaryExpr<A, B> {
  type: NodeType;
  value: { left: A; op: BinaryLogicOp; right: B };
  constructor(left: A, op: BinaryLogicOp, right: B) {
    super(left, op, right);
    this.type = 'logical-binary-expression';
    this.value = { left, op, right };
  }
  get latex() {
    return `{ {${this.value.left.latex}} {\\land} {${this.value.right.latex}} }`;
  }
}

// § - or-expression node
export class OrExpr<A extends Node, B extends Node> extends BinaryExpr<A, B> {
  type: NodeType;
  value: { left: A; op: BinaryLogicOp; right: B };
  constructor(left: A, op: BinaryLogicOp, right: B) {
    super(left, op, right);
    this.type = 'logical-binary-expression';
    this.value = { left, op, right };
  }
  get latex() {
    return `{ {${this.value.left.latex}} {\\lor} {${this.value.right.latex}} }`;
  }
}

// § - xor-expression node
export class XorExpr<A extends Node, B extends Node> extends BinaryExpr<A, B> {
  type: NodeType;
  value: { left: A; op: BinaryLogicOp; right: B };
  constructor(left: A, op: BinaryLogicOp, right: B) {
    super(left, op, right);
    this.type = 'logical-binary-expression';
    this.value = { left, op, right };
  }
  get latex() {
    return `{ {${this.value.left.latex}} {\\veebar} {${this.value.right.latex}} }`;
  }
}

// § - xnor-expression node
export class XnorExpr<A extends Node, B extends Node> extends BinaryExpr<A, B> {
  type: NodeType;
  value: { left: A; op: BinaryLogicOp; right: B };
  constructor(left: A, op: BinaryLogicOp, right: B) {
    super(left, op, right);
    this.type = 'logical-binary-expression';
    this.value = { left, op, right };
  }
  get latex() {
    return `{ {${this.value.left.latex}} {\\odot} {${this.value.right.latex}} }`;
  }
}

// § - nand-expression node
export class NandExpr<A extends Node, B extends Node> extends BinaryExpr<A, B> {
  type: NodeType;
  value: { left: A; op: BinaryLogicOp; right: B };
  constructor(left: A, op: BinaryLogicOp, right: B) {
    super(left, op, right);
    this.type = 'logical-binary-expression';
    this.value = { left, op, right };
  }
  get latex() {
    return `{ {${this.value.left.latex}} {\\overline{\\land}} {${this.value.right.latex}} }`;
  }
}

// § - nor-expression node
export class NorExpr<A extends Node, B extends Node> extends BinaryExpr<A, B> {
  type: NodeType;
  value: { left: A; op: BinaryLogicOp; right: B };
  constructor(left: A, op: BinaryLogicOp, right: B) {
    super(left, op, right);
    this.type = 'logical-binary-expression';
    this.value = { left, op, right };
  }
  get latex() {
    return `{ {${this.value.left.latex}} {\\overline{\\lor}} {${this.value.right.latex}} }`;
  }
}

export class NotExpr<T extends Node> extends Node {
  type: NodeType;
  value: { arg: T; op: UnaryLogicOp };
  constructor(arg: T, op: UnaryLogicOp) {
    super({ arg, op }, 'logical-unary-expression');
    this.type = 'logical-unary-expression';
    this.value = { arg, op };
  }
  get latex() {
    return `{ {\\neg} {${this.value.arg.latex}}  }`;
  }
}
