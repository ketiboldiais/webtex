import { anInteger } from './NumParsers.js';

class atom<v, t> {
  value: v;
  type: t;
  constructor(x: v, type: t) {
    this.value = x;
    this.type = type;
  }
  get nil() {
    return this.value === null || this.value === undefined;
  }
  static of<v, t>(value: v, type: t) {
    return new atom<v, t>(value, type as t);
  }
  map<x>(f: (a: v) => x) {
    return this.nil ? this : atom.of(f(this.value), this.type);
  }
}
