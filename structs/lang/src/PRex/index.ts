import { display } from './rp';

// change export-default to ProdTokenType during production
import TokenType from './tokenTypes';

interface Rcfail {
  line: number;
  message: string;
}

class rcfail {
  private readonly _fail: Rcfail;
  constructor() {
    this._fail = {
      line: 0,
      message: '',
    };
  }
  line(n: number): rcfail {
    this._fail.line = n;
    return this;
  }
  message(s: string): rcfail {
    this._fail.message = `line[${this._fail.line}] Error: ${s}`;
    return this;
  }
  build(): Rcfail {
    return this._fail;
  }
}
const errorReport = new rcfail();

class Token {
  readonly type: TokenType;
  readonly lexeme: string;
  readonly literal: any;
  readonly line: number;
  constructor(type: TokenType, lexeme: string, literal: any, line: number) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
  }
  toString() {
    return this.type + ' ' + this.lexeme + ' ' + this.literal;
  }
}

class Scanner {
  readonly source: string;
  readonly tokens: (Token | Rcfail)[];
  private line: number;
  private start: number;
  private current: number;
  private keywords: Set<string>;
  constructor(source: string) {
    this.source = source;
    this.tokens = [];
    this.line = 1;
    this.start = 0;
    this.current = 0;
    this.keywords = this.defaultKeywords;
  }
  private defaultKeywords = new Set([
    'and',
    'class',
    'else',
    'false',
    'for',
    'fn',
    'if',
    'nil',
    'or',
    'print',
    'return',
    'log',
    'super',
    'this',
    'true',
    'let',
    'while',
  ]);
  setKeywords(keywords: Set<string>) {
    this.keywords = keywords;
  }
  scanTokens() {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }
    this.tokens.push(new Token(TokenType.EOF, '', null, this.line));
    return this.tokens;
  }
  private isAtEnd() {
    return this.current >= this.source.length;
  }
  private scanToken() {
    let c = this.advance();
    switch (c) {
      case '(':
        this.addToken(TokenType.LEFT_PAREN);
        break;
      case ')':
        this.addToken(TokenType.RIGHT_PAREN);
        break;
      case '{':
        this.addToken(TokenType.LEFT_BRACE);
        break;
      case '}':
        this.addToken(TokenType.RIGHT_BRACE);
        break;
      case '[':
        this.addToken(TokenType.LEFT_BRACKET);
        break;
      case ']':
        this.addToken(TokenType.RIGHT_BRACKET);
        break;
      case '~':
        this.addToken(TokenType.TILDE);
        break;
      case ',':
        this.addToken(TokenType.COMMA);
        break;
      case '.':
        this.addToken(TokenType.DOT);
        break;
      case '-':
        this.addToken(TokenType.MINUS);
        break;
      case '+':
        this.addToken(TokenType.PLUS);
        break;
      case ';':
        this.addToken(TokenType.SEMICOLON);
        break;
      case ':':
        this.addToken(TokenType.COLON);
        break;
      case '*':
        this.addToken(TokenType.STAR);
        break;
      case '|':
        this.addToken(TokenType.VBAR);
        break;
      case '/':
        this.addToken(TokenType.SLASH);
        break;
      case '\\':
        this.addToken(TokenType.BSLASH);
        break;
      case '&':
        this.addToken(TokenType.AMPERSAND);
        break;
      case '^':
        this.addToken(TokenType.CARET);
        break;
      case '?':
        this.addToken(TokenType.QUERY);
        break;
      case '$':
        this.addToken(TokenType.DOLLAR);
        break;
      case `'`:
        this.addToken(TokenType.APOSTROPHE);
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
        this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
        break;
      case '>':
        this.addToken(
          this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER
        );
        break;
      case '%':
        this.addToken(TokenType.PERCENT);
        break;
      case `"`:
        this.string();
        break;
      case '#':
        if (this.match('#')) {
          while (this.peek() !== '\n' && !this.isAtEnd()) this.advance();
        } else {
          this.addToken(TokenType.POUND);
        }
        break;
      // ignore all whitespace
      case ' ':
      case '\r':
      case '\t':
        break;
      default:
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          this.tokens.push(
            errorReport.line(this.line).message('Unexpected character').build()
          );
        }
        break;
    }
  }
  private isAlpha(c: string) {
    return ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || c === '_';
  }
  private isAlphanumeric(c: string) {
    return this.isAlpha(c) || this.isDigit(c);
  }
  private identifier() {
    while (this.isAlphanumeric(this.peek())) this.advance();
    const txt = this.source.substring(this.start, this.current);
    let type = this.keywords.has(txt)
      ? TokenType.KEYWORD
      : TokenType.IDENTIFIER;
    this.addToken(type);
  }
  private isDigit(c: string) {
    return c >= '0' && c <= '9';
  }
  private number() {
    let type = TokenType.INTEGER;
    while (this.isDigit(this.peek())) this.advance();
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      type = TokenType.REAL;
      this.advance();
      while (this.isDigit(this.peek())) this.advance();
    }
    this._addToken(
      type,
      Number(this.source.substring(this.start, this.current))
    );
  }
  private peekNext() {
    if (this.current + 1 >= this.source.length) return '\0';
    return this.source.charAt(this.current + 1);
  }
  private string() {
    while (this.peek() !== `"` && !this.isAtEnd()) {
      if (this.peek() === `\n`) this.line++;
      this.advance();
    }
    if (this.isAtEnd()) {
      this.tokens.push(
        errorReport.line(this.line).message('Unterminated string').build()
      );
    }
    this.advance();
    const value = this.source.substring(this.start + 1, this.current - 1);
    this._addToken(TokenType.STRING, value);
  }
  private peek() {
    if (this.isAtEnd()) return '\0';
    return this.source.charAt(this.current);
  }
  private match(c: string) {
    if (this.isAtEnd()) return false;
    if (this.source.charAt(this.current) !== c) return false;
    this.current++;
    return true;
  }
  private addToken(type: TokenType) {
    this._addToken(type, null);
  }
  private _addToken(type: TokenType, literal: any) {
    const txt = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(type, txt, literal, this.line));
  }
  private advance(): string {
    return this.source.charAt(this.current++);
  }
}

// const test = new Scanner(`let x = 1.2`);
// console.log(test.scanTokens());

abstract class Expr {
  left: Expr;
  operator: Token;
  right: Expr;
  constructor(left: Expr, operator: Token, right: Expr) {
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
}

class Binary extends Expr {
  readonly left: Expr;
  readonly operator: Token;
  readonly right: Expr;
  constructor(left: Expr, operator: Token, right: Expr) {
    super(left, operator, right);
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
}

class RDP {
	
}