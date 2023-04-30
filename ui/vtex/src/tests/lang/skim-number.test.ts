import { describe, expect, it } from "vitest";
import { num } from "../../lib/lang";

const numTest = (input: string) => {
  const P = num("real");
  const res = P.run(input);
  const exp = {
    ...res,
    result: input,
    index: input.length,
    erred: false,
  };
  return { res, exp };
};

describe("num", () => {
  it("should parse 0", () => {
    const { res, exp } = numTest("0");
    expect(res).toEqual(exp);
  });
  it("should parse 1", () => {
    const { res, exp } = numTest("1");
    expect(res).toEqual(exp);
  });
  it("should parse -22", () => {
    const { res, exp } = numTest("-22");
    expect(res).toEqual(exp);
  });
  it("should parse 1.2", () => {
    const { res, exp } = numTest("1.2");
    expect(res).toEqual(exp);
  });
  it("should parse -3.85", () => {
    const { res, exp } = numTest("-3.85");
    expect(res).toEqual(exp);
  });
  it("should parse +3", () => {
    const { res, exp } = numTest("-3");
    expect(res).toEqual(exp);
  });
  it("should parse 0.28", () => {
    const { res, exp } = numTest("0.28");
    expect(res).toEqual(exp);
  });
  it("should parse +.25", () => {
    const { res, exp } = numTest("+.25");
    expect(res).toEqual(exp);
  });
  it("should parse 0.002e4", () => {
    const { res, exp } = numTest("0.002e4");
    expect(res).toEqual(exp);
  });
  it("should parse -.2e+4", () => {
    const { res, exp } = numTest("-.2e+4");
    expect(res).toEqual(exp);
  });
  it("should parse -.831", () => {
    const { res, exp } = numTest("-.831");
    expect(res).toEqual(exp);
  });
  it("should parse +2.2", () => {
    const p = num('real');
		const res = p.run('+2.2');
		const exp = {
			...res,
			result: '+2.2'
		}
    expect(res).toEqual(exp);
  });
});

