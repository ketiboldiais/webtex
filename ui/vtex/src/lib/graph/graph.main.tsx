/* eslint-disable no-unused-vars */
import {
  forceCenter,
  forceLink,
  forceManyBody,
  forceSimulation,
  ForceX,
  forceX,
  ForceY,
  forceY,
  SimulationLinkDatum,
  SimulationNodeDatum,
} from "d3-force";
import { _Anchor, _Arrow, arrow, Arrows, Group, Label } from "..";
import { getCenter, N2 } from "../path/path";
import { SVG } from "../svg";
import { Visitor } from "../visitor";
import { value } from "../packer";
import { Anchor } from "../types";
import { uid } from "@webtex/algom";

const centerForce = (x: number, y: number) => forceCenter(x, y);

export type FX = ForceX<SimulationNodeDatum>;
export type FY = ForceY<SimulationNodeDatum>;
export const newForce = <t extends FX | FY>(
  dir: "x" | "y",
  dimension: number,
  strength: number,
): t => {
  const f = dir === "x" ? forceX : forceY;
  return f(dimension).strength(strength) as t;
};

export interface $NODE extends SimulationNodeDatum {
  value: string;
  id: string;
  radius: number;
}

export class NODE {
  _styles?: any;
  accept<t>(visitor: Visitor<t>): t {
    return visitor.node(this);
  }
  _value: string = "";
  constructor(value: string) {
    this._value = value;
  }
  _radius?: number;
  radius(value: number) {
    this._radius = value;
    return this;
  }
  getData() {
    const val = this._value;
    const id = uid(10);
    const radius = value(this._radius, 5);
    return { value: val, id, radius };
  }
  clone() {
    const self = this;
    const copy = node(self._value);
    return copy;
  }
  link(node: StyledNode) {
    const self = this;
    const copy = self.clone();
    const result = edge(copy, node);
    result.directed(false);
    return result;
  }
  to(node: StyledNode) {
    const self = this;
    const copy = self.clone();
    const result = edge(copy, node);
    result.directed(true);
    return result;
  }
  style(value: any) {
    this._styles = value;
    return this;
  }
}
import { Classable, Colorable, Movable, Sketchable, Textual } from "..";
export const STYLED_NODE = Classable(
  Textual(Movable(Sketchable(Colorable(NODE)))),
);
export const node = (value: string) => new STYLED_NODE(value);
type StyledNode = ReturnType<typeof node>;

export type $EDGE = {
  source: $NODE;
  target: $NODE;
  isLoop: boolean;
  isDirected: boolean;
  id: string;
};

export class EDGE {
  _styles?: any;
  accept<t>(visitor: Visitor<t>): t {
    return visitor.edge(this);
  }
  source: StyledNode;
  target: StyledNode;
  isDirected: boolean = false;
  isLoop: boolean = false;

  getData() {
    const source = this.source.getData();
    const target = this.target.getData();
    const isLoop = this.isLoop;
    const isDirected = this.isDirected;
    const id = uid(10);
    return {
      source,
      target,
      isLoop,
      isDirected,
      id,
    };
  }

  clone() {
    const directed = this.isDirected;
    const loop = this.isLoop;
    const source = this.source.clone();
    const target = this.target.clone();
    const edge = new EDGE(source, target);
    edge.directed(directed);
    edge.loop(loop);
    return edge;
  }

  constructor(
    source: StyledNode,
    end: StyledNode,
  ) {
    this.source = source;
    this.target = end;
  }

  setTarget(node: StyledNode) {
    const self = this;
    self.target = node;
    return self;
  }

  setSource(node: StyledNode) {
    const self = this;
    self.source = node;
    return self;
  }

  directed(value: boolean) {
    this.isDirected = value;
    return this;
  }

  loop(value: boolean = true) {
    this.isLoop = value;
    return this;
  }
}

export const edge = (
  start: StyledNode,
  end: StyledNode,
) => new EDGE(start, end);

export type $LINK = SimulationLinkDatum<$NODE> & $EDGE;
export type $GRAPH = {
  links: $EDGE[];
  nodes: $NODE[];
  hasLoop: boolean;
  isDirected: boolean;
  width: number;
  height: number;
  margin: number;
  arrows: _Arrow[];
};
export class GRAPH {
  _styles?: any;
  accept<t>(visitor: Visitor<t>): t {
    return visitor.graph(this);
  }
  edges: EDGE[];
  HasLoop: boolean = false;
  hasLoop(value: boolean) {
    this.HasLoop = value;
    return this;
  }
  IsDirected: boolean = false;
  isDirected(value: boolean) {
    this.IsDirected = value;
    return this;
  }
  MaxCharge: number = 50;
  Margin: number = 50;
  Width: number = 500;
  Height: number = 500;
  ForceX: number = 0;
  ForceY: number = 0;
  EdgeLength?: number;
  EdgeCharge?: number;
  Charge: number = -150;
  Center: N2 = [this.getWidth() / 2, this.getHeight() / 2];

  constructor(edges: EDGE[]) {
    this.edges = edges;
  }
  maxCharge(value: number) {
    this.MaxCharge = value;
    return this;
  }
  margin(value: number) {
    this.Margin = value;
    return this;
  }
  getMargin() {
    return this.Margin;
  }
  getWidth() {
    return this.Width - this.Margin;
  }
  width(value: number) {
    this.Width = value;
    return this;
  }
  height(value: number) {
    this.Height = value;
    return this;
  }
  getHeight() {
    return this.Height - this.Margin;
  }
  forceX(value: number) {
    this.ForceX = value;
    return this;
  }
  forceY(value: number) {
    this.ForceY = value;
    return this;
  }

  edgeLength(value?: number) {
    this.EdgeLength = value;
    return this;
  }

  edgeCharge(value?: number) {
    this.EdgeCharge = value;
    return this;
  }

  charge(value: number) {
    this.Charge = value;
    return this;
  }

  center(x: number, y: number) {
    this.Center = [x, y];
    return this;
  }

  getGraphData(): $GRAPH {
    const { nodelist, nodemap } = this.nodeList();
    const edges = this.edges;
    const hasLoop = this.HasLoop;
    const isDirected = this.IsDirected;
    const links: $EDGE[] = [];
    const arrows: _Arrow[] = [];
    for (let i = 0; i < edges.length; i++) {
      const link = edges[i];
      const sourceID = link.source._value;
      const targetID = link.target._value;
      const source = nodemap[sourceID];
      const target = nodemap[targetID];
      const L = { ...link.getData(), source, target };
      if (link.isDirected) {
        arrows.push(arrow(sourceID, targetID));
      }
      links.push(L);
    }
    const self = this;
    const linkForce = forceLink(links);
    const charge = self.Charge;
    const bodyForce = forceManyBody().strength(charge);
    const [x, y] = self.Center;
    const forceX = self.ForceX;
    const forceY = self.ForceY;
    const width = self.getWidth();
    const height = self.getHeight();
    const margin = self.Margin;
    forceSimulation(nodelist)
      .force("charge", bodyForce)
      .force("link", linkForce)
      .force("center", centerForce(width / 2, height / 2))
      .force("x", newForce("x", x, forceX))
      .force("y", newForce("y", y, forceY))
      .stop()
      .tick(200);

    return {
      links,
      nodes: nodelist,
      hasLoop,
      isDirected,
      width,
      height,
      margin,
      arrows,
    };
  }
  nodeList() {
    const nodemap: Record<string, $NODE> = {};
    const nodelist: $NODE[] = [];
    const ids = new Set<string>();
    const edges = this.edges;
    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i];
      const source = edge.source.getData();
      if (!ids.has(source.value)) {
        nodelist.push(source);
        nodemap[source.value] = source;
        ids.add(source.value);
      }
      const target = edge.target.getData();
      if (!ids.has(target.value)) {
        nodelist.push(target);
        nodemap[target.value] = target;
        ids.add(target.value);
      }
    }
    return { nodelist, nodemap };
  }
  style(x: any) {}
}

export const graph = (...edges: EDGE[]) => new GRAPH(edges);

type _Graph = {
  data: GRAPH;
  className?: string;
};

export function Graph({ data, className }: _Graph) {
  const graphData = data.getGraphData();
  const margin = graphData.margin;
  const width = graphData.width - margin;
  const height = graphData.height - margin;
  return (
    <div>
      <SVG width={width} height={height} className={className}>
        {graphData.arrows.length && <Arrows data={graphData.arrows} />}
        {graphData.links.map((link) => <Edge data={link} key={link.id} />)}
        {graphData.nodes.map((node) => <Vertex data={node} key={node.id} />)}
      </SVG>
    </div>
  );
}

type _Edge = {
  data: $LINK;
};
export function Edge({ data }: _Edge) {
  const source = data.source;
  const target = data.target;
  const x1 = source.x || 1;
  const y1 = source.y || 1;
  let x2 = target.x || 1;
  let y2 = target.y || 1;
  const arrow = data.isDirected
    ? `${source.value}-to-${target.value}`
    : undefined;

  if (data.isDirected || data.isLoop) {
    const [x, y] = getCenter(x1, y1, x2, y2, target.radius);
    x2 = x;
    y2 = y;
  }

  return (
    <Group markerEnd={arrow}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
    </Group>
  );
}

type _Vertex = {
  data: $NODE;
};
export function Vertex({ data }: _Vertex) {
  return (
    <Group dx={data.x} dy={data.y}>
      <circle r={data.radius} />
    </Group>
  );
}

export const isNode = (x: any): x is NODE => x instanceof NODE;
