import { NodeType } from '../types';

export class Node {
  type: NodeType;
  value: any;
  constructor(value: any, type: NodeType) {
    this.value = value;
    this.type = type;
  }
  get latex() {
    return `${this.value}`;
  }
  get kind() {
    return this.type;
  }
}
