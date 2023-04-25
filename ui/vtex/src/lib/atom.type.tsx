/* eslint-disable no-unused-vars */
import { uid } from "@webtex/algom";
import { _Anchor, safe } from ".";
import { Visitor } from "./visitor";

export abstract class ATOM {
  // abstract accept<t>(visitor: Visitor<t>): t;

  /** The VTex figure’s unique identifier. */
  id: string = uid(10);

  private _setProp(fn: (c: ATOM) => void) {
    if (this._children) {
      this._children.forEach((c) => fn(c));
    } else {
      return;
    }
  }
  _children?: ATOM[];
  constructor(children?: ATOM[]) {
    this._children = children;
  }

  /** @internal */
  _textAnchor?: _Anchor;
  textAnchor(value?: _Anchor) {
    this._textAnchor = value;
    if (this._children) {
      this._children.forEach((c) => {
        if (!safe(c._textAnchor)) {
          c.textAnchor(value);
        }
      });
    }
    return this;
  }
  _stroke?: string;
  stroke(value?: string) {
    this._stroke = value;
    this._setProp((c) => !safe(c._stroke) && c.stroke(value));
    return this;
  }
  _fill?: string;
  fill(value?: string) {
    this._fill = value;
    this._setProp((c) => !safe(c._fill) && c.fill(value));
    return this;
  }

  _fontFamily?: string;
  fontFamily(value?: string) {
    this._fontFamily = value;
    this._setProp((c) => !safe(c._fontFamily) && c.fontFamily(value));
    return this;
  }

  _fontSize?: string | number;
  fontSize(value?: string | number) {
    this._fontSize = value;
    this._setProp((c) => !safe(c._fontSize) && c.fontSize(value));
    return this;
  }
  _textDY?: number;
  textDY(value?: number) {
    this._textDY = value;
    this._setProp((c) => !safe(c._textDY) && c.textDY(value));
    return this;
  }

  _textDX?: number;
  textDX(value?: number) {
    this._textDX = value;
    this._setProp((c) => !safe(this._textDX) && c.textDX(value));
    return this;
  }

  _color?: string;
  color(value?: string) {
    this._color = value;
    this._setProp((c) => !safe(c._color) && c.color(value));
    return this;
  }

  _radius?: number;
  radius(value?: number) {
    this._radius = value;
    this._setProp((c) => !safe(c._radius) && c.radius(value));
    return this;
  }

  _strokeWidth?: number;
  strokeWidth(value?: number) {
    this._strokeWidth = value;
    this._setProp((c) => !safe(c._strokeWidth) && c.strokeWidth(value));
    return this;
  }
  
  _opacity?: number;
  opacity(value?:number) {
    this._opacity = value;
    this._setProp((c) => !safe(c._opacity) && c.opacity(value));
    return this;
  }
}
