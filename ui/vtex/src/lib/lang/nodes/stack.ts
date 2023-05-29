export class Stack<T> {
  private items: T[] = [];
  private _from<K>(
    startIndex: number,
    check: (i: number) => boolean,
    tick: (i: number) => number,
    f: (item: T, index: number, currentSize: number) => K,
  ) {
    const size = this.size();
    const elems = new Stack<K>();
    for (let i = startIndex; check(i); i = tick(i)) {
      const item = this.items[i];
      if (item !== undefined && item !== null) {
        elems.push(f(item, i, size));
      }
    }
    return elems;
  }

  constructor(items: T[] = []) {
    this.items = items;
  }
  element(i:number) {
    if (i < this.size()) {
      return this.items[i];
    } else return null;
  }

  /**
   * __Mutating Method__.
   * Updates the current peek with the provided callback.
   */
  onPeek(f: (item: T) => T, fallback: T | null = null) {
    let item = this.peek();
    if (item === null) return fallback;
    this.items[this.size() - 1] = f(item);
    return this;
  }

  /**
   * __Immutable Method__.
   * Updates the stack elements from the bottom to the top.
   */
  bottomUp<K>(
    f: (item: T, index: number, currentSize: number) => K,
  ) {
    const size = this.size();
    return this._from(0, (i) => i < size, (i) => i + 1, f);
  }

  /**
   * __Immutable Method__.
   * Updates the stack elements from the top to the bottom.
   */
  topDown<K>(
    f: (item: T, index: number, currentSize: number) => K,
  ) {
    const size = this.size();
    return this._from(size - 1, (i) => i >= 0, (i) => i - 1, f);
  }

  /**
   * __Pure Method__.
   * Returns true if the current peek
   * satisfies the provided callback
   * condition, false otherwise.
   */
  peekIs(f: (x: T) => boolean): boolean {
    let item = this.peek();
    if (item === null) return false;
    return f(item);
  }

  /**
   * __Mutating Method__.
   * Removes all items from the stack.
   */
  clear() {
    this.items = [];
  }

  /**
   * __Immutable Method__.
   * Returns a new, empty stack.
   */
  empty() {
    return new Stack<T>([]);
  }

  /**
   * __Pure Method__.
   * Returns true if this stack is empty.
   */
  isEmpty() {
    return this.items.length === 0;
  }
  /**
   * __Impure Method__.
   * Calls the provided callback
   * function if this stack is empty.
   */
  onEmpty(f: () => void) {
    if (this.isEmpty()) f();
    return this;
  }

  /**
   * __Mutating Method__.
   * Pops an item from the stack
   * and returns it. An optional fallback
   * value may be provided as the default
   * return value in the event the
   * stack is emty.
   */
  pop(fallback: T | null = null) {
    const item = this.items.pop();
    if (item) return item;
    return fallback;
  }

  /**
   * Returns this stack’s current size.
   */
  size() {
    return this.items.length;
  }

  /**
   * __Potentially Unsafe__.
   * Returns the current top of the stack.
   * An optional fallback may be provided
   * in the event the stack is empty (defaults
   * to null).
   */
  peek(fallback: T | null = null) {
    if (this.isEmpty()) return fallback;
    return this.items[this.size() - 1];
  }

  /**
   * __Mutating method__.
   * Inserts the item into the
   * existing stack.
   */
  push(item: T) {
    this.items.push(item);
    return this;
  }

  /**
   * __Immutable Method__.
   * Returns a new stack with the
   * existing items and the provided item
   * inserted.
   */
  add(item: T) {
    const data = this.items;
    return new Stack([...data, item]);
  }
  item(i: number, f: (x: T) => boolean) {
    const element = this.items[i];
    if (element === null || element === undefined) {
      return false;
    }
    return f(element);
  }
  at(index:number, fn: (x:T)=>boolean):boolean {
    const element = this.items[index];
    if (element===null||element===undefined) {
      return false;
    }
    return fn(element);
  }
}
export const stack = <T>(...items: T[]) => new Stack<T>(items);
