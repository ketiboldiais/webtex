import { createFunction } from "@webtex/algom";
import { Struct, Visitor } from "../core/datum";
import { SVG } from "../core/svg";
import { Pair, Triple } from "../types";

export type CoordinateType =
  | "3D-cartesian"
  | "3D-cylindrical"
  | "3D-spherical";

type Point3D = { x: number; y: number; z: number };

export const point = (x: number, y: number) => ({ x, y });

export function coord(type: CoordinateType) {
  switch (type) {
    case "3D-cartesian":
      return (x: number, y: number, z: number) => ({ x, y, z });
    case "3D-spherical":
      return (r: number, theta: number, phi: number) => ({
        x: r * (Math.sin(theta)) * (Math.cos(phi)),
        y: r * (Math.sin(theta)) * (Math.sin(phi)),
        z: r * (Math.cos(theta)),
      });
    case "3D-cylindrical":
      return (rho: number, theta: number, z: number) => ({
        x: rho * Math.cos(theta),
        y: rho * Math.sin(theta),
        z,
      });
  }
}

export function vector3DOp<t>(
  p1: Point3D,
  p2: Point3D,
  callback: (
    x1: number,
    y1: number,
    z1: number,
    x2: number,
    y2: number,
    z2: number,
  ) => t,
) {
  const { x: x1, y: y1, z: z1 } = p1;
  const { x: x2, y: y2, z: z2 } = p2;
  return callback(x1, y1, z1, x2, y2, z2);
}

export function addVector3D(p1: Point3D, p2: Point3D) {
  return vector3DOp(
    p1,
    p2,
    (x1, y1, z1, x2, y2, z2) => ({
      x: x1 + x2,
      y: y1 + y2,
      z: z1 + z2,
    }),
  );
}

export function minusVector3D(p1: Point3D, p2: Point3D) {
  return vector3DOp(
    p1,
    p2,
    (x1, y1, z1, x2, y2, z2) => ({
      x: x1 - x2,
      y: y1 - y2,
      z: z1 - z2,
    }),
  );
}

export function scaleVector3D(point: Point3D, scale: number) {
  const { x: Px, y: Py, z: Pz } = point;
  return {
    x: Px * scale,
    y: Py * scale,
    z: Pz * scale,
  };
}

export function dotVector3D(p1: Point3D, p2: Point3D) {
  return vector3DOp(
    p1,
    p2,
    (x1, y1, z1, x2, y2, z2) => (
      (x1 * x2) + (y1 * y2) + (z1 * z2)
    ),
  );
}

export function normVector3D(point: Point3D) {
  const { x, y, z } = point;
  const x2 = x ** 2;
  const y2 = y ** 2;
  const z2 = z ** 2;
  const xyz = x2 + y2 + z2;
  return Math.sqrt(xyz);
}

export function crossVector3D(p1: Point3D, p2: Point3D) {
  return vector3DOp(
    p1,
    p2,
    (x1, y1, z1, x2, y2, z2) => ({
      x: (y1 * z2) - (z1 * y2),
      y: (z1 * x2) - (x1 * z2),
      z: (x1 * y2) - (y1 * x2),
    }),
  );
}

export class Fn3D extends Struct {
  _domainX: Pair<number> = [-10, 10];
  _domainY: Pair<number> = [-10, 10];
  _X: string;
  _Y: string;
  _expression: string = "";
  _yaw: number = 0.5;
  _pitch: number = 0.6;

  constructor(x: string, y: string) {
    super("Plot3D");
    this._X = x;
    this._Y = y;
  }
  yaw(value: number) {
    const self = this.getWritable();
    self._yaw = value;
    return self;
  }
  pitch(value: number) {
    const self = this.getWritable();
    self._pitch = value;
    return self;
  }
  upperBound(of: "x" | "y") {
    const self = this.getWritable();
    const set = of === "x" ? self._domainX : self._domainY;
    return set[1];
  }
  lowerBound(of: "x" | "y") {
    const self = this.getWritable();
    const set = of === "x" ? self._domainX : self._domainY;
    return set[0];
  }
  yDomain(interval: Pair<number>) {
    const self = this.getWritable();
    self._domainY = interval;
    return self;
  }
  xDomain(interval: Pair<number>) {
    const self = this.getWritable();
    self._domainX = interval;
    return self;
  }
  accept<x>(visitor: Visitor<x>): void {
    visitor.fn3D(this);
  }
  equals(expression: string) {
    const self = this.getWritable();
    self._expression = expression;
    return self;
  }

  get fn() {
    const self = this.getWritable();
    const x = self._X;
    const y = self._Y;
    const body = self._expression;
    const f = `z(${x},${y}) = ${body}`;
    const output = createFunction(f);
    if (typeof output === "string") return null;
    return output;
  }

  transformPoint(point: [number, [number], number]): Triple<number> {
    const pitch = this._pitch;
    const yaw = this._yaw;
    const cosA = Math.cos(pitch);
    const sinA = Math.sin(pitch);
    const cosB = Math.cos(yaw);
    const sinB = Math.sin(yaw);
    const newPoint = makePoint(cosA, sinA, cosB, sinB);
    const x1 = newPoint[0] * point[0];
    const x2 = newPoint[1] * (point[1] as any);
    const x3 = newPoint[2] * point[2];
    const x = x1 + x2 + x3;
    const y1 = newPoint[3] * point[0];
    const y2 = newPoint[4] * (point[1] as any);
    const y3 = newPoint[5] * point[2];
    const y = y1 + y2 + y3;
    const z1 = newPoint[6] * point[0];
    const z2 = newPoint[7] * (point[1] as any);
    const z3 = newPoint[8] * point[2];
    const z = z1 + z2 + z3;
    return [x, y, z];
  }

  datapoints(displayWidth: number, displayHeight: number) {
    const self = this.getWritable();
    const fn = self.fn;
    if (fn === null) return null;

    // establish bounds
    const xMin = self.lowerBound("x");
    const xMax = self.upperBound("x");
    const yMin = self.lowerBound("y");
    const yMax = self.upperBound("y");

    // establish zoom
    const zoom = Math.SQRT2;

    // generate the z-values
    const plotPoints: [number][] = [];
    for (let x = xMin; x < xMax; x++) {
      const z: [number] = [] as any as [number];
      plotPoints.push(z);
      for (let y = yMin; y < yMax; y++) {
        z.push(fn(x, y));
      }
    }

    // now get the heights
    const heights: ([number][])[] = [];
    const xLen = plotPoints.length;
    const yLen = plotPoints[0].length;
    for (let x = 0; x < xLen; x++) {
      const t: [number][] = [];
      heights.push(t);
      for (let y = 0; y < yLen; y++) {
        const value: [number] = [plotPoints[x][y]];
        t.push(value);
      }
    }

    // transform the points to account for heights
    const points: (Triple<number>[])[] = [];
    for (let x = 0; x < xLen; x++) {
      const temp: Triple<number>[] = [];
      points.push(temp);
      for (let y = 0; y < yLen; y++) {
        const xZoom = xLen * zoom;
        const px = ((x - xLen / 2) / (xZoom)) * displayWidth;
        const py = heights[x][y];
        const yZoom = yLen * zoom;
        const pz = ((y - yLen / 2) / (yZoom)) * displayWidth;
        const xyz: [number, [number], number] = [px, py, pz];
        temp.push(self.transformPoint(xyz));
      }
    }

    // now we can generate the surface's paths
    const xLength = points.length;
    const yLength = points[0].length;
    const result: PathObj[] = [];
    const W = displayWidth / 2;
    const H = displayHeight / 2;
    for (let x = 0; x < xLength - 1; x++) {
      for (let y = 0; y < yLength - 1; y++) {
        const a = points[x][y][2];
        const b = points[x + 1][y][2];
        const c = points[x + 1][y + 1][2];
        const d = points[x][y + 1][2];
        const depth = a + b + c + d;
        const M1 = (points[x][y][0] + W).toFixed(10);
        const M2 = (points[x][y][1] + H).toFixed(10);
        const L1 = (points[x + 1][y][0] + W).toFixed(10);
        const L2 = (points[x + 1][y][1] + H).toFixed(10);
        const L3 = (points[x + 1][y + 1][0] + W).toFixed(10);
        const L4 = (points[x + 1][y + 1][1] + H).toFixed(10);
        const L5 = (points[x][y + 1][0] + W).toFixed(10);
        const L6 = (points[x][y + 1][1] + H).toFixed(10);
        const path = `M ${M1},${M2} L${L1},${L2}, L${L3},${L4} L${L5},${L6} Z`;
        result.push({ path, depth, data: plotPoints[x][y] });
      }
    }
    return result;
  }
}

type PathObj = {
  path: string;
  depth: number;
  data: number;
};

const makePoint = (
  cosA: number,
  sinA: number,
  cosB: number,
  sinB: number,
): HexList => [
  cosB,
  0,
  sinB,
  sinA * sinB,
  cosA,
  -sinA * cosB,
  -sinB * cosA,
  sinA,
  cosA * cosB,
];

type HexList = [
  number,
  number,
  number,
  number,

  number,
  number,
  number,
  number,

  number,
];

export const z = (x: string, y: string) => new Fn3D(x, y);

type _Plot3D = {
  width?: number;
  height?: number;
  margins?: number;
  id: string;
};
export function Plot3D({
  width = 500,
  height = 500,
  margins,
  id = "hei",
}: _Plot3D) {
  const res = z("x", "y").equals("x^2 - y^2");
  const paths = res.datapoints(width, height);
  if (paths === null) {
    return null;
  }
  return (
    <>
      <SVG width={width} height={height}>
        {paths.map((P, i) => (
          <path
            key={id + i}
            d={P.path}
            fill={"white"}
            stroke={"black"}
            strokeWidth={0.8}
          />
        ))}
      </SVG>
    </>
  );
}
