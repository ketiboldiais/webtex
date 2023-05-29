import {
  ScaleLinear,
  scaleLinear,
  scaleLog,
  ScaleLogarithmic,
  scalePow,
  ScalePower,
  ScaleRadial,
  scaleRadial,
} from "d3";
import { tuple } from "../aux.js";

export type ScaleName = "linear" | "power" | "log" | "radial";
export type LinearScale = ScaleLinear<number, number, never>;
export type PowerScale = ScalePower<number, number, never>;
export type RadialScale = ScaleRadial<number, number, never>;
export type LogScale = ScaleLogarithmic<number, number, never>;

export type Scaler =
  | LinearScale
  | PowerScale
  | RadialScale
  | LogScale;

export interface Scalable {
  /** The scalable’s domain. */
  domain: [N, N];

  /** The scalable’s range. */
  range: [N, N];

  /** Sets the scalable’s domain. */
  dom(xmin: number, xmax: number): this;

  /** Sets the scalable’s range. */
  ran(ymin: number, ymax: number): this;

  /**
   * Returns a scale function based on
   * the scalable’s width, height, and margins.
   *
   * @param type - A string-value scale name:
   * 1. `"linear"` - Returns a linear scale.
   * 2. `"power"` - Returns a power scale.
   * 3. `"log"` - Returns a log scale.
   * 4. `"radial"` - Returns a radial scale.
   */
  scale(type: ScaleName): Scaler;
}

/**
 * Returns a scalable form of the provided nodetype.
 */
export function scalable<NodeType extends Figure>(
  nodetype: NodeType,
): And<NodeType, Scalable> {
  class Scalable extends nodetype {
    domain: [N, N] = [-5, 5];
    range: [N, N] = [-5, 5];
    dom(xmin: number, xmax: number) {
      this.domain = tuple(xmin, xmax);
      return this;
    }
    ran(ymin: number, ymax: number) {
      this.range = tuple(ymin, ymax);
      return this;
    }
    scale(type: ScaleName) {
      const domain = this.domain;
      const range = this.range;
      switch (type) {
        case "linear":
          return scaleLinear().domain(domain).range(range);
        case "log":
          return scaleLog().domain(domain).range(range);
        case "power":
          return scalePow().domain(domain).range(range);
        case "radial":
          return scaleRadial().domain(domain).range(range);
        default:
          return scaleLinear().domain(domain).range(range);
      }
    }
  }
  return Scalable;
}
