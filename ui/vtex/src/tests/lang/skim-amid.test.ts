import { expect, it } from "vitest";
import { one, amid } from "../../lib/lang";

it("should return a successful amid-skim", () => {
  const LParen = one('(');
	const RParen = one(')');
	const parend = amid(LParen, RParen);
	const letterX = one('X');
	const P = parend(letterX);
	const res = P.run('(X)');
  const exp = {
		text: '(X)',
		result: 'X',
		index: 3,
		erred: false,
  };
  expect(res).toEqual(exp);
});

