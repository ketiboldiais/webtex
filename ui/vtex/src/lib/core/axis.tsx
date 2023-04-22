import { scaleLinear } from "@visx/scale";
import { Struct, Visitor } from "./datum";
import {
  $AxisXY,
  AxisXYStyles,
  TickStyles,
} from "./data";
import { Axis } from "@visx/axis";
import { Group } from "./group";
import { Pair, Orientation } from "../types";

/** The direction of the axis. */
export type _Direction = "x" | "y";

/**
 * Sets the function used to scale
 * the axis values.
 */
export type _ScaleType = "linear";

export class AxisXY extends Struct {
  _ticks: number = 15;
  _direction: _Direction;
  _scaleType: _ScaleType = "linear";
  _max: number = 100;
  _bounds: Pair<number> = [-10, 10];
  _styles?: Partial<AxisXYStyles>;
  _tickStyles?: Partial<TickStyles>;
  _orient?: Orientation;
  bounds(interval: Pair<number>) {
    const self = this.getWritable();
    self._bounds = interval;
    return self;
  }
  orient(value: Orientation) {
    const self = this.getWritable();
    self._orient = value;
    return self;
  }
  accept<x>(visitor: Visitor<x>) {
    visitor.axisXY(this);
  }

  getStyles() {
    return this._styles;
  }
  getTickStyles() {
    return this._tickStyles;
  }

  max(value: number) {
    const self = this.getWritable();
    self._max = value;
    return self;
  }

  tickStyle(props: Partial<TickStyles>) {
    const self = this.getWritable();
    self._tickStyles = props;
    return self;
  }

  style(props: Partial<AxisXYStyles>) {
    const self = this.getWritable();
    self._styles = props;
    return self;
  }

  get scaleFn() {
    const self = this.getWritable();
    const scaleType = self._scaleType;
    const max = self._max;
    const range = self._direction === "x" ? [0, max] : [max, 0];
    const domain = self._bounds;
    switch (scaleType) {
      case "linear":
        return scaleLinear({ domain, range });
    }
  }

  get tickStyles() {
    return this._tickStyles;
  }

  constructor(direction: "x" | "y") {
    super("AxisXY");
    this._direction = direction;
  }

  /**
   * Sets the axis’s scale type.
   */
  scale(type: _ScaleType) {
    const self = this.getWritable();
    self._scaleType = type;
    return self;
  }

  /**
   * Sets the axis’s tick count.
   * Defaults to 10.
   */
  ticks(count: number) {
    const self = this.getWritable();
    self._ticks = Math.abs(count);
    return self;
  }
}

/**
 * Creates a new axis specification.
 * Expects a `direction` argument of
 * `x` or `y`.
 *
 * If `x` is passed, an `x-axis` will be created.
 * If `y` is passed, a `y-axis` will be created.
 */
export type AxisXYFactory = (direction: _Direction) => AxisXY;
export const axis: AxisXYFactory = (direction) => new AxisXY(direction);

interface _Axis {
  data: $AxisXY;
  dx: number;
  dy: number;
}

export function PlotAxis({ data, dx, dy }: _Axis) {
  return (
    <Group dx={dx} dy={dy}>
      <Axis
        hideZero={data.styles.hideZero}
        rangePadding={data.styles.padding}
        tickTransform={data.styles.tickTransform}
        scale={data.scale}
        numTicks={data.ticks}
        tickStroke={data.styles.stroke}
        tickLength={data.styles.tickLength}
        orientation={data.orient}
        tickLabelProps={() => ({
          fill: data.styles.tickColor,
          textAnchor: data.styles.tickTextAnchor,
          verticalAnchor: data.styles.tickVerticalAnchor,
          fontFamily: data.styles.tickFont,
          fontSize: data.styles.tickFontsize,
          dx: data.styles.tickDx,
          dy: data.styles.tickDy,
        })}
      />
    </Group>
  );
}
