import { NodeType } from '../types.js';

export class Node {
  type: NodeType;
  value: any;
  constructor(value: any, type: NodeType) {
    this.value = value;
    this.type = type;
  }
  read() {
    return this.value;
  }
  get kind() {
    return this.type;
  }
}
