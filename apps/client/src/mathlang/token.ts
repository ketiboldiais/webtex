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
}

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

  /** Lexeme: `.` */
  DOT,

  /* -------------------------------------------------------------------------- */
  /* § Math Operator Tokens                                                     */
  /* -------------------------------------------------------------------------- */
  /** Lexeme: `+` */
  PLUS,

  /** Lexeme: `'` */
  SINGLE_QUOTE,

  /** Lexeme: `-` */
  MINUS,

  /** Lexeme: `*` */
  STAR,

  /** Lexeme: `/` */
  SLASH,

  /** Lexeme: `%` */
  PERCENT,

  /** Lexeme: `^` */
  CARET,

  /** Lexeme: `!` */
  BANG,

  /** Lexeme: `mod` */
  MOD,

  /** Lexeme: `//` */
  DIV,

  /** Lexeme: `rem` */
  REM,

  /** Lexeme: `to` */
  TO,

  /* -------------------------------------------------------------------------- */
  /* § List Operator Tokens                                                     */
  /* -------------------------------------------------------------------------- */
  /** Lexeme: `.+` */
  DOT_PLUS,

  /** Lexeme: `.-` */
  DOT_MINUS,

  /** Lexeme: `.*` */
  DOT_STAR,

  /** Lexeme: `./` */
  DOT_SLASH,

  /** Lexeme: `.%` */
  DOT_PERCENT,

  /** Lexeme: `.^` */
  DOT_CARET,

  /* -------------------------------------------------------------------------- */
  /* § Relational Operator Tokens                                               */
  /* -------------------------------------------------------------------------- */
  /** Lexeme: `==` */
  DEQUAL,

  /** Lexeme: `!=` */
  NEQ,

  /** Lexeme: `<` */
  LT,

  /** Lexeme: `>` */
  GT,

  /** Lexeme: `>=` */
  GTE,

  /** Lexeme: `<=` */
  LTE,

  /** Lexeme: `=` */
  EQUAL,

  /** Lexeme: `~` */
  TILDE,

  /* -------------------------------------------------------------------------- */
  /* § Assignment Token                                                         */
  /* -------------------------------------------------------------------------- */
  /** Lexeme: `:=` */
  ASSIGN,

  /* -------------------------------------------------------------------------- */
  /* § Bitwise Operator Tokens                                                  */
  /* -------------------------------------------------------------------------- */
  /** Lexeme: `&` */
  AMP,

  /** Lexeme: `>>` */
  LSHIFT,

  /** Lexeme: `<<` */
  RSHIFT,

  /** Lexeme: `>>>` */
  LOG_SHIFT,

  /* -------------------------------------------------------------------------- */
  /* § Logical Operator Tokens                                                  */
  /* -------------------------------------------------------------------------- */
  /** Lexeme: `nor` */
  NOR,

  /** Lexeme: `not` */
  NOT,

  /** Lexeme: `or` */
  OR,

  /** Lexeme: `xor` */
  XOR,

  /** Lexeme: `xnor` */
  XNOR,

  /** Lexeme: `and` */
  AND,

  /** Lexeme: `nand` */
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
