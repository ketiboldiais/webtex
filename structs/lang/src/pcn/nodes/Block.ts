import { Node } from './index.js';
import { NodeType } from '../types.js';

export class Block extends Node {
  value: Node[];
  type: NodeType;
  constructor(value: Node[]) {
    super(value, 'block');
    this.value = value;
    this.type = 'block';
  }
}
