import { uid } from "@webtex/algom";
import { ReactNode } from "react";
import { Poset } from "./poset";
import { AxisXY } from "./axis";
import { Integral } from "../plot2d/integral";
import { Riemann } from "../plot2d/riemann";
import { Fn } from "../plot2d/data";
import { Asymptote } from "../plot2d/asymptote";
import { Fn3D } from "../plot3d/plot3d";

export type DataType =
  | "Poset"
  | "Integral"
  | "Riemann"
  | "Fn"
  | "Plot3D"
  | "Asymptote"
  | "AxisXY";

export class Datum {
  Label: ReactNode = "";
  constructor() {}
  label(text: ReactNode) {
    this.Label = text;
    return this;
  }
}

export abstract class Struct {
  private _type: DataType;
  id: string = uid(10);
  constructor(type: DataType) {
    this._type = type;
  }
  abstract accept<x>(visitor: Visitor<x>): void;
  get type() {
    return this._type;
  }
  protected getWritable() {
    return this;
  }
}

/**
 * An object of SVG attributes.
 * This object styles the components.
 * Note that not every style passed
 * may be used by the rendering component.
 */
export type Styles = {} | null;

export interface _Core {
  /**
   * Sets the id of the figure.
   * This is a required property
   * that ensures keys are unique.
   */
  id: string;

  /** The width of the SVG. */
  width?: number;

  /** The height of the SVG. */
  height?: number;

  /** The SVG’s margins. */
  margin?: number;

  /**
   * The container’s classname.
   * This targets the svg’s parent
   * div, not the div
   * itself. In CSS, the svg element
   * rendering the figure can be targeted
   * with:
   *
   * ~~~
   * [className] svg {
   * }
   * ~~~
   *
   * The default is `vtex-[N]`, where `[N]`
   * is the name of the component. For example,
   * for the `Plot` module, the className is
   * `vtex-Plot`.
   */
  className?: string;
}

export type _PathStyles = Partial<{
  fill: string;
  stroke: string;
  size: string;
  dashed: string;
}>;

export type AreaStyles = Partial<{
  fill: string;
  stroke: string;
  strokeColor: string;
}>;

export interface Visitor<t> {
  poset(struct: Poset): t;
  integral(struct: Integral): t;
  riemann(struct: Riemann): t;
  fn(struct: Fn): t;
  axisXY(struct: AxisXY): t;
  asymptote(struct: Asymptote): t;
  fn3D(struct: Fn3D): t;
}
