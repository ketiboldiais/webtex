/* -------------------------------------------------------------------------- */
/*                                 AUXILIARIES                                */
/* -------------------------------------------------------------------------- */
/** 
 * The following are auxiliary funtions used by the parsers. They aren’t inteneded
 * to be used directly, so they may be moved to a separate file in the future.
 * Currently, they’re being exported for testing.`
 */

/**
 * All Parsers work by passing their results to the next parser. This ensures
 * that the parsers remain independent of one another, and focus only on
 * what they’re sole purposes. However, we need a way to maintain the overall
 * state. 
 * 
 * The `update` function is the primary function used by all Parsers
 * to update this overall state. The Parsers pass the `state` they were given
 * (the first parameter) and the `change` they make (their `result`). This
 * creates an illusion of mutation, when in reality, everything is immutable.
 */
const update = (state: State, change: Update) => ({ ...state, ...change });

/**
 * The `result` function builds a `Result` object. It’s intended to ensure all
 * Parsers update their `result` (if they need to) uniformly.
 */
const result = <T>(type: string, value: T): Result => ({ type, value });

/**
 * The `err` function updates the `erred` and `error` fields of `Result`
 * object. Like the `result` function, it’s intended to ensure uniform
 * error reporting across Parsers. Note that unlike the `result` function,
 * the `err` function must be given a `state` object. This is because
 * the fields updated, `erred` and `error`, are direct properties of the
 * `State` object, so the entire state _must_ be updated to maintain
 * immutability.
 */
const err: ErrorUpdater = (state, msg, parser = '', i) =>
  update(state, {
    erred: true,
    error: `Error [Parser:${parser}] | str[${i}]: "${
      state.src[state.pos]
    }" | ${msg}`,
  });

/* -------------------------------------------------------------------------- */
/*                                   Parser                                   */
/* -------------------------------------------------------------------------- */
/**
 * Looking at the implementation details, the `Parser` class isn’t really a 
 * parser, but it’s much easier to think about how the combinators are all
 * working together if we pretend that it implements parser. In reality, the `Parser`
 * is a functor. It takes a combinator, called a `morph`, and returns a new
 * `Parser`. Using a functor provides several benefits:
 * 
 * 1. “Prep” results in between parsings.
 * 2. Lookahead without having to write (or deal with) the complexities
 * of “peek“ methods.
 * 3. Updating state immutably.
 * 
 * All of this is possible by using a `Parser` class that acts more like
 * a traffic director rather than an actual parser. All the parser
 * class does is ensure that every combinator has access to the same
 * methods, while (1) not binding every combinator to a single class,
 * and (2) allowing combinators to output the types they need to output.
 */

class Parser {
  morph: Combinator;
  /**
   * Constructs a new parser.
   * A combinator is a function that takes a state
   * and returns a state:
   *
   * ```
   * (state: State) => State
   * ```
   *
   * A `State` is an object with the shape:
   *
   * ```
   * type State = {
   *    targetString: string;
   *    index: number;
   *    erred: boolean;
   *    error: string;
   *    result: Result;
   *    results: Result[];
   * }
   * ```
   * A `Result` is the output of a Combinator:
   * ```
   * export type Result = {
   *   type: string;
   *   value: any;
   * }
   * ```
   */
  constructor(transformer: Combinator) {
    this.morph = transformer;
  }

  /**
   * Runs the current parser.
   * @param targetString - The string to parse.
   */
  run(src: string) {
    const initState: State = {
      src,
      pos: 0,
      result: result('string', ''),
      results: [],
      erred: false,
      error: '',
    };
    return this.morph(initState);
  }

  /**
   * Transforms the output state of a
   * Parser. The `map` function takes a
   * `Morphism`.
   *
   * ```
   * export type Morphism = (
   *   nextState: State,
   *   currentState: State
   * ) => Partial<State>;
   * ```
   * Two objects are provided as default arguments
   * within the callback function: (1) the state
   * to be received by the next parser, and (2) the
   * state as of the current parser. Almost always,
   * `map` applies changes to future states, rather
   * than the current. Note that all changes to
   * state are immutable. The return value _must_ be
   * a `State` or a partial `State`.
   */
  map(fn: Morphism) {
    return new Parser((state: State) => {
      const nextState = this.morph(state);
      if (nextState.erred) return nextState;
      return update(nextState, fn(nextState, state));
    });
  }
  chain(fn: ChainTransformer) {
    return new Parser((state: State) => {
      const nextState = this.morph(state);
      if (nextState.erred) return nextState;
      const nextParser = fn(nextState.result);
      return nextParser.morph(nextState);
    });
  }
  mapError(fn: ErrorTransformer) {
    return new Parser((state: State) => {
      const nextState = this.morph(state);
      if (!nextState.erred) return nextState;
      return err(nextState, fn(nextState.error, nextState.pos));
    });
  }
}

/**
 * Parses the content between two delimiters.
 * The function takes two arguments, `leftParser`
 * (a Parser instance to parse the left delimiting symbol)
 * and `rightParser` (a Parser instance to parse the
 * right delimiting symbol).
 *
 */
const nested = (leftP: Parser, rightP: Parser) => (contentParser: Parser) =>
  new Parser((state: State) => {
    const croak = (state: State, msg: string) =>
      err(state, msg, 'nested', state.pos);
    if (state.erred) return state;
    let tempState = leftP.morph(state);
    if (tempState.erred)
      return croak(tempState, `Left delim missing: ${state.src[state.pos]}`);
    tempState = contentParser.morph(tempState);
    if (tempState.erred) return croak(tempState, `Error in delimited content.`);
    let contentState = tempState;
    tempState = rightP.morph(tempState);
    if (tempState.erred)
      return croak(tempState, `Right delim missing: ${state.src[state.pos]}`);
    return update(contentState, {
      results: contentState.results,
      pos: tempState.pos,
    });
  });

const char = (s: string, type = 'string') =>
  new Parser((state: State) => {
    const { src, pos, erred } = state;
    if (erred) return state;
    const target = src.slice(pos);
    if (target.length === 0) return err(state, 'abrupt end', 'char', state.pos);
    if (target.startsWith(s))
      return update(state, {
        pos: pos + s.length,
        result: result(type, s),
      });
    return err(state, 'err in char', 'char', state.pos);
  });

const pRegex = (regex: RegExp) =>
  new Parser((state: State) => {
    const { src, pos, erred } = state;
    if (erred) return state;
    const target = src.slice(pos);
    if (target.length === 0)
      return err(state, 'abrupt end', 'pRegexer', state.pos);
    const match = target.match(regex);
    if (match)
      return update(state, {
        result: result('string', match[0]),
        pos: pos + match[0].length,
      });
    return err(state, `No match.`, 'pRegexer', state.pos);
  });

/** Parse according to the rule: “The input must have exactly this sequence.” */
const order = (...parsers: Parser[]) =>
  new Parser((state: State) => {
    const res = parsers.reduce(
      (state, p) => ({
        ...p.morph(state),
        results: [...state.results, p.morph(state).result],
      }),
      state
    );
    return res.erred ? err(res, 'order error', 'order', res.pos) : res;
  });

/** Parses according to the rule: “The input can have any of these symbols.” */
const anyOf = (...parsers: Parser[]) =>
  new Parser((state: State) => {
    if (state.erred) return state;
    for (let p of parsers) {
      const nextState = p.morph(state);
      if (!nextState.error) return nextState;
    }
    return err(state, `No match.`, 'choiceOf', state.pos);
  });

/**
 * Internal helper build for the `many` functions. Not intended to be used directly.
 * @internal
 */
const manyBuilder = (type: 'many' | 'atLeast1') => (parser: Parser) =>
  new Parser((state: State) => {
    if (state.erred) return state;
    let nextState = state;
    const results = [];
    let done = false;
    while (!done && nextState.pos < state.src.length) {
      let tempState = parser.morph(nextState);
      if (!tempState.erred) {
        results.push(tempState.result);
        nextState = tempState;
      } else done = true;
    }
    if (type === 'atLeast1' && results.length === 0) {
      return err(state, `No match.`, type, state.pos);
    }
    return update(nextState, { results });
  });

/** Parse according to the rule: “Get all these symbols.” */
const many = manyBuilder('many');

/** Parse according to the rule: “The input must have at least one of these symbols.” */
const atLeast1 = manyBuilder('atLeast1');

/** Parses symbols separated by the specified separator. */
const sep =
  (separator: Parser, type = 'seperator') =>
  (valParser: Parser) =>
    new Parser((state: State) => {
      if (state.erred) return err(state, `Died abirth.`, 'sep', state.pos);
      const results: Result[] = [];
      let nxState = state;
      while (true && nxState.pos < state.src.length) {
        const targetState = valParser.morph(nxState);
        if (targetState.erred) break;
        results.push(targetState.result);
        nxState = targetState;
        const sepState = separator.morph(nxState);
        if (sepState.erred) break;
        nxState = sepState;
      }
      return update(nxState, {
        result: result(type ? type : nxState.result.type, results),
      });
    });

const lazy = (thunkp: Thunk) =>
  new Parser((state: State) => {
    const parser = thunkp();
    return parser.morph(state);
  });

const word = (...parsers: Parser[]) =>
  order(...parsers).map((nx, cx) => ({
    result: result('word', nx.src.slice(cx.pos, nx.pos)),
    results: [result('word', nx.src.slice(cx.pos, nx.pos))],
  }));

export {
  char,
  order,
  anyOf,
  result,
  many,
  atLeast1,
  pRegex,
  nested,
  sep,
  lazy,
  Parser,
  word,
  update,
  err,
};

/* -------------------------------------------------------------------------- */
/*                                   EXTRAS                                   */
/* -------------------------------------------------------------------------- */
/**
 * The following are parsers built with the core modules above.
 * These parses may be moved to a separate repository in the future,
 * since they aren’t strictly necessary for Lango to work.
 */

/**
 * Returns the result of exactly one result of the Parsers
 * provided as arguments.
 */
const xor = (...parsers: Parser[]) =>
  new Parser((state: State) => {
    if (state.erred) return state;
    let results: Result[] = [];
    let temp = state;
    let outState = temp;
    for (let p of parsers) {
      temp = p.morph(state);
      if (temp.erred) continue;
      results.push(temp.result);
      outState = temp;
    }
    return results.length === 0
      ? err(temp, 'no match found', 'xor', temp.pos)
      : update(temp, outState);
  });

const or = (parser1: Parser, parser2: Parser) =>
  new Parser((state) => {
    const { src, pos } = state;
    if (state.erred) return state;
    const res1 = parser1.run(src.slice(pos));
    if (!res1.erred) return res1;
    const res2 = parser2.run(src.slice(pos));
    if (!res2.erred) return res2;
    return err(state, 'no match found', 'or', state.pos);
  });

const anyspace = pRegex(/\s*/);
const letters = pRegex(/^[A-Za-z]+/);
const digits = pRegex(/^\d+/);

/** Parses a string. */
const litstring = letters.map((nx) => ({
  result: result('string', nx.result.value),
}));

/** Parses a number. */
const num = digits.map((nx) => ({
  result: result('number', Number(nx.result.value)),
}));

/** Parse everything between parentheses. */
const parenthesized = nested(char('('), char(')'));

/** Parse everything between braces. */
const braced = nested(char('{'), char('}'));

/** Parse everything between double quotes. */
const dquoted = nested(char('"'), char('"'));

/** Parse everything between single quotes. */

const squoted = nested(char(`'`), char(`'`));

/** Parse everything between brackets */
const bracketed = nested(char('['), char(']'));

/** Parse a number array */
const numSep = sep(char(','), 'number[]');

/** Parse a string array */
const strSep = sep(char(','), 'string[]');

/** Parse nested arrays */
const numvals = lazy(() => anyOf(num, numtup));
const strvals = lazy(() => anyOf(litstring, strtup));
const numtup = bracketed(numSep(numvals));
const strtup = bracketed(strSep(strvals));
const dot = char('.');
const slash = char('/');

const int = digits.map((nx) => ({
  result: { type: 'integer', value: nx.result.value },
  results: [{ type: 'integer', value: nx.result.value }],
}));

const float = word(digits, dot, digits).map((nx) => ({
  result: { ...nx.result, type: 'float' },
  results: [{ ...nx.result, type: 'float' }],
}));

const frac = (n: string, d: string) => ({
  type: 'fraction',
  value: `${n}/${d}`,
});

const fraction = order(digits, slash, digits).map((nx, cr) => ({
  result: frac(nx.results[0].value, nx.results[2].value),
}));

const real = xor(int, float, fraction);

/** Parses a point. */
const point = order(char('('), num, char(','), num, char(')')).map((nx) => ({
  result: result('point', [
    Number(nx.results[1].value),
    Number(nx.results[3].value),
  ]),
}));

export {
  parenthesized,
  or,
  anyspace,
  braced,
  dquoted,
  squoted,
  bracketed,
  numSep,
  strSep,
  numvals,
  strvals,
  numtup,
  strtup,
  dot,
  slash,
  int,
  float,
  frac,
  fraction,
  real,
  point,
};

/* -------------------------------------------------------------------------- */
/*                                  OPERATORS                                 */
/* -------------------------------------------------------------------------- */
/**
 * This section contains operator parsers. By “operator,” we mean mathematical
 * operators. 
 */

const add = char('+').map((nx) => ({
  result: { type: 'operator', value: '+' },
}));

const minus = char('-').map((nx) => ({
  result: { type: 'operator', value: '-' },
}));

const div = char('-').map((nx) => ({
  result: { type: 'operator', value: '/' },
}));
const operator = anyOf(add, minus, div);
const binop = order(real, operator, real);

export { add, minus, div, operator, binop };
