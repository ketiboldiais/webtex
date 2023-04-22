import { _PathStyles, Struct, Visitor } from "./datum";
import { Pair } from "../types";

export type _Poset = {
  interval: Pair<number>;
  step: number;
  exclude: Array<number>;
  min: number;
  max: number;
};

export class Poset extends Struct {
  _interval: [number, number];
  _exclude?: [number, number][];
  _min: number;
  _max: number;

  accept<x>(visitor: Visitor<x>): void {
    visitor.poset(this);
  }

  constructor(interval: Pair<number> = [-1, 1]) {
    super("Poset");
    this._max = interval[0];
    this._min = interval[1];
    this._interval = interval;
  }

  get min() {
    return this._min;
  }
  get max() {
    return this._max;
  }
  getWritable() {
    return this;
  }
  exclude(start: number, end: number) {
    const self = this.getWritable();
    const currentMin = self._min;
    const currentMax = self._max;

    // if the start is less than the min,
    // then there are no points to exclude
    // -- its out of bounds. So, return.
    if (start < currentMin) return self;

    // likewise, if end is greater than max,
    // then there are no points to exclude
    // so we return.
    if (end > currentMax) return self;
    
    const current = self._exclude||[];

    self._exclude = [...current, [start,end]];

    return self;
  }
}
export type IntervalFractory = (start: number, end: number) => Poset;
export const interval: IntervalFractory = (
  start,
  end,
) => new Poset([start, end]);
