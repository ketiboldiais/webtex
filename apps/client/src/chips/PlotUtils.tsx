import { scaleLinear } from "@visx/scale";
import { ReactNode } from "react";
import { Axis, AxisScale } from "@visx/axis";

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

export interface FunctionPlotProps {
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

interface AxisProps {
  ticks: number;
  yScale: YScale;
  xScale: XScale;
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

export type Plot1Payload = {
  variable: string;
  expression: string;
};

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

interface PlaneProps {
  ticks: number;
  xScale: XScale;
  yScale: YScale;
}
export function Plane({ ticks, yScale, xScale }: PlaneProps) {
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
export function SVG({
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
