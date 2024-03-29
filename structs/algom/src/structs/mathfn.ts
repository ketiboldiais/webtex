import { ASTNode } from "../ast/base.js";
import { C } from "../ast/Numerics.js";
import { split } from "./stringfn.js";
export type NativeArgType = "number" | "number-array";
export type CalculiEntry = {
  val: number | Function;
  node?: () => ASTNode;
  argType?: NativeArgType;
};
export type Calculi = { [key: string]: CalculiEntry };
export const lib: Calculi = {
  E: { val: Math.E, node: () => C.e },
  PI: { val: Math.PI, node: () => C.pi },
  LN2: { val: Math.LN2, node: () => C.ln2 },
  LN10: { val: Math.LN10, node: () => C.ln10 },
  SQRT2: { val: Math.SQRT2, node: () => C.sqrt2 },
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
  cos: { val: Math.cos },
  cosh: { val: Math.cosh },
  exp: { val: Math.exp },
  floor: { val: Math.floor },
  fround: { val: Math.fround },
  gcd: { val: GCD },
  hypot: { val: Math.hypot },
  ln: { val: Math.log },
  log: { val: Math.log10 },
  lg: { val: Math.log2 },
  max: { val: Math.max },
  min: { val: Math.min },
  rand: { val: Math.random },
  randInt: { val: randInt },
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

export function randInt(min:number, max:number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
} 

export function avg(...nums: number[]) {
  if (nums === undefined) {
    return 0;
  }
  const L = nums.length;
  let total = sum(...nums);
  return total / L;
}

export function sum(...nums: number[]) {
  if (nums === undefined) {
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
    if (typeof v === "number") return (v % 1 === 0);
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
export type Point = { x: number | null; y: number | null };
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

