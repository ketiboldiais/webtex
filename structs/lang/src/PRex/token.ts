export enum TokenType {
  // literals
  INTEGER = 'integer',
  REAL = 'real',
  STRING = 'string',
  BOOL = 'boolean',
  NULL = 'null',

  // operators
  EQUAL = '=',
  PLUS = '+',
  CONCAT = '++',
  MINUS = '-',
  MUL = '*',
  DIV = '/',
  QUOT = '%',
  CARET = '^',
  DOLLAR = '$',
  TILDE = '~',
  AMP = '&',
  VBAR = '|',
  QUERY = '?',
  LT = '<',
  GT = '>',
  LTE = '<=',
  GTE = '>=',
  BANG = '!',
  BANG_EQUAL = '!=',
  EQUAL_EQUAL = '==',

  // brackets
  LPAREN = '(',
  RPAREN = ')',
  LBRACE = '{',
  RBRACE = '}',
  LBRACKET = '[',
  RBRACKET = ']',

  // punctuation
  COMMA = ',',
  DOT = '.',
  SEMICOLON = ';',

  // keywords
  SYMBOL = 'symbol',
  KEYWORD = 'keyword',
  LET = 'let',
  IF = 'if',
  ELSE = 'else',

  // logic-operators
  AND = 'and',
  OR = 'or',
  XOR = 'xor',
  NOR = 'nor',
  XNOR = 'xnor',
  NOT = 'not',
  NAND = 'nand',

  // math-operators
  MOD = 'mod',
  REM = 'rem',
  LN = 'ln',
  LG = 'lg',
  LOG = 'log',
  SQRT = 'sqrt',

  // internals
  ERROR = 'ERROR',
  EOF = 'EOF',
}

// webtex-specific keywords
export const keywords = new Map<string, TokenType>([
  ['if', TokenType.IF],
  ['let', TokenType.LET],
  ['else', TokenType.ELSE],
  ['and', TokenType.AND],
  ['or', TokenType.OR],
  ['xor', TokenType.XOR],
  ['xnor', TokenType.XNOR],
  ['nor', TokenType.NOR],
  ['not', TokenType.NOT],
  ['mod', TokenType.MOD],
  ['rem', TokenType.REM],
  ['log', TokenType.LOG],
  ['ln', TokenType.LN],
  ['lg', TokenType.LG],
  ['sqrt', TokenType.SQRT],
]);
