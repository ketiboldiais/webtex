import { Node } from './Node.js';
import { Id } from './Id.js';

export abstract class Binding extends Node {
  abstract get name(): string;
  abstract get node(): Node;
}

export class Bind<T extends Node> extends Binding {
  value: [Id, T];
  constructor(value: [Id, T]) {
    super(value, 'assignment-expression');
    this.value = value;
    this.type = 'assignment-expression';
  }
  get name() {
    return this.value[0].value;
  }
  get node() {
    return this.value[1];
  }
}

export class Constant<T extends Node> extends Binding {
  value: [Id, T];
  constructor(value: [Id, T]) {
    super(value, 'const-declaration-expression');
    this.value = value;
    this.type = 'const-declaration-expression';
  }
  get name() {
    return this.value[0].value;
  }
  get node() {
    return this.value[1];
  }
}

export class Variable<T extends Node> extends Binding {
  value: [Id, T];
  constructor(value: [Id, T]) {
    super(value, 'var-declaration-expression');
    this.value = value;
    this.type = 'var-declaration-expression';
  }
  get name() {
    return this.value[0].value;
  }
  get node() {
    return this.value[1];
  }
}
