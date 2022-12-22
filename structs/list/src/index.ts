import deepEqual from "deep-equal";
import { rem } from "@webtex/math";

/**
 * Doubly-linked list.
 * @packageDocumentation
 */

/**
 * Implements the nodes used by `List`. All `ListNode` instances
 * have three properties, `data`, `next`, and `prev`.
 * The `data` property takes a generic type. The `next`
 * and `prev` properties are akin to pointers;
 * They take either `null` or a `ListNode` of the
 * same generic type.
 * @public
 */
export class ListNode<T> {
  /**
   * The data stored stored the `ListNode`
   * instance. Data may be of any type.
   */
  data: T;
  /**
   * Pointer to the next element.
   * Manipulating this property directly
   * may break the overall list.
   */
  next: ListNode<T> | null = null;
  /**
   * Pointer to the previous element.
   * Like the `next` pointer, manipulating
   * this property directly may break
   * the overall list.
   */
  prev: ListNode<T> | null = null;
  constructor(data: T) {
    this.data = data;
  }
}

/**
 * Implements the doubly-linked list.
 * @public
 */
export class List<T> {
  /**
   * Stores the list's head (i.e.,
   * the first element of the list.)
   */
  private _head: ListNode<T> | null;
  /**
   * Stores the list's tail (i.e.,
   * the last element of the list).
   */
  private _tail: ListNode<T> | null;
  private _length: number;

  /**
   * Constructs a `List`.
   * @example
   * ```typescript
   * const L = new List(1,2,3,4);
   * // L is the doubly-linked list (1,2,3,4).
   * ```
   * Generic types can be provided:
   * ```typescript
   * const L = new List<{name: string}>({name: 'Sano'}, {name: 'Jenny'});
   * // L is the doubly-linked list ({name: 'Sano'}, {name: 'Jenny'});
   * ```
   * @public
   */
  constructor(...data: T[]) {
    this._head = this._tail = null;
    this._length = 0;
    if (0 < data.length) data.forEach((d) => this.pushLast(d));
  }

  // SECTION - list.head -------------------------------------------------------
  /**
   * Returns the first item of the list. If the list is empty, returns null.
   * @example
   * ```typescript
   * const A = list(1,2,3,4);
   * const B = list.head;
   * // B is 1
   * ```
   */
  get head() {
    if (this._head !== null) {
      return this._head.data;
    }
    return null;
  }
  // SECTION - list.tail -------------------------------------------------------
  /**
   * Returns the last item of the list. If the list is empty, returns null.
   * @example
   * ```typescript
   * const A = list(1,2,3,4);
   * const B = A.tail;
   * // B is 4
   * ```
   */
  get tail() {
    if (this._tail !== null) {
      return this._tail.data;
    }
    return null;
  }

  // SECTION - list.length -----------------------------------------------------
  /**
   * Returns the length of the list.
   * All `List` instances start at length
   * `0`, increment at each newly inserted element,
   * and decrement at each removed element.
   */
  get length() {
    return this._length;
  }
  
  item(position: number=-1) {
  }

  // SECTION - list.push() -----------------------------------------------------
  /**
   * Adds the `item` to the list at the
   * given `position`. If no position is provided,
   * defaults to the last position.
   */
  push(item: T, position: number = -1, unique: boolean = false) {
    const node = new ListNode<T>(item);
    if (this._head === null || this._tail === null) {
      this._head = this._tail = node;
    } else {
      let temp = this._head;
      position = rem(position, this.length);
      if (position === 0) {
        return this.pushFirst(item, unique);
      }
      while (temp !== null && position !== -1) {
        temp = temp.next as ListNode<T>;
        position--;
      }
    }
    this._length++;
    return this;
  }

  // SECTION - list.pushFirst() ------------------------------------------------
  /**
   * Adds an element to the head of the list.
   * @example
   * ```typescript
   * const L = list(1,2,3,4);
   * L.addFirst(0);
   * // L is now (0,1,2,3,4);
   * ```
   */
  pushFirst(item: T, unique: boolean = false) {
    const node = new ListNode<T>(item);
    if (!this._tail || !this._head) {
      this._head = this._tail = node;
    } else {
      node.next = this._head;
      this._head.prev = node;
      this._head = node;
    }
    this._length++;
    return this;
  }

  // SECTION - list.pushLast() -------------------------------------------------
  /**
   * Adds an element to the end of the list.
   * @param item -
   * The list item to include. List items can be arbitrarily complex.
   * @example
   * ```typescript
   * const L = list(1,2,3,4);
   * L.add(5);
   * // L is (1,2,3,4,5)
   * ```
   * @param unique -
   * If `true`, the item is inserted only if it doesn't exist in the list already. If `false`, the item is inserted whether or not it already exists in the list. I.e., if `true`, guard against duplicates, if `false` don't bother. Defaults to `false`.
   * @example
   * ```typescript
   * const L = list(1,2,3,4);
   * L.add(1, true);
   * // L is (1,2,3,4);
   * L.add(1);
   * // L is (1,2,3,4,1);
   * ```
   */
  pushLast(item: T, unique: boolean = false) {
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

  // TODO - list.pop() ---------------------------------------------------------
  /**
   * Removes the at the specified `position`.
   * If no position is specified, removes
   * the last item.
   * @param position - The position of the element
   * to be removed. Positions start at 0.
   * @returns The list item removed.
   */
  pop(position: number = -1) {
  }

  // TODO - list.popFirst() ----------------------------------------------------
  /**
   * Removes the first item
   * in the list. If the list
   * is empty, returns `null`.
   */
  popFirst() {}

  // TODO - list.popLast() -----------------------------------------------------
  /**
   * Removes the last item
   * in the list. If the list
   * is empty, returns `null`.
   */
  popLast() {}

  // TODO - list.clear() -------------------------------------------------------
  /**
   * Removes all items in the
   * list.
   * @returns The empty list.
   */
  clear() {}

  // SECTION - list.array() ----------------------------------------------------
  /**
   * Returns the list as a plain JavaScript array.
   * If the list is empty, returns an empty array.
   * @example
   * ```typescript
   * const A = list(1,2,3,4);
   * const B = A.array();
   * // B is [1,2,3,4]
   * ```
   */
  array() {
    if (this._head === null) {
      return [];
    }
    return [...this];
  }

  // SECTION - list.isEmpty() --------------------------------------------------
  /**
   * Returns `true` if the list
   * is empty, `false` otherwise.
   */
  isEmpty() {
    return this.length === 0;
  }

  // SECTION - list.has() ---------------------------------------------
  /**
   * Returns `true` if the list contains
   * the element, and `false` otherwise.
   * Uses Node's `deepEqual` algorithm to
   * check for equality.
   */
  has(element: T) {
    if (this.isEmpty() || this._head === null || this._tail === null)
      return false;
    let arr = this.array();
    if (typeof element === "object") {
      for (const e in arr) {
        if (deepEqual(e, element, { strict: true })) return false;
      }
      return true;
    } else {
      let set = new Set(arr);
      return set.has(element);
    }
  }

  *iterator(): IterableIterator<T> {
    let current = this._head;
    while (current) {
      yield current.data;
      current = current.next;
    }
  }

  [Symbol.iterator]() {
    return this.iterator();
  }
}

/**
 * Plain function wrapper for `new List()`.
 * @public
 */
export function list<T>(...data: T[]) {
  return new List(...data);
}
