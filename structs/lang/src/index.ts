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
} from './util.js';
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
  /** The state processed. If no state was processed, pass the state received. */
  now: State<b>,
  /** The name of the parser that processed the state. */
  parser: string,
  /** An error message. There must always be an error message to keep tracing accurate. */
  message: string
): State<b extends Value ? a : any> => ({
  ...prev,
  erm:
    `Error at index ${prev.index} | `.padEnd(5) +
    `parser::${parser} `.padEnd(15) +
    `| ` +
    `${message} `.padEnd(33) +
    `| remaining: ${prev.input.slice(now.index)}` +
    '\n' +
    now.erm,
  err: true,
});

/** Returns a successful, updated state. */
const succeed = <t, x>(
  state: State<t>,
  newState: Partial<State<any>> & Outbox<x> & Typebox
): State<x> => ({
  ...state,
  ...newState,
});

/* -------------------------------------------------------------------------- */
/*                                Parser class                                */
/* -------------------------------------------------------------------------- */
/**
 * The `Parser` class is a monad. This class should rarely
 * be used directly, since the combinators available are more than sufficient
 * to construct new parsers.
 */
export class Parser<t> {
  eat: Applicative<t>;
  constructor(applicative: Applicative<t>) {
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
    return new Parser<t2>((state) => {
      const newState = eat(state);
      if (newState.err) return newState as unknown as State<t2>;
      return {
        ...state,
        ...fn({ out: newState.out, type: newState.type }),
      } as State<t2>;
    });
  }
  // map<x>(fn: Functor<t, x>): Parser<x> {
  // const refresh = <a, b>(s1: State<a>, s2: State<b>): State<x> =>
  // ({ ...s1, ...s2 } as unknown as State<x>);
  // return new Parser<x>((state1): State<x> => {
  // const nx = this.eat(state1);
  // if (nx.err) return nx as unknown as State<x>;
  // return refresh(nx, { ...nx, ...fn(nx) });
  // });
  // }
  contramap<x>(fn: ContraFunc<t, x>): Parser<t | x> {
    const self = this;
    return new Parser<t>((state) => {
      const st = { ...state, ...fn(state) };
      const rs = self.eat(st);
      if (rs.err) return rs;
      return succeed(state, {
        out: rs.out,
        index: state.index + rs.index,
        type: rs.type,
      });
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
      const p = word([strung('letters'), one(':')])
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
  chain<x>(f: (x: Mutables<t>) => Parser<x | t>): Parser<x> {
    const p = this.eat;
    return new Parser<x>((state) => {
      const ns = p(state);
      const x: Mutables<t> = {
        ...ns,
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
}

/**
 * Given a string `s` to match against,
 * returns a successful result if the input
 * matches. Otherwise, returns an error.
 * @example
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * const x = one('x');
 * console.log(x.run('x'));
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Output:
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * {
 *   type: 'char',
 *   input: 'x',
 *   index: 1,
 *   out: 'x',
 *   err: false,
 *   erm: ''
 * }
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
export function one(out: string) {
  return new Parser<string>((state: State<string>) => {
    if (state.err) return state;
    const { input, index } = state;
    let char = input[index];
    if (isEmpty(input) || isEmpty(char) || char === undefined)
      return error(state, state, 'one', 'abrupt end');
    if (char === out)
      return succeed(state, { out, index: index + out.length, type: 'char' });
    return error(state, state, 'one', `expected ${out}, got ${input[index]}`);
  });
}

const charTest = branch<CharSet, Function>(
  ['digits', () => isDigit],
  ['letters', () => isLatin],
  ['upper-letters', () => isUpperLatin],
  ['lower-letters', () => isLowerLatin],
  ['alphanumerics', () => isAlphaNum],
  ['non-alphanumerics', () => isNonAlphaNum]
);
/**
 * Parses exactly one character of a given ASCII character set.
 * Valid character sets are:
 *
 * 1. `letters` - Parse any ASCII uppercase or lowercase Latin letters.
 * 2. `uppercase-letters` - Parse only ASCII uppercase Latin letters.
 * 3. `lowercase-letters` - Parse only ASCII lowercase Latin letters.
 * 4. `digits` - Parse only ASCII digits.
 * 5. `alphanumerics` - Parse only ASCII digits or letters.
 * 6. `non-alphanumerics` - Parse only ASCII punctuation marks.
 */
export function charOf(option: CharSet) {
  return new Parser((state) => {
    if (state.err) return state;
    const { input, index } = state;
    const test = charTest(option);
    const out = input[index];
    if (isEmpty(input))
      return error(state, state, `char::${option}`, 'abrupt end');
    return test(out)
      ? succeed(state, {
          out,
          index: index + 1,
          type: `char-of-${option}`,
        })
      : error(
          state,
          state,
          `char::${option}`,
          `expected ${option}, got ${out}`
        );
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
export function strung(option: CharSet) {
  return new Parser<string>((state) => {
    const { err, input, index } = state;
    if (err) return state;
    const type = `string::${option}`;
    if (isEmpty(input)) return error(state, state, type, 'abrupt-end');
    let out = '';
    let i = index;
    while (i < input.length) {
      let tmp = charOf(option).run(input[i]);
      if (tmp.err) break;
      else out += input[i];
      i++;
    }
    return out.length !== 0
      ? succeed(state, { out, index: index + out.length, type })
      : error(state, state, type, `unrecognized input:${out}`);
  });
}

/**
 * Given two Parsers `p1` and `p2`, returns the
 * first Parser that successfully parses.
 * @example
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  const XorY = or(one('x'), one('y'));
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
export function or<A, B>(p1: Parser<A>, p2: Parser<B>) {
  return new Parser<A | B>((state) => {
    console.log(state);
    const r1 = p1.eat(state);
    console.log(r1);
    if (!r1.err)
      return succeed(state, { out: r1.out, index: r1.index, type: r1.type });
    const r2 = p2.eat(r1);
    if (!r2.err)
      return succeed(state, { out: r2.out, index: r2.index, type: r2.type });
    return error(state, r2, `or::${state.type}`, 'no matches');
  });
}

/**
 * Given two parsers `p1` and `p2`, returns a successful
 * parse _only if_ both `p1` and `p2` succeed. The output
 * is a pair `[a,b]` where `a` is the successful output of `p1`,
 * and `b` is the successful output of `p2`.
 */
export function and<A, B>(p1: Parser<A>, p2: Parser<B>) {
  return new Parser<(A | B)[]>((state): State<(A | B)[]> => {
    const r1 = p1.eat(state);
    if (r1.err) return error(state, r1, 'partial::and', 'first parser failed');
    const r2 = p2.eat(r1);
    if (r2.err) return error(state, r2, 'partial::and', 'second parser failed');
    return succeed(state, {
      out: [r1.out, r2.out],
      index: r2.index,
      type: `${r1.type}&${r2.type}`,
    });
  });
}

/**
 * Given an array of parsers, returns a successful parsing
 * _only if_ every parser succeeds. The output is an array
 * of the successful parsings.
 * @example
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const cat = word([one('c'), one('a'), one('t')]);
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
export function word(p: Parser<any>[]): Parser<any[]>;
export function word(ps: Parser<any>[]): Parser<any[]> {
  return new Parser((state) => {
    if (state.err) return state;
    let out: any[] = [];
    let nx = state;
    const L = ps.length;
    for (let i = 0; i < L; i++) {
      const tmp = ps[i].eat(nx);
      if (tmp.err) tmp;
      else {
        nx = tmp;
        if (nx.out !== null && nx.out !== undefined && nx.out !== '')
          out[i] = nx.out;
      }
    }
    return succeed(nx, {
      out,
      index: nx.index,
      type: `word::${nx.type}`,
    });
  });
}

/** 
 * Parses input surrounded by two delimiting symbols.
 * The parser `L` parses the left delimiting symbol,
 * the parser `R` parses the right delimiting symbol.
 * The return is the output of the parser `C`, which
 * parses the content enclosed. Results may be modified
 * with `.map`.
 * 
 * @example
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const parend = amid(one('('), one(')'));
    const parenDigit = parend(digits);
    console.log(parenDigit.run('(14892)'));
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Output:
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    {
      type: 'word',
      input: '(14892)',
      index: 7,
      out: '14892',
      err: false,
      erm: ''
    }
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
export const amid =
  <L, C, R>(pL: Parser<L>, pR: Parser<R>) =>
  (pC: Parser<C>): Parser<C> => {
    return word([pL, pC, pR]).map<C>((state) => ({
      out: state.out[1],
    }));
  };

/**
 * Given an array of parsers, returns the first
 * successful parser.
 * @example
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * const f = either([one('a'), one('b'), one('c')]);
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
export function either(ps: Parser<any>[]): Parser<any> {
  return new Parser<any>((state) => {
    if (state.err) return state;
    let nx = state;
    for (const p of ps) {
      nx = p.eat(state);
      if (!nx.err) return nx;
    }
    return error(nx, nx, `either::${nx.type}`, 'no match found');
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
export function among<T>(p: Parser<T>) {
  return new Parser<T[]>((state) => {
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
      out,
      index: nx.index,
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
    const greet = word([one('h'), one('e'), one('y'), maybe(one('a'))]);
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
export function maybe<T>(p: Parser<T>) {
  return new Parser((state: State<T>): State<any> => {
    if (state.err) return state;
    const prevstate = succeed(state, {
      out: '',
      index: state.index,
      type: state.type,
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
    const bracketed = amid(one('['), one(']'));
    const comma = one(',');
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
export function apart<T, X>(n: number | 'n', separator: Parser<T>) {
  return (contentParser: Parser<X>) =>
    new Parser((state) => {
      if (n !== 'n' && !isPosInt(n))
        return error(state, state, 'apart', 'invalid separator count');
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
          nx,
          'apart',
          `required ${n} separators, got ${out.length - 1}`
        );
      }
      return succeed(state, {
        out,
        index: nx.index,
        type: `parted::${state.type}`,
      });
    });
}

export function later(parser: () => Parser<any>): Parser<any> {
  return new Parser((state) => parser().eat(state));
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
    const bracketed = amid(one('['), one(']'));
    const commas = one(',');
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
  bP: Parser<T>,
  rP: Array<(p: Parser<any>) => Parser<any>>
): Parser<X> {
  const base = later(() => either([bP, recur]));
  const recur: Parser<X> = rP.reduceRight((acc, cur) => cur(acc), base);
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

/** Parser always specify a type name after working. */
export type Typebox = { type: string };

/**
 * Every parser receives a state and accepts a state.
 * Parsers and combinators never operate on raw strings.
 * The only thing they understand is a `State`.
 */
export type State<t> = {
  /** The original input. This never changes. */
  readonly input: string;
  /** The index, or `cursor` for the Parser to begin reading at. */
  index: number;
  /** Whether an error occurred. */
  err: boolean;
  /** An error message. */
  erm: string;
} & Outbox<t> &
  Typebox;

/** Helper type, used to construct a “Partial pick.” */
export type PartialPick<t, u extends keyof t> = Omit<t, u> &
  Partial<Pick<t, u>>;

/** The only properties that can be updated. */
export type Mutables<t> = Pick<
  State<t>,
  'erm' | 'err' | 'index' | 'out' | 'type'
>;

/**
 * A `Functor` is a function that takes any given
 * state and returns a new state. This is predominantly
 * how the parser combinator work.They apply a function
 * within a generic type, without changing the overall
 * structure of the generic type.
 */
export type Applicative<t> = (state: State<any>) => State<t>;

/**
 * A `NewOut` is a structure that must have an `out` property defined.
 * In the `Map` method of the `Parser` class, the callback function,
 * a `Morpher`, must return an object with _at least_ an `out` property.
 * The object may—but need not—return an object with the
 * additional properties of `erm`, `err`, `index`, and `type`.
 */
export type NewOut<t> = PartialPick<
  Mutables<t>,
  'erm' | 'err' | 'index' | 'type' | 'out'
>;

/**
 * All functions passed to the `map` method of the `Parser`
 * class must be functors.
 */
export type Functor<t, x> = (arg: State<t>) => NewOut<x>;
export type ContraFunc<t, x> = (
  arg: Pick<State<t>, 'input' | 'index' | 'type' | 'erm' | 'err'>
) => Partial<State<x>>;

/**
 * This is the type signature any parser that accepts an
 * array of parsers.
 */

/**
 * The recognized character sets for the `charOf` and `strung`
 * parsers.
 */
export type CharSet =
  | 'letters'
  | 'digits'
  | 'upper-letters'
  | 'lower-letters'
  | 'alphanumerics'
  | 'non-alphanumerics';
