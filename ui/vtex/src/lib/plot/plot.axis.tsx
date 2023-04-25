import { scaleLinear, scaleLog, scalePower } from "@visx/scale";
import { ATOM } from "../atom.type";
import { Visitor } from "../visitor";
import { $TEXT, Group, latex, N2, pack, shift, TEXT, Text, text } from "..";
import { PLOTTABLE } from "./plot.main";
import { Anchor } from "../types";
import { Axis } from "@visx/axis";

export type Orientation = "top" | "right" | "bottom" | "left";

export type $AXIS2D_STYLES = {
  ticks: number;
  tickDX: number;
  tickDY: number;
  tickLength: number;
  tickColor: string;
  hideZero: boolean;
  verticalAnchor: Anchor;
  tickAnchor: Anchor;
  color: string;
  fontFamily: string;
  fontSize: string | number;
  shift: string;
  stroke: string;
  strokeWidth: number;
  labelPosition: number;
};

export type $AXIS2D = {
  label?: $TEXT;
  orientation: Orientation;
  styles: $AXIS2D_STYLES;
  axisType: Axis2DType;
};

export type Axis2DType = "x" | "y";

export type Axis2DScaleType = "linear" | "logarithmic" | "power";

export class AXIS2D extends ATOM {
  accept<t>(visitor: Visitor<t>): t {
    return visitor.axis2d(this);
  }

  getData() {
    return pack.axis2d(this);
  }

  AxisType: Axis2DType = "x";
  constructor(type: Axis2DType) {
    super();
    this.AxisType = type;
  }

  VerticalAnchor: Anchor = this.AxisType === "x" ? "end" : "start";
  verticalAnchor(value: Anchor) {
    this.VerticalAnchor = value;
    return this;
  }

  TickAnchor: Anchor = this.AxisType === "x" ? "middle" : "start";
  tickAnchor(value: Anchor) {
    this.TickAnchor = value;
    return this;
  }

  Ticks: number = 10;
  ticks(value: number) {
    if (0 <= value && Number.isInteger(value)) {
      this.Ticks = value;
    }
    return this;
  }

  Dx?: number;
  dx(value: number) {
    this.Dx = value;
    return this;
  }
  getDx() {
    const dx: number = this.AxisType === "x" ? 0 : 8;
    return dx;
  }

  Dy?: number;
  dy(value: number) {
    this.Dy = value;
    return this;
  }
  getDy() {
    const dy: number = this.AxisType === "x" ? -3 : 3;
    return dy;
  }

  TickLength?: number;
  tickLength(value?: number) {
    this.TickLength = value;
    return this;
  }
  getTickLength() {
    const L = this.TickLength;
    return L !== undefined ? L : 4;
  }

  HideZero?: boolean;
  hideZero(value?: boolean) {
    this.HideZero = value;
    return this;
  }

  Label?: TEXT;
  LabelPosition?: 0 | 1;
  label(value: string = "", position?: 0 | 1) {
    this.Label = text(value);
    this.LabelPosition = position;
    return this;
  }
  latex(value: string = "", position?: 0 | 1) {
    this.Label = latex(value);
    this.LabelPosition = position;
    return this;
  }
  getLabelPosition() {
    const pos = this.LabelPosition !== undefined ? this.LabelPosition : 1;
    return pos;
  }

  ScaleType?: Axis2DScaleType;
  scaleType(value: Axis2DScaleType) {
    this.ScaleType = value;
    return this;
  }
  getScaleType() {
    const out = this.ScaleType ? this.ScaleType : "linear";
    return out;
  }

  scaleFn(domain: N2, range: N2) {
    const scaleType = this.getScaleType();
    switch (scaleType) {
      case "linear":
        return scaleLinear({ domain, range });
      case "logarithmic":
        return scaleLog({ domain, range });
      case "power":
        return scalePower({ domain, range });
    }
  }

  Shift?: string;

  shift(x: number, y: number) {
    this.Shift = shift(x, y);
    return this;
  }
  getShift() {
    const L = this.getTickLength();
    const out = this.AxisType === "y" ? shift(-L / 2, 0) : shift(0, -L / 2);
    return out;
  }
  Orientation?: Orientation;
  orient(value: Orientation) {
    this.Orientation = value;
    return this;
  }
  getOrientation() {
    const out = this.AxisType === "x" ? "bottom" : "right";
    return out;
  }
  TickColor: string = "inherit";
  tickColor(color: string) {
    this.TickColor = color;
    return this;
  }
}

export const axis = (
  type: "x" | "y",
) => new AXIS2D(type);

export const isAxis2D = (
  x: PLOTTABLE,
): x is AXIS2D => x instanceof AXIS2D;

type _Axis2D = {
  scale: any;
  data: $AXIS2D;
  dx: number;
  dy: number;
  offset: N2;
  margin: number;
};

export function Axis2D({
  scale,
  data,
  dx,
  dy,
  offset,
  margin,
}: _Axis2D) {
  const { axisType } = data;
  const isPos = data.styles.labelPosition === 1;
  const axisIsX = axisType === "x";
  const [tx, ty] = axisIsX
    ? [
      isPos ? margin / 4 : -margin / 4,
      -margin / 4,
    ]
    : [
      -margin/8,
      isPos ? -margin / 1.5 : margin / 1.5,
    ];

  return (
    <Group dx={dx} dy={dy} className={`plot2d-axis-${axisType}`}>
      <Axis
        hideZero={data.styles.hideZero}
        scale={scale}
        numTicks={data.styles.ticks}
        tickStroke={data.styles.stroke}
        tickLength={data.styles.tickLength}
        orientation={axisIsX ? "bottom" : "right"}
        tickTransform={data.styles.shift}
        tickLabelProps={() => ({
          fill: data.styles.tickColor,
          textAnchor: data.styles.tickAnchor,
          verticalAnchor: data.styles.verticalAnchor,
          fontFamily: data.styles.fontFamily,
          fontSize: data.styles.fontSize,
          dx: !axisIsX ? data.styles.tickLength * 2 : 0,
          dy: !axisIsX ? data.styles.tickLength : 0,
        })}
      />
      {data.label && (
        <g transform={`translate(${tx},${ty})`}>
          <Text data={{ ...data.label, x: offset[0], y: offset[1] }} />
        </g>
      )}
    </Group>
  );
}
