import { ErrorType } from '../types';
import { Node } from './Node';

export class Glitch extends Node {
  value: string;
  type: ErrorType;
  constructor(message: string, type: ErrorType) {
    super(message, type);
    this.type = type;
    this.value = `${this.type} | ${message}`;
  }
  get latex() {
    return `\\text{${this.value}}`;
  }
}
