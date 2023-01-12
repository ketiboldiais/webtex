export type Result = {
  type: string;
  value: any;
};
export type Thunk = () => Parser;
export type State = {
  src: string;
  pos: number;
  erred: boolean;
  error: string;
  result: Result;
  results: Result[];
};
export type ErrorUpdater = (
  state: State,
  message: string,
  parserName?: string,
  index?: number
) => State;
export type Combinator = (state: State) => State;
export type ErrorTransformer = (errorMessage: string, index: number) => string;
export type ChainTransformer = (result: Result) => Parser;
export type Morphism = (
  nextState: State,
  currentState: State
) => Partial<State>;
export type Update = Partial<State>;

const substr = (str: string, i: number, j?: number) => str.slice(i, j);
const isBlank = (str: string) => str.length === 0;

/**
 * Returns a new state object.
 * @param state - The current State.
 * @param change - An object corresponding to the keys to update.
 **/
const update = (state: State, change: Update) =>
  Object.assign({}, state, change);

const err: ErrorUpdater = (state, msg, parser = '', i) =>
  update(state, {
    erred: true,
    error: `Error [Parser:${parser}] | str[${i}]: "${
      state.src[state.pos]
    }" | ${msg}`,
  });

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
      result: { type: 'string', value: '' },
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
const expected = (state: State) => state.src[state.pos];
const nested =
  (leftParser: Parser, rightParser: Parser) => (contentParser: Parser) =>
    new Parser((state: State) => {
      if (state.erred) return state;
      let tempState = leftParser.morph(state);
      if (tempState.erred)
        return err(
          tempState,
          `Left delimiter missing: ${expected(state)}`,
          'between',
          tempState.pos
        );
      tempState = contentParser.morph(tempState);
      if (tempState.erred)
        return err(
          tempState,
          `delimited content error`,
          'between',
          tempState.pos
        );
      let contentState = tempState;
      tempState = rightParser.morph(tempState);
      if (tempState.erred)
        return err(
          tempState,
          `Right delimiter missing: ${expected(state)}`,
          'between',
          tempState.pos
        );

      const out = update(contentState, {
        results: contentState.results,
        pos: tempState.pos,
      });
      return out;
    });

const char = (str: string, type = 'string') =>
  new Parser((state: State) => {
    const { src, pos, erred } = state;
    if (erred) return state;
    const target = src.slice(pos);
    if (isBlank(target)) return err(state, 'abrupt end', 'char', state.pos);
    if (target.startsWith(str))
      return update(state, {
        pos: pos + str.length,
        result: { type, value: str },
      });
    return err(state, 'err in char', 'char', state.pos);
  });

const pRegexer = (regex: RegExp) =>
  new Parser((state: State) => {
    const { src, pos, erred } = state;
    if (erred) return state;
    const target = src.slice(pos);
    if (isBlank(target)) return err(state, 'abrupt end', 'pRegexer', state.pos);
    const match = target.match(regex);
    if (match)
      return update(state, {
        result: { type: 'string', value: match[0] },
        pos: pos + match[0].length,
      });
    return err(state, `No match.`, 'pRegexer', state.pos);
  });
const anyspace = pRegexer(/\s*/);
const letters = pRegexer(/^[A-Za-z]+/);
const digits = pRegexer(/^\d+/);

/**
 * Parse according to the rule: “The input must have exactly this sequence.”
 * @param parsers - Comma-separated argument list of parsers.
 */
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
// const jx = xor(char('a'), char('b'), char('c'))
// console.log(jx.run('abc'))
/**
 * Parses according to the rule: “The input can have any of these symbols.”
 * @param parsers - Comma-separated argument list of parsers.
 */
const anyOf = (...parsers: Parser[]) =>
  new Parser((state: State) => {
    if (state.erred) return state;
    for (let p of parsers) {
      const nextState = p.morph(state);
      if (!nextState.error) return nextState;
    }
    return err(state, `No match.`, 'choiceOf', state.pos);
  });
const or = (parser1: Parser, parser2: Parser) =>
  new Parser((state: State) => {
    const { src, pos } = state;
    if (state.erred) return state;
    const res1 = parser1.run(substr(src, pos));
    if (!res1.erred) return res1;
    const res2 = parser2.run(substr(src, pos));
    if (!res2.erred) return res2;
    return err(state, 'no match found', 'or', state.pos);
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
    while (!done) {
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

/**
 * Parse according to the rule: “Get all these symbols.”
 * @param parsers - Comma-separated list of parsers.
 */
const many = manyBuilder('many');

/**
 * Parse according to the rule: “The input must have at least one of these symbols.”
 * @param parsers - Comma-separated list of parsers.
 */
const atLeast1 = manyBuilder('atLeast1');

/** Parses symbols separated by the specified separator. */
const sep =
  (separator: Parser, type = 'seperator') =>
  (valueParser: Parser) =>
    new Parser((state: State) => {
      if (state.erred) return err(state, `Died abirth.`, 'sep', state.pos);
      const results: Result[] = [];
      let nxState = state;
      while (true) {
        const targetState = valueParser.morph(nxState);
        if (targetState.erred) break;
        results.push(targetState.result);
        nxState = targetState;
        const sepState = separator.morph(nxState);
        if (sepState.erred) break;
        nxState = sepState;
      }
      return update(nxState, {
        result: { type: type ? type : nxState.result.type, value: results },
      });
    });

/** Parses a string. */
const litstring = letters.map((nx) => ({
  result: {
    type: 'string',
    value: nx.result.value,
  },
}));

/** Parses a number. */
const num = digits.map((nx) => ({
  result: {
    type: 'number',
    value: Number(nx.result.value),
  },
}));

const point = order(char('('), num, char(','), num, char(')')).map((nx) => ({
  result: {
    type: 'point',
    value: [Number(nx.results[1].value), Number(nx.results[3].value)],
  },
}));
const lazy = (thunkp: Thunk) =>
  new Parser((state: State) => {
    const parser = thunkp();
    return parser.morph(state);
  });

const word = (...parsers: Parser[]) =>
  order(...parsers).map((nx, cx) => ({
    result: {
      value: nx.src.slice(cx.pos, nx.pos),
      type: 'word',
    },
    results: [{ type: 'word', value: nx.src.slice(cx.pos, nx.pos) }],
  }));

export {
  char,
  order,
  anyOf,
  letters,
  point,
  digits,
  many,
  atLeast1,
  litstring,
  num,
  nested,
  sep,
  lazy,
  Parser,
  anyspace,
  word,
  or,
  xor,
};
