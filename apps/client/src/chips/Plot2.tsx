import { scaleLinear } from "@visx/scale";
import { line, lineRadial } from "d3-shape";
import { ReactNode } from "react";
import { algom } from "../algom/index.js";
import { Axis, AxisScale } from "@visx/axis";
import { nanoid } from "@reduxjs/toolkit";

const Scale = {
  linear: {
    x(domain: [number, number], svgWidth: number) {
      return scaleLinear({ domain, range: [0, svgWidth] });
    },
    y(range: [number, number], svgHeight: number) {
      return scaleLinear({ domain: range, range: [svgHeight, 0] });
    },
  },
};
type XScale = ReturnType<typeof Scale["linear"]["x"]>;
type YScale = ReturnType<typeof Scale["linear"]["x"]>;
interface PolarPlotProps {
  f: Function | string;
  domain?: [number, number];
  width?: number;
  height?: number;
  radius?: number;
  scale?: number;
  cwidth?: number;
  cheight?: number;
  margin?: number;
  margins?: [number, number, number, number];
}

export function PolarPlot({
  f,
  domain = [0, 2 * Math.PI],
  width = 500,
  height = 500,
  radius = Math.min(width, height) / 2 - 40,
  scale = 100,
  cwidth = scale,
  cheight = height / width,
  margin = 20,
  margins = [margin, margin, margin, margin],
}: PolarPlotProps) {
  let Fx: Function;
  const id = nanoid(8);
  if (typeof f === "string") {
    const fn = algom.compfn(f, "f", "(x)");
    if (typeof fn === "string") return <>{fn}</>;
    Fx = fn;
  } else Fx = f;
  const data = algom.getData.polar(Fx, domain);
  const [svgWidth, svgHeight] = svgDimensions(width, height, margins);
  const rScale = scaleLinear().domain([0, 0.5]).range([0, radius]);
  function r(d: any) {
    return rScale(d) as any;
  }
  const gr = rScale.ticks(5).slice(1);
  let ga: number[] = [];
  for (let i = 0; i < 360; i += 30) {
    ga.push(i);
  }
  const line = lineRadial().radius((d) => rScale(d[1]) as any).angle((d) =>
    -d[0] + Math.PI / 2
  )(data);
  return (
    <SVG
      width={width}
      height={height}
      cwidth={cwidth}
      cheight={cheight}
      margins={margins}
    >
      <g transform={`translate(${svgWidth / 2},${svgHeight / 2})`}>
        <g>
          {gr.map((d, i) => (
            <g key={`${id}r_tick${i}`}>
              <circle
                r={r(d)}
                stroke={"lightgrey"}
                fill={"none"}
              />
              <text
                y={-r(d) - 4}
                transform={"rotate(15)"}
                textAnchor="middle"
                fontSize={"0.7rem"}
              >
                {d}
              </text>
            </g>
          ))}
        </g>
        <g>
          {ga.map((d, i) => (
            <g key={`ga${id}${id}axisPoint${i}`} transform={`rotate(-${d})`}>
              <line x2={radius} stroke={"lightgrey"} strokeDasharray={4} />
              <text
                x={radius + 6}
                dy={"0.35em"}
                textAnchor={d < 270 && d > 90 ? "end" : undefined}
                fontSize={"0.7rem"}
                transform={d < 270 && d > 90
                  ? `rotate(180,, ${radius + 6}, 0)`
                  : undefined}
              >
                {`${d}°`}
              </text>
            </g>
          ))}
        </g>
        <g>
          <path fill={"none"} stroke={"red"} d={line as any} />
        </g>
      </g>
    </SVG>
  );
}

interface FunctionPlotProps {
  id?: string;
  ticks?: number;
  scale?: number;
  domain?: [number, number];
  range?: [number, number];
  width?: number;
  height?: number;
  cwidth?: number;
  cheight?: number;
  margin?: number;
  margins?: [number, number, number, number];
  children?: ReactNode;
}

interface ParametricPlotProps extends FunctionPlotProps {
  fx: Function | string;
  fy: Function | string;
}

interface ParametricPathProps {
  fx: Function;
  fy: Function;
  xScale: XScale;
  yScale: YScale;
  samples: number;
  domain: [number, number];
}

function ParametricPath(
  { fx, fy, xScale, yScale, samples, domain }: ParametricPathProps,
) {
  const dataset = algom.getData.parametric(fx, fy, domain, samples);
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

interface AxisProps {
  ticks: number;
  yScale: YScale;
  xScale: XScale;
}

function svgDimensions(
  width: number,
  height: number,
  margins: [number, number, number, number],
) {
  const [marginTop, marginRight, marginBottom, marginLeft] = margins;
  const svgWidth = width - marginLeft - marginRight;
  const svgHeight = height - marginTop - marginBottom;
  return [svgWidth, svgHeight];
}

function XAxis({ ticks, yScale, xScale }: AxisProps) {
  return (
    <g transform={`translate(0, ${yScale(0)})`}>
      <PlotAxis ticks={ticks} direction={"x"} scale={xScale} />
    </g>
  );
}

function YAxis({ ticks, yScale, xScale }: AxisProps) {
  return (
    <g transform={`translate(${xScale(0)}, 0)`}>
      <PlotAxis ticks={ticks} direction={"y"} scale={yScale} />
    </g>
  );
}

export function PlotParametric({
  fx,
  fy,
  ticks = 10,
  domain = [-10, 10],
  range = [-10, 10],
  width = 500,
  height = 500,
  cwidth = 100,
  cheight = height / width,
  margin = 30,
  margins = [margin, margin, margin, margin],
}: ParametricPlotProps) {
  if (typeof fy === "string") {
    const fn = algom.compfn(fy, "x", "(t)");
    if (typeof fn === "string") return <>{fn}</>;
    fy = fn;
  }
  if (typeof fx === "string") {
    const fn = algom.compfn(fx, "y", "(t)");
    if (typeof fn === "string") return <>{fn}</>;
    fx = fn;
  }
  const Fx: Function = fx;
  const Fy: Function = fy;
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
        <Clip id={`parametric`} width={svg_width} height={svg_height} />
        <Plane ticks={ticks} xScale={xScale} yScale={yScale} />
        <ParametricPath
          fx={Fx}
          fy={Fy}
          xScale={xScale}
          yScale={yScale}
          samples={800}
          domain={domain}
        />
      </g>
    </SVG>
  );
}

export type Plot1Payload = {
  variable: string;
  expression: string;
};

interface Plot1Props extends FunctionPlotProps {
  fs?: Plot1Payload[];
  uid?: string;
  ref?: { current: null | HTMLDivElement };
}

export function Plot1({
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

interface Plot2Axis {
  ticks: number;
  direction: "x" | "y";
  scale: AxisScale;
  pad?: number;
}
function PlotAxis({ direction, ticks, scale, pad = 0 }: Plot2Axis) {
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

interface ClipProps {
  id: string;
  width: number;
  height: number;
}
function Clip({ id, width, height }: ClipProps) {
  return (
    <defs>
      <clipPath id={id}>
        <rect width={width} height={height} />
      </clipPath>
    </defs>
  );
}

interface PlaneProps {
  ticks: number;
  xScale: XScale;
  yScale: YScale;
}
function Plane({ ticks, yScale, xScale }: PlaneProps) {
  return (
    <>
      <XAxis ticks={ticks} yScale={yScale} xScale={xScale} />
      <YAxis ticks={ticks} yScale={yScale} xScale={xScale} />
    </>
  );
}

interface SVGProps {
  width: number;
  height: number;
  cwidth: number;
  cheight: number;
  margins: [number, number, number, number];
  children: ReactNode;
  ref?: { current: null | HTMLDivElement };
}
function SVG({
  width,
  height,
  cwidth = 100,
  cheight = height / width,
  margins,
  children,
  ref,
}: SVGProps) {
  const [top, right, bottom, left] = margins;
  const svgWidth = width - left - right;
  const svgHeight = height - top - bottom;
  const viewBoxWidth = svgWidth + left + right;
  const viewBoxHeight = svgHeight + top + bottom;
  const viewboxValue = `0 0 ${viewBoxWidth} ${viewBoxHeight}`;
  return (
    <div
      ref={ref}
      style={{
        display: "block",
        position: "relative",
        width: `${cwidth}%`,
        paddingBottom: `${cwidth * cheight}%`,
        overflow: "hidden",
      }}
    >
      <svg
        viewBox={viewboxValue}
        preserveAspectRatio={"xMinYMin meet"}
        style={{
          display: "block",
          position: "absolute",
          top: "10%",
          left: "10%",
        }}
      >
        {children}
      </svg>
    </div>
  );
}
