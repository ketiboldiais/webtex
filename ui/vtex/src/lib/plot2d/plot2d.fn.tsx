/* eslint-disable no-unused-vars */
import { createFunction } from "@webtex/algom";
import { Datum } from "../core/core.atom";
import {
  Classable,
  Colorable,
  nonnull,
  safe,
  Sketchable,
  Unique,
  unsafe,
} from "../core/core.utils";
import { N2 } from "../types";
import { ScaleFn } from "./plot2d.axis";
import { line } from "d3-shape";
import { $INTEGRAL, Integration, isIntegral } from "./plot2d.integral";

export class Function2D extends Datum {
  /** The function’s domain variable. */
  readonly variable: string;
  constructor(variable: string) {
    super("function2D");
    this.variable = variable;
  }
  expression?: string;

  /**
   * Sets the function’s body,
   * to be compiled by the Algom
   * compiler.
   */
  equals(expression: string) {
    this.expression = expression;
    return this;
  }

  /**
   * Returns null if the function’s
   * expression property is undefined,
   * or if the input expression does not
   * compile. If the expression
   * successfully compiles, returns a
   * callable function.
   */
  fn(): Function | null {
    if (unsafe(this.expression)) return null;
    const x = this.variable;
    const y = this.expression;
    const f = `f(${x}) = ${y}`;
    const output = createFunction(f);
    if (typeof output === "string") return null;
    return output;
  }

  _exclusions?: N2[];
  /**
   * Declares an array of domain restrictions.
   */
  exclude(...intervals: N2[]) {
    this._exclusions = intervals;
    return this;
  }

  private _isExcluded(x: number) {
    const exclusions = this._exclusions;
    if (!safe(exclusions)) return false;
    const L = exclusions.length;
    for (let i = 0; i < L; i++) {
      const exclusion = exclusions[i];
      const min = exclusion[0];
      const max = exclusion[1];
      if (min <= x && x <= max) return true;
    }
    return false;
  }

  _path?: string | null;
  plot(
    scaleX: ScaleFn,
    scaleY: ScaleFn,
    domain: N2,
    range: N2,
    samples: number,
  ) {
    const xMin = domain[0];
    const xMax = domain[1];
    const yMin = range[0];
    const yMax = range[1];
    const f = this.fn();
    if (f === null) {
      this._path = "";
      return this;
    }
    const dataset: N2[] = [];

    for (let i = -samples; i < samples; i++) {
      const x = i / samples * xMax;
      const y = f(x);
      const point: N2 = [x, y];
      if (isNaN(y) || y < yMin || yMax < y) point[1] = NaN;
      if (this._isExcluded(x)) point[1] = NaN;
      if (x < xMin || xMax < x) continue;
      else dataset.push(point);
    }
    this._path = line()
      .y((d) => scaleY(d[1]))
      .defined((d) => !isNaN(d[1]))
      .x((d) => scaleX(d[0]))(dataset);

    if (safe(this._integrals)) {
      const L = this._integrals.length;
      const cb = (x: number) => this._isExcluded(x);
      for (let i = 0; i < L; i++) {
        const integral = this._integrals[i];
        integral.render(f, samples, xMax, cb, scaleX, scaleY);
      }
    }

    return this;
  }

  _integrals?: $INTEGRAL[];
  and(element: FNChild) {
    if (isIntegral(element)) {
      if (unsafe(this._integrals)) {
        this._integrals = [element];
      }
      this._integrals.push(element);
      return this;
    }
    return this;
  }
}

export type FNChild = $INTEGRAL;

/**
 * Returns true if the given Datumis of type
 * Function2D.
 */
export function isFunction2D(datum: Datum): datum is $FUNCTION2D {
  return datum.type === "function2D";
}

/**
 * Creates a new stylable Function2D.
 */
export function f(variableName: string) {
  const FN = Colorable(Sketchable(Unique(Classable(Function2D))));
  return new FN(variableName);
}

export type $FUNCTION2D = ReturnType<typeof f>;

type FnCurveAPI = {
  data: $FUNCTION2D;
  clipID: string;
};
export function FnCurve({
  data,
  clipID,
}: FnCurveAPI) {
  const d = data._path;
  if (unsafe(d)) return null;
  const stroke = nonnull(data._stroke, "currentColor");
  const className = nonnull(data._class, "plot2d-fn-curve");
  const integrals = data._integrals;

  return (
    <g clipPath={`url(#${clipID})`} className={className}>
      <path
        d={d}
        fill={"none"}
        stroke={stroke}
        shapeRendering={data._mode}
        strokeDasharray={data._dashed}
      />
      {integrals && integrals.map((d,i) => (
        <Integration
          key={d.id+i}
          data={d}
        />
      ))}
    </g>
  );
}
