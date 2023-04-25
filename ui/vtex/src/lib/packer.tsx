/* eslint-disable no-unused-vars */
import {
  $AXIS2D,
  $AXIS2D_STYLES,
  $EDGE,
  $FUNC2D,
  $FUNC2D_STYLES,
  $NODE,
  AXIS2D,
  EDGE,
  FUNC2D,
  GRAPH,
  NODE,
  PLOT2D,
  RIEMANN,
  safe,
  TEXT,
} from ".";
import { Anchor } from "./types";
import { Visitor } from "./visitor";

export const value = <a, b>(x: a, fallback: b) =>
  safe(x) ? (x as unknown as b) : (fallback as unknown as b);

export class Packer implements Visitor<any> {
  riemann(atom: RIEMANN) {
    throw new Error("Method not implemented.");
  }
  text(atom: TEXT) {
    throw new Error("Method not implemented.");
  }
  axis2DStyles(axis: AXIS2D): $AXIS2D_STYLES {
    const ticks = axis.Ticks;
    const tickDX = axis.getDx();
    const tickDY = axis.getDy();
    const tickLength = axis.getTickLength();
    const hideZero = axis.HideZero !== undefined ? axis.HideZero : true;
    const verticalAnchor = axis.VerticalAnchor;
    const color = value(axis._color, "red");
    const fontFamily = value(axis._fontFamily, "inherit");
    const fontSize = value(axis._fontSize, 11);
    const shift = axis.getShift();
    const stroke = value(axis._stroke, "inherit");
    const strokeWidth = value(axis._strokeWidth, 1);
    const tickColor = value(axis.TickColor, "inherit");
    const tickAnchor = value(axis.TickAnchor, "middle");
    const labelPosition = axis.getLabelPosition();
    return {
      ticks,
      tickDX,
      labelPosition,
      tickDY,
      tickLength,
      hideZero,
      verticalAnchor,
      color,
      fontFamily,
      fontSize,
      shift,
      stroke,
      strokeWidth,
      tickColor,
      tickAnchor,
    };
  }
  axis2d(axis: AXIS2D): $AXIS2D {
    const styles = this.axis2DStyles(axis);
    const label = axis.Label?.getData();
    const orientation = axis.getOrientation();
    const axisType = axis.AxisType;
    return {
      label,
      styles,
      orientation,
      axisType,
    };
  }
  func2dStyles(func2D: FUNC2D): $FUNC2D_STYLES {
    const stroke = value(func2D._stroke, "red");
    const strokeWidth = value(func2D._strokeWidth, 1);
    return { stroke, strokeWidth };
  }
  func2d(func2D: FUNC2D): $FUNC2D {
    const exclusions = func2D.exclusions;
    const styles = this.func2dStyles(func2D);
    return {
      exclusions,
      styles,
    };
  }

  plot2dStyles(plot2D: PLOT2D) {
    const stroke = value(plot2D._stroke, "inherit");
    const strokeWidth = value(plot2D._strokeWidth, 1);
    return {
      stroke,
      strokeWidth,
    };
  }

  plot2d(plot2D: PLOT2D) {
    const styles = this.plot2dStyles(plot2D);
    const width = plot2D.getWidth();
    const height = plot2D.getHeight();
    return {
      styles,
      width,
      height,
    };
  }

  nodeStyles(node: NODE) {
    const fill = value(node._fill, "inherit");
    const stroke = value(node._stroke, "inherit");
    const radius = value(node._radius, 5);
    const anchor = value(node._textAnchor, "middle" as Anchor);
    const textDX = value(node._textDX, 0);
    const textDY = value(node._textDY, 0);
    const color = value(node._color, "inherit");
    return {
      fill,
      stroke,
      radius,
      anchor,
      textDX,
      textDY,
      color,
    };
  }
  node(node: NODE): $NODE {
    const value = node.value;
    const id = node.id;
    const styles = this.nodeStyles(node);
    return { value, id, styles };
  }
  edgeStyles(edge: EDGE) {
    const stroke = value(edge._stroke, "inherit");
    const strokeWidth = value(edge._strokeWidth, 1);
    return {
      stroke,
      strokeWidth,
    };
  }
  edge(edge: EDGE): $EDGE {
    const source = edge.source.getData();
    const target = edge.target.getData();
    const isLoop = edge.isLoop;
    const isDirected = edge.isDirected;
    const id = edge.id;
    const styles = this.edgeStyles(edge);
    return {
      source,
      target,
      isLoop,
      isDirected,
      id,
      styles,
    };
  }
  graph(graph: GRAPH) {
    return graph.clone();
  }
}

export const pack = new Packer();
