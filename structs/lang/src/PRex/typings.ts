import { TokenType } from './token';

export interface Token {
  value: any;
  type: TokenType;
  line: number;
}

export enum NodeType {
  PROGRAM = 'program',
  INTEGER = 'integer',
  REAL = 'real',
  STRING = 'string',
  BOOL = 'bool',
  NULL = 'null',
  SYMBOL = 'symbol',
  BINARY_EXPRESSION = 'binary-expression',
  UNARY_EXPRESSION = 'unary-expression',
  PARSER_ERROR = 'ERROR',
}

export type ValueType =
  | 'null'
  | 'integer'
  | 'real'
  | 'string'
  | 'bool'
  | 'runtimeError';

export interface RuntimeVal {
  type: ValueType;
}

export interface NullVal extends RuntimeVal {
  type: 'null';
  value: null;
}

export interface StrVal extends RuntimeVal {
  type: 'string';
  value: string;
}

export interface IntVal extends RuntimeVal {
  type: 'integer';
  value: number;
}

export interface RealVal extends RuntimeVal {
  type: 'real';
  value: number;
}

export type NumVal = IntVal | RealVal;

export interface BoolVal extends RuntimeVal {
  type: 'bool';
  value: boolean;
}

export interface RuntimeErr extends RuntimeVal {
  type: 'runtimeError';
  value: string;
}
