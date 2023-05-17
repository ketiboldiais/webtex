import { describe, expect, it } from "vitest";
import { env } from "@/lang/env";
import { sym } from "../../lib/lang/nodes/symbol.node.js";
import { T } from "@/lang/utils";
import {right} from "@/lang/aux/either.js";
const s = (x: string) => sym(T(x));

describe("env", () => {
  it("should define", () => {
    const E = env();
    E.define("x", 2);
    const R = {
			record: {x: 2},
			parent: null,
		};
    expect(E).toEqual(R);
  });
  it("should return false on has", () => {
    const E = env();
    E.define("g", 2);
    const R = false;
    const A = E.has("x");
    expect(A).toEqual(R);
  });
  it("should return true on has", () => {
    const E = env();
    E.define("x", 2);
    const R = true;
    const A = E.has("x");
    expect(A).toEqual(R);
  });
  it("should return the saved value", () => {
    const E = env();
    E.define("x", 2);
    const A = E.get(s('x'));
    const R = right(2);
    expect(A).toEqual(R);
  });
});
