/* eslint-disable no-dupe-class-members */
import { uid } from "@webtex/algom";
import {Anchor} from "../types";

/* eslint-disable no-unused-vars */
export type CSTR<T = {}> = new (...args: any[]) => T;

export const nonnull = <t,>(x: null|undefined|t, fallback: t) =>
  (x !== undefined && x !== null)
    ? (x as unknown as t)
    : (fallback as unknown as t);

export const safe = <a,>(x?: a | undefined | null): x is a =>
  x !== undefined && x !== null;
  
export type UnsafeValue = undefined | null;
export const unsafe = (x:any): x is UnsafeValue => (x===undefined||x===null);

export function Colorable<CLASS extends CSTR>(C: CLASS) {
  return class extends C {
    _stroke?: string;
    stroke(color: string) {
      this._stroke = color;
      return this;
    }
    _fill?: string;
    fill(color: string) {
      this._fill = color;
      return this;
    }
    _opacity?: number;
    opacity(value: number) {
      this._opacity = value;
      return this;
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
  };
}

export type CIRCULAR = InstanceType<ReturnType<typeof Circular>>;
export function Sketchable<CLASS extends CSTR>(C: CLASS) {
  return class extends C {
    _strokeWidth?: number|string;
    strokeWidth(value: number|string) {
      this._strokeWidth = value;
      return this;
    }
    _dashed?: number|string;
    dashed(value: number|string) {
      this._dashed = value;
      return this;
    }
    _mode?:RenderMode;
    /**
     * Declares the rendering mode
     * for the SVG shape. Acceptable values:
     *
     * - `auto`. This is the default value.
     * The user agent will make tradeoffs to
     * balance speed, crisp edges, and geometric
     * precision, with geometric precision taking
     * priority over speed and crisp edges.
     * 
     * - `optimizeSpeed`. Rendering speed takes
     * priority over geometric precision and
     * crisp edges.
     * 
     * - `crispEdges` - Crisp edges takes priority
     * over rendering speed and geometric precision.
     * 
     * - `geometricPrecision` - geometricPrecision
     * takes priority over speed and crisp edges.
     * 
     */
    renderMode(mode:RenderMode) {
      this._mode = mode;
      return this;
    }
  };
}
export type RenderMode =
  | 'auto'
  | 'optimizeSpeed'
  | 'crispEdges'
  | 'geometricPrecision'

export type SKETCHABLE = InstanceType<ReturnType<typeof Sketchable>>;

export function Movable<CLASS extends CSTR>(C: CLASS) {
  return class extends C {
    _x?: number;
    posX(value: number) {
      this._x = value;
      return this;
    }
    _y?: number;
    posY(value: number) {
      this._y = value;
      return this;
    }
    _dx?: number;
    dx(value: number) {
      this._dx = value;
      return this;
    }
    _dy?: number;
    dy(value: number) {
      this._dy = value;
      return this;
    }
    _rotate?: number;
    rotate(value: number) {
      this._rotate = value;
      return this;
    }
    _cx?: number;
    cx(value: number) {
      this._cx = value;
      return this;
    }
    _cy?: number;
    cy(value: number) {
      this._cy = value;
      return this;
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
    _textAnchor?: "start" | "end" | "middle";
    textAnchor(value: "start" | "end" | "middle") {
      this._textAnchor = value;
      return this;
    }
    _fontSize?: string | number;
    fontSize(value: string | number) {
      this._fontSize = value;
      return this;
    }
    _color?: string;
    color(value: string) {
      this._color = value;
      return this;
    }
    _verticalAnchor?:Anchor;
    verticalAnchor(value:Anchor) {
      this._verticalAnchor=value;
      return this;
    }
    _tx?:number;
    tx(value:number) {
      this._tx=value;
      return this;
    } 
    _ty?:number;
    ty(value:number) {
      this._ty=value;
      return this;
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
  };
}

export type CLASSABLE = InstanceType<ReturnType<typeof Classable>>;

export function Unique<CLASS extends CSTR>(C: CLASS) {
  return class extends C {
    id: string = uid(8);
    setID(value: string | number) {
      this.id = `${value}`;
      return this;
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
    _height?: number;
    height(value: number) {
      this._height = value;
      return this;
    }
    _marginTop?: number;
    marginTop(value: number) {
      this._marginTop = value;
      return this;
    }
    _marginBottom?: number;
    marginBottom(value: number) {
      this._marginBottom = value;
      return this;
    }
    _marginLeft?: number;
    marginLeft(value: number) {
      this._marginLeft = value;
      return this;
    }
    _marginRight?: number;
    marginRight(value: number) {
      this._marginRight = value;
      return this;
    }

    /**
     * Sets the the margins on the figure.
     * If only two arguments are passed, then the first
     * argument sets the top and bottom margins, and the
     * second argument sets the left and right margins.
     */
    margins(
      top: number,
      right: number,
      left?: number,
      bottom?: number,
    ): this {
      this._marginTop = top;
      this._marginLeft = nonnull(left, right);
      this._marginBottom = nonnull(bottom, top);
      this._marginRight = right;
      return this;
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

export const DNE = (x:any): x is undefined => x === undefined;
export const exists = (x: any) => x !== undefined;
export const hasKey = (x: any, key: string) => exists(x[key]);
export const isString = (x:any): x is string  => typeof x === 'string';
export const isNumber = (x:any): x is number  => typeof x === 'number';
export const isNull = (x:any): x is null => x === null;

export const isStrList = (
  x:any
): x is Array<string> => Array.isArray(x) && isString(x[0]);

export const isNumList = (
  x:any
): x is Array<number> => Array.isArray(x) && isNumber(x[0]);

