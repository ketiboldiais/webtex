import { Struct, Visitor } from "../core/datum";
import { LinearScale, RiemannStyles } from "../core/data";
import { useMemo } from "react";
import { excluded } from "./data";
import { Group } from "../core/group";
import { Pair } from "../types";

export type RiemannMethod = "left" | "midpoint" | "right";

export type $Riemann = {
  domain: Pair<number>;
  dx: number;
  method: RiemannMethod;
  styles: RiemannStyles;
};

export class Riemann extends Struct {
  _domain: Pair<number> = [-1, 1];
  _dx: number = 0.2;
  _method: RiemannMethod;
  _styles?: Partial<RiemannStyles>;
  constructor(method: RiemannMethod) {
    super("Riemann");
    this._method = method;
  }
  getStyles() {
    return this._styles;
  }
  style(props: Partial<RiemannStyles>) {
    const self = this.getWritable();
    self._styles = props;
    return self;
  }
  accept<x>(visitor: Visitor<x>): void {
    visitor.riemann(this);
  }
  dx(value: number) {
    const self = this.getWritable();
    self._dx = value;
    return self;
  }
  domain(interval: Pair<number>) {
    const self = this.getWritable();
    self._domain = interval;
    return self;
  }
}

export type RiemannFactory = (method: RiemannMethod) => Riemann;
export const riemann = (method: RiemannMethod) => new Riemann(method);

type _RiemannPlot = {
  id: string;
  data: $Riemann;
  f: Function;
  xScale: LinearScale;
  yScale: LinearScale;
  exclude: Pair<number>[];
};
export function RiemannPlot({
  id,
  data,
  f,
  xScale,
  yScale,
  exclude,
}: _RiemannPlot) {
  const { domain, dx, method } = data;
  const start = domain[0];
  const end = domain[1];
  if (start > end) return null;
  const rects = useMemo(() => {
    const rx = getMethodFn(method);
    const coords: RectCoords[] = [];
    for (let i = start; i < end; i += dx) {
      const x = i;
      const x1 = xScale(x);
      const x2 = xScale(x);
      if (x2 === xScale(end)) continue;
      const y1 = yScale(f(x));
      const y2 = yScale(0);
      const out = excluded(x, exclude);
      coords.push({ x1, x2, y1, y2, width: 0, dx: 0, out });
    }
    if (!coords.length) return [];
    let i = 0;
    let current: null | RectCoords = null;
    do {
      if (current === null) {
        current = coords[0];
      } else {
        current = coords[i];
        const prev = coords[i - 1];
        const next = coords[i + 1] || coords[i];
        const w = current.x1 - prev.x1;
        prev.width = w;
        next.width = w;
        const shift = rx(w);
        prev.dx = shift;
        next.dx = shift;
      }
      i++;
    } while (i < coords.length);
    return coords;
  }, [domain, dx, method]);

  return (
    <g stroke={data.styles.color} strokeOpacity={data.styles.opacity}>
      {rects.map((rect, i) =>
        !rect.out && (
          <Group key={id + "riemann" + i} dx={rect.dx} dy={0}>
            <line
              strokeWidth={rect.width - 1}
              x1={rect.x1}
              y1={rect.y1}
              x2={rect.x2}
              y2={rect.y2}
            />
          </Group>
        )
      )}
    </g>
  );
}
type RectCoords = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  dx: number;
  out: boolean;
};
const getMethodFn = (method: RiemannMethod) => {
  switch (method) {
    case "left":
      return (x: number) => x / 2;
    case "right":
      return (x: number) => -x / 2;
    case "midpoint":
      return (_: number) => 0;
  }
};
