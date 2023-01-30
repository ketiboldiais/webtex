import { Node } from "./index.js";

export class Id extends Node {
  value: string;
  constructor(value: string) {
    super(value, 'identifier');
    this.value = value;
    this.type = 'identifier';
  }
}
