import {
  make,
  output,
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

const petite = <T>(out: T) => make.new<Mutables<T>>().with('out', out);

/**
 * Updates the error state. Will only accept
 * the outputs of type `Blunder`.
 */
const error = <A, B>({
  prev,
  now,
  parser,
  message,
}: Blunder<A, B>): State<B extends Value ? A : any> => ({
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

/** Builds a new error payload. */
const problem = <A, B>(prev: State<A>, now: State<B>) =>
  make.new<Blunder<A, B>>().with('prev', prev).with('now', now);

const update = <T, X>(prev: State<T>, result: X) =>
  make
    .new<State<X>>()
    .with('out', result)
    .with('erm', prev.erm)
    .with('err', prev.err)
    .with('input', prev.input);

/* -------------------------------------------------------------------------- */
/*                                Parser class                                */
/* -------------------------------------------------------------------------- */
/**
 * The `Parser` class is a monad. This class should rarely
 * be used directly, since the combinators available are more than sufficient
 * to construct new parsers.
 */
class Parser<T> {
  eat: Applicative<T>;
  constructor(applicative: Applicative<T>) {
    this.eat = applicative;
  }
  /**
   * Executes a parser with the given `input` string.
   */
  run(input: string) {
    return this.eat(
      output('')
        .with('input', input)
        .with('erm', '')
        .with('err', false)
        .with('index', 0)
        .with('type', '')
        .build()
    );
  }
  /**
   * The `map` method provides a way to modify state in between parsings.
   * The properties that state properties that can be modified: `out`, `erm`,
   * `err`, `index` and `type`.
   */
  map<R>(fn: Functor<T, R>): Parser<R> {
    const refresh = <A, B>(s1: State<A>, s2: State<B>): State<R> =>
      ({ ...s1, ...s2 } as unknown as State<R>);
    return new Parser<R>((state1): State<R> => {
      const nx = this.eat(state1);
      if (nx.err) return nx as unknown as State<R>;
      return refresh(nx, { ...nx, ...fn(nx) });
    });
  }
  /**
   * The `chain` method provides a way to specify which
   * parser to use next, based on the output state
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
  chain<X>(f: (x: Mutables<T>) => Parser<X | T>): Parser<X> {
    const p = this.eat;
    return new Parser<X>((state) => {
      const ns = p(state);
      const x: Mutables<T> = petite(ns.out)
        .with('erm', ns.erm)
        .with('err', ns.err)
        .with('index', ns.index)
        .with('type', ns.type)
        .build();
      if (ns.err) return ns as unknown as State<X>;
      return f(x).eat(ns) as State<X>;
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
const one = (expect: string) =>
  new Parser<string>((state: State<string>) => {
    if (state.err) return state;
    const { input, index } = state;
    let char = input[index];
    if (isEmpty(input) || isEmpty(char) || char === undefined)
      return error(
        problem(state, state)
          .with('parser', 'one')
          .with('message', 'unexpected end of input')
          .build()
      );
    if (char === expect)
      return update(state, expect)
        .with('index', index + expect.length)
        .with('type', 'char')
        .build();
    return error(
      problem(state, state)
        .with('parser', 'one')
        .with('message', `Expected ${expect}, got ${input[index]}`)
        .build()
    );
  });
export { one };

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
 *
 */
const charOf = (option: CharSet) =>
  new Parser((state) => {
    if (state.err) return state;
    const { input, index } = state;
    const test = charTest(option);
    const target = input[index];
    if (isEmpty(input))
      return error(
        problem(state, state)
          .with('message', 'abrupt end of input')
          .with('parser', `char-of-${option}`)
          .build()
      );
    return test(target)
      ? update(state, target)
          .with('index', state.index + 1)
          .with('type', `char-of-${option}`)
          .build()
      : error(
          problem(state, state)
            .with('message', `expected ${option}, got '${target}'`)
            .with('parser', `char-${option}`)
            .build()
        );
  });

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
const strung = (option: CharSet) =>
  new Parser<string>((state) => {
    const { err, input, index } = state;
    if (err) return state;
    if (isEmpty(input))
      return error(
        problem(state, state)
          .with('message', 'abrupt end of input')
          .with('parser', `string-of-${option}`)
          .build()
      );
    let result = '';
    let i = index;
    while (i < input.length) {
      let tmp = charOf(option).run(input[i]);
      if (tmp.err) break;
      else result += input[i];
      i++;
    }
    return result.length !== 0
      ? update(state, result)
          .with('index', index + result.length)
          .with('type', `string-of-${option}`)
          .build()
      : error(
          problem(state, state)
            .with('parser', `string-of-${option}`)
            .with('message', `bad char: ${result}`)
            .build()
        );
  });
export { strung };

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
const or = <A, B>(p1: Parser<A>, p2: Parser<B>) =>
  new Parser<A | B>((state) => {
    const r1 = p1.eat(state);
    if (!r1.err)
      return update(state, r1.out)
        .with('index', r1.index)
        .with('type', r1.type)
        .build();
    const r2 = p2.eat(state);
    if (!r2.err)
      return update(state, r2.out)
        .with('index', r2.index)
        .with('type', r2.type)
        .build();
    return error(
      problem(state, r2)
        .with('parser', 'or')
        .with('message', 'no matches found')
        .build()
    );
  });

/**
 * Given two parsers `p1` and `p2`, returns a successful
 * parse _only if_ both `p1` and `p2` succeed. The output
 * is a pair `[a,b]` where `a` is the successful output of `p1`,
 * and `b` is the successful output of `p2`.
 */
const and = <A, B>(p1: Parser<A>, p2: Parser<B>) =>
  new Parser<(A | B)[]>((state): State<(A | B)[]> => {
    const r1 = p1.eat(state);
    if (r1.err)
      return error(
        problem(state, r1)
          .with('parser', 'and')
          .with('message', 'first parser failed')
          .build()
      );
    const r2 = p2.eat(r1);
    if (r2.err)
      return error(
        problem(state, r2)
          .with('parser', 'and')
          .with('message', 'second parser failed')
          .build()
      );
    return update(state, [r1.out, r2.out])
      .with('index', r2.index)
      .with('type', `${r1.type} & ${r2.type}`)
      .build();
  });

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
const word: PList = (ps) =>
  new Parser((state) => {
    if (state.err)
      return error(
        problem(state, state)
          .with('parser', 'word')
          .with('message', 'received a bad state')
          .build()
      );
    let results = [];
    let nx = state;
    for (const p of ps) {
      const out = p.eat(nx);
      if (out.err)
        return error(
          problem(state, out)
            .with('parser', 'word')
            .with('message', 'at least one parser failed')
            .build()
        );
      else {
        nx = out;
        if (nx.out !== null && nx.out !== undefined) results.push(nx.out);
      }
    }
    return update(state, results)
      .with('index', nx.index)
      .with('type', 'word')
      .build();
  });

type PList = <Value>(ps: Parser<Value>[]) => Parser<Value[]>;

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
const amid: P3 = (L, R) => (C) =>
  word([L, C, R]).map((state) => ({ out: state.out[1] }));

type P3 = <A, B, C>(
  pL: Parser<A | B | C>,
  pR: Parser<A | B | C>
) => (pC: Parser<A | B | C>) => Parser<A | B | C>;

/**
 * Given an array of parsers, returns the first
 * successful parser.
 * @example
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * const f = either([one('a'), one('b'), one('c')]);
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
const either: PList = (ps) =>
  new Parser((state) => {
    if (state.err) return state;
    let nx = state;
    for (const p of ps) {
      nx = p.eat(state);
      if (!nx.err) return nx;
    }
    return error(
      problem(state, nx)
        .with('parser', 'either')
        .with('message', 'no match found')
        .build()
    );
  });

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
const among = <T>(p: Parser<T>) =>
  new Parser<T[]>((state) => {
    const outs = [];
    const typenames = [];
    let nx = state;
    while (true && nx.index < state.input.length) {
      const out = p.eat(nx);
      if (out.err) break;
      else {
        nx = out;
        typenames.push(nx.type);
        outs.push(nx.out);
      }
    }
    return update(state, outs)
      .with('index', nx.index)
      .with('type', `[${typenames.join(', ')}]`)
      .build();
  });

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
const maybe = <T>(p: Parser<T>, otherwise: Value | null = null) =>
  new Parser((state: State<T>): State<T | typeof otherwise> => {
    if (state.err) return state;
    const prevstate: State<typeof otherwise> = update(state, otherwise)
      .with('index', state.index)
      .with('type', state.type)
      .build();
    if (state.index >= state.input.length) return prevstate;
    const nx = p.eat(state);
    return nx.err ? prevstate : nx;
  });

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
    const commaSeparated = cutBy(1, comma);
    const numbers = strung('digits').map((state) => ({ out: Number(state.out) }));
    const numberPair = bracketed(commaSeparated(numbers)).map(() => ({
      type: 'number-pair',
    }));
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
const cutBy =
  <T, X>(n: number | 'n', separator: Parser<T>) =>
  (contentParser: Parser<X>) =>
    new Parser((state) => {
      if (n !== 'n' && !isPosInt(n))
        return error(
          problem(state, state)
            .with('message', 'invalid separator count passed')
            .with('parser', 'cutBy')
            .build()
        );
      const results = [];
      let nx = state;
      while (nx.index < state.input.length) {
        const content = contentParser.eat(nx);
        const seps = separator.eat(content);
        if (content.err) break;
        else results.push(content.out);
        if (seps.err) {
          nx = content;
          break;
        }
        nx = seps;
      }
      if (n !== 'n' && results.length !== n + 1) {
        return error(
          problem(state, nx)
            .with(
              'message',
              `required ${n} separators, got ${results.length - 1}`
            )
            .with('parser', 'cutBy')
            .build()
        );
      }
      if (results.length === 0)
        return error(
          problem(state, nx)
            .with('message', 'separators not found')
            .with('parser', 'cutBy')
            .build()
        );
      return update(state, results)
        .with('index', nx.index)
        .with('type', `separated-${state.type}`)
        .build();
    });

/** First, the parser types recognized. */
type Value =
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
type Out<t> = { out: t };
/**
 * Every parser receives a state and accepts a state.
 * Parsers and combinators never operate on raw strings.
 * The only thing they understand is a `State`.
 */
export type State<t> = {
  /** The original input. This never changes. */
  readonly input: string;
  /** The custom name type for the state. */
  type: string;
  /** The index, or `cursor` for the Parser to begin reading at. */
  index: number;
  /** Whether an error occurred. */
  err: boolean;
  /** An error message. */
  erm: string;
} & Out<t>;

/** Helper type, used to construct a “Partial pick.” */
type PartialPick<t, u extends keyof t> = Omit<t, u> & Partial<Pick<t, u>>;

/** The only properties that can be updated. */
type Mutables<t> = Pick<State<t>, 'erm' | 'err' | 'index' | 'out' | 'type'>;

/**
 * A `Blunder` is the object expected
 * by the error updater, `error`.
 */
type Blunder<A, B> = {
  /** The state received. */
  prev: State<A>;
  /** The state processed. If no state was processed, pass the state received. */
  now: State<B>;
  /** The name of the parser that processed the state. */
  parser: string;
  /** An error message. There must always be an error message to keep tracing accurate. */
  message: string;
};

/**
 * A `Functor` is a function that takes any given
 * state and returns a new state. This is predominantly
 * how the parser combinator work.They apply a function
 * within a generic type, without changing the overall
 * structure of the generic type.
 */
type Applicative<A> = (state: State<any>) => State<A>;

/**
 * A `NewOut` is a structure that must have an `out` property defined.
 * In the `Map` method of the `Parser` class, the callback function,
 * a `Morpher`, must return an object with _at least_ an `out` property.
 * The object may—but need not—return an object with the
 * additional properties of `erm`, `err`, `index`, and `type`.
 */
type NewOut<T> = PartialPick<
  Mutables<T>,
  'erm' | 'err' | 'index' | 'type' | 'out'
>;

type Functor<T, X> = (arg: State<T>) => NewOut<X>;

type CharSet =
  | 'letters'
  | 'digits'
  | 'upper-letters'
  | 'lower-letters'
  | 'alphanumerics'
  | 'non-alphanumerics';
