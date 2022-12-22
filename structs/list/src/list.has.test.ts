import { it, expect } from "vitest";

import { list } from "./index";

it("should detect the argument", () => {
  const List = list(1, 2, 3, 4);
  const result = List.has(1);
  expect(result).toBe(true);
});

it("should detect the prexisting argument", () => {
  const List = list(1, 2, 3, 4, 1);
  const result = List.has(1);
  expect(result).toBe(true);
});

it("should not detect the argument", () => {
  const List = list(1, 2, 3, 4);
  const result = List.has(5);
  expect(result).toBe(false);
});

it("should not detect the argument on an empty list", () => {
  const List = list();
  const result = List.has(5);
  expect(result).toBe(false);
});

it("should detect the object argument", () => {
  const List = list({ val: 1 }, { val: 2 }, { val: 3 });
  const result = List.has({ val: 1 });
  expect(result).toBe(true);
});
