export class Stack<T> {
  private items: T[];
  constructor(items: T[] = []) {
    this.items = items;
  }
  onPeek(f: (item: T) => T) {
    let item = this.peek();
    if (item === null) return this;
    this.items[this.size() - 1] = f(item);
    return this;
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
export const stack = <T>(...items: T[]) => new Stack(items);
