import { uid } from "@webtex/algom";
import { SVG } from "../core/svg";
import { Fragment, useMemo } from "react";
import {
  forceCenter,
  forceCollide,
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
import { translate } from "../utils/aux";
import { Anchor } from "../types";

export interface GraphNode extends SimulationNodeDatum {
  id: string;
  Data: string;
  StrokeColor: string;
  Radius: number;
  FillColor: string;
  FontSize: number;
}
function isGraphNode<t>(node: number | string | t): node is t {
  return typeof node !== "number" && typeof node !== "string";
}

export class GraphNode {
  id: string = uid(10);
  StrokeColor: string = "";
  Radius: number = 0;
  Data: string;
  FillColor: string = "";
  FontSize: number = 12;
  FontFamily: string = "inherit";
  TextDX: number = 0;
  TextDY: number = 0;
  TextAnchor: Anchor = "middle";
  constructor(data: string) {
    this.Data = data;
  }
  fontFamily(fontfamily: string) {
    const self = this.getWritable();
    self.FontFamily = fontfamily;
  }
  textDY(offset: number) {
    const self = this.getWritable();
    self.TextDY = offset;
    return this;
  }
  textDX(offset: number) {
    const self = this.getWritable();
    self.TextDX = offset;
    return this;
  }
  fontSize(size: number) {
    const self = this.getWritable();
    self.FontSize = size;
    return this;
  }
  setID(id: string) {
    const self = this.getWritable();
    self.id = id;
    return this;
  }
  get uid() {
    return this.id;
  }
  strokeColor(color: string) {
    const self = this.getWritable();
    self.StrokeColor = color;
    return this;
  }
  getWritable() {
    return this;
  }
  fillColor(color: string) {
    const self = this.getWritable();
    self.FillColor = color;
    return this;
  }
  radius(radius: number) {
    const self = this.getWritable();
    self.Radius = radius;
    return this;
  }
  value(v: string) {
    const self = this.getWritable();
    self.Data = v;
    return this;
  }
  static clone(node: GraphNode) {
    const clone = new GraphNode(node.Data);
    clone.strokeColor(node.StrokeColor);
    clone.radius(node.Radius);
    clone.fillColor(node.FillColor);
    clone.fontSize(node.FontSize);
    clone.fontFamily(node.FontFamily);
    clone.textDX(node.TextDX);
    clone.textDY(node.TextDY);
    clone.textAnchor(node.TextAnchor);
    return clone;
  }
  textAnchor(anchor: Anchor) {
    const self = this.getWritable();
    self.TextAnchor = anchor;
    return this;
  }
  to(node: GraphNode) {
    const self = this.getWritable();
    const clone = GraphNode.clone(self);
    const clone2 = GraphNode.clone(node);
    const res = edge(clone, clone2);
    res.directed(true);
    return res;
  }
  get loop() {
    const self = this.getWritable();
    const clone = GraphNode.clone(self);
    const res = edge(clone, clone);
    res.loop(true);
    return res;
  }
  from(node: GraphNode) {
    const self = this.getWritable();
    const clone = GraphNode.clone(self);
    const clone2 = GraphNode.clone(node);
    const res = edge(clone2, clone);
    res.directed(true);
    return res;
  }
  link(node: GraphNode) {
    const self = this.getWritable();
    const clone = GraphNode.clone(self);
    const clone2 = GraphNode.clone(node);
    const res = edge(clone, clone2);
    res.directed(false);
    return res;
  }
  bilink(node: GraphNode) {
    const self = this.getWritable();
    const clone = GraphNode.clone(self);
    const clone2 = GraphNode.clone(node);
    const res = edge(clone, clone2);
    res.directed(false);
    res.bilink(true);
    return res;
  }
}

class Edge {
  source: GraphNode;
  target: GraphNode;
  Weight: number = NaN;
  Directed: boolean = false;
  Stroke: string = "";
  Bilink: boolean = false;
  Id: string;
  Loop: boolean = false;
  Curve: boolean = false;
  Width: number = 1;
  constructor(source: GraphNode, target: GraphNode) {
    this.source = source;
    this.target = target;
    this.Id = uid(10);
  }
  static clone(edge: Edge) {
    const clone = new Edge(edge.source, edge.target);
    clone.weighed(edge.Weight);
    clone.directed(edge.Directed);
    clone.stroke(edge.Stroke);
    clone.bilink(edge.Bilink);
    clone.loop(edge.Loop);
    clone.curve(edge.Curve);
    clone.width(edge.Width);
    return clone;
  }
  curve(x: boolean) {
    const self = this.getWritable();
    self.Curve = x;
    return this;
  }
  setTarget(node: GraphNode) {
    const self = this.getWritable();
    self.target = node;
    return this;
  }
  setSource(node: GraphNode) {
    const self = this.getWritable();
    self.source = node;
    return this;
  }
  width(w: number) {
    const self = this.getWritable();
    self.Width = w;
    return this;
  }
  loop(x: boolean) {
    this.Loop = x;
  }
  bilink(x: boolean) {
    this.Bilink = x;
    return this;
  }
  stroke(color: string) {
    const self = this.getWritable();
    self.Stroke = color;
    return this;
  }
  getWritable() {
    return this;
  }
  directed(x: boolean) {
    const self = this.getWritable();
    self.Directed = x;
    return this;
  }
  get isLoop() {
    return this.Loop;
  }
  get isDirected() {
    return this.Directed;
  }
  weighed(weight: number) {
    const self = this.getWritable();
    self.Weight = weight;
    return this;
  }
}
const edge = (source: GraphNode, target: GraphNode) => new Edge(source, target);
const node = (value: string) => new GraphNode(value);

type NodeFactory = typeof node;
type EdgeFactory = typeof edge;

export type GraphEdge = SimulationLinkDatum<GraphNode> & Edge;

const centerForce = (x: number, y: number) => forceCenter(x / 2, y / 2);

type FX = ForceX<SimulationNodeDatum>;
type FY = ForceY<SimulationNodeDatum>;

const arrow = (
  sourceData: string,
  targetData: string,
  fill: string,
): _Arrow => ({
  id: `${sourceData}-to-${targetData}`,
  fill,
});

const newForce = <t extends (FX | FY)>(
  dir: "x" | "y",
  dimension: number,
  strength: number,
): t => {
  const f = dir === "x" ? forceX : forceY;
  return f(dimension).strength(strength) as t;
};

type _Arrow = { id: string; fill: string };

function getNodes(
  edges: Edge[],
  fill: string,
  stroke: string,
  edgeColor: string,
  radius: number,
  textDx: number,
  textDy: number,
) {
  const nodeMap: Record<string, GraphNode> = {};
  const nodeList: GraphNode[] = [];
  const uids = new Set<string>();
  const arrows: _Arrow[] = [];
  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    let source = edge.source;
    let target = edge.target;
    if (edge.Directed) {
      const _arrow = arrow(source.Data, target.Data, edge.Stroke || edgeColor);
      arrows.push(_arrow);
    }
    if (uids.has(source.id) || uids.has(target.id)) continue;
    if (!uids.has(source.Data)) {
      const color = source.FillColor || fill;
      const strokeColor = source.StrokeColor || stroke;
      const r = source.Radius || radius;
      const tx = source.TextDX || textDx;
      const ty = source.TextDY || textDy;
      nodeList.push(
        source
          .fillColor(color)
          .strokeColor(strokeColor)
          .radius(r)
          .textDX(tx)
          .textDY(ty),
      );
      nodeMap[source.Data] = source;
      uids.add(source.Data);
    }
    if (!uids.has(target.Data)) {
      const color = target.FillColor || fill;
      const strokeColor = target.StrokeColor || stroke;
      const r = target.Radius || radius;
      const tx = target.TextDX || textDx;
      const ty = target.TextDY || textDy;
      nodeList.push(
        target
          .fillColor(color)
          .strokeColor(strokeColor)
          .radius(r)
          .textDX(tx)
          .textDY(ty),
      );
      nodeMap[target.Data] = target;
      uids.add(target.Data);
    }
  }
  return { nodeList, nodeMap, arrows };
}

interface _Graph {
  data: (nodeFn: NodeFactory, edgeFn: EdgeFactory) => Edge[];
  /**
   * Sets the amount of spacing between nodes. Defaults to the
   * node's radius. If a negative value is passed, the nodes
   * will overlap.
   */
  nodesep?: number;
  /**
   * How strongly nodes repel or attract one another.
   * Positive values attract, negative values repel.
   */
  charge?: number;
  /**
   * The maximum possible charge a given node
   * can have.
   */
  maxCharge?: number;
  /**
   * Sets how strongly edges
   * repel or attract one another.
   */
  edgeCharge?: number;
  edgeLength?: number;
  forceX?: number;
  forceY?: number;
  curvedEdges?: boolean;
  width?: number;
  height?: number;
  className?: string;
  nodeFill?: string;
  nodeStroke?: string;
  nodeClass?: string;
  edgeClass?: string;
  edgeColor?: string;
  margin?: number;
  margins?: [number, number, number, number];
  radius?: number;
  textDx?: number;
  textDy?: number;
}
export function Graph({
  data,
  width = 400,
  height = 220,
  nodesep,
  charge = -150,
  maxCharge = 50,
  edgeLength,
  edgeCharge,
  forceX = 0,
  forceY = forceX,
  className,
  nodeFill = "#fff",
  nodeStroke = "#000",
  edgeColor = "#000",
  nodeClass = "",
  edgeClass = "",
  curvedEdges = false,
  radius = 3.5,
  margin = 0,
  margins = [margin, margin, margin, margin],
  textDx = -radius * 2,
  textDy = -radius,
}: _Graph) {
  const [T, R, B, L] = margins;
  const svgWidth = width - R - L;
  const svgHeight = height - T - B;
  const edges = data(node, edge);
  const graph = useMemo(() => {
    const { nodeList, nodeMap, arrows } = getNodes(
      edges,
      nodeFill,
      nodeStroke,
      edgeColor,
      radius,
      textDx,
      textDy,
    );
    const links: GraphEdge[] = [];
    for (let i = 0; i < edges.length; i++) {
      const link = edges[i];
      const sourceID = link.source.Data;
      const targetID = link.target.Data;
      const source = nodeMap[sourceID];
      const target = nodeMap[targetID];
      const newLink = Edge.clone(link);
      newLink.setSource(source);
      newLink.setTarget(target);
      newLink.stroke(link.Stroke ? link.Stroke : edgeColor);
      links.push(newLink);
    }

    const linkForce = forceLink(links);
    (edgeLength !== undefined) && linkForce.distance(edgeLength);
    (edgeCharge !== undefined) && linkForce.strength(edgeCharge);
    const bodyForce = forceManyBody().strength(charge);
    (maxCharge !== undefined) && bodyForce.distanceMax(maxCharge);
    const collision = forceCollide()
      .radius(nodesep !== undefined ? nodesep : (d: any) => d.Radius);
    forceSimulation(nodeList)
      .force("charge", bodyForce)
      .force("link", linkForce)
      .force("center", centerForce(svgWidth, svgHeight))
      .force("x", newForce("x", svgWidth, forceX))
      .force("y", newForce("y", svgHeight, forceY))
      .force("collision", collision)
      .stop().tick(200);
    return { nodes: nodeList, edges: links, arrows };
  }, [edges]);

  return (
    <Fragment>
      <SVG width={svgWidth} height={svgHeight} className={className} debug>
        {graph.arrows.length && <ArrowDefs arrows={graph.arrows} />}
        <Edges
          curved={curvedEdges}
          links={graph.edges}
          className={edgeClass}
        />
        <Vertices
          nodes={graph.nodes}
          className={nodeClass}
        />
      </SVG>
    </Fragment>
  );
}

type _Edges = {
  className: string;
  links: GraphEdge[];
  curved: boolean;
};
function Edges({ className, links, curved }: _Edges) {
  return (
    <g className={className}>
      {links.map((link) => (
        <Link
          key={link.Id}
          curve={link.Curve || curved || link.Loop}
          link={link}
        />
      ))}
    </g>
  );
}

type _Vertices = {
  className: string;
  nodes: GraphNode[];
};
function Vertices({ className, nodes }: _Vertices) {
  return (
    <g className={className}>
      {nodes.map((node, i) => (
        <Vertex
          key={node.id + i}
          node={node}
        />
      ))}
    </g>
  );
}

type _ArrowDefs = {
  arrows: _Arrow[];
};
function ArrowDefs({ arrows }: _ArrowDefs) {
  return (
    <Fragment>
      <defs>
        {arrows.map(({ id, fill }, i) => (
          <marker
            refX={10}
            refY={5}
            key={id + i}
            id={id}
            viewBox={"0 0 10 10"}
            markerUnits={"strokeWidth"}
            markerWidth={10}
            markerHeight={5}
            orient={"auto"}
            fill={fill}
          >
            <path d="M 0 0 L 10 5 L 0 10 z" />
          </marker>
        ))}
      </defs>
    </Fragment>
  );
}

function newPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  radius: number,
) {
  const hasLoop = x1 === x2 && y1 === y2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dr = Math.sqrt((dx ** 2) + (dy ** 2));
  const drx = hasLoop ? (radius << 1) : dr;
  const dry = hasLoop ? (radius << 1) : dr;
  const xRotation = hasLoop ? -45 : 1;
  const arc = hasLoop ? 1 : 0;
  const sweep = 1;
  if (hasLoop) {
    x2 = x2 + 1;
    y2 = y2 + 1;
  }
  return `M${x1},${y1}A${drx},${dry} ${xRotation},${arc},${sweep} ${x2},${y2}`;
}

type _Vertex = {
  node: GraphNode;
};
function Vertex({ node }: _Vertex) {
  return (
    <g transform={translate(node.x, node.y)}>
      <circle
        r={node.Radius}
        stroke={node.StrokeColor}
        fill={node.FillColor}
      />
      <text
        fontSize={node.FontSize}
        textAnchor={node.TextAnchor}
        dx={node.TextDX}
        dy={node.TextDY}
      >
        {node.Data}
      </text>
    </g>
  );
}

type _Link = {
  link: GraphEdge;
  curve: boolean;
};

function Link({ link, curve }: _Link) {
  const { source, target } = link;
  if (!isGraphNode(source)) return null;
  if (!isGraphNode(target)) return null;
  if (!source.x || !source.y || !target.x || !target.y) return null;
  const arrow = link.Directed ? `url(#${source.Data}-to-${target.Data})` : ``;
  const x1 = source.x;
  const y1 = source.y;
  const radius = target.Radius;
  const [x2, y2] = !link.Directed ? [target.x, target.y] : getFocus(
    source.x,
    source.y,
    target.x,
    target.y,
    target.Radius,
  );

  return (
    <Fragment>
      {!isNaN(link.Weight) && (
        <g transform={translate((source.x + x2) / 2, (source.y + y2) / 2)}>
          <text
            fontSize={target.FontSize - 2.5}
            textAnchor={"middle"}
            dy={-radius / 2}
            dx={-radius / 2}
          >
            {link.Weight}
          </text>
        </g>
      )}
      <g stroke={link.Stroke} strokeWidth={link.Width} markerEnd={arrow}>
        {curve
          ? <CurvedEdge x1={x1} y1={y1} x2={x2} y2={y2} radius={radius} />
          : <Line x1={x1} y1={y1} x2={x2} y2={y2} />}
      </g>
    </Fragment>
  );
}

type _Line = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};
function Line({ x1, y1, x2, y2 }: _Line) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
    />
  );
}

type _CurvedEdge = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  radius: number;
};

function CurvedEdge({ x1, y1, x2, y2, radius }: _CurvedEdge) {
  return (
    <path
      d={newPath(x1, y1, x2, y2, radius)}
      fill={"none"}
    />
  );
}

function getFocus(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  radius: number,
) {
  var t_radius = radius;
  var dx = targetX - sourceX;
  var dy = targetY - sourceY;
  var gamma = Math.atan2(dy, dx);
  var tx = targetX - (Math.cos(gamma) * t_radius);
  var ty = targetY - (Math.sin(gamma) * t_radius);
  return [tx, ty];
}
