const { log: show } = console;
import { digits, anyOf, lazy, parenthesized, order, char } from './index.js';

const numberParser = digits.map((nx) => ({
  out: {
    type: 'number',
    value: Number(nx.out.value),
  },
}));
const operatorParser = anyOf(char('+'), char('-'), char('*'), char('/'));
const expr1 = lazy(() => anyOf(numberParser, operationParser1));

const operationParser1 = parenthesized(
  order(operatorParser, char(' '), expr1, char(' '), expr1)
).map((nx) => ({
  out: {
    type: 'binaryExp',
    value: {
      op: nx.results[0],
      a: nx.results[2],
      b: nx.results[4] ? nx.results[4] : nx.out,
    },
  },
}));

const input = '(+ (* 18 2) (- 3 2))';
const result = operationParser1.run(input);
show(result);
