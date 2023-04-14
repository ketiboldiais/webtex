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
import { createContext, useContext, useMemo, useState } from "react";
import { uid } from "@webtex/algom";
import { Quad } from "src/App";
import { fontSize, SVG, svgDimensions, translate } from "../PlotUtils";

export interface GraphNode extends SimulationNodeDatum {
  id: string;
  value: string;
}

function isNodeObject<T>(node: number | string | T): node is T {
  return typeof node !== "number" && typeof node !== "string";
}

export type Link = SimulationLinkDatum<GraphNode>;

export type Edge = {
  source: GraphNode;
  target: GraphNode;
  id: string;
};

const defaultNodes: GraphNode[] = [
  { id: "A", value: "apple" },
  { id: "M", value: "mango" },
  { id: "D", value: "durian" },
  { id: "P", value: "plum" },
  { id: "B", value: "banana" },
];

const testEdges: Link[] = [
  { source: "A", target: "M" },
  { source: "M", target: "A" },
  { source: "D", target: "M" },
  { source: "B", target: "A" },
  { source: "P", target: "M" },
];

const centerForce = (x: number, y: number) => forceCenter().x(x / 2).y(y / 2);

const makeEdges = (links: Link[]) => {
  const edges: Edge[] = [];
  const edgeCount = links.length;
  for (let i = 0; i < edgeCount; i++) {
    const link = links[i];
    if (isNodeObject(link.source) && isNodeObject(link.target)) {
      edges.push({ source: link.source, target: link.target, id: uid(5) });
    }
  }
  return edges;
};

type FX = ForceX<SimulationNodeDatum>;
type FY = ForceY<SimulationNodeDatum>;
const newForce = <t extends (FX | FY)>(
  dir: "x" | "y",
  dimension: number,
  strength: number,
): t => {
  const f = dir === "x" ? forceX : forceY;
  return f(dimension / 2).strength(strength) as t;
};

interface GraphAPI {
  /**
   * An array of vertices.
   * A vertex is an object of the form
   * ~~~
   * {id: string, value: string}
   * ~~~
   * The id value must be unique.
   */
  nodes?: GraphNode[];

  /**
   * An array of links.
   * A link is an object of the form:
   * ~~~
   * {source: string, target:string}
   * ~~~
   * where the `source` and `target`
   * values are unique ids. The ids
   * must correspond to the nodes
   * provided in the `nodes` prop.
   */
  links?: Link[];

  /** The SVG's width. */
  width?: number;

  /** The SVG's height. */
  height?: number;

  /** The SVG's margins against its parent div. */
  margins?: Quad<number>;

  /**
   * How strongly each node should repel or attract
   * one another. A positive value will cause
   * nodes to attrach one another, and a negative
   * value will cause nodes to repel one another.
   * I.e., the smaller this value is, the more "dense"
   * or "clumped" the graph looks. The larger this value
   * is, the more "spread out" the graph looks.
   */
  nodeForceStrength?: number;

  /**
   * Specifies the length of edges between their endpoint
   * nodes.
   */
  edgeLength?: number;

  /**
   * Places an upper bound on how much the nodes
   * can be separated. Specifying this number and keeping
   * it small improves performance.
   */
  maxNodeSeparation?: number;

  /**
   * Determines how strongly each node
   * is attracted towards their given x-coordinate.
   * Defaults to the provided strength value.
   */
  forceXStrength?: number;

  /**
   * Determines how strongly each node
   * is attracted towards their given y-coordinate.
   * Defaults to the provided strength value.
   */
  forceYStrength?: number;

  nodeStrokeColor?: string;
  nodeFillColor?: string;
  nodeRadius?: number;
  nodeFontsize?: number;
  repulsion?: number;
  textOffsetX?: number;
  textOffsetY?: number;
  fontFamily?: string;
  curvedEdges?: boolean;
  edgeColor?: string;
}

type GraphCtxShape = {
  margins: Quad<number>;
  height: number;
  width: number;
  links: Link[];
  vertices: GraphNode[];
  nodeStrokeColor: string;
  nodeFillColor: string;
  nodeRadius: number;
  nodeFontsize: number;
  textOffsetX: number;
  textOffsetY: number;
  fontFamily: string;
  curvedEdges: boolean;
  edgeColor: string;
  setRadius: React.Dispatch<React.SetStateAction<number>>;
  setNodeFontSize: React.Dispatch<React.SetStateAction<number>>;
  setNodeFillColor: React.Dispatch<React.SetStateAction<string>>;
};

const GraphCtx = createContext({} as GraphCtxShape);

export default function GRAPH({
  nodes = defaultNodes,
  links = testEdges,
  nodeForceStrength = -150,
  forceXStrength = 0.01,
  forceYStrength = 0.01,
  edgeLength = 50,
  maxNodeSeparation = 100,
  width = 500,
  height = 500,
  margins = [50, 50, 50, 50],
  repulsion = 0.01,
  nodeStrokeColor = "#000",
  nodeFillColor = "#fff",
  edgeColor = nodeStrokeColor,
  nodeRadius = 8,
  nodeFontsize = 12,
  textOffsetX = 0,
  textOffsetY = nodeRadius + nodeFontsize,
  fontFamily = "sans-serif",
  curvedEdges = false,
}: GraphAPI) {
  const [radius, setRadius] = useState(nodeRadius);
  const [NodeFontSize, setNodeFontSize] = useState(nodeFontsize);
  const [NodeFillColor, setNodeFillColor] = useState(nodeFillColor);
  const [svgWidth, svgHeight] = svgDimensions(width, height, margins);
  const data = useMemo(() => {
    const map: Record<string, GraphNode> = {};
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      map[node.id] = node;
    }
    const edges: Link[] = [];
    for (let l = 0; l < links.length; l++) {
      const link = links[l];
      const sourceID = link.source as string;
      const targetID = link.target as string;
      const source = map[sourceID];
      const target = map[targetID];
      edges.push({ source, target });
    }
    forceSimulation(nodes)
      .force(
        "charge",
        forceManyBody()
          .strength(nodeForceStrength)
          .distanceMax(maxNodeSeparation),
      )
      .force("link", forceLink(edges).distance(edgeLength).iterations(1))
      .force("center", centerForce(svgWidth, svgHeight))
      .force("x", newForce("x", svgWidth, forceXStrength))
      .force("y", newForce("y", svgHeight, forceYStrength))
      .force("collision", forceCollide().radius(repulsion))
      .stop().tick(200);
    return { nodes, edges };
  }, [nodes, links]);

  return (
    <GraphCtx.Provider
      value={{
        height,
        width,
        margins,
        links: data.edges,
        vertices: data.nodes,
        nodeStrokeColor,
        nodeFillColor: NodeFillColor,
        nodeRadius: radius,
        nodeFontsize: NodeFontSize,
        textOffsetX,
        textOffsetY,
        fontFamily,
        curvedEdges,
        edgeColor,
        setRadius,
        setNodeFontSize,
        setNodeFillColor,
      }}
    >
      <SVG width={width} height={height} margins={margins}>
        <EDGES />
        <VERTICES />
      </SVG>
    </GraphCtx.Provider>
  );
}

const useGraph = () => useContext(GraphCtx);



function VERTICES() {
  const { vertices } = useGraph();
  return (
    <g>
      {vertices.map((v) => <VERTEX key={v.index + v.id} node={v} />)}
    </g>
  );
}

type VertexAPI = {
  node: GraphNode;
};

function VERTEX({ node }: VertexAPI) {
  const {
    nodeStrokeColor,
    nodeFillColor,
    nodeRadius,
    nodeFontsize,
    textOffsetX,
    textOffsetY,
    fontFamily,
  } = useGraph();
  return (
    <g transform={translate(node.x ?? 0, node.y ?? 0)}>
      <circle r={nodeRadius} stroke={nodeStrokeColor} fill={nodeFillColor} />
      <text
        fontSize={fontSize(nodeFontsize)}
        textAnchor={"middle"}
        dx={textOffsetX}
        dy={textOffsetY}
        fontFamily={fontFamily}
      >
        {node.value}
      </text>
    </g>
  );
}

function EDGES() {
  const { links } = useGraph();
  const edges = useMemo(() => makeEdges(links), [links]);
  return (
    <g>
      {edges.map((e) => <EDGE key={e.id} edge={e} />)}
    </g>
  );
}

interface edgeAPI {
  edge: Edge;
}

function EDGE({ edge }: edgeAPI) {
  const {
    curvedEdges,
    edgeColor,
  } = useGraph();

  return (curvedEdges
    ? <path d={newPath(edge)} stroke={edgeColor} fill={"none"} />
    : (
      <line
        x1={edge.source.x}
        y1={edge.source.y}
        x2={edge.target.x}
        y2={edge.target.y}
        key={`edge-${edge.source.id}-${edge.target.id}`}
        stroke={edgeColor}
      />
    ));
}

function newPath(d: Edge) {
  const x1 = d.source.x ?? 0;
  const y1 = d.source.y ?? 0;
  let x2 = d.target.x ?? 0;
  let y2 = d.target.y ?? 0;
  const hasLoop = x1 === x2 && y1 === y2;
  const dx = x2 - y1;
  const dy = y2 - y1;
  const dr = Math.sqrt(dx * dx + dy * dy);
  const drx = hasLoop ? 12 : dr;
  const dry = hasLoop ? 12 : dr;
  const xRotation = hasLoop ? -45 : 1;
  const arc = hasLoop ? 1 : 0;
  const sweep = 1;
  if (hasLoop) {
    x2 = x2 + 1;
    y2 = y2 + 1;
  }
  return `M${x1},${y1}A${drx},${dry} ${xRotation},${arc},${sweep} ${x2},${y2}`;
}
