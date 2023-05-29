type N = number;
type Figure<T = {}> = new (...args: any[]) => T;
type And<NodeType, Mixin> = NodeType & Figure<Mixin>;
type FigType =
  | "plane"
  | "plot"
  | "point"
  | "axis"
  | "graph"
  | "vertex"
  | "edge"
  | "link"
  | "leaf"
  | "tree"
  | "integral"
  | "angle"
  | "vector2D"
  | "unknown";
type NamedOrder = "top" | "bottom" | "left" | "right";
type Direction2D = "x" | "y";
type AreaCoord = { x0: number; x1: number; y0: number; y1: number };
