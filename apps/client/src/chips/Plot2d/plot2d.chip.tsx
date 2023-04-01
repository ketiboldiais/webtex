import {
  createCommand,
  LexicalCommand,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import { nanoid } from "@reduxjs/toolkit";
import { algom } from "src/algom";
import {
  Clip,
  FunctionPlotProps,
  Plane,
  Plot1Payload,
  Scale,
  SVG,
  svgDimensions,
  XScale,
  YScale,
} from "../PlotUtils";
import { line } from "d3-shape";
import { Pair } from "../../App";

interface Plot1Props extends FunctionPlotProps {
  fs?: Plot1Payload[];
  uid?: string;
  ref?: { current: null | HTMLDivElement };
}

interface XYPathProps {
  f: Function;
  samples: number;
  domain: [number, number];
  range: [number, number];
  xScale: XScale;
  yScale: YScale;
}
function XYPath({ f, samples, domain, range, xScale, yScale }: XYPathProps) {
  let dataset = algom.getData.y(f, range, domain, samples);
  const lineGenerator = line()
    .y((d: any) => yScale(d.y))
    .defined((d: any) => d.y !== null)
    .x((d: any) => xScale(d.x))(dataset as any) as string;
  return (
    <g clipPath="url(#plot)">
      <path
        d={lineGenerator}
        stroke={"red"}
        shapeRendering={"geometricPrecision"}
        fill={"none"}
      />
    </g>
  );
}
export default function Plot1({
  fs,
  ticks = 10,
  domain = [-10, 10],
  range = [-10, 10],
  width = 500,
  height = 500,
  cwidth = 100,
  cheight = height / width,
  margin = 30,
  margins = [margin, margin, margin, margin],
  uid = nanoid(7),
}: Plot1Props) {
  const fx: Function[] = [];
  if (fs) {
    const L = fs.length;
    for (let i = 0; i < L; i++) {
      const fstring = fs[i];
      const fn = algom.makeFunction(fstring.expression, [fstring.variable]);
      if (typeof fn !== "string") fx.push(fn);
    }
  }
  const [svg_width, svg_height] = svgDimensions(width, height, margins);
  const xScale = Scale.linear.x(domain, svg_width);
  const yScale = Scale.linear.y(range, svg_height);

  return (
    <SVG
      width={width}
      height={height}
      cwidth={cwidth}
      cheight={cheight}
      margins={margins}
    >
      <g style={{ transformOrigin: "center" }}>
        <Clip id={`plot`} width={svg_width} height={svg_height} />
        <Plane ticks={ticks} yScale={yScale} xScale={xScale} />
        {fx.map((f, i) => (
          <XYPath
            f={f}
            key={`${uid}fpath${i}`}
            samples={500}
            domain={domain}
            range={range}
            xScale={xScale}
            yScale={yScale}
          />
        ))}
      </g>
    </SVG>
  );
}
export type FuncExprPayload = {
  variable: string;
  expression: string;
};
export type SerializedPlotNode = Spread<{
  functions: FuncExprPayload[];
  ticks?: number;
  domain?: [number, number];
  range?: [number, number];
  width?: number;
  height?: number;
  cwidth?: number;
  cheight?: number;
  margins?: [number, number, number, number];
  key?: NodeKey;
  type: "plot";
  version: 1;
}, SerializedLexicalNode>;

export interface PlotNodePayload {
  functions: FuncExprPayload[];
  ticks?: number;
  domain?: [number, number];
  range?: [number, number];
  width?: number;
  height?: number;
  cwidth?: number;
  cheight?: number;
  margins?: [number, number, number, number];
}

export interface PlotPayload {
  functions: FuncExprPayload[];
  ticks: number;
  domain: Pair<number>;
  range: Pair<number>;
  width?: number;
  height?: number;
  cwidth?: number;
  cheight?: number;
  margins?: [number, number, number, number];
}
