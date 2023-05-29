import { describe, expect, it } from "vitest";
import { vector } from "@/weave/weft/plot/plot.data";

describe("vector", () => {
  it("should equal the other vector", () => {
    const x = vector(1, 2, 3, 4);
    const y = vector(1, 2, 3, 4);
    const r = x.equals(y);
    expect(r).toBe(true);
  });
  it("should not equal the other vector", () => {
    const x = vector(1, 2, 3, 4);
    const y = vector(4, 2, 3, 8);
    const r = x.equals(y);
    expect(r).toBe(false);
  });
  it("should return an equally sized zero", () => {
    const x = vector(1, 2, 3, 4);
    const y = x.zero();
    const r = vector(0, 0, 0, 0);
    expect(y).toEqual(r);
  });
  it("should return a negated vector", () => {
    const x = vector(1, 2, 3, 4);
    const y = x.negate();
    const r = vector(-1, -2, -3, -4);
    expect(y).toEqual(r);
  });
  it("should perform scalar subtraction", () => {
    const x = vector(1, 2, 3, 4);
    const r = x.minus(1);
    const e = vector(0, 1, 2, 3);
    expect(r).toEqual(e);
  });
  it("should perform scalar addition", () => {
    const x = vector(1, 2, 3, 4);
    const r = x.plus(2);
    const e = vector(3, 4, 5, 6);
    expect(r).toEqual(e);
  });
  it("should perform pairwise divison", () => {
    const x = vector(2, 4, 8, 10);
    const r = x.div(2);
    const e = vector(1, 2, 4, 5);
    expect(r).toEqual(e);
  });
  it("should perform scalar multiplication", () => {
    const x = vector(1, 2, 3, 4);
    const r = x.mul(2);
    const e = vector(2, 4, 6, 8);
    expect(r).toEqual(e);
  });
  it("should perform vector addition", () => {
    const x = vector(1, 2, 3, 4);
    const y = vector(1, 5, 8, 9);
    const r = x.add(y);
    const e = vector(2, 7, 11, 13);
    expect(r).toEqual(e);
  });
  it("should return the dot product of the vector", () => {
    const x = vector(3,-2,7);
    const y = vector(0,4,-1);
    const r = x.dot(y);
    const e = -15;
    expect(r).toEqual(e);
  });
  it("should perform pairwise mutliplication", () => {
    const x = vector(1, 2, 3, 4);
    const y = vector(1, 5, 8, 9);
    const r = x.times(y);
    const e = vector(1, 10, 24, 36);
    expect(r).toEqual(e);
  });
  it("should return the caller on unequal lengths", () => {
    const x = vector(1, 2, 3, 4);
    const y = vector(1, 5, 8);
    const r = x.add(y);
    const e = vector(1, 2, 3, 4);
    expect(r).toEqual(e);
  });
  it("should return the magnitude of the vector", () => {
    const x = vector(5, -4, 7);
    const r = x.magnitude();
    const e = Math.sqrt((5 ** 2) + ((-4) ** 2) + (7 ** 2));
    expect(r).toEqual(e);
  });
  it("should return the norm of the vector", () => {
    const x = vector(12, -5);
    const r = x.norm();
    const a = x.magnitude();
    const e = vector(12 / a, -5 / a);
    expect(r).toEqual(e);
  });
});
