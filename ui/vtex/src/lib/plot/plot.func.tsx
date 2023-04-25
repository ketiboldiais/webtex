import { createFunction } from "@webtex/algom";
import { ATOM } from "../atom.type";
import { N2 } from "../path/path";
import { Visitor } from "../visitor";
import { PLOTTABLE } from "./plot.main";
import {RIEMANN, isRiemann} from "./plot.riemann";

export type $FUNC2D_STYLES = {
  stroke: string;
  strokeWidth: number;
};

export type $FUNC2D = {
  exclusions: N2[];
  styles: $FUNC2D_STYLES;
};

export type FnChild = RIEMANN;

/* eslint-disable no-unused-vars */
export class FUNC2D extends ATOM {
  varname: string;
  expression: string = "";
  accept<t>(visitor: Visitor<t>): t {
    return visitor.func2d(this);
  }
  constructor(varname: string) {
    super();
    this.varname = varname;
  }
  
  
  Riemann?:RIEMANN;
  and(atom:FnChild) {
    if (isRiemann(atom)) {
      this.Riemann = atom;
    }
    return this;
  }

  /**
   * Returns the function defined.
   * If the function does not compile,
   * returns null.
   */
  getFunction(): Function | null {
    const x = this.varname;
    if (x === "") return null;
    const expr = this.expression;
    if (expr === "") return null;
    const fstring = `f(${x}) = ${expr}`;
    const f = createFunction(fstring);
    if (typeof f === "string") {
      return null;
    }
    return f;
  }

  /**
   * Sets the function’s body.
   */
  equals(expression: string) {
    this.expression = expression;
    return this;
  }

  exclusions: N2[] = [];
  /**
   * Imposes restrictions on the function’s
   * domain. If an argument x is within
   * any of the excluded intervals,
   * the argument is ignored.
   */
  exclude(...intervals: N2[]) {
    this.exclusions = intervals;
    return this;
  }
}

export const f = (x: string) => new FUNC2D(x);

export const isFunc = (
  x: PLOTTABLE,
): x is FUNC2D => x instanceof FUNC2D;
