import {
  digits,
  nested,
  sep,
  lazy,
  litstring,
  num,
  char,
  word,
  xor,
  order,
  anyOf,
  many,
} from './index.js';

/** Parse everything between parentheses. */
const parenthesized = nested(char('('), char(')'));

/** Parse everything between braces. */
const braced = nested(char('{'), char('}'));

/** Parse everything between double quotes. */
const dquoted = nested(char('"'), char('"'));

/** Parse everything between single quotes. */
const squoted = nested(char(`'`), char(`'`));
const bracketed = nested(char('['), char(']'));
const numSep = sep(char(','), 'number[]');
const strSep = sep(char(','), 'string[]');
const numvals = lazy(() => anyOf(num, numtup));
const strvals = lazy(() => anyOf(litstring, strtup));
const numtup = bracketed(numSep(numvals));
const strtup = bracketed(strSep(strvals));

const point = order(char('('), num, char(','), num, char(')')).map((nx) => ({
  result: {
    type: 'point',
    value: [Number(nx.results[1].value), Number(nx.results[3].value)],
  },
}));
const { log: show } = console;
const dot = char('.');
const slash = char('/');
const int = digits.map((nx) => ({
  result: { type: 'integer', value: nx.result.value },
  results: [{ type: 'integer', value: nx.result.value }],
}));
const float = word(digits, dot, digits).map((nx) => ({
  result: { ...nx.result, type: 'float' },
  results: [{ ...nx.result, type: 'float' }],
}));
const frac = (n: string, d: string) => ({
  type: 'fraction',
  value: `${n}/${d}`,
});
const fraction = order(digits, slash, digits).map((nx, cr) => ({
  result: frac(nx.results[0].value, nx.results[2].value),
}));
const real = xor(int, float, fraction);

const add = char('+').map((nx) => ({
  result: { type: 'operator', value: '+' },
}));
const minus = char('-').map((nx) => ({
  result: { type: 'operator', value: '-' },
}));
const div = char('-').map((nx) => ({
  result: { type: 'operator', value: '/' },
}));

const operator = anyOf(add, minus, div);

const binop = order(real, operator, real);

const parsers = [int, float, fraction, real, binop];
const output = parsers[3].run('28.3');

show(output);

// const mopLog = word('log', 'binaryOp').map((res) => ({
// type: 'op',
// value: 'Math.log',
// }));
// const mopLogT = mopLog.run('log');
// show(mopLogT);

// console.log(mopLogT.result.value);

// const build = (fs: string) => new Function(`return ${fs}`)();

// const f = build(mopLogT.result.value);

// const x = f(1);

// console.log(x);
