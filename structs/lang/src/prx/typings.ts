import { TokenType } from './tokenizer';

export interface Token {
  value: any;
  type: TokenType;
  line: number;
}

export enum NodeType {
  PROGRAM = 'program',
  BLOCK = 'block',
  VAR = 'variable-declaration',
  EMPTY_STATEMENT = 'empty-statement',
  CONDITIONAL = 'conditional-statement',
  ALGEBRA = 'algebra',

  // collections
  STRUCT = 'struct',
  PROPERTY = 'property',
  ARRAY = 'array',
  SET = 'set',

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
