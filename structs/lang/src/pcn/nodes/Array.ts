import { Node } from './Node.js';
import { NodeType } from '../types.js';

export class ArrVal extends Node {
  value: Node[];
  type: NodeType;
  constructor(value: Node[]) {
    super(value, 'array');
    this.value = value;
    this.type = 'array';
  }
  get latex() {
    return `${this.value}`;
  }
}
