/* eslint-disable no-unused-vars */
import { hierarchy, linkHorizontal } from "d3";
import {
  HierarchyPointLink,
  tree as d3tree,
} from "d3-hierarchy";
import { SVG } from "../svg";
import { Group } from "../group/group.main";

export class LEAF {
  name: string;
  constructor(value: string) {
    this.name = value;
  }
  getData(): $LEAF {
    const name = this.name;
    return { name };
  }
}

export const leaf = (name: string) => new LEAF(name);

type $LEAF = {
  name: string;
  x?: number;
  y?: number;
};

export type $TREE = {
  name: string;
  children: ($TREE | $LEAF)[];
  x?: number;
  y?: number;
};

type $TREENODE = $LEAF | $TREE;

export class TREE {
  tree: $TREE;
  constructor(name: string) {
    this.tree = { name, children: [] };
  }
  getData(): $TREE {
    const tree = this.tree;
    const name = tree.name;
    const children = tree.children;
    return { name, children };
  }
  nodes(...nodes: (TREE | LEAF)[]) {
    const newChildren: $TREENODE[] = nodes.map(
      (v) => v.getData(),
    );
    const currentTree = this.tree;
    const children = currentTree.children;
    currentTree.children = [...children, ...newChildren];
    return this;
  }
  getTree() {
    const data = this.tree;
    const root = hierarchy(data);
    const margin = this._margin;
    const width = this._width - margin;
    const height = this._height - margin;
    const tree = d3tree<$TREE>().size([width, height]);
    return tree(root);
  }

  _width: number = 500;
  /**
   * Sets the figure’s width.
   */
  width(value: number) {
    this._width = value;
    return this;
  }

  _height: number = 500;
  /** Sets the figure’s height. */
  height(value: number) {
    this._height = value;
    return this;
  }

  /** Sets the figure’s margins. */
  _margin: number = 50;
  margin(value: number) {
    this._margin = value;
    return this;
  }

  _curvedLinks: boolean = false;
  /** If set to true, renders curved edges. */
  curvedLinks(value: boolean = true) {
    this._curvedLinks = value;
    return this;
  }
}

const treeLink = linkHorizontal<HierarchyPointLink<$TREE>, $LEAF>().x((d) =>
  d.x || 1
).y((d) => d.y || 1);

export const tree = (root: string) => new TREE(root);

type _Tree = {
  data: TREE;
};

export function Tree({ data }: _Tree) {
  const tree = data.getTree();
  const width = data._width;
  const height = data._height;
  const margin = data._margin;
  return (
    <SVG width={width} height={height}>
      <Group dx={margin / 2} dy={margin / 2}>
        {tree.links().map((link, i) => (
          <g
            key={`link` + i}
            fill={"none"}
            stroke={"currentColor"}
          >
            <TreeLink
              data={link}
              curved={data._curvedLinks}
            />
          </g>
        ))}
        {tree.descendants().map((node, i) => (
          <Group
            key={node.data.name + i}
            dx={node.x}
            dy={node.y}
          >
            <circle
              fill={"red"}
              r={5}
            />
            <text fill={"currentColor"}>
              {node.data.name}
            </text>
          </Group>
        ))}
      </Group>
    </SVG>
  );
}
type _TreeLink = {
  data: HierarchyPointLink<$TREE>;
  curved: boolean;
};
function TreeLink({ data, curved }: _TreeLink) {
  if (!curved) {
    return (
      <line
        x1={data.source.x}
        y1={data.source.y}
        x2={data.target.x}
        y2={data.target.y}
      />
    );
  }
  return <path d={treeLink(data) || ""} />;
}
