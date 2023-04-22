import { useMemo } from "react";
import { $Integral, LinearScale } from "../core/data";
import { Struct, Visitor } from "../core/datum";
import { area } from "d3-shape";
import { excluded } from "./data";
import { Pair } from "../types";

export type IntegralStyles = {
  fill: string;
  opacity: number;
};

export class Integral extends Struct {
  _bounds: Pair<number>;
  constructor(bounds: Pair<number>) {
    super("Integral");
    this._bounds = bounds;
  }
  accept<x>(visitor: Visitor<x>): void {
    visitor.integral(this);
  }
  _styles?: Partial<IntegralStyles>;
  style(value: Partial<IntegralStyles>) {
    const self = this.getWritable();
    self._styles = value;
    return self;
  }
}

export type IntegralFactory = (from: number, to: number) => Integral;

export const integral: IntegralFactory = (
  from,
  to,
) => new Integral([from, to]);

type _IntegralPlot = {
  f: Function;
  exclude: Pair<number>[];
  data: $Integral;
  samples: number;
  max: number;
  xScale: LinearScale;
  yScale: LinearScale;
};
export function IntegralPlot({
  data,
  exclude,
  samples,
  max,
  yScale,
  xScale,
  f,
}: _IntegralPlot) {
  const {
    lowerBound,
    upperBound,
  } = data;
  const S = Math.abs(samples);

  const dataset: AreaData[] = [];
  const AREA = useMemo(() => {
    for (let i = -S; i < S; i++) {
      const n = (i / S) * max;
      const out = excluded(n, exclude);
      const x0 = n;
      const x1 = n;
      const y0 = f(x0);
      const y1 = 0;
      if (lowerBound < n && n < upperBound) {
        dataset.push({ x0, x1, y0, y1, out });
      }
    }

    return area()
      .defined((d: any) => !isNaN(d.y0) && !isNaN(d.y1) && !d.out)
      .x0((d: any) => xScale(d.x0))
      .y0((d: any) => yScale(d.y0))
      .x1((d: any) => xScale(d.x1))
      .y1((d: any) => yScale(d.y1))(dataset as any) ?? "";
  }, [f, lowerBound, upperBound]);

  return (
    <g className={"integral"}>
      <path
        d={AREA}
        strokeWidth={1}
        opacity={data.styles.opacity}
        fill={data.styles.fill}
      />
    </g>
  );
}

type AreaData = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  out: boolean;
};
