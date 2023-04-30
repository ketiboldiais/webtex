import { expect, it } from "vitest";
import { list, one } from "../../lib/lang";

it("should return an array of skims", () => {
  const p1 = one("a");
	const p2 = one('b');
	const p3 = one('c');
	const P = list([p1, p2, p3])
	const res = P.run('abc');
  const exp = {
		text: 'abc',
		result: ['a', 'b', 'c'],
		index: 3,
		erred: false,
  };
  expect(res).toEqual(exp);
});