import { Node, Block, Id } from './index.js';
import { NodeType } from '../types.js';

export class Fun extends Node {
  value: { name: Id; params: Id[]; body: Block | Node };
  type: NodeType;
  constructor(name: Id, params: Id[], body: Block | Node) {
    super({ name, params, body }, 'function-definition');
    this.value = { name, params, body };
    this.type = 'function-definition';
  }
}
