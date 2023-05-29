import { pickSafe } from "../../aux.js";
import { Frame } from "../../warp/frame";
import { colorable } from "../../warp/colorable.js";
import { scalable } from "../../warp/scalable.js";
import { typed } from "../../warp/typed.js";
import { Weaver } from "../../weavers.js";
import { Twine } from "../../weavers.js";
import { textual } from "../../warp/textual.js";
import { circular } from "../../warp/circular.js";
import { arc } from "d3-shape";
import { $Vertex } from "../graph/graph.data.js";

export type Quadrant = "I" | "II" | "III" | "IV" | "origin";

class Vector {
  originX: number = 0;
  originY: number = 0;
  originZ: number = 0;
  quadrant(): Quadrant {
    const x = this.x2;
    const y = this.y2;
    if (x < 0 && y < 0) {
      return "III";
    } else if (x < 0 && 0 < y) {
      return "II";
    } else if (x > 0 && y > 0) {
      return "I";
    } else if (0 < x && y < 0) {
      return "IV";
    } else {
      return "origin";
    }
  }
  style(f: (v: $Vector) => $Plottable) {
    const elements = this.elements;
    return f(vector(elements));
  }
  get z1() {
    return this.originZ;
  }
  get z() {
    return this.z2;
  }
  get z2() {
    return pickSafe(this.elements[2], 0);
  }
  get x1() {
    return this.originX;
  }
  get x() {
    return this.x2;
  }
  get x2() {
    return pickSafe(this.elements[0], 0);
  }
  get y1() {
    return this.originY;
  }
  get y2() {
    return pickSafe(this.elements[1], 0);
  }
  get y() {
    return this.y2;
  }
  /**
   * Returns a copy of the vector.
   */
  clone() {
    const values = [];
    for (let i = 0; i < this.size(); i++) {
      values.push(this.elements[i]);
    }
    return new Vector(values);
  }
  /**
   * Returns true if this vector and the
   * other, provided vector are equal.
   * Two vectors are defined as equal if, and only if,
   *
   * 1. Both vectors have the same {@link Vector.size}, and
   * 2. All members of the vectors are numerically equal.
   *
   * @example
   * ~~~
   * const x = vector(1,2,3,4);
   * const y = vector(1,2,3,4);
   * const z = vector(7,8,3,5);
   * const r1 = x.equals(y); // true
   * const r2 = y.equals(z); // false
   * ~~~
   */
  equals(other: Vector) {
    if (this.size() !== other.size()) return false;
    for (let i = 0; i < this.size(); i++) {
      const a = this.elements[i];
      const b = other.elements[i];
      if (a !== b) return false;
    }
    return true;
  }
  /**
   * Returns the sum of all the elements of this
   * vector.
   */
  sum() {
    let sum = 0;
    for (let i = 0; i < this.size(); i++) {
      const x = this.elements[i];
      sum += x;
    }
    return sum;
  }
  /**
   * Returns the number of elements comprising
   * the vector.
   */
  size() {
    return this.elements.length;
  }
  /**
   * Returns a zero vector of equal
   * {@link Vector.size | size}.
   *
   * @example
   * ~~~
   * const x = vector(1, 2, 3, 4);
   * const y = x.zero(); // y = vector(0, 0, 0, 0);
   * ~~~
   */
  zero() {
    const d = [];
    for (let i = 0; i < this.size(); i++) {
      d.push(0);
    }
    return new Vector(d);
  }

  vx() {
    const x2 = this.x2;
    const x1 = this.x1;
    return x2 - x1;
  }
  vy() {
    const y2 = this.y2;
    const y1 = this.y1;
    return y2 - y1;
  }

  origin(x: number, y: number, z: number = 0) {
    this.originX = x;
    this.originY = y;
    this.originZ = z;
    return this;
  }
  elements: number[];
  constructor(elements: number[]) {
    this.elements = elements;
  }
  arrow: boolean = true;
  line() {
    this.arrow = false;
    return this;
  }
  static of(elements: number[]) {
    return new Vector(elements);
  }
  /**
   * Returns a new vector with its elements negated.
   *
   * @example
   * ~~~
   * const x = vector(1, 2, 3, 4);
   * const y = x.negate(); // y = vector(-1,-2,-3,-4);
   * ~~~
   */
  negate() {
    return this.mul(-1);
  }

  /**
   * Returns the magnitude of this vector.
   *
   * @example
   * ~~~
   * const x = vector(5, -4, 7);
   * const r = x.magnitude(); // ≅ 9.4868
   * ~~~
   */
  magnitude() {
    let sum = 0;
    for (let i = 0; i < this.size(); i++) {
      const x = this.elements[i];
      const xSquared = x ** 2;
      sum += xSquared;
    }
    const m = Math.sqrt(sum);
    return m;
  }

  and(f: (v: Vector) => ($Plottable | $Plottable[])[]) {
    const out = f(this);
    return [this, ...out.flat()];
  }

  /**
   * Returns a new empty vector.
   */
  static empty() {
    return new Vector([]);
  }

  push(x: number) {
    this.elements.push(x);
    return this;
  }

  /**
   * @internal
   * Helper method for performing
   * binary scalar operations.
   */
  scalarOp(value: number, op: (x: number, y: number) => number) {
    const v = Vector.empty();
    for (let i = 0; i < this.elements.length; i++) {
      const x = this.elements[i];
      v.push(op(x, value));
    }
    return v;
  }

  /**
   * Returns the scalar sum of the
   * calling vector and its argument.
   *
   * @example
   * ~~~
   * const x = vector(1, 2, 3, 4);
   * const r = x.minus(1); // r = vector(0, 1, 2, 3);
   * ~~~
   */
  plus(value: number) {
    return this.scalarOp(value, (x, y) => x + y);
  }

  /**
   * Returns the distance between
   * the two vectors. If the vectors
   * do not have the same sizes, returns NaN.
   */
  distance(to: Vector) {
    if (this.size() !== to.size()) {
      return NaN;
    }
    let sum = 0;
    for (let i = 0; i < this.size(); i++) {
      const a = this.elements[i];
      const b = to.elements[i];
      const diff = b - a;
      const diffSquared = diff ** 2;
      sum += diffSquared;
    }
    return Math.sqrt(sum);
  }
  label(value: string | number) {
    return label(value).at(this.midpoint());
  }

  midpoint(): [number, number] {
    const v = this;
    const x = v.x1 + (v.x2 - v.x1) / 2;
    const y = v.y1 + (v.y2 - v.y1) / 2;
    return [x, y];
  }

  /**
   * Returns the dot product of the
   * caller and its argument.
   *
   * @example
   * ~~~
   * const x = vector(3,-2,7);
   * const y = vector(0,4,-1);
   * const r = x.dot(y); // r = -15;
   * ~~~
   */
  dot(other: Vector) {
    const v = this.times(other);
    return v.sum();
  }

  /**
   * Returns the normal of this vector.
   */
  norm() {
    const mag = this.magnitude();
    return this.div(mag);
  }

  /**
   * Returns the pairwise product
   * of the caller and its argument.
   *
   * @example
   * ~~~
   * const x = vector(1, 2, 3, 4);
   * const y = vector(1, 5, 8, 9);
   * const r = x.times(y); // r = vector(1, 10, 24, 36);
   * ~~~
   */
  times(other: Vector | Matrix) {
    if (other instanceof Matrix) {
      if (this.size() !== other.rowcount) return this;
      const vectors = other.vectors;
      const out: number[] = [];
      vectors.forEach((v) => {
        const d = v.times(this);
        const s = d.sum();
        out.push(s);
      });
      return Vector.of(out);
    }
    return this.pairwiseOp(other, (a, b) => a * b);
  }

  /**
   * Returns the vector sum of the
   * calling vector and its argument.
   * If the caller and its argument do not
   * have the same {@link Vector.size},
   * the caller is returned with no addition
   * performed.
   *
   * @example
   * ~~~
   * const x = vector(1, 2, 3, 4);
   * const y = vector(1, 5, 8, 9);
   * const r = x.add(y); // r = vector(2, 7, 11, 13);
   * ~~~
   */
  add(other: Vector) {
    return this.pairwiseOp(other, (a, b) => a + b);
  }

  sub(other: Vector) {
    return this.pairwiseOp(other, (a, b) => a - b);
  }

  pairwiseOp(arg: Vector, op: (x: number, y: number) => number) {
    const vector = Vector.empty();
    if (this.size() !== arg.size()) {
      return this;
    }
    for (let i = 0; i < this.elements.length; i++) {
      const a = this.elements[i];
      const b = arg.elements[i];
      vector.push(op(a, b));
    }
    return vector;
  }

  /**
   * Returns the pair-wise divison of the
   * calling vector and its argument. If
   * the value is 0, no division is performed
   * and the caller is returned.
   *
   * @example
   * ~~~
   * const x = vector(4, 2, 6, 8);
   * const r = x.div(2); // r = vector(2, 1, 3, 4);
   * ~~~
   */
  div(value: number) {
    if (value === 0) return this;
    return this.scalarOp(value, (x, y) => x / y);
  }

  /**
   * Returns the scalar product of the
   * calling vector and its argument.
   *
   * @example
   * ~~~
   * const x = vector(1, 2, 3, 4);
   * const r = x.mul(2); // r = vector(2, 4, 6, 8);
   * ~~~
   */
  mul(value: number) {
    return this.scalarOp(value, (x, y) => x * y);
  }

  /**
   * Returns the scalar difference of the
   * calling vector and its argument.
   *
   * @example
   * ~~~
   * const x = vector(1, 2, 3, 4);
   * const r = x.minus(1); // r = vector(0, 1, 2, 3);
   * ~~~
   */
  minus(value: number) {
    return this.scalarOp(value, (x, y) => x - y);
  }
  map<T>(f: (v: Vector) => T) {
    return f(this);
  }
  element(i: number) {
    const C = this.size();
    const c = (((i - 1) % C) + C) % C;
    return this.elements[c];
  }
  cross(other: Vector) {
    const s1 = this.size();
    const s2 = other.size();
    if (s1 !== 3 || s2 !== 3) return this;
    const x1 = this.x;
    const y1 = this.y;
    const z1 = this.z;
    const x2 = other.x;
    const y2 = other.y;
    const z2 = other.z;
    const x = y1 * z2 - z1 * y2;
    const y = z1 * x2 - x1 * z2;
    const z = x1 * y2 - y1 * x2;
    return new Vector([x, y, z]);
  }
}

export const vector = (res: number[]) => {
  const fig = typed(colorable(Vector));
  return new fig(res).typed("vector2D");
};
export const v = (...res: number[]) => new Vector(res);
export const isVector = (x: any): x is $Vertex => (
  typeof x === "object" &&
  x["type"] === "vector2D"
);

export const distance = (
  vector1: $Vector,
  vector2: $Vector,
  f?: (v: $Vector, distance: number) => $Plottable[],
) => {
  const d = vector1.distance(vector2);
  let v3 = vector([vector2.x, vector2.y, vector2.z]).origin(
    vector1.x,
    vector1.y,
    vector1.z,
  );
  if (f) {
    const x = f(v3, d);
    return [vector1, vector2, ...x];
  }
  return [vector1, vector2, v3];
};
export const ray = (from: [number, number], to: [number, number]) =>
  vector(to).origin(from[0], from[1]);

export const segment = (
  from: [number, number],
  to: [number, number],
) => ray(from, to).line();

export type $Vector = ReturnType<typeof vector>;
export const isVector2D = (node: Weaver): node is $Vector =>
  node.isType("vector2D");

class Angle {
  v1: Vector;
  v2: Vector;
  constructor(v1: Vector, v2: Vector) {
    this.v1 = v1;
    this.v2 = v2;
  }
  value() {
    const v1 = this.v1;
    const v2 = this.v2;
    return Math.acos(
      v1.dot(v2) / (v1.magnitude() * v2.magnitude()),
    );
  }

  /**
   * The inner radius of the angle marker.
   */
  innerRadius: number = 10;

  /**
   * The outer radius of the angle marker.
   */
  outerRadius: number = 10;

  /**
   * Sets the inner or outer radii of the angle
   * marker.
   *
   * @param of - Either:
   * 1. `inner`, which sets the {@link Angle.innerRadius}, or
   * 2. `outer`, which sets the {@link Angle.outerRadius}.
   *
   * @param value - A number corresponding to the radius value.
   */
  radius(of: "inner" | "outer", value: number) {
    if (of === "inner") {
      this.innerRadius = value;
    } else if (of === "outer") {
      this.outerRadius = value;
    }
    return this;
  }
}

export const angle = (v1: Vector, v2: Vector) => {
  const fig = typed(Angle);
  return new fig(v1, v2).typed("angle");
};
export type $Angle = ReturnType<typeof angle>;

export const isAngle = (x: any): x is $Angle =>
  typeof x === "object" && x["type"] === "angle";

class Matrix {
  vectors: ($Vector | Vector)[];
  readonly rowcount: number;
  readonly colcount: number;
  constructor(vectors: ($Vector | Vector)[]) {
    this.vectors = vectors;
    this.rowcount = vectors.length;
    this.colcount = vectors[0]?.size();
  }
  op<T>(f: (x: number, row: number, column: number) => T, init: T) {
    for (let i = 0; i < this.vectors.length; i++) {
      const vector = this.vectors[i];
      for (let j = 0; j < vector.elements.length; j++) {
        const elem = vector.elements[j];
        init = f(elem, i, j);
      }
    }
    return init;
  }
  isSquare() {
    return this.rowcount === this.colcount;
  }
  isDiagonal() {
    let out = true;
    for (let i = 0; i < this.rowcount; i++) {
      const vector = this.vectors[i];
      const elements = vector.elements;
      for (let j = 0; j < elements.length; j++) {
        if (j === i) continue;
        const e = elements[j];
        if (e !== 0) return false;
      }
    }
    return out;
  }
  column(index: number) {
    const R = this.rowcount;
    const out = [];
    for (let i = 1; i <= R; i++) {
      const v = this.row(i);
      out.push(v.element(index));
    }
    return Vector.of(out);
  }
  row(index: number) {
    const R = this.rowcount;
    const r = (((index - 1) % R) + R) % R;
    return this.vectors[r];
  }
  element(row: number, column: number) {
    const R = this.rowcount;
    const r = (((row - 1) % R) + R) % R;
    return this.vectors[r].element(column);
  }
  identity() {
    const out = [];
    for (let i = 0; i < this.rowcount; i++) {
      const v = this.vectors[i];
      const elems = v.elements;
      const es = [];
      for (let j = 0; j < elems.length; j++) {
        let n = 0;
        if (i === j) n = 1;
        es.push(n);
      }
      out.push(es);
    }
    return Matrix.of(out);
  }
  raw() {
    const out: number[][] = [];
    this.vectors.forEach((v) => {
      out.push(v.elements);
    });
    return out;
  }
  string() {
    const vals = this.raw().map((n) => "[" + n.join(", ") + "]\r");
    return vals.join("");
  }
  static of(nums: number[][]) {
    const out: Vector[] = [];
    nums.forEach((ns) => out.push(v(...ns)));
    return matrix(out);
  }
  transpose() {
    const out = [];
    for (let i = 0; i < this.rowcount; i++) {
      out.push([] as number[]);
    }
    for (let i = 0; i < this.rowcount; i++) {
      const vector = this.vectors[i];
      const elements = vector.elements;
      for (let j = 0; j < elements.length; j++) {
        out[j][i] = elements[j];
      }
    }
    return Matrix.of(out);
  }
  scalarOp(value: number, op: (x: number, y: number) => number) {
    const out: number[][] = [];
    this.vectors.forEach((v) => out.push(v.scalarOp(value, op).elements));
    return Matrix.of(out);
  }
  times(scalar: number) {
    return this.scalarOp(scalar, (a, b) => a * b);
  }
  plus(scalar: number) {
    return this.scalarOp(scalar, (a, b) => a + b);
  }
  minus(scalar: number) {
    return this.scalarOp(scalar, (a, b) => a - b);
  }
  negate() {
    return this.times(-1);
  }
  mul(that: Matrix) {
    const this_vectors = this.vectors;
    const that_vectors = that.vectors;
    const this_R = this.rowcount;
    const that_R = that.rowcount;
    const this_C = this.colcount;
    const that_C = that.colcount;
    if (this_C !== that_R) return this;
    const data = [];
    for (let i = 0; i < this_R; i++) {
      data.push([] as number[]);
    }
    for (let r = 0; r < this_R; r++) {
      for (let c = 0; c < that_C; c++) {
        data[r][c] = 0;
        for (let i = 0; i < this_C; i++) {
          const a = this_vectors[r].elements[i];
          const b = that_vectors[i].elements[c];
          data[r][c] += a * b;
        }
      }
    }
    return Matrix.of(data);
  }
}

export const matrix = (elements: ($Vector | Vector)[]) => {
  const fig = Matrix;
  return new fig(elements);
};

export class Point {
  /** The point’s label, if any. */
  pointLabel?: string;

  /** The point label’s x-position. */
  labelX?: number;

  /** The point label’s y-position. */
  labelY?: number;
  constructor(label?: string) {
    this.pointLabel = label;
  }
  label(value: string = "") {
    this.pointLabel = value;
    return this;
  }
  render: boolean = true;
  noDot() {
    this.render = false;
    return this;
  }
}

export const point = (x: number, y: number) => {
  const fig = typed(textual(colorable(circular(Point))));
  return new fig().at([x, y]).typed("point");
};

export const label = (text: string | number) => ({
  at: (pos: [number, number]) => point(pos[0], pos[1]).label(`${text}`).noDot(),
});

export type $Point = ReturnType<typeof point>;
export const isPoint = (node: Weaver): node is $Point => node.isType("point");

export class Plane extends Frame {
  children: $Plottable[];
  constructor(children: $Plottable[]) {
    super();
    this.children = children;
  }
  /**
   * If set, renders grid lines on the plane.
   */
  gridLines?: "x" | "y" | "xy";

  /**
   * Sets the {@link Plane.gridLines}.
   * @param on - One of:
   *
   * 1. `x` sets x-axis gridlines.
   * 2. `y` sets y-axis gridlines.
   * 3. `xy` sets x- and y-axis gridlines.
   *
   * The default value is `xy`.
   */
  grid(on: "x" | "y" | "xy" = "xy") {
    this.gridLines = on;
    return this;
  }

  /**
   * The number of samples to generate
   * for the plot render. A higher value
   * will generate sharper renderings at
   * the cost of performance and memory.
   * Capped at 1000, and defaults to 250.
   */
  sampleCount: number = 250;

  /**
   * Sets the {@link Plane.sampleCount}.
   * If set, all children of type {@link $Plot}
   * will have their sample counts properties
   * set to the provided value if they aren’t
   * already set.
   */
  samples(value: number) {
    if (value < 0 && value < 1000) {
      this.sampleCount = pickSafe(this.sampleCount, value);
    }
    return this;
  }
}

type PlaneProps = ($Plottable | Vector | Vector[] | $Plottable[])[];

/**
 * Returns a new renderable {@link Plane}.
 * All renderable planes are:
 *
 * 1. {@link scalable},
 * 2. {@link typed} `"plane"`
 */
export const plane = (...children: PlaneProps) => {
  const data: $Plottable[] = children.flat().map((d) => {
    if (d instanceof Vector && (d as any)["type"] !== "vector2D") {
      return vector([d.x, d.y, d.x]);
    } else {
      return d as $Plottable;
    }
  });
  const fig = scalable(typed(Plane));
  return new fig(data).typed("plane");
};

/**
 * A renderable plane.
 */
export type $Plane = ReturnType<typeof plane>;

export const isPlane = (node: Twine): node is $Plane => node.type === "plane";

export class Plot {
  children: $Integral[] = [];
  /**
   * The function’s definition.
   * Definitions must take the form:
   * ```
   * <id1>(<id2>) = <id2> | <expression>
   * ```
   * For example:
   * ~~~
   * f(x) = cos(x);
   * ~~~
   */
  def: string;

  /**
   * The number of samples to generate
   * for the plot render. A higher value
   * will generate sharper renderings at
   * the cost of performance and memory.
   * Capped at 1000.
   */
  sampleCount?: number;

  /**
   * Sets the {@link Plot.sampleCount}.
   */
  samples(value: number) {
    if (value < 0 && value < 1000) {
      this.sampleCount = pickSafe(this.sampleCount, value);
    }
    return this;
  }

  constructor(def: string) {
    this.def = def;
  }

  /**
   * Includes a subchild of this plot.
   * Valid subchildren include:
   *
   * 1. {@link $Integral|integrals},
   */
  and(child: $Integral) {
    this.children.push(child);
    return this;
  }
}

export class Integral {
  /** The integral’s upper bound. */
  lowerBound: number;
  /** The integral’s lower bound. */
  upperBound: number;
  area: string = "";
  constructor(lower: number, upper: number) {
    this.lowerBound = lower;
    this.upperBound = upper;
  }
}

export const integral = (lowerBound: number, upperBound: number) => {
  const fig = typed(colorable(Integral));
  return new fig(lowerBound, upperBound).typed("integral");
};

export type $Integral = ReturnType<typeof integral>;

export const isIntegral = (node: Weaver): node is $Integral =>
  node.isType("integral");

/**
 * Creates a new renderable {@link Plot}.
 * All renderable plots are:
 *
 * 1. {@link scalable}.
 * 2. {@link typed} `"plot"`.
 *
 * @param definition
 * - The function’s {@link Plot.def|definition}.
 */
export const plot = (definition: string) => {
  const fig = scalable(typed(colorable(Plot)));
  return new fig(definition).typed("plot");
};

/**
 * A renderable {@link Plot}.
 */
export type $Plot = ReturnType<typeof plot>;

export const isPlot = (node: $Plottable): node is $Plot => {
  return node.isType("plot");
};

export class Axis {
  /**
   * The direction of this axis.
   * Either `x` or `y`.
   */
  readonly direction: Direction2D;
  constructor(direction: Direction2D) {
    this.direction = direction;
  }
  /**
   * Returns true if this axis is
   * of the provided direction, `"x"`
   * or `"y"`, false otherwise.
   */
  is(direction: Direction2D) {
    return this.direction === direction;
  }
}

/**
 * Returns a new, renderable Axis2D.
 *
 * @param direction - The direction of this
 * axis, either `"x"` or `"y"`.
 */
export const axis = (direction: Direction2D) => {
  const fig = typed(scalable(colorable(Axis)));
  return new fig(direction).typed("axis");
};

/**
 * Returns true if the node passed is of renderable
 * type `"axis"`.
 */
/* prettier-ignore */
export const isAxis = (
  node: $Plottable,
): node is $Axis => node.isType("axis");

/**
 * A renderable {@link Axis}.
 */
export type $Axis = ReturnType<typeof axis>;

export type $Plottable = $Plot | $Axis | $Point | $Vector | $Angle;
