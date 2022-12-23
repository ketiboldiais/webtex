export type comparable = number | string;
type orderRelation = "<" | ">" | "<=" | ">=";
const strcmp = (a: string, b: string) => {
  return a.localeCompare(b, undefined, { numeric: true }) < 0 ? false : true;
};
const streq = (a: string, b: string) => {
  return a.localeCompare(b, undefined, { numeric: true }) === 0;
};
const comp = (a: comparable, b: comparable, order: orderRelation) => {
  switch (order) {
    case "<":
      if (typeof a === "number" && typeof b === "number") return a < b;
      if (typeof a === "string" && typeof b === "string") return strcmp(a, b);
    case ">":
      if (typeof a === "number" && typeof b === "number") return a > b;
      if (typeof a === "string" && typeof b === "string") return strcmp(b, a);
    case "<=":
      if (typeof a === "number" && typeof b === "number") return a <= b;
      if (typeof a === "string" && typeof b === "string")
        return strcmp(a, b) || streq(a, b);
    case ">=":
      if (typeof a === "number" && typeof b === "number") return a >= b;
      if (typeof a === "string" && typeof b === "string")
        return strcmp(b, a) || streq(a, b);
    default:
      throw new Error("Invalid compare function.");
  }
};

export interface Item<T = string | number> {
  [key: string | number | symbol]: T;
}

const TreePrint = (d: any) => {
  const link = (key: any, last: any) => {
    let str = last ? "└" : "├";
    (key && (str += "─ ")) || (str += "──┐");
    return str;
  };

  const getKeys = (obj: { [key: string]: any }) => {
    var keys = [];
    for (const branch in obj) {
      if (!obj.hasOwnProperty(branch)) {
        continue;
      }
      keys.push(branch);
    }
    return keys;
  };

  const treeGen = (
    key: string,
    root: any,
    last: boolean,
    lastStates: any[],
    showValues: boolean,
    callback: { (line: any): void; (arg0: string): void }
  ) => {
    let line = "",
      index = 0,
      lastKey,
      lastStatesCopy = lastStates.slice(0);

    if (lastStatesCopy.push([root, last]) && 0 < lastStates.length) {
      lastStates.forEach((lastState: any[], idx: number) => {
        if (idx > 0) line += (lastState[1] ? " " : "│") + "  ";
      });
      line += link(key, last) + key;
      showValues &&
        (typeof root !== "object" || root === null || root instanceof Date) &&
        (line += ": " + root);
      if (root instanceof Set) {
        const res = Array.from(root);
        line += ": {";
        res.forEach((_, i) => {
          if (i !== 0) line += ", ";
          line += res[i];
        });
        line += "}";
      }
      callback(line);
    }
    if (typeof root === "object") {
      const keys = getKeys(root);
      keys.forEach((branch) => {
        lastKey = ++index === keys.length;
        treeGen(
          branch,
          root[branch],
          lastKey,
          lastStatesCopy,
          showValues,
          callback
        );
      });
    }
  };
  var tree = "";
  treeGen(".", d, false, [], true, (line: string) => (tree += line + "\n"));
  return tree;
};

export class bstNode<T extends Item> {
  data: T;
  key: string | number;
  left: bstNode<T> | null = null;
  right: bstNode<T> | null = null;

  constructor(data: T, key: keyof T) {
    this.data = data;
    this.key = data[key];
  }
}

export class BST<T extends Item> {
  #key: string | number | symbol;
  #order: orderRelation;
  #root: bstNode<T> | null;
  constructor(key: keyof T, order: orderRelation = "<") {
    this.#key = key;
    this.#order = order;
    this.#root = null;
  }
  private compare(node1: bstNode<T>, node2: bstNode<T>) {
    return comp(node1.key, node2.key, this.#order);
  }

  // PART - bst.push() --------------------------------------------------------
  /**
   * Inserts a new node with data of type `T` into the tree.
   * The data need not have the same overall shape as `T`,
   * but it must have the same key name used for comparison.
   * @example
   * ~~~
   * // assume the key is `name`
   * const x = {name:'sam'}
   * const y = {name: 'suji', age: 17} // ✓ has key `name`
   * const z = {id: 'greg', age: 17} // Ø not ok, no key `name`
   * ~~~
   */
  push(data: T) {
    if (this.#root === null) {
      const node = new bstNode(data, this.#key);
      this.#root = node;
      return this;
    } else {
      const node = new bstNode(data, this.#key);
      let driver = this.#root;
      let chaser = null;
      while (driver !== null) {
        chaser = driver;
        if (this.compare(chaser, node)) {
          driver = driver.left as bstNode<T>;
        } else if (this.compare(node, chaser)) {
          driver = driver.right as bstNode<T>;
        } else {
          return this;
        }
      }
      driver = new bstNode(data, this.#key);
      if (this.compare(chaser as bstNode<T>, node)) {
        (chaser as bstNode<T>).left = driver;
      } else {
        (chaser as bstNode<T>).right = driver;
      }
      return this;
    }
  }

  // PART - bst.print() --------------------------------------------------------
  /**
   * Prints a visual representation of three
   * to the console.
   * @example
   * ~~~
   * const tree = bst("key", "<");
   * tree.push({ key: 2 });
   * tree.push({ key: 3 });
   * tree.push({ key: 1 });
   * tree.print();
   * /* output:
   *   ├─ left
   *   │  ├─ left: null
   *   │  ├─ right: null
   *   │  ├─ data
   *   │  │  └─ key: 3
   *   │  └─ key: 3
   *   ├─ right
   *   │  ├─ left: null
   *   │  ├─ right: null
   *   │  ├─ data
   *   │  │  └─ key: 1
   *   │  └─ key: 1
   *   ├─ data
   *   │  └─ key: 2
   *   └─ key: 2
   * ~~~
   */
  print() {
    console.log(TreePrint(this.#root));
  }
}

export function bst<T>(key: keyof T, order: orderRelation) {
  return new BST(key, order);
}
