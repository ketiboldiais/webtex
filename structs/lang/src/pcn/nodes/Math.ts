import { Node, Id } from './index.js';
import { NodeType, NumberType } from '../types.js';
import { makeRational, makeScientific, parseNumber } from './NumParsers.js';

type NumberToNumTable = { [key in NumberType]: (x: number) => Num };
type TypeTable = { [key in NumberType]: { [key in NumberType]: NumberType } };
type NumericizeTable = {
  [key in NumberType]: (n: string) => string | number | [number, number];
};
const numericize: NumericizeTable = {
  natural: (n: string) => Number(n),
  integer: (n: string) => Number(n),
  scientific: (n: string): [number, number] => makeScientific(n),
  rational: (n: string): [number, number] => makeRational(n),
  bigN: (n: string) => n,
  real: (n: string) => Number(n),
  inf: (n: string) => Infinity,
  ninf: (n: string) => -Infinity,
};

type NRM = (n: any) => number;
type NormalizeTable = { [key in NumberType]: NRM };

const normalize: NormalizeTable = {
  natural: (n: string) => Number(n),
  integer: (n: string) => Number(n),
  scientific: (n: [number, number]) => {
    const a = n[0];
    const b = n[1];
    return a * 10 ** b;
  },
  rational: (n: [number, number]) => {
    const a = n[0];
    const b = n[1];
    return a / b;
  },
  bigN: (n: string) => Number(n),
  real: (n: number) => n,
  inf: (n: number) => Infinity,
  ninf: (n: number) => Infinity,
};

function string_to_Num(s: string): Num {
  const parsing = parseNumber(s);
  switch (parsing.type) {
    case 'ERROR':
      return new Num('inf', 'inf', Infinity);
    case 'bigN':
      throw new Error('method unimplemented');
    case 'rational': {
      const res = parsing.result.split('/');
      const numerator = Number(res[0]);
      const denominator = Number(res[1]);
      return new Num(parsing.result, 'rational', [numerator, denominator]);
    }
    case 'scientific': {
      const res = parsing.result.split('E');
      const coef = Number(res[0]);
      const mant = Number(res[1]);
      return new Num(parsing.result, 'rational', [coef, mant]);
    }
    case 'inf':
      return new Num('inf', 'inf', Infinity);
    case 'ninf':
      return new Num('ninf', 'ninf', -Infinity);
    case 'integer':
      return new Num(parsing.result[0], 'integer', Number(parsing.result[0]));
    case 'natural':
      return new Num(parsing.result[0], 'natural', Number(parsing.result[0]));
    case 'real':
      return new Num(parsing.result[0], 'real', Number(parsing.result[0]));
    default:
      return new Num('inf', 'inf', Infinity);
  }
}

const number_to_Num: NumberToNumTable = {
  rational: (x: number) => {
    if (x === 0) {
      return new Num(`0/1`, 'rational', [0, 1]);
    }
    let n = 0;
    let d = 1;
    const a = Math.abs(x);
    n = 0;
    d = 1;
    let r: number;
    while (true) {
      r = n / d;
      if (Math.abs((r - a) / a) < 0.00001) break;
      if (r < a) n++;
      else d++;
    }
    n = x < 0 ? -n : n;
    d = d;
    return new Num(`${n}/${d}`, 'rational', [n, d]);
  },
  natural: (x: number) => new Num(x.toString(), 'natural', x),
  integer: (x: number) => new Num(x.toString(), 'integer', x),
  scientific: (x: number) => {
    const s = x.toString().length;
    const res = x.toExponential(s < 20 ? s : 10).split(/e\+?/);
    const coef = Number(res[0]);
    const mant = Number(res[1]);
    const str = `${coef}E${mant}`;
    return new Num(str, 'scientific', [coef, mant]);
  },
  bigN: function (x: number | bigint): Num {
    const val = x.toString();
    return new Num(val, 'bigN', val);
  },
  real: function (x: number): Num {
    return new Num(x.toString(), 'real', x);
  },
  inf: function (x: number): Num {
    return new Num('inf', 'inf', Infinity);
  },
  ninf: function (x: number): Num {
    return new Num('ninf', 'ninf', -Infinity);
  },
};

export class Num extends Node {
  value: string;
  type: NumberType;
  private literal: number | [number, number] | string;
  constructor(
    value: string,
    type: NumberType = 'integer',
    literal?: number | [number, number] | string
  ) {
    super(value, type);
    this.value = value;
    this.type = type;
    this.literal = literal ? literal : numericize[type](value);
  }
  get lit() {
    return this.literal;
  }
  get norm() {
    return normalize[this.type](this.literal);
  }
}

const rational = (x: string | number | bigint) =>
  typeof x === 'number'
    ? number_to_Num.rational(x)
    : string_to_Num(x.toString());

const int = (x: string | number | bigint) =>
  typeof x === 'number'
    ? number_to_Num.integer(x)
    : string_to_Num(x.toString());

const scientific = (x: string | number | bigint) =>
  typeof x === 'number'
    ? number_to_Num.scientific(x)
    : string_to_Num(x.toString());

const natural = (x: string | number | bigint) =>
  typeof x === 'number'
    ? number_to_Num.natural(x)
    : string_to_Num(x.toString());

const real = (x: string | number | bigint) =>
  typeof x === 'number' ? number_to_Num.real(x) : string_to_Num(x.toString());

const bigN = (x: string | number | bigint) =>
  typeof x === 'number' ? number_to_Num.bigN(x) : string_to_Num(x.toString());

const inf = new Num('inf', 'inf', Infinity);
const ninf = new Num('ninf', 'ninf', -Infinity);
