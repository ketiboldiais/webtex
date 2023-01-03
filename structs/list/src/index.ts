import { rem } from '@webtex/math';
import deepEqual from 'deep-equal';

export class ListItem<T> {
  val: T;
  nex: ListItem<T> | null;
  pre: ListItem<T> | null;
  constructor(val: T) {
    this.val = val;
    this.nex = null;
    this.pre = null;
  }
}
export class LIST<T> {
  #head: ListItem<T> | null;
  #tail: ListItem<T> | null;
  #length: number;
  constructor(...values: T[]) {
    this.#head = this.#tail = null;
    this.#length = 0;
    if (values.length > 0) {
      values.forEach((value) => {
        this.push(value);
      });
    }
  }

  reverse() {
    let current = this.#head;
    while (current !== null) {
      let nx = current.nex;
      current.nex = current.pre;
      current.pre = nx;
      this.#head = current;
      current = nx;
    }
    return this;
  }
  clear() {
    this.#head = null;
    this.#tail = null;
    this.#length = 0;
  }
  length() {
    return this.#length;
  }
  first(): T | null {
    return this.#head ? this.#head.val : null;
  }
  last(): T | null {
    return this.#tail ? this.#tail.val : null;
  }
  slice(start: number, end: number) {
    const slicedList = new LIST<T>();
    let range = end - start;
    let index = rem(start, this.#length);
    let currentNode = this.#head;
    for (let i = 0; i < index && currentNode !== null; i++) {
      currentNode = currentNode.nex;
    }
    while (currentNode && range) {
      slicedList.push(currentNode.val);
      currentNode = currentNode.nex ? currentNode.nex : null;
      range--;
    }
    return slicedList;
  }
  insert(item: T, index: number) {
    const newnode = new ListItem<T>(item);
    if (this.#head === null) {
      this.#head = newnode;
      this.#tail = newnode;
      return this;
    }
    index = rem(index, this.#length);
    if (index === 0) return this.unshift(item);
    if (index === this.#length - 1) return this.push(item);
    index = index - 1;
    let leftNode: ListItem<T> = this.#head;
    this.traverse(index, (n: ListItem<T>) => (leftNode = n));
    if (leftNode !== null) {
      const rightNode = leftNode.nex;
      leftNode.nex = newnode;
      newnode.pre = leftNode;
      newnode.nex = rightNode;
      rightNode && (rightNode.pre = newnode);
      this.#length += 1;
    }
    return this;
  }
  push(item: T) {
    const node = new ListItem<T>(item);
    if (this.#head === null || this.#tail === null) {
      this.#head = this.#tail = node;
    } else {
      this.#tail.nex = node;
      node.pre = this.#tail;
      this.#tail = node;
    }
    this.#length += 1;
    return this;
  }
  at(index: number): T | null {
    index = rem(index, this.#length);
    let node = this.#head;
    for (let i = 0; i < index && node !== null; i++) {
      node = node.nex;
    }
    return node && node.val ? node.val : null;
  }
  replaceItem(index: number, item: T) {
    let out = null;
    index = rem(index, this.#length);
    this.traverse(index, (p: ListItem<T>) => {
      out = p.val;
      p.val = item;
    });
    return out;
  }
  indexOf(item: T) {
    let p = this.#head;
    let count = -1;
    while (p !== null) {
      count++;
      if (deepEqual(p.val, item)) return count;
      p = p.nex;
    }
    return -1;
  }
  has(item: T) {
    let head: ListItem<T> | null = this.#head;
    if (this.#head === null) return false;
    while (head !== null) {
      if (deepEqual(head.val, item)) return true;
      head = head.nex;
    }
    return false;
  }
  delete(index: number) {
    index = rem(index, this.#length);
    if (index === 0) return this.shift();
    if (index === this.#length - 1) return this.pop();
    let ptr = this.#head;
    this.traverse(index, (p: ListItem<T>) => (ptr = p));
    if (ptr && ptr.pre && ptr.nex) {
      let out = ptr.val;
      ptr.pre.nex = ptr.nex;
      ptr.nex.pre = ptr.pre;
      ptr.nex = null;
      ptr.pre = null;
      this.#length -= 1;
      return out;
    } else {
      return this;
    }
  }
  shift() {
    if (this.#tail === null || this.#head === null) return null;
    let oldhead = this.#head;
    if (this.#length === 1) {
      this.#head = this.#tail = null;
      return oldhead.val;
    } else {
      this.#head = oldhead.nex;
      if (this.#head !== null) this.#head.pre = null;
      oldhead.nex = null;
    }
    this.#length -= 1;
    return oldhead.val;
  }
  unshift(item: T) {
    const node = new ListItem<T>(item);
    if (this.#head === null) {
      this.#head = this.#tail = node;
    } else {
      this.#head.pre = node;
      node.nex = this.#head;
      this.#head = node;
    }
    this.#length += 1;
    return this;
  }
  pop() {
    if (this.#tail === null) {
      return this;
    } else {
      let saved = this.#tail;
      if (this.#length === 1) {
        this.#head = this.#tail = null;
        return this;
      } else {
        this.#tail = saved.pre;
        if (this.#tail && this.#tail.nex) this.#tail.nex = null;
        saved.pre = null;
        this.#length -= 1;
        return saved.val;
      }
    }
  }
  filter(f: (a: T) => boolean) {
    let newList = new LIST<T>();
    if (this.#head === null) return newList;
    let head: ListItem<T> | null = this.#head;
    while (head !== null) {
      if (f(head.val)) {
        newList.push(head.val);
      }
      head = head.nex;
    }
    return newList;
  }
  *iterator(): IterableIterator<T> {
    let currentItem = this.#head;
    while (currentItem) {
      yield currentItem.val;
      currentItem = currentItem.nex;
    }
  }
  [Symbol.iterator]() {
    return this.iterator();
  }
  array() {
    return [...this];
  }
  forEach(f: (item: T) => any) {
    let p = this.#head;
    while (p !== null) {
      f(p.val);
      p = p.nex;
    }
    return this;
  }
  map(f: (item: T, index: number, list: LIST<T>) => any) {
    let newlist = new LIST<T>();
    let cursor = this.#head;
    let count = 0;
    while (cursor !== null) {
      cursor.val = f(cursor.val, count, this);
      newlist.push(cursor.val);
      count++;
      cursor = cursor.nex;
    }
    return newlist;
  }
  reduce(
    fn: (
      accumulator: any,
      currentValue: T,
      currentIndex: number,
      list: LIST<T>
    ) => any,
    acc: any
  ) {
    let count = -1;
    for (let node of this) {
      count++;
      acc = fn(acc, node, count, this);
    }
    return acc;
  }
  traverse(index: number, f: Function) {
    if (this.#head === null) return null;
    let p: ListItem<T> | null = null;
    if (index <= this.#length >> 1) {
      p = this.#head;
      for (; p !== null && 0 < index; index--) {
        p = p.nex;
      }
      return f(p);
    } else {
      index = this.#length - 1 - index;
      p = this.#tail;
      for (; p !== null && 0 < index; index--) {
        p = p.pre;
      }
      return f(p);
    }
  }
}

export function List<T>(...items: T[]) {
  return new LIST<T>(...items);
}

const L = List({ val: 8 }, { val: 9 }, { val: 6 }, { val: 4 });

const r = L.reduce((n, item) => (n += item.val), 0);
