import { Node } from './Node';
import { NodeType } from '../types';

export class Block extends Node {
  value: Node[];
  type: NodeType;
  constructor(value: Node[]) {
    super(value, 'block');
    this.value = value;
    this.type = 'block';
  }
}
