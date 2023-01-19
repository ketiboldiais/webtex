import {
  any,
  a,
  word,
  maybe,
  print,
  choice,
  ignore,
  skipSpace,
  amid,
} from '../src/index';
import { display } from '../src/rp';
const dot = a('.');
const natural = any('digit').map<string>((d) => ({ type: 'integer' }));
const decimal = word(natural, dot, natural).map((d) => ({
  out: d.out.join(''),
  type: 'decimal',
}));
const rat = choice(decimal, natural);

const real = word(maybe(a('-')), rat).map((d) => ({ out: d.out.join('') }));
// print(real.run('-12'));

const variable = any('letter').map((d) => ({ type: 'variable' }));
const add = a('+').map((d) => ({ type: 'op' }));
const minus = a('-').map((d) => ({ type: 'op' }));
const div = a('/').map((d) => ({ type: 'op' }));
const pow = a('^').map((d) => ({ type: 'op' }));
const op = choice(add, minus, div, pow);

const arithmetic = word(real, skipSpace, op, skipSpace, real).map((d) => ({
  type: 'arithmetic-expression',
  out: { op: d.out[1], left: d.out[0], right: d.out[2] },
}));

const leftVarEx = word(variable, skipSpace, op, skipSpace, real).map((d) => ({
  type: 'variable-expression',
  out: { op: d.out[1], left: d.out[0], right: d.out[2] },
}));

const rightVarEx = word(real, skipSpace, op, skipSpace, variable).map((d) => ({
  type: 'variable-expression',
  out: { op: d.out[1], left: d.out[0], right: d.out[2] },
}));

const allVarEx = word(variable, skipSpace, op, skipSpace, variable).map(
  (d) => ({
    type: 'variable-expression',
    out: { op: d.out[1], left: d.out[0], right: d.out[2] },
  })
);
const parend = amid(a('('), a(')'));
const varExpr = choice(leftVarEx, rightVarEx, allVarEx);
const binex = choice(parend(varExpr), parend(arithmetic), varExpr, arithmetic);
const expr = word(
  choice(binex, real),
  skipSpace,
  op,
  skipSpace,
  choice(binex, real)
).map((d) => ({
  type: 'expression',
  out: { op: d.out[1], left: d.out[0], right: d.out[2] },
}));

display(expr.run('x^2 + (1 - 8)').out);
