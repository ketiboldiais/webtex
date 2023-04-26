/* eslint-disable no-unused-vars */
import { area } from "d3-shape";
import { Datum } from "../core/core.atom";
import { ScaleFn } from "./plot2d.axis";
import {
  Classable,
  Colorable,
  nonnull,
  Sketchable,
  Unique,
  unsafe,
} from "../core/core.utils";

export class Integral extends Datum {
  lowerBound: number;
  upperBound: number;
  constructor(lowerBound: number, upperBound: number) {
    super("integral");
    this.lowerBound = lowerBound;
    this.upperBound = upperBound;
  }
  _path?: string | null;
  render(
    f: Function,
    samples: number,
    max: number,
    exclude: (x: number) => boolean,
    xScale: ScaleFn,
    yScale: ScaleFn,
  ) {
    const dataset: AreaData[] = [];
    for (let i = -samples; i < samples; i++) {
      const n = (i / samples) * max;
      const out = exclude(n);
      const x0 = n;
      const x1 = n;
      const y0 = f(x0);
      const y1 = 0;
      if (this.lowerBound < n && n < this.upperBound) {
        dataset.push({ x0, x1, y0, y1, out });
      }
    }
    this._path = area()
      .defined((d: any) => !isNaN(d.y0) && !isNaN(d.y1) && !d.out)
      .x0((d: any) => xScale(d.x0))
      .y0((d: any) => yScale(d.y0))
      .x1((d: any) => xScale(d.x1))
      .y1((d: any) => yScale(d.y1))(dataset as any);
    return this;
  }
}

export type AreaData = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  out: boolean;
};

export function integral(lowerBound: number, upperBound: number) {
  const INTEGRAL = Classable(Colorable(Unique(Sketchable(Integral))));
  return new INTEGRAL(lowerBound, upperBound);
}

export type $INTEGRAL = ReturnType<typeof integral>;

export function isIntegral(datum: Datum): datum is $INTEGRAL {
  return datum.type === "integral";
}

export type IntegrationAPI = {
  data: $INTEGRAL;
};
export function Integration({ data }: IntegrationAPI) {
  if (unsafe(data._path)) return null;
  const d = data._path;
  const strokeWidth = nonnull(data._strokeWidth, 1);
  const opacity = nonnull(data._opacity, 0.2);
  const fill = nonnull(data._fill, "currentColor");
  return (
    <path
      d={d}
      strokeWidth={strokeWidth}
      opacity={opacity}
      fill={fill}
    />
  );
}
