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
export const isnull = (v: any): v is null => v === null;

export const isunsafe = (v: any): v is undefined =>
  v === undefined || typeof v === "undefined";
	
class BinarySearchTree<t> {
  root: tnode<t> | null;
  constructor(public compare: (a: t, b: t) => boolean) {
    this.compare = compare;
    this.root = null;
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
  postorder(fn: (node: tnode<t>) => any): BinarySearchTree<t> {
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
  inorder(fn: (node: tnode<t>) => any): BinarySearchTree<t> {
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
  preorder(fn: (node: tnode<t>) => any): BinarySearchTree<t> {
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
}

function bsTree<t>(comparisonFunciton: (a: t, b: t) => boolean) {
  return new BinarySearchTree<t>(comparisonFunciton);
}

const bst = bsTree((a: number, b: number) => (a >= b));




