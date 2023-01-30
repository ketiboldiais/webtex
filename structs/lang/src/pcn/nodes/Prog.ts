import { NodeType } from '../types.js';
import { Node } from './index.js';

export class Prog extends Node {
  value: Node[];
  type: NodeType;
  constructor(value: Node[]) {
    super(value, 'program');
    this.value = value;
    this.type = 'program';
  }
}
