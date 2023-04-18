import { scaleLinear } from "@visx/scale";
import { CSSProperties, Fragment, ReactNode, useState } from "react";
import { Axis, AxisScale } from "@visx/axis";

interface Plot2Axis {
  ticks: number;
  direction: "x" | "y";
  scale: AxisScale;
  pad?: number;
}
export function PlotAxis({ direction, ticks, scale, pad = 0 }: Plot2Axis) {
  return (
    <Axis
      hideZero={direction === "y"}
      rangePadding={pad}
      scale={scale}
      numTicks={ticks}
      tickStroke="black"
      tickLength={4}
      tickTransform={direction === "y" ? `translate(-2,0)` : `translate(0,-2)`}
      orientation={direction === "x" ? "bottom" : "right"}
      tickLabelProps={() => ({
        fill: "black",
        textAnchor: direction === "x" ? "middle" : "start",
        verticalAnchor: direction === "x" ? "end" : "start",
        fontFamily: "CMU Serif",
        fontSize: "0.7rem",
        dx: direction === "y" ? 2 : 3,
      })}
    />
  );
}

export const Scale = {
  linear: {
    x(domain: [number, number], svgWidth: number) {
      return scaleLinear({ domain, range: [0, svgWidth] });
    },
    y(range: [number, number], svgHeight: number) {
      return scaleLinear({ domain: range, range: [svgHeight, 0] });
    },
  },
};

export type XScale = ReturnType<typeof Scale["linear"]["x"]>;

export type YScale = ReturnType<typeof Scale["linear"]["x"]>;

interface ClipProps {
  id: string;
  width: number;
  height: number;
}
export function Clip({ id, width, height }: ClipProps) {
  return (
    <defs>
      <clipPath id={id}>
        <rect width={width} height={height} />
      </clipPath>
    </defs>
  );
}
export function svgDimensions(
  width: number,
  height: number,
  margins: [number, number, number, number],
) {
  const [marginTop, marginRight, marginBottom, marginLeft] = margins;
  const svgWidth = width - marginLeft - marginRight;
  const svgHeight = height - marginTop - marginBottom;
  return [svgWidth, svgHeight];
}

export type SVGProps = {
  width?: number;
  height?: number;
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  children?: ReactNode;
};

export function SVG({
  width = 500,
  height = 500,
  top = 5,
  left = 10,
  right = 0,
  bottom = 0,
  children,
}: SVGProps) {
  const VB = `0 0 ${width} ${height}`;
  const figstyle: CSSProperties = {
    display: "block",
    position: "relative",
    width: `100%`,
    paddingBottom: `${100 * (height / width)}%`,
    overflow: "hidden",
  };
  const svgCSS: CSSProperties = {
    display: "inline-block",
    position: "absolute",
    top: `${top}%`,
    left: `${left}%`,
    right: `${right}%`,
    bottom: `${bottom}%`,
  };
  const par = "xMidYMid meet";
  return (
    <div style={figstyle}>
      <svg viewBox={VB} preserveAspectRatio={par} style={svgCSS}>
        {children}
      </svg>
    </div>
  );
}

export type Children = { children?: ReactNode };
export type Quad<t> = [t, t, t, t];
import { createContext, useContext, useMemo } from "react";
import { createFunction } from "@webtex/algom";
import { area, line } from "d3-shape";

export type RiemannMethod = "left" | "midpoint" | "right";

export type IntegralData = {
  bounds: [number, number];
  color: string;
};

export type BasePlotFn = {
  fn: string;
  id: string;
  color: string;
  samples: number;
  domain: [number, number];
  range: [number, number];
};

export type PlotFn = {
  riemann?: RiemannDatum;
  integrate?: IntegralData;
} & BasePlotFn;

export type RiemannDatum = {
  domain: [number, number];
  dx: number;
  method: RiemannMethod;
  color: string;
};

export interface IPlot2d {
  functions?: PlotFn[];
  samples?: number;
  domain?: [number, number];
  range?: [number, number];
  width?: number;
  height?: number;
  ticks?: number;
  margins?: Quad<number>;
}

export const defaults: PlotFn[] = [
  {
    fn: "f(x) = x^3",
    id: "tan",
    color: "red",
    samples: 170,
    domain: [-10, 10],
    range: [-10, 10],
    integrate: {
      bounds: [-3, 2],
      color: "gold",
    },
  },
];

export const DEFAULT_SVG_WIDTH = 500;
export const DEFAULT_SVG_HEIGHT = 500;
export const DEFAULT_SVG_MARGINS: Quad<number> = [30, 30, 30, 30];

export function Plot2D({
  functions = defaults,
  domain = [-10, 10],
  range = [-10, 10],
  ticks = 10,
  width = DEFAULT_SVG_WIDTH,
  height = DEFAULT_SVG_HEIGHT,
  margins = DEFAULT_SVG_MARGINS,
  samples = 170,
}: IPlot2d) {
  const [svgWidth, svgHeight] = svgDimensions(width, height, margins);
  return (
    <SVG width={width} height={height}>
      <Clip id={"plot2d"} width={svgWidth} height={svgHeight} />
      <ScaleProvider
        range={range}
        domain={domain}
        width={svgWidth}
        height={svgHeight}
      >
        <YAxis ticks={ticks} />
        <XAxis ticks={ticks} />
        <g clipPath={`url(#plot2d)`}>
          {functions.map((fn) => (
            <FunctionProvider key={fn.fn + fn.id} fn={fn.fn}>
              <ColorGroup color={fn.color}>
                <ComputedPath
                  samples={fn.samples || samples}
                  range={fn.range}
                  domain={fn.domain}
                />
              </ColorGroup>
              {fn.riemann && (
                !isNaN(fn.riemann.domain[0]) &&
                !isNaN(fn.riemann.domain[1])
              ) && (
                <ColorGroup color={fn.riemann.color}>
                  <RiemannPlot {...fn.riemann} />
                </ColorGroup>
              )}
              {fn.integrate && (
                !isNaN(fn.integrate.bounds[0]) &&
                !isNaN(fn.integrate.bounds[1])
              ) && (
                <ColorGroup fill={fn.integrate.color}>
                  <Integral
                    samples={fn.samples}
                    bounds={fn.integrate.bounds}
                    max={fn.domain[1]}
                  />
                </ColorGroup>
              )}
            </FunctionProvider>
          ))}
        </g>
      </ScaleProvider>
    </SVG>
  );
}

type pIntegral = {
  bounds: [number, number];
  samples: number;
  max: number;
};
type AreaData = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
};
function Integral({
  bounds,
  samples,
  max,
}: pIntegral) {
  const [lowerBound, upperBound] = bounds;
  const { fx } = useFunc2D();
  const { scaleX, scaleY } = useScale();
  const S = Math.abs(samples);
  const dataset: AreaData[] = [];
  const AREA = useMemo(() => {
    for (let i = -S; i < S; i++) {
      const n = (i / S) * max;
      const x0 = n;
      const x1 = n;
      const y0 = fx(x0);
      const y1 = 0;
      if (lowerBound < n && n < upperBound) {
        dataset.push({ x0, x1, y0, y1 });
      }
    }
    return area()
      .defined((d: any) => !isNaN(d.y0) && !isNaN(d.y1))
      .x0((d: any) => scaleX(d.x0))
      .y0((d: any) => scaleY(d.y0))
      .x1((d: any) => scaleX(d.x1))
      .y1((d: any) => scaleY(d.y1))(dataset as any) ?? "";
  }, [fx, lowerBound, upperBound]);

  return (
    <path
      d={AREA}
      opacity={0.4}
      strokeWidth={1}
    />
  );
}

function ColorGroup(
  { color = "", fill = "", children }:
    & { color?: string; fill?: string }
    & Children,
) {
  return (
    <g stroke={color} fill={fill}>
      {children}
    </g>
  );
}

interface FunctionCtx {
  fx: Function;
}

const FunCtx = createContext({} as FunctionCtx);

type pFunctionContext = {
  fn: string;
} & Children;
const FunctionProvider = ({ fn, children }: pFunctionContext) => {
  const fx = createFunction(fn);
  if (typeof fx === "string") return null;
  return (
    <FunCtx.Provider value={{ fx }}>
      {children}
    </FunCtx.Provider>
  );
};

const useFunc2D = () => useContext(FunCtx);

interface ScaleCtx {
  scaleX: XScale;
  scaleY: YScale;
  domain: [number, number];
  range: [number, number];
}

function YAxis({ ticks }: { ticks: number }) {
  const { scaleY, scaleX } = useScale();
  return (
    <g transform={`translate(${scaleX(0)}, 0)`}>
      <PlotAxis scale={scaleY} ticks={ticks} direction={"y"} />
    </g>
  );
}

function XAxis({ ticks }: { ticks: number }) {
  const { scaleY, scaleX } = useScale();
  return (
    <g transform={`translate(0, ${scaleY(0)})`}>
      <PlotAxis scale={scaleX} ticks={ticks} direction={"x"} />
    </g>
  );
}

const ScaleContext = createContext<ScaleCtx>({} as ScaleCtx);

type ScalePtx = {
  width: number;
  height: number;
  domain: [number, number];
  range: [number, number];
};

function ScaleProvider({
  width,
  height,
  domain,
  range,
  children,
}: ScalePtx & Children) {
  const api = {
    scaleX: Scale.linear.x(domain, width),
    scaleY: Scale.linear.y(range, height),
    domain,
    range,
  };
  return (
    <ScaleContext.Provider value={api}>
      {children}
    </ScaleContext.Provider>
  );
}

const useScale = () => useContext(ScaleContext);

type RectCoords = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  xTranslate: number;
};

function RiemannPlot({
  domain,
  dx,
  method,
}: RiemannDatum) {
  const { fx } = useFunc2D();
  const start = domain[0];
  const end = domain[1];
  if (start > end) return null;
  const { scaleX, scaleY } = useScale();
  const rx = (method === "left")
    ? (x: number) => x / 2
    : (method === "right")
    ? (x: number) => -x / 2
    : (x: number) => x;
  const rectData = getRects(
    domain,
    scaleX,
    scaleY,
    fx,
    dx,
    rx,
  );
  return (
    <>
      {rectData.map((rect, i) => (
        <g
          key={i + rect.x1 + rect.y2}
          transform={`translate(${rect.xTranslate}, 0)`}
        >
          <line
            strokeWidth={rect.width}
            x1={rect.x1}
            y1={rect.y1}
            x2={rect.x2}
            y2={rect.y2}
            strokeOpacity={0.1}
          />
          <line
            strokeWidth={rect.width - 1}
            x1={rect.x1}
            y1={rect.y1}
            x2={rect.x2}
            y2={rect.y2}
            strokeOpacity={0.4}
          />
        </g>
      ))}
    </>
  );
}

function getRects(
  domain: [number, number],
  scaleX: XScale,
  scaleY: YScale,
  f: Function,
  dx: number,
  rx: (x: number) => number,
) {
  const start = domain[0];
  const end = domain[1];
  const rects: RectCoords[] = [];
  if (start > end) return rects;
  for (let i = start; i < end; i += dx) {
    const x = i;
    const x1 = scaleX(x);
    const x2 = scaleX(x);
    const y1 = scaleY(f(x));
    const y2 = scaleY(0);
    rects.push({ x1, x2, y1, y2, width: 0, xTranslate: 0 });
  }
  let i = 0;
  if (!rects.length) return rects;
  let current: null | RectCoords = null;
  do {
    if (current === null) {
      current = rects[0];
    } else {
      current = rects[i];
      const prev = rects[i - 1];
      const next = rects[i + 1] || rects[i];
      const w = current.x1 - prev.x1;
      prev.width = w;
      next.width = w;
      prev.xTranslate = rx(w);
      next.xTranslate = rx(w);
    }
    i++;
  } while (i < rects.length);
  return rects;
}

type pComputedPath = {
  range: [number, number];
  domain: [number, number];
  samples: number;
};
function ComputedPath({ range, domain, samples }: pComputedPath) {
  const { scaleX, scaleY } = useScale();
  const { fx } = useFunc2D();

  const datapoints = useMemo(() => {
    const dataset: Points = [];
    const yMin = range[0] * 2;
    const yMax = range[1] * 2;
    const xMin = domain[0];
    const xMax = domain[1];
    const S = Math.floor(Math.abs(samples));
    for (let i = -S; i < S; i++) {
      let x = (i / samples) * xMax;
      let y = fx(x);
      const point: Point = [x, y];
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
  }, [domain, range, samples]);

  return (
    <path
      d={datapoints}
      shapeRendering={"geometricPrecision"}
      fill={"none"}
    />
  );
}

type Point = [number, number];

type Points = Point[];

type BasePlotUpdate = (d: Partial<BasePlotFn>) => void;

type RiemannUpdate = (d: Partial<RiemannDatum>) => void;
const defaultPayload: PlotFn = {
  fn: "",
  id: "demo",
  domain: [-10, 10],
  range: [-10, 10],
  samples: 170,
  color: "#ff0000",
  riemann: {
    domain: [NaN, NaN],
    dx: 0.5,
    method: "left",
    color: "#ff0000",
  },
  integrate: {
    bounds: [NaN, NaN],
    color: "#ff0000",
  },
};
