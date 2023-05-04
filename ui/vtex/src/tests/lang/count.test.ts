import { describe, expect, it } from "vitest";
import { difl, difr, mod, product, quot, sum } from "@/lang";

describe("count", () => {
  it("should compute a sum.", () => {
    const x = sum(1, 2, 3, 4);
    const res = 10;
    expect(x).toEqual(res);
  });

  it("should compute a left-difference of 3 arguments.", () => {
    const x = difl(5, 4, 3);
    const res = -2;
    expect(x).toEqual(res);
  });

  it("should compute a left-difference of 5 arguments.", () => {
    const x = difl(5, 4, 3, 2, 1);
    const res = -5;
    expect(x).toEqual(res);
  });

  it("should compute a right-difference of 5 arguments.", () => {
    const x = difr(5, 4, 3, 2, 1);
    const res = -13;
    expect(x).toEqual(res);
  });

  it("should compute a right-difference of 1 argument.", () => {
    const x = difr(5);
    const res = 5;
    expect(x).toEqual(res);
  });

  it("should compute a product of 4 arguments.", () => {
    const x = product(3, 4, 2, 5);
    const res = 120;
    expect(x).toEqual(res);
  });

  it("should compute an integer quotient.", () => {
    const x = quot(2, 3);
    const res = 0;
    expect(x).toEqual(res);
  });

  it("should compute an integer quotient.", () => {
    const x = quot(-2, 3);
    const res = -1;
    expect(x).toEqual(res);
  });

  it("should compute an integer quotient.", () => {
    const x = quot(-9, 2);
    const res = -5;
    expect(x).toEqual(res);
  });

  it("should compute 5 mod 22.", () => {
    const x = mod(5, 22);
    const res = 5;
    expect(x).toEqual(res);
  });

  it("should compute 25 mod 22.", () => {
    const x = mod(25, 22);
    const res = 3;
    expect(x).toEqual(res);
  });

  it("should compute -1 mod 22.", () => {
    const x = mod(-1, 22);
    const res = 21;
    expect(x).toEqual(res);
  });

  it("should compute -2 mod 22.", () => {
    const x = mod(-2, 22);
    const res = 20;
    expect(x).toEqual(res);
  });

  it("should compute 0 mod 22.", () => {
    const x = mod(0, 22);
    const res = 0;
    expect(x).toEqual(res);
  });

  it("should compute -1 mod 22.", () => {
    const x = mod(-1, 22);
    const res = 21;
    expect(x).toEqual(res);
  });

  it("should compute -21 mod 22.", () => {
    const x = mod(-21, 22);
    const res = 1;
    expect(x).toEqual(res);
  });

  it("should compute -13 mod 64.", () => {
    const x = mod(-13, 64);
    const res = 51;
    expect(x).toEqual(res);
  });
});
