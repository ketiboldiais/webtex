import { SimulationNodeDatum } from "d3-force";
import { colorable } from "../../warp/colorable";
import { typed } from "../../warp/typed";
import { textual } from "../../warp/textual";
import { Frame } from "@/weave/warp/frame";
import { Twine } from "@/weave/weavers";

export class Link<T> {
  /**
   * The link’s source node.
   */
  source: T;
  /**
   * The link’s target node.
   */
  target: T;
  constructor(source: T, target: T) {
    this.source = source;
    this.target = target;
  }
  /**
   * Sets the link’s source node.
   *
   * @param node
   * - A callback function that takes a link’s source
   *   of type T and returns a link’s target of type T.
   */
  sourceMap(f: (sourceNode: T) => T) {
    this.source = f(this.source);
    return this;
  }
  /**
   * Sets the link’s source node.
   *
   * @param node
   * - A callback function that takes a link’s target of type T
   *   and returns a links source of type T.
   */
  targetMap(f: (targetNode: T) => T) {
    this.target = f(this.target);
    return this;
  }
}

export const LinkFactory = <T>() => (source: T, target: T) => {
  const fig = colorable(typed(Link));
  return new fig(source, target).typed("link");
};

/**
 * Creates a new {@link $Link|renderable link}.
 * @param source - A {@link $Vertex|renderable vertex}.
 * @param target - A {@link $Vertex|renderable vertex}.
 */
export const link = LinkFactory<$Vertex>();

export type $Link = ReturnType<typeof link>;
export const isLink = (node: $Edge | $Link): node is $Link => (
  node.type === "link"
);

export class Edge {
  edges: $Link[];
  constructor(links: $Link[]) {
    this.edges = links;
  }
}
export const edge = (...vertices: $Vertex[]) => {
  const fig = colorable(typed(Edge));
  const edges = [];
  for (let i = 0; i < vertices.length; i++) {
    const source = vertices[i];
    const target = vertices[i + 1];
    if (target) {
      const s = source;
      const t = target;
      const l = link(s, t);
      edges.push(l);
    }
  }
  if (vertices.length === 1) {
    const v = vertices[0];
    edges.push(link(v, v));
  }
  return new fig(edges).typed("edge");
};
export const e = edge;

export type $Edge = ReturnType<typeof edge>;

export const isEdge = (node: $Edge | $Link): node is $Edge => (
  node.type === "edge"
);

export interface Vertex extends SimulationNodeDatum {}
export class Vertex {
  data: string;
  radius: number = 5;
  /**
   * Sets the vertex’s radius.
   */
  r(value: number) {
    this.radius = value;
    return this;
  }
  constructor(data: string) {
    this.data = data;
  }
  neighbors(...vertices: $Vertex[]) {
    const source = v(this.data);
    return vertices.map((target) => link(source, target));
  }
}

export const vertex = (value: number | string) => {
  const fig = colorable(textual(typed(Vertex)));
  return new fig(`${value}`).typed("vertex");
};
export const isVertex = (node: $Edge | $Link | $Vertex): node is $Vertex => (
  node.type === "vertex"
);

export const v = vertex;

export type $Vertex = ReturnType<typeof vertex>;

export class Graph extends Frame {
  edges: $Link[];
  nodes: Record<string, $Vertex> = {};
  constructor(edges: ($Edge | $Link)[]) {
    super();
    this.edges = [];
    edges.forEach((e) => {
      if (isEdge(e)) {
        e.edges.forEach((l) => {
          this.edges.push(l);
        });
      }
      if (isLink(e)) {
        this.edges.push(e);
      }
    });
    this.edges.forEach((link) => {
      const ns = this.nodes[link.source.data];
      link.source = ns || (this.nodes[link.source.data] = link.source);
      const ts = this.nodes[link.target.data];
      link.target = ts || (this.nodes[link.target.data] = link.target);
    });
  }
  edgemap(f: (n: $Link) => $Link) {
    this.edges.forEach((edge) => f(edge));
    return this;
  }
  nodemap(f: (n: $Vertex) => $Vertex) {
    Object.values(this.nodes).forEach((n) => f(n));
    return this;
  }
  /** The force layout’s center force along the x-axis. */
  forceCenterX?: number;
  /** The force layout’s center force along the y-axis. */
  forceCenterY?: number;
  /**
   * Sets the center of the force layout.
   * The center force ensures the graph’s elements
   * are centered.
   */
  forceCenter(x: number, y: number = x) {
    this.forceCenterX = x;
    this.forceCenterY = y;
    return this;
  }
  /**
   * The strength of repulsion/attraction
   * between the elements.
   */
  forceCharge?: number;

  /**
   * Sets the {@link Graph.forceCharge}.
   * Large values will cause attraction,
   * smaller values will cause repulsion.
   */
  charge(value: number) {
    this.forceCharge = value;
    return this;
  }

  /**
   * The threshhold for when an overlap
   * is deemed to have occurred.
   */
  forceCollide?: number;

  /**
   * Sets the {@link Graph.forceCollide}.
   * The value passed defines when an
   * overlap occurs.
   */
  collide(value: number) {
    this.forceCollide = value;
    return this;
  }

  /**
   * The fixed distance between
   * each edge.
   */
  forceLinkDistance?: number;

  /**
   * Sets the {@link Graph.forceLinkDistance}.
   */
  edgeSep(value: number) {
    this.forceLinkDistance = value;
    return this;
  }
}

export const graph = (...edges: ($Edge | $Vertex | $Link | $Link[])[]) => {
  const es = [];
  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    if (Array.isArray(edge)) {
      for (let j = 0; j < edge.length; j++) {
        if (isLink(edge[j])) es.push(edge[j]);
      }
    } else if (isVertex(edge)) {
      es.push(e(edge));
    } else if (isEdge(edge)) {
      es.push(edge);
    } else if (isLink(edge)) {
      es.push(edge);
    }
  }
  const fig = typed(Graph);
  const out = new fig(es).typed("graph");
  return out;
};

export type $Graph = ReturnType<typeof graph>;

export const isGraph = (node: Twine): node is $Graph => (
  node.type === "graph"
);
