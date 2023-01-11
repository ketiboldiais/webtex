interface Sys {
  ['string']: string;
  ['number']: number;
  ['boolean']: boolean;
  ['point']: [number, number];
  ['matrix']: number[][];
  ['number[]']: number[];
  ['string[]']: string[];
  ['object']: { [key: string]: Sys[keyof Sys] };
  ['{}']: {};
  ['symbol']: symbol;
}
type Result = { type: keyof Sys | string; value: Sys[keyof Sys] };
type State = {
  targetString: string;
  index: number;
  erred: boolean;
  error: string;
  result: Result;
  results: Result[];
};
type ErrorUpdater = (
  state: State,
  message: string,
  parserName?: string,
  index?: number
) => State;
type Combinator = (state: State) => State;
type ErrorTransformer = (errorMessage: string, index: number) => string;
type ChainTransformer = (result: Result) => Parser;
type Morphism = (arg1: Result, arg2: Result[]) => Result;
type Update = Partial<State>;

/** Returns a substring from `i` to `j`. */
const substr = (str: string, i: number, j?: number) => str.slice(i, j);

/** Returns `true` if the string is empty, `false` otherwise. */
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
    error: `Error in ${parser} @ target[${i}]. ${msg}`,
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
      return update(nextState, {
        result: fn(nextState.result, nextState.results),
      });
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

const between =
  (leftParser: Parser, rightParser: Parser) => (contentParser: Parser) =>
    sequenceOf(leftParser, contentParser, rightParser).map(
      (_, results) => results[1]
    );

const char = (str: string) =>
  new Parser((state: State) => {
    const { targetString, index, erred } = state;
    if (erred) return state;
    const target = substr(targetString, index);
    if (isBlank(target)) return err(state, 'abrupt end', 'char', state.index);
    if (target.startsWith(str))
      return update(state, {
        index: index + str.length,
        result: { type: 'string', value: str },
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

const letters = pRegexer(/^[A-Za-z]+/);
const digits = pRegexer(/^[0-9]+/);

/**
 * Parse according to the rule: “The input must have exactly this sequence.”
 * @param parsers - Comma-separated argument list of parsers.
 */
const sequenceOf = (...parsers: Parser[]) =>
  new Parser((state: State) => {
    if (state.erred) return state;
    let results: Result[] = [];
    let nextState = state;
    for (let p of parsers) {
      nextState = p.morph(nextState);
      if (nextState.error)
        return err(nextState, '', 'sequenceOf', nextState.index);
      results.push(nextState.result);
    }
    return update(nextState, { results });
  });

/**
 * Parses according to the rule: “The input can have any of these symbols.”
 * @param parsers - Comma-separated argument list of parsers.
 */
const choiceOf = (...parsers: Parser[]) =>
  new Parser((state: State) => {
    if (state.erred) return state;
    for (let p of parsers) {
      const nextState = p.morph(state);
      if (!nextState.error) return nextState;
    }
    return err(state, `No match.`, 'choiceOf', state.index);
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
const parenthesized = between(char('('), char(')'));

/** Parse everything between braces. */
const braced = between(char('{'), char('}'));

/** Parses symbols separated by the specified separator. */
const sep =
  (separator: Parser, type?: string) => (valueParser: Parser) =>
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
const stringParser = letters.map((res) => ({
  type: 'string',
  value: res.value,
}));

/** Parses a number. */
const numParser = digits.map((res, _) => ({
  type: 'number',
  value: Number(res.value),
}));

const { log: show } = console;

/** Parses a pair. */
const pointParser = sequenceOf(
  char('('),
  numParser,
  char(','),
  numParser,
  char(')')
).map((_, results) => ({
  type: 'point',
  value: [Number(results[1].value), Number(results[3].value)],
}));

type Thunk = () => Parser;
const lazy = (thunkp: Thunk) =>
  new Parser((state: State) => {
    const parser = thunkp();
    return parser.morph(state);
  });

/**
 * Parse everything between square brackets.
 */
const bracketed = between(char('['), char(']'));

const numSep = sep(char(','), 'number[]');
const strSep = sep(char(','), 'string[]');

const numvals = lazy(() => choiceOf(numParser, numtup));
const strvals = lazy(() => choiceOf(stringParser, strtup));

const numtup = bracketed(numSep(numvals));
const strtup = bracketed(strSep(strvals));

const parser = numtup;
// const parser = strtup;

show(parser.run('[1,2,3,[8,9,10],4,5]'));
// show(parser.run(`[a,b,[x,y],c]`));

export {
  char,
  sequenceOf,
  choiceOf,
  letters,
  digits,
  many,
  atLeast1,
  stringParser,
  parenthesized,
  bracketed,
  braced,
  sep,
  Parser,
};
