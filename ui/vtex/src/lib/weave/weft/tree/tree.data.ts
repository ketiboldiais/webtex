import { is, pickSafe, tuple } from "@/weave/aux";
import { Frame } from "@/weave/warp/frame";
import { textual } from "@/weave/warp/textual";
import { typed } from "@/weave/warp/typed";
import { Twine, Weaver } from "@/weave/weavers";
import {
  hierarchy,
  HierarchyPointLink,
  HierarchyPointNode,
  tree as d3Tree,
} from "d3-hierarchy";
import { LinkFactory } from "../graph/graph.data";
import { colorable } from "@/weave/warp/colorable";

export type TreeEdge = HierarchyPointLink<TreeNode>;
export class Tree extends Frame {
  x?: number;
  y?: number;
  value: string | number;
  children: ($Tree | $Leaf)[];
  r: number = 5;
  radius(value: number) {
    this.r = value;
    return this;
  }
  constructor(value: string | number | $Leaf) {
    super();
    this.value = is.STRING(value) || is.NUMBER(value) ? value : value.value;
    this.children = [];
    if (is.OBJECT(value) && isLeaf(value)) {
      this.children.push(value);
    }
  }
  branch(...treenodes: ($Tree | $Leaf)[]) {
    treenodes.forEach((n) => this.children.push(n));
    return this;
  }

  /**
   * The distance between a parent node
   * and its child node.
   */
  PARENT_CHILD_DISTANCE?: number;

  /**
   * The distance between sibling nodes.
   */
  SIBLING_DISTANCE?: number;

  /**
   * Sets the distance between nodes.
   *
   * @param relation - A sum type of:
   *
   * 1. `parent-child` sets the distance between a parent node
   *     and its children.
   * 2. `siblings` sets the distance between a node and its
   *     siblings.
   */
  sep(relation: "parent-child" | "siblings", value: number) {
    if (relation === "parent-child") {
      this.PARENT_CHILD_DISTANCE = value;
    } else if (relation === "siblings") {
      this.SIBLING_DISTANCE = value;
    }
    return this;
  }

  /**
   * The tree node’s height.
   */
  NODE_HEIGHT?: number;

  /**
   * Sets the {@link Tree.NODE_HEIGHT}.
   */
  nodeHeight(height: number) {
    this.NODE_HEIGHT = height;
    return this;
  }

  /**
   * The tree node’s width.
   */
  NODE_WIDTH?: number;

  /**
   * Sets the {@link Tree.NODE_WIDTH}.
   */
  nodeWidth(width: number) {
    this.NODE_WIDTH = width;
    return this;
  }

  /**
   * An alias for {@link Tree.child}.
   */
  c(value: string | number | $Tree | $Leaf) {
    return this.child(value);
  }

  /**
   * Adds a new child to the tree.
   */
  child(value: string | number | $Tree | $Leaf) {
    if (is.STRING(value) || is.NUMBER(value)) {
      this.children.push(leaf(value));
    } else {
      this.children.push(value);
    }
    return this;
  }
  calcTreeSize(root: Tree) {
    const levelWidth = [1];
    const childcount = (
      level: number,
      node: { children: ($Tree | $Leaf)[] },
    ) => {
      if (node.children && node.children.length > 0) {
        if (levelWidth.length <= level + 1) {
          levelWidth.push(0);
        }
        levelWidth[level + 1] += node.children.length;
        node.children.forEach((d) => childcount(level + 1, d));
      }
    };
    childcount(0, root);
    const newheight = Math.max(...levelWidth);
    return newheight;
  }

  /**
   * Indicates whether the tree’s edges should be curved.
   * If this property is set to false (the default value),
   * then the tree’s edges are rendered as straight lines.
   */
  curvedEdges: boolean = false;

  /**
   * Sets the tree’s {@link Tree.curvedEdges} property.
   */
  curve(value: boolean = true) {
    this.curvedEdges = value;
    return this;
  }

  
  /**
   * The array of tree edges.
   */
  links: $TLink[] = [];
  edgeColor: string = "currentColor";
  nodeColor: string = "white";
  color(option: "edges" | "nodes", value: string) {
    if (option === "edges") {
      this.edgeColor = value;
    } else {
      this.nodeColor = value;
    }
    return this;
  }

  /**
   * The array of tree nodes.
   */
  nodes: HierarchyPointNode<TreeNode>[] = [];
}
export type TreeNode = $Leaf | $Tree;
export type TNode = HierarchyPointNode<TreeNode>;
export const treelink = LinkFactory<TNode>();
export type $TLink = ReturnType<typeof treelink>;

export const tree = (value: string | number | $Leaf) => {
  const fig = typed(colorable(textual(Tree)));
  const out = new fig(value).typed("tree");
  return out;
};

export type $Tree = ReturnType<typeof tree>;

export const isTree = (node: Twine): node is $Tree => (
  node.isType("tree")
);

export class Leaf extends Tree {
  constructor(value: string | number) {
    super(value);
  }
}

export const leaf = (value: string | number) => {
  const fig = typed(textual(colorable(Leaf)));
  return new fig(value).typed("leaf");
};

export type $Leaf = ReturnType<typeof leaf>;

export const isLeaf = (node: Weaver): node is $Leaf => (
  node.isType("leaf")
);
