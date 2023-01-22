import { TokenType } from './token';

export interface Token {
  value: any;
  type: TokenType;
  line: number;
}

export enum NodeType {
  PROGRAM = 'program',
  VAR = 'variable-declaration',

  // expressions
  INTEGER = 'integer',
  REAL = 'real',
  STRING = 'string',
  BOOL = 'bool',
  NULL = 'null',
  SYMBOL = 'symbol',
  BINARY_EXPRESSION = 'binary-expression',
  UNARY_EXPRESSION = 'unary-expression',
  ASSIGNMENT_EXPRESSION = 'assignment-expression',
  PARSER_ERROR = 'ERROR',
}

export type ValueType =
  | 'null'
  | 'integer'
  | 'real'
  | 'string'
  | 'bool'
  | 'symbol'
  | 'Runtime-error';
