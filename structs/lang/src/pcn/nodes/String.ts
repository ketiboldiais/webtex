import { Node } from './index.js';
import { NodeType } from '../types.js';

export class StringVal extends Node {
  value: string;
  type: NodeType;
  constructor(value: string) {
    super(value, 'string');
    this.value = value;
    this.type = 'string';
  }
}
