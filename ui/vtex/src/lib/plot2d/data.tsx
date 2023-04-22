import { createFunction } from "@webtex/algom";
import { _PathStyles, Struct, Visitor } from "../core/datum";
import { Riemann, RiemannPlot } from "./riemann";
import { Integral, IntegralPlot } from "./integral";
import { $Fn, FnStyles, LinearScale } from "../core/data";
import { useMemo } from "react";
import { line } from "d3-shape";
import { Pair } from "../types";

export class Fn extends Struct {
  _variable: string = "";
  _expression: string = "";
  _domain: Pair<number> = [-10, 10];
  _range: Pair<number> = [-10, 10];
  _riemann: Riemann | undefined;
  _integral: Integral | undefined;
  _styles?: Partial<FnStyles>;
  _samples: number = 0;

  samples(count: number) {
    const self = this.getWritable();
    self._samples = Math.abs(count);
    return self;
  }

  accept<x>(visitor: Visitor<x>): void {
    visitor.fn(this);
  }

  constructor(variable: string) {
    super("Fn");
    this._variable = variable;
  }
  getStyles() {
    return this._styles;
  }

  style(value: Partial<FnStyles>) {
    const self = this.getWritable();
    self._styles = value;
    return self;
  }
  equals(expression: string) {
    const self = this.getWritable();
    self._expression = expression;
    return self;
  }
  domain(interval: [number, number]) {
    const self = this.getWritable();
    self._domain = interval;
    return self;
  }
  _exclude: Pair<number>[] = [];
  exclude(...intervals: Pair<number>[]) {
    const self = this.getWritable();
    const current = self._exclude;
    self._exclude = [...current, ...intervals];
    return self;
  }
  range(interval: [number, number]) {
    const self = this.getWritable();
    self._range = interval;
    return self;
  }
  include(struct: Struct) {
    const self = this.getWritable();
    if (struct instanceof Riemann) {
      self._riemann = struct;
    }
    if (struct instanceof Integral) {
      self._integral = struct;
    }
    return self;
  }
  get fn() {
    const self = this.getWritable();
    const arg = self._variable;
    const body = self._expression;
    const f = `f(${arg}) = ${body}`;
    const output = createFunction(f);
    if (typeof output === "string") {
      return null;
    }
    return output;
  }
}

export type FPlotFactory = (variable: string) => Fn;
export const f = (variable: string) => new Fn(variable);

export type _FnCurve = {
  id: string;
  data: $Fn | null;
  xScale: LinearScale;
  yScale: LinearScale;
  samples: number;
};
export function FnCurve({
  id,
  data,
  xScale,
  yScale,
  samples,
}: _FnCurve) {
  if (data === null) return null;
  const {
    fn,
    xMin,
    xMax,
    yMin,
    yMax,
    riemann,
    integral,
    styles,
    exclude,
  } = data;
  const datapoints = useMemo(() => {
    const dataset: Pair<number>[] = [];
    for (let i = -samples; i < samples; i++) {
      const x = (i / samples) * xMax;
      const y = fn(x);
      const point: Pair<number> = [x, y];
      if (isNaN(y) || y < yMin || y >= yMax) {
        point[1] = NaN;
      }
      if (excluded(x, exclude)) {
        point[1] = NaN;
      }
      if (x < xMin || xMax < x) continue;
      dataset.push(point);
    }
    const d = line()
      .y((d) => yScale(d[1]))
      .defined((d) => !isNaN(d[1]))
      .x((d) => xScale(d[0]))(dataset);
    return d ?? "";
  }, [
    fn,
    xMin,
    xMax,
    yMin,
    yMax,
    riemann,
    integral,
    exclude,
    xScale,
    yScale,
    samples,
  ]);
  return (
    <g clipPath={`url(#${id})`}>
      <path
        d={datapoints}
        shapeRendering={"geometricPrecision"}
        fill={"none"}
        stroke={styles.pathColor}
        strokeDasharray={styles.dash}
        strokeWidth={styles.pathWidth}
      />
      {riemann && (
        <RiemannPlot
          id={id}
          data={riemann}
          f={fn}
          xScale={xScale}
          yScale={yScale}
          exclude={exclude}
        />
      )}
      {integral && (
        <IntegralPlot
          data={integral}
          exclude={exclude}
          samples={samples}
          max={xMax}
          xScale={xScale}
          yScale={yScale}
          f={fn}
        />
      )}
    </g>
  );
}

export const excluded = (x: number, exclude: Pair<number>[]) => {
  for (let i = 0; i < exclude.length; i++) {
    const exclusion = exclude[i];
    const min = exclusion[0];
    const max = exclusion[1];
    if (min <= x && x <= max) {
      return true;
    }
  }
  return false;
};
