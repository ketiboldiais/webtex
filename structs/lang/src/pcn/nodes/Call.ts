import { NodeType } from '../types.js';
import { Node, Id } from './index.js';

export class CallExpr extends Node {
  type: NodeType;
  value: {
    args: Node[];
    caller: Id;
  };
  constructor(value: { args: Node[]; caller: Id }) {
    super(value, 'call-expression');
    this.value = value;
    this.type = 'call-expression';
  }
  get caller() {
    return this.value.caller.value;
  }
  get args() {
    return this.value.args;
  }
}
