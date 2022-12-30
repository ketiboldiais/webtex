import { it, expect } from "vitest";
import { div } from "./index.js";

it("should perform integer division", () => {
  const result = div(1, 2);
  expect(result).toBe(0);
});
