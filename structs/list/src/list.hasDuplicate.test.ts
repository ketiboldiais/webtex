import { it, expect } from "vitest";

import { list } from "./index";

it("should detect a duplicate", () => {
  const List = list(1, 2, 3, 4);
  const result = List.hasDuplicate(1);
  expect(result).toBe(true);
});

it("should detect a prexisting duplicate", () => {
  const List = list(1, 2, 3, 4, 1);
  const result = List.hasDuplicate(1);
  expect(result).toBe(true);
});

it("should not detect a duplicate", () => {
  const List = list(1, 2, 3, 4);
  const result = List.hasDuplicate(5);
  expect(result).toBe(false);
});

it("should not detect a duplicate on an empty list", () => {
  const List = list();
  const result = List.hasDuplicate(5);
  expect(result).toBe(false);
});

it("should detect a duplicate object", () => {
  const List = list({ val: 1 }, { val: 2 }, { val: 3 });
  const result = List.hasDuplicate({ val: 1 });
  expect(result).toBe(true);
});
