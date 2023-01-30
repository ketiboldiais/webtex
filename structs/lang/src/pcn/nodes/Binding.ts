import { Node, Id } from './index.js';
import { NodeType } from '../types.js';

export abstract class Binding<T extends Node> extends Node {
  value: [Id, T];
  type: NodeType;
  constructor(value: [Id, T], type: NodeType) {
    super(value, type);
    this.value = value;
    this.type = type;
  }
  abstract get isConst(): boolean;
  abstract get name(): string;
  abstract getVal(name?:string): Node;
}

export class Bind<T extends Node> extends Binding<T> {
  value: [Id, T];
  constructor(value: [Id, T]) {
    super(value, 'assignment-expression');
    this.value = value;
    this.type = 'assignment-expression';
  }
  get isConst() {
    return false;
  }
  get name() {
    return this.value[0].value;
  }
  getVal() {
    return this.value[1];
  }
  setVal(node: T) {
    this.value[1] = node;
  }
}

export class Constant<T extends Node> extends Binding<T> {
  value: [Id, T];
  constructor(value: [Id, T]) {
    super(value, 'const-declaration-expression');
    this.value = value;
    this.type = 'const-declaration-expression';
  }
  get isConst() {
    return true;
  }
  get name() {
    return this.value[0].value;
  }
  getVal() {
    return this.value[1];
  }
  setVal(node: T) {
    this.value[1] = node;
  }
}

export class Variable<T extends Node> extends Binding<T> {
  value: [Id, T];
  constructor(value: [Id, T]) {
    super(value, 'var-declaration-expression');
    this.value = value;
    this.type = 'var-declaration-expression';
  }
  get isConst() {
    return false;
  }
  get name() {
    return this.value[0].value;
  }
  getVal() {
    return this.value[1];
  }
  setVal(node: T) {
    this.value[1] = node;
  }
}
