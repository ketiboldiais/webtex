declare global {
  type Result = {
    type: string;
    value: any;
  };
  type Thunk = () => Parser;
  type State = {
    src: string;
    pos: number;
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
  type Morphism = (nextState: State, currentState: State) => Partial<State>;
  type Update = Partial<State>;
}

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
