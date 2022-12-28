import { rem } from '@webtex/math'

class ListItem<T> {
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
  }


// LIST.reset ------------------------------------------------------------------
	/**
	 * Used to reset the list.
	 * @private
	 */
	private reset() {
		this.#head=null;
		this.#tail=null;
	}

// LIST.length -----------------------------------------------------------------
	/**
	 * Returns the length of the list.
	 * @complexity Θ(1).
	 * */
 
  length() {
		return this.#length;
	}





// LIST.left -------------------------------------------------------------------
	/**
	 * Returns the first element of the list.
	 * @complexity Θ(1).
	 * */

  left(): T | null {
    return this.#head ? this.#head.val : null;
  }





// LIST.right ------------------------------------------------------------------
	/**
	 * Returns the last element of the list.
	 * @complexity Θ(1).
	 * */

  right(): T | null {
    return this.#tail ? this.#tail.val : null;
  }
	

	


// LIST.pushl ------------------------------------------------------------------
	/**
	 * Inserts an item at the end of the list.
	 * @complexity Θ(1).
	 * */

  pushl(item: T) {
		const node = new ListItem<T>(item);
		if (!this.#tail) this.#head = this.#tail = node;
		else {
			this.#tail.nex = node;
			node.pre       = this.#tail;
			this.#tail     = node;
		}
		this.#length += 1;
		return this;
	}





// LIST.pushr ------------------------------------------------------------------
	/**
	 * Inserts an item at beginning of the list.
	 * @complexity Θ(1).
	 * */

  pushr(item: T) {
		const node = new ListItem<T>(item);
		if (this.#head===null) this.#head = this.#tail = node;
		else {
			node.nex       = this.#head;
			this.#head.pre = node;
			this.#head     = node;
		}
		this.#length += 1;
		return this;
	}




// LIST.popl -------------------------------------------------------------------
	/**
	 * Removes the last item of the list.
	 * If the list is empty, returns `null`.
	 * @complexity Θ(1)
	 */
	popr() {
		// handle empty list.
		if (this.#tail === null) return null;
		const saved = this.#tail; 
		// handle 1 item list.
		if (this.#tail.pre === null) { this.reset(); }
		// handle 1+ items list.
		else {
			this.#tail.pre.nex = null;
			this.#tail = this.#tail.pre;
			saved.nex = saved.pre = null;
		}
		this.#length--;
		return saved.val;
	}
	
// LIST.popl -------------------------------------------------------------------
	/**
	 * Removes the first item of the list.
	 * If the list is empty, returns `null`.
	 * @complexity Θ(1).
	 */
	
	popl() {
		// handle empty list.
		if (this.#head===null) return null;
		const saved = this.#head;
		// handle 1 item list.
		if (this.#head.nex===null) { this.reset(); }
		// handle 1+ items list.
		else {
			this.#head.nex.pre = null;
			this.#head = this.#head.nex;
			saved.nex = saved.pre = null;
		}
		this.#length--;
		return saved.val;
	}
// LIST.setFirst ---------------------------------------------------------------
	/**
	 * Replaces the first item of the list with the argument.
	 * @complexity Θ(1).
	 * */

  setFirst(item: T) {}





// LIST.setLast ----------------------------------------------------------------
	/**
	 * Replaces the last item of the list with the argument.
	 * @complexity Θ(1).
	 * */

  setLast(item: T) {}






// LIST.has --------------------------------------------------------------------
	/**
	 * Returns `true` if the item is in the list, `false` otherwise.
	 * @complexity Θ(n), O(n²).
	 * */
 
  has(item: T) {}
}

export function List<T>(...items:T[]) {
	return new LIST<T>(...items);
}