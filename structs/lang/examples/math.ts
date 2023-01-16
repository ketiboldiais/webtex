import type { State } from '../src/index';
import {
  amid,
  either,
  maybe,
  or,
  among,
  later,
  one,
  strung,
  word,
  print,
} from '../src/index';

const dot = one('.');
const minus = one('-');
const dquoted = amid<string, string[], string>(one(`"`), one(`"`));
const alphanumeric = strung('alphanumerics');
const nonalphanumeric = strung('non-alphanumerics');

const digits = strung('digits');
const letters = strung('letters');

const integer = word([maybe(minus), digits]).map((state) => ({
  out: state.out.join(''),
  type: 'integer',
}));

const int = integer.map((d) => ({ out: Number(d.out) }));

const decimal = word([maybe(minus), digits, dot, digits]).map((d) => ({
  out: d.out.join(''),
  type: 'decimal',
}));

const real = decimal.map((d) => ({ out: Number(d.out), type: 'float' }));

const number = either([real, int]).map((d) => ({ type: 'numeric' }));
// print(number.run(`-3.2`))

const strlit = dquoted(word([alphanumeric, maybe(nonalphanumeric)])).map(
  (state) => ({
    type: 'string-literal',
    out: state.out.join(''),
  })
);
print(strlit.run(`"h3llo!"`));
