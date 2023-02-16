/**
 * Some interval arithmetic implementations.
 *
 * Sources:
 * 1. https://web.mit.edu/hyperbook/Patrikalakis-Maekawa-Cho/node45.html
 */

// const { max, min, abs } = Math;

type $I = { x: number; y: number };

const isInterval = (E: any): E is $I => {
  return E !== undefined &&
    E !== null &&
    typeof E["x"] === "number" &&
    typeof E["y"] === "number" &&
    E["x"] <= E["y"];
};

const isEqual = (A: $I, B: $I) => {
  return A.x === B.x && A.y === B.y;
};

const intersection = (A: $I, B: $I) => {
  const { x: a, y: b } = A;
  const { x: c, y: d } = B;
  if (a > d || c > b) {
    return null;
  } else {
    return I(Math.max(a, c), Math.min(b, d));
  }
};

const union = (A: $I, B: $I) => {
  const { x: a, y: b } = A;
  const { x: c, y: d } = B;
  return I(Math.min(a, c), Math.max(b, d));
};

/**
 * Given two intervals A and B,
 * returns A if A precedes B,
 * and B otherwise.
 */
const prec = (A: $I, B: $I) => {
  if (A.y < B.x) return A;
  else return B;
};

/**
 * Given two intervals A and B,
 * returns A if A succeedes B,
 * and B otherwise.
 */
const succ = (A: $I, B: $I) => {
  if (A.y < B.x) return B;
  else return A;
};

/** Returns the width of an interval. */
const width = (A: $I) => {
  return A.y - A.x;
};

/** Returns the absolute value of an interval. */
const abs = (A: $I) => {
  return Math.max(Math.abs(A.x), Math.abs(A.y));
};

/** Performs interval addition. */
const add = (A: $I, B: $I) => {
  const { x: a, y: b } = A;
  const { x: c, y: d } = A;
  return I(a + c, b + d);
};

/** Performs interval subtraction. */
const sub = (A: $I, B: $I) => {
  const { x: a, y: b } = A;
  const { x: c, y: d } = B;
  return I(a - d, b - c);
};

/** Performs interval multiplication. */
const mul = (A: $I, B: $I) => {
  const { x: a, y: b } = A;
  const { x: c, y: d } = B;
  const ac = a * c;
  const ad = a * d;
  const bc = b * c;
  const bd = b * d;
  const min = Math.min(ac, ad, bc, bd);
  const max = Math.max(ac, ad, bc, bd);
  return I(min, max);
};

const div = (A: $I, B: $I) => {
  const { x: a, y: b } = A;
  const { x: c, y: d } = B;
  if (c === 0 || d === 0) return I(NaN, NaN);
  const ac = a / c;
  const ad = a / d;
  const bc = b / c;
  const bd = b / d;
  const min = Math.min(ac, ad, bc, bd);
  const max = Math.max(ac, ad, bc, bd);
  return I(min, max);
};

interface Interval extends $I {
}

function I(x: number, y: number): Interval {
  const state = { x, y };
  return Object.assign(state, {});
}

const k = I(1, 2);
