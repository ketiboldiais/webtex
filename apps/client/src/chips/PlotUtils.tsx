import { scaleLinear } from "@visx/scale";
import { ReactNode, useRef, useState } from "react";
import { Axis, AxisScale } from "@visx/axis";
import { HTML_DIV_REF, Quad } from "src/App";

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

export function XAxis({ ticks, yScale, xScale }: AxisProps) {
  return (
    <g transform={`translate(0, ${yScale(0)})`}>
      <PlotAxis ticks={ticks} direction={"x"} scale={xScale} />
    </g>
  );
}

export function YAxis({ ticks, yScale, xScale }: AxisProps) {
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
  cwidth?: number;
  cheight?: number;
  margins: [number, number, number, number];
  children: ReactNode;
}
export function SVG({
  width,
  height,
  cwidth = 100,
  cheight = height / width,
  margins,
  children,
}: SVGProps) {
  const [top, right, bottom, left] = margins;
  const svgWidth = width - left - right;
  const svgHeight = height - top - bottom;
  const viewBoxWidth = svgWidth + left + right;
  const viewBoxHeight = svgHeight + top + bottom;
  const viewboxValue = `0 0 ${viewBoxWidth} ${viewBoxHeight}`;
  return (
    <Figure
      width={svgWidth}
      height={svgHeight}
      minWidth={100}
      minHeight={100}
      maxWidth={800}
      maxHeight={800}
    >
      <div
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
    </Figure>
  );
}

type divref = null | HTMLDivElement;
interface FigAPI {
  children: ReactNode;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth: number;
  maxHeight: number;
}
export function Figure({
  children,
  width,
  height,
  minWidth = width,
  minHeight = height,
  maxWidth,
  maxHeight,
}: FigAPI) {
  const container = useRef<divref>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  const onResizeStart = () => {
    setIsResizing(true);
  };

  const onResizeEnd = () => {
    setTimeout(() => {
      setIsResizing(false);
      setIsSelected(false);
    }, 200);
  };

  return (
    <>
      <div className={core.resizer}>
        <div
          ref={container}
          className={isSelected ? core.resizeFocus : ""}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            overflow: "hidden",
          }}
          onClick={() => setIsSelected(!isSelected)}
        >
          {children}
        </div>
        {(isSelected || isResizing) && (
          <Resizer
            targetRef={container}
            onResizeStart={onResizeStart}
            onResizeEnd={onResizeEnd}
            minWidth={minWidth}
            minHeight={minHeight}
            maxWidth={maxWidth}
            maxHeight={maxHeight}
          />
        )}
      </div>
    </>
  );
}

interface ResizerAPI {
  targetRef: { current: null | HTMLElement };
  maxWidth: number;
  maxHeight: number;
  minWidth: number;
  minHeight: number;
  onResizeStart: () => void;
  onResizeEnd: () => void;
}

enum D {
  east = 1 << 0,
  north = 1 << 3,
  south = 1 << 1,
  west = 1 << 2,
}

type Pos = {
  currentHeight: number;
  currentWidth: number;
  direction: number;
  isResizing: boolean;
  ratio: number;
  startHeight: number;
  startWidth: number;
  startX: number;
  startY: number;
};

type Ptr = React.PointerEvent<HTMLDivElement>;
function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
import core from "../ui/styles/App.module.scss";

function Resizer({
  targetRef,
  maxWidth = 800,
  maxHeight = 800,
  minWidth = 200,
  minHeight = 200,
  onResizeStart,
  onResizeEnd,
}: ResizerAPI) {
  const ctrlWrapper = useRef<HTML_DIV_REF>(null);
  const userSelect = useRef({
    priority: "",
    value: "default",
  });

  const positioningRef = useRef<Pos>({
    currentHeight: 0,
    currentWidth: 0,
    direction: 0,
    isResizing: false,
    ratio: 0,
    startHeight: 0,
    startWidth: 0,
    startX: 0,
    startY: 0,
  });

  const setStartCursor = (direction: number) => {
    const elem = targetRef.current;
    const cursorDir = getCursorPos(direction);
    if (elem !== null) {
      elem
        .style
        .setProperty("cursor", `${cursorDir}-resize`, "important");
    }
    if (document.body !== null) {
      document
        .body
        .style
        .setProperty("cursor", `${cursorDir}-resize`, "important");
      userSelect.current.value = document
        .body
        .style
        .getPropertyValue("-webkit-user-select");
      userSelect.current.priority = document
        .body
        .style
        .getPropertyPriority("-webkit-user-select");
      document
        .body
        .style
        .setProperty("-webkit-user-select", `none`, "important");
    }
  };

  const setEndCursor = () => {
    const elem = targetRef.current;
    if (elem !== null) elem.style.setProperty("cursor", "default");
    if (document.body !== null) {
      document.body.style.setProperty("cursor", "default");
      document.body.style.setProperty(
        "-webkit-user-select",
        userSelect.current.value,
        userSelect.current.priority,
      );
    }
  };

  const startResize = (event: Ptr, direction: number) => {
    const target = targetRef.current;
    const controlWrapper = ctrlWrapper.current;
    if (target !== null && controlWrapper !== null) {
      const { width, height } = target.getBoundingClientRect();
      const positioning = positioningRef.current;
      positioning.startWidth = width;
      positioning.startHeight = height;
      positioning.ratio = width / height;
      positioning.currentWidth = width;
      positioning.currentHeight = height;
      positioning.startX = event.clientX;
      positioning.startY = event.clientY;
      positioning.isResizing = true;
      positioning.direction = direction;
      setStartCursor(direction);
      onResizeStart();
      target.style.height = `${height}px`;
      target.style.width = `${width}px`;
      document.addEventListener("pointermove", resize);
      document.addEventListener("pointerup", stopResize);
    }
  };

  const resize = (event: PointerEvent) => {
    const target = targetRef.current;
    const positioning = positioningRef.current;
    const isHorizontal = positioning.direction & (D.east | D.west);
    const isVertical = positioning.direction & (D.south | D.north);
    if (target === null || !positioning.isResizing) return;
    if (isHorizontal && isVertical) {
      let diff = Math.floor(positioning.startX - event.clientX);
      diff = positioning.direction & D.east ? -diff : diff;
      const width = clamp(
        positioning.startWidth + diff,
        minWidth,
        maxWidth,
      );
      const height = width / positioning.ratio;
      target.style.width = `${width}px`;
      target.style.height = `${height}px`;
      positioning.currentHeight = height;
      positioning.currentWidth = width;
      return;
    }
    if (isVertical) {
      let diff = Math.floor(positioning.startY - event.clientY);
      diff = positioning.direction & D.south ? -diff : diff;
      const height = clamp(
        positioning.startHeight + diff,
        minHeight,
        maxHeight,
      );
      target.style.height = `${height}px`;
      positioning.currentHeight = height;
      return;
    }
    let diff = Math.floor(positioning.startX - event.clientX);
    diff = positioning.direction & D.east ? -diff : diff;
    const width = clamp(
      positioning.startWidth + diff,
      minWidth,
      maxWidth,
    );
    target.style.width = `${width}px`;
    positioning.currentWidth = width;
  };
  const stopResize = () => {
    const target = targetRef.current;
    const positioning = positioningRef.current;
    const controlWrapper = ctrlWrapper.current;
    if (target !== null && controlWrapper !== null && positioning.isResizing) {
      positioning.startWidth = 0;
      positioning.startHeight = 0;
      positioning.ratio = 0;
      positioning.startX = 0;
      positioning.startY = 0;
      positioning.currentWidth = 0;
      positioning.currentHeight = 0;
      positioning.isResizing = false;
      setEndCursor();
      onResizeEnd();
      document.removeEventListener("pointermove", resize);
      document.removeEventListener("pointerup", stopResize);
    }
  };

  return (
    <div ref={ctrlWrapper}>
      <div
        onPointerDown={(e) => startResize(e, D.north)}
        className={core.n}
      />
      <div
        onPointerDown={(e) => startResize(e, D.north | D.east)}
        className={core.ne}
      />
      <div
        onPointerDown={(e) => startResize(e, D.east)}
        className={core.e}
      />
      <div
        onPointerDown={(e) => startResize(e, D.south | D.east)}
        className={core.se}
      />
      <div
        onPointerDown={(e) => startResize(e, D.south)}
        className={core.s}
      />
      <div
        onPointerDown={(e) => startResize(e, D.south | D.west)}
        className={core.sw}
      />
      <div
        onPointerDown={(e) => startResize(e, D.west)}
        className={core.w}
      />
      <div
        onPointerDown={(e) => startResize(e, D.north | D.west)}
        className={core.nw}
      />
    </div>
  );
}

function getCursorPos(dir: number) {
  const ew = dir === D.east || dir === D.west;
  const ns = dir === D.north || dir === D.south;
  const nw = dir & D.north && dir & D.west;
  const se = dir & D.south && dir & D.east;
  const nwse = nw || se;
  return ew ? "ew" : ns ? "ns" : nwse ? "nwse" : "nesw";
}

export const translate = (x: number, y: number) => `translate(${x}, ${y})`;
type FontUnit = "px" | "em" | "rem";
export const fontSize = (x: number, unit: FontUnit = "px") => `${x}${unit}`;

export const DEFAULT_SVG_WIDTH = 500;
export const DEFAULT_SVG_HEIGHT = 500;
export const DEFAULT_SVG_MARGINS: Quad<number> = [30, 30, 30, 30];
