import { expect, it } from "vitest";
import {
  addVector3D,
  coord,
  crossVector3D,
  dotVector3D,
  minusVector3D,
  normVector3D,
  scaleVector3D,
} from "../lib/plot3d/plot3d";

it("should add the 3D vectors component-wise", () => {
  const p1 = coord("3D-cartesian")(0, 1, 2);
  const p2 = coord("3D-cartesian")(3, 0, 5);
  const result = addVector3D(p1, p2);
  expect(result).toEqual({ x: 3, y: 1, z: 7 });
});

it("should subtract the 3D vectors component-wise", () => {
  const p1 = coord("3D-cartesian")(3, 1, 5);
  const p2 = coord("3D-cartesian")(2, 0, 3);
  const result = minusVector3D(p1, p2);
  expect(result).toEqual({ x: 1, y: 1, z: 2 });
});

it("should scale the 3D vectors component-wise", () => {
  const p1 = coord("3D-cartesian")(3, 1, 5);
  const scale = 5;
  const result = scaleVector3D(p1, scale);
  expect(result).toEqual({ x: 15, y: 5, z: 25 });
});

it("should compute the dot product of two 3D vectors.", () => {
  const p1 = coord("3D-cartesian")(3, 1, 5);
  const p2 = coord("3D-cartesian")(2, 4, 1);
  const result = dotVector3D(p1, p2);
  expect(result).toEqual(15);
});

it("should compute the norm of two 3D vectors.", () => {
  const p1 = coord("3D-cartesian")(4, 5, 3);
  const result = normVector3D(p1);
  expect(result).toEqual(Math.sqrt((4 ** 2) + (5 ** 2) + (3 ** 2)));
});

it("should compute the cross product of two 3D vectors.", () => {
  const p1 = coord("3D-cartesian")(1, 0, 0);
  const p2 = coord("3D-cartesian")(3, 2, 4);
  const result = crossVector3D(p1, p2);
  expect(result).toEqual({ x: 0, y: -4, z: 2 });
});
