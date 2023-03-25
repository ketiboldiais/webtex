import { line } from "d3-shape";
import { algom } from "src/algom";
import {
  Clip,
  FunctionPlotProps,
  Plane,
  Scale,
  SVG,
  svgDimensions,
  XScale,
  YScale,
} from "./PlotUtils";

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
