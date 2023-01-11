const { log: show } = console;
import {
  char,
  choiceOf,
  digits,
  anyspace,
  op,
  letters,
  sequenceOf,
  many,
  atLeast1,
  braced,
  parenthesized,
  bracketed,
  nested,
  lazy,
  num,
} from './index.js';

const numberParser = digits.map((x) => ({
  type: 'number',
  value: Number(x.value),
}));

const operatorParser = choiceOf(op('+'), op('-'), op('*'), op('/'));

const expr1 = lazy(() => choiceOf(numberParser, operationParser1));

const operationParser1 = parenthesized(
  sequenceOf(operatorParser, char(' '), expr1, char(' '), expr1)
).map((result, results) => ({
  type: 'operation',
  value: { op: results[0], a: results[2], b: results[4] ? results[4] : result },
}));

const input = '(+ (* 18 2) (- 3 2))';
show(operationParser1.run(input));
