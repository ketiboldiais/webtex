import { Datum } from "../core/core.atom";
import { Classable, nonnull, Spatial, Unique } from "../core/core.utils";
import { SVG } from "../core/svg";
import { Group } from "../group/group.main";
import { Clip } from "../path/clip";
import { N2 } from "../types";
import { $AXIS2D, Axis, axis, isAxis } from "./plot2d.axis";
import { $FUNCTION2D, FnCurve, isFunction2D } from "./plot2d.fn";

export class Plot extends Datum {
  _functions: $FUNCTION2D[];
  _xAxis: $AXIS2D = axis("x");
  _yAxis: $AXIS2D = axis("y");
  constructor(subjects: Plottable[]) {
    super("plot");
    this._functions = [];
    for (let i = 0; i < subjects.length; i++) {
      const subject = subjects[i];
      if (isAxis(subject)) {
        if (subject.axisType === "x") {
          this._xAxis = subject;
        }
        if (subject.axisType === "y") {
          this._yAxis = subject;
        }
      }
      if (isFunction2D(subject)) {
        this._functions.push(subject);
      }
    }
  }
  /**
   * @internal The function plot’s global domain.
   * This property sets the domain bounds on
   * all plotted functions and
   * the x-axis.
   */
  _domain?: N2;

  /**
   * Declares the function plot’s
   * domain. All functions are plotted
   * subject to this domain.
   * Defaults to `[-10,10]`.
   */
  domain(min: number, max: number) {
    if (min < max) {
      this._domain = [min, max];
    }
    return this;
  }

  /**
   * @internal The plot’s global range.
   * This property sets the range
   * bounds on all plotted functions
   * and the y-axis.
   */
  _range?: N2;
  /**
   * Declares the function plot’s
   * range. All functions are plotted
   * subject to this range.
   * Defaults to `[-10, 10]`.
   */
  range(min: number, max: number) {
    if (min < max) {
      this._range = [min, max];
    }
    return this;
  }

  /**
   * @internal The number of samples
   * to be plotted.
   */
  _samples?: number;

  /**
   * Sets the number of samples to
   * take for the function plot.
   * The value must be greater than
   * `0` and less than `1000`. Defaults
   * to `170`.
   */
  samples(value: number) {
    if (0 < value && value < 1000) {
      this._samples = value;
    }
    return this;
  }

  /**
   * Returns the rendered plot strings.
   */
  fplot(svgWidth: number, svgHeight: number) {
    const domain = nonnull<N2>(this._domain, [-10, 10]);
    const range = nonnull<N2>(this._range, [-10, 10]);
    const xScale = this._xAxis.scaleFn(domain, [0, svgWidth]);
    const yScale = this._yAxis.scaleFn(range, [svgHeight, 0]);
    const samples = nonnull(this._samples, 170);

    const FCount = this._functions.length;
    for (let i = 0; i < FCount; i++) {
      const fn = this._functions[i];
      fn.plot(xScale, yScale, domain, range, samples);
    }

    return {
      functions: this._functions,
      xScale,
      yScale,
      AxisX: this._xAxis,
      AxisY: this._yAxis,
    };
  }
}

export type Plottable = $AXIS2D | $FUNCTION2D;
export function plot(...subjects: Plottable[]) {
  const PLOT = Classable(Spatial(Unique(Plot)));
  return new PLOT(subjects);
}

export type $PLOT = ReturnType<typeof plot>;

type Plot2DAPI = {
  data: $PLOT;
};
export function Plot2D({ data }: Plot2DAPI) {
  const width = nonnull(data._width, 500);
  const height = nonnull(data._height, 500);
  const marginTop = nonnull(data._marginTop, 50);
  const marginRight = nonnull(data._marginRight, 50);
  const marginBottom = nonnull(data._marginBottom, 50);
  const marginLeft = nonnull(data._marginBottom, 50);
  const svgWidth = width - marginRight - marginLeft;
  const svgHeight = height - marginTop - marginBottom;
  const plotData = data.fplot(svgWidth, svgHeight);
  const id = data.id;
  const marginsY = marginTop + marginBottom;
  const marginsX = marginLeft + marginRight;
  return (
    <SVG width={width} height={height}>
      <Clip id={id} width={width} height={height} />
      <Group dx={marginsX / 2} dy={marginsY / 2}>
        <Axis
          data={plotData.AxisY}
          scale={plotData.yScale}
          Dx={plotData.xScale(0)}
          Dy={0}
        />
        <Axis
          data={plotData.AxisX}
          scale={plotData.xScale}
          Dx={0}
          Dy={plotData.yScale(0)}
        />
        {plotData.functions.map((fn, i) => (
          <FnCurve clipID={id} key={fn.id + i} data={fn} />
        ))}
      </Group>
    </SVG>
  );
}
