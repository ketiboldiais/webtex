import { describe, expect, it } from "vitest";
import { Engine, Token } from "@/lang";

describe("scan", () => {
  const engine = new Engine();
  const fn = (t: Token) => t.lexeme;

  it("should scan a string.", () => {
    const src = `"hello"`;
    const res = engine.tokenize(src, fn);
		const exp = ['hello', 'END'];
		expect(res).toEqual(exp);
  });
});
