import { show } from './aux';
import { binop, float, fraction, int, real } from './index';

const parsers = [int, float, fraction, real, binop];
const output = parsers[4].run('28.3+1');

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
