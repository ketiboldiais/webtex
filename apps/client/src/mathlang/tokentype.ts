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
  COLON, DOT, 
  
  // math-operators
  PLUS, MINUS, STAR, SLASH,
  PERCENT, CARET, BANG,
  MOD, DIV, REM, TO,
  
  // list-operators
  DOT_PLUS, 
  DOT_MINUS, 
  DOT_STAR, 
  DOT_SLASH, 
  DOT_PERCENT, 
  DOT_CARET, 
  DOT_MOD, 
  DOT_DIV, 
  DOT_REM, 

  // relational-operators
  DEQUAL, NEQ, LT, GT, GTE, LTE,
  EQUAL, TILDE, 
  
  // definition
  ASSIGN, 

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
  SYMBOL, STRING,
  
  // number data types
  INTEGER,
  FLOAT, 
  FRACTION,
  COMPLEX_NUMBER,
  OCTAL_NUMBER, HEX_NUMBER, BINARY_NUMBER,
  SCIENTIFIC_NUMBER
}

export type NUM_TOKEN =
  TOKEN.INTEGER
  | TOKEN.FRACTION
  | TOKEN.FLOAT
  | TOKEN.COMPLEX_NUMBER
  | TOKEN.OCTAL_NUMBER
  | TOKEN.HEX_NUMBER
  | TOKEN.BINARY_NUMBER
  | TOKEN.SCIENTIFIC_NUMBER;
