type Constructor<T = {}> = new (...args: any[]) => T;

function Numeric<TBase extends Constructor>(
  fn: {
    type: TBase;
    valof: (x: InstanceType<TBase>) => number;
    clone: (...args: any[]) => InstanceType<TBase>;
    add: (
      x: InstanceType<TBase>,
      y: InstanceType<TBase>,
    ) => number;
    mul: (
      x: InstanceType<TBase>,
      y: InstanceType<TBase>,
    ) => number;
    div: (
      x: InstanceType<TBase>,
      y: InstanceType<TBase>,
    ) => number;
    rem: (
      x: InstanceType<TBase>,
      y: InstanceType<TBase>,
    ) => number;
    minus: (
      x: InstanceType<TBase>,
      y: InstanceType<TBase>,
    ) => number;
  },
) {
  return class N extends fn.type {
    value: number;
    constructor(...args: any[]) {
      super(...args);
      this.value = args[0];
    }
    val(x: InstanceType<TBase>) {
      return fn.valof(x);
    }
    minus(y: InstanceType<TBase>) {
      const k = fn.clone(this.value);
      return new N(fn.minus(k, y));
    }
    rem(y: InstanceType<TBase>) {
      const k = fn.clone(this.value);
      return new N(fn.rem(k, y));
    }
    div(y: InstanceType<TBase>) {
      const k = fn.clone(this.value);
      return new N(fn.div(k, y));
    }
    mul(y: InstanceType<TBase>) {
      const k = fn.clone(this.value);
      return new N(fn.mul(k, y));
    }
    add(y: InstanceType<TBase>) {
      const k = fn.clone(this.value);
      return new N(fn.add(k, y));
    }
  };
}

function Pair<TBase extends Constructor>(
  fn: {
    type: TBase;
    valof: (x: InstanceType<TBase>) => [number, number];
    clone: (...args: any[]) => InstanceType<TBase>;
    add: (
      x: InstanceType<TBase>,
      y: InstanceType<TBase>,
    ) => [number, number];
    mul: (
      x: InstanceType<TBase>,
      y: InstanceType<TBase>,
    ) => [number, number];
    div: (
      x: InstanceType<TBase>,
      y: InstanceType<TBase>,
    ) => [number, number];
    rem: (
      x: InstanceType<TBase>,
      y: InstanceType<TBase>,
    ) => [number, number];
    minus: (
      x: InstanceType<TBase>,
      y: InstanceType<TBase>,
    ) => [number, number];
  },
) {
  return class P extends fn.type {
    a: number;
    b: number;
    constructor(...args: any[]) {
      super(...args);
      this.a = args[0];
      this.b = args[1];
    }
    get value() {
      return [this.a, this.b];
    }
    val(x: InstanceType<TBase>) {
      return fn.valof(x);
    }
    minus(y: InstanceType<TBase>) {
      const k = fn.clone(...this.value);
      return new P(...fn.minus(k, y));
    }
    rem(y: InstanceType<TBase>) {
      const k = fn.clone(...this.value);
      return new P(...fn.rem(k, y));
    }
    div(y: InstanceType<TBase>) {
      const k = fn.clone(...this.value);
      return new P(...fn.div(k, y));
    }
    mul(y: InstanceType<TBase>) {
      const k = fn.clone(...this.value);
      return new P(...fn.mul(k, y));
    }
    add(y: InstanceType<TBase>) {
      const k = fn.clone(...this.value);
      return new P(...fn.add(k, y));
    }
  };
}

class UInt {
  value: number;
  constructor(value: number) {
    this.value = value;
  }
}

class Frac {
  a: number;
  b: number;
  constructor(a: number, b: number) {
    this.a = a;
    this.b = b;
  }
}

const RAT = Pair({
  type: Frac,
  valof: (x) => [x.a, x.b],
  clone: (x: number, y: number) => new Frac(x, y),
  add: (x, y) => [x.a + y.a, x.b + y.b],
  mul: (x, y) => [x.a, y.b],
  div: (x, y) => [x.a, y.b],
  rem: (x, y) => [x.a, y.b],
  minus: (x, y) => [x.a, y.b],
});

function frac(a: number, b: number) {
  return new RAT(a, b);
}

const INT = Numeric({
  type: UInt,
  valof: (x) => x.value,
  clone: (x: number) => new UInt(x),
  add: (x, y) => x.value + y.value,
  mul: (x, y) => x.value * y.value,
  div: (x, y) => Math.ceil(x.value / y.value),
  rem: (x, y) => x.value % y.value,
  minus: (x, y) => x.value - y.value,
});

function int(x: number) {
  return new INT(x);
}
