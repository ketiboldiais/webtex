import { display } from './rp';

// change export-default to ProdTokenType during production
import TokenType from './tokenTypes';

interface Rcfail {
  line: number;
  message: string;
}

class rcfail {
  _fail: Rcfail;
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
  readonly tokens: Token[];
  private line: number;
  private start: number;
  private current: number;
  private keywords: Map<string, TokenType>;
  constructor(source: string) {
    this.source = source;
    this.tokens = [];
    this.line = 1;
    this.start = 0;
    this.current = 0;
    this.keywords = new Map<string, TokenType>([
      ['false', TokenType.FALSE],
      ['true', TokenType.TRUE],
      ['null', TokenType.NULL],
      ['and', TokenType.AND],
      ['or', TokenType.OR],
      ['not', TokenType.NOT],
      ['xor', TokenType.XOR],
      ['nor', TokenType.NOR],
      ['xnor', TokenType.XNOR],
      ['nand', TokenType.NAND],
      ['if', TokenType.IF],
      ['then', TokenType.THEN],
      ['else', TokenType.ELSE],
      ['let', TokenType.LET],
      ['in', TokenType.IN],
    ]);
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
        this.addToken(this.match('+') ? TokenType.CONC : TokenType.PLUS);
        break;
      case ';':
        this.addToken(TokenType.SEMICOLON);
        break;
      case ':':
        this.addToken(this.match('=') ? TokenType.DEFINE : TokenType.COLON);
        break;
      case '*':
        this.addToken(TokenType.STAR);
        break;
      case '|':
        this.addToken(TokenType.VBAR);
        break;
      case '/':
        this.addToken(this.match('/') ? TokenType.QUOT : TokenType.SLASH);
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
          throw new SyntaxError('Unexpected character.');
        }
        break;
    }
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
  private identifier() {
    while (this.isAlphanumeric(this.peek())) this.advance();
    const txt = this.source.substring(this.start, this.current);
    let type = this.keywords.has(txt)
      ? this.keywords.get(txt) ?? TokenType.KEYWORD
      : TokenType.SYMBOL;
    this.addToken(type);
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
      throw new SyntaxError('Unterminated string.');
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

class Expression {}
class BinaryExpr extends Expression {
  left: Expression;
  operator: Token;
  right: Expression;
  constructor(left: Expression, operator: Token, right: Expression) {
    super();
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
}

class UnaryExpr extends Expression {
  operator: Token;
  right: Expression;
  constructor(operator: Token, right: Expression) {
    super();
    this.operator = operator;
    this.right = right;
  }
}
type Primitive = boolean | null | number | string;
class Literal extends Expression {
  value: Primitive;
  constructor(value: Primitive) {
    super();
    this.value = value;
  }
}
class Integer extends Literal {
  constructor(value: number) {
    super(value);
    this.value = value;
  }
}
class Real extends Literal {
  constructor(value: number) {
    super(value);
    this.value = value;
  }
}
class Bool extends Literal {
  constructor(value: boolean) {
    super(value);
    this.value = value;
  }
}
class Null extends Literal {
  constructor(value: null) {
    super(value);
    this.value = value;
  }
}
class String extends Literal {
  constructor(value: string) {
    super(value);
    this.value = value;
  }
}

class Group extends Expression {
  expr: Expression;
  constructor(expr: Expression) {
    super();
    this.expr = expr;
  }
}

class PRex {
  private tokens: Token[];
  private src: string;
  private current: number;
  constructor() {
    this.current = 0;
  }

  /**
   * Parses the `input` string.
   */
  parse(input: string) {
    this.src = input;
    this.tokens = new Scanner(this.src).scanTokens();
    return this.output();
  }
  
  /**
   * Returns the result of the parse.
   */
  private output() {
    return this.expression();
  }

  /**
   * Expands the `equality` grammar rule.
   * 
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   * expression ⟹ equality
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   */
  private expression() {
    return this.equality();
  }
  
  /**
   * The equality grammar rule.
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   * equality ⟹ comparison ( (`!=`|`==`) comparsion )* ;
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   */
  private equality() {
    let expr = this.comparison();
    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      let operator: Token = this.previous();
      let right = this.comparison();
      expr = new BinaryExpr(expr, operator, right);
    }
    return expr;
  }
  
  /**
   * Applies the comparison grammar rule.
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   * comparison ⟹ term ( (`>`|`>=`|`<`|`<=`) term )* ;
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   */
  private comparison(): Expression {
    let expr = this.term();
    while (
      this.match(
        TokenType.GREATER,
        TokenType.GREATER_EQUAL,
        TokenType.LESS,
        TokenType.LESS_EQUAL
      )
    ) {
      let operator = this.previous();
      let right = this.term();
      expr = new BinaryExpr(expr, operator, right);
    }

    return expr;
  }
  
  /**
   * Applies term grammar rule. Other parsers call this rule
   * the additive expression rule.
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   * term ⟹ factor ( (`-`|`+`) factor )* ;
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   */
  private term(): Expression {
    let expr = this.factor();
    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      let operator = this.previous();
      let right = this.factor();
      expr = new BinaryExpr(expr, operator, right);
    }
    return expr;
  }
  
  /**
   * Applies factor grammar rule. Other parsers call this rule
   * the multiplicative expression rule.
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   * unary ⟹ unary ( (`/`|`//`|`*`) unary )* ;
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   */
  private factor(): Expression {
    let expr = this.unary();
    while (this.match(TokenType.SLASH, TokenType.QUOT, TokenType.STAR)) {
      let operator = this.previous();
      let right = this.unary();
      expr = new BinaryExpr(expr, operator, right);
    }
    return expr;
  }
  
  /**
   * Applies the unary-expression grammar rule.
   */
  private unary(): Expression {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      let operator = this.previous();
      let right = this.unary();
      return new UnaryExpr(operator, right);
    }
    return this.primary();
  }
  
  /**
   * Applies the primary-expression grammar rule.
   */
  private primary(): Expression {
    if (this.match(TokenType.FALSE)) return new Bool(false);
    if (this.match(TokenType.TRUE)) return new Bool(true);
    if (this.match(TokenType.NULL)) return new Null(null);
    if (this.match(TokenType.REAL))
      return new Real(Number(this.previous().literal));
    if (this.match(TokenType.INTEGER))
      return new Integer(Number(this.previous().literal));
    if (this.match(TokenType.STRING))
      return new String(this.previous().literal);
    if (this.match(TokenType.LEFT_PAREN)) {
      let expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, 'expected right parenthesis');
      return new Group(expr);
    }
    throw new SyntaxError('Unrecognized grammar.');
  }
  

  /* ------------------------------- AUXILIARIES ------------------------------ */
  /**
   * All of the methods that follow are auxiliary methods for the parsing methods
   * above.
   */


  /**
   * Checks if the current token matches any of the given
   * types provided. If the current token matches, the
   * token is consumed.
   */
  private match(...types: TokenType[]): boolean {
    for (let i = 0; i < types.length; i++) {
      if (this.check(types[i])) {
        this.advance();
        return true;
      }
    }
    return false;
  }
  
  /**
   * Returns `true` if the current token
   * matches the type provided, `false` otherwise.
   * Unlike the `match` method, the `check` method
   * _does not_ consume the matching token.
   */
  private check(type: TokenType): boolean {
    if (this.atEnd()) return false;
    return this.peek().type === type;
  }
  
  /**
   * Consumes the current token and returns it.
   */
  private advance(): Token {
    if (!this.atEnd()) this.current++;
    return this.previous();
  }

  /**
   * Consumes the current token _without_ returning it.
   */
  private consume(type: TokenType, message: string) {
    if (this.check(type)) return this.advance();
    throw new SyntaxError(message);
  }

  /**
   * Returns `true` if the parser has reached
   * the end of the tokens array, `false`
   * otherwise.
   */
  private atEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  /**
   * Returns the current token _without_
   * consuming it.
   */
  private peek(): Token {
    return this.tokens[this.current];
  }
  
  /**
   * Returns the last token token read.
   */
  private previous(): Token {
    return this.tokens[this.current - 1];
  }
}

const mathParser = new PRex();

const result = mathParser.parse('1 + (3 * 5)');

display(result);
