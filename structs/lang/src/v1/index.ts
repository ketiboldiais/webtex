import { pipe } from 'fp-ts/lib/function.js';
import { some, none } from 'fp-ts/lib/Option.js';
import { Pkg, Parser, Output, ParserList, ListParser } from './types.js';
import {
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
} from './util.js';

/** Increments the `Pkg` position by 1 if there are still strings left to parse. */
const tick = (pkg: Pkg): Output =>
  pkg.pos < pkg.str.length
    ? some([pkg.str[pkg.pos], pack(pkg.str, pkg.pos + 1)])
    : none;

/** Parses one character. */
const pChar =
  (exp: string): Parser<string> =>
  (pkg: Pkg) =>
    pipe(
      tick(pkg),
      oMatch(
        () => eLeft(croak(`Unexpected end of input`, pkg)),
        ([char, nextPkg]) =>
          strEq(char, exp)
            ? eRight([char, nextPkg] as const)
            : eLeft(croak(`Expected: ${exp}, got: ${char}`, pkg))
      )
    );

const andP =
  <A, B>(parser1: Parser<A>, parser2: Parser<B>): Parser<readonly [A, B]> =>
  (pkg: Pkg) =>
    pipe(
      parser1(pkg),
      eChain(([expected1, pkgPostA]) =>
        pipe(
          parser2(pkgPostA),
          eMap(([expected2, pkgPostB]) => [
            [expected1, expected2] as const,
            pkgPostB,
          ])
        )
      )
    );

const map =
  <A, B>(f: (a: A) => B): ((fa: Parser<A>) => Parser<B>) =>
  (fa) =>
  (input: Pkg) =>
    pipe(
      fa(input),
      eMap(([a, nextInput]) => [f(a), nextInput])
    );

const success =
  <T>(target: T): Parser<T> =>
  (pkg: Pkg) =>
    eRight([target, pkg]);

const seqP = <A>(...parsers: ParserList<A>): ListParser<A> =>
  pipe(
    parsers,
    raReduce(success<ReadonlyArray<A>>([]), (parser, output) =>
      pipe(
        andP(parser, output),
        map(([result, target]) => raPush(target)(result))
      )
    )
  );

const fail =
  (message: string): Parser<never> =>
  (pkg: Pkg) =>
    eLeft(croak(message, pkg));

const wordP = (...ps: Parser<string>[]) =>
  pipe(seqP(...ps), map(raReduce('', (res, char) => res + char)));

export { pChar, andP, seqP, wordP };
