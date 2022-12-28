import deepEqual from 'deep-equal';

/* eslint-disable indent */
type Comparable = string | number;
// eslint-disable-next-line no-unused-vars
type Comparator = (a: Comparable, b: Comparable) => boolean;
type KeyedObj = { [key: string | number | symbol]: Comparable };
type ArrayOptions = 'pre' | 'in' | 'post' | 'level';

class TreeNode<T extends KeyedObj> {
  // eslint-disable-next-line no-use-before-define
  L: null | TreeNode<T>;
  data: T;
  // eslint-disable-next-line no-use-before-define
  R: null | TreeNode<T>;

  /**
   * Instantiates a new tree node.
   *
   * @param val - A generic object of type `T`.
   */
  constructor(val: T) {
    this.L = null;
    this.data = val;
    this.R = null;
  }

  /**
   * Binds the left child of the current node to the `child`
   * argument of type `TreeNode<T>`, where `T` is a generic object.
   */
  setLeftChild(child: TreeNode<T>) {
    this.L = child;
  }

  /**
   * Returns the left child of a given `TreeNode`.
   */
  getLeftChild() {
    return this.L;
  }

  /**
   * Sets the right child of a given `TreeNode`.
   */
  setRightChild(child: TreeNode<T>) {
    this.R = child;
  }

  /**
   * Returns the right child of a given `TreeNode`.
   */
  getRightChild() {
    return this.R;
  }

  /**
   * Returns the data stored in the `TreeNode`.
   */
  get val() {
    return this.data;
  }

  /**
   * Sets the data stored in the `TreeNode`.
   * @param val - A generic object type.
   */
  set val(val: T) {
    this.data = val;
  }

  /**
   * Returns `true` if the `TreeNode` has a
   * left child, and `false` otherwise.
   */
  hasLeftChild() {
    return this.L !== null;
  }

  /**
   * Returns `true` if the given `TreeNode` has
   * a right child, and `false` otherwise.
   */
  hasRightChild() {
    return this.R !== null;
  }

  /**
   * Returns `true` if the `TreeNode` _does not_ have a
   * left _or_ a right child. If the `TreeNode` has a left or
   * a right child, returns `false`.
   */
  get isLeaf() {
    return this.L === null && this.R === null;
  }

  /**
   * Returns `true` if the `TreeNode` has a
   * left _or_ right child.
   */
  get isNonleaf() {
    return this.L !== null || this.R !== null;
  }
}

/**
 * The default comparison function used
 * by the the `BST` instance.
 */
function defaultCMP(a: Comparable, b: Comparable) {
  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b) < 0;
  }
  return a < b;
}

// eslint-disable-next-line no-unused-vars
type NodeOp = <T extends KeyedObj>(a?: TreeNode<T>) => any;

class BST<T extends KeyedObj> {
  KEY: string | number | symbol;
  #cmp: Comparator;
  ROOT: TreeNode<T> | null;

  /**
   * Returns a new binary search tree whose nodes are
   * objects of type generic type `T`.
   *
   * @param key - A key of the object type `T`. This key must be unique,
   * since a binary search tree relies on comparison for its operations.
   *
   * @param cmp - The comparison function to use for binary search tree
   * operations. The comparison function will use the `key` provided
   * to index into the objects stored as nodes. The values mapped to the keys
   * are then used to perform the comparison.
   *
   * @example If the objects stored are of the form
   *
   * ```
   * {id: string, age: number};
   * ```
   *
   * then either `id` or `age` may
   * be used as keys. If the `age` property is used,
   * then a comparison function might be:
   *
   * ```
   * (a: number, b: number) => a < b
   * ```
   *
   */
  constructor(key: keyof T, cmp: Comparator = defaultCMP) {
    this.ROOT = null;
    this.KEY = key;
    this.#cmp = cmp;
  }

  /**
   * Used to construct a new TreeNode.
   *
   * @internal
   */
  private newNode(node: T) {
    return new TreeNode<T>(node);
  }

  /**
   * Used to make recursive `preorder` calls.
   * @internal
   */
  private preorder(callback: NodeOp) {
    function f(this:any, node: TreeNode<T>) {
      callback.call(this, node);
      if (node.L) f(node.L);
      if (node.R) f(node.R);
    }
    if (this.ROOT !== null) f(this.ROOT);
  }

  /**
   * Used to make recursive `inorder` calls.
   * @internal
   */
  private inorder(callback: NodeOp) {
    function f(this:any, node: TreeNode<T>) {
      if (node.L) f(node.L);
      callback.call(this, node);
      if (node.R) f(node.R);
    }
    if (this.ROOT !== null) f(this.ROOT);
  }

  /**
   * Used to make recursive `postorder` calls.
   * @internal
   */
  private postorder(callback: NodeOp) {
    function f(this:any, node: TreeNode<T>) {
      if (node.L) f(node.L);
      if (node.R) f(node.R);
      callback.call(this, node);
    }
    if (this.ROOT !== null) f(this.ROOT);
  }

  /**
   * Returns the `root` of the tree.
   * @internal
   */
  private root() {
    return this.ROOT;
  }

  /**
   * Returns the height of the tree.
   * If the tree is empty, returns `-1`.
   *
   * Time complexity: `Θ(h)`, where `h`
   * is the height of the tree.
   *
   * @public
   */
  get height(): number {
    if (this.ROOT === null) return -1;
    let LH = 0; // the left height of the tree.
    let RH = 0; // the right height of the tree.
    const f = (node: TreeNode<T>) => {
      if (node === null) return -1;
      LH = node.L ? f(node.L) : 0;
      RH = node.R ? f(node.R) : 0;
      return LH > RH ? LH + 1 : RH + 1;
    };
    return f(this.ROOT);
  }

  /**
   * Inserts a new node into the tree.
   * @param data - The data to store in the node.
   *
   * Time complexity: `Θ(lg n)` for a balanced tree,
   * but deteriorates to `Θ(n)` if the tree is pathological
   * (i.e., the tree is a single, linear chaine of `n` nodes).
   * @public
   */
  public push(data: T) {
    if (this.ROOT === null) {
      const newnode = this.newNode(data);
      this.ROOT = newnode;
      return this;
    }
    let p: TreeNode<T> | null = this.ROOT;
    let r: TreeNode<T> | null = null;
    while (p !== null) {
      r = p;
      if (this.#cmp(data[this.KEY], p.val[this.KEY])) {
        p = p.getLeftChild();
      } else if (
        !this.#cmp(data[this.KEY], p.val[this.KEY]) &&
        data[this.KEY] !== p.val[this.KEY]
      ) {
        p = p.getRightChild();
      } else return this;
    }
    p = this.newNode(data);
    if (this.#cmp(data[this.KEY], (r as TreeNode<T>).val[this.KEY])) {
      (r as TreeNode<T>).setLeftChild(p);
    }
    if (!this.#cmp(data[this.KEY], (r as TreeNode<T>).val[this.KEY])) {
      (r as TreeNode<T>).setRightChild(p);
    }

    return this;
  }

  /**
   * Returns the object queried if
   * it exists in the tree. If the object
   * does not exist in the tree, the method
   * returns `null`.
   *
   * @param obj - An object of type `T`.
   *
   * Time complexity: `Θ(h)`, where `h` is the
   * height of the tree. Depending on how deeply
   * nested `obj` is, `O(h+n)` in the worst case,
   * where `n` is the worst-case linear runtime
   * complexity of node's `deepEqual` function.
   *
   * @public
   */
  public has(obj: T) {
    let p = this.ROOT;
    while (p !== null && obj[this.KEY] !== p.val[this.KEY]) {
      if (this.#cmp(obj[this.KEY], p.val[this.KEY])) p = p.getLeftChild();
      else p = p.getRightChild();
    }
    if (p && deepEqual(p.val, obj)) {
      return p.val;
    }
    return null;
  }

  /**
   * Returns the tree's nodes as an array of the
   * original type `T`.
   *
   * @param order - The order of traversal used to generate
   * the array. Valid options include `in` (inorder),
   * `pre` (preorder), `post` (postorder), and `level` (level-order).
   * Unknown types will return an empty array.
   *
   * Time complexity: Θ(n).
   *
   * @public
   */
  public array(order: ArrayOptions = 'in') {
    let A: any[] = [];
    if (this.ROOT === null) return A;
    switch (order) {
      case 'pre':
        this.preorder((node) => A.push(node?.val[this.KEY]));
        break;
      case 'in':
        this.inorder((node) => A.push(node?.val[this.KEY]));
        break;
      case 'post':
        this.postorder((node) => A.push(node?.val[this.KEY]));
        break;
      case 'level':
      default:
        return [];
    }
    return A;
  }

  /**
   * Prints the binary search tree to the console.
   */
  log() {
    let str = '';
    const f = (node: TreeNode<T>, prefix = '', isLeft = true) => {
      if (node.R !== null) {
        f(node.R, `${prefix}${isLeft ? '│   ' : '    '}`, false);
      }
      str += `${prefix}${isLeft ? '└────' : '┌────'}${JSON.stringify(
        node.data
      ).replace(/"(\w+)"\s*:/g, '$1:')}\n`;
      if (node.L !== null) {
        f(node.L, `${prefix}${isLeft ? '    ' : '│   '}`, true);
      }
    };
    if (this.ROOT !== null) {
      f(this.ROOT);
      console.log(str);
      return 0;
    }
    console.log('{ }');
    return 1;
  }
}

/**
 * Returns a new binary search tree, whose nodes are of type
 * generic object type `T`.
 *
 * @param k - A key of `T` must be passed as an argument,
 * to be used to index into the object for comparisons.
 */
export function binTree<T extends KeyedObj>(k: keyof T) {
  return new BST(k);
}

