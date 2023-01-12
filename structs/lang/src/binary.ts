import { digits, char, word, or } from './index.js';

const { log: show } = console;

const int = digits.map((nx) => ({
  result: { type: 'integer', value: nx.result.value },
  results: [{ type: 'integer', value: nx.result.value }],
}));

const float = word(digits, char('.'), digits);

const real = or(float, int);

const parser = [int, float, real];

const output = parser[2].run('14.5');

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
