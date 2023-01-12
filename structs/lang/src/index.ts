export type Result = {
  type: string;
  value: any;
};
export type Thunk = () => Parser;
export type State = {
  targetString: string;
  index: number;
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
      state.targetString[state.index]
    }" | ${msg}`,
  });

const newExpectError = (state: State, exp: string, got: string) =>
  err(state, `Expected: ${exp}, got: ${got}`);

class Parser {
  morph: Combinator;
  constructor(transformer: Combinator) {
    this.morph = transformer;
  }
  run(targetString: string) {
    const initState: State = {
      targetString,
      index: 0,
      result: { type: 'string', value: '' },
      results: [],
      erred: false,
      error: '',
    };
    return this.morph(initState);
  }
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
      return err(nextState, fn(nextState.error, nextState.index));
    });
  }
}
const expected = (state: State) => state.targetString[state.index];
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
          tempState.index
        );
      tempState = contentParser.morph(tempState);
      if (tempState.erred)
        return err(
          tempState,
          `delimited content error`,
          'between',
          tempState.index
        );
      let contentState = tempState;
      tempState = rightParser.morph(tempState);
      if (tempState.erred)
        return err(
          tempState,
          `Right delimiter missing: ${expected(state)}`,
          'between',
          tempState.index
        );

      const out = update(contentState, {
        results: contentState.results,
        index: tempState.index,
      });
      return out;
    });

const char = (str: string, type = 'string') =>
  new Parser((state: State) => {
    const { targetString, index, erred } = state;
    if (erred) return state;
    const target = targetString.slice(index);
    if (isBlank(target)) return err(state, 'abrupt end', 'char', state.index);
    if (target.startsWith(str))
      return update(state, {
        index: index + str.length,
        result: { type, value: str },
      });
    return newExpectError(state, str, substr(target, index, index + 1));
  });

const pRegexer = (regex: RegExp) =>
  new Parser((state: State) => {
    const { targetString, index, erred } = state;
    if (erred) return state;
    const target = targetString.slice(index);
    if (isBlank(target))
      return err(state, 'abrupt end', 'pRegexer', state.index);
    const match = target.match(regex);
    if (match)
      return update(state, {
        result: { type: 'string', value: match[0] },
        index: index + match[0].length,
      });
    return err(state, `No match.`, 'pRegexer', state.index);
  });
const anyspace = pRegexer(/\s*/);
const letters = pRegexer(/^[A-Za-z]+/);
const digits = pRegexer(/^[0-9]+/);

/**
 * Parse according to the rule: “The input must have exactly this sequence.”
 * @param parsers - Comma-separated argument list of parsers.
 */
const order = (...parsers: Parser[]) =>
  new Parser((state: State) => {
    if (state.erred) return state;
    let results: Result[] = [];
    let nextState = state;
    for (let p of parsers) {
      nextState = p.morph(nextState);
      if (nextState.error) return err(nextState, '', 'order', nextState.index);
      results.push(nextState.result);
    }
    return update(nextState, { results });
  });

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
    return err(state, `No match.`, 'choiceOf', state.index);
  });
const or = (parser1: Parser, parser2: Parser) =>
  new Parser((state: State) => {
    const { targetString, index } = state;
    if (state.erred) return state;
    const res1 = parser1.run(substr(targetString, index));
    if (!res1.erred) return res1;
    const res2 = parser2.run(substr(targetString, index));
    if (!res2.erred) return res2;
    return err(state, 'no match found', 'or', state.index);
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
      return err(state, `No match.`, type, state.index);
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

/** Parse everything between parentheses. */
const parenthesized = nested(char('('), char(')'));

/** Parse everything between braces. */
const braced = nested(char('{'), char('}'));

/** Parse everything between double quotes. */
const dquoted = nested(char('"'), char('"'));

/** Parse everything between single quotes. */
const squoted = nested(char(`'`), char(`'`));

/** Parses symbols separated by the specified separator. */
const sep =
  (separator: Parser, type = 'seperator') =>
  (valueParser: Parser) =>
    new Parser((state: State) => {
      if (state.erred) return err(state, `Died abirth.`, 'sep', state.index);
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
const bracketed = nested(char('['), char(']'));
const numSep = sep(char(','), 'number[]');
const strSep = sep(char(','), 'string[]');
const numvals = lazy(() => anyOf(num, numtup));
const strvals = lazy(() => anyOf(litstring, strtup));
const numtup = bracketed(numSep(numvals));
const strtup = bracketed(strSep(strvals));

const word = (...parsers: Parser[]) =>
  order(...parsers).map((nx, cur) => ({
    result: {
      type: 'word',
      value: nx.targetString.slice(cur.index, nx.index),
    },
    results: [
      { type: 'word', value: nx.targetString.slice(cur.index, nx.index) },
    ],
  }));

export {
  char,
  order,
  anyOf,
  letters,
  numtup,
  strtup,
  point,
  digits,
  many,
  atLeast1,
  litstring,
  num,
  parenthesized,
  bracketed,
  nested,
  braced,
  sep,
  dquoted,
  squoted,
  lazy,
  Parser,
  anyspace,
  word,
  or,
};
