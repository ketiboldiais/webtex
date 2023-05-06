export class ListNode<t> {
  value: t;
  next: ListNode<t> | null = null;
  prev: ListNode<t> | null = null;
  constructor(value: t) {
    this.value = value;
  }
  static of<t>(value: t) {
    return new ListNode<t>(value);
  }
}
export class List<t> {
  _head: ListNode<t> | null = null;
  _tail: ListNode<t> | null = null;
  #length: number = 0;
  constructor() {}
  #rem(a: number) {
    a = Math.trunc(a);
    let b = Math.trunc(this.length());
    return ((a % b) + b) % b;
  }
  #traverse(
    fn: (node: ListNode<t>, index: number) => void,
    stop = this.#length,
  ) {
    if (this._head === null || this._tail === null) return null;
    let i = 0;
    let current = this._head;
    while (i < stop) {
      fn(current, i);
      current = current.next!;
      i++;
    }
  }
  dequeue() {
    return this.popFirst();
  }
  has(value: t) {
    this.#traverse((node) => {
      if (node.value === value) {
        return true;
      }
    });
    return false;
  }
  enqueue(value: t) {
    return this.push(value);
  }

  first() {
    return this._head === null ? null : this._head.value;
  }
  last() {
    return this._tail === null ? null : this._tail.value;
  }
  length() {
    return this.#length;
  }
  
  item(index: number) {
    index = this.#rem(index);
    let out = null;
    this.#traverse((n, i) => {
      if (i === index) out = n.value;
    });
    return out;
  }
  popFirst() {
    if (this._head === null) {
      return null;
    }
    const oldhead = this._head;
    if (this.#length === 1) {
      this._head = null;
      this._tail = null;
    } else {
      this._head = oldhead.next;
      this._head!.prev = null;
      oldhead.next = null;
    }
    this.#length--;
    return oldhead.value;
  }
  filter(callback: (value: t, index: number, list: List<t>) => boolean) {
    const list = new List<t>();
    if (this.isEmpty()) return list;
    this.#traverse((n, i) => {
      if (callback(n.value, i, list)) {
        list.push(n.value);
      }
    });
    return list;
  }
  reduceRight<R>(
    reducer: (accumulator: R, currentValue: t, index: number) => R,
    initialValue: R,
  ) {
    let i = 0;
    const fn = (list: List<t>, initValue: R): R => {
      if (list.isEmpty()) return initValue;
      else {
        const popped = list.popLast();
        if (popped === null) return initValue;
        const updatedValue = reducer(initValue, popped, i++);
        return fn(list, updatedValue);
      }
    };
    return fn(this.clone(), initialValue);
  }
  reduce<R>(
    reducer: (accumulator: R, currentValue: t, index: number) => R,
    initialValue: R,
  ) {
    let i = 0;
    const fn = (list: List<t>, initValue: R): R => {
      if (list.isEmpty()) return initValue;
      else {
        const popped = list.popFirst();
        if (popped === null) return initValue;
        const updatedValue = reducer(initValue, popped, i++);
        return fn(list, updatedValue);
      }
    };
    return fn(this.clone(), initialValue);
  }
  map(callback: (value: t, index: number, list: List<t>) => t) {
    const list = this.clone();
    if (list.isEmpty()) return list;
    list.#traverse((n, i) => {
      n.value = callback(n.value, i, list);
    });
    return list;
  }
  prefix(value: t) {
    const newnode = ListNode.of(value);
    if (this._head === null) {
      this._head = newnode;
      this._tail = newnode;
    } else {
      this._head.prev = newnode;
      newnode.next = this._head;
      this._head = newnode;
    }
    this.#length++;
    return this;
  }
  static isList(n: any): n is List<any> {
    return n instanceof List;
  }
  lastIndexOf(value: t) {
    let index = -1;
    this.#traverse((n, i) => {
      if (n.value === value) {
        index = i;
      }
    });
    return index;
  }
  join(separator: string) {
    return [...this].join(separator);
  }
  push(value: t) {
    const newnode = ListNode.of(value);
    if (this._head === null) {
      this._head = newnode;
      this._tail = newnode;
    } else {
      this._tail!.next = newnode;
      newnode.prev = this._tail;
      this._tail = newnode;
    }
    this.#length++;
    return this;
  }
  reversed() {
    return this.#reverse(this.clone());
  }
  reverse() {
    return this.#reverse(this);
  }
  #reverse(list: List<t>) {
    if (list.isEmpty()) return list;
    let temp = null;
    let current = list._head;
    while (current !== null) {
      temp = current.prev;
      current.prev = current.next;
      current.next = temp;
      current = current.prev;
    }
    if (temp !== null) {
      list._head = temp.prev;
    }
    return list;
  }
  some(fn: (element: t, index: number, list: List<t>) => boolean) {
    this.#traverse((n, i) => {
      if (fn(n.value, i, this)) return true;
    });
    return false;
  }
  string() {
    const out = this.array();
    let str = "";
    for (let i = 0; i < out.length; i++) {
      str += `[${out[i]}]-`;
    }
    str += `null`;
    return str;
  }
  popLast() {
    if (this._head === null) {
      return null;
    }
    const poppedNode = this._tail!;
    if (this.#length === 1) {
      this._head = null;
      this._tail = null;
    } else {
      this._tail = poppedNode.prev!;
      this._tail.next = null;
    }
    this.#length--;
    return poppedNode.value;
  }
  isEmpty() {
    return this.#length === 0;
  }
  isNotEmpty() {
    return this.#length !== 0;
  }
  forEach(callbackFn: (element: t, index: number, list: List<t>) => void) {
    if (this.isEmpty()) return this;
    this.#traverse((n, i) => {
      callbackFn(n.value, i, this);
    });
    return this;
  }
  clear() {
    this._head = null;
    this._tail = null;
    this.#length = 0;
    return this;
  }
  clone() {
    const list = new List<t>();
    if (this.isEmpty()) return list;
    this.#traverse((n) => list.push(n.value));
    return list;
  }
  static of<t>(t: t[]): List<t>;
  static of<t>(...t: t[]): List<t>;
  static of<t>(...t: t[]): List<t> {
    const L = new List<t>();
    for (let i = 0; i < t.length; i++) {
      L.push(t[i]);
    }
    return L;
  }
  array() {
    return [...this];
  }
  *iterator(): IterableIterator<t> {
    let current = this._head;
    while (current !== null) {
      yield current.value;
      current = current.next;
    }
  }
  [Symbol.iterator]() {
    return this.iterator();
  }
  concat(other: List<t>) {
    if (this.isEmpty()) return other;
    const list = this.clone();
    list._tail!.next = other._head;
    other._head!.prev = list._tail;
    return list;
  }
  swap(i: number, j: number) {
    i = this.#rem(i);
    j = this.#rem(j);
    const e_i = this.item(i);
    const e_j = this.item(j);
    const L = this.map((value, index) => {
      if (index === i && e_j !== null) return e_j;
      if (index === j && e_i !== null) return e_i;
      return value;
    });
    return L;
  }
}

