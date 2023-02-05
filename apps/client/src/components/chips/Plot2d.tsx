import { scaleLinear } from '@visx/scale';
import { Axis } from '@visx/axis';
import { line } from 'd3-shape';
import { CSSProperties, ReactNode } from 'react';
type JSXs = ReactNode;
type Quad = [number, number, number, number];

const ag = (start: number, stop: number, step: number, inc = 0) =>
  Array(Math.ceil((stop + inc - start) / step))
    .fill(start)
    .map((x, y) => x + y * step);

const range = (start: number, stop: number, step = 1) =>
  ag(start, stop, step, 0);

const perspect = (dimension: number) => (margins: Quad) => (going: 'x' | 'y') =>
  going === 'x'
    ? dimension - margins[3] - margins[1]
    : dimension - margins[0] - margins[2];

const viewScale = (len: number) => (margins: Pair) =>
  len - margins[0] - margins[1];

const divStyles =
  (cw: number) =>
  (ch: number): CSSProperties => ({
    display: 'block',
    position: 'relative',
    width: `${cw * ch}%`,
    paddingBottom: `${cw}%`,
    backgroundColor: 'inherit',
    overflow: 'hidden',
  });

const translate = (xy: Pair) => `translate(${xy[0]}, ${xy[1]})`;
const svgStyles = (): CSSProperties => ({
  display: 'inline-block',
  position: 'absolute',
  margin: '1em',
  top: 0,
  left: 0,
});
const viewBoxit = (w: number) => (h: number) => (m: Quad) =>
  `0 0 ${viewScale(w)([m[3], m[1]]) + m[3] + m[1]} ${
    viewScale(h)([m[0], m[2]]) + m[0] + m[2]
  }`;

const Group = (m: Quad) => (children: JSXs) =>
  <g transform={translate([m[3], m[0]])}>{children}</g>;

const Svg = (w: number) => (h: number) => (m: Quad) => (children: JSXs) =>
  (
    <svg
      style={svgStyles()}
      viewBox={viewBoxit(w)(h)(m)}
      preserveAspectRatio={`xMinYMin meet`}
    >
      {Group(m)(children)}
    </svg>
  );

const Fig =
  (w: number) =>
  (h: number) =>
  (cw: number) =>
  (ch: number) =>
  (m: Quad) =>
  (children: JSXs) =>
    <div style={divStyles(cw)(ch)}>{Svg(w)(h)(m)(children)}</div>;

type F1 = (x: number) => number;
type Pair = [number, number];

const xScale = (D: Pair) => (svgWidth: number) =>
  scaleLinear({ domain: D, range: [0, svgWidth] });

const yScale = (R: Pair) => (svgHeight: number) =>
  scaleLinear({ domain: R, range: [svgHeight, 0] });

const getPoints = (f: F1) => (s: number) => (D: Pair) => (R: Pair) =>
  range(-s, s)
    .map((i) => ({ x: (i / s) * D[1], y: f((i / s) * D[1]) }))
    .map((p) =>
      isNaN(p.y) || p.y <= R[0] * 2 || p.y >= R[1] * 2 ? { x: p.x, y: null } : p
    )
    .filter((p) => !(p.x < D[0]) || !(p.x > D[1]));

const Fpath =
  (f: F1) => (s: number) => (D: Pair) => (R: Pair) => (wH: Pair) => {
    const L: any = () =>
      line()
        .y((d: any) => yScale(R)(wH[1])(d.y))
        .defined((d: any) => d.y !== null)
        .x((d: any) => xScale(D)(wH[0])(d.x))(getPoints(f)(s)(D)(R) as any);
    return (
      <path
        d={L()}
        stroke={'red'}
        shapeRendering={'geometricPrecision'}
        fill={'none'}
      />
    );
  };

type Plot2dProps = {
  f: F1;
  D?: Pair;
  R?: Pair;
  wh?: [number, number];
  cw?: number;
  ch?: number;
  m?: Quad;
  scale?: number;
};

const axis =
  (opt: 'x' | 'y') => (range: Pair) => (length: number) => (ticks: number) =>
    (
      <Axis
        hideZero={opt === 'y'}
        scale={(opt === 'x' ? xScale : yScale)(range)(length)}
        numTicks={ticks}
        tickStroke={'black'}
        tickLength={2}
        tickTransform={opt === 'y' ? translate([-1, 0]) : translate([0, -1])}
        orientation={opt === 'x' ? 'bottom' : 'right'}
        tickLabelProps={() => ({
          fill: 'black',
          textAnchor: opt === 'x' ? 'middle' : 'start',
          verticalAnchor: opt === 'x' ? 'end' : 'start',
          fontFamily: 'CMU Serif',
          fontSize: '0.7rem',
          dx: opt === 'y' ? 3 : 0,
        })}
      />
    );

const Rectangle = (w: number) => (h: number) => <rect width={w} height={h} />;

const yAxis =
  (height: number) =>
  (range: Pair) =>
  (ticks: number = 5) =>
    axis('y')(range)(height)(ticks);

const xAxis =
  (width: number) =>
  (domain: Pair) =>
  (ticks: number = 5) =>
    axis('x')(domain)(width)(ticks);

const Clip = (id: string) => (children?: JSXs) =>
  (
    <defs>
      <clipPath id={id}>{children}</clipPath>
    </defs>
  );

const Plot2d = ({
  f,
  D = [-10, 10],
  R = [-10, 10],
  wh = [500, 500],
  scale = 70,
  cw = scale,
  ch = wh[0] / wh[1],
  m = [0, 0, 0, 0],
}: Plot2dProps) => {
  const vw = () => perspect(wh[0])(m)('x');
  const vh = () => perspect(wh[1])(m)('y');
  const scaleX = (x: number) => xScale(D)(vw())(x);
  const scaleY = (y: number) => yScale(R)(vh())(y);
  return Fig(wh[0])(wh[1])(cw)(ch)(m)(
    <g style={{ transformOrigin: 'center' }}>
      {Clip('plot')(Rectangle(vw())(vh()))}
      <g transform={translate([0, scaleY(0)])}>{xAxis(vw())(R)(15)}</g>
      <g transform={translate([scaleX(0), 0])}>{yAxis(vh())(D)(15)}</g>
      <g clipPath='url(#plot)'>{Fpath(f)(500)(D)(R)(wh)}</g>
    </g>
  );
};

export { Plot2d };
