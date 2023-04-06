import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
} from "d3-force";
import { svgDimensions } from "../PlotUtils";
import { AdjacencyList } from "./graph.data";

type pGraph = {
  /**
   * An adjancy list, where the key k
   * is a vertex (a primitive string),
   * mapping to its neighbors, an
   * array of strings.
   *
   * { k: [a,b,c,d,e,...] }
   *
   * where each letter is a node.
   */
  data: AdjacencyList;

  /**
   * Whether the edges rendered should
   * be curved or straight.
   */
  straightEdges?: boolean;

  /** The svg's width. */
  width?: number;

  /** The svg's height. */
  height?: number;

  /** How the svg should scale (equivalent to "zoom in/out"). */
  scale?: number;

  /** The radius of the circle drawn to represent the vertex. */
  vertexRadius?: number;

  /** The length of each edge. */
  edgeLength?: number;

  /** How strongly the vertices repel on another. */
  repulsion?: number;

  /** The SVG's margins again its parent div element. */
  margins?: [number, number, number, number];
};

export function GraphChip({
  data,
  straightEdges = false,
  width = 500,
  height = 500,
  scale = 100,
  vertexRadius = 10,
  edgeLength = 50,
  repulsion = 0.01,
  margins = [50, 50, 50, 50],
}: pGraph) {
  const manyBody = forceManyBody().strength(-150).distanceMax(100);
  const [svgWidth, svgHeight] = svgDimensions(width, height, margins);
  const xForce = forceX(svgWidth / 2).strength(repulsion);
  const yForce = forceY(svgHeight / 2).strength(repulsion);
  return (
    <div>graph</div>
  );
}
