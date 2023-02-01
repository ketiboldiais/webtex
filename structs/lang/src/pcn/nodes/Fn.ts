import { a, not, word, any } from '../../pcx/index.js';
import { algebra } from './AlgebraBuilder.js';
const show = console.log;
type Numeric = 'natural';

const is = {
  string: (x: any): x is string => typeof x === 'string',
  number: (x: any): x is number => typeof x === 'number',
  array: (x: any): x is any[] => Array.isArray(x),
  literal: (x: any) => typeof x === 'string' || typeof x === 'number',
};
const a_zero = a('0');

const _parse_natural = word(any('digit'))
  .or(a_zero)
  .map<string, string, Numeric>((d) => {
    let out = '';
    if (is.array(d.out)) {
      out = d.out.join('');
      let i = 0;
      while (out[i] === '0' && i < d.out.length) {
        out = out.slice(i + 1);
        i++;
      }
    } else {
      out = d.out;
    }
    return { out, type: 'natural' };
  });
const parse_natural = (x: string) => _parse_natural.parse<string, Numeric>(x);

const natural = algebra('natural', (x: number) => ({
  add: (a: number) => natural(Math.abs(x + a)),
  mul: (a: number) => natural(Math.abs(x * a)),
}));

const integer = algebra('integer', (x: number) => ({
  add: (a: number) => integer(x + a),
  mul: (a: number) => integer(x * a),
  div: (a: number) => integer(x / a),
  sub: (a: number) => integer(x - a),
}));




