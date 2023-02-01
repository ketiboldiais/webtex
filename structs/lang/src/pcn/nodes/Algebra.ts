import { Node } from './index.js';
import { Id } from './Id.js';
import { NodeType } from '../types.js';

export class AlgebraicExpression extends Node {
  value: { name: Id; body: Node[]; params: Id[] };
  type: NodeType;
  constructor(name: Id, body: Node[], params: Id[] = []) {
    super({ name, body, params }, 'algebraic-expression');
    this.value = { name, body, params };
    this.type = 'algebraic-expression';
  }
  read() {
    return this.value;
  }
  push(kv: Node) {
    this.value.body.push(kv);
  }
  addParam(id: Id) {
    this.value.params.push(id);
  }
}
