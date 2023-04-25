/* eslint-disable no-unused-vars */
import { Fragment, useMemo } from "react";
import { ATOM } from "../atom.type";
import { pack } from "../packer";
import { N2 } from "../path/path";
import { Visitor } from "../visitor";
import { axis, AXIS2D, Axis2D, Axis2DType, isAxis2D } from "./plot.axis";
import { f, FUNC2D, isFunc } from "./plot.func";
import { SVG } from "../svg";
import { Group } from "../group/group.main";
import { Clip } from "../path/clip";
import { $TEXT, isText, TEXT, Text, text } from "../text/text.main";
import { line } from "d3-shape";
import { getMethodFn, RectCoords, RiemannMethod } from "./plot.riemann";
export type Points = N2[];
export type $PLOT2D_STYLES = {
  stroke: string;
  strokeWidth: string;
};
export type $PLOT2D = {
  styles: $PLOT2D_STYLES;
};
export const excluded = (x: number, exclude: N2[]) => {
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
export type PLOTTABLE =
  | FUNC2D
  | TEXT
  | AXIS2D;

export class PLOT2D extends ATOM {
  accept<t>(visitor: Visitor<t>): t {
    return visitor.plot2d(this);
  }
  XAxis: AXIS2D = axis("x");
  YAxis: AXIS2D = axis("y");
  Labels: TEXT[] = [];
  Functions: FUNC2D[] = [];
  constructor(functions: (PLOTTABLE)[]) {
    super(functions);
    const L = functions.length;
    for (let i = 0; i < L; i++) {
      const child = functions[i];
      if (isAxis2D(child)) {
        if (child.AxisType === "x") {
          this.XAxis = child;
        } else {
          this.YAxis = child;
        }
      }
      if (isFunc(child)) {
        this.Functions.push(child);
      }
      if (isText(child)) {
        this.Labels.push(child);
      }
    }
  }

  /**
   * Returns an x-axis
   * object.
   */
  getAxis(value: "x" | "y") {
    const axis = value === "x" ? this.XAxis : this.YAxis;
    const range = value === "x" ? [0, this.getWidth()] : [this.getHeight(), 0];
    const domain = this.Domain;
    const scaleFn = axis.scaleFn(domain, range as N2);
    const axisData = value === "x"
      ? this.XAxis.getData()
      : this.YAxis.getData();
    return { scaleFn, axisData };
  }

  Samples: number = 170;
  samples(value: number) {
    this.Samples = value;
    return this;
  }
  getFn(fx: Function, scaleX: any, scaleY: any, exclude: N2[] = []) {
    const range = this.Range;
    const domain = this.Domain;
    const samples = this.Samples;
    const dataset: Points = [];
    const yMin = range[0] * 2;
    const yMax = range[1] * 2;
    const xMin = domain[0];
    const xMax = domain[1];
    const S = Math.floor(Math.abs(samples));
    for (let i = -S; i < S; i++) {
      let x = (i / samples) * xMax;
      let y = fx(x);
      const point: N2 = [x, y];
      if (isNaN(y) || y < yMin || y >= yMax) {
        point[1] = NaN;
      }
      if (x < xMin || xMax < x) {
        continue;
      } else {
        dataset.push(point);
      }
    }
    const d = line()
      .y((d) => scaleY(d[1]))
      .defined((d) => !isNaN(d[1]))
      .x((d) => scaleX(d[0]))(dataset);

    return d ?? "";
  }
  private getRiemann(
    f: Function,
    xScale: any,
    yScale: any,
    method: RiemannMethod,
    dx: number,
    exclude: N2[],
    domain: N2,
  ) {
    const start = domain[0];
    const end = domain[1];
    if (start > end) return [];
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
  }
  private getFunctions(scaleX: any, scaleY: any) {
    const curves = [];
    const L = this.Functions.length;
    for (let i = 0; i < L; i++) {
      const F = this.Functions[i];
      const fx = F.getFunction();
      if (fx === null) continue;
      const exclude = F.exclusions;
      const path = this.getFn(fx, scaleX, scaleY, exclude);
      let riemann;
      if (F.Riemann) {
        const r = F.Riemann.getData();
        const data = this.getRiemann(
          fx,
          scaleX,
          scaleY,
          r.method,
          r.dx,
          exclude,
          [r.start, r.end],
        );
        riemann = {
          data,
          styles: r.styles,
        };
      }
      const stroke = F._stroke ? F._stroke : "tomato";
      const strokeWidth = F._strokeWidth ? F._strokeWidth : 1.5;
      const id = F.id;
      curves.push({
        path,
        stroke,
        strokeWidth,
        id,
        riemann,
      });
    }
    return curves;
  }

  getData() {
    const xAxis = this.getAxis("x");
    const yAxis = this.getAxis("y");
    const labels: $TEXT[] = [];
    const labelCount = this.Labels.length;
    const margin = this.getMargin();
    const xScale = xAxis.scaleFn;
    const yScale = yAxis.scaleFn;
    if (this.Labels.length !== 0) {
      for (let i = 0; i < labelCount; i++) {
        const label = this.Labels[i];
        const [x, y] = label.getAt();
        const X = xScale(x);
        const Y = yScale(y);
        const newLabel = label.clone();
        newLabel.at(X, Y);
        labels.push(newLabel.getData());
      }
    }
    const curves = this.getFunctions(xScale, yScale);
    const plot = pack.plot2d(this);
    const id = this.id;
    return {
      plot,
      id,
      xAxis,
      yAxis,
      margin,
      labels,
      curves,
    };
  }

  Width: number = 500;
  width(value: number) {
    this.Width = value;
    return this;
  }
  getWidth() {
    return this.Width - this.getMargin();
  }

  Height: number = 500;
  height(value: number) {
    this.Height = value;
    return this;
  }
  getHeight() {
    return this.Height - this.getMargin();
  }

  Domain: N2 = [-10, 10];
  domain(x0: number, x1: number) {
    if (x0 < x1) {
      this.Domain = [x0, x1];
    }
    return this;
  }

  Range: N2 = [-10, 10];
  range(y0: number, y1: number) {
    if (y0 < y1) {
      this.Range = [y0, y1];
    }
    return this;
  }

  Margin?: number;
  margin(value: number) {
    this.Margin = value;
    return this;
  }
  getMargin() {
    const margin = this.Margin !== undefined ? this.Margin : 50;
    return margin;
  }
}

export const plot2D = (
  ...functions: (PLOTTABLE)[]
) => new PLOT2D(functions);

type _Plot2D = {
  data: PLOT2D;
  className?: string;
};
export function Plot2D({
  data,
  className,
}: _Plot2D) {
  const Data = data.getData();
  const scaleX = Data.xAxis.scaleFn;
  const scaleY = Data.yAxis.scaleFn;
  const xMin = scaleX(data.Domain[0]);
  const xMax = scaleX(data.Domain[1]);
  const yMin = scaleY(data.Range[0]);
  const yMax = scaleY(data.Range[1]);
  const xLabelPos = Data.xAxis.axisData.styles.labelPosition;
  const yLabelPos = Data.yAxis.axisData.styles.labelPosition;
  const margin = Data.margin;
  const width = Data.plot.width;
  const height = Data.plot.height;
  const Lx: N2 = xLabelPos === 1 ? [xMax, 0] : [xMin, 0];
  const Ly: N2 = yLabelPos === 1 ? [0, yMax] : [0, yMin];
  const labels = Data.labels;
  const curves = Data.curves;
  return (
    <div>
      <SVG
        width={width + margin}
        height={height + margin}
        className={className}
      >
        <Clip id={Data.id} width={width} height={height} />
        <Group dx={margin / 2} dy={margin / 2}>
          <Axis2D
            data={Data.yAxis.axisData}
            scale={scaleY}
            dx={Data.xAxis.scaleFn(0)}
            dy={0}
            offset={Ly}
            margin={margin}
          />
          <Axis2D
            data={Data.xAxis.axisData}
            scale={scaleX}
            dx={0}
            dy={Data.yAxis.scaleFn(0)}
            offset={Lx}
            margin={margin}
          />
          {labels.length && <Labels data={labels} />}
          {curves.length &&
            curves.map((d) => (
              <Fragment key={d.id}>
                {d.riemann && (
                  <Riemann
                    id={d.id}
                    data={d.riemann.data}
                    {...d.riemann.styles}
                  />
                )}
                <path
                  d={d.path}
                  stroke={d.stroke}
                  strokeWidth={d.strokeWidth}
                  fill={"none"}
                />
              </Fragment>
            ))}
        </Group>
      </SVG>
    </div>
  );
}

type _Riemann = {
  data: RectCoords[];
  fill: string;
  stroke: string;
  opacity: number;
  id: string;
};
const Riemann = ({
  data,
  fill,
  stroke,
  opacity,
  id,
}: _Riemann) => (
  <g stroke={stroke} strokeOpacity={opacity} fill={fill}>
    {data.map((rect, i) =>
      !rect.out && (
        <Group key={id + i} dx={rect.dx} dy={0}>
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

type _Labels = {
  data: $TEXT[];
};

function Labels({ data }: _Labels) {
  return (
    <>
      {data.map((text) => <Text key={text.id} data={text} />)}
    </>
  );
}
