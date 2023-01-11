import { Either } from 'fp-ts/lib/Either.js';
import { Option } from 'fp-ts/lib/Option.js';

/** A `Pkg` (Package) is the input a Parser expects. */
type Pkg = {
  readonly str: string;
  readonly pos: number;
};
/** An `Err` is what a Parser outputs if it encounters an error.  */
type Err = {
  readonly err: string;
  readonly pos: number;
};

/**
 * A `Parser` is always exactly one of two types:
 *   1. An `Err`, or
 *   2. A pair `[T, Pkg]`, where `T` is the type of the target
 *      to match, and `Pkg` is the result of the parse. This pair is the
 *      parser's output.
 */
type Parser<T> = (pkg: Pkg) => Either<Err, readonly [T, Pkg]>;

/**
 * Every call to a parser results in an `Output`.
 * An `Output` is an optional tuple `[String, Pkg]`.
 * The tuple is optional because a parser should not
 * return an output if an error occurs. If an error occurs,
 * the parser outputs an `Err`.
 */
type Output = Option<[string, Pkg]>;

type ParserList<T> = ReadonlyArray<Parser<T>>;

type ListParser<T> = Parser<ReadonlyArray<T>>;

export type { Pkg, Err, Parser, Output, ParserList, ListParser };
