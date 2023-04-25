/* eslint-disable no-unused-vars */
import { AXIS2D, EDGE, FUNC2D, GRAPH, NODE, PLOT2D, RIEMANN, TEXT } from ".";

export interface Visitor<t> {
  node(atom: NODE): t;
  edge(atom: EDGE): t;
  graph(atom: GRAPH): t;
  func2d(atom: FUNC2D): t;
  plot2d(atom: PLOT2D): t;
  axis2d(atom: AXIS2D): t;
  text(atom: TEXT): t;
  riemann(atom: RIEMANN): t;
}
