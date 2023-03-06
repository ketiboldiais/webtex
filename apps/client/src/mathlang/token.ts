export enum TOKEN {
  EOF,
  ERROR,
  NIL,
  COMMA,
  EROTEME,
  LEFT_PAREN,
  RIGHT_PAREN,
  LEFT_BRACKET,
  RIGHT_BRACKET,
  LEFT_BRACE,
  RIGHT_BRACE,
  DOUBLE_QUOTE,
  SEMICOLON,
  COLON,
  VBAR,
  DOT,
  PLUS,
  PLUS_PLUS,
  SINGLE_QUOTE,
  MINUS,
  STAR,
  SLASH,
  PERCENT,
  CARET,
  BANG,
  MOD,
  DIV,
  REM,
  TO,
  DEQUAL,
  NEQ,
  LT,
  GT,
  GTE,
  LTE,
  EQUAL,
  TILDE,
  ASSIGN,
  AMP,
  LSHIFT,
  RSHIFT,
  UNARY_MINUS,
  IN,
  NOT,
  NOR,
  OR,
  XOR,
  XNOR,
  AND,
  NAND,
  EXP,
  THROW,
  ELSE,
  FOR,
  FUNCTION,
  IF,
  RETURN,
  THIS,
  WHILE,
  DO,
  LET,
  CONST,
  FALSE,
  TRUE,
  INF,
  NAN,
  NULL,
  SYMBOL,
  STRING,
  INTEGER,
  FRACTION,
  FLOAT,
  HEX,
  BINARY,
  OCTAL,
  SCINUM,
  COMPLEX,
}
export type NUM_TOKEN =
  | TOKEN.INTEGER
  | TOKEN.FLOAT
  | TOKEN.FRACTION
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
  [`exp`]: TOKEN.EXP,
};
export type Keyword = keyof typeof keywords;
export type LEXEME = Lexeme | Keyword;

export interface Token {
  type: TOKEN;
  lexeme: string;
  line: number;
}

export enum PREC {
  /** For utility types. */
  NONE,

  /** E.g., equality. */
  LOW,

  /** E.g., inequality. */
  LOWER_MIDDLE,

  /** E.g., Sums. */
  MIDDLE,

  /** E.g., Products. */
  UPPER_MIDDLE,

  /** E.g., Exponentiation and modulo. */
  HIGH,

  /** E.g., prefix operators. */
  TOP,

  /** E.g., postfix operators */
  ZENITH,

  /** E.g., Postfix operators and function calls. */
  APEX,
}

enum AFIX {
  NONE,
  CHAIN,
  LEFT,
  RIGHT,
}
enum CLASS {
  UTIL,
  DELIMITER,
  KEYWORD,
  ILLEGAL,
  PREFIX,
  INFIX,
  POSTFIX,
  MIXFIX,
  ATOMIC,
}

type Entry = {
  kind: CLASS;
  precedence: PREC;
  fixity: AFIX;
};

const TokenRecord: { [k in TOKEN]: Entry } = {
  [TOKEN.EOF]: {
    kind: CLASS.UTIL,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.ERROR]: {
    kind: CLASS.UTIL,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.NIL]: {
    kind: CLASS.UTIL,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },

  /**
   * The following are all delimiters.
   */
  [TOKEN.COMMA]: {
    kind: CLASS.DELIMITER,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.EROTEME]: {
    kind: CLASS.DELIMITER,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.LEFT_PAREN]: {
    kind: CLASS.DELIMITER,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.RIGHT_PAREN]: {
    kind: CLASS.DELIMITER,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.LEFT_BRACKET]: {
    kind: CLASS.DELIMITER,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.RIGHT_BRACKET]: {
    kind: CLASS.DELIMITER,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.LEFT_BRACE]: {
    kind: CLASS.DELIMITER,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.RIGHT_BRACE]: {
    kind: CLASS.DELIMITER,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.DOUBLE_QUOTE]: {
    kind: CLASS.DELIMITER,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.SEMICOLON]: {
    kind: CLASS.DELIMITER,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.COLON]: {
    kind: CLASS.DELIMITER,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  /**
   * mathlang treats the vertical
   * bar as the absolute value
   * delimiter.
   */
  [TOKEN.VBAR]: {
    kind: CLASS.DELIMITER,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },

  /* -------------------------------------------------------------------------- */
  /* § OPERATORS                                                                */
  /* -------------------------------------------------------------------------- */

  /**
   * The `->` operator is the left-pipe.
   * Given:
   * ~~~
   * let f(x) := x^2;
   * let g(x) := x + 1;
   * ~~~
   * If we define:
   * ~~~
   * let h(x) := f -> g;
   * ~~~
   * Then:
   * ~~~
   * h(2) = (2^2) + 1
   * ~~~
   */

  /**
   * The `<-` operator is the right-pipe.
   * Given:
   * ~~~
   * let f(x) := x^2;
   * let g(x) := x + 1;
   * ~~~
   * If we define:
   * ~~~
   * let h(x) := f <- g;
   * ~~~
   * Then:
   * ~~~
   * h(2) = (2 + 1)^2
   * ~~~
   */

  /**
   * 'in' maps to a check whether
   * an element exists in a compound.
   * Left-associative.
   * ~~~
   * x in A in B => (x in A) in B
   * ~~~
   * Example:
   * ~~~
   * 4 in [1,2,3,4] => 'true'
   * ~~~
   */
  [TOKEN.IN]: {
    kind: CLASS.INFIX,
    precedence: PREC.LOWER_MIDDLE,
    fixity: AFIX.LEFT,
  },

  /**
   * Single quote maps to the derivative.
   * ~~~
   * (x^2)' => (2x)' => 1
   * (x^2)'' => 1
   * ~~~
   */
  [TOKEN.SINGLE_QUOTE]: {
    kind: CLASS.POSTFIX,
    precedence: PREC.ZENITH,
    fixity: AFIX.LEFT,
  },
  /**
   * Dot for function composition.
   * ~~~
   * f(x) := x^2
   * g(x) := x + 1
   * f.g(x) => f(g(x)) => (x + 1)^2
   * ~~~
   */
  [TOKEN.DOT]: {
    kind: CLASS.INFIX,
    precedence: PREC.ZENITH,
    fixity: AFIX.RIGHT,
  },
  /**
   * Subtraction is left-associative.
   * ~~~
   * a - b - c => (a - b) - c
   * ~~~
   */
  [TOKEN.MINUS]: {
    kind: CLASS.INFIX,
    precedence: PREC.LOW,
    fixity: AFIX.LEFT,
  },
  /**
   * Addition is left-associative.
   * ~~~
   * a + b + c => (a + b) + c
   * ~~~
   */
  [TOKEN.PLUS]: {
    kind: CLASS.INFIX,
    precedence: PREC.MIDDLE,
    fixity: AFIX.LEFT,
  },
  /**
   * Multiplication is left-associative.
   * ~~~
   * a * b * c => (a * b) * c
   * ~~~
   */
  [TOKEN.STAR]: {
    kind: CLASS.INFIX,
    precedence: PREC.UPPER_MIDDLE,
    fixity: AFIX.LEFT,
  },
  /**
   * Division is left-associative.
   * ~~~
   * a/b/c => (a/b)/c
   * ~~~
   */
  [TOKEN.SLASH]: {
    kind: CLASS.INFIX,
    precedence: PREC.UPPER_MIDDLE,
    fixity: AFIX.LEFT,
  },

  /**
   * The `^` operator maps to exponentiation.
   * It is right-associative.
   * ~~~
   * a^b^c => a^(b^c)
   * ~~~
   */
  [TOKEN.CARET]: {
    kind: CLASS.INFIX,
    precedence: PREC.HIGH,
    fixity: AFIX.RIGHT,
  },
  /**
   * The `!` operator maps to factorial.
   * It is left-associative.
   * ~~~
   * a!! => (a!)!
   * ~~~
   */
  [TOKEN.BANG]: {
    kind: CLASS.POSTFIX,
    precedence: PREC.ZENITH,
    fixity: AFIX.LEFT,
  },
  /**
   * The `%` operator returns the signed remainder.
   * It is left-associative.
   * ~~~
   * a % b % c => (a % b) % c
   * ~~~
   */
  [TOKEN.PERCENT]: {
    kind: CLASS.INFIX,
    precedence: PREC.HIGH,
    fixity: AFIX.NONE,
  },
  /**
   * The `mod` operator maps to the
   * modulus operator. It is left-associative.
   *
   * ~~~
   * a mod b mod c => (a mod b) mod c
   * ~~~
   */
  [TOKEN.MOD]: {
    kind: CLASS.INFIX,
    precedence: PREC.HIGH,
    fixity: AFIX.LEFT,
  },
  /**
   * The `//` operator maps to integer division.
   * It is left-associative.
   * ~~~
   * a // b // c => (a // b) // c
   * ~~~
   */
  [TOKEN.DIV]: {
    kind: CLASS.INFIX,
    precedence: PREC.HIGH,
    fixity: AFIX.LEFT,
  },
  /**
   * The `rem` operator maps to unsigned remainder.
   * It is left-associative.
   * ~~~
   * a rem b rem c => (a rem b) rem c
   * ~~~
   */
  [TOKEN.REM]: {
    kind: CLASS.INFIX,
    precedence: PREC.HIGH,
    fixity: AFIX.LEFT,
  },
  /**
   * The `to` operator maps to a conversion.
   * It is left associative.
   * 4in to m to cm => (4in to m) to cm
   */
  [TOKEN.TO]: {
    kind: CLASS.INFIX,
    precedence: PREC.TOP,
    fixity: AFIX.LEFT,
  },
  /**
   * `==` maps to equivalence.
   * This is a chain-associative.
   * ~~~
   * a == b == c => (a == b) && (b == c)
   * ~~~
   * Under the hood, this is simply a function
   * call:
   * ~~~
   * a == b == c => allEquivalent(a,b,c)
   * ~~~
   */
  [TOKEN.DEQUAL]: {
    kind: CLASS.INFIX,
    precedence: PREC.LOW,
    fixity: AFIX.CHAIN,
  },
  /**
   * `=` maps to strict equality.
   * Chain associative.
   * ~~~
   * a = b = c => (a = b) && (b = c)
   * ~~~
   */
  [TOKEN.EQUAL]: {
    kind: CLASS.INFIX,
    precedence: PREC.LOW,
    fixity: AFIX.CHAIN,
  },
  /**
   * `!=` maps to inequality.
   * This is chain-associative.
   * ~~~
   * a != b != c => (a != b) && (b != c)
   * ~~~
   * Again, a function call:
   * ~~~
   * a != b != c => allNotEqual(a,b,c)
   * ~~~
   */
  [TOKEN.NEQ]: {
    kind: CLASS.INFIX,
    precedence: PREC.LOW,
    fixity: AFIX.CHAIN,
  },
  /**
   * `<` maps to less than.
   * Chain associative.
   * ~~~
   * a < b < c => (a < b) && (b < c)
   * ~~~
   */
  [TOKEN.LT]: {
    kind: CLASS.INFIX,
    precedence: PREC.LOW,
    fixity: AFIX.CHAIN,
  },
  /**
   * `>` maps to greater than.
   * Chain associative.
   * ~~~
   * a > b > c => (a > b) && (b > c)
   * ~~~
   */
  [TOKEN.GT]: {
    kind: CLASS.INFIX,
    precedence: PREC.LOW,
    fixity: AFIX.CHAIN,
  },
  /**
   * `>=` maps to greater than or equal to.
   * Chain associative.
   * ~~~
   * a >= b >= c => (a >= b) && (b >= c)
   * ~~~
   */
  [TOKEN.GTE]: {
    kind: CLASS.INFIX,
    precedence: PREC.LOW,
    fixity: AFIX.CHAIN,
  },
  /**
   * `<=` maps to less than or equal to.
   * Chain associative.
   * ~~~
   * a <= b <= c => (a <= b) && (b <= c)
   * ~~~
   */
  [TOKEN.LTE]: {
    kind: CLASS.INFIX,
    precedence: PREC.LOW,
    fixity: AFIX.CHAIN,
  },
  /**
   * `:=` maps to assignment.
   * Right-associative.
   * ~~~
   * a := b := c => a := (b := c)
   * ~~~
   */
  [TOKEN.ASSIGN]: {
    kind: CLASS.INFIX,
    precedence: PREC.LOW,
    fixity: AFIX.RIGHT,
  },
  /**
   * `~` maps to list removal (set minus).
   * Left-associative.
   * ~~~
   * A ~ B ~ C => (A ~ B) ~ C
   * ~~~
   * Example:
   * ~~~
   * [1,2,3] ~ [1,2] => [3]
   * ~~~
   */
  [TOKEN.TILDE]: {
    kind: CLASS.PREFIX,
    precedence: PREC.MIDDLE,
    fixity: AFIX.CHAIN,
  },
  /**
   * `++` maps to list concatenation (set union).
   * Left-associative.
   * ~~~
   * A ++ B ++ C => (A ++ B) ++ C
   * ~~~
   * Example:
   * ~~~
   * [1,2] ++ [3,4] => [1,2,3,4]
   * ~~~
   */
  [TOKEN.PLUS_PLUS]: {
    kind: CLASS.INFIX,
    precedence: PREC.MIDDLE,
    fixity: AFIX.LEFT,
  },
  /**
   * `&` maps to set intersection.
   * Left-associative.
   * ~~~
   * A & B & C => (A & B) & C
   * ~~~
   * Example:
   * ~~~
   * [1,2,8,9] & [2,4,1] => [1,2]
   * ~~~
   */
  [TOKEN.AMP]: {
    kind: CLASS.INFIX,
    precedence: PREC.MIDDLE,
    fixity: AFIX.LEFT,
  },
  /**
   * `&` maps to append element.
   * Left-associative.
   * ~~~
   * A << x << y => (A << x) << y
   * ~~~
   * Example:
   * ~~~
   * [1,2,3] << 4 => [1,2,3,4]
   * ~~~
   */
  [TOKEN.LSHIFT]: {
    kind: CLASS.INFIX,
    precedence: PREC.MIDDLE,
    fixity: AFIX.LEFT,
  },
  /**
   * `>>` maps to prepend element.
   * Left-associative.
   * ~~~
   * x >> y >> A => (x >> y) >> A
   * ~~~
   * Example:
   * ~~~
   * 1 >> 2 => [1,2]
   * ~~~
   */
  [TOKEN.RSHIFT]: {
    kind: CLASS.INFIX,
    precedence: PREC.MIDDLE,
    fixity: AFIX.LEFT,
  },
  /**
   * `-` maps to arithmetic negation.
   * Right-associative.
   * ~~~
   * --x => -(-x)
   * ~~~
   */
  [TOKEN.UNARY_MINUS]: {
    kind: CLASS.PREFIX,
    precedence: PREC.TOP,
    fixity: AFIX.RIGHT,
  },
  /**
   * `-` maps to logical negation.
   * Right-associative.
   * ~~~
   * not not x => not(not x)
   * ~~~
   */
  [TOKEN.NOT]: {
    kind: CLASS.PREFIX,
    precedence: PREC.TOP,
    fixity: AFIX.RIGHT,
  },
  /**
   * `or` maps to logical or.
   * left-associative.
   * ~~~
   * a or b or c => (a or b) or c
   * ~~~
   */
  [TOKEN.OR]: {
    kind: CLASS.INFIX,
    precedence: PREC.LOW,
    fixity: AFIX.LEFT,
  },
  /**
   * `nor` maps to logical nor.
   * left-associative.
   * ~~~
   * a nor b nor c => (a nor b) nor c
   * ~~~
   */
  [TOKEN.NOR]: {
    kind: CLASS.INFIX,
    precedence: PREC.LOWER_MIDDLE,
    fixity: AFIX.LEFT,
  },
  /**
   * `xor` maps to logical xor.
   * left-associative.
   * ~~~
   * a xor b xor c => (a xor b) xor c
   * ~~~
   */
  [TOKEN.XOR]: {
    kind: CLASS.INFIX,
    precedence: PREC.MIDDLE,
    fixity: AFIX.LEFT,
  },
  /**
   * `xnor` maps to logical xnor.
   * left-associative.
   * ~~~
   * a xnor b xnor c => (a xnor b) xnor c
   * ~~~
   */
  [TOKEN.XNOR]: {
    kind: CLASS.INFIX,
    precedence: PREC.UPPER_MIDDLE,
    fixity: AFIX.LEFT,
  },
  /**
   * `and` maps to logical and.
   * left-associative.
   * ~~~
   * a and b and c => (a and b) and c
   * ~~~
   */
  [TOKEN.AND]: {
    kind: CLASS.INFIX,
    precedence: PREC.HIGH,
    fixity: AFIX.NONE,
  },
  /**
   * `nand` maps to logical nand.
   * left-associative.
   * ~~~
   * a nand b nand c => (a nand b) nand c
   * ~~~
   */
  [TOKEN.NAND]: {
    kind: CLASS.UTIL,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },

  /**
   * The following are keywords.
   * If the token class is `illegal`,
   * then the keyword is either disallowed
   * in the language or unimplemented.
   */

  [TOKEN.EXP]: {
    kind: CLASS.KEYWORD,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.THROW]: {
    kind: CLASS.ILLEGAL,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.ELSE]: {
    kind: CLASS.KEYWORD,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.FOR]: {
    kind: CLASS.ILLEGAL,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.FUNCTION]: {
    kind: CLASS.ILLEGAL,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.IF]: {
    kind: CLASS.KEYWORD,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.RETURN]: {
    kind: CLASS.ILLEGAL,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.THIS]: {
    kind: CLASS.ILLEGAL,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.WHILE]: {
    kind: CLASS.ILLEGAL,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.DO]: {
    kind: CLASS.ILLEGAL,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.LET]: {
    kind: CLASS.KEYWORD,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.CONST]: {
    kind: CLASS.ILLEGAL,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },

  /**
   * The following are atomic values.
   */
  [TOKEN.FALSE]: {
    kind: CLASS.ATOMIC,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.TRUE]: {
    kind: CLASS.ATOMIC,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.INF]: {
    kind: CLASS.ATOMIC,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.NAN]: {
    kind: CLASS.ATOMIC,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.NULL]: {
    kind: CLASS.ATOMIC,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.SYMBOL]: {
    kind: CLASS.ATOMIC,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.STRING]: {
    kind: CLASS.ATOMIC,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.INTEGER]: {
    kind: CLASS.ATOMIC,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.FRACTION]: {
    kind: CLASS.ATOMIC,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.FLOAT]: {
    kind: CLASS.ATOMIC,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.HEX]: {
    kind: CLASS.ATOMIC,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.BINARY]: {
    kind: CLASS.ATOMIC,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.OCTAL]: {
    kind: CLASS.ATOMIC,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.SCINUM]: {
    kind: CLASS.ATOMIC,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
  [TOKEN.COMPLEX]: {
    kind: CLASS.ATOMIC,
    precedence: PREC.NONE,
    fixity: AFIX.NONE,
  },
};

const numerics: { [key in NUM_TOKEN]: boolean } = {
  [TOKEN.INTEGER]: true,
  [TOKEN.FRACTION]: true,
  [TOKEN.FLOAT]: true,
  [TOKEN.HEX]: true,
  [TOKEN.BINARY]: true,
  [TOKEN.OCTAL]: true,
  [TOKEN.SCINUM]: true,
  [TOKEN.COMPLEX]: true,
} as const;

export class Token {
  constructor(type: TOKEN, lexeme: string, line: number) {
    this.type = type;
    this.lexeme = lexeme;
    this.line = line;
  }
  get isSemicolon() {
    return this.type === TOKEN.SEMICOLON;
  }
  get typename() {
    return TOKEN[this.type].replace("_", "-").toLowerCase();
  }
  get isNumber() {
    return numerics[this.type as NUM_TOKEN] !== undefined;
  }
  get isIllegal() {
    return TokenRecord[this.type].kind === CLASS.ILLEGAL;
  }
  get isPrefix() {
    return TokenRecord[this.type].kind === CLASS.PREFIX;
  }
  get isPostfix() {
    return TokenRecord[this.type].kind === CLASS.POSTFIX;
  }
  get isInfix() {
    return TokenRecord[this.type].kind === CLASS.INFIX;
  }
  get isMixfix() {
    return TokenRecord[this.type].kind === CLASS.MIXFIX;
  }
  get isAtomic() {
    return TokenRecord[this.type].kind === CLASS.ATOMIC;
  }
  get isOperable() {
    return !this.isEOF && !this.isSemicolon && !this.isDelimiter;
  }
  get isOperator() {
    return this.isInfix ||
      this.isPostfix ||
      this.isPrefix ||
      this.isMixfix;
  }
  get isChainAssociative() {
    return TokenRecord[this.type].fixity === AFIX.CHAIN;
  }
  get isDelimiter() {
    return TokenRecord[this.type].kind === CLASS.DELIMITER;
  }
  get isEOF() {
    return this.type === TOKEN.EOF;
  }
  isDelim(lexeme: "(" | ")" | "|" | "[" | "]" | "{" | "}") {
    return this.isDelimiter && this.lexeme === lexeme;
  }
  get bp() {
    return TokenRecord[this.type].precedence;
  }
  /**
   * Returns true if this token
   * strictly does not precede ('<')
   * the other token.
   */
  doesNotPrecede(otherToken: Token) {
    return (TokenRecord[this.type].precedence <
      TokenRecord[otherToken.type].precedence);
  }
  get isVbar() {
    return this.type === TOKEN.VBAR;
  }
  get isLeftParen() {
    return this.type === TOKEN.LEFT_PAREN;
  }
  get isLeftBracket() {
    return this.type === TOKEN.LEFT_BRACKET;
  }
  get isRightParen() {
    return this.type === TOKEN.RIGHT_PAREN;
  }
  get isSymbol() {
    return this.type === TOKEN.SYMBOL;
  }
  static nil = new Token(TOKEN.NIL, "", -1);
  toString(linePad=0, lexPad=2, typePad=0) {
    const lex = `${this.lexeme}`.padEnd(lexPad);
    const line = `${this.line}`.padEnd(linePad);
    const type = `${this.typename}`.padEnd(typePad);
    return `(${line})[ ${lex}][${type}]`;
  }
}

export class TokenStream {
  tokens: Token[];
  length: number;
  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.length = tokens.length;
  }
  toString() {
    let str = '';
    for (let i = 0; i < this.length; i++) {
      str += this.tokens[i].toString() + `\n`;
    }
    return str;
  }
}
