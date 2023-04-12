import { NodeKey, SerializedLexicalNode, Spread } from "lexical";
import { nanoid } from "@reduxjs/toolkit";
import {
  Clip,
  Figure,
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
import { createFunction } from "@webtex/algom";

import {
  createContext,
  Fragment,
  SetStateAction,
  useContext,
  useMemo,
  useReducer,
  useState,
} from "react";
import CONTROL from "../controller.chip";
import css from "../../ui/styles/plot.module.scss";

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

export type Point = { x: number | null; y: number | null };

type SecantSpec = {
  startX: number;
  endX: number;
  renderPoints: boolean;
  renderFormula: boolean;
};

export type UserFunc = {
  f: string;
  samples?: number;
  domain?: [number, number];
  range?: [number, number];
  integrate?: [number, number];
  riemann?: RiemannSpec;
  secant?: SecantSpec;
};

interface Plot1Props extends FunctionPlotProps {
  fs?: Plot1Payload[];
  functions?: UserFunc[];
  uid?: string;
  samples?: number;
}

const defaultFuncs: UserFunc[] = [
  { f: "f(x) = sqrt(x)" },
];

interface Plot1Context {
  ticks: number;
  samples: number;
  domain: [number, number];
  range: [number, number];
  xScale: XScale;
  yScale: YScale;
  uid: string;
  setTicks: React.Dispatch<SetStateAction<number>>;
  setDomain: React.Dispatch<SetStateAction<[number, number]>>;
  setRange: React.Dispatch<SetStateAction<[number, number]>>;
}

const Plot1Ctx = createContext<Plot1Context>({} as Plot1Context);
export default function Plot1({
  fs = [],
  functions = defaultFuncs,
  ticks = 10,
  domain = [-10, 10],
  range = [-10, 10],
  width = 500,
  height = 500,
  margin = 30,
  margins = [margin, margin, margin, margin],
  samples = 50,
  uid = nanoid(7),
}: Plot1Props) {
  const [svg_width, svg_height] = svgDimensions(width, height, margins);
  const [userFunctions, setUserFunctions] = useState(functions);

  const [Domain, setDomain] = useState(domain);
  const [Range, setRange] = useState(range);
  const [Ticks, setTicks] = useState(ticks);

  const xScale = Scale.linear.x(Domain, svg_width);
  const yScale = Scale.linear.y(Range, svg_height);

  const api = useMemo(() => ({
    ticks: Ticks,
    domain: Domain,
    samples,
    range: Range,
    xScale,
    yScale,
    uid,
    setTicks,
    setDomain,
    setRange,
  }), []);

  return (
    <Plot1Ctx.Provider value={api}>
      <Toolbar />
      <SVG width={width} height={height} margins={margins}>
        <g style={{ transformOrigin: "center" }}>
          <Clip
            id={`plot${uid}`}
            width={svg_width}
            height={svg_height}
          />
          <CartesianPlane />
          {userFunctions.map((userFn, i) => (
            <FPath
              key={uid + "f" + i}
              f={userFn.f}
              samples={userFn.samples || samples}
              domain={userFn.domain || Domain}
              range={userFn.range || Range}
            />
          ))}
        </g>
      </SVG>
    </Plot1Ctx.Provider>
  );
}

type pIntegral = {};
function Integral() {}

const usePlot1 = () => useContext(Plot1Ctx);

const Toolbar = () => {
  const {
    ticks,
    domain,
    range,
    setTicks,
    setDomain,
    setRange,
  } = usePlot1();

  return (
    <CONTROL
      tickers={[
        { value: ticks, handler: setTicks, label: "Ticks" },
      ]}
      name={css.control}
      intervals={[
        { value: domain, handler: setDomain, label: "Domain" },
        { value: range, handler: setRange, label: "Range" },
      ]}
    >
    </CONTROL>
  );
};

type PCtx = {
  f: string;
  domain: [number, number];
  range: [number, number];
  samples: number;
};

function FPath({
  f,
  domain,
  range,
  samples,
}: PCtx) {
  const { uid, yScale, xScale } = usePlot1();

  const dataset = useMemo(() => {
    let dataset: Point[] = [];
    const fn = createFunction(f);
    if (typeof fn === "string") return dataset;
    let x: number;
    let y: number;
    const yMin = range[0] * 2;
    const yMax = range[1] * 2;
    const xMax = domain[1];
    for (let i = -samples; i < samples; i++) {
      x = (i / samples) * xMax;
      y = fn(x);
      const point: Point = { x, y };
      if (Number.isNaN(y) || y <= yMin || y >= yMax) {
        point.y = null;
      }
      if (x < domain[0] || domain[1] < x) {
        continue;
      } else {
        dataset.push(point);
      }
    }
    return dataset;
  }, [domain, range, f]);

  const pathdata = useMemo(() => {
    return line()
      .y((d: any) => yScale(d.y))
      .defined((d: any) => d.y !== null)
      .x((d: any) => xScale(d.x))(dataset as any) as string;
  }, [domain, range, f]);

  return (
    <g clipPath={`url(#plot${uid})`}>
      <path
        fill={"none"}
        key={"path" + uid}
        stroke={"red"}
        strokeWidth={"2px"}
        d={pathdata}
      />
    </g>
  );
}

function CartesianPlane() {
  const { ticks, yScale, xScale } = usePlot1();
  return (
    <Plane
      ticks={ticks}
      yScale={yScale}
      xScale={xScale}
    />
  );
}

type RiemannSpec = {
  orient: "left" | "middle" | "right";
  precision: number;
  domain: [number, number];
  on: string;
};

function RiemannPlot({
  orient,
  precision,
  domain,
  on,
}: RiemannSpec) {
  const output = [];
}
