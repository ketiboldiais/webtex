import { Node } from './Node';

export class Nil extends Node {
  constructor() {
    super(null, 'null');
    this.value = null;
    this.type = 'null';
  }
}
