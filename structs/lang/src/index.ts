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
type Result = { type: keyof Sys; value: Sys[keyof Sys] };
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
type ParseFn = (state: State) => State;
type ErrorTransformer = (errorMessage: string, index: number) => string;
type ChainTransformer = (result: Result) => Parser;
type Transformer = (arg1: Result, arg2: Result[]) => Result;

const substr = (str: string, i: number, j?: number) => str.slice(i, j);

const isEmptyString = (str: string) => str.length === 0;

const newState = (targetObject: State, update: Partial<State>) =>
  Object.assign({}, targetObject, update);

const newError: ErrorUpdater = (state, message, parserName = '', i) =>
  newState(state, {
    erred: true,
    error: `Error in ${parserName} @ target[${i}]. ${message}`,
  });

const newExpectError = (state: State, exp: string, got: string) =>
  newError(state, `Expected: ${exp}, got: ${got}`);

class Parser {
  transformer: ParseFn;
  constructor(transformer: ParseFn) {
    this.transformer = transformer;
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
    return this.transformer(initState);
  }
  map(fn: Transformer) {
    return new Parser((state: State) => {
      const nextState = this.transformer(state);
      if (nextState.erred) return nextState;
      return newState(nextState, {
        result: fn(nextState.result, nextState.results),
      });
    });
  }
  chain(fn: ChainTransformer) {
    return new Parser((state: State) => {
      const nextState = this.transformer(state);
      if (nextState.erred) return nextState;
      const nextParser = fn(nextState.result);
      return nextParser.transformer(nextState);
    });
  }
  mapError(fn: ErrorTransformer) {
    return new Parser((state: State) => {
      const nextState = this.transformer(state);
      if (!nextState.erred) return nextState;
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
  new Parser((state: State) => {
    const { targetString, index, erred } = state;
    if (erred) return state;
    const target = substr(targetString, index);
    if (isEmptyString(target))
      return newError(state, 'abrupt end', 'char', state.index);
    if (target.startsWith(str))
      return newState(state, {
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
    if (isEmptyString(target))
      return newError(state, 'abrupt end', 'pRegexer', state.index);
    const match = target.match(regex);
    if (match)
      return newState(state, {
        result: { type: 'string', value: match[0] },
        index: index + match[0].length,
      });
    return newError(state, `No match.`, 'pRegexer', state.index);
  });

const letters = pRegexer(/^[A-Za-z]+/);
const digits = pRegexer(/^[0-9]+/);

const sequenceOf = (...parsers: Parser[]) =>
  new Parser((state: State) => {
    if (state.erred) return state;
    let results: Result[] = [];
    let nextState = state;
    for (let p of parsers) {
      nextState = p.transformer(nextState);
      if (nextState.error)
        return newError(nextState, '', 'sequenceOf', nextState.index);
      results.push(nextState.result);
    }
    return newState(nextState, { results });
  });

const choiceOf = (...parsers: Parser[]) =>
  new Parser((state: State) => {
    if (state.erred) return state;
    for (let p of parsers) {
      const nextState = p.transformer(state);
      if (!nextState.error) return nextState;
    }
    return newError(state, `No match.`, 'choiceOf', state.index);
  });

const manyBuilder = (type: 'many' | 'atLeast1') => (parser: Parser) =>
  new Parser((state: State) => {
    if (state.erred) return state;
    let nextState = state;
    const results = [];
    let done = false;
    while (!done) {
      let tempState = parser.transformer(nextState);
      if (!tempState.erred) {
        results.push(tempState.result);
        nextState = tempState;
      } else done = true;
    }
    if (type === 'atLeast1' && results.length === 0) {
      return newError(state, `No match.`, type, state.index);
    }
    return newState(nextState, { results });
  });

const many = manyBuilder('many');

const atLeast1 = manyBuilder('atLeast1');

const parenthesized = between(char('('), char(')'));

const bracketed = between(char('['), char(']'));

const braced = between(char('{'), char('}'));

const sep = (separator: Parser) => (valueParser: Parser) =>
  new Parser((state: State) => {
    if (state.erred) return newError(state, `Died abirth.`, 'sep', state.index);
    const results: Result[] = [];
    let nxState = state;
    while (true) {
      const targetState = valueParser.transformer(nxState);
      if (targetState.erred) break;
      results.push(targetState.result);
      nxState = targetState;
      const sepState = separator.transformer(nxState);
      if (sepState.erred) break;
      nxState = sepState;
    }
    return newState(nxState, { results });
  });

const stringParser = letters.map((res) => ({
  type: 'string',
  value: res.value,
}));

const numParser = digits.map((res, _) => ({
  type: 'number',
  value: Number(res.value),
}));

const { log: show } = console;

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

const parser = pointParser;

show(parser.run('(1,2)'));

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
  Parser,
};
