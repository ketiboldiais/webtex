import { test, expect } from "vitest";
import { ParseJsonDate } from "./ParseJsonDate";

test("should return a Date object", () => {
  // specimen
  const jsonDate1 = JSON.stringify(new Date());
  // expected
  const parsedDate1 = new Date(JSON.parse(jsonDate1));
  // actual
  const result = ParseJsonDate(jsonDate1);

  expect(result).toEqual(parsedDate1);
});
