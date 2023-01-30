import { Id, Node } from './index.js';
import { NodeType } from '../types.js';

export class SetVal extends Node {
  value: [Id, Node[]];
  type: NodeType;
  constructor(name: Id, value: Node[]) {
    super(value, 'set');
    this.value = [name, value];
    this.type = 'set';
  }
  get latex() {
    return `\\{${this.value}\\}`;
  }
}
