type Result = { type: string; value: any };
type ParserState = {
  targetString: string;
  index: number;
  isError: boolean;
  error: string;
  result: Result;
  results: Result[];
};
type ErrorUpdater = (state: ParserState, message: string) => ParserState;
type ExpectError = (
  state: ParserState,
  exp: string,
  got: string
) => ParserState;
type ParseFn = (state: ParserState) => ParserState;
type str_str = (s: string, i: number, j?: number) => string;
type str_bool = (s: string) => boolean;

const substr: str_str = (str, i, j) => str.slice(i, j);
const isEmptyString: str_bool = (str) => str.length === 0;

const newState = <T>(targetObject: T, update: Partial<T>) => {
  return Object.assign({}, targetObject, update);
};

const newError: ErrorUpdater = (state, message) =>
  newState(state, {
    isError: true,
    error: message,
  });

const errEOI = (state: ParserState): ParserState =>
  newError(state, 'Unexpected end of input.');

const newExpectError: ExpectError = (state, exp, got) =>
  newError(state, `Expected: ${exp}, got: ${got}`);

type Transformer = (arg1: Result, arg2: Result[]) => Result;
type ErrorTransformer = (errorMessage: string, index: number) => string;
type ChainTransformer = (result: Result) => Parser;
class Parser {
  constructor(public transformer: ParseFn) {
    this.transformer = transformer;
  }
  run(targetString: string) {
    const initState: ParserState = {
      targetString,
      index: 0,
      result: { type: 'string', value: '' },
      results: [],
      isError: false,
      error: '',
    };
    return this.transformer(initState);
  }
  map(fn: Transformer) {
    return new Parser((parserState: ParserState) => {
      const nextState = this.transformer(parserState);
      if (nextState.isError) return nextState;
      // console.log(fn.arguments)
      return newState(nextState, {
        result: fn(nextState.result, nextState.results),
      });
    });
  }
  chain(fn: ChainTransformer) {
    return new Parser((parserState: ParserState) => {
      const nextState = this.transformer(parserState);
      if (nextState.isError) return nextState;
      const nextParser = fn(nextState.result);
      return nextParser.transformer(nextState);
    });
  }
  mapError(fn: ErrorTransformer) {
    return new Parser((parserState: ParserState) => {
      const nextState = this.transformer(parserState);
      if (!nextState.isError) return nextState;
      return newError(nextState, fn(nextState.error, nextState.index));
    });
  }
}

const between =
  (leftParser: Parser, rightParser: Parser) => (contentParser: Parser) =>
    sequenceOf(leftParser, contentParser, rightParser).map(
      (_, results) => results[1]
    );

const char = (str: string) =>
  new Parser((state: ParserState) => {
    const { targetString, index, isError } = state;
    if (isError) return state;
    const target = substr(targetString, index);
    if (isEmptyString(target)) return errEOI(state);
    if (target.startsWith(str))
      return newState(state, {
        index: index + str.length,
        result: { type: 'string', value: str },
      });
    return newExpectError(state, str, substr(target, index, index + 1));
  });

const pRegexer = (regex: RegExp) =>
  new Parser((state: ParserState) => {
    const { targetString, index, isError } = state;
    if (isError) return state;
    const target = targetString.slice(index);
    if (isEmptyString(target)) return errEOI(state);
    const match = target.match(regex);
    if (match)
      return newState(state, {
        result: { type: 'string', value: match[0] },
        index: index + match[0].length,
      });
    return newError(
      state,
      `error in letter parser: No match at index ${index}`
    );
  });

const letters = pRegexer(/^[A-Za-z]+/);
const digits = pRegexer(/^[0-9]+/);

const sequenceOf = (...parsers: Parser[]) =>
  new Parser((state) => {
    if (state.isError) return state;
    let results: Result[] = [];
    let nextState = state;
    for (let p of parsers) {
      nextState = p.transformer(nextState);
      if (nextState.error)
        return newError(nextState, `Error in sequence parser.`);
      results.push(nextState.result);
    }
    return newState(nextState, { results });
  });

const choiceOf = (...parsers: Parser[]) =>
  new Parser((state) => {
    if (state.isError) return state;
    for (let p of parsers) {
      const nextState = p.transformer(state);
      if (!nextState.error) return nextState;
    }
    return newError(
      state,
      `error in choiceOf parser: No match at index ${state.index}`
    );
  });

const manyBuilder = (type: 'many' | 'atLeast1') => (parser: Parser) =>
  new Parser((state: ParserState) => {
    if (state.isError) return state;
    let nextState = state;
    const results = [];
    let done = false;
    while (!done) {
      let tempState = parser.transformer(nextState);
      if (!tempState.isError) {
        results.push(tempState.result);
        nextState = tempState;
      } else done = true;
    }
    if (type === 'atLeast1' && results.length === 0) {
      return newError(
        state,
        `Error in atLeast1 @ index: ${state.index}. No input matches.`
      );
    }
    return newState(nextState, { results });
  });

const many = manyBuilder('many');

const atLeast1 = manyBuilder('atLeast1');

const parenthesized = between(char('('), char(')'));

const bracketed = between(char('['), char(']'));

const braced = between(char('{'), char('}'));

const stringParser = letters.map((res) => ({ type: 'string', value: res }));
const numParser = digits.map((res) => ({
  type: 'number',
  value: Number(res.value),
}));

const { log: show } = console;

const tupleParser = sequenceOf(
  char('('),
  numParser,
  char(','),
  numParser,
  char(')')
).map((_, results) => ({
  type: 'tuple',
  value: [Number(results[1].value), Number(results[3].value)],
}));

const parser = tupleParser;

show(parser.run('(1,2)'));

export {
  char,
  sequenceOf,
  choiceOf,
  letters,
  digits,
  many,
  atLeast1,
  parenthesized,
  bracketed,
  braced,
  Parser,
};
