export type Delimiter = '(' | ')' | '{' | '}' | '[' | ']';
export type NumberType =
  | 'natural'
  | 'integer'
  | 'scientific'
  | 'rational'
  | 'real'
  | 'inf';
export type RelOp = '<' | '>' | '<=' | '>=' | '=' | '==' | '!=';
export type EqOp = Extract<RelOp, '=' | '=='>;
export type IneqOp = Exclude<RelOp, '=' | '=='>;
export type LogicOp = 'and' | 'or' | 'not' | 'xor' | 'xnor' | 'nand' | 'nor';
export type BinaryLogicOp = Exclude<LogicOp, 'not'>;
export type BinaryMathOp = '+' | '-' | '*' | '/' | '%' | '^' | 'rem' | 'mod';
export type UnaryMathOp = '!';
export type UnaryLogicOp = 'not';
export type BinaryStringOp = '++' | '--';
export type BinaryOp = BinaryStringOp | BinaryMathOp | RelOp | BinaryLogicOp;
export type UnaryOp = UnaryMathOp | UnaryLogicOp;
export type AssignOp = ':=';
export type Operator = BinaryOp | UnaryOp | AssignOp;
export type ErrorType = 'SyntaxError' | 'RuntimeError' | 'LexerError';
export type NodeType =
  | ErrorType
  | 'program'
  | 'assignment-expression'
  | 'var-declaration-expression'
  | 'const-declaration-expression'
  | 'binary-expression'
  | 'math-binary-expression'
  | 'string-binary-expression'
  | 'logical-binary-expression'
  | 'logical-unary-expression'
  | 'equation'
  | 'block'
  | 'inequation'
  | 'unary-postfix-expression'
  | 'factorial-expression'
  | 'operator'
  | 'identifier'
  | 'array'
  | 'null'
  | 'boolean'
  | 'string'
  | 'function-definition'
  | NumberType
  | Punct
  | Delimiter
  | Keyword
  | Operator;
export type Keyword = 'let' | 'const' | 'var' | 'return';
export type Punct = ';' | ',';
export type WhiteSpace = 'space' | 'newline' | 'tab' | 'enter';
