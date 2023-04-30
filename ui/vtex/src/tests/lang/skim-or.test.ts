import { expect, it } from "vitest";
import { one } from "../../lib/lang";

it("should return an array of skims", () => {
  const p1 = one("a");
	const p2 = one('b');
	const P = p1.or(p2);
	const res = P.run('ab');
  const exp = {
		text: 'ab',
		result: 'a',
		index: 1,
		erred: false,
  };
  expect(res).toEqual(exp);
});