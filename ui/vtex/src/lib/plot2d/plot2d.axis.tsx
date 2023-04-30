/* eslint-disable no-unused-vars */
import { ScaleLinear, ScaleLogarithmic, ScalePower, ScaleRadial } from "d3";
import { scaleLinear, scaleLog, scalePower, scaleRadial } from "@visx/scale";
import { Datum } from "../core/core.atom";
import { N2, Orientation } from "../types";
import {
  Classable,
  Colorable,
  Movable,
  nonnull,
  Textual,
} from "../core/core.utils";
import { Group } from "../group/group.main";
import { shift } from "../path/path";
import { Axis as VisualAxis } from "@visx/axis";

export type Axis2DType = "x" | "y";

export type LinearScale = ScaleLinear<number, number, never>;
export type PowerScale = ScalePower<number, number, never>;
export type LogScale = ScaleLogarithmic<number, number, never>;
export type RadialScale = ScaleRadial<number, number, never>;
export type ScaleFn = LinearScale | PowerScale | LogScale | RadialScale;

export type ScaleType = "linear" | "power" | "log" | "radial";

export class Axis2D extends Datum {
  /**
   * Property indicating whether the axis
   * maps to x or y.
   */
  axisType: Axis2DType;
  constructor(axisType: Axis2DType) {
    super("axis2D");
    this.axisType = axisType;
  }

  /**
   * Hides the zero on the given axis.
   * If no argument is provided, no zero
   * is rendered on either axis.
   */
  _noZero?: boolean;
  noZero(on?: true) {
    this._noZero = on;
    return this;
  }

  /**
   * Sets the axis’s orientation. Valid
   * values:
   *
   * - `top`
   * - `right`
   * - `bottom`
   * - `left`
   */
  _orient?: Orientation;
  orient(value: Orientation) {
    this._orient = value;
    return this;
  }

  _scaleType?: ScaleType;
  /**
   * Sets the axis’s scale type.
   * Valid values:
   *
   * - `linear`
   * - `power`
   * - `log`
   * - `radial`
   *
   * Defaults to `linear`.
   */
  scale(type: ScaleType = "linear") {
    this._scaleType = type;
    return this;
  }

  /**
   * Returns the scale’s scaling function
   * according the scale type.
   */
  scaleFn(domain: N2, range: N2): ScaleFn {
    const scaleType = nonnull<ScaleType>(this._scaleType, "linear");
    switch (scaleType) {
      case "linear":
        return scaleLinear({ domain, range });
      case "log":
        return scaleLog({ domain, range });
      case "power":
        return scalePower({ domain, range });
      case "radial":
        return scaleRadial({ domain, range });
    }
  }

  /** the axis ticks' x-offset value. */
  _tx?: number;

  /** Sets the axis ticks' x-offset. */
  tx(value: number) {
    this._tx = value;
    return this;
  }

  /** The axis ticks' y-offset value. */
  _ty?: number;

  /** Sets the axis ticks' y-offset. */
  ty(value: number) {
    this._ty = value;
    return this;
  }

  /** The number of ticks on the axis. */
  _ticks?: number;

  /** Sets the number of ticks on the axis. Defaults to 10. */
  ticks(value: number) {
    this._ticks = value;
    return this;
  }

  /** The length of each axis tick. */
  _tickLength?: number;

  /** Sets the length9f each axis tick. */
  tickLength(value: number) {
    this._tickLength = value;
    return this;
  }
}

/** Creates a new stylable axis. */
export function axis(type: Axis2DType) {
  const AXIS = Classable(Textual(Movable(Colorable(Axis2D))));
  return new AXIS(type);
}

export type $AXIS2D = ReturnType<typeof axis>;

export function isAxis(datum: Datum): datum is $AXIS2D {
  return datum.type === "axis2D";
}

export type AxisAPI = {
  data: $AXIS2D;
	scale: ScaleFn;
	Dx?: number;
	Dy?: number;
};
export function Axis({
  data,
  scale,
	Dx=0,
	Dy=0
}: AxisAPI) {
  const axisType = data.axisType;
  const isYAxis = axisType === "y";
  const hideZero = nonnull(data._noZero, true);
  const numTicks = nonnull(data._ticks, 10);
  const tickTransform = isYAxis ? shift(-2, 0) : shift(0, -2);
  const orient = nonnull(data._orient, isYAxis ? "right" : "bottom");
  const tickStroke = nonnull(data._stroke, "currentColor");
  const tickLength = nonnull(data._tickLength, 4);
  const textAnchor = nonnull(data._textAnchor, isYAxis ? "start" : "middle");
  const verticalAnchor = nonnull(
    data._verticalAnchor,
    isYAxis ? "end" : "start",
  );
  const fontFamily = nonnull(data._font, "inherit");
  const fontSize = nonnull(data._fontSize, 11);
  const dx = nonnull(data._dx, isYAxis ? 2 : 3);
  const fontColor = nonnull(data._color, "currentColor");
  return (
    <Group dx={Dx} dy={Dy}>
      <VisualAxis
        scale={scale}
        hideZero={hideZero}
        numTicks={numTicks}
        tickTransform={tickTransform}
        orientation={orient}
        stroke={tickStroke}
        tickStroke={tickStroke}
        tickLength={tickLength}
        tickLabelProps={() => ({
          fill: fontColor,
          textAnchor,
          verticalAnchor,
          fontFamily,
          fontSize,
          dx,
        })}
      />
    </Group>
  );
}
