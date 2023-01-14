const { log: show } = console;
const { trunc } = Math;

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
type State<t> = {
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

const codify = (c: string) => c.charCodeAt(0);

type Comp = '<' | '<=';
type Range = [number, Comp, number, Comp, number];

/** Tests if a given input falls within the range */
const ranTest = (rng: Range) =>
  (rng[1] === '<' ? rng[0] < rng[2] : rng[0] <= rng[2]) &&
  (rng[3] === '<' ? rng[2] < rng[4] : rng[2] <= rng[4]);
const cmp = (...ranges: Range[]) => {
  for (const r of ranges) {
    if (ranTest(r)) return true;
  }
  return false;
};

type AsciiOption =
  | 'letters'
  | 'digits'
  | 'uppercase-letters'
  | 'lowercase-letters';
type Branch<a, r> = [a, (arg: a, cases: a[]) => r];
type Path<a, r> = Branch<a, r>[];

/**
 * Pattern matcher. Given a pair `[c,f]`, where `c` is a
 * value and `f` is a function, executes `c` if the `input`
 * passed matches `c`. Otherwise, executes the last by default.
 */
const branch =
  <a, r>(...cases: Path<a, r>) =>
  (input: a) => {
    const arglist = cases.map((d) => d[0]);
    for (const [pattern, act] of cases) {
      if (pattern === input) return act(pattern, arglist);
    }
    return cases[cases.length][1](cases[cases.length][0], arglist);
  };

/**
 * Returns a new error object.
 * @param state - The state before the error was encountered.
 * @param erm - error message.
 */
const croak = <T>(state: State<any>, erm: string): State<T> => ({
  ...state,
  erm,
  err: true,
});

/**
 * All result updates must copy the previous state to maintain
 * immutability.
 * @param state - the state before the update.
 * @param out - the new result
 * @param index - the new index
 * @param type - optionally, a custom type name
 */
const updateState = <A, B>(
  state: State<A>,
  out: B,
  index: number,
  type = state.type
): State<B> => ({
  ...state,
  out,
  index,
  type,
});

/**
 * A `Functor` is a function that takes any given
 * state and returns a new state. This is predominantly
 * how the parser combinator work.They apply a function
 * within a generic type, without changing the overall
 * structure of the generic type.
 */
type Functor<A> = (state: State<any>) => State<A>;

/**
 * A `NewOut` is a structure that must have an `out` property defined.
 * In the `Map` method of the `Parser` class, the callback function,
 * a `Morpher`, must return an object with _at least_ an `out` property.
 * The object may—but need not—return an object with the
 * additional properties of `erm`, `err`, `index`, and `type`.
 */
type NewOut<T> = PartialPick<Mutables<T>, 'erm' | 'err' | 'index' | 'type'>;
type Morpher<T, X> = (arg: State<T>) => NewOut<X>;

class Parser<T> {
  parse: Functor<T>;
  constructor(transformer: Functor<T>) {
    this.parse = transformer;
  }
  run(src: string) {
    return this.parse({
      type: '',
      input: src,
      index: 0,
      out: null as unknown,
      err: false,
      erm: '',
    });
  }

  /**
   * The `map` method provides a way to modify state in between parsings.
   * The properties that state properties that can be modified: `out`, `erm`,
   * `err`, `index` and `type`.
   */
  map<R>(fn: Morpher<T, R>): Parser<R> {
    const refresh = <A, B, C>(s1: State<A>, s2: State<B>): State<C> =>
      ({ ...s1, ...s2 } as any);
    return new Parser<R>((state1): State<R> => {
      const nx = this.parse(state1);
      if (nx.err) return nx as any;
      return refresh(nx, { ...nx, ...fn(nx) });
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
const one = (s: string) =>
  new Parser<string>((state: State<string>) => {
    const { input, index, err } = state;
    if (err) return state;
    const target = input.slice(index);
    if (target.length === 0)
      return croak(state, 'Error in parser::char - abrupt end of input.');
    if (target.startsWith(s)) return updateState(state, s, index + 1, 'char');
    return croak(state, `Error in parser::char - expected ${s}, got ${input}`);
  });

/** Returns `true` if `x` is an ASCII letter (upper of lowercase), false otherwise. */
const asciiLetterTest = (x: string) =>
  cmp([65, '<=', codify(x), '<=', 90], [97, '<=', codify(x), '<=', 122]);

/** Returns `true` if `x` is an ASCII digit, false otherwise. */
const asciiDigitTest = (x: string) => cmp([48, '<=', codify(x), '<=', 57]);

/** Returns `true` if `x` is an ASCII uppercase letter, false otherwise. */
const asciiUpperTest = (x: string) => cmp([65, '<=', codify(x), '<=', 90]);

/** Returns `true` if `x` is an ASCII lowercase letter, false otherwise. */
const asciiLowerTest = (x: string) => cmp([97, '<=', codify(x), '<=', 122]);

/** Returns an ASCII tester based on the option passed. */
const asciiTester = branch(
  ['letters', () => asciiLetterTest],
  ['digits', () => asciiDigitTest],
  ['uppercase-letters', () => asciiUpperTest],
  ['lowercase-letters', () => asciiLowerTest]
);

/**
 * Parses an ASCII character base on the `AsciiOption` passed.
 * Valid options are:
 * 1. `letters` - Parse any uppercase or lowercase Latin letter.
 * 2. `uppercase-letters` - Parse any uppercase Latin letter.
 * 3. `lowercase-letters` - Parse any lowercase Latin letter.
 * 4. `digits` - Parse any ASCII digit.
 * 
 * @example
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const digits = ascii('digits');
    console.log(digits.run('84713'));
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Output:
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    {
      type: 'ascii-digits',
      input: '84713',
      index: 5,
      out: '84713',
      err: false,
      erm: ''
    }
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * The digits can be converted to numbers with a `map`:
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const digits = ascii('digits');
    const naturals = digits.map((d) => ({
      out: Number(d.out),
      type: 'natural-number',
    }));
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
const ascii = (options: AsciiOption) =>
  new Parser<string>((state) => {
    if (state.err) return state;
    const target = state.input.slice();
    const test = asciiTester(options);
    let result = '';
    let i = state.index;
    while (i < target.length && test(target[i])) {
      result += target[i];
      i++;
    }
    return result.length !== 0
      ? updateState(
          state,
          result,
          state.index + result.length,
          `ascii-${options}`
        )
      : croak(state, `Error: parser::ascii - Bad char: ${result[i]}`);
  });

/** Parses ASCII digits. */
const digits = ascii('digits');

/** Parses natural numbers. */
const naturals = digits.map((d) => ({
  out: Number(d.out),
  type: 'natural-number',
}));

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
    const { input, index, err } = state;
    const r1 = p1.parse(state);
    if (!r1.err) return updateState<A, A>(state, r1.out, r1.index, r1.type);
    const r2 = p2.parse(state);
    if (!r2.err) return updateState<B, B>(state, r2.out, r2.index, r2.type);
    return croak(state, 'no matches in parser:or');
  });

/**
 * Given two parsers `p1` and `p2`, returns a successful
 * parse _only if_ both `p1` and `p2` succeed. The output
 * is a pair `[a,b]` where `a` is the successful output of `p1`,
 * and `b` is the successful output of `p2`.
 */
const and = <A, B>(p1: Parser<A>, p2: Parser<B>) =>
  new Parser<[A, B]>((state): State<[A, B]> => {
    const r1 = p1.parse(state);
    if (r1.err)
      return croak(
        r1,
        `Error in parser::and - parser1 failed. Previous: ${r1.erm}`
      );
    const r2 = p2.parse(r1);
    if (r2.err)
      return croak(
        r2,
        `Error in parser::and - parser2 failed. Previous: ${r2.erm}`
      );
    return updateState<A & B, [A, B]>(
      state,
      [r1.out, r2.out],
      r2.index,
      `${r1.type} & ${r2.type}`
    );
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

type PList = <Value>(ps: Parser<Value>[]) => Parser<Value[]>;
const word: PList = (ps) =>
  new Parser((state) => {
    if (state.err) return state;
    let results = [];
    let nx = state;
    for (let i = 0; i < ps.length; i++) {
      const out = ps[i].parse(nx);
      if (nx.err) return out as any;
      else {
        nx = out;
        results[i] = nx.out;
      }
    }
    return updateState(nx, results, nx.index, `word`);
  });

type P3 = <A, B, C>(
  pL: Parser<A | B | C>,
  pR: Parser<A | B | C>
) => (pC: Parser<A | B | C>) => Parser<A | B | C>;

const amid: P3 = (L, R) => (C) =>
  word([L, C, R]).map((state) => ({ out: state.out[1] }));

// const parend = amid(one('('), one(')'));
// const parenDigit = parend(digits);
// show(parenDigit.run('(14892)'));
