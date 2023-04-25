/* eslint-disable no-unused-vars */
export type _Anchor = "middle" | "start" | "end";
export { Group } from "./group/group.main";
export { path } from "./path/path";
export {
  EDGE,
  edge,
  GRAPH,
  Graph,
  graph,
  isNode,
  NODE,
  node,
} from "./graph/graph.main";
export { arrow, Arrows, shift } from "./path/path";
export type { _Arrow, N2 } from "./path/path";
export { pack } from "./packer";
export type { $EDGE, $LINK, $NODE } from "./graph/graph.main";
export { Label } from "./label/label.main";
export { PLOT2D, Plot2D, plot2D } from "./plot/plot.main";
export type { $PLOT2D, $PLOT2D_STYLES } from "./plot/plot.main";
export { axis, AXIS2D } from "./plot/plot.axis";
export type { $AXIS2D, $AXIS2D_STYLES } from "./plot/plot.axis";
export type { $FUNC2D, $FUNC2D_STYLES } from "./plot/plot.func";
export { f, FUNC2D } from "./plot/plot.func";
export { Clip } from "./path/clip";
export { isText, latex, TEXT, Text, text } from "./text/text.main";
export type { $TEXT, _Text } from "./text/text.main";
export { isRiemann, RIEMANN, riemann } from "./plot/plot.riemann";
export { leaf, TREE, Tree, tree } from "./tree/tree.main";
export type {
  CIRCULAR,
  CLASSABLE,
  COLORABLE,
  CSTR,
  SPATIAL,
  TEXTUAL,
  UNIQUE,
} from "./core/core.utils";
export {
  Circular,
  Classable,
  Colorable,
  Movable,
  nonnull,
  safe,
  Sketchable,
  Spatial,
  Textual,
  Unique,
} from "./core/core.utils";
