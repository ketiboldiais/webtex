/* eslint-disable no-undef */
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
import {
  Circular,
  Classable,
  Colorable,
  Movable,
  nonnull,
  Sketchable,
  Spatial,
  Textual,
  Unique,
} from "../core/core.utils";
import { SVG } from "../svg";
import { ArrowHead, getCenter, N2 } from "../path/path";
import { Group } from "../group/group.main";
import { ReactNode, SVGProps } from "react";
import { Arrows } from "../path/path";

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

export type FigType = "vertex" | "node" | "edge" | "graph";
export class ATOM {
  type: FigType;
  constructor(type: FigType) {
    this.type = type;
  }
}

export class VERTEX extends ATOM {
  value: string | number;
  constructor(value: string | number) {
    super("vertex");
    this.value = value;
  }
  data() {
    const value = this.value;
    return {
      value,
    };
  }
  /**
   * Creates a new, directed edge.
   * Styles may or may not be retained
   * on the source node.
   */
  to(target: $NODE): $LINK {
    const source = node(this.value);
    const out = edge(source, target);
    return out.directed();
  }
  /**
   * Creates a new, undirected
   * edge. Styles may or may not
   * be retained on the source node.
   */
  link(target: $NODE): $LINK {
    const source = node(this.value);
    return edge(source, target);
  }
  /**
   * Creates a new double link.
   * Styles may or may not be
   * retained on the source node.
   */
  mutual(target: $NODE): $LINK {
    const source = node(this.value);
    const out = edge(source, target);
    return out.bilink();
  }
}

export function node(value: string | number) {
  const NodeObject = Classable(
    Textual(
      Movable(
        Sketchable(
          Circular(
            Colorable(
              Unique(VERTEX),
            ),
          ),
        ),
      ),
    ),
  );
  return new NodeObject(value);
}

export type $NODE = ReturnType<typeof node>;
interface GraphNode extends SimulationNodeDatum {
  value: string | number;
  id: string;
}

export const isNode = (
  x: ATOM,
): x is $NODE => x.type === "vertex";

export class EDGE extends ATOM {
  source: $NODE;
  targets: $NODE[];
  weight?: number;
  constructor(source: $NODE, target: $NODE) {
    super("edge");
    this.source = source;
    this.targets = [target];
  }
  link(node: $NODE) {
    this.targets.push(node);
    return this;
  }
  /**
   * Assigns the given value
   * as a weight to the edge.
   */
  weighed(value: number) {
    this.weight = value;
    return this;
  }

  isDirected?: boolean;
  /**
   * If called, sets the
   * edge’s `_isDirected` property
   * to `true`, indicating that the
   * edge is directed.
   */
  directed(value: boolean = true) {
    this.isDirected = value;
    return this;
  }

  isBilink?: boolean;
  /**
   * If called, sets the edge’s
   * `bilink` property to true.
   * This will render a 2-way edge.
   */
  bilink() {
    this.isBilink = true;
    return this;
  }

  isCurved?: boolean;
  curved(value: boolean = true) {
    this.isCurved = value;
    return this;
  }

  isLoop?: boolean;
  loop(value: boolean = true) {
    this.isLoop = value;
    return this;
  }
}

export function edge(source: $NODE, target: $NODE) {
  const LINK = Unique(
    Classable(Textual(Movable(Sketchable(Colorable(EDGE))))),
  );
  return new LINK(source, target);
}

export type $LINK = ReturnType<typeof edge>;

type AtomicValue = string | number;
type GraphEdge = {
  [key: AtomicValue]: {
    edges: { value: string }[];
  };
};
type GraphLink = SimulationLinkDatum<GraphNode> & $LINK;
type EdgeList = (GraphLink)[];
const build = (payload: ($LINK | $NODE)[], fallbackStroke: string) => {
  const graph: GraphEdge = {};
  const nodes: $NODE[] = [];
  const edges: EdgeList = [];
  const uids = new Set<string | number>();
  const nodemap: { [key: AtomicValue]: $NODE } = {};
  const tempEdges = [];
  const arrows: ArrowHead[] = [];
  for (let i = 0; i < payload.length; i++) {
    const datum = payload[i];
    if (isNode(datum)) {
      if (!graph[datum.value]) {
        const entry = { edges: [] };
        graph[datum.value] = entry;
        datum.setID(datum.value);
      }
      if (!uids.has(datum.value)) {
        nodes.push(datum);
        uids.add(datum.value);
        nodemap[datum.value] = datum;
      }
      continue;
    }
    const edgeList = datum.targets;
    const edgeCount = edgeList.length;
    const source = datum.source;

    if (!uids.has(source.value)) {
      nodes.push(source);
      uids.add(source.value);
      nodemap[source.value] = source;
    }

    for (let e = 0; e < edgeCount; e++) {
      const edge = edgeList[e];
      const target = edge;
      if (!uids.has(target.value)) {
        nodes.push(target);
        uids.add(target.value);
        nodemap[target.value] = target;
      }
      if (!graph[source.value]) {
        const entry = { edges: [] };
        graph[source.value] = entry;
      }
      graph[source.value].edges.push({
        value: `${target.value}`,
      });
      const link: { source?: any; targets?: any } = { ...datum };
      delete link.source;
      delete link.targets;
      tempEdges.push({
        ...link,
        source,
        target,
      });
      if (datum.isDirected) {
        const id = source.value + "-" + target.value;
        const fill = nonnull(datum._stroke, fallbackStroke);
        arrows.push({ id, fill });
      }
    }
  }
  for (let i = 0; i < tempEdges.length; i++) {
    const edge = tempEdges[i];
    const sourceID = edge.source.value;
    const targetID = edge.target.value;
    const source = nodemap[sourceID];
    const target = nodemap[targetID];
    edges.push({ ...edge, source, target } as any as GraphLink);
  }
  const arrowIDs = Array.from(arrows);
  return {
    graph,
    nodes,
    edges,
    nodemap,
    arrowIDs,
  };
};

type GraphData = ReturnType<typeof build>;

export class GRAPH extends ATOM {
  _shortestPath?: any;
  data: GraphData;
  constructor(edges: ($LINK | $NODE)[]) {
    super("graph");
    this.data = build(edges, "currentColor");
  }

  Center?: N2;
  center(x: number, y: number) {
    this.Center = [x, y];
    return this;
  }

  Charge?: number;
  charge(value: number) {
    this.Charge = value;
    return this;
  }

  MaxCharge?: number;
  maxCharge(value: number) {
    this.MaxCharge = value;
    return this;
  }

  ForceX?: number;
  forceX(value: number) {
    this.ForceX = value;
    return this;
  }

  ForceY?: number;
  forceY(value: number) {
    this.ForceY = value;
    return this;
  }

  EdgeLength?: number;
  edgeLength(value: number) {
    this.EdgeLength = value;
    return this;
  }

  EdgeCharge?: number;
  edgeCharge(value: number) {
    this.EdgeCharge = value;
    return this;
  }

  getGraphData() {
    const arrowIDs = this.data.arrowIDs;
    const links = this.data.edges;
    const nodes = this.data.nodes;
    const [x, y] = nonnull(this.Center, [500, 500]);
    const linkForce = forceLink(links);
    const charge = nonnull(this.Charge, -150);
    const bodyForce = forceManyBody().strength(charge);
    const forceX = nonnull(this.ForceX, 0);
    const forceY = nonnull(this.ForceY, 0);
    forceSimulation(nodes as SimulatedNode[])
      .force("charge", bodyForce)
      .force("link", linkForce)
      .force("center", forceCenter(x / 2, y / 2))
      .force("x", newForce("x", x, forceX))
      .force("y", newForce("y", y, forceY))
      .stop()
      .tick(200);
    return {
      links,
      nodes,
      arrowIDs,
    };
  }
  _edgeStyles?: SVGProps<SVGGElement>;
  edgeStyles(props: SVGProps<SVGGElement>) {
    this._edgeStyles = props;
    return this;
  }
  _nodeStyles?: SVGProps<SVGGElement>;
  nodeStyles(props: SVGProps<SVGGElement>) {
    this._nodeStyles = props;
    return this;
  }
  _noLabels?: boolean;
  noLabels() {
    this._noLabels = true;
    return this;
  }
  _textStyles?: SVGProps<SVGTextElement>;
  textStyles(props: SVGProps<SVGTextElement>) {
    this._textStyles = props;
    return this;
  }
  textCSS() {
    const styles = this._textStyles;
    const fontFamily = "inherit";
    const fontSize = 10;
    const fill = "currentColor";
    const stroke = "none";
    const textAnchor = "middle";
    return {
      fontFamily,
      fontSize,
      fill,
      stroke,
      textAnchor,
      ...styles,
    };
  }
  edgeCSS() {
    const styles = this._edgeStyles;
    const stroke = "currentColor";
    const strokeWidth = 1;
    return { stroke, strokeWidth, ...styles };
  }
  nodeCSS() {
    const styles = this._nodeStyles;
    const fill = "white";
    const stroke = "currentColor";
    const r: any = nonnull(styles?.r, 5);
    return { fill, stroke, r, ...styles };
  }
}

type SimulatedNode = GraphNode & $NODE;

const _GRAPH = Classable(Spatial(GRAPH));

export type GraphObject = InstanceType<typeof _GRAPH>;

export const graph = (
  ...edges: ($LINK | $NODE)[]
): GraphObject => new _GRAPH(edges);

export type $GRAPH = ReturnType<typeof graph>;

interface GraphAPI {
  data: $GRAPH;
}
export function Graph({ data }: GraphAPI) {
  const width = nonnull(data._height, 400);
  const height = nonnull(data._width, 400);
  const marginTop = nonnull(data._marginTop, 50);
  const marginBottom = nonnull(data._marginBottom, 50);
  const marginRight = nonnull(data._marginRight, 50);
  const marginLeft = nonnull(data._marginLeft, 50);
  const className = nonnull(data._class, "vtex-graph");
  const W = width - marginLeft - marginRight;
  const H = height - marginTop - marginBottom;
  data.center(W, H);
  const graph = data.getGraphData();
  const edges = graph.links;
  const nodes = graph.nodes;
  const arrowIDs = graph.arrowIDs;
  const edgeCSS = data.edgeCSS();
  const nodeCSS = data.nodeCSS();
  const textCSS = data.textCSS();
  const labeled = nonnull(data._noLabels, true);
  return (
    <div>
      <SVG width={W} height={H} className={className}>
        {arrowIDs.length && <Arrows data={arrowIDs} />}
        <g {...edgeCSS}>
          {edges.map((link) => (
            <Segment
              r={nodeCSS.r}
              key={link.id}
              data={link}
            />
          ))}
        </g>
        <g {...nodeCSS}>
          {nodes.map((node) => (
            <Circle key={node.id} r={nodeCSS.r} data={node}>
              {labeled && (
                <g {...textCSS}>
                  <NodeText
                    data={node}
                    dx={textCSS.dx || nodeCSS.r * 1.8}
                    dy={textCSS.dy || -nodeCSS.r}
                  />
                </g>
              )}
            </Circle>
          ))}
        </g>
      </SVG>
      <details>
        <summary>debugger</summary>
        <pre>
          {JSON.stringify(data,null,2)}
        </pre>
      </details>
    </div>
  );
}

type NodeTextAPI = {
  data: SimulatedNode;
  dy: number | string;
  dx: number | string;
};
const NodeText = ({ data, dy, dx }: NodeTextAPI) => {
  const xOffset = nonnull(data._dx, dx);
  const yOffset = nonnull(data._dy, dy);
  return (
    <text
      fontFamily={data._font}
      fontSize={data._fontSize}
      fill={data._color}
      stroke={"none"}
      dx={xOffset}
      dy={yOffset}
      textAnchor={data._textAnchor}
    >
      {data.value}
    </text>
  );
};

type _Segment = {
  data: GraphLink;
  r: number;
};
export function Segment({ data, r }: _Segment) {
  const source = data.source as GraphNode & $NODE;
  const target = data.target as GraphNode & $NODE;
  const x1 = source.x;
  const y1 = source.y;
  let x2 = target.x;
  let y2 = target.y;
  const markerEnd = data.isDirected !== undefined
    ? `url(#${source.value + "-" + target.value})`
    : undefined;
  if (data.isDirected || data.isLoop) {
    const radius = nonnull(target._radius, r);
    [x2, y2] = getCenter(x1, y1, x2, y2, radius);
  }
  const stroke = nonnull(data._stroke, "inherit");
  const strokeWidth = nonnull(data._strokeWidth, "inherit");
  const strokeDasharray = nonnull(data._dashed, "inherit");

  return (
    <g {...{ stroke, strokeWidth, strokeDasharray, markerEnd }}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
    </g>
  );
}

type _Circle = {
  data: SimulatedNode;
  r: string | number;
  children?: ReactNode;
};

export function Circle({ data, r, children }: _Circle) {
  const radius = nonnull(data._radius, r);
  const fill = nonnull(data._fill, "inherit");
  const stroke = nonnull(data._stroke, "inherit");
  const dx = data.x;
  const dy = data.y;
  return (
    <Group dx={dx} dy={dy}>
      <circle r={radius} fill={fill} stroke={stroke} />
      {children}
    </Group>
  );
}
