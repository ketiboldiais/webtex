import { scaleLinear } from "d3";
import { lineRadial } from "d3-shape";
import { nanoid } from "nanoid";
import { compfn } from "@webtex/algom";
import { SVG, svgDimensions } from "./PlotUtils";

function polar(f: Function, domain: [number, number]) {
  let points: [number, number][] = [];
  for (let i = domain[0]; i < domain[1]; i += 0.01) {
    const point = [i, f(i)];
    points.push(point as [number, number]);
  }
  return points;
}
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
    const fn = compfn(f, "f", "(x)");
    if (typeof fn === "string") return <>{fn}</>;
    Fx = fn;
  } else Fx = f;
  const data = polar(Fx, domain);
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
