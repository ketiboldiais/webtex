import * as E from 'fp-ts/lib/Either.js';
import { pChar, andP, wordP, seqP } from './index.js';
import { Parser, Err, Pkg } from './types.js';
import { pack, print } from './util.js';

const run = <T>(p: Parser<T>, target: string) => {
  const pkg = pack(target);
  return E.match(
    (e: Err) => `ON LEFT: Err {${e.err}} at position:${e.pos}`,
    (r: readonly [any, Pkg]) =>
      `ON RIGHT: { str: ${r[1].str}, pos:${r[1].pos} }`
  )(p(pkg));
};

const parse7 = pChar('7');
const parseLn = andP(pChar('l'), pChar('n'));
const parseLog = wordP(pChar('l'), pChar('o'), pChar('g'));

print(run(parseLog, 'log'));
