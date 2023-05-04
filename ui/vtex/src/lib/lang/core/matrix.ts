type Ns = number[];
type N = number;
import { add, div, minus, mod, pow, quot, rem, root, times } from "./count";

const elementWise = (op: (x: N, y: N) => N) =>
(
  list1: number[],
  list2: number[],
) => {
  const L = list1.length;
  const Vo = [];
  for (let i = 0; i < L; i++) {
    Vo.push(op(list1[i], list2[i]));
  }
  return Vo;
};

export class Vector {
  private _elements: number[];
  private _size: number;
  constructor(elements: number[]) {
    this._elements = elements;
    this._size = elements.length;
  }
  elements() {
    return this._elements;
  }
  size() {
    return this._size;
  }
  private ewBinop(f: (x: number, y: number) => number, other: Vector) {
    if (this.size() !== other.size()) return this;
    return new Vector(elementWise(f)(this.elements(), other.elements()));
  }
  add(other: Vector) {
    return this.ewBinop(add, other);
  }
  minus(other: Vector) {
    return this.ewBinop(minus, other);
  }
  schur(other: Vector) {
    return this.ewBinop(times, other);
  }
  quot(other: Vector) {
    return this.ewBinop(quot, other);
  }
  div(other: Vector) {
    return this.ewBinop(div, other);
  }
  rem(other: Vector) {
    return this.ewBinop(rem, other);
  }
  mod(other: Vector) {
    return this.ewBinop(mod, other);
  }
  pow(other: Vector) {
    return this.ewBinop(pow, other);
  }
  root(other: Vector) {
    return this.ewBinop(root, other);
  }
  private idx(i: number) {
    return mod(i - 1, this.size());
  }
  get(index: number) {
    index = this.idx(index);
    return this.elements()[index];
  }
  set(index: number, value: number) {
    index = this.idx(index);
    const elements = this.elements();
    elements[index] = value;
    return new Vector(elements);
  }
}
