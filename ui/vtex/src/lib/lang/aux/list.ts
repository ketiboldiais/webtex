import { print } from "../utils.js";
import { Maybe } from "./maybe.js";

export class ListNode<T> {
  data: Maybe<T>;
  private next: ListNode<T> | null;
  private prev: ListNode<T> | null;
  constructor(data: T | null) {
    this.data = Maybe.of(data);
    this.next = null;
    this.prev = null;
  }

  isEmpty() {
    return this.data.isNothing();
  }
  static of<K>(data: K | null) {
    return new ListNode<K>(data);
  }
  static none<K>() {
    return new ListNode<K>(null);
  }
  getPrev(): ListNode<T> {
    return this.prev ? this.prev : ListNode.none();
  }
  getNext(): ListNode<T> {
    return this.next ? this.next : ListNode.none();
  }
  setPrevious(node: ListNode<T>) {
    this.prev = node;
    return this;
  }
  setNext(node: ListNode<T>) {
    this.next = node;
    return this;
  }
  setData(data: T | null) {
    this.data = Maybe.of(data);
    return this;
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
    list.traverse((node, index) => {
      const val = node.data.value;
      if (val !== null && callback(val, index)) {
        newList.push(val as K);
      }
    });
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
        ).value;
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
      current = current.getNext();
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
      current = current.getNext();
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
    if (list.head.isEmpty()) {
      return Maybe.none<T>();
    }
    const oldhead = list.head;
    if (list.length === 1) {
      list.head = ListNode.none();
      list.tail = ListNode.none();
    } else {
      list.head = oldhead.getNext();
      list.head.setPrevious(ListNode.none());
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
    if (this.head.isEmpty()) {
      return this.head.data;
    }
    const poppedNode = this.tail;
    if (this.length === 1) {
      this.head = ListNode.none();
      this.tail = ListNode.none();
    } else {
      this.tail = poppedNode.getPrev();
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
    this.traverse((node) => {
      const val = node.data.value;
      if (val === null) {
        result = false;
      } else {
        result = equalityFunction(val, item);
      }
    });
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
    if (list.head.isEmpty()) {
      list.head = newnode;
      list.tail = newnode;
    } else {
      list.tail.setNext(newnode);
      newnode.setPrevious(list.tail);
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
    list.traverse((n) => listClone.push(n.data.value));
    return list;
  }

  *iterator() {
    let current = this.head;
    while (!current.isEmpty()) {
      if (current.data.value !== null) {
        yield current.data.value;
      }
      current = current.getNext();
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
      const val = node.data.value;
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

