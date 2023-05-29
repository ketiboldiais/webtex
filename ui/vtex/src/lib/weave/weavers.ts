import {
  $Edge,
  $Graph,
  $Link,
  $Vertex,
} from "./weft/graph/graph.data.js";
import {
  $Angle,
  $Axis,
  $Integral,
  $Plane,
  $Plot,
  $Point,
  $Vector,
} from "./weft/plot/plot.data.js";
import { $Leaf, $Tree } from "./weft/tree/tree.data.js";

export type Twine = $Plane | $Graph | $Tree;

export type Weaver =
  | $Plane
  | $Integral
  | $Plot
  | $Axis
  | $Vertex
  | $Link
  | $Edge
  | $Graph
  | $Tree
  | $Angle
  | $Leaf
  | $Vector
  | $Point;
