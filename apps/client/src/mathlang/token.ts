export enum TOKEN {
  /* -------------------------------------------------------------------------- */
  /* § Utility Tokens                                                           */
  /* -------------------------------------------------------------------------- */
  /** End of file token. */
  EOF,
  /** Lexing error token. */
  ERROR,
  /** No input received token. */
  NIL,

  /* -------------------------------------------------------------------------- */
  /* § Delimiter Tokens                                                         */
  /* -------------------------------------------------------------------------- */
  /** Lexeme: `,` */
  COMMA,

  /** Lexeme: `?` */
  EROTEME,

  /** Lexeme: `(` */
  LEFT_PAREN,

  /** Lexeme: `)` */
  RIGHT_PAREN,

  /** Lexeme: `[` */
  LEFT_BRACKET,

  /** Lexeme: `]` */
  RIGHT_BRACKET,

  /** Lexeme: `{` */
  LEFT_BRACE,

  /** Lexeme: `}` */
  RIGHT_BRACE,

  /** Lexeme: `"` */
  DOUBLE_QUOTE,

  /** Lexeme: `;` */
  SEMICOLON,

  /** Lexeme: `:` */
  COLON,

  /** Lexeme: `|` */
  VBAR,

  /** Lexeme: `.`, binary operator - function composition */
  DOT,

  /* -------------------------------------------------------------------------- */
  /* § Math Operator Tokens                                                     */
  /* -------------------------------------------------------------------------- */
  /** Lexeme: `+`, binary operator */
  PLUS,

  /** Lexeme: `'`, unary operator */
  SINGLE_QUOTE, 

  /** Lexeme: `-`, binary operator */
  MINUS,

  /** Lexeme: `-`, unary operator */
  UNARY_MINUS,

  /** Lexeme: `*`, binary operator */
  STAR,

  /** Lexeme: `/`, binary operator */
  SLASH,

  /** Lexeme: `%`, binary operator */
  PERCENT,

  /** Lexeme: `^`, binary operator */
  CARET,

  /** Lexeme: `!`, unary operator */
  BANG,

  /** Lexeme: `mod`, binary operator */
  MOD,

  /** Lexeme: `//`, binary operator */
  DIV,

  /** Lexeme: `rem`, binary operator */
  REM,

  /** Lexeme: `to`, binary operator */
  TO,

  /* -------------------------------------------------------------------------- */
  /* § List Operator Tokens                                                     */
  /* -------------------------------------------------------------------------- */
  /** Lexeme: `.+`, binary operator */
  DOT_PLUS,

  /** Lexeme: `.-`, binary operator */
  DOT_MINUS,

  /** Lexeme: `.*`, binary operator */
  DOT_STAR,

  /** Lexeme: `./`, binary operator */
  DOT_SLASH,

  /** Lexeme: `.%`, binary operator */
  DOT_PERCENT,

  /** Lexeme: `.^`, binary operator */
  DOT_CARET,

  /* -------------------------------------------------------------------------- */
  /* § Relational Operator Tokens                                               */
  /* -------------------------------------------------------------------------- */
  /** Lexeme: `==`, binary operator */
  DEQUAL, 

  /** Lexeme: `!=`, binary operator */
  NEQ,

  /** Lexeme: `<`, binary operator */
  LT,

  /** Lexeme: `>`, binary operator */
  GT,

  /** Lexeme: `>=`, binary operator */
  GTE,

  /** Lexeme: `<=`, binary operator */
  LTE,

  /** Lexeme: `=`, binary operator */
  EQUAL,

  /** Lexeme: `~`, unary operator */
  TILDE,

  /* -------------------------------------------------------------------------- */
  /* § Assignment Token                                                         */
  /* -------------------------------------------------------------------------- */
  /** Lexeme: `:=` */
  ASSIGN,

  /* -------------------------------------------------------------------------- */
  /* § Bitwise Operator Tokens                                                  */
  /* -------------------------------------------------------------------------- */
  /** Lexeme: `&`, binary operator */
  AMP,

  /** Lexeme: `>>`, binary operator */
  LSHIFT,

  /** Lexeme: `<<`, binary operator */
  RSHIFT,

  /** Lexeme: `>>>`, binary operator */
  LOG_SHIFT,

  /* -------------------------------------------------------------------------- */
  /* § Logical Operator Tokens                                                  */
  /* -------------------------------------------------------------------------- */
  /** Lexeme: `nor`, binary operator */
  NOR,

  /** Lexeme: `not`, unary operator */
  NOT,

  /** Lexeme: `or`, binary operator */
  OR,

  /** Lexeme: `xor`, binary operator */
  XOR,

  /** Lexeme: `xnor`, binary operator */
  XNOR,

  /** Lexeme: `and`, binary operator */
  AND,

  /** Lexeme: `nand`, binary operator */
  NAND,

  /* -------------------------------------------------------------------------- */
  /* § Keyword Tokens                                                           */
  /* -------------------------------------------------------------------------- */
  /** Lexeme: `exp` */
  EXP,

  /** Lexeme: `class` */
  CLASS,

  /** Lexeme: `throw` */
  THROW,

  /** Lexeme: `else` */
  ELSE,

  /** Lexeme: `for` */
  FOR,

  /** Lexeme: `function` */
  FUNCTION,

  /** Lexeme: `fn` */
  FN,

  /** Lexeme: `if` */
  IF,

  /** Lexeme: `return` */
  RETURN,

  /** Lexeme: `super` */
  SUPER,

  /** Lexeme: `this` */
  THIS,

  /** Lexeme: `that` */
  THAT,

  /** Lexeme: `while` */
  WHILE,

  /** Lexeme: `do` */
  DO,

  /** Lexeme: `let` */
  LET,

  /** Lexeme: `var` */
  VAR,

  /** Lexeme: `const` */
  CONST,

  /* -------------------------------------------------------------------------- */
  /* § Named Constant Tokens                                                    */
  /* -------------------------------------------------------------------------- */
  /** Lexeme: `false` */
  FALSE,

  /** Lexeme: `true` */
  TRUE,

  /** Lexeme: `inf` */
  INF,

  /** Lexeme: `NaN` */
  NAN,

  /** Lexeme: `null` */
  NULL,

  /** Lexeme: `[a-zA-Z_]` */
  SYMBOL,

  /** Lexeme: any character */
  STRING,

  // number data types
  INTEGER,
  FLOAT,
  FRACTION,
  COMPLEX_NUMBER,
  OCTAL_NUMBER,
  HEX_NUMBER,
  BINARY_NUMBER,
  SCIENTIFIC_NUMBER,
}

export type NUM_TOKEN =
  | TOKEN.INTEGER
  | TOKEN.FRACTION
  | TOKEN.FLOAT
  | TOKEN.COMPLEX_NUMBER
  | TOKEN.OCTAL_NUMBER
  | TOKEN.HEX_NUMBER
  | TOKEN.BINARY_NUMBER
  | TOKEN.SCIENTIFIC_NUMBER;

export class TokenStream {
  tokens: Token[];
  length: number;
  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.length = tokens.length;
  }
  toString() {
    function buildTokenString(token: Token) {
      const lex = ` ${token.lexeme}`.padEnd(12);
      const line = ` ${token.line}`.padEnd(8);
      const type = ` ${TOKEN[token.type]}`.padEnd(25);
      return `|${lex}|${line}|${type}|`;
    }
    const lex = ` Token`.padEnd(12);
    const line = ` Line`.padEnd(8);
    const type = ` Type`.padEnd(25);
    const _lex = `------------`;
    const _line = `--------`;
    const _type = `-------------------------`;
    const header = `|${lex}|${line}|${type}|\n`;
    const _header = `|${_lex}|${_line}|${_type}|\n`;
    let str = header + _header;
    for (let i = 0; i < this.length; i++) {
      str += buildTokenString(this.tokens[i]) + `\n`;
    }
    return str;
  }
}

export const keywords = {
  [`and`]: TOKEN.AND,
  [`nand`]: TOKEN.NAND,
  [`class`]: TOKEN.CLASS,
  [`throw`]: TOKEN.THROW,
  [`else`]: TOKEN.ELSE,
  [`for`]: TOKEN.FOR,
  [`function`]: TOKEN.FUNCTION,
  [`fn`]: TOKEN.FN,
  [`if`]: TOKEN.IF,
  [`return`]: TOKEN.RETURN,
  [`super`]: TOKEN.SUPER,
  [`this`]: TOKEN.THIS,
  [`that`]: TOKEN.THAT,
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
  [`var`]: TOKEN.VAR,
  [`const`]: TOKEN.CONST,
  [`exp`]: TOKEN.EXP,
};
export type Keyword = keyof typeof keywords;
export type LEXEME = Lexeme | Keyword;

/* -------------------------------------------------------------------------- */
/* § Token Definitions                                                        */
/* -------------------------------------------------------------------------- */

export interface Token {
  type: TOKEN;
  lexeme: string;
  line: number;
}
export class Token {
  constructor(type: TOKEN, lexeme: string, line: number) {
    this.type = type;
    this.lexeme = lexeme;
    this.line = line;
  }
  get isNil() {
    return this.type === TOKEN.NIL;
  }
  static nil = new Token(TOKEN.NIL, "", -1);
  get isLeftParen() {
    return this.type === TOKEN.LEFT_PAREN;
  }
  get isFalse() {
    return this.type === TOKEN.FALSE;
  }
  get isTrue() {
    return this.type === TOKEN.TRUE;
  }
  get isInf() {
    return this.type === TOKEN.INF;
  }
  get isNAN() {
    return this.type === TOKEN.NAN;
  }
  get isNull() {
    return this.type === TOKEN.NULL;
  }
  get isSymbol() {
    return this.type === TOKEN.SYMBOL;
  }
  get isString() {
    return this.type === TOKEN.STRING;
  }
  get isRightParen() {
    return this.type === TOKEN.RIGHT_PAREN;
  }
  get isEOF() {
    return this.type === TOKEN.EOF;
  }
  get isFraction() {
    return this.type === TOKEN.FRACTION;
  }
  get isFloat() {
    return this.type === TOKEN.FLOAT;
  }
  get isComplex() {
    return this.type === TOKEN.COMPLEX_NUMBER;
  }
  get isOctalNumber() {
    return this.type === TOKEN.OCTAL_NUMBER;
  }
  get isHexNumber() {
    return this.type === TOKEN.HEX_NUMBER;
  }
  get isBinaryNumber() {
    return this.type === TOKEN.BINARY_NUMBER;
  }
  get isScientificNumber() {
    return this.type === TOKEN.SCIENTIFIC_NUMBER;
  }
  get isInteger() {
    return this.type === TOKEN.INTEGER;
  }

  get isPlus() {
    return this.type === TOKEN.PLUS;
  }
  get isSingleQuote() {
    return this.type === TOKEN.SINGLE_QUOTE;
  }
  get isUnaryMinus() {
    return this.type === TOKEN.UNARY_MINUS;
  }
  get isMinus() {
    return this.type === TOKEN.MINUS;
  }
  get isStar() {
    return this.type === TOKEN.STAR;
  }
  get isSlash() {
    return this.type === TOKEN.SLASH;
  }
  get isPercent() {
    return this.type === TOKEN.PERCENT;
  }
  get isCaret() {
    return this.type === TOKEN.CARET;
  }
  get isBang() {
    return this.type === TOKEN.BANG;
  }
  get isMod() {
    return this.type === TOKEN.MOD;
  }
  get isDiv() {
    return this.type === TOKEN.DIV;
  }
  get isRem() {
    return this.type === TOKEN.REM;
  }
  get isTo() {
    return this.type === TOKEN.TO;
  }
  get isDotPlus() {
    return this.type === TOKEN.DOT_PLUS;
  }
  get isDotStar() {
    return this.type === TOKEN.DOT_STAR;
  }
  get isDotCaret() {
    return this.type === TOKEN.DOT_CARET;
  }
  get isDequal() {
    return this.type === TOKEN.DEQUAL;
  }
  get isNeq() {
    return this.type === TOKEN.NEQ;
  }
  get isLt() {
    return this.type === TOKEN.LT;
  }
  get isGt() {
    return this.type === TOKEN.GT;
  }
  get isGTE() {
    return this.type === TOKEN.GTE;
  }
  get isLTE() {
    return this.type === TOKEN.LTE;
  }
  get isEqual() {
    return this.type === TOKEN.EQUAL;
  }
  get isTilde() {
    return this.type === TOKEN.TILDE;
  }
  get isAssign() {
    return this.type === TOKEN.ASSIGN;
  }
  get isAmp() {
    return this.type === TOKEN.AMP;
  }
  get isLShift() {
    return this.type === TOKEN.LSHIFT;
  }
  get isRShift() {
    return this.type === TOKEN.RSHIFT;
  }
  get isLogShift() {
    return this.type === TOKEN.LOG_SHIFT;
  }
  get isNor() {
    return this.type === TOKEN.NOR;
  }
  get isNot() {
    return this.type === TOKEN.NOT;
  }
  get isOr() {
    return this.type === TOKEN.OR;
  }
  get isXor() {
    return this.type === TOKEN.XOR;
  }
  get isXNor() {
    return this.type === TOKEN.XNOR;
  }
  get isAnd() {
    return this.type === TOKEN.AND;
  }
  get isNand() {
    return this.type === TOKEN.NAND;
  }
  get isExp() {
    return this.type === TOKEN.EXP;
  }
  
  get isUnop() {
    return (
      this.type === TOKEN.SINGLE_QUOTE ||
      this.type === TOKEN.UNARY_MINUS ||
      this.type === TOKEN.BANG ||
      this.type === TOKEN.NOT ||
      this.type === TOKEN.TILDE
    )
  }

  // range-based checkers
  get isBinop() {
    return (
      this.type === TOKEN.DOT ||
      this.type === TOKEN.PLUS ||
      this.type === TOKEN.MINUS ||
      this.type === TOKEN.STAR ||
      this.type === TOKEN.SLASH ||
      this.type === TOKEN.PERCENT ||
      this.type === TOKEN.CARET ||
      this.type === TOKEN.MOD ||
      this.type === TOKEN.DIV ||
      this.type === TOKEN.REM ||
      this.type === TOKEN.TO ||
      this.type === TOKEN.DOT_PLUS ||
      this.type === TOKEN.DOT_MINUS ||
      this.type === TOKEN.DOT_STAR ||
      this.type === TOKEN.DOT_SLASH ||
      this.type === TOKEN.DOT_PERCENT ||
      this.type === TOKEN.DOT_CARET ||
      this.type === TOKEN.DEQUAL ||
      this.type === TOKEN.NEQ ||
      this.type === TOKEN.LT ||
      this.type === TOKEN.GT ||
      this.type === TOKEN.GTE ||
      this.type === TOKEN.LTE ||
      this.type === TOKEN.EQUAL ||
      this.type === TOKEN.AMP ||
      this.type === TOKEN.LSHIFT ||
      this.type === TOKEN.RSHIFT ||
      this.type === TOKEN.LOG_SHIFT ||
      this.type === TOKEN.NOR ||
      this.type === TOKEN.OR ||
      this.type === TOKEN.XOR ||
      this.type === TOKEN.XNOR ||
      this.type === TOKEN.AND ||
      this.type === TOKEN.NAND ||
      this.type === TOKEN.SINGLE_QUOTE
    );
  }
  get isNumber() {
    return (
      this.type === TOKEN.INTEGER ||
      this.type === TOKEN.FLOAT ||
      this.type === TOKEN.FRACTION ||
      this.type === TOKEN.COMPLEX_NUMBER ||
      this.type === TOKEN.OCTAL_NUMBER ||
      this.type === TOKEN.HEX_NUMBER ||
      this.type === TOKEN.BINARY_NUMBER ||
      this.type === TOKEN.SCIENTIFIC_NUMBER
    );
  }
}
