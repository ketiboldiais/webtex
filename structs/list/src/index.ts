class ListNode<T> {
  data: T;
  next: ListNode<T> | null = null;
  prev: ListNode<T> | null = null;
  constructor(data: T) {
    this.data = data;
  }
}

class List<T> {
  private _head: ListNode<T> | null;
  private _tail: ListNode<T> | null;
  private _length: number;

  constructor(...data: T[]) {
    this._head = this._tail = null;
    this._length = 0;
    if (0 < data.length) data.forEach((d) => this.add(d));
  }

  // SECTION list.head --------------------------
  /**
   * @description 
   * Returns the first item of the list.
   * If the list is empty, returns null.
   */
  head() {
    if (this._head !== null) {
      return this._head.data;
    }
    return null;
  }
  // SECTION list.tail --------------------------
  /**
   * @description
   * Returns the last item of the list.
   * If the list is empty, returns null.
   */
  tail() {
    if (this._tail !== null) {
      return this._tail.data;
    }
    return null;
  }

  // SECTION list.length --------------------------
  /**
   * @description
   * Returns the length of the list.
   */
  length() {
    return this._length;
  }

  // SECTION list.add --------------------------
  /**
   * @description Inserts a new item at end of the list.
   *
   * @example
   * ~~~
   * const L = list(1,2,3,4);
   * L.add(5);
   * // L is now (1,2,3,4,5);
   * ~~~
   */
  add(item: T, dedup: boolean = false) {
    const node = new ListNode<T>(item);
    if (!this._tail) this._head = this._tail = node;
    else {
      this._tail.next = node;
      node.prev = this._tail;
      this._tail = node;
    }
    this._length++;
    return this;
  }
}

export const list = <T>(...data: T[]) => new List(...data);
