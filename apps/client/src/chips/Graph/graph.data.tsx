import { uid } from "../../algom/index.js";

type Vertex = {
  value: string;
  id: string;
};

/** Creates a new vertex. */
export function newVertex(value: string, id: string = uid()): Vertex {
  return ({ value, id });
}

type Edge = {
  source: Vertex;
  target: Vertex;
  id: string;
};

/** Creates a new edge. */
export function newEdge(
  source: Vertex,
  target: Vertex,
  id: string = uid(),
): Edge {
  return ({ source, target, id });
}

export function isEdge(x: any): x is Edge {
  return (x !== undefined) && (x["source"]) && (x["target"]);
}

type WeightedEdge = Edge & { weight: number | null };

export function weightedEdge(
  source: Vertex,
  target: Vertex,
  id: string = uid(),
  weight: number | null = null,
): WeightedEdge {
  return ({ source, target, id, weight });
}

function makeEdges(edges: [string, string][]) {
  return edges.map(([v1, v2]) =>
    newEdge(
      newVertex(v1),
      newVertex(v2),
    )
  );
}

export type AdjacencyList = { [key: string]: string[] };

function normalize(adjancyList: AdjacencyList) {
  let edges: Edge[] = [];
  for (const vertex in adjancyList) {
    const currentVertex = newVertex(vertex);
    const neighbors = adjancyList[vertex];
    const N = neighbors.length;
    for (let i = 0; i < N; i++) {
      const neighborValue = neighbors[i];
      const neighbor = newVertex(neighborValue);
      edges.push(newEdge(currentVertex, neighbor));
    }
  }
  return edges;
}

function verticesFromEdges(edges: Edge[]) {
  const edgeCount = edges.length;
  const set = new Set<string>();
  let result: Vertex[] = [];
  for (let i = 0; i < edgeCount; i++) {
    const { source, target } = edges[i];
    if (set.has(source.id)) continue;
    set.add(source.id);
    result.push(source);
    if (set.has(target.id)) continue;
    set.add(target.id);
    result.push(target);
  }
  return result;
}
