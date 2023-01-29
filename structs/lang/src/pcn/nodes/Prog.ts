import { NodeType } from '../types';
import { Node } from './Node';

export class Prog extends Node {
  value: Node[];
  type: NodeType;
  constructor(value: Node[]) {
    super(value, 'program');
    this.value = value;
    this.type = 'program';
  }
}
