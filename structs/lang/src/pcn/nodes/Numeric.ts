import { Node } from './Node.js';
import { NumberType } from '../types';

export class Numeric extends Node {
  value: number | [number, number];
  type: NumberType;
  constructor(value: number | [number, number], type: NumberType) {
    super(value, type);
    this.value = value;
    this.type = type;
  }
  get norm(): number {
    switch (this.type) {
      case 'integer':
      case 'natural':
      case 'real':
        return this.value as number;
      case 'rational':
        return (
          (this.value as [number, number])[0] /
          (this.value as [number, number])[1]
        );
      case 'scientific':
        return (
          (this.value as [number, number])[0] *
          10 ** (this.value as [number, number])[1]
        );
      default:
        return Infinity;
    }
  }
}

export class Inf extends Numeric {
  value: number;
  type: 'inf';
  constructor() {
    super(Infinity, 'inf');
    this.value = Infinity;
    this.type = 'inf';
  }
  get latex() {
    return `\\infty`;
  }
}

export class Rational extends Numeric {
  value: [number, number];
  type: NumberType;
  constructor(value: [number, number]) {
    super(value, 'rational');
    this.value = value;
    this.type = 'rational';
  }
  get latex() {
    return `\\frac{${this.value[0]}}{${this.value[1]}}`;
  }
}

export class Integer extends Numeric {
  value: number;
  type: NumberType;
  constructor(value: number) {
    super(value, 'integer');
    this.value = value;
    this.type = 'integer';
  }
  get latex() {
    return `${this.value}`;
  }
}

export class Real extends Numeric {
  value: number;
  type: NumberType;
  constructor(value: number) {
    super(value, 'real');
    this.value = value;
    this.type = 'real';
  }
  get latex() {
    return `${this.value}`;
  }
}

export class Natural extends Numeric {
  value: number;
  type: NumberType;
  constructor(value: number) {
    super(value, 'natural');
    this.value = value;
    this.type = 'natural';
  }
  get latex() {
    return `${this.value}`;
  }
}

export class Scientific extends Numeric {
  value: [number, number];
  type: NumberType;
  constructor(value: [number, number]) {
    super(value, 'scientific');
    this.value = value;
    this.type = 'scientific';
  }
  get latex() {
    return `{ {${this.value[0]}} {\\times} {10^${this.value[1]}} }`;
  }
}
