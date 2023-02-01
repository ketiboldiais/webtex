import { ErrorType } from '../types.js';
import { Node } from './index.js';

export class Rot extends Node {
  value: string;
  type: ErrorType;
  constructor(message: string, type: ErrorType) {
    super(message, type);
    this.type = type;
    this.value = `Error: ${message}`;
  }
}
