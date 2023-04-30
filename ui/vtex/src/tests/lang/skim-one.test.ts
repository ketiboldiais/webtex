import { expect, it } from "vitest";
import { erratum, one } from "../../lib/lang";

it("should parse one character", () => {
  const p = one("1");
  const res = p.run("1");
  const exp = {
    index: 1,
    result: "1",
		text: '1',
    erred: false,
  };
  expect(res).toEqual(exp);
});

it("should return an error", () => {
  const p = one("1");
  const res = p.run("2");
	const msg = `Expected 1, got 2`
	const E = erratum('char', msg);
  const exp = {
    index: 0,
    result: null,
		text: '2',
		error: E,
    erred: true,
  };
  expect(res).toEqual(exp);
});
