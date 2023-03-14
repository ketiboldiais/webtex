import { scaleLinear } from "@visx/scale";
import { line, lineRadial } from "d3-shape";
import { ReactNode, useEffect, useRef } from "react";
import { algom } from "src/mathlang";
import { Axis, AxisScale } from "@visx/axis";
import { Canvas, useThree } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { AxesHelper, DoubleSide, GridHelper, Vector3 } from "three";
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

interface Plot3dProps {
  z: Function | string;
  fov?: number;
  position?: [number, number, number];
  near?: number;
  far?: number;
  segments?: number;
  xInterval?: [number, number];
  yInterval?: [number, number];
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  xRange?: number;
  yRange?: number;
  scale?: number;
  width?: number;
  height?: number;
  gridColor?: string;
}

interface Plot3dPathProps {
  paramFunction: ((u: number, v: number, target: Vector3) => void) | undefined;
  scale: number;
  segments: number;
}
function Plot3dPath({ paramFunction, scale, segments }: Plot3dPathProps) {
  const ref = useRef<any>();
  const graph = new ParametricGeometry(paramFunction, segments, segments);
  return (
    <mesh ref={ref} scale={scale} geometry={graph}>
      <meshNormalMaterial side={DoubleSide} />
    </mesh>
  );
}

function CameraController() {
  const { camera, gl } = useThree();
  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.minDistance = 5;
    controls.maxDistance = 20;
    return () => {
      controls.dispose();
    };
  }, [camera, gl]);
  return null;
}

export function Plot3d({
  z,
  segments = 100,
  fov = 60,
  position = [12, 5, 12],
  near = 0.1,
  far = 30,
  xMin = -10,
  xMax = 10,
  yMin = -10,
  yMax = 10,
  xRange = xMax - xMin,
  yRange = yMax - yMin,
  scale = 0.3,
  width = 500,
  height = 500,
  gridColor = "lightgrey",
}: Plot3dProps) {
  const canvasSize = { width, height };
  let Z: Function;
  if (typeof z === "string") {
    const fn = algom.compfn(z, "z", "(x,y)");
    if (typeof fn === "string") return <>{fn}</>;
    Z = fn;
  } else {
    Z = z;
  }
  const paramFunction = (x: number, y: number, target: Vector3) => {
    x = xRange * x + xMin;
    y = yRange * y + yMin;
    let zVal = Z(x, y);
    if (isNaN(zVal)) return target.set(0, 0, 0);
    else return target.set(x, zVal, y);
  };
  return (
    <div style={{ ...canvasSize, margin: "auto", padding: "1.2em" }}>
      <Canvas
        camera={{ fov, position, near, far }}
        onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
      >
        <CameraController />
        <pointLight position={[0, 250, 0]} color={0xffffff} />
        <primitive object={new AxesHelper(10)} />
        <primitive object={new GridHelper(10, 10, gridColor, gridColor)} />
        <Plot3dPath
          paramFunction={paramFunction}
          scale={scale}
          segments={segments}
        />
      </Canvas>
    </div>
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
interface Plot1Props extends FunctionPlotProps {
  f: Function | string;
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

export function PlotXY({
  f,
  ticks = 10,
  domain = [-10, 10],
  range = [-10, 10],
  width = 500,
  height = 500,
  cwidth = 100,
  cheight = height / width,
  margin = 30,
  margins = [margin, margin, margin, margin],
}: Plot1Props) {
  if (typeof f === "string") {
    const fn = algom.makeFunction(f, ['x']);
    if (typeof fn === "string") return <>{fn}</>;
    f = fn;
  }
  const fx: Function = f;
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
        <XYPath
          f={fx}
          samples={500}
          domain={domain}
          range={range}
          xScale={xScale}
          yScale={yScale}
        />
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
}
function SVG({
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
  );
}
