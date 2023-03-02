export class Q<t> {
  private _value: t;
  private _next: Q<t> | null;
  set value(value: t) {
    this._value = value;
  }
  get value() {
    return this._value;
  }
  get next() {
    return this._next;
  }
  set next(v: Q<t> | null) {
    this._next = v;
  }
  constructor(value: t) {
    this._value = value;
    this._next = null;
  }
}
export interface Queue<T> {
  first: Q<T> | null;
  last: Q<T> | null;
  size: number;
}

export class Queue<T> {
  constructor() {
    this.first = null;
    this.last = null;
    this.size = 0;
  }
  reverse() {
    if (this.size <= 1) return this;
    let previous = null;
    let node = this.first;
    let tmp;
    this.last = this.first;
    let i = this.size;
    while (node && i >= 0) {
      tmp = node.next;
      node.next = previous;
      previous = node;
      node = tmp;
      i--;
    }
    this.first = previous;
    return this;
  }
  dequeue() {
    if (this.first === null) return null;
    let temp = this.first;
    if (this.first === this.last) this.last = null;
    this.first = this.first.next;
    this.size--;
    return temp.value;
  }
  push(value: T[]) {
    for (let i = 0; i < value.length; i++) {
      this.enqueue(value[i]);
    }
    return this;
  }
  enqueue(val?: T) {
		if (val===undefined) return this;
    const newnode = new Q<T>(val);
    if (this.last === null) {
      this.first = newnode;
      this.last = newnode;
    } else {
      this.last.next = newnode;
      this.last = newnode;
    }
    this.size++;
    return this;
  }
  get array() {
    let out = [];
    let p = this.first;
    while (p !== null) {
      out.push(p.value);
      p = p.next;
    }
    return out;
  }
  get string() {
    const out = this.array;
    let str = "";
    for (let i = 0; i < out.length; i++) {
      str += `[${out[i]}] ⟶ `;
    }
    str += `${this.last!.next}`;
    return str;
  }
}
