export enum TOKEN {
  EOF, ERROR, NIL,

  COMMA, QUERY, LPAREN, RPAREN,
  LBRACKET, RBRACKET, LBRACE,
  RBRACE, DQUOTE, SEMICOLON,
  COLON, VBAR,
  
  CALL,

  DOT, PLUS, PLUS_PLUS,
  SQUOTE, MINUS, STAR,
  SLASH, PERCENT, CARET, BANG,
  MOD, DIV, REM, TO, DEQUAL,
  NEQ, LT, GT, GTE, LTE,
  EQUAL, TILDE, ASSIGN, AMP,
  LSHIFT, RSHIFT, NEGATE,
  IN, NOT, OR, NOR,
  XOR, XNOR, AND, NAND,
  
  THROW, ELSE, FOR, FUNCTION, IF,
  RETURN, THIS, WHILE, DO,
  LET, CONST,

  FALSE, TRUE, INF, NAN, NULL,
  SYMBOL, STRING, INT, FRAC,
  FLOAT, HEX, BINARY, OCTAL,
  SCINUM, COMPLEX,
}

export enum PREC {
  NIL,
  
  /** For utility types. */
  NON,

  /** E.g., equality. */
  LOW,

  /** E.g., inequality. */
  LMID,

  /** E.g., Sums. */
  MID,

  /** E.g., Products. */
  UMID,

  /** E.g., Exponentiation and modulo. */
  HIGH,

  /** E.g., prefix operators. */
  TOP,

  /** E.g., postfix operators */
  PEAK,

  /** E.g., Postfix operators and function calls. */
  APEX,
}

export enum FIX {
  NON,
  CHAIN,
  LEFT,
  RIGHT,
}

export enum KIND {
  UTIL,
  DELIM,
  KEYWORD,
  ILLEGAL,
  PREFIX,
  INFIX,
  POSTFIX,
  MIXFIX,
  ATOMIC,
}

export enum NODE {
  BLOCK,
  WHILE,
  ERROR,
  GROUP,
  TUPLE,
  VECTOR,
  MATRIX,
  COND,
  NULL,
  BOOL,
  NUMBER,
  SYMBOL,
  STRING,
  VARIABLE_DECLARATION,
  FUNCTION_DECLARATION,
  ASSIGNMENT,
  ALGEBRAIC_EXPRESSION,
  UNARY_EXPRESSION,
  BINARY_EXPRESSION,
  CALL_EXPRESSION,
  ROOT,
}



export type NUM_TOKEN =
  | TOKEN.INT
  | TOKEN.FLOAT
  | TOKEN.FRAC
  | TOKEN.HEX
  | TOKEN.BINARY
  | TOKEN.OCTAL
  | TOKEN.SCINUM
  | TOKEN.COMPLEX;

export const keywords = {
  [`and`]: TOKEN.AND,
  [`nand`]: TOKEN.NAND,
  [`throw`]: TOKEN.THROW,
  [`else`]: TOKEN.ELSE,
  [`for`]: TOKEN.FOR,
  [`function`]: TOKEN.FUNCTION,
  [`if`]: TOKEN.IF,
  [`in`]: TOKEN.IN,
  [`return`]: TOKEN.RETURN,
  [`this`]: TOKEN.THIS,
  [`while`]: TOKEN.WHILE,
  [`do`]: TOKEN.DO,
  [`Inf`]: TOKEN.INF,
  [`mod`]: TOKEN.MOD,
  [`nor`]: TOKEN.NOR,
  [`NaN`]: TOKEN.NAN,
  [`not`]: TOKEN.NOT,
  [`null`]: TOKEN.NULL,
  [`or`]: TOKEN.OR,
  [`rem`]: TOKEN.REM,
  [`to`]: TOKEN.TO,
  [`true`]: TOKEN.TRUE,
  [`false`]: TOKEN.FALSE,
  [`xor`]: TOKEN.XOR,
  [`xnor`]: TOKEN.XNOR,
  [`let`]: TOKEN.LET,
  [`const`]: TOKEN.CONST,
};
export type Keyword = keyof typeof keywords;
export type Entry = {
  kind: KIND;
  prec: PREC;
  fixity: FIX;
};
export const TokenRecord: { [k in TOKEN]: Entry } = {
  [TOKEN.EOF]: { kind: KIND.UTIL, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.ERROR]: { kind: KIND.UTIL, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.NIL]: { kind: KIND.UTIL, prec: PREC.NON, fixity: FIX.NON },
  
  [TOKEN.COMMA]: { kind: KIND.DELIM, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.QUERY]: { kind: KIND.DELIM, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.LPAREN]: { kind: KIND.DELIM, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.RPAREN]: { kind: KIND.DELIM, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.LBRACKET]: { kind: KIND.DELIM, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.RBRACKET]: { kind: KIND.DELIM, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.LBRACE]: { kind: KIND.DELIM, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.RBRACE]: { kind: KIND.DELIM, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.DQUOTE]: { kind: KIND.DELIM, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.SEMICOLON]: { kind: KIND.DELIM, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.COLON]: { kind: KIND.DELIM, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.VBAR]: { kind: KIND.DELIM, prec: PREC.NON, fixity: FIX.NON },
  
  [TOKEN.SQUOTE]: { kind: KIND.POSTFIX, prec: PREC.PEAK, fixity: FIX.LEFT },
  [TOKEN.BANG]: { kind: KIND.POSTFIX, prec: PREC.PEAK, fixity: FIX.LEFT },

  [TOKEN.CALL]: { kind: KIND.PREFIX, prec: PREC.PEAK, fixity: FIX.RIGHT },
  [TOKEN.DOT]: { kind: KIND.INFIX, prec: PREC.PEAK, fixity: FIX.RIGHT },
  [TOKEN.MINUS]: { kind: KIND.INFIX, prec: PREC.MID, fixity: FIX.LEFT },
  [TOKEN.PLUS]: { kind: KIND.INFIX, prec: PREC.MID, fixity: FIX.LEFT },
  [TOKEN.STAR]: { kind: KIND.INFIX, prec: PREC.UMID, fixity: FIX.LEFT },
  [TOKEN.SLASH]: { kind: KIND.INFIX, prec: PREC.UMID, fixity: FIX.LEFT },
  [TOKEN.CARET]: { kind: KIND.INFIX, prec: PREC.HIGH, fixity: FIX.RIGHT },
  [TOKEN.IN]: { kind: KIND.INFIX, prec: PREC.LMID, fixity: FIX.LEFT },
  [TOKEN.PERCENT]: { kind: KIND.INFIX, prec: PREC.HIGH, fixity: FIX.NON },
  [TOKEN.MOD]: { kind: KIND.INFIX, prec: PREC.HIGH, fixity: FIX.LEFT },
  [TOKEN.DIV]: { kind: KIND.INFIX, prec: PREC.HIGH, fixity: FIX.LEFT },
  [TOKEN.REM]: { kind: KIND.INFIX, prec: PREC.HIGH, fixity: FIX.LEFT },
  [TOKEN.TO]: { kind: KIND.INFIX, prec: PREC.TOP, fixity: FIX.LEFT },
  [TOKEN.DEQUAL]: { kind: KIND.INFIX, prec: PREC.LOW, fixity: FIX.CHAIN },
  [TOKEN.EQUAL]: { kind: KIND.INFIX, prec: PREC.LOW, fixity: FIX.CHAIN },
  [TOKEN.NEQ]: { kind: KIND.INFIX, prec: PREC.LOW, fixity: FIX.CHAIN },
  [TOKEN.LT]: { kind: KIND.INFIX, prec: PREC.LOW, fixity: FIX.CHAIN },
  [TOKEN.GT]: { kind: KIND.INFIX, prec: PREC.LOW, fixity: FIX.CHAIN },
  [TOKEN.GTE]: { kind: KIND.INFIX, prec: PREC.LOW, fixity: FIX.CHAIN },
  [TOKEN.LTE]: { kind: KIND.INFIX, prec: PREC.LOW, fixity: FIX.CHAIN },
  [TOKEN.TILDE]: { kind: KIND.PREFIX, prec: PREC.MID, fixity: FIX.CHAIN },
  [TOKEN.PLUS_PLUS]: { kind: KIND.INFIX, prec: PREC.MID, fixity: FIX.LEFT },
  [TOKEN.AMP]: { kind: KIND.INFIX, prec: PREC.MID, fixity: FIX.LEFT },
  [TOKEN.LSHIFT]: { kind: KIND.INFIX, prec: PREC.MID, fixity: FIX.LEFT },
  [TOKEN.RSHIFT]: { kind: KIND.INFIX, prec: PREC.MID, fixity: FIX.LEFT },
  [TOKEN.NEGATE]: { kind: KIND.PREFIX, prec: PREC.TOP, fixity: FIX.RIGHT },
  [TOKEN.NOT]: { kind: KIND.PREFIX, prec: PREC.TOP, fixity: FIX.RIGHT },
  [TOKEN.OR]: { kind: KIND.INFIX, prec: PREC.LOW, fixity: FIX.LEFT },
  [TOKEN.NOR]: { kind: KIND.INFIX, prec: PREC.LMID, fixity: FIX.LEFT },
  [TOKEN.XOR]: { kind: KIND.INFIX, prec: PREC.MID, fixity: FIX.LEFT },
  [TOKEN.XNOR]: { kind: KIND.INFIX, prec: PREC.UMID, fixity: FIX.LEFT },
  [TOKEN.AND]: { kind: KIND.INFIX, prec: PREC.HIGH, fixity: FIX.NON },
  [TOKEN.NAND]: { kind: KIND.UTIL, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.ASSIGN]: { kind: KIND.INFIX, prec: PREC.LOW, fixity: FIX.RIGHT },
  /**
   * The following are keywords.
   * If the token class is `illegal`,
   * then the keyword is either disallowed
   * in the language or unimplemented.
   */
  [TOKEN.IF]: { kind: KIND.KEYWORD, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.ELSE]: { kind: KIND.KEYWORD, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.WHILE]: { kind: KIND.KEYWORD, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.LET]: { kind: KIND.KEYWORD, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.FOR]: { kind: KIND.ILLEGAL, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.FUNCTION]: { kind: KIND.ILLEGAL, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.RETURN]: { kind: KIND.ILLEGAL, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.THIS]: { kind: KIND.ILLEGAL, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.DO]: { kind: KIND.ILLEGAL, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.CONST]: { kind: KIND.ILLEGAL, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.THROW]: { kind: KIND.ILLEGAL, prec: PREC.NON, fixity: FIX.NON },
  /**
   * These are atomic values.
   */
  [TOKEN.FALSE]: { kind: KIND.ATOMIC, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.TRUE]: { kind: KIND.ATOMIC, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.INF]: { kind: KIND.ATOMIC, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.NAN]: { kind: KIND.ATOMIC, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.NULL]: { kind: KIND.ATOMIC, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.SYMBOL]: { kind: KIND.ATOMIC, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.STRING]: { kind: KIND.ATOMIC, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.INT]: { kind: KIND.ATOMIC, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.FRAC]: { kind: KIND.ATOMIC, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.FLOAT]: { kind: KIND.ATOMIC, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.HEX]: { kind: KIND.ATOMIC, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.BINARY]: { kind: KIND.ATOMIC, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.OCTAL]: { kind: KIND.ATOMIC, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.SCINUM]: { kind: KIND.ATOMIC, prec: PREC.NON, fixity: FIX.NON },
  [TOKEN.COMPLEX]: { kind: KIND.ATOMIC, prec: PREC.NON, fixity: FIX.NON },
};

export const numerics: { [key in NUM_TOKEN]: boolean } = {
  [TOKEN.INT]: true,
  [TOKEN.FRAC]: true,
  [TOKEN.FLOAT]: true,
  [TOKEN.HEX]: true,
  [TOKEN.BINARY]: true,
  [TOKEN.OCTAL]: true,
  [TOKEN.SCINUM]: true,
  [TOKEN.COMPLEX]: true,
} as const;


export const token = {
  eof: 0,
  error: 1,
  nil: 2,
  number: 3,
  string: 4,
  symbol: 5,
  keyword: 6,
  func: 7,
  delimiter: 9,
  illegal: 10,
};

export type TexTokenType = keyof typeof token;