import { Pkg, Err } from './types.js';
import {
  left as eLeft,
  right as eRight,
  chain as eChain,
  map as eMap,
} from 'fp-ts/lib/Either.js';
import { match as oMatch } from 'fp-ts/lib/Option.js';
import {
  reduce as raReduce,
  append as raPush,
} from 'fp-ts/lib/ReadonlyArray.js';

const { trunc } = Math;
const { stringify: strung } = JSON;
const { log: print } = console;

/** Returns true if the two argument strings are the same. */
const strEq = (s1: string, s2: string) => s1 === s2;

/** Creates a `Pkg`. */
const pack = (str: string, pos?: number): Pkg => ({
  str,
  pos: pos ? trunc(pos) : 0,
});

/** Creates an `Err`. */
const croak = (err: string, input: Pkg): Err => ({
  err,
  pos: input.pos,
});

export {
  trunc,
  strung,
  print,
  pack,
  croak,
  strEq,
  eLeft,
  eRight,
  oMatch,
  eChain,
  eMap,
  raPush,
  raReduce,
};
