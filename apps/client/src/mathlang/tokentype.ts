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
  // utility
  EOF, ERROR, NIL,

  // delimiters
  COMMA, LEFT_PAREN, RIGHT_PAREN,
  LEFT_BRACKET, RIGHT_BRACKET, LEFT_BRACE,
  RIGHT_BRACE, DOUBLE_QUOTE, SEMICOLON,
  
  // math-operators
  PLUS, MINUS, STAR, DOT_STAR, SLASH, DOT_SLASH,
  PERCENT, DOT_PERCENT, CARET, DOT_CARET, TILDE, BANG,
  EQUAL, COLON, DOT, MOD, DIV, REM, TO, ASSIGN, 

  // relational-operators
  DEQUAL, NEQ, LT, GT, GTE, LTE,
  
  // bitwise operators
  AMP, VBAR, CARET_VBAR, 
  LSHIFT, RSHIFT, LOG_SHIFT,

  // logical-operators
  EROTEME, NOR, NOT, OR, XOR, XNOR,
  AND, SINGLE_QUOTE, NAND,

  // keywords
  CLASS, THROW, ELSE, FOR, FUNCTION, FN, IF, RETURN, SUPER,
  THIS, THAT, WHILE, DO, LET, VAR, CONST,
  
  // constants
  FALSE, TRUE, INF, NAN, NULL, 
  SYMBOL, STRING, NUMBER,
}

export const error = {
  expected: {
    semicolon: `[statement]: Expected ‘;’ to end statement`,
    id: `[identifier]: Expected identifier`,
    leftBrace: `[braced-expression]: Expected ‘{’`,
    rightBrace: `[braced-expression]: Expected ‘}’`,
    leftParen: `[parenthesized-expression]: Expected ‘(’`,
    rightParen: `[parenthesized-expression]: Expected ‘)’`,
    leftBracket: `[bracketed-expression]: Expected ‘[’`,
    rightBracket: `[bracketed-expression]: Expected ‘]’`,
    number: `[literal]: Expected number.`,
    string: `[literal]: Expected string.`,
    true: `[literal]: Expected ‘true’.`,
    false: `[literal]: Expected ‘false’.`,
    null: `[literal]: Expected ‘null’.`,
  },
  noJaggedArrays:
    `[bracketed-expression]: Jagged sequences are only permitted on lists.`,
};
