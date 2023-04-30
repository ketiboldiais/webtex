import { expect, it } from "vitest";
import { one } from "../../lib/lang";

it("should return a successful mapping", () => {
  const p1 = one("a");
	const P = p1.map((result)=>([result]));
	const res = P.run('abc');
  const exp = {
		text: 'abc',
		result: ['a'],
		index: 1,
		erred: false,
  };
  expect(res).toEqual(exp);
});