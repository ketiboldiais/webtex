import { expect, it } from "vitest";
import { writeFile, readFile } from "./index";

it("should read sam@gmail.com", async () => {
  const exp = "sam@gmail.com";
  const response = await readFile("../test.txt");
  expect(response).toEqual(exp);
});

it("should return true", async () => {
  const data = "\njohn@gmail.com";
  const response = await writeFile("../test.txt", data);
  expect(response).toEqual(true);
});
