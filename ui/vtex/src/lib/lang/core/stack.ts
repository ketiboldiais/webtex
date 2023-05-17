import { print } from "../utils.js";

export class Stack<T> {
  private items: T[] = [];
  constructor(items: T[] = []) {
    this.items = items;
  }
  onPeek(f: (item: T) => T, fallback: T | null = null) {
    let item = this.peek();
    if (item === null) return fallback;
    this.items[this.size() - 1] = f(item);
    return this;
  }
  forEachLeft(f: (item: T, index:number, currentSize:number) => T) {
    const size = this.size();
    for (let i = 0; i < size; i++) {
      const item = this.items[i];
      if (item !== undefined && item !== null) {
        this.items[i] = f(item, i, size);
      }
    }
    return this;
  }
  forEachRight(f: (item: T, index:number, currentSize:number) => T) {
    const size = this.size();
    for (let i = size - 1; i >= 0; i--) {
      const item = this.items[i];
      if (item !== undefined && item !== null) {
        this.items[i] = f(item, i, size);
      }
    }
    return this;
  }
  at(index:number, fn: (x:T)=>boolean):boolean {
    const element = this.items[index];
    if (element===null||element===undefined) {
      return false;
    }
    return fn(element);
  }
  peekIs(f: (x: T) => boolean): boolean {
    let item = this.peek();
    if (item === null) return false;
    return f(item);
  }
  clear() {
    this.items = [];
  }
  isEmpty() {
    return this.items.length === 0;
  }
  pop() {
    const item = this.items.pop();
    if (item) return item;
    return null;
  }
  size() {
    return this.items.length;
  }
  peek() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items[this.size() - 1];
  }
  push(item: T) {
    this.items.push(item);
    return this;
  }
}
export const stack = <T>(...items: T[]) => new Stack<T>(items);

