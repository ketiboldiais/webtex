import { tuple } from "../aux";

export class Frame {
  /**
   * The root figure’s width.
   */
  absoluteWidth: number = 500;

  /**
   * Sets the root figure’s width.
   */
  width(value: number) {
    this.absoluteWidth = value;
    return this;
  }

  /**
   * The root figure’s height.
   */
  absoluteHeight: number = 500;

  /**
   * Sets the root figure’s height.
   */
  height(value: number) {
    this.absoluteHeight = value;
    return this;
  }

  /**
   * Returns the passed dimension’s value
   * relative to the dimension’s margins.
   *
   * @param dimension One of:
   * 1. `height` returns the {@link Frame.absoluteHeight} with
   *     the top and bottom margins subtracted.
   * 2. `width` returns the {@link Frame.absoluteWidth} with
   *     the left and right margins subtracted.
   */
  relative(dimension: "height" | "width") {
    if (dimension === "height") {
      const height = this.absoluteHeight;
      const marginTop = this.marginOf('top');
      const marginBottom = this.marginOf('bottom');
      return height - marginTop - marginBottom;
    } else {
      const width = this.absoluteWidth;
      const marginLeft = this.marginOf('left');
      const marginRight = this.marginOf('right');
      return width - marginLeft - marginRight;
    }
  }

  /**
   * Sets the frame’s margins, a number
   * quadruple corresponding to:
   * ~~~
   * [top, right, bottom, left]
   * ~~~
   */
  MARGINS: [N, N, N, N] = tuple(50, 50, 50, 50);

  /**
   * Sets the top margin.
   */
  marginTop(value: number) {
    this.MARGINS[0] = value;
    return this;
  }
  /**
   * Sets the right margin.
   */
  marginRight(value: number) {
    this.MARGINS[1] = value;
    return this;
  }
  /**
   * Sets the bottom margin.
   */
  marginBottom(value: number) {
    this.MARGINS[2] = value;
    return this;
  }
  /**
   * Sets the left margin.
   */
  marginLeft(value: number) {
    this.MARGINS[3] = value;
    return this;
  }
  /**
   * Returns the margin value of the given
   * order.
   *
   * @param order - One of:
   * 1. `top` returns the value of the top margin.
   * 2. `right` returns the value of the right margin.
   * 3. `bottom` returns the value of the bottom margin.
   * 4. `left` returns the value of the left margin.
   * 5. `x` returns the sum of the left and right margins.
   * 6. `y` returns the sum of the top and bottom margins.
   */
  marginOf(order: "top" | "right" | "bottom" | "left" | "x" | "y") {
    // deno-fmt-ignore
    switch (order) {
			case 'x': return this.MARGINS[1] + this.MARGINS[3];
			case 'y': return this.MARGINS[0] + this.MARGINS[2];
			case 'top': return this.MARGINS[0];
			case 'right': return this.MARGINS[1];
			case 'bottom': return this.MARGINS[2];
			case 'left': return this.MARGINS[3];
			default: return 0;
		}
  }

  /**
   * Sets the scalable’s margins. If only two
   * arguments are passed, sets the vertical
   * and horizontal margins respectively.
   *
   * @param top - The top margin.
   * @param right - The right margin.
   * @param bottom - The bottom margin.
   * @param left - The left margin.
   */
  margins(
    top: number,
    right: number,
    bottom: number = top,
    left: number = right,
  ) {
    this.marginTop(top);
    this.marginRight(right);
    this.marginBottom(bottom);
    this.marginLeft(left);
    return this;
  }
}
