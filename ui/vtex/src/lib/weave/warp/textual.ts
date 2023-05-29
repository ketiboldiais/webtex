import { ensure, pickSafe } from "../aux";

export interface Textual {
  /**
   * The renderable’s font size.
   */
  fontSize?: string | number;

  /**
   * The renderable’s font-family.
   */
  fontFamily?: string;

  /**
   * The renderable’s font color.
   */
  fontColor?: string;

  /**
   * The renderable’s text offset
   * along the x-axis.
   */
  textDx?: number;

  /**
   * Sets the renderable’s text offset
   * along the x-axis.
   */
  tx(value: number): this;

  /**
   * The renderable’s text offset along
   * the y-axis.
   */
  textDy?: number;

  /**
   * Sets the renderable’s text offset
   * along the y-axis.
   */
  ty(value: number): this;

  /**
   * Sets the renderable’s font attributes.
   *
   * @param option - One of the following strings:
   * - `size` - Sets the font size.
   * - `family` - Sets the font’s family.
   * - `color` - Sets the font color.
   */
  font(
    option: "size" | "family" | "color",
    value: string | number,
  ): this;
}

export function textual<NodeType extends Figure>(
  nodetype: NodeType,
): And<NodeType, Textual> {
  class Textual extends nodetype {
    fontSize?: string | number;
    fontFamily?: string;
    fontColor?: string;
    textDx?: number;
    tx(value: number) {
      this.textDx = value;
      return this;
    }
    textDy?: number;
    ty(value: number) {
      this.textDy = value;
      return this;
    }
    font(
      option: "size" | "family" | "color",
      value: string | number,
    ) {
      switch (option) {
        case "color":
          this.fontColor = ensure("string", value, "currentColor");
          break;
        case "family":
          this.fontFamily = ensure("string", value, "inherit");
          break;
        case "size":
          this.fontSize = pickSafe(this.fontSize, value);
          break;
      }
      return this;
    }
  }
  return Textual;
}
