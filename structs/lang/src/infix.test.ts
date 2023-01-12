const { log: show } = console;
import * as Lango from './index';

const { digits, anyOf, lazy, parenthesized, order, char } = Lango;

const numberParser = digits.map((nx) => ({
  result: {
    type: 'number',
    value: Number(nx.result.value),
  },
}));

const operatorParser = anyOf(char('+'), char('-'), char('*'), char('/'));

const expr1 = lazy(() => anyOf(numberParser, operationParser1));

const operationParser1 = parenthesized(
  order(operatorParser, char(' '), expr1, char(' '), expr1)
).map((nx) => ({
  result: {
    type: 'binaryExp',
    value: {
      op: nx.results[0],
      a: nx.results[2],
      b: nx.results[4] ? nx.results[4] : nx.result,
    },
  },
}));

const input = '(+ (* 18 2) (- 3 2))';
const result = operationParser1.run(input);
show(result.result);
