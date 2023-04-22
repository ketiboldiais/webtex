import { ScaleLinear } from "d3";
import { Fn } from "../plot2d/data";
import { Integral, IntegralStyles } from "../plot2d/integral";
import { $Riemann, Riemann } from "../plot2d/riemann";
import { _Direction, _ScaleType, AxisXY } from "./axis";
import { Visitor } from "./datum";
import { Poset } from "./poset";
import { shift } from "./utils";
import { Asymptote, LineStyle } from "../plot2d/asymptote";
import { Fn3D } from "../plot3d/plot3d";
import { Anchor, Orientation, Pair } from "../types";

const makeFnStyles = (styles?: Partial<FnStyles>): FnStyles => {
  const color = styles?.color || "red";
  const width = styles?.width || 1;
  const dashed = styles?.dashed || 0;
  return { color, width, dashed };
};

const makeTickStyles = (
  direction: _Direction,
  styles?: Partial<TickStyles>,
): TickStyles => {
  const textAnchor = styles?.textAnchor ||
    (direction === "x" ? "middle" : "start");
  const verticalAnchor = styles?.textAnchor ||
    (direction === "x" ? "end" : "start");
  const length = styles?.length || 4;
  const dx = styles?.dx ? styles.dx : (direction === "x" ? 0 : 7);
  const dy = styles?.dy ? styles.dy : (direction === "y" ? -3 : 3);
  const color = styles?.color || "black";
  const font = styles?.font || "inherit";
  const fontsize = styles?.fontsize || "0.6rem";
  const transform = styles?.transform ||
    (direction === "y" ? shift(length / 2, 0) : shift(0, -length / 2));
  return {
    length,
    dx,
    dy,
    color,
    font,
    fontsize,
    textAnchor,
    transform,
    verticalAnchor,
  };
};

const makeAxisStyles = (
  styles?: Partial<AxisXYStyles>,
): AxisXYStyles => {
  const hideZero = styles?.hideZero || true;
  const padding = styles?.padding || 0;
  const stroke = styles?.stroke || "black";
  const width = styles?.width || 1;
  return {
    hideZero,
    padding,
    stroke,
    width,
  };
};
export type $Poset = {
  interval: Pair<number>;
  exclude: Pair<number>[];
};
export type $Integral = {
  lowerBound: number;
  upperBound: number;
  styles: IntegralStyles;
};
export type $Asymptote = {
  value: number;
  direction: _Direction;
  styles: LineStyle;
};
const getRiemannStyles = (style?: Partial<RiemannStyles>): RiemannStyles => {
  const color = style?.color || "tomato";
  const opacity = style?.opacity || 0.5;
  return { color, opacity };
};
export class DataHandler implements Visitor<any> {
  fn3D(struct: Fn3D) {
    throw new Error("Method not implemented.");
  }
  asymptote(struct: Asymptote): $Asymptote {
    const value = struct._at;
    const direction = struct._direction;
    const color = struct._styles?.color || "grey";
    const width = struct._styles?.width || 1;
    const dash = struct._styles?.dash || 5;
    return {
      value,
      direction,
      styles: {
        color,
        width,
        dash,
      },
    };
  }
  poset(struct: Poset): $Poset {
    const interval = struct._interval;
    const exclude = struct._exclude || [];
    return {
      interval,
      exclude,
    };
  }
  integral(struct: Integral): $Integral {
    const fill = struct._styles?.fill || "gold";
    const bounds = struct._bounds;
    const opacity = struct._styles?.opacity || 0.3;
    return {
      lowerBound: bounds[0],
      upperBound: bounds[1],
      styles: {
        fill,
        opacity,
      },
    };
  }
  riemann(struct: Riemann): $Riemann {
    const domain = struct._domain;
    const dx = struct._dx;
    const method = struct._method;
    const styles = getRiemannStyles(struct._styles);
    return {
      domain,
      dx,
      method,
      styles,
    };
  }
  fn(struct: Fn): $Fn | null {
    const fn = struct.fn;
    if (fn === null) return null;
    const styles = makeFnStyles(struct.getStyles());
    const domain = struct._domain;
    const range = struct._range;
    const xMin = domain[0];
    const xMax = domain[1];
    const yMin = range[0] * 2;
    const yMax = range[1] * 2;
    const riemann = struct._riemann ? this.riemann(struct._riemann) : undefined;
    const integral = struct._integral
      ? this.integral(struct._integral)
      : undefined;
    const exclude = struct._exclude;
    return {
      fn,
      xMin,
      exclude,
      xMax,
      yMin,
      yMax,
      riemann,
      integral,
      styles: {
        pathColor: styles.color,
        pathWidth: styles.width,
        dash: styles.dashed,
      },
    };
  }
  axisXY(struct: AxisXY): $AxisXY {
    const direction = struct._direction;
    const ticks = struct._ticks;
    const scale = struct.scaleFn;
    const bounds = struct._bounds;
    const orient = struct._orient || (direction === "x" ? "bottom" : "left");
    const axisStyles = makeAxisStyles(struct.getStyles());
    const tickStyles = makeTickStyles(direction, struct.getTickStyles());
    return {
      ticks,
      bounds,
      direction,
      scale,
      orient,
      styles: {
        tickColor: tickStyles.color,
        tickTextAnchor: tickStyles.textAnchor,
        tickVerticalAnchor: tickStyles.verticalAnchor,
        tickLength: tickStyles.length,
        tickFont: tickStyles.font,
        tickFontsize: tickStyles.fontsize,
        tickDx: tickStyles.dx,
        tickDy: tickStyles.dy,
        tickTransform: tickStyles.transform,
        hideZero: axisStyles.hideZero,
        padding: axisStyles.padding,
        stroke: axisStyles.stroke,
      },
    };
  }
}

export type $Fn = {
  fn: Function;
  yMin: number;
  yMax: number;
  xMin: number;
  xMax: number;
  exclude: Pair<number>[];
  riemann?: $Riemann;
  integral?: $Integral;
  styles: {
    pathColor: string;
    pathWidth: number;
    dash: number;
  };
};
export type FnStyles = {
  color: string;
  width: number;
  dashed: number;
};

export type LinearScale = ScaleLinear<number, number, never>;

export type $AxisXY = {
  direction: _Direction;
  ticks: number;
  scale: LinearScale;
  orient: Orientation;
  styles: AxisStyle;
  bounds: Pair<number>;
};

export type RiemannStyles = {
  color: string;
  opacity: number;
};

type AxisStyle = {
  tickColor: string;
  tickTextAnchor: Anchor;
  tickVerticalAnchor: Anchor;
  tickLength: number;
  tickFont: string;
  tickFontsize: number | string;
  tickDy: number;
  tickDx: number;
  tickTransform: string;
  hideZero: boolean;
  padding: number;
  stroke: string;
};

export type TickStyles = {
  color: string;
  textAnchor: Anchor;
  verticalAnchor: Anchor;
  length: number;
  font: string;
  fontsize: number | string;
  transform: string;
  dy: number;
  dx: number;
};

export type AxisXYStyles = {
  hideZero: boolean;
  padding: number;
  stroke: string;
  width: number;
};

export const getData = new DataHandler();
