/**
 * @file This file contains helper methods
 * for the renderers.
 */

/**
 * Give two values of type `T`,
 * returns the _safer_ value of the two.
 * A safe value is any value that:
 *
 * 1. is not null,
 * 2. is not undefined,
 * 3. is not the empty string, and
 * 4. is not NaN.
 *
 * If both values are safe, picks the first.
 */
export const pickSafe = <T>(
  value: null | undefined | T,
  fallback: T
) =>
  value !== undefined &&
  value !== null &&
  value !== "" &&
  !Number.isNaN(value)
    ? (value as unknown as T)
    : (fallback as unknown as T);

/**
 * Returns a tuple of type `T`.
 */
export const tuple = <T extends any[]>(...data: T) => data;

/**
 * Returns true if the provided value
 * is undefined.
 */
export const dne = (value: any): value is undefined =>
  value === undefined;

/**
 * Returns a `translate` string for use with the `g`
 * element.
 */
export const shift = (x: number = 0, y: number = 0) =>
  `translate(${x},${y})`;

export function uid(length: number = 4, base = 36) {
  return Math.random()
    .toString(base)
    .replace(/[^a-z]+/g, "")
    .substring(0, length + 1);
}

type Primitive =
  | "string"
  | "number"
  | "bigint"
  | "boolean"
  | "symbol"
  | "undefined"
  | "object"
  | "function";

export const ensure = <T>(
  type: Primitive,
  subject: any,
  fallback: T
) => (typeof subject === type ? (subject as T) : fallback);

export const is = {
  STRING: (value: any): value is string => typeof value === "string",
  NUMBER: (value: any): value is number => typeof value === "number",
  BIGINT: (value: any): value is bigint => typeof value === "bigint",
  BOOL: (value: any): value is boolean => typeof value === "boolean",
  SYM: (value: any): value is symbol => typeof value === "symbol",
  UNDEFINED: (value: any): value is undefined => value === undefined,
  NULL: (value: any): value is null => value === null,
  OBJECT: (value: any): value is object => typeof value === "object",
  FUNCTION: (value: any): value is Function =>
    typeof value === "function",
};

export const from = (i1: number) => ({
  to: (i2: number) => ({
    step: (x: number) => {
      const out = [];
      for (let i = i1; i < i2; i += x) {
        out.push(i);
      }
      return out;
    },
  }),
});

export const rand = (min: number, max: number) =>
  Math.random() * (max - min) + min;

export const rotate = (value: number, x?:number, y?:number) => (x && y) ? (`rotate(${value},${x},${y})`) : `rotate(${value})`;

export const toDeg = (radians: number) => radians * (180 / Math.PI);
export const toRadians = (degrees: number) =>
  degrees * (Math.PI / 180);
