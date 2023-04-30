import { expect, it } from "vitest";
import { one, sepby } from "../../lib/lang";

it("should return a list of letters X", () => {
	const src = `X,X,X`;
  const comma = one(',');
	const commaSeparated = sepby(comma);
	const X = one('X');
	const P = commaSeparated(X);
	const res = P.run(src);
  const exp = {
		text: src,
		result: ['X','X','X'],
		index: 5,
		erred: false,
  };
  expect(res).toEqual(exp);
});

