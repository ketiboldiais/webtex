import { scaleLinear } from "@visx/scale";
import { CSSProperties, ReactNode } from "react";

export type SVGProps = {
  width?: number;
  height?: number;
  pad?: number;
  padTop?: number;
  padRight?: number;
  padBottom?: number;
  padLeft?: number;
  padding?: [number, number, number, number];
  children?: ReactNode;
};

export function SVG({
  width = 500,
  height = 500,
  pad = 50,
  padTop = pad,
  padRight = pad,
  padBottom = pad,
  padLeft = pad,
  padding = [padTop, padRight, padBottom, padLeft],
  children,
}: SVGProps) {
  const [top, right, bottom, left] = padding;
  const svgWidth = width - left - right;
  const svgHeight = height - top - bottom;
  const vbWidth = svgWidth + left + right;
  const vbHeight = svgHeight + top + bottom;
  const VB = `0 0 ${vbWidth} ${vbHeight}`;
  const figstyle: CSSProperties = {
    display: "block",
    position: "relative",
    width: `100%`,
    paddingBottom: `${100 * (height / width)}%`,
    overflow: "hidden",
  };
  const svgCSS: CSSProperties = {
    display: "block",
    position: "absolute",
    top: 0,
    left: 0,
  };
  const par = "xMinYMin meet";
  return (
    <div style={figstyle}>
      <svg viewBox={VB} preserveAspectRatio={par} style={svgCSS}>
        {children}
      </svg>
    </div>
  );
}
