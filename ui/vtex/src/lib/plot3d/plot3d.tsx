export type CoordinateType =
  | "3D-cartesian"
  | "3D-cylindrical"
  | "3D-spherical";

type Point3D = { x: number; y: number; z: number };

export function coord(type: CoordinateType) {
  switch (type) {
    case "3D-cartesian":
      return (x: number, y: number, z: number) => ({ x, y, z });
    case "3D-spherical":
      return (r: number, theta: number, phi: number) => ({
        x: r * (Math.sin(theta)) * (Math.cos(phi)),
        y: r * (Math.sin(theta)) * (Math.sin(phi)),
        z: r * (Math.cos(theta)),
      });
    case "3D-cylindrical":
      return (rho: number, theta: number, z: number) => ({
        x: rho * Math.cos(theta),
        y: rho * Math.sin(theta),
        z,
      });
  }
}

export function vector3DOp<t>(
  p1: Point3D,
  p2: Point3D,
  callback: (
    x1: number,
    y1: number,
    z1: number,
    x2: number,
    y2: number,
    z2: number,
  ) => t,
) {
  const { x: x1, y: y1, z: z1 } = p1;
  const { x: x2, y: y2, z: z2 } = p2;
  return callback(x1, y1, z1, x2, y2, z2);
}

export function addVector3D(p1: Point3D, p2: Point3D) {
  return vector3DOp(
    p1,
    p2,
    (x1, y1, z1, x2, y2, z2) => ({
      x: x1 + x2,
      y: y1 + y2,
      z: z1 + z2,
    }),
  );
}

export function minusVector3D(p1: Point3D, p2: Point3D) {
  return vector3DOp(
    p1,
    p2,
    (x1, y1, z1, x2, y2, z2) => ({
      x: x1 - x2,
      y: y1 - y2,
      z: z1 - z2,
    }),
  );
}

export function scaleVector3D(point: Point3D, scale: number) {
  const { x: Px, y: Py, z: Pz } = point;
  return {
    x: Px * scale,
    y: Py * scale,
    z: Pz * scale,
  };
}

export function dotVector3D(p1: Point3D, p2: Point3D) {
  return vector3DOp(
    p1,
    p2,
    (x1, y1, z1, x2, y2, z2) => (
      (x1 * x2) + (y1 * y2) + (z1 * z2)
    ),
  );
}

export function normVector3D(point: Point3D) {
  const { x, y, z } = point;
  const x2 = x ** 2;
  const y2 = y ** 2;
  const z2 = z ** 2;
  const xyz = x2 + y2 + z2;
  return Math.sqrt(xyz);
}

export function crossVector3D(p1: Point3D, p2: Point3D) {
  return vector3DOp(
    p1,
    p2,
    (x1, y1, z1, x2, y2, z2) => ({
      x: (y1 * z2) - (z1 * y2),
      y: (z1 * x2) - (x1 * z2),
      z: (x1 * y2) - (y1 * x2),
    }),
  );
}
