import { display } from "../utils/index.js";

/**
 * All data structures extend just one object,
 * the atom. The atom is an object with a property
 * value. The type `t` is the user's data type.
 */
type atom<t> = { value: t };

/**
 * All algebras (abstract data types),
 * extend a poset whose two functions,
 * compare and equal, must be provided
 * by the user. We take this as an axiom.
 * Disagree? Find another library.
 *
 * There's only been one type definition
 * so far, and it doesn't do much. At
 * the same time, the basic core must be
 * loose and weak. A poset is about as
 * general as we can get before we
 * devolve into a simple, unordered
 * collection of data. If that's all we
 * need, then native JavaScript suffices—there
 * are arrays, objects, sets,
 * maps, etc.
 *
 * The poset has two operations:
 *
 * (1) a comparison operation:
 *
 * ~~~
 * compare :: t t => boolean
 * ~~~
 *
 * (2) and an equality operation:
 *
 * ~~~
 * equal :: t t => boolean
 * ~~~
 *
 * That's it. We just need two functions
 * that allow the structures to (1) order
 * the data somehow, and (2) determine
 * whether one datum is the same as another.
 */
type poset<t> = {
  compare: (a: t, b: t) => boolean;
  equal: (a: t, b: t) => boolean;
  base: () => t[];
};

/**
 * Transforms an existing data structure
 * into another.
 */
type morpher = <t, L extends poset<t>>(
  f1: L & poset<t>,
) => <X>(f2: (arg: poset<t>) => (data: t[]) => X) => X;

const morph: morpher = (f1) => (f2) =>
  f2({ compare: f1.compare, equal: f1.equal, base: f1.base })(f1.base());

/**
 * All operations other than
 * those implemented natively
 * are typed as userConfig.
 */
type userConfig = { [key: string]: Function };

/* --------------------------------- Helpers -------------------------------- */

/**
 * Checks whether a value is null.
 * Not that this uses the strict
 * equality operator.
 * So, it will return false for:
 *
 * 1. The empty string,
 * 2. undefined,
 * 3. false,
 * 4. 0,
 * 5. NaN.
 */
function isnil(v: any): v is null {
  return v === null;
}

/**
 * Checks whether a value is undefined.
 * No structure ever takes undefined as
 * an argument. If it doesn't exist yet,
 * don't call.
 */
function unsafe(v: any): v is undefined {
  return v === undefined;
}

/* ------------------------------- Binary Tree ------------------------------ */

type treenodeType<t> = {
  left: treenodeType<t> | null;
  right: treenodeType<t> | null;
} & atom<t>;

type nodesetter = <t>(
  n: treenodeType<t>,
) => (right: treenodeType<t> | null) => {
  right: treenodeType<t> | null;
  value: t;
  left: treenodeType<t> | null;
};
type customBinaryTree<
  t,
  userTreeNodeType extends treenodeType<t> = treenodeType<t>,
> = {
  compare: (a: t, b: t) => boolean;
  equal: (a: t, b: t) => boolean;
  node?: (value: t) => userTreeNodeType;
  insert?: (
    parent: userTreeNodeType,
    newNode: userTreeNodeType,
  ) => userTreeNodeType;
  remove?: (
    parent: userTreeNodeType,
    newNode: userTreeNodeType,
  ) => userTreeNodeType;
};
type config<t> = customBinaryTree<t> & userConfig;
type traverser<t> = {
  inorder: (root: treenodeType<t>, cb: (v: t) => void) => void;
  preorder: (root: treenodeType<t>, cb: (v: t) => void) => void;
  postorder: (root: treenodeType<t>, cb: (v: t) => void) => void;
  level: (root: treenodeType<t>, cb: (v: t) => void) => void;
};
interface ibt<t> extends poset<t> {
  compare(a: t, b: t): boolean;
  root: treenodeType<t>;
  push(...value: t[]): this;
  pop(value: t): this;
  has(value: t): boolean;
  array(option: keyof traverser<t>): t[];
}

type nodeBuilder = <t>(value: t, left?: null, right?: null) => treenodeType<t>;

function size<t>(tree: ibt<t>): number {
  const f = (n: treenodeType<t> | null): number => {
    if (n === null) return 0;
    let x = f(n.left);
    let y = f(n.right);
    return x > y ? x + 1 : y + 1;
  };
  return f(tree.root);
}

function BinaryTree<t, r = config<t>>(settings: customBinaryTree<t> & r) {
  const rightof: nodesetter = (n) => (right) => ({ ...n, right });
  const leftof: nodesetter = (n) => (left) => ({ ...n, left });
  const node: nodeBuilder = (value, left = null, right = null) => ({
    value,
    left,
    right,
  });
  const newnode = settings.node === undefined ? node : settings.node;
  const compare = settings.compare;
  const equal = settings.equal;
  const arr: traverser<t> = {
    inorder: function (root: treenodeType<t>, cb: (v: t) => void) {
      const inord = (root: treenodeType<t>) => {
        if (!isnil(root.left)) inord(root.left);
        cb(root.value);
        if (!isnil(root.right)) inord(root.right);
      };
      return inord(root);
    },
    preorder: function (root: treenodeType<t>, cb: (v: t) => void) {
      const pre = (root: treenodeType<t>) => {
        cb(root.value);
        if (!isnil(root.left)) pre(root.left);
        if (!isnil(root.right)) pre(root.right);
      };
      return pre(root);
    },
    postorder: function (root: treenodeType<t>, cb: (v: t) => void) {
      const post = (root: treenodeType<t>) => {
        if (!isnil(root.left)) post(root.left);
        if (!isnil(root.right)) post(root.right);
        cb(root.value);
      };
      return post(root);
    },
    level: function (root: treenodeType<t>, cb: (v: t) => void) {
      throw new Error("Function not implemented.");
    },
  };
  function contains(value: t, n: treenodeType<t> | null) {
    if (n === null) return false;
    if (equal(value, n.value)) return true;
    if (compare(value, n.value)) return contains(value, n.right);
    return contains(value, n.left);
  }
  function insert(
    n: treenodeType<t> | null,
    n2: treenodeType<t>,
  ): treenodeType<t> {
    if (isnil(n)) return n2;
    else if (compare(n2.value, n.value)) {
      return rightof(n)(insert(n.right, n2));
    } else return leftof(n)(insert(n.left, n2));
  }
  function remove(n: treenodeType<t> | null, value: treenodeType<t>) {
    if (isnil(n)) return null;
    if (n.value === value.value) {
      if (isnil(n.left) && isnil(n.right)) return null;
      if (isnil(n.left)) return n.right;
      if (isnil(n.right)) return n.left;
      let temp = n.right;
      while (temp.left) {
        if (isnil(temp.left)) break;
        temp = temp.left;
      }
      n.value = temp.value;
      n.right = remove(n.right, temp);
    }
    if (compare(n.value, value.value)) {
      n.left = remove(n.left, value);
      return n;
    } else {
      n.right = remove(n.right, value);
      return n;
    }
  }
  const dfs = settings.insert === undefined ? insert : settings.insert;
  return (rootval: t[]): ibt<t> & poset<t> => {
    let init = newnode<t>(rootval[0]);
    if (rootval.length > 0) {
      rootval = rootval.slice(1);
      rootval.forEach((d) => {
        init = dfs(init, newnode(d));
      });
    }
    return {
      root: init,
      base(this: ibt<t>) {
        return this.array("inorder");
      },
      array(option) {
        let out: t[] = [];
        arr[option](this.root, (v) => out.push(v));
        return out;
      },
      pop(this: ibt<t>, value: t) {
        const del = settings.remove === undefined ? remove : settings.remove;
        const result = del(this.root, newnode(value));
        if (!isnil(result)) this.root = result;
        return this;
      },
      push(this: ibt<t>, ...value: t[]) {
        value.forEach((v) => {
          this.root = dfs(this.root, newnode(v));
        });
        return this;
      },
      has(this: ibt<t>, value: t) {
        return contains(value, this.root);
      },
      ...settings,
    };
  };
}

/* ---------------------------------- List ---------------------------------- */

type listnode<t> = {
  next: listnode<t> | null;
} & atom<t>;

type listSettings<t> = {
  compare: (a: t, b: t) => boolean;
  equal: (a: t, b: t) => boolean;
};

type listConfig<t> = listSettings<t> & userConfig;
interface ilist<t> extends poset<t> {
  root: listnode<t> | null;
  length: number;
  push(value: t): this;
}

function List<t, r extends listSettings<t> = listConfig<t>>(settings: r) {
  const node = <t>(value: t, next = null): listnode<t> => ({
    value,
    next,
  });
  function insert(n1: listnode<t>, n2: listnode<t>) {
    let current = n1;
    while (current.next) current = current.next;
    current.next = n2;
    return current;
  }
  function toarray(n: listnode<t>) {
    let out: t[] = [];
    if (isnil(n)) return out;
    let p: listnode<t> | null = n;
    while (p !== null) {
      out.push(p.value);
      p = p.next;
    }
    return out;
  }
  return (value: t[]): ilist<t> & poset<t> => {
    let root = node(value[0]);
    if (value.length > 0) {
      value = value.slice(1);
      value.forEach((v) => insert(root, node(v)));
    }
    return {
      root,
      base(this: ilist<t>) {
        let out: t[] = [];
        if (isnil(this.root)) return out;
        out = toarray(this.root);
        return out;
      },
      length: 1,
      push(this: ilist<t>, value: t) {
        let n = node(value);
        if (isnil(this.root)) this.root = n;
        else insert(this.root, n);
        this.length++;
        return this;
      },
      ...settings,
    };
  };
}
type KeyVal<T, V> =
  & keyof { [P in keyof T as T[P] extends V ? P : never]: P }
  & keyof T;

type GraphData<t,v> = {
  [key: string]: (KeyVal<t,v>)[];
};

const dg = <t,v>(g: GraphData<t,v>) => ({ g });

