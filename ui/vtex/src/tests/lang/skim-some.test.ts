import { expect, it } from "vitest";
import { one, some } from "../../lib/lang";

it("should return the first successful skim", () => {
  const p1 = one("a");
	const p2 = one('b');
	const p3 = one('c');
	const P = some([p1, p3, p2]);
	const res = P.run('cba');
  const exp = {
		text: 'cba',
		result: 'c',
		index: 1,
		erred: false,
  };
  expect(res).toEqual(exp);
});