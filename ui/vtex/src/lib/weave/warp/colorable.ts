import { pickSafe } from "../aux";

export interface Colorable {
  /**
   * The renderable node’s stroke color.
   */
  strokeColor?: string;

  /**
   * Sets the renderable node’s stroke color.
   */
  stroke(color: string): this;

  /**
   * The renderable node’s fill color.
   */
  fillColor?: string;

  /**
   * Sets the renderable node’s fill color.
   */
  fill(color: string): this;

  /**
   * The renderable node’s stroke width
   * (how thick the node’s outline is).
   */
  strokeWidth?: number;

  /**
   * Sets the renderable node’s stroke width.
   */
  sw(value: number): this;

  /**
   * The renderable node’s dash property.
   * If 0, a solid line is shown.
   */
  strokeDashArray?: number;

  /**
   * Sets the renderable node’s dash property.
   */
  dash(value: number): this;

  /**
   * The renderable node’s opacity, a number
   * between 0 and 1. Values tending towards 0
   * appear more transparent, and values tending
   * towards 1 less transparent.
   */
  opacityValue?: number;
  opacity(value: number): this;
}

export function colorable<NodeType extends Figure>(
  nodetype: NodeType,
): And<NodeType, Colorable> {
  class Colorable extends nodetype {
    opacityValue?: number;
    opacity(value: number) {
      this.opacityValue = pickSafe(this.opacityValue, value);
      return this;
    }
    strokeColor?: string;
    stroke(color: string): this {
      this.strokeColor = pickSafe(this.strokeColor, color);
      return this;
    }
    fillColor?: string;
    /**
     * Sets the renderable node’s fill color.
     */
    fill(color: string): this {
      this.fillColor = pickSafe(this.fillColor, color);
      return this;
    }

    /**
     * The renderable node’s stroke width
     * (how thick the node’s outline is).
     */
    strokeWidth?: number;

    /**
     * Sets the renderable node’s stroke width.
     */
    sw(value: number): this {
      this.strokeWidth = pickSafe(this.strokeWidth, value);
      return this;
    }

    /**
     * The renderable node’s dash property.
     * If 0, a solid line is shown.
     */
    strokeDashArray?: number;

    /**
     * Sets the renderable node’s dash property.
     */
    dash(value: number): this {
      this.strokeDashArray = pickSafe(this.strokeDashArray, value);
      return this;
    }
  }
  return Colorable;
}
