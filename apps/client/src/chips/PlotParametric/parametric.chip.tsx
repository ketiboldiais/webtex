import { line } from "d3-shape";
import {
  Clip,
  Plane,
  Scale,
  SVG,
  svgDimensions,
  XScale,
  YScale,
} from "../PlotUtils";
import { Pair, Quad } from "src/App";
import { NodeKey, SerializedLexicalNode, Spread } from "lexical";
import { nanoid } from "nanoid";
import { makeFunction } from "@webtex/algom";

function parametric(
  fx: Function,
  fy: Function,
  domain: [number, number],
  samples: number,
) {
  const dataset: Point[] = [];
  const xMax = domain[1] * Math.PI;
  for (let i = -samples; i < samples; i++) {
    let t = (((i) * Math.PI) / samples) * xMax;
    let x = fx(t);
    let y = fy(t);
    let point: Point = { x, y };
    if (isNaN(y)) {
      point.y = null;
    }
    if (isNaN(x)) {
      point.x = null;
    }
    dataset.push(point);
  }
  return dataset;
}

interface tPath {
  fx: Function;
  fy: Function;
  xScale: XScale;
  yScale: YScale;
  samples: number;
  domain: [number, number];
}

function ParametricPath({ fx, fy, xScale, yScale, samples, domain }: tPath) {
  const dataset = parametric(fx, fy, domain, samples);
  const lineGenerator = line()
    .y((d: any) => yScale(d.y))
    .defined((d: any) => d.y !== null)
    .x((d: any) => xScale(d.x))
    .defined((d: any) => d.x !== null)(dataset as any) as string;
  return (
    <g clipPath="url(#parametric)">
      <path
        d={lineGenerator}
        stroke={"red"}
        shapeRendering={"geometricPrecision"}
        fill={"none"}
      />
    </g>
  );
}
export default function PlotParametric({
  functions,
  ticks = 10,
  domain = [-10, 10],
  width = 500,
  height = 500,
  cwidth = 100,
  cheight = height / width,
  margin = 30,
  margins = [margin, margin, margin, margin],
  uid = nanoid(7),
}: ParametricPlotProps & { uid?: string }) {
  const FUNCS: ([Function, Function])[] = [];
  for (let i = 0; i < functions.length; i++) {
    const F = functions[i];
    let fn = makeFunction(F.x_of_t, ["t"]);
    if (typeof fn === "string") return <>{fn}</>;
    const Fx = fn;
    fn = makeFunction(F.y_of_t, ["t"]);
    if (typeof fn === "string") return <>{fn}</>;
    const Fy = fn;
    FUNCS.push([Fx, Fy]);
  }
  const [svg_width, svg_height] = svgDimensions(width, height, margins);
  const xScale = Scale.linear.x(domain, svg_width);
  const yScale = Scale.linear.y(domain, svg_height);
  return (
    <SVG
      width={width}
      height={height}
      cwidth={cwidth}
      cheight={cheight}
      margins={margins}
    >
      <g style={{ transformOrigin: "center" }}>
        <Clip id={`parametric`} width={svg_width} height={svg_height} />
        <Plane ticks={ticks} xScale={xScale} yScale={yScale} />
        {FUNCS.map((f, i) => (
          <ParametricPath
            key={uid + i}
            fx={f[0]}
            fy={f[1]}
            xScale={xScale}
            yScale={yScale}
            samples={800}
            domain={domain}
          />
        ))}
      </g>
    </SVG>
  );
}

export type Parametric_Function_Payload = {
  x_of_t: string;
  y_of_t: string;
};

export type ParametricPlotProps = {
  functions: Parametric_Function_Payload[];
  ticks?: number;
  domain?: Pair<number>;
  width?: number;
  height?: number;
  cwidth?: number;
  cheight?: number;
  margin?: number;
  margins?: Quad<number>;
};

export type SerializedParametricPlotNode = Spread<
  ParametricPlotProps & {
    key?: NodeKey;
    type: typeof PARAMETRIC_TYPE;
    version: 1;
  },
  SerializedLexicalNode
>;

import { PARAMETRIC_TYPE } from "./parametric.node";import {Point} from "../Plot2d/plot2d.chip";

