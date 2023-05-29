import { uid } from "../aux";

export interface Circular {
  /**
   * The radius of the circular object.
   */
  radius: number;
  /**
   * Sets the the circular’s
   * {@link Circular.radius|radius}.
   */
  r(radius: number): this;

  /** The circular’s x-coordinate. */
  cx: number;

  /** The circular’s y-coordinate. */
  cy: number;

  /**
   * Sets the circular’s x- and y-coordinates.
   */
  at(coord:[number,number]): this;
}

export function circular<NodeType extends Figure>(
  nodetype: NodeType,
): And<NodeType, Circular> {
  class Circular extends nodetype {
    radius: number = 2;
    cx: number = 0;
    cy: number = 0;
    r(radius: number) {
      this.radius = radius;
      return this;
    }
    at(coord:[number,number]) {
      this.cx = coord[0];
      this.cy = coord[1];
      return this;
    }
  }
  return Circular;
}
