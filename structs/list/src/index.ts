import { rem } from '@webtex/math'
import deepEqual from 'deep-equal';

/** @internal */
class ListItem<T> {
  val: T;
  nex: ListItem<T> | null;
  pre: ListItem<T> | null;
	index: number;
  constructor(val:T,index:number) {
    this.val = val;
    this.nex = null;
    this.pre = null;
		this.index=index;
  }
}


/** @internal */
class LIST<T> {
  #head: ListItem<T> | null;
  #tail: ListItem<T> | null;
  #length: number;
  constructor(...values: T[]) {
    this.#head = this.#tail = null;
    this.#length = 0;
  }



// LIST.reset ------------------------------------------------------------------
	/**
	 * Empties the list.
	 * @internal
	 */
	clear() {
		this.#head=null;
		this.#tail=null;
		this.#length=0;
	}



// LIST.length -----------------------------------------------------------------
	/**
	 * Returns the length of the list.
	 * @complexity Θ(1).
	 * */
 
  length() {
		return this.#length;
	}




// LIST.first ------------------------------------------------------------------
	/**
	 * Returns the first element of the list.
	 * @complexity Θ(1).
	 * */

  first(): T | null {
    return this.#head ? this.#head.val : null;
  }




// LIST.last -------------------------------------------------------------------
	/**
	 * Returns the last element of the list.
	 * @complexity Θ(1).
	 * */

  last(): T | null {
    return this.#tail ? this.#tail.val : null;
  }
	

// LIST.prefix --------------------------------------------------------------
	/**
	 * Inserts an item at the beginning of the list.
	 * @complexity Θ(1).
	 * */

  prefix(item: T) {
		const node = new ListItem<T>(item, this.#length);
		if (!this.#tail) this.#head = this.#tail = node;
		else {
			this.#tail.nex = node;
			node.pre       = this.#tail;
			this.#tail     = node;
		}
		this.#length += 1;
		return this;
	}




// LIST.postfix ---------------------------------------------------------------
	/**
	 * Inserts an item at end of the list.
	 * @complexity Θ(1).
	 * */

  postfix(item: T) {
		const node = new ListItem<T>(item, this.#length);
		if (this.#head===null) this.#head = this.#tail = node;
		else {
			node.nex       = this.#head;
			this.#head.pre = node;
			this.#head     = node;
		}
		this.#length += 1;
		return this;
	}


// LIST.pop ---------------------------------------------------------------
	/**
	 * Removes the last item of the list.
	 * If the list is empty, returns `null`.
	 * @complexity Θ(1)
	 */
	pop() {
		// handle empty list.
		if (this.#tail === null) return null;
		const saved = this.#tail; 
		// handle 1 item list.
		if (this.#tail.pre === null) { this.clear(); }
		// handle 1+ items list.
		else {
			this.#tail.pre.nex = null;
			this.#tail = this.#tail.pre;
			saved.nex = saved.pre = null;
		}
		this.#length--;
		return saved.val;
	}
	

	
// LIST.lop ----------------------------------------------------------------
	/**
	 * Removes the first item of the list.
	 * If the list is empty, returns `null`.
	 * @complexity Θ(1).
	 */
	
	lop() {
		// handle empty list.
		if (this.#head===null) return null;
		const saved = this.#head;
		// handle 1 item list.
		if (this.#head.nex===null) { this.clear(); }
		// handle 1+ items list.
		else {
			this.#head.nex.pre = null;
			this.#head = this.#head.nex;
			saved.nex = saved.pre = null;
		}
		this.#length--;
		return saved.val;
	}
	

// LIST.push ---------------------------------------------------------------
	


// LIST.pop ---------------------------------------------------------------
	
	
	
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