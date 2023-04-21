import { Pair, Struct } from "../core/datum";

type _Poset = {
  interval: Pair<number>;
  step: number;
  exclude: Array<number>;
  min: number;
  max: number;
};

class Poset extends Struct<_Poset> {
  _interval: [number, number];
  _step: number;
  _exclude: number[];
  _min: number;
  _max: number;

  get traits() {
    return {
      interval: this._interval,
      exclude: this._exclude,
      step: this._step,
      min: this._min,
      max: this._max,
    };
  }

  constructor(
    interval: Pair<number> = [-1, 1],
    step: number = 1,
    exclude: Pair<number> = [NaN, NaN],
  ) {
    super("poset");
    this._max = interval[0];
    this._min = interval[1];
    this._interval = interval;
    this._step = step;
    this._exclude = exclude;
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

    self._exclude = [start, end];

    return self;
  }
}

const interval = (
  start: number,
  end: number,
) => new Poset([start, end]);

type _Fn = {
  variable: string;
  expression: string;
  stroke: string;
  width: number;
  dashed: boolean;
};

class Fn extends Struct<_Fn> {
  _variable: string = "";
  _expression: string = "";
  _stroke: string = "";
  _width: number = 0;
  _dashed: boolean = false;

  get traits() {
    return ({
      variable: this._variable,
      expression: this._expression,
      stroke: this._stroke,
      width: this._width,
      dashed: this._dashed,
    });
  }

  constructor(variable: string) {
    super("func");
    this._variable = variable;
  }
  dashed() {
    const self = this.getWritable();
    self._dashed = true;
    return self;
  }
  getWritable() {
    return this;
  }
  width(width: number) {
    const self = this.getWritable();
    self._width = width;
    return self;
  }
  stroke(color: string) {
    const self = this.getWritable();
    self._stroke = color;
    return self;
  }
  equals(expression: string) {
    const self = this.getWritable();
    self._expression = expression;
    return self;
  }
  private _domain: Poset = interval(-10, 10);
  domain(interval: Poset | [number, number]) {
    const self = this.getWritable();
    const update = interval instanceof Poset ? interval : new Poset(interval);
    self._domain = update;
    return self;
  }
  private _range: Poset = interval(-10, 10);
  range(interval: Poset | [number, number]) {
    const self = this.getWritable();
    const update = interval instanceof Poset ? interval : new Poset(interval);
    self._range = update;
    return self;
  }
  integrate(interval: Poset | [number, number]) {
    const self = this.getWritable();
    const update = interval instanceof Poset ? interval : new Poset(interval);
    self._range = update;
    return self;
  }
}

type FPlotFactory = (variable: string) => Fn;
const f = (variable: string) => new Fn(variable);

const fn = f("x")
  .equals("2x + 5")
  .domain(interval(-5, 5).exclude(-3.5, 4))
  .range(interval(-8, 8).exclude(-2, 2))
  .width(2)
  .stroke("red");

console.log(fn);

type _Plot = {
  data: (f: FPlotFactory) => Fn[];
};
const Plot = ({ data }: _Plot) => {
  const res = data(f);
  return <div></div>;
};

const Demo = () => {
  return (
    <Plot
      data={(f) => [
        f("x").equals("2x+1"),
        f("x").equals("3x^3"),
        f("x").equals("cos(x) - PI"),
      ]}
    />
  );
};
