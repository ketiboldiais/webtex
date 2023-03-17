import { ASTNode, NUM, Num } from "../nodes/index.js";
import { split } from "./stringfn.js";
export type NativeArgType = "number" | "number-array";
export type CalculiEntry = {
  val: number | Function;
  node?: () => ASTNode;
  argType?: NativeArgType;
};
export type Calculi = { [key: string]: CalculiEntry };
export const lib: Calculi = {
  e: { val: Math.E, node: () => new Num(Math.E, NUM.FLOAT) },
  pi: { val: Math.PI, node: () => new Num(Math.PI, NUM.FLOAT) },
  LN2: { val: Math.LN2, node: () => new Num(Math.PI, NUM.FLOAT) },
  LN10: { val: Math.LN10, node: () => new Num(Math.LN10, NUM.FLOAT) },
  LOG2E: { val: Math.LOG2E, node: () => new Num(Math.LOG2E, NUM.FLOAT) },
  LOG10E: { val: Math.LOG10E, node: () => new Num(Math.LOG10E, NUM.FLOAT) },
  SQRT1_2: { val: Math.SQRT1_2, node: () => new Num(Math.SQRT1_2, NUM.FLOAT) },
  SQRT2: { val: Math.SQRT2, node: () => new Num(Math.SQRT2, NUM.FLOAT) },
  abs: { val: Math.abs },
  acos: { val: Math.acos },
  acosh: { val: Math.acosh },
  asin: { val: Math.asin },
  asinh: { val: Math.asinh },
  atan: { val: Math.atan },
  atanh: { val: Math.atanh },
  atan2: { val: Math.atan2 },
  cbrt: { val: Math.cbrt },
  ceil: { val: Math.ceil },
  clz32: { val: Math.clz32 },
  cos: { val: Math.cos },
  cosh: { val: Math.cosh },
  exp: { val: Math.exp },
  expm1: { val: Math.expm1 },
  floor: { val: Math.floor },
  fround: { val: Math.fround },
  gcd: { val: GCD },
  hypot: { val: Math.hypot },
  imul: { val: Math.imul },
  log: { val: Math.log },
  ln: { val: Math.log },
  log1p: { val: Math.log1p },
  log10: { val: Math.log10 },
  log2: { val: Math.log2 },
  lg: { val: Math.log2 },
  max: { val: Math.max },
  min: { val: Math.min },
  pow: { val: Math.pow },
  random: { val: Math.random },
  round: { val: Math.round },
  sign: { val: Math.sign },
  sin: { val: Math.sin },
  sinh: { val: Math.sinh },
  sqrt: { val: Math.sqrt },
  tan: { val: Math.tan },
  tanh: { val: Math.tanh },
  trunc: { val: Math.trunc },
  even: { val: even },
  odd: { val: odd },
  range: { val: range },
  sum: { val: sum },
  avg: { val: avg },
};

export function avg(...nums: number[]) {
  if (nums===undefined) {
    return 0;
  }
  const L = nums.length;
  let total = sum(...nums);
  return total / L;
}

export function sum(...nums: number[]) {
  if (nums===undefined) {
    return 0;
  }
  const L = nums.length;
  let s = 0;
  for (let i = 0; i < L; i++) {
    s += nums[i];
  }
  return s;
}

export function range(start: number, end: number, step: number) {
  const out: number[] = [];
  for (let i = start; i < end; i += step) {
    out.push(i);
  }
  return out;
}
export const is = {
  func: (v: any): v is Function => typeof v === "function",
  obj: (v: any): v is Object => typeof v === "object",
  number: (v: any): v is number => typeof v === "number",
  string: (v: any): v is string => typeof v === "number",
  bool: (v: any): v is boolean => typeof v === "boolean",
  integer: (v: any) => {
    if (typeof v === "number") return Number.isInteger(v);
    return Number.parseInt(v);
  },
};
export function polar(f: Function, domain: [number, number]) {
  let points: [number, number][] = [];
  for (let i = domain[0]; i < domain[1]; i += 0.01) {
    const point = [i, f(i)];
    points.push(point as [number, number]);
  }
  return points;
}
export function xy(
  f: Function,
  xDomain: [number, number],
  yDomain: [number, number],
  scale = 1,
) {
  const xMin = xDomain[0];
  const xMax = xDomain[1];
  const yMin = yDomain[0];
  const yMax = yDomain[1];
  const xys: (number[])[] = [];
  for (let x = xMin; x < xMax; x++) {
    let f0: number[] = [];
    xys.push(f0);
    for (let y = yMin; y < yMax; y++) {
      f0.push(f(x, y) * scale);
    }
  }
  return xys;
}
export function parametric(
  fx: Function,
  fy: Function,
  domain: [number, number],
  samples: number,
) {
  const dataset: Point[] = [];
  const xMax = domain[1] * Math.PI;
  for (let i = -samples; i < samples; i++) {
    let t = (((i) * Math.PI) / samples) * xMax;
    let x = fx(t);
    let y = fy(t);
    let point: Point = { x, y };
    if (isNaN(y)) {
      point.y = null;
    }
    if (isNaN(x)) {
      point.x = null;
    }
    dataset.push(point);
  }
  return dataset;
}
export type Point = { x: number | null; y: number | null };
export function y(
  f: Function,
  range: [number, number],
  domain: [number, number],
  samples: number,
) {
  let dataset: Point[] = [];
  let x: number;
  let y: number;
  const yMin = range[0] * 2;
  const yMax = range[1] * 2;
  const xMax = domain[1];
  for (let i = -samples; i < samples; i++) {
    x = (i / samples) * xMax;
    y = f(x);
    const point: Point = { x, y };
    if (Number.isNaN(y) || y <= yMin || y >= yMax) {
      point.y = null;
    }
    if (x < domain[0] || domain[1] < x) {
      continue;
    } else {
      dataset.push(point);
    }
  }
  return dataset;
}

export function even(n: number) {
  return n % 2 === 0 ? 1 : 0;
}
export function odd(n: number) {
  return n % 2 !== 0 ? 1 : 0;
}

export function GCD(a: number, b: number) {
  if (!is.integer(a) || !is.integer(b)) {
    return Infinity;
  }
  let t = 1;
  while (b !== 0) {
    t = b;
    b = a % b;
    a = t;
  }
  return a;
}

export function sgn(x: number) {
  return x === 0 ? 0 : x > 0 ? 1 : -1;
}

export function getFrac(n: string) {
  const [a, b] = split(n, "/");
  const x = Number.parseInt(a);
  const y = Number.parseInt(b);
  return [x, y];
}
