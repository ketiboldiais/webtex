import { Token } from './typings';

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
  CONST = 'const',
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
  ['const', TokenType.CONST],
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

export class Tokenizer {
  source: string;
  tokens: Token[];
  error: boolean;
  result: any;
  private current: number;
  private start: number;
  private line: number;
  constructor() {
    this.current = 0;
    this.start = 0;
    this.line = 0;
    this.error = false;
    this.tokens = [];
  }
  scan(source: string) {
    this.source = source;
    while (this.hasChars) {
      this.start = this.current;
      this.scanToken();
      if (this.error) return this.result;
    }
    this.addToken(TokenType.EOF, null);
    return this.tokens;
  }
  private scanToken() {
    let c = this.advance();
    switch (c) {
      // whitespace
      case ' ':
      case '\r':
      case '\t':
        break;
      case '\n':
        this.line++;
        break;

      // punctuation
      case ';':
        this.addToken(TokenType.SEMICOLON);
        break;
      case '.':
        this.addToken(TokenType.DOT);
        break;
      case ',':
        this.addToken(TokenType.COMMA);
        break;

      // string-literal
      case `"`:
        this.string();
        break;

      // operators
      case '-':
        this.addToken(TokenType.MINUS);
        break;
      case '+':
        this.addToken(this.match('+') ? TokenType.CONCAT : TokenType.PLUS);
        break;
      case '*':
        this.addToken(TokenType.MUL);
        break;
      case '^':
        this.addToken(TokenType.CARET);
        break;
      case '&':
        this.addToken(TokenType.AMP);
        break;
      case '~':
        this.addToken(TokenType.TILDE);
        break;
      case '%':
        this.addToken(TokenType.QUOT);
        break;
      case '/':
        this.addToken(TokenType.DIV);
        break;
      case '!':
        this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
        break;
      case '=':
        this.addToken(
          this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL
        );
        break;
      case '<':
        this.addToken(this.match('=') ? TokenType.LTE : TokenType.LT);
        break;
      case '>':
        this.addToken(this.match('=') ? TokenType.GTE : TokenType.GT);
        break;

      // groupers
      case '(':
        this.addToken(TokenType.LPAREN);
        break;
      case ')':
        this.addToken(TokenType.RPAREN);
        break;
      case '{':
        this.addToken(TokenType.LBRACE);
        break;
      case '}':
        this.addToken(TokenType.RBRACE);
        break;
      case '[':
        this.addToken(TokenType.LBRACKET);
        break;
      case ']':
        this.addToken(TokenType.RBRACKET);
        break;
      default:
        if (this.isDigit(c)) this.number();
        else if (this.isAlpha(c)) this.symbol();
        else {
          this.err(`Unrecognized token: [${c}]`);
        }
        break;
    }
  }
  private symbol() {
    while (this.isAlphanumeric(this.peek)) this.advance();
    const txt = this.source.substring(this.start, this.current);
    let type: TokenType;
    let value: any;
    switch (txt) {
      case 'false':
        type = TokenType.BOOL;
        value = false;
        break;
      case 'true':
        type = TokenType.BOOL;
        value = true;
        break;
      case 'null':
        type = TokenType.NULL;
        value = null;
        break;
      default:
        type = keywords.has(txt)
          ? keywords.get(txt) ?? TokenType.KEYWORD
          : TokenType.SYMBOL;
        value = txt;
        break;
    }
    this.addToken(type, value);
  }
  private number() {
    let type: TokenType = TokenType.INTEGER;
    while (this.isDigit(this.peek)) this.advance();
    if (this.peek === '.' && this.isDigit(this.peekNext)) {
      type = TokenType.REAL;
      this.advance();
      while (this.isDigit(this.peek)) this.advance();
    }
    this.addToken(
      type,
      Number(this.source.substring(this.start, this.current))
    );
  }
  private string() {
    while (this.peek !== `"` && this.hasChars) {
      if (this.peek === `\n`) this.line++;
      this.advance();
    }
    if (!this.hasChars) {
      return this.err('Unterminated string.');
    }
    this.advance();
    this.addToken(
      TokenType.STRING,
      this.source.substring(this.start + 1, this.current - 1)
    );
  }
  private match(c: string): boolean {
    if (!this.hasChars) return false;
    if (this.source.charAt(this.current) !== c) return false;
    this.current++;
    return true;
  }
  private get peekNext(): string {
    if (this.current + 1 >= this.source.length) return '\0';
    return this.source.charAt(this.current + 1);
  }
  private get peek(): string {
    if (!this.hasChars) return '\0';
    return this.source.charAt(this.current);
  }
  private err(message: string) {
    this.error = true;
    this.result = this.makeError(message, this.line);
  }
  private addToken(
    type: TokenType,
    value: any = this.source.substring(this.start, this.current)
  ) {
    this.tokens.push(this.makeToken(type, value, this.line));
  }
  private advance(): string {
    return this.source.charAt(this.current++);
  }
  private get hasChars(): boolean {
    return this.current < this.source.length;
  }
  private isAlpha(c: string) {
    return ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || c === '_';
  }
  private isDigit(c: string) {
    return c >= '0' && c <= '9';
  }
  private isAlphanumeric(c: string) {
    return this.isAlpha(c) || this.isDigit(c);
  }
  private makeToken(type: TokenType, value: any, line: number): Token {
    return { type, value, line };
  }
  private makeError(message: string, line: number): Token {
    return {
      type: TokenType.ERROR,
      value: `Tokenizer Error | Line[${this.line}] | ${message}`,
      line,
    };
  }
}
