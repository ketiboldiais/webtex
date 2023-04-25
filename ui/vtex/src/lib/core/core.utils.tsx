import { uid } from "@webtex/algom";

/* eslint-disable no-unused-vars */
export type CSTR<T = {}> = new (...args: any[]) => T;

export const nonnull = <a, b>(x: a, fallback: b) =>
  (x !== undefined && x !== null)
    ? (x as unknown as b)
    : (fallback as unknown as b);

export const safe = <a,>(x?: a | undefined | null): x is a =>
  x !== undefined && x !== null;

type ColorSpec = {
  stroke: string;
  fill: string;
  opacity: number;
};
export function Colorable<CLASS extends CSTR>(C: CLASS) {
  return class extends C {
    _stroke?: string;
    stroke(color: string) {
      this._stroke = color;
      return this;
    }
    getStroke(color: string) {
      return nonnull(this._stroke, color);
    }
    _fill?: string;
    fill(color: string) {
      this._fill = color;
      return this;
    }
    getFill(color: string) {
      return nonnull(this._fill, color);
    }
    _opacity?: number;
    opacity(value: number) {
      this._opacity = value;
      return this;
    }
    getOpacity(value: number) {
      return nonnull(this._opacity, value);
    }
  };
}
export type COLORABLE = InstanceType<ReturnType<typeof Colorable>>;

export function Circular<CLASS extends CSTR>(C: CLASS) {
  return class extends C {
    _radius?: number;
    radius(value: number) {
      this._radius = value;
      return this;
    }
    getRadius(value: number) {
      return nonnull(this._radius, value);
    }
  };
}

export type CIRCULAR = InstanceType<ReturnType<typeof Circular>>;
export function Sketchable<CLASS extends CSTR>(C: CLASS) {
  return class extends C {
    _strokeWidth?: number;
    strokeWidth(value: number) {
      this._strokeWidth = value;
      return this;
    }
    getStrokeWidth(value: number) {
      return nonnull(this._strokeWidth, value);
    }
    _dashed?: number;
    dashed(value: number) {
      this._dashed = value;
      return this;
    }
    getDashed(value: number) {
      return nonnull(this._dashed, value);
    }
  };
}

export type SKETCHABLE = InstanceType<ReturnType<typeof Sketchable>>;

export function Movable<CLASS extends CSTR>(C: CLASS) {
  return class extends C {
    _x?: number;
    posX(value: number) {
      this._x = value;
      return this;
    }
    getPositions() {
      const x = this._x;
      const y = this._y;
      const dx = this._dx;
      const dy = this._dy;
      const rotate = this._rotate;
      const cx = this._cx;
      const cy = this._cy;
      return {
        x,
        y,
        dx,
        dy,
        rotate,
        cx,
        cy,
      };
    }
    getPosX(value: number) {
      return nonnull(this._x, value);
    }
    _y?: number;
    posY(value: number) {
      this._y = value;
      return this;
    }
    getPosY(value: number) {
      return nonnull(this._y, value);
    }
    _dx?: number;
    dx(value: number) {
      this._dx = value;
      return this;
    }
    getDx(value: number) {
      return nonnull(this._dx, value);
    }
    _dy?: number;
    dy(value: number) {
      this._dy = value;
      return this;
    }
    getDy(value: number) {
      return nonnull(this._dy, value);
    }
    _rotate?: number;
    rotate(value: number) {
      this._rotate = value;
      return this;
    }
    getRotate(value: number) {
      return nonnull(this._rotate, value);
    }
    _cx?: number;
    cx(value: number) {
      this._cx = value;
      return this;
    }
    getCx(value: number) {
      return nonnull(this._cx, value);
    }
    _cy?: number;
    cy(value: number) {
      this._cy = value;
      return this;
    }
    getCy(value: number) {
      return nonnull(this._cy, value);
    }
  };
}

export type MOVABLE = InstanceType<ReturnType<typeof Movable>>;
export function Textual<CLASS extends CSTR>(C: CLASS) {
  return class extends C {
    _font?: string;
    font(value: string) {
      this._font = value;
      return this;
    }
    getFont(value: string) {
      return nonnull(this._font, value);
    }
    _textAnchor?: "start" | "end" | "middle";
    textAnchor(value: "start" | "end" | "middle") {
      this._textAnchor = value;
      return this;
    }
    getTextAnchor(value: "start" | "end" | "middle") {
      return nonnull(this._textAnchor, value);
    }
    _fontSize?: string | number;
    fontSize(value: string | number) {
      this._fontSize = value;
      return this;
    }
    getFontSize(value: string | number) {
      return nonnull(this._fontSize, value);
    }
    _color?: string;
    color(value: string) {
      this._color = value;
      return this;
    }
    getColor(value: string) {
      return nonnull(this._color, value);
    }
  };
}

export type TEXTUAL = InstanceType<ReturnType<typeof Textual>>;

export function Classable<CLASS extends CSTR>(C: CLASS) {
  return class extends C {
    _class?: string;
    classed(...className: string[]) {
      const currentClass = this._class ?? "";
      const classes = [currentClass, ...className].join(" ");
      this._class = classes;
      return this;
    }
    getClassName() {
      return this._class ?? "";
    }
  };
}

export type CLASSABLE = InstanceType<ReturnType<typeof Classable>>;

export function Unique<CLASS extends CSTR>(C: CLASS) {
  return class extends C {
    _id: string = uid(10);
    tag(value: string) {
      this._id = value;
      return this;
    }
    id() {
      return this._id;
    }
  };
}

export type UNIQUE = InstanceType<ReturnType<typeof Unique>>;

export function Spatial<CLASS extends CSTR>(C: CLASS) {
  return class extends C {
    _width?: number;
    width(value: number) {
      this._width = value;
      return this;
    }
    getWidth(value: number) {
      return nonnull(this._width, value);
    }
    _height?: number;
    height(value: number) {
      this._height = value;
      return this;
    }
    getHeight(value: number) {
      return nonnull(this._height, value);
    }

    _marginTop?: number;
    marginTop(value: number) {
      this._marginTop = value;
      return this;
    }
    getMarginTop(value: number) {
      return nonnull(this._marginTop, value);
    }

    _marginBottom?: number;
    marginBottom(value: number) {
      this._marginBottom = value;
      return this;
    }
    getMarginBottom(value: number) {
      return nonnull(this._marginTop, value);
    }
    _marginLeft?: number;
    marginLeft(value: number) {
      this._marginLeft = value;
      return this;
    }
    getMarginLeft(value: number) {
      return nonnull(this._marginLeft, value);
    }
    _marginRight?: number;
    marginRight(value: number) {
      this._marginRight = value;
      return this;
    }
    getMarginRight(value: number) {
      return nonnull(this._marginRight, value);
    }
    _margin?: number;
    margin(value: number) {
      this._marginTop = value;
      this._marginLeft = value;
      this._marginBottom = value;
      this._marginRight = value;
      return this;
    }
    _visible?: boolean;
    visible(value: boolean) {
      this._visible = value;
      return this;
    }
  };
}

export type SPATIAL = InstanceType<ReturnType<typeof Spatial>>;
