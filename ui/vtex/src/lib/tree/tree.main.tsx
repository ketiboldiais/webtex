/* eslint-disable no-unused-vars */
import { hierarchy } from "d3";
import { Datum } from "../core/core.atom";
import {
  Circular,
  Classable,
  Colorable,
  Movable,
  nonnull,
  Spatial,
  Textual,
  Unique,
} from "../core/core.utils";
import { linkHorizontal } from "d3";
import { HierarchyPointLink, tree as d3tree } from "d3-hierarchy";
import { SVG } from "../core/svg";
import { Group } from "../group/group.main";

export class Leaf extends Datum {
  name: string;
  constructor(value: string) {
    super("leaf");
    this.name = value;
  }
}

export function leaf(name: string | number) {
  const LEAF = Colorable(Classable(Unique(Circular(Textual(Leaf)))));
  return new LEAF(`${name}`);
}

type $LEAF = ReturnType<typeof leaf>;

export function isLeaf(datum: Datum): datum is $LEAF {
  return datum.type === "leaf";
}
type Child = string | number | $TREE | $LEAF;
type $TreeNode = $TREE | $LEAF;
export class Tree extends Datum {
  name: string;
  children: ($TreeNode)[] = [];
  constructor(name: string) {
    super("tree");
    this.name = name;
  }
  nodes(...children: Child[]) {
    const C = children.length;
    for (let i = 0; i < C; i++) {
      const child = children[i];
      this.node(child);
    }
    return this;
  }
  node(child: Child) {
    if (typeof child === "string" || typeof child === "number") {
      this.children.push(leaf(`${child}`));
    } else this.children.push(child);
    return this;
  }
  treeData(width: number, height: number) {
    if (isTree(this)) {
      const root = hierarchy<$TreeNode>(this as any as $TreeNode);
      const tree = d3tree<$TreeNode>().size([width, height]);
      const treeData = tree(root);
      const links = treeData.links();
      const nodes = treeData.descendants();
      console.log(nodes);
      return {
        links,
        nodes,
      };
    }
    return null;
  }
}

export const tree = (root: string | number) => {
  const TREE = Classable(Spatial(Unique(Circular(Colorable(Textual(Tree))))));
  return new TREE(`${root}`);
};

export type $TREE = ReturnType<typeof tree>;

export function isTree(datum: Datum): datum is $TREE {
  return datum.type === "tree";
}

type TreeProps = {
  data: $TREE;
};

export function TreeFig({ data }: TreeProps) {
  const r = nonnull(data._radius, 10);
  const fill = nonnull(data._fill, "currentColor");
  const stroke = nonnull(data._stroke, "currentColor");
  const color = nonnull(data._color, "currentColor");
  const tx = nonnull(data._tx, r);
  const ty = nonnull(data._ty, -r);
  const width = nonnull(data._width, 500);
  const height = nonnull(data._height, 500);
  const marginTop = nonnull(data._marginTop, 50);
  const marginBottom = nonnull(data._marginBottom, 50);
  const marginLeft = nonnull(data._marginLeft, 50);
  const marginRight = nonnull(data._marginRight, 50);
  const marginY = marginTop + marginBottom;
  const marginX = marginLeft + marginRight;
  const svgWidth = width - marginTop - marginBottom;
  const svgHeight = height - marginLeft - marginRight;
  const treeData = data.treeData(svgWidth, svgHeight);
  if (treeData === null) return null;
  const links = treeData.links;
  const nodes = treeData.nodes;
  return (
    <SVG width={width} height={height}>
      <Group dx={marginX / 2} dy={marginY / 2}>
        {links.map(({ source, target }, i) => (
          <g key={(source.data.id) + target.data.id}>
            <line
              stroke={stroke}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
            />
          </g>
        ))}
        {nodes.map((node, i) => (
          <Group key={node.data.id + i} dx={node.x} dy={node.y}>
            <circle
              r={nonnull(node.data._radius, r)}
              fill={nonnull(node.data._fill, fill)}
              stroke={nonnull(node.data._stroke, stroke)}
            />
            <text
              dx={nonnull(node.data._tx, tx)}
              dy={nonnull(node.data._ty, ty)}
              fill={nonnull(node.data._color, color)}
            >
              {node.data.name}
            </text>
          </Group>
        ))}
      </Group>
    </SVG>
  );
}

const data = tree(12)
  .node(tree(6).nodes(3, 2, 1))
  .node(9)
  .node(tree(5).nodes(8, 1, 6))
  .radius(10)
  .fill("tomato")
  .width(650)
  .height(300)
  .radius(10)

export const TreeDemo1 = () => <TreeFig data={data} />;
