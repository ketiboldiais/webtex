import {
  isEmpty,
  isPosInt,
  branch,
  isAlphaNum,
  isDigit,
  isLatin,
  isLowerLatin,
  isNonAlphaNum,
  isUpperLatin,
  print,
  newState,
} from './util.js';
import { log } from '../utils/index.js';
export { print };

/* -------------------------------------------------------------------------- */
/*                               STATE MANAGERS                               */
/* -------------------------------------------------------------------------- */
/**
 * These first few functions are all state management helpers.
 *
 * - `error` - manages error updates.
 * - `succeed` - manages updating the current state.
 */

/**
 * Updates the error state. Will only accept
 * the outputs of the `Problem` function.
 */
const error = <a, b>(
  /** The state received. */
  prev: State<a>,
  /** The name of the parser that processed the state. */
  parser: string,
  /** An error message. There must always be an error message to keep tracing accurate. */
  message: string
): State<a> => ({
  ...prev,
  erm:
    `Error[${prev.index}] | ` +
    `parser::${parser} `.padEnd(10) +
    `| ` +
    `${message} `.padEnd(10) +
    `| remaining: ${prev.input.slice(prev.index)}` +
    prev.erm,
  err: true,
});

/** Returns a successful, updated state. */
const succeed = <t, x>(state: State<t>, newState: State<x>): State<x> => ({
  ...state,
  ...newState,
});

/* -------------------------------------------------------------------------- */
/*                                PCox class                                */
/* -------------------------------------------------------------------------- */
/**
 * The `PCox` (mini) class is a monad. This class should rarely
 * be used directly, since the combinators available are more than sufficient
 * to construct new parsers.
 */

export type Combinator<t> = (state: State<any>) => State<t>;

export class PCox<t> {
  eat: Combinator<t>;
  constructor(applicative: Combinator<t>) {
    this.eat = applicative;
  }
  /**
   * Executes a parser with the given `input` string.
   */
  run(input: string) {
    return this.eat({
      out: '',
      input,
      erm: '',
      err: false,
      index: 0,
      type: '',
    });
  }

  parse(input: string) {
    const out = this.run(input);
    return { result: out.out, type: out.type };
  }

  /**
   * The `map` method transforms a Parser's output.
   * Changes can be made to the following output
   * properties:
   *
   * - `out: T` - the Parser's result
   * - `erm: string` - the Parser's error message
   * - `err: boolean` - whether the Parser is in an error state.
   * - `index: number` - the Parser's current index
   * - `type: string` - the result’s custom typename
   */
  map<t2>(
    fn: (
      partialState: Outbox<t> & Typebox
    ) => (Outbox<t2> & Typebox) | Outbox<t2> | Typebox
  ) {
    const eat = this.eat;
    return new PCox<t2>((state) => {
      const newState = eat(state);
      if (newState.err) return newState as unknown as State<t2>;
      return {
        ...newState,
        ...fn({
          out: newState.out,
          type: newState.type,
        }),
      } as State<t2>;
    });
  }

  /**
   * The `chain` method provides a way to specify which
   * parser to use next, based on the outputstate
   * of the last parser. The `chain` method takes a
   * an applicative functor. I.e., a callback function
   * that returns a new Parser. A partial state object
   * is accessible within the callback function’s body.
   * This object has the shape:
   * ~~~
      type Mutables<t> = {
        erm: string;
        err: boolean;
        index: number;
        out: t;
        type: string;
      }
   * ~~~
   * This partial state is from the last parser run.
   * The next parser to run may be determined by reading
   * these properties. This is akin to “looking back.“ 
   * Based on what happened in the last parse, run
   * this particular parser.
   * 
   * @example
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      const p = word([strung('letters'), a(':')])
        .map((s) => ({ out: s.out[0] }))
        .chain((x) => {
          if (x.out === 'a') return strung('digits');
          else return strung('alphanumerics');
        });
      console.log(p.run('a:2'));
      console.log(p.run('b:cj2zsa'));
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   * First output:
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      {
        out: '2',
        erm: '',
        err: false,
        input: 'a:2',
        index: 3,
        type: 'string-of-digits'
      }
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   * Second output:
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      {
        out: 'cj2zsa',
        erm: '',
        err: false,
        input: 'b:cj2zsa',
        index: 8,
        type: 'string-of-alphanumerics'
      }
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   */
  chain<x>(f: (x: Pkg<t>) => PCox<x | t>): PCox<x> {
    const p = this.eat;
    return new PCox<x>((state) => {
      const ns = p(state);
      const x: State<t> = {
        ...state,
        out: ns.out,
        erm: ns.erm,
        err: ns.err,
        index: ns.index,
        type: ns.type,
      };
      if (ns.err) return ns as unknown as State<x>;
      return f(x).eat(ns) as State<x>;
    });
  }

  /**
   * Given a Parser `p1`, returns the result
   * of the argument parser `p2` only if `p1` fails,
   * and only if `p2` succeeds. If `p1` succeeds,
   * then the result of `p1` is returned.
   * @example
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const XorY = an('x').or(a('y'));
    console.log(XorY.run('xyz'));
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   * Output:
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      {
        type: 'char',
        input: 'xyz',
        index: 1,
        out: 'x',
        err: false,
        erm: ''
      }
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   */
  or(p: PCox<string>) {
    const self = this;
    return new PCox<string>((state) => {
      const r1 = self.eat(state);
      if (!r1.err) return succeed(state, r1);
      const r2 = p.eat(state);
      if (!r2.err) return succeed(state, r2);
      return error(state, `or`, 'no matches');
    });
  }

  /**
   * Given the parser `p1` and its argument `p2`, returns a successful
   * parse _only if_ both `p1` and `p2` succeed. The output
   * is a pair `[a,b]` where `a` is the successful output of `p1`,
   * and `b` is the successful output of `p2`.
   */
  and<x>(p: PCox<x>): PCox<[t, x]> {
    const self = this;
    return new PCox<[t, x]>((state) => {
      const r1 = self.eat(state);
      if (r1.err) return error(state, 'and', 'first parser failed');
      const r2 = p.eat(r1);
      if (r2.err) return error(r1, 'and', 'second parser failed.');
      return {
        ...state,
        ...{
          out: [r1.out, r2.out] as [typeof r1.out, typeof r2.out],
          index: r2.index,
          type: `[${r1.type},${r2.type}]`,
        },
      };
    });
  }
}

/**
 * Given a string `s` to match against,
 * returns a successful result if the input
 * matches. Otherwise, returns an error.
 * @alias an
 * @example
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * const x = an('x');
 * console.log(x.run('x'));
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Output:
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * {
 *   type: 'terminal',
 *   input: 'x',
 *   index: 1,
 *   out: 'x',
 *   err: false,
 *   erm: ''
 * }
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

export function a(out: string) {
  return new PCox<string>((state: State<string>) => {
    const { input, index, err } = state;
    if (err) return state;
    let char = input[index];
    if (isEmpty(input) || isEmpty(char) || char === undefined)
      return error(state, 'terminal', 'abrupt end');
    if (char === out) return newState(state, out, index + out.length, 'char');
    return error(state, 'terminal', `expected ${out}, got ${input[index]}`);
  });
}
export const an = a;

const charTest = branch<Char, Function>(
  ['digit', () => isDigit],
  ['letter', () => isLatin],
  ['uppercase-letter', () => isUpperLatin],
  ['lowercase-letter', () => isLowerLatin],
  ['alphanumeric', () => isAlphaNum],
  ['non-alphanumeric', () => isNonAlphaNum]
);
type Char =
  | 'letter'
  | 'uppercase-letter'
  | 'lowercase-letter'
  | 'digit'
  | 'alphanumeric'
  | 'non-alphanumeric';
/**
 * Parses exactly one character of a given ASCII character set.
 * Valid character sets are:
 *
 * 1. `letter` - Parse any ASCII uppercase or lowercase Latin letters.
 * 2. `uppercase-letter` - Parse only ASCII uppercase Latin letters.
 * 3. `lowercase-letter` - Parse only ASCII lowercase Latin letters.
 * 4. `digit` - Parse only ASCII digits.
 * 5. `alphanumeric` - Parse only ASCII digits or letters.
 * 6. `non-alphanumeric` - Parse only ASCII punctuation marks.
 */
export function some(option: Char): PCox<string> {
  return new PCox((state) => {
    if (state.err) return state;
    const { input, index } = state;
    const test = charTest(option);
    const out = input[index];
    if (isEmpty(input)) return error(state, `some::${option}`, 'abrupt end');
    return test(out)
      ? newState(state, out, index + 1, `some::${option}`)
      : error(state, `some::${option}`, `expected ${option}, got ${out}`);
  });
}

/**
 * Parses an ASCII string of the `AsciiOption` passed.
 * Valid options are:
 * 
 * 1. `letters` - Parse any uppercase or lowercase Latin letters.
 * 2. `uppercase-letters` - Parse all uppercase Latin letters.
 * 3. `lowercase-letters` - Parse all lowercase Latin letters.
 * 4. `digits` - Parse all ASCII digits.
 * 5. `alphanumeric` - Parse all digits or letters.
 * 6. `non-alphanumeric` - Parse all punctuation marks.
 * 
 * Note that the string parser is an eager parser. It will
 * continue reading input as long as it encounters a
 * valid character.
 * 
 * @example
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const digits = strung('digits');
    console.log(digits.run('84713'));
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Output:
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    {
      type: 'string-of-digits',
      input: '84713',
      index: 5,
      out: '84713',
      err: false,
      erm: ''
    }
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * The digits can be converted to numbers with a `map`:
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const digits = strung('digits');
    const naturals = digits.map((d) => ({
      out: Number(d.out),
      type: 'natural-number',
    }));
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
export function any(option: Char) {
  return new PCox<string>((state) => {
    const { err, input, index } = state;
    if (err) return state;
    const type = `string::${option}`;
    if (isEmpty(input)) return error(state, type, 'abrupt-end');
    let out = '';
    let i = index;
    while (i < input.length) {
      let tmp = some(option).run(input[i]);
      if (tmp.err) break;
      else out += input[i];
      i++;
    }
    return out.length !== 0
      ? succeed(state, { ...state, out, index: index + out.length, type })
      : error(state, type, `unrecognized input:${out}`);
  });
}

/**
 * Given an array of parsers, returns a successful parsing
 * _only if_ every parser succeeds. The output is an array
 * of the successful parsings.
 * @example
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const cat = word(a('c'), an('a'), a('t'));
    console.log(cat.run('cat'));
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Output:
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    {
      type: 'word',
      input: 'cat',
      index: 3,
      out: [ 'c', 'a', 't' ],
      err: false,
      erm: ''
    }
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
export function word<X extends any>(...ps: PCox<any>[]): PCox<X[]> {
  return new PCox((state) => {
    if (state.err) return state;
    const L = ps.length;
    if (L === 0) return error(state, 'word', 'must pass at least one parser');
    let out: X[] = [];
    let nx = state;
    for (let i = 0; i < L; i++) {
      const tmp = ps[i].eat(nx);
      if (tmp.err) return tmp;
      else {
        nx = tmp;
        if (nx.out !== null && nx.out !== undefined && nx.out !== '') {
          out.push(nx.out);
        }
      }
    }
    return newState(state, out, nx.index, `word::${nx.type}`);
  });
}

/**
 * Parses a regular expression.
 */
export function regex(expr: RegExp): PCox<string> {
  return new PCox((state) => {
    if (state.err) return state;
    if (expr.source[0] !== '^')
      return error(state, 'regex', `Regexes must start with '^'`);
    const { input, index } = state;
    const target = input.slice(index);
    if (target.length === 0) return error(state, 'regex', 'abrupt end');
    const match = target.match(expr);
    if (match)
      return newState(state, match[0], index + match[0].length, 'regex');
    return error(state, 'parser', `no match found at ${index}`);
  });
}

/** 
 * Parses input surrounded by two delimiting symbols.
 * The parser `pL` parses the left delimiting symbol,
 * the parser `pR` parses the right delimiting symbol.
 * The return is the output of the parser `pC`, which
 * parses the content enclosed. Results may be modified
 * with `.map`.
 * 
 * @example
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const oneLeftParen = a('('); 
    const oneRightParen = a(')')
    const parend = amid(oneLeftParen, oneRightParen)
    const bread = word(a('b'), an('r'), an('e'), an('a'), a('d'));
    const parendBread = parend(bread)
    print(parendBread.run('(bread)'))
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Output:
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    {
      out: [ 'b', 'r', 'e', 'a', 'd' ],
      input: '(bread)',
      erm: '',
      err: false,
      index: 7,
      type: 'word::char'
    }
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
export const amid =
  <L, C, R>(pL: PCox<L>, pR: PCox<R>) =>
  (pC: PCox<C>): PCox<C> => {
    return word(pL as any, pC as any, pR as any).map((state: any) => ({
      out: state.out[1],
    }));
  };

/**
 * Given an array of parsers, returns the first
 * successful parser.
 * @example
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * const f = either(an('a'), a('b'), a('c'));
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
export function choice(...ps: PCox<any>[]): PCox<any> {
  return new PCox<any>((state) => {
    if (state.err) return state;
    let nx = state;
    for (const p of ps) {
      nx = p.eat(state);
      if (!nx.err) return nx;
    }
    return error(nx, `either::${nx.type}`, 'no match found');
  });
}

/**
 * Given a parser `p`, returns the results
 * of all the parsers that succeed.
 * @example
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   const digitsOrLetters = or(strung('digits'), strung('letters'));
   const secretKey = among(digitsOrLetters);
   console.log(secretKey.run('a847s3'))
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Output:
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    {
      type: '[string-of-letters, string-of-digits, string-of-letters, string-of-digits]',
      input: 'a847s3',
      index: 6,
      out: [ 'a', '847', 's', '3' ],
      err: false,
      erm: ''
    }
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
export function many<T>(p: PCox<T>) {
  return new PCox<T[]>((state) => {
    const out = [];
    const typenames = [];
    let nx = state;
    while (true && nx.index < state.input.length) {
      const tmp = p.eat(nx);
      if (tmp.err) break;
      else {
        nx = tmp;
        typenames.push(nx.type);
        out.push(nx.out);
      }
    }
    return succeed(state, {
      ...nx,
      out,
      type: `[${typenames.join(', ')}]`,
    });
  });
}

/**
 * Returns the result of the parser if successful,
 * otherwise a `null` output. An optional `otherwise` value
 * may be provided instead of outputting `null`.
 * @example
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const greet = word([an('h'), an('e'), a('y'), maybe(an('a'))]);
    console.log(greet.run('hey'));
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Output:
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    {
      type: 'word',
      input: 'hey',
      index: 3,
      out: [ 'h', 'e', 'y' ],
      err: false,
      erm: ''
    }
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
export function maybe<T>(p: PCox<T>) {
  return new PCox((state: State<T>): State<any> => {
    if (state.err) return state;
    const prevstate = succeed(state, {
      ...state,
      out: '' as any,
    });
    if (state.index >= state.input.length) return prevstate;
    const nx = p.eat(state);
    return nx.err ? prevstate : nx;
  });
}

/**
 * Parses all content separated by `n` separators.
 * The parser takes two arguments:
 * 
 * 1. `n` - The number of separators. Either a positive integer
 *     or `'n'`. If `n` is passed, then the parser will read however
 *     many separators it can encounter. If a specific number is passed,
 *     then the parser will only read the exact number specified. If
 *     n is 0, negative, NaN, or Infinity,
 * 2. `separator` - the Parser corresponding to the separators.
 * 
 * @example
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const bracketed = amid(a('['), a(']'));
    const comma = a(',');
    const commaSeparated = apart(1, comma);
    const numbers = strung('digits').map((state) => (
      { out: Number(state.out) }
    ));
    const numberPair = bracketed(commaSeparated(numbers)).map(() => (
      { type: 'number-pair' }
    ));
    console.log(numberPair.run('[1,2]'));
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Output:
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    {
      out: [1,2],
      erm: '',
      err: false,
      input: '[1,2]',
      index: 5,
      type: 'number-pair'
    }
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
export function apart<T, X>(n: number | 'n', separator: PCox<T>) {
  return (contentParser: PCox<X>) =>
    new PCox((state) => {
      if (n !== 'n' && !isPosInt(n))
        return error(state, 'apart', 'invalid separator count');
      const out = [];
      let nx = state;
      while (nx.index < state.input.length) {
        const content = contentParser.eat(nx);
        const seps = separator.eat(content);
        if (content.err) break;
        else out.push(content.out);
        if (seps.err) {
          nx = content;
          break;
        }
        nx = seps;
      }
      if (out.length === 0 || (n !== 'n' && out.length !== n + 1)) {
        return error(
          state,
          'apart',
          `req'd ${n} separators, got ${out.length - 1}`
        );
      }
      return newState(state, out, nx.index, state.type);
    });
}

/**
 * Ignores the output of the given parser.
 * @example
 *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * const abc = word(a('j'), an('a'), skip(/^[0-9]+/), an('x'))
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
export function ignore(parser: PCox<string>) {
  return new PCox((state) => {
    if (state.err) return state;
    const nx = parser.eat(state);
    if (nx.err) return nx;
    return succeed(state, { ...nx, out: null });
  });
}

/**
 * Ignores the output of the matching
 * regex.
 */
export const skip = (regx: RegExp) =>
  new PCox((state) => {
    if (state.err) return state;
    const nx = regex(regx).eat(state);
    if (nx.err) return nx;
    return succeed(state, { ...nx, out: null });
  });

/**
 * Skips whitespace, if any.
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * const cat = word(a('c'), skipSpace, an('a'), skipSpace, a('t'));
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
export const skipSpace = skip(/^\s*/);

/**
 * Returns an error if the parser passed succeeds.
 * @example
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   const yac = word(a('y'), an('a'), an('c'), not(a('k')));
   console.log(yac.run('yack'));
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Output:
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    {
      out: 'k',
      input: 'yack',
      erm: 'Error at index 4 | parser::not | prohibited k, got k| remaining: \n',
      err: true,
      index: 4,
      type: 'char'
    }
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
export function not(parser: PCox<string>) {
  return new PCox((state) => {
    if (state.err) return state;
    const nx = parser.eat(state);
    if (!nx.err) return error(nx, 'not', `prohibited ${nx.out}, got ${nx.out}`);
    return succeed(state, { ...state, out: null });
  });
}

export function later(parser: () => PCox<any>): PCox<any> {
  return new PCox((state) => parser().eat(state));
}

/**
 * Returns a parser for nested structures.
 * Two arguments must be provided:
 * 
 * 1. `bP` - The base parser. This is the parser that `rP` returns to if it encounters
 *     a non-nesting structure.
 * 2. `rP` - The recursive parser. This parser handles the nesting structure.
 * 
 * @example
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const bracketed = amid(a('['), a(']'));
    const commas = a(',');
    const commaParted = apart('n', commas);
    const numbers = strung('digits').map((state) => (
      { out: Number(state.out) }
    ));

    const arrNums = nested(numbers, [bracketed, commaParted]).map(()=>(
      { type: 'number[]'}
    ))
    console.log(arrNums.run('[[1,2],[4,3],[5,6]]'));
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Output:
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    {
      out: [[1,2],[4,3],[5,6]],
      erm: '',
      err: false,
      input: '[[1,2],[4,3],[5,6]]',
      index: 19,
      type: 'number[]'
    }
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
export function nested<T, X = T>(
  bP: PCox<T>,
  rP: Array<(p: PCox<any>) => PCox<any>>
): PCox<X> {
  const base = later(() => choice(bP, recur));
  const recur: PCox<X> = rP.reduceRight((acc, cur) => cur(acc), base);
  return recur;
}

/* -------------------------------------------------------------------------- */
/*                                   TYPINGS                                  */
/* -------------------------------------------------------------------------- */
/**
 * Everything that follows relates to typings.
 */

/** First, the parser types recognized. */
export type Value =
  | string
  | string[]
  | number
  | number[]
  | bigint
  | bigint[]
  | boolean
  | boolean[]
  | symbol
  | symbol[]
  | { [key: string]: any };

/** Parsers always place their results in an `out` property. */
export type Outbox<t> = { out: t };

/** Parsers always specify a type name after working. */
export type Typebox = { type: string };

/** The `IndexBox` keeps track of placing. */
export type Indexbox = { index: number };

/** The `ErrState` maintains whether an error is set. */
export type Err = { err: boolean };

/** The `Erm` holds the error message. */
export type Erm = { erm: string };

export type Pkg<t> = Outbox<t> & Typebox;

/**
 * Every parser receives a state and accepts a state.
 * Parsers and combinators never operate on raw strings.
 * The only thing they understand is a `State`.
 */
export type State<t> = {
  readonly input: string;
} & Outbox<t> &
  Typebox &
  Indexbox &
  Erm &
  Err;

/**
 * This is the type signature any parser that accepts an
 * array of parsers.
 */
