export class Stack<t> {
  stack: t[];
  constructor() {
    this.stack = [];
  }
  get top() {
    return this.stack[this.stack.length - 1];
  }
  get isNotEmpty() {
    return this.stack.length !== 0;
  }
  get isEmpty() {
    return this.stack.length === 0;
  }
  forEachDo(callbackfn: (value: t, index: number, array: t[]) => t) {
    this.stack = this.stack.map(callbackfn);
  }
  slip() {
    this.stack.splice(0, 1);
  }
  clear() {
    this.stack = [];
  }
  push(d: t) {
    this.stack.push(d);
    return this;
  }
  pop() {
    const out = this.stack.pop();
    return out;
  }
}
