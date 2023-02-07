class tnode<t> {
  public value: t;
  public left: tnode<t> | null;
  public right: tnode<t> | null;
  constructor(value: t) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}
function isnull(v: any): v is null {
  return v === null;
}
function isunsafe(v: any): v is undefined | null {
  return v === undefined || typeof v === 'undefined' || v === null;
}

/**
 *
 * Case: parent.value < newnode.value => add to right
 * Case: parent has no right child.
 * Either:
 *   •p
 *   /
 *
 * Or:
 *
 *   •p
 *
 *
 *
 * Case: parent has a right child.
 * Either:
 *   •p
 *     \
 * Or:
 *
 *  •p
 *  / \
 *
 * So, traverse right-subtee.
 *
 *
 *
 * Case: parent has no left child.
 * Either:
 *   •p
 *
 * Or:
 *
 *   •p
 *   /
 *
 *
 *
 * Case: parent has a left child.
 * Either:
 *   •p
 *   /
 * Or:
 *   •p
 *   / \
 * So, traverse left-subtree.
 */

/** Implements a binary-search tree. */
class BinarySearchTree<t> {
  root: tnode<t> | null;
  constructor(public compare: (a: t, b: t) => boolean) {
    this.compare = compare;
    this.root = null;
  }
  postorder(fn: (node: tnode<t>) => any) {
    if (isnull(this.root)) return this;
    const post = (node: tnode<t>) => {
      if (!isnull(node.left)) post(node.left);
      if (!isnull(node.right)) post(node.right);
      fn(node);
      return node;
    };
    post(this.root);
    return this;
  }
  inorder(fn: (node: tnode<t>) => any) {
    if (isnull(this.root)) return this;
    const ino = (node: tnode<t>) => {
      if (!isnull(node.left)) ino(node.left);
      fn(node);
      if (!isnull(node.right)) ino(node.right);
      return node;
    };
    ino(this.root);
    return this;
  }
  preorder(fn: (node: tnode<t>) => any) {
    if (isnull(this.root)) return this;
    const pre = (node: tnode<t>) => {
      fn(node);
      if (!isnull(node.left)) pre(node.left);
      if (!isnull(node.right)) pre(node.right);
      return node;
    };
    pre(this.root);
    return this;
  }
  insert(...values: t[]): BinarySearchTree<t> {
    let tree = this;
    values.forEach((value) => tree.push(value));
    return tree;
  }
  push(value: t): BinarySearchTree<t> {
    const dfs = (node: tnode<t> | null) => {
      if (node === null) return new tnode(value);
      if (this.compare(value, node.value)) node.right = dfs(node.right);
      else node.left = dfs(node.left);
      return node;
    };
    this.root = dfs(this.root);
    return this;
  }
}

function bsTree<t>(comparisonFunciton: (a: t, b: t) => boolean) {
  return new BinarySearchTree<t>(comparisonFunciton);
}

const bst = bsTree((a: number, b: number) => a >= b);

enum color {
  red = 'red',
  black = 'black',
}

class rbnode<t> {
  value: t;
  color: color;
  parent: rbnode<t> | null;
  left: rbnode<t> | null;
  right: rbnode<t> | null;
  #leftchild: boolean;
  constructor(value: t) {
    this.value = value;
    this.parent = this.left = this.right = null;
    this.color = color.red;
    this.#leftchild = false;
  }
  get isLeftChild() {
    return this.#leftchild;
  }
  set isLeftChild(b: boolean) {
    this.#leftchild = b;
  }
}

/**
 * Red-black tree rules:
 * 1. The root is always black.
 * 2. New nodes are always red. The add method already handles this.
 * 3. Nulls are black. Cormen et. al. handles this with a NIL sentinel.
 *    That sentinel is trivial in a language like C++ or C, but far too
 *    cumbersome with TypeScript. We will verify this assumption by hand.
 * 4. No two consecutive red nodes. This is the primary, defining rule of
 *    red-black trees.
 * 5. Same number of black nodes on every path from root to leaf. This check
 *    is done after every tree manipulation.
 *
 * Two manipulation methods:
 * 1. If the node has a black aunt, we rotate.
 *    Either of:
 *    1. left-left
 *    2. right-right
 *    3. left-right
 *    4. right-left
 * 2. If the node has a red aunt, we color flip.
 *
 * After performing these methods, we have either:
 *
 *      red
 *     /   \
 *  black black
 *
 * Or:
 *
 *     black
 *     /   \
 *   red   red
 */

class RedBlackTree<t> {
  root: rbnode<t> | null;
  size: number;
  compare: (a: t, b: t) => boolean;
  constructor(compare: (a: t, b: t) => boolean) {
    this.compare = compare;
    this.root = null;
    this.size = 0;
  }
  checkColor(newnode: rbnode<t>) {}
  push(value: t) {
    if (isunsafe(value)) return this;
    else if (isnull(this.root)) {
      this.root = new rbnode(value);
      this.size += 1;
      return this;
    } else {
      const add = (parent: rbnode<t>, newnode: rbnode<t>): rbnode<t> => {
        if (this.compare(parent.value, newnode.value)) {
          if (isnull(parent.right)) {
            parent.right = newnode;
            newnode.parent = parent;
            newnode.isLeftChild = false;
            return newnode;
          }
          return add(parent.right, newnode);
        }
        if (isnull(parent.left)) {
          parent.left = newnode;
          newnode.parent = parent;
          newnode.isLeftChild = true;
          return newnode;
        }
        return add(parent.left, newnode);
      };
      const newnode = new rbnode(value);
      add(this.root, newnode);
      this.size += 1;
      this.checkColor(newnode);
      return this;
    }
  }
}

const redBlackTree = <t>(compareFunction: (a: t, b: t) => boolean) => {
  return new RedBlackTree(compareFunction);
};

const rbt = redBlackTree((a: number, b: number) => a >= b);

rbt.push(5).push(8).push(3).push(2);

console.log(rbt);
