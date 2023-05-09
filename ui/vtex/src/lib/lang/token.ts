// § TokenType Enum ==================================================
/**
 * The given token’s type.
 * The following ranges are reserved:
 *
 * - `0 <= t <= 99` - A utility token.
 * - `100 <= t <= 199` - Core delimiter tokens.
 * - `200 <= t <= 299` - Numeric operator tokens.
 * - `300 <= t <= 399` - Relational operator tokens.
 * - `400 <= t <= 499` - Logic operator tokens.
 * - `500 <= t <= 799` - Atomic value tokens, partitioned:
 *   1. `500 <= t <= 599` - Number-like literals.
 *   2. `600 <= t <= 699` - String-like literals.
 *   3. `700 <= t <= 796` - Boolean-like literals.
 *   4. `t === 797` - The null value, `tkn.null`.
 *   5. `t === 798` - A symbol, `tkn.symbol`.
 *   6. `t === 799` - A native function call, `tkn.call`.
 * - `800 <= t <= 1999` - Core keywords.
 * - `2000 <= t` - Free ranges available for definitions.
 */
export enum tkn {
  // § Utility Tokens ================================================
  /** Indicates the end of input. */
  end,

  /** Indicates an error during scanning. */
  error,

  /** An empty token, used for initializing state. */
  none,

  // § Core Delimiter Tokens =========================================
  /** Lexeme: `(` */
  left_paren = 100,

  /** Lexeme: `)` */
  right_paren,

  /** Lexeme: `[` */
  left_bracket,

  /** Lexeme: `]` */
  right_bracket,

  /** Lexeme: `{` */
  left_brace,

  /** Lexeme: `}` */
  right_brace,

  /** Lexeme: `|` */
  vbar,

  /** Lexeme: `;` */
  semicolon,

  /** Lexeme: `,` */
  comma,

  /** Lexeme: `.` */
  dot,

  // § Numeric Operator Tokens =======================================
  /**
   * Lexeme: `+`
   */
  plus = 200,

  /**
   * Lexeme: `-`
   */
  minus,

  /**
   * Lexeme: `!`
   */
  bang,

  /**
   * Lexeme: `*`
   */
  star,

  /**
   * Lexeme: `/`
   */
  slash,

  /**
   * Lexeme: `^`
   */
  caret,

  /**
   * Lexeme: `%`
   */
  percent,

  /**
   * Lexeme: `rem`
   */
  rem,

  /**
   * Lexeme: `mod`
   */
  mod,

  /**
   * Lexeme: `div`
   */
  div,

  // § Relational Operator Tokens ===================================

  /**
   * Lexeme: `=`
   */
  eq = 300,

  /**
   * Lexeme: `==`
   */
  deq,

  /**
   * Lexeme: `!=`
   */
  neq,

  /**
   * Lexeme: `<`
   */
  lt,

  /**
   * Lexeme: `<=`
   */
  leq,

  /**
   * Lexeme: `>`
   */
  gt,

  /**
   * Lexeme: `>=`
   */
  geq,

  /**
   * Lexeme: `is`
   */
  is,

  // § Boolean operator Tokens =======================================
  /**
   * Lexeme: `and`
   */
  and = 400,

  /**
   * Lexeme: `or`
   */
  or,

  /**
   * Lexeme: `not`
   */
  not,

  /**
   * Lexeme: `xor`
   */
  xor,

  /**
   * Lexeme: `nor`
   */
  nor,

  /**
   * Lexeme: `nand`
   */
  nand,

  /**
   * Lexeme: `xnor`
   */
  xnor,

  // § Number-like Tokens ============================================
  /**
   * An integer token maps to the following lexemes:
   *
   * 1. The lexeme `0`, or
   * 2. A positive integer, or
   * 3. The lexeme `+` followed by a positive integer, or
   * 4. The lexeme `-` followed by a positive integer.
   *
   * __References__.
   * 1. See {@link positiveInteger|positive integer} for
   * the definition of _positive integer_.
   */
  int = 500,

  /**
   * The following lexemes are of token type `float`:
   *
   * 1. `0`, followed by a `.`, followed by:
   *   - exactly one zero, or
   *   - one or more zeros followed by a positive integer,
   * 2. A positive integer followed by a `.` followed by:
   *   - exactly one zero, or
   *   - one or more zeros followed by a positive integer,
   * 3. A `-` or a `+` before the resulting lexeme under (1) or (2),
   *    but only if the said lexeme is not `0.0`.
   *
   * __References__.
   * 1. See {@link positiveInteger|positive integer} for
   * the definition of _positive integer_.
   */
  float,

  scinum,

  NaN,

  Inf,

  // § String-like Tokens ===========================================
  /**
   * A lexeme is considered a token of type string only if:
   *
   * 1. The lexeme begins after a double quote (`"`), and
   * 2. the lexeme ends before a double quote
   */
  string = 600,

  // § Boolean-like Tokens ===========================================
  /**
   * Lexeme: `true`
   */
  true = 700,

  /**
   * Lexeme: `false`
   */
  false,

  // § Null Token ====================================================
  null = 797,

  // § Symbol Token ==================================================
  symbol = 798,

  // § Call Token ====================================================
  call = 799,

  // § Keyword Tokens ================================================
  /**
   * Lexeme: `class`
   */
  class = 800,

  /**
   * Lexeme: `if`
   */
  if,

  /**
   * Lexeme: `else`
   */
  else,

  /**
   * Lexeme: `let`
   */
  let,

  /**
   * Lexeme: `const`
   */
  const,

  /**
   * Lexeme: `def`
   */
  def,

  /**
   * Lexeme: `return`
   */
  return,

  /**
   * Lexeme: `this`
   */
  this,

  /**
   * Lexeme: `for`
   */
  for,

  /**
   * Lexeme: `while`
   */
  while,

  /**
   * Lexeme: `do`
   */
  do,
}

// § Token Definition ================================================
/**
 * A Token is an object outputted
 * by the Engine’s scanner.
 */
export class Token {
  /**
   * Every token object must have
   * their `type` field set with a tkn.
   * The Engine’s parsers never perform
   * string comparisons. They will always
   * branch depending on the tkn
   * they receive.
   *
   * __Reference__.
   * 1. _See_ {@link tkn} for a broader
   * discussion of recognized token types.
   */
  readonly type: tkn;

  /**
   * All token’s have a corresponding
   * lexeme. This is distinct from the
   * tkn. The expression `1 + 5`
   * comprises two token types–`tkn.int`
   * and `tkn.plus`–and three lexemes
   * –`1`, `+`, and `5` (Writ doesn’t disregards
   * whitespace).
   */
  readonly lexeme: string;

  /**
   * The line where this Token was first
   * read.
   */
  readonly line: number;

  /**
   * The column where this Token was first
   * read.
   */
  readonly column: number;

  constructor(
    type: tkn,
    lexeme: string,
    line: number = -1,
    column: number = -1,
  ) {
    this.type = type;
    this.lexeme = lexeme;
    this.line = line;
    this.column = column;
  }

  /**
   * Returns true if the
   * given this token matches
   * the given `tokenType`.
   */
  is(tokenType: tkn) {
    return this.type === tokenType;
  }

  /**
   * Returns a copy of this token.
   */
  clone(lexeme?: string, type?: tkn) {
    type = type ? type : this.type;
    lexeme = lexeme ? lexeme : this.lexeme;
    const line = this.line;
    const column = this.column;
    return new Token(type, lexeme, line, column);
  }

  isEOF() {
    return this.type === tkn.end;
  }
  
  isSymbol() {
    return this.type===tkn.symbol;
  }
}

/**
 * Creates a new {@link Token}.
 * @param type - The token’s type.
 * @param lexeme - The token’s lexeme.
 * @param line - The line where the lexeme’s first glyph occurred.
 * @param column - The column where the lexeme’s first glyph occurred.
 */
export const token = (
  type: tkn,
  lexeme: string,
  line: number = -1,
  column: number = 1,
) => (new Token(type, lexeme, line, column));
