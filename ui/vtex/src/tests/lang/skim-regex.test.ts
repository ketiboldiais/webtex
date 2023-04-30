import {it, expect} from "vitest";
import {regex} from "../../lib/lang";

it("should a match 123", () => {
	const src = `123`;
	const p = regex(/^[\d]+/)
	const res = p.run(src);
  const exp = {
		text: src,
		result: `123`,
		index: 3,
		erred: false,
  };
  expect(res).toEqual(exp);
});

