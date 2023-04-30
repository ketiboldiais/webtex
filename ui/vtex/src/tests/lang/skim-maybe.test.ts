import { expect, it } from "vitest";
import { one, maybe } from "../../lib/lang";

it("should return a successful maybe-skim", () => {
  const p1 = one("a");
	const P = maybe(p1)
	const res = P.run('abc');
  const exp = {
		text: 'abc',
		result: 'a',
		index: 1,
		erred: false,
  };
  expect(res).toEqual(exp);
});

it("should return an unerred, unsuccessful maybe-skim", () => {
  const p1 = one("a");
	const P = maybe(p1)
	const res = P.run('bca');
  const exp = {
		text: 'bca',
		result: null,
		index: 0,
		erred: false,
  };
  expect(res).toEqual(exp);
});