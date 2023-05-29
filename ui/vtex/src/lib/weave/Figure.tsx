import { CSSProperties, Fragment, useMemo } from "react";
import { tree as d3Tree } from "d3";
import { arc } from "d3";
import {
  $Angle,
  $Axis,
  $Plane,
  $Plot,
  $Plottable,
  $Vector,
  angle,
  isAngle,
  isAxis,
  isIntegral,
  isPlane,
  isPlot,
  isPoint,
  isVector,
  isVector2D,
  label,
  vector,
} from "./weft/plot/plot.data.js";
import {
  pickSafe,
  rotate,
  shift,
  toDeg,
  toRadians,
  tuple,
} from "./aux.js";
import { Axis } from "@visx/axis";
import {
  area,
  forceCenter,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  hierarchy,
  line,
  linkHorizontal,
  scaleLinear,
} from "d3";
import { Scaler } from "./warp/scalable.js";
import { compile } from "@/lang/compiler.js";
import { engine } from "@/lang/main.js";
import { $Graph, $Vertex, isGraph } from "./weft/graph/graph.data.js";
import { Twine } from "./weavers.js";
import {
  $TLink,
  $Tree,
  isTree,
  treelink,
  TreeNode,
} from "./weft/tree/tree.data.js";

export type FigureProps = {
  of: Twine;
  display?: CSSProperties["display"];
  overflow?: CSSProperties["overflow"];
  free?: boolean;
  className?: string;
};

export function Figure({
  of,
  overflow = "hidden",
  display = "inline-block",
  free = false,
  className = "",
}: FigureProps) {
  const data = of;
  const width = data.absoluteWidth;
  const height = data.absoluteHeight;
  const viewBox = `0 0 ${width} ${height}`;
  const paddingBottom = free ? "" : `${100 * (height / width)}%`;
  const boxCSS: CSSProperties = {
    display,
    position: "relative",
    width: "100%",
    paddingBottom,
    overflow,
  };
  const svgCSS: CSSProperties = {
    display: "inline-block",
    position: "absolute",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
  };
  const par = "xMidYMid meet";
  const cname = "weave" + " " + className;
  return (
    <div style={boxCSS} className={cname}>
      <svg viewBox={viewBox} preserveAspectRatio={par} style={svgCSS}>
        {isPlane(data) && <PlaneFig of={data} />}
        {isGraph(data) && <GraphFig of={data} />}
        {isTree(data) && <TreeFig of={data} />}
      </svg>
    </div>
  );
}

type GraphFigProps = {
  of: $Graph;
};

function GraphFig(props: GraphFigProps) {
  const data = props.of;
  const mx = data.marginOf("x");
  const my = data.marginOf("y");
  const width = data.relative("width");
  const height = data.relative("height");
  const cx = pickSafe(data.forceCenterX, data.absoluteWidth);
  const cy = pickSafe(data.forceCenterY, data.absoluteHeight);
  const nodes = Object.values(data.nodes);
  const edges = data.edges;
  const linkforce = forceLink(edges);
  const charge = pickSafe(data.forceCharge, -150);
  const bodyforce = forceManyBody().strength(charge);
  forceSimulation(nodes)
    .force("charge", bodyforce)
    .force("link", linkforce)
    .force("center", forceCenter(width / 2, height / 2))
    .force("x", forceX(cx).strength(0))
    .force("y", forceY(cy).strength(0))
    .stop()
    .tick(200);
  return (
    <g transform={shift(mx / 2, my / 2)}>
      {edges.map((e) => (
        <line
          key={e.id}
          stroke={e.strokeColor || "currentColor"}
          strokeDasharray={e.strokeDashArray ?? 0}
          strokeWidth={e.strokeWidth || 1}
          x1={e.source.x}
          y1={e.source.y}
          x2={e.target.x}
          y2={e.target.y}
        />
      ))}
      <g>
        {nodes.map((n, i) => (
          <GraphNode key={`${n.id}${i}`} of={n} />
        ))}
      </g>
    </g>
  );
}

type GraphNodeProps = {
  of: $Vertex;
};

function GraphNode(props: GraphNodeProps) {
  const n = props.of;
  const r = n.radius;
  const stroke = pickSafe(n.strokeColor, "currentColor");
  const fill = pickSafe(n.fillColor, "white");
  const fs = pickSafe(n.fontSize, "11px");
  const fc = pickSafe(n.fontColor, "currentColor");
  const tx = pickSafe(n.textDx, r);
  const ty = pickSafe(n.textDy, -r * 1.5);
  return (
    <g transform={shift(n.x, n.y)}>
      <circle stroke={stroke} r={r} fill={fill} />
      <text dx={tx} dy={ty} fontSize={fs} fill={fc}>
        {n.data}
      </text>
    </g>
  );
}

type PlaneProps = {
  of: $Plane;
};
function PlaneFig(props: PlaneProps) {
  const data = props.of;

  // This is the domain the
  // user passes to the plane data
  // object.
  const dataDomain = data.domain;
  const xmin = dataDomain[0];
  const xmax = dataDomain[1];

  // This is the range the
  // user passes to the plane data
  // object.
  const dataRange = data.range;
  const ymin = dataRange[0];
  const ymax = dataRange[1];

  const axis_x_domain = tuple(0, data.relative("width"));
  const axis_y_domain = tuple(data.relative("height"), 0);

  const children = data.children;

  let xscale: Scaler = scaleLinear()
    .domain(dataDomain)
    .range(axis_x_domain);

  let yscale: Scaler = scaleLinear()
    .domain(dataRange)
    .range(axis_y_domain);

  const arrowdefs: ArrowDef[] = [];

  // § Data Wrangling: Plot Children
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (isAxis(child) && child.is("x")) {
      const [r1, r2] = axis_x_domain;
      child.dom(xmin, xmax).ran(r1, r2);
      xscale = child.scale("linear");
    } else if (isAxis(child) && child.is("y")) {
      const [ry1, ry2] = axis_y_domain;
      child.dom(ymin, ymax).ran(ry1, ry2);
      yscale = child.scale("linear");
    } else if (isPlot(child)) {
      child.dom(xmin, xmax);
      child.ran(ymin, ymax);
    } else if (isVector2D(child)) {
      arrowdefs.push({
        id: child.id,
        color: child.strokeColor || "currentColor",
      });
    } else if (isAngle(child)) {
      if (isVector(child.v1)) {
        arrowdefs.push({
          id: child.v1.id,
          color: child.v1.strokeColor || "currentColor",
        });
      }
      if (isVector(child.v2)) {
        arrowdefs.push({
          id: child.v2.id,
          color: child.v2.strokeColor || "currentColor",
        });
      }
    }
  }

  const mx = data.marginOf("x");
  const my = data.marginOf("y");

  const axisTranslate = (d: $Axis) => {
    if (d.is("y")) {
      return shift(xscale(0), 0);
    } else {
      return shift(0, yscale(0));
    }
  };

  const gridlines: LineCoord[] = [];

  if (data.gridLines) {
    if (data.gridLines === "x" || data.gridLines === "xy") {
      const xi = Math.floor(xmin);
      const xf = Math.floor(xmax);
      for (let i = xi; i <= xf; i++) {
        let x0 = xscale(i);
        let x1 = x0;
        let y0 = yscale(ymin);
        let y1 = yscale(ymax);
        gridlines.push({ x0, x1, y0, y1 });
      }
    }
    if (data.gridLines === "y" || data.gridLines === "xy") {
      const yi = Math.floor(ymin);
      const yf = Math.floor(ymax);
      for (let j = yi; j <= yf; j++) {
        let x0 = xscale(xmin);
        let x1 = xscale(xmax);
        let y0 = yscale(j);
        let y1 = y0;
        gridlines.push({ x0, x1, y0, y1 });
      }
    }
  }

  const scales = { xscale, yscale };

  return (
    <Fragment>
      {arrowdefs.length && (
        <defs>
          {arrowdefs.map((d) => (
            <marker
              key={d.id}
              id={`arrow${d.id}`}
              orient={"auto"}
              viewBox={"0 -5 10 10"}
              markerWidth={6}
              markerHeight={6}
              refX={8}
              refY={0}
            >
              <path d={"M0,-5L10,0L0,5Z"} fill={d.color} />
            </marker>
          ))}
        </defs>
      )}
      <g transform={shift(mx / 2, my / 2)}>
        {children.map((d: $Plottable) => (
          <Fragment key={d.id}>
            {isAngle(d) && <AngleFig of={d} {...scales} />}
            {isVector2D(d) && <Ray of={d} {...scales} />}
            {isAxis(d) && (
              <g transform={axisTranslate(d)} className={d.klasse()}>
                <PlotAxis of={d} />
              </g>
            )}
            {isPlot(d) && (
              <PlotFig of={d} xscale={xscale} yscale={yscale} />
            )}
            {isPoint(d) && (
              <g
                className={d.klasse()}
                transform={shift(xscale(d.cx), yscale(d.cy))}
              >
                {d.render && (
                  <circle
                    fill={d.fillColor || "currentColor"}
                    stroke={d.strokeColor || "currentColor"}
                    r={d.radius}
                  />
                )}
                {d.pointLabel && (
                  <text
                    x={d.labelX}
                    y={d.labelY || -d.radius * 2}
                    fontSize={d.fontSize || "12px"}
                    fontFamily={d.fontFamily || "inherit"}
                    fill={d.fontColor || "currentColor"}
                    dx={(d.textDx||0)}
                    dy={(d.textDy||0)}
                  >
                    {d.pointLabel}
                  </text>
                )}
              </g>
            )}
          </Fragment>
        ))}
        {gridlines.length && (
          <g className={"weaver-grid"}>
            {gridlines.map((d, i: number) => (
              <line
                key={data.id + "line" + i}
                x1={d.x0}
                x2={d.x1}
                y1={d.y0}
                y2={d.y1}
                stroke={"currentColor"}
                opacity={0.1}
              />
            ))}
          </g>
        )}
      </g>
    </Fragment>
  );
}

type RayProps = {
  of: $Vector;
  xscale: Scaler;
  yscale: Scaler;
};
const Ray = (props: RayProps) => {
  const d = props.of;
  const xscale = props.xscale;
  const yscale = props.yscale;
  return (
    <line
      x1={xscale(d.x1)}
      y1={yscale(d.y1)}
      x2={xscale(d.x2)}
      y2={yscale(d.y2)}
      stroke={d.strokeColor || "currentColor"}
      strokeWidth={d.strokeWidth || 1}
      markerEnd={d.arrow ? `url(#arrow${d.id})` : ""}
      strokeDasharray={d.strokeDashArray || 0}
    />
  );
};

type AngleProps = {
  of: $Angle;
  xscale: Scaler;
  yscale: Scaler;
};

const angleBetween = (x: number, y: number) => Math.atan2(x, y);
const AngleFig = ({ of, xscale, yscale }: AngleProps) => {
  const data = of;
  const v1 = isVector(data.v1) ? data.v1 : vector(data.v1.elements);
  const v2 = isVector(data.v2) ? data.v2 : vector(data.v2.elements);
  const ax = xscale(v1.x);
  const ay = yscale(v1.y);
  const bx = xscale(v2.x);
  const by = yscale(v2.y);

  const ox = xscale(v1.originX);
  const oy = yscale(v1.originY);
  const unit = vector([0,4]).stroke('red');
  let ua = angle(v1,unit);
  const theta1 = data.value();
  const quadrant = v2.quadrant();
  let rval = 0;
  if (quadrant==='II') {
    rval = toDeg(0 - ua.value());
  }
  if (quadrant==='I') {
    ua = angle(v2,unit);
    rval = toDeg(ua.value())
  }
  if (quadrant==='III') {
    ua = angle(v2,unit)
    rval = toDeg(-ua.value())
  }
  if (quadrant==='IV') {
    ua = angle(v2,unit)
    rval = toDeg(ua.value())
  }
  

  const arcof = (startAngle:number, endAngle:number) => arc()({
    innerRadius:20,
    outerRadius:20,
    startAngle,
    endAngle
  })!
  const d1 = arcof(0,theta1);
  const d2 = arcof(0,ua.value());
  const rotation = rotate(rval);

  const Point = ({
    x,
    y,
    r = 2,
    c = 'red'
  }: {
    x: number;
    y: number;
    r?: number;
    c?: string;
  }) => (
    <circle
      r={r}
      cx={xscale(x)}
      cy={yscale(y)}
      fill={c}
      stroke={"black"}
    />
  );

  return (
    <Fragment>
      <Ray of={v1 as any} xscale={xscale} yscale={yscale} />
      <Ray of={v2 as any} xscale={xscale} yscale={yscale} />
      <Ray of={unit as any} xscale={xscale} yscale={yscale} />
      <line
        x1={ax}
        y1={ay}
        x2={bx}
        y2={by}
        stroke={"black"}
        strokeWidth={1}
      />
      <g transform={shift(ox,oy)}>
        <g transform={rotation}>
          <path d={d1} fill={'none'} stroke={'red'} strokeWidth={5}/>
        </g>
        <path d={d2} fill={'none'} stroke={'blue'} strokeWidth={3}/>
      </g>
      <Point x={v1.x} y={v1.y} c={'cyan'}/>
      <Point x={v2.x} y={v2.y} c={'lime'}/>
      <Point x={v2.originX} y={v2.originY}/>
    </Fragment>
  );
};

type ArrowDef = { id: string; color: string };

type LineCoord = { x0: number; x1: number; y0: number; y1: number };

type PlotProps = {
  of: $Plot;
  xscale: Scaler;
  yscale: Scaler;
};

type PlotMemo = {
  curve: string;
};

function PlotFig(props: PlotProps) {
  const data = props.of;
  const xs = props.xscale;
  const ys = props.yscale;
  const domain = data.domain;
  const range = data.range;
  const def = data.def;
  const d = useMemo(() => {
    const out: PlotMemo = { curve: "" };
    const f = compile(engine().parse("fn " + def + ";"));
    if (f.isLeft()) return out;
    const samples = pickSafe(data.sampleCount, 550);
    const xMin = domain[0];
    const xMax = domain[1];
    const yMin = range[0];
    const yMax = range[1];
    const dataset: [number, number][] = [];
    for (let i = -samples; i < samples; i++) {
      const x = (i / samples) * xMax;
      let y = f.map((n) => n(x)).unwrap();
      if (typeof y !== "number") continue;
      const point: [number, number] = [x, y];
      if (isNaN(y) || y < yMin || yMax < y) point[1] = NaN;
      if (x < xMin || xMax < x) continue;
      else dataset.push(point);
    }
    const p = line()
      .y((d) => ys(d[1]))
      .defined((d) => !isNaN(d[1]))
      .x((d) => xs(d[0]))(dataset);
    if (p !== null) {
      out.curve = p;
    }
    data.children.forEach((c) => {
      if (isIntegral(c)) {
        const lb = c.lowerBound;
        const ub = c.upperBound;
        const max = domain[1];
        const dataset: AreaCoord[] = [];
        for (let i = -samples; i < samples; i++) {
          const n = (i / samples) * max;
          const x0 = n;
          const x1 = n;
          const y0 = f.map((fn) => fn(x0)).unwrap();
          if (typeof y0 !== "number") {
            continue;
          }
          const y1 = 0;
          if (lb < n && n < ub && range[0] <= y0 && y0 <= range[1]) {
            dataset.push({ x0, x1, y0, y1 });
          }
        }
        const A = area<AreaCoord>()
          .defined((d) => !Number.isNaN(d.y0) && !Number.isNaN(d.y1))
          .x0((d) => xs(d.x0))
          .y0((d) => ys(d.y0))
          .x1((d) => xs(d.x1))
          .y1((d) => ys(d.y1))(dataset);
        const a = A !== null ? A : "";
        c.area = a;
      }
    });
    return out;
  }, [domain, range, xs, ys, def]);
  const fill = pickSafe(data.fillColor, "none");
  const stroke = pickSafe(data.strokeColor, "tomato");
  const strokewidth = pickSafe(data.strokeWidth, 2);
  const dash = pickSafe(data.strokeDashArray, 0);
  return (
    <Fragment>
      <g className={data.klasse()}>
        <path
          d={d.curve}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokewidth}
          strokeDasharray={dash}
        />
      </g>
      {data.children.map((c, i) => (
        <Fragment key={data.def + i}>
          {isIntegral(c) && (
            <g className={c.klasse()}>
              <path
                d={c.area}
                opacity={c.opacityValue || 0.3}
                strokeWidth={c.strokeWidth || 1}
                fill={c.fillColor || "gold"}
              />
            </g>
          )}
        </Fragment>
      ))}
    </Fragment>
  );
}

type PlotAxisProps = {
  of: $Axis;
};
function PlotAxis(props: PlotAxisProps) {
  const data = props.of;
  const scale = data.scale("linear");
  const orient = data.is("y") ? "right" : "bottom";
  const transform = data.is("y") ? shift(-2, 0) : shift(0, -2);
  const dx = data.is("y") ? 2 : -3;
  const dy = data.is("y") ? 3 : 3;
  const fontSize = "0.6rem";
  const domain = data.domain;
  const nticks = Math.floor(domain[1] - domain[0]);
  const stroke = pickSafe(data.strokeColor, "currentColor");
  return (
    <Axis
      scale={scale}
      numTicks={nticks}
      orientation={orient}
      stroke={stroke}
      tickStroke={stroke}
      tickLength={4}
      hideZero={true}
      tickTransform={transform}
      tickLabelProps={() => ({
        fill: stroke,
        fontSize,
        dx,
        dy,
      })}
    />
  );
}
type TreeFigProps = {
  of: $Tree;
};
const TreeFig = (props: TreeFigProps) => {
  const data = props.of;
  const mx = data.marginOf("x");
  const my = data.marginOf("y");
  const sibsep = pickSafe(data.SIBLING_DISTANCE, 30);
  const pcsep = pickSafe(data.PARENT_CHILD_DISTANCE, 25);
  const nh = data.NODE_HEIGHT;
  const nw = data.NODE_WIDTH;
  const size = tuple(
    pickSafe(nh, data.relative("width")),
    pickSafe(nw, data.calcTreeSize(data) * pcsep)
  );

  const r = hierarchy<TreeNode>(data);
  const treeify = d3Tree<TreeNode>()
    .size(size)
    .separation((a, b) =>
      a.parent &&
      b.parent &&
      a.parent.data.value === b.parent.data.value
        ? pcsep
        : sibsep
    );
  const out = treeify(r);
  const links = out.links().map((l) => treelink(l.source, l.target));
  const nodes = out.descendants();
  const linkgen = linkHorizontal<$TLink, TreeNode>()
    .x((node) => node.x || 0)
    .y((node) => node.y || 0);
  return (
    <g transform={shift(mx / 2, my / 2)}>
      {links.map((link) => (
        <g key={link.id} className={link.klasse()}>
          {data.curvedEdges ? (
            <path
              d={linkgen(link) || ""}
              fill={link.fillColor || "none"}
              stroke={link.strokeColor || data.edgeColor}
            />
          ) : (
            <Segment
              start={tuple(link.source.x, link.source.y)}
              end={tuple(link.target.x, link.target.y)}
              stroke={link.strokeColor || data.edgeColor}
              strokeWidth={link.strokeWidth || 1}
            />
          )}
        </g>
      ))}
      {nodes.map((node) => (
        <g
          key={node.data.id}
          className={node.data.klasse()}
          transform={shift(node.x, node.y)}
        >
          <circle
            fill={node.data.fillColor || data.nodeColor}
            r={node.data.r}
            stroke={node.data.strokeColor || data.edgeColor}
          />
          <text
            fill={node.data.fontColor || data.edgeColor}
            fontSize={node.data.fontSize || "inherit"}
            dx={pickSafe(node.data.textDx, node.data.r / 2)}
            dy={pickSafe(node.data.textDy, -node.data.r * 2)}
          >
            {node.data.value}
          </text>
        </g>
      ))}
    </g>
  );
};

type SegmentProps = {
  start: [number, number];
  end: [number, number];
  stroke: string;
  strokeWidth: number;
};
const Segment = ({
  start,
  end,
  stroke,
  strokeWidth,
}: SegmentProps) => {
  const [x1, y1] = start;
  const [x2, y2] = end;
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
};
