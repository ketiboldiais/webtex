import {isnull, isunsafe} from "./bstree.js";

enum color {
  red = "red",
  black = "black",
}

class rbnode<t> {
  value: t;
  color: color;
  parent: rbnode<t> | null;
  left: rbnode<t> | null;
  right: rbnode<t> | null;
  isLeftChild:boolean;
  constructor(value: t) {
    this.value = value;
    this.parent = this.left = this.right = null;
    this.color = color.red;
    this.isLeftChild = false;
  }
  get isBlack() {
    return this.color === color.black ||
      (this.left === null && this.right === null);
  }
  get isRed() {
    return !this.isBlack;
  }
}

class RedBlackTree<t> {
  root: rbnode<t> | null;
  size: number;
  compare: (a: t, b: t) => boolean;
  constructor(compare: (a: t, b: t) => boolean) {
    this.compare = compare;
    this.root = null;
    this.size = 0;
  }
  push(value:t) {
    if (isunsafe(value)) return this;
    else if (isnull(this.root)) {
      this.root = new rbnode(value);
      this.size += 1;
      return this;
    } else {
      const add = (node:rbnode<t>, newnode:rbnode<t>) => {
        // case: node.value 
        if (this.compare(node.value, newnode.value)) {
        }
        else {
        }
      }
      const newnode = new rbnode(value);
      add(this.root, newnode);
      this.size+= 1;
      return this;
    }
  }
}
