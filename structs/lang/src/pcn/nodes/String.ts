import { Node } from './Node.js';
import { NodeType } from '../types';
export class StringVal extends Node {
  value: string;
  type: NodeType;
  constructor(value: string) {
    super(value, 'string');
    this.value = value;
    this.type = 'string';
  }
  get latex() {
    return `${this.value}`;
  }
}
