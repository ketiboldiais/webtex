import { NodeType } from '../types.js';
import { Id, Node, Binding } from './index.js';

export class StructNode extends Binding<any> {
  type: NodeType;
  value: [Id, Map<string, Node>];
  constructor(name: Id, value: Map<string, Node>) {
    super([name, value], 'struct');
    this.value = [name, value];
    this.type = 'struct';
  }
  get isConst(): boolean {
    return false;
  }
  get name(): string {
    return this.value[0].value;
  }
  getVal(name: string): Node {
    return this.value[1].get(name) as Node;
  }
}
