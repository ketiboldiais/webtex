import { ATOM } from "../atom.type";
import { value } from "../packer";
import { Visitor } from "../visitor";

export type RiemannMethod = "left" | "midpoint" | "right";

export class RIEMANN extends ATOM {
  Start: number;
  End: number;
  constructor(start: number, end: number) {
    super();
    this.Start = start;
    this.End = end;
  }
  getMethod(): RiemannMethod {
    return value(this.Method, "left");
  }
  Method?: RiemannMethod;
  method(type: RiemannMethod) {
    this.Method = type;
    return this;
  }
  getData() {
    const start = this.Start;
    const end = this.End;
    const dx = this.getDX();
    const method = this.getMethod();
    const fill = value(this._fill, "gold");
    const stroke = value(this._stroke, 'gold');
    const opacity = value(this._opacity, 0.3);
		const styles = {
			fill,
			stroke,
			opacity,
		}
    return {
      start,
      end,
      dx,
      method,
      styles,
    };
  }
  DX?: number;
  dx(value: number) {
    this.DX = value;
  }
  getDX() {
    return value(this.DX, 0.5);
  }
  accept<t>(visitor: Visitor<t>): t {
    return visitor.riemann(this);
  }
}

export const riemann = (start: number, end: number) => new RIEMANN(start, end);

export const isRiemann = (x: ATOM): x is RIEMANN => x instanceof RIEMANN;

export const getMethodFn = (method: RiemannMethod) => {
  switch (method) {
    case "left":
      return (x: number) => x / 2;
    case "right":
      return (x: number) => -x / 2;
    case "midpoint":
      return () => 0;
  }
};

export type RectCoords = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  dx: number;
  out: boolean;
};