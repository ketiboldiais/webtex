import { Box, box } from "./box.js";

type $ListNode<T> = {
  data: T;
  next: T;
  prev: T;
};
type LN<T> = ListNode<T> | null;
export class ListNode<T> {
  data: Box<T>;
  private next: LN<T>;
  private prev: LN<T>;
  constructor(
    data: T | null,
  ) {
    this.data = box(data);
    this.next = null;
    this.prev = null;
  }
  setNext(node: ListNode<T>) {
    this.next = node;
    return this;
  }
  setPrev(node: ListNode<T>) {
    this.prev = node;
    return this;
  }
  nil() {
    return this.data.isNone();
  }
  static of<x>(data: x | null) {
    return new ListNode<x>(data);
  }
  static none<x>() {
    return new ListNode<x>(null);
  }
  pre(): ListNode<T> {
    return this.prev ? this.prev : ListNode.none();
  }
  nxt(): ListNode<T> {
    return this.next ? this.next : ListNode.none();
  }
}

export class List<T> {
  head: ListNode<T>;
  tail: ListNode<T>;
  length: number;
  constructor() {
    this.head = ListNode.none();
    this.tail = ListNode.none();
    this.length = 0;
  }

  private rem(index: number) {
    const a = Math.trunc(index);
    const b = Math.trunc(this.length);
    return ((a % b) + b) % b;
  }

  filter<K extends T>(
    callback: (value: T, index: number) => value is K,
  ) {
    const list = this;
    const newList = new List<K>();
    if (list.isEmpty()) return newList;
    list.traverse((node, index) =>
      node.data.map((v) => {
        if (callback(v, index)) newList.push(v);
        return v;
      })
    );
    return newList;
  }

  private __reduce__<X>(
    from: 0 | 1,
    reducer: (accumulator: X, currentValue: T, index: number) => X,
    initialValue: X,
  ) {
    let i = 0;
    const fn = (list: List<T>, initValue: X): X => {
      if (list.isEmpty()) return initValue;
      else {
        const popped = (
          from === 0 ? list.lop() : list.pop()
        ).val();
        if (popped === null) return initValue;
        const updatedValue = reducer(initValue, popped, i++);
        return fn(list, updatedValue);
      }
    };
    return fn(this.clone(), initialValue);
  }

  reduceRight<X>(
    reducer: (accumulator: X, currentValue: T, index: number) => X,
    initialValue: X,
  ) {
    return this.__reduce__(1, reducer, initialValue);
  }

  reduce<X>(
    reducer: (accumulator: X, currentValue: T, index: number) => X,
    initialValue: X,
  ) {
    return this.__reduce__(0, reducer, initialValue);
  }

  traverse(
    traverser: (node: ListNode<T>, index: number) => void,
    stop?: number,
  ) {
    const list = this;
    stop = typeof stop === "number" ? stop : list.length;
    let i = 0;
    let current = this.head;
    while (i < stop) {
      traverser(current, i);
      current = current.nxt();
      i++;
    }
  }

  /**
   * Returns true if this list is empty,
   * false otherwise.
   */
  isEmpty() {
    return this.length === 0;
  }

  /**
   * Returns the first item
   * in the list.
   */
  first() {
    return this.head.data;
  }
  /**
   * Returns the last item
   * in the list.
   */
  last() {
    return this.tail.data;
  }

  /**
   * Returns a `Maybe` of type `T` (the
   * list’s type) at the given index.
   */
  item(index: number) {
    const list = this;
    index = list.rem(index);
    let current = this.head;
    let i = 0;
    while (i < index) {
      current = current.nxt();
      i++;
    }
    return current.data;
  }

  /**
   * Removes the first item in the list.
   * A fallback value must be provided
   * to ensure the list never returns
   * undefined.
   */
  lop() {
    const list = this;
    if (list.head.nil()) {
      return box<T>(null);
    }
    const oldhead = list.head;
    if (list.length === 1) {
      list.head = ListNode.none();
      list.tail = ListNode.none();
    } else {
      list.head = oldhead.nxt();
      list.head.setPrev(ListNode.none());
      oldhead.setNext(ListNode.none());
    }
    list.length--;
    return oldhead.data;
  }

  /**
   * Removes the last item in the
   * list, returning the item
   * as a `Maybe` of type `T`.
   */
  pop() {
    if (this.head.nil()) {
      return this.head.data;
    }
    const poppedNode = this.tail;
    if (this.length === 1) {
      this.head = ListNode.none();
      this.tail = ListNode.none();
    } else {
      this.tail = poppedNode.pre();
      this.tail.setNext(ListNode.none());
    }
    this.length--;
    return poppedNode.data;
  }

  /**
   * Returns true if the given item exists in the list.
   * By default, the equality is verified with `===`.
   * As such, this will fail for non-primitive values.
   * For complex objects, pass specified equality
   * functions.
   */
  has(
    item: T,
    equalityFunction: (target: T, item: T) => boolean = (a, b) => a === b,
  ) {
    let result = false;
    this.traverse((node) =>
      node.data.map((v) => {
        if (equalityFunction(v, item)) result = true;
        return v;
      })
    );
    return result;
  }

  dequeue() {
    return this.lop();
  }
  enqueue(item: T) {
    return this.push(item);
  }

  /**
   * Inserts a new item
   * into the list and returns
   * the list.
   */
  push(item: T | null) {
    const list = this;
    const newnode = ListNode.of(item);
    if (list.head.nil()) {
      list.head = newnode;
      list.tail = newnode;
    } else {
      list.tail.setNext(newnode);
      newnode.setPrev(list.tail);
      list.tail = newnode;
    }
    this.length++;
    return list;
  }
  /**
   * Inserts multiple items into
   * the list.
   *
   * @param items - An array of items to insert.
   */
  add(items: T[]) {
    const list = this;
    const count = items.length;
    for (let i = 0; i < count; i++) {
      list.push(items[i]);
    }
    return list;
  }

  clone() {
    const list = this;
    const listClone = new List<T>();
    if (list.isEmpty()) return listClone;
    list.traverse((node) =>
      node.data.map((v) => {
        listClone.push(v);
        return v;
      })
    );
    return list;
  }

  *iterator() {
    let current = this.head;
    while (!current.nil()) {
      const d = current.data;
      if (d.isSome()) {
        yield d.val()!;
      }
      current = current.nxt();
    }
  }
  [Symbol.iterator]() {
    return this.iterator();
  }

  toArray(): Array<T> {
    return [...this];
  }

  map<K>(callback: (value: T, index: number) => K) {
    const list = this;
    const newList = new List<K>();
    if (list.isEmpty()) return newList;
    list.traverse((node, index) => {
      const val = node.data.val();
      if (val !== null) {
        const item = callback(val, index);
        newList.push(item);
      }
    });
    return newList;
  }
  clear() {
    this.head = ListNode.none();
    this.tail = ListNode.none();
    this.length = 0;
    return this;
  }
}

export const list = <T>(...data: T[]) => new List<T>().add(data);
