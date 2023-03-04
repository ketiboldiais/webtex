class ListNode<t> {
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
  #head: ListNode<t> | null = null;
  #tail: ListNode<t> | null = null;
  #length: number = 0;
  constructor() {}
  #rem(a: number, b: number) {
    a = Math.trunc(a);
    b = Math.trunc(b);
    return ((a % b) + b) % b;
  }
  #traverse(
    fn: (node: ListNode<t>, index: number) => void,
    stop = this.#length,
  ) {
    if (this.#head === null || this.#tail === null) return null;
    let i = 0;
    let current = this.#head;
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

  get first() {
    return this.#head === null ? null : this.#head.value;
  }
  get last() {
    return this.#tail === null ? null : this.#tail.value;
  }
  get length() {
    return this.#length;
  }
  setItem(index: number) {
    return {
      as: (value: t) => {
        index = this.#rem(index, this.#length);
        this.#traverse((n, i) => {
          if (i === index) {
            n.value = value;
          }
        });
        return this;
      },
    };
  }
  item(index: number) {
    index = this.#rem(index, this.#length);
    let out = null;
    this.#traverse((n, i) => {
      if (i === index) out = n.value;
    });
    return out;
  }
  popFirst() {
    if (this.#head === null) {
      return null;
    }
    const oldhead = this.#head;
    if (this.#length === 1) {
      this.#head = null;
      this.#tail = null;
    } else {
      this.#head = oldhead.next;
      this.#head!.prev = null;
      oldhead.next = null;
    }
    this.#length--;
    return oldhead.value;
  }
  filter(callback: (value: t, index: number, list: List<t>) => boolean) {
    const list = new List<t>();
    if (this.isEmpty) return list;
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
      if (list.isEmpty) return initValue;
      else {
        const popped = list.popLast();
        if (popped === null) return initValue;
        const updatedValue = reducer(initValue, popped, i++);
        return fn(list, updatedValue);
      }
    };
    return fn(this.clone, initialValue);
  }
  reduce<R>(
    reducer: (accumulator: R, currentValue: t, index: number) => R,
    initialValue: R,
  ) {
    let i = 0;
    const fn = (list: List<t>, initValue: R): R => {
      if (list.isEmpty) return initValue;
      else {
        const popped = list.popFirst();
        if (popped === null) return initValue;
        const updatedValue = reducer(initValue, popped, i++);
        return fn(list, updatedValue);
      }
    };
    return fn(this.clone, initialValue);
  }
  map(callback: (value: t, index: number, list: List<t>) => t) {
    const list = this.clone;
    if (list.isEmpty) return list;
    list.#traverse((n, i) => {
      n.value = callback(n.value, i, list);
    });
    return list;
  }
  prefix(value: t) {
    const newnode = ListNode.of(value);
    if (this.#head === null) {
      this.#head = newnode;
      this.#tail = newnode;
    } else {
      this.#head.prev = newnode;
      newnode.next = this.#head;
      this.#head = newnode;
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
    if (this.#head === null) {
      this.#head = newnode;
      this.#tail = newnode;
    } else {
      this.#tail!.next = newnode;
      newnode.prev = this.#tail;
      this.#tail = newnode;
    }
    this.#length++;
    return this;
  }
  reversed() {
    return this.#reverse(this.clone);
  }
  reverse() {
    return this.#reverse(this);
  }
  #reverse(list: List<t>) {
    if (list.isEmpty) return list;
    let temp = null;
    let current = list.#head;
    while (current !== null) {
      temp = current.prev;
      current.prev = current.next;
      current.next = temp;
      current = current.prev;
    }
    if (temp !== null) {
      list.#head = temp.prev;
    }
    return list;
  }
  some(fn: (element: t, index: number, list: List<t>) => boolean) {
    this.#traverse((n, i) => {
      if (fn(n.value, i, this)) return true;
    });
    return false;
  }
  get string() {
    const out = this.array;
    let str = "";
    for (let i = 0; i < out.length; i++) {
      str += `[${out[i]}] ⟶ `;
    }
    str += `null`;
    return str;
  }
  popLast() {
    if (this.#head === null) {
      return null;
    }
    const poppedNode = this.#tail!;
    if (this.#length === 1) {
      this.#head = null;
      this.#tail = null;
    } else {
      this.#tail = poppedNode.prev!;
      this.#tail.next = null;
    }
    this.#length--;
    return poppedNode.value;
  }
  get isEmpty() {
    return this.#length === 0;
  }
  get isNotEmpty() {
    return this.#length !== 0;
  }
  forEach(callbackFn: (element: t, index: number, list: List<t>) => void) {
    if (this.isEmpty) return this;
    this.#traverse((n, i) => {
      callbackFn(n.value, i, this);
    });
    return this;
  }
  clear() {
    this.#head = null;
    this.#tail = null;
    this.#length = 0;
    return this;
  }
  get clone() {
    const list = new List<t>();
    if (this.isEmpty) return list;
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
  get array() {
    return [...this];
  }
  *iterator(): IterableIterator<t> {
    let current = this.#head;
    while (current !== null) {
      yield current.value;
      current = current.next;
    }
  }
  [Symbol.iterator]() {
    return this.iterator();
  }
}
