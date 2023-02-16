import { scaleLinear } from "@visx/scale";
import { line } from "d3-shape";
import { CSSProperties, ReactNode } from "react";
type CSSObj = CSSProperties;
type ℝxℝ = [number, number];
type ℝ = number;

interface tFPlot {
  f: (a: ℝ) => ℝ;
  domain: ℝxℝ;
  range: ℝxℝ;
  width: ℝ;
  height: ℝ;
  scale: ℝ;
}

function Path() {
}

function Points2D(f: (x:ℝ)=>ℝ, samples:ℝ, domain:ℝxℝ, range:ℝxℝ) {
	const xs = interval(-samples, samples);
	const minY = range[0] * 2;
	const maxY = range[1] * 2;
	const xMin = domain[0];
	const xMax = domain[1];
	
	for (let i = 0; i < xs.length; i++) {
		const x = xs[i];
		const y = f(x);
	}
	
	
	
	
  // return interval(-samples, samples)
    // .map((i) => ({
      // x: (i / samples) * domain[1],
      // y: fn((i / samples) * domain[1]),
    // }))
    // .map((p) =>
      // isNaN(p.y) || p.y <= range[0] * 2 || p.y >= range[1] * 2
        // ? { x: p.x, y: null }
        // : p
    // )
    // .filter((p) => !(p.x < domain[0]) || !(p.x > domain[1]));
}

function scale(axis: "x" | "y", domain: ℝxℝ, length: ℝ) {
  const range = axis === "x" ? [0, length] : [length, 0];
  return scaleLinear({ domain, range });
}

interface tSVG {
  width: ℝ;
  height: ℝ;
  children: ReactNode;
}

function Svg({ width, height, children }: tSVG) {
  const v = `0 0 ${height} ${width}`;
  const p = `xMidYMid meet`;
  const cs: CSSObj = {
    display: "flex",
    flexDirection: "column",
  };
  return (
    <div style={cs}>
      <svg viewBox={v} preserveAspectRatio={p}>
        {children}
      </svg>
    </div>
  );
}

function contain(width: ℝ, height: ℝ): CSSObj {
  return {
    display: "block",
    position: "relative",
    width: `${width * height}%`,
    backgroundColor: "inherit",
    overflow: "hidden",
  };
}

function ag(start: ℝ, stop: ℝ, step: ℝ, inc = 0) {
  return Array(Math.ceil((stop + inc - start) / step))
    .fill(start)
    .map((x, y) => x + y * step);
}

function interval(start: ℝ, stop: ℝ, step = 1) {
  return ag(start, stop, step, 0);
}
