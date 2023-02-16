/**
 * @file This is the `PRex` parser used by the Webtex editor. It’s
 * specifically designed to work with Webtex, rather than a flexible,
 * reusable module.
 */

/** Mathematical methods. */
import { rem } from '../PRex/math';

/**
 * Token types are found in the `tokenType` file.
 * During development, that file default-exports
 * `DevTokenType`. This should be changed to `ProdTokenType`
 * during production.
 */

import TokenType from './tokenTypes';

// prettier-ignore
import {
  LEFT_PAREN, RIGHT_PAREN, LEFT_BRACE, RIGHT_BRACE,
  LEFT_BRACKET, RIGHT_BRACKET, COMMA, DOT,
  MINUS, PLUS, CONCAT, SEMICOLON,
  SLASH, QUOT, BSLASH, PERCENT,
  MOD, REM, LOG, SQRT,
  LN, LG, CARET, COLON,
  DOLLAR, QUERY, STAR,
  AMPERSAND, TILDE, APOSTROPHE, VBAR,
  BANG, BANG_EQUAL, EQUAL, EQUAL_EQUAL,
  GREATER, GREATER_EQUAL, LESS, POUND,
  LESS_EQUAL, KEYWORD, SYMBOL, INTEGER,
  REAL, STRING, FALSE, TRUE,
  NULL, AND, OR, NOT,
  XOR, NOR, XNOR, NAND,
  IF, THEN, ELSE, LET,
  IN, EOF,
} from './tokenTypes';

/** Print methods for development. */
import { display } from './rp';
const { log: print } = console;

/* -------------------------------------------------------------------------- */
/*                                   SCANNER                                  */
/* -------------------------------------------------------------------------- */
/**
 * The `Scanner` class generates tokens. Other systems call this a Tokenizer.
 */

/**
 * Objects generated by the `Scanner` are instances of `Token`.
 * @internal
 */
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

class Err {
  message: string;
  line: number;
  constructor(message: string, line: number) {
    this.message = `Tokenizer Error | Line[${line}] | ${message}`;
    this.line = line;
  }
}

/**
 * The `Scanner` class tokenizes an input string.
 */
class Scanner {
  private source: string;
  private tokens: Token[];
  private errors: Err[];
  private line: number;
  private start: number;
  private current: number;
  private keywords: Map<string, TokenType>;
  didErr: boolean;
  constructor() {
    this.tokens = [];
    this.errors = [];
    this.line = 1;
    this.start = 0;
    this.current = 0;
    this.didErr = false;
    this.keywords = new Map<string, TokenType>([
      ['false', FALSE],
      ['true', TRUE],
      ['null', NULL],
      ['and', AND],
      ['or', OR],
      ['not', NOT],
      ['xor', XOR],
      ['nor', NOR],
      ['xnor', XNOR],
      ['nand', NAND],
      ['if', IF],
      ['then', THEN],
      ['else', ELSE],
      ['let', LET],
      ['mod', MOD],
      ['rem', REM],
      ['in', IN],
      ['log', LOG],
      ['ln', LN],
      ['lg', LG],
      ['sqrt', SQRT],
    ]);
  }
  scanTokens(source: string) {
    this.source = source;
    while (this.hasChars) {
      this.start = this.current;
      this.scanToken();
    }
    if (this.didErr) return this.errors;
    this.tokens.push(new Token(EOF, '', null, this.line));
    return this.tokens;
  }
  private get hasChars() {
    return this.current < this.source.length;
  }
  private scanToken() {
    let c = this.next;
    switch (c) {
      case ' ':
      case '\r':
      case '\t':
        break;
      case '\n':
        this.line++;
        break;
      case '(':
        this.write(LEFT_PAREN);
        break;
      case ')':
        this.write(RIGHT_PAREN);
        break;
      case '{':
        this.write(LEFT_BRACE);
        break;
      case '}':
        this.write(RIGHT_BRACE);
        break;
      case '[':
        this.write(LEFT_BRACKET);
        break;
      case ']':
        this.write(RIGHT_BRACKET);
        break;
      case '~':
        this.write(TILDE);
        break;
      case ',':
        this.write(COMMA);
        break;
      case '.':
        this.write(DOT);
        break;
      case '-':
        this.write(MINUS);
        break;
      case '+':
        this.write(this.match('+') ? CONCAT : PLUS);
        break;
      case ';':
        this.write(SEMICOLON);
        break;
      case ':':
        this.write(COLON);
        break;
      case '*':
        this.write(STAR);
        break;
      case '|':
        this.write(VBAR);
        break;
      case '/':
        this.write(this.match('/') ? QUOT : SLASH);
        break;
      case '\\':
        this.write(BSLASH);
        break;
      case '&':
        this.write(AMPERSAND);
        break;
      case '^':
        this.write(CARET);
        break;
      case '?':
        this.write(QUERY);
        break;
      case '$':
        this.write(DOLLAR);
        break;
      case `'`:
        this.write(APOSTROPHE);
        break;
      case '!':
        this.write(this.match('=') ? BANG_EQUAL : BANG);
        break;
      case '=':
        this.write(this.match('=') ? EQUAL_EQUAL : EQUAL);
        break;
      case '<':
        this.write(this.match('=') ? LESS_EQUAL : LESS);
        break;
      case '>':
        this.write(this.match('=') ? GREATER_EQUAL : GREATER);
        break;
      case '%':
        this.write(PERCENT);
        break;
      case `"`:
        this.string();
        break;
      case '#':
        if (this.match('#')) {
          while (this.peek !== '\n' && this.hasChars) {
            this.next;
          }
        } else this.write(POUND);
        break;

      default:
        if (this.isDigit(c)) this.number();
        else if (this.isAlpha(c)) this.id();
        else this.err('Unexpected character.');
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
  private id() {
    while (this.isAlphanumeric(this.peek)) this.next;
    const txt = this.source.substring(this.start, this.current);
    let type = this.keywords.has(txt)
      ? this.keywords.get(txt) ?? KEYWORD
      : SYMBOL;
    this.write(type);
  }
  private number() {
    let type = INTEGER;
    while (this.isDigit(this.peek)) this.next;
    if (this.peek === '.' && this.isDigit(this.peekNext())) {
      type = REAL;
      this.next;
      while (this.isDigit(this.peek)) this.next;
    }
    this.addToken(
      type,
      Number(this.source.substring(this.start, this.current))
    );
  }
  private peekNext() {
    if (this.current + 1 >= this.source.length) return '\0';
    return this.source.charAt(this.current + 1);
  }
  private string() {
    while (this.peek !== `"` && this.hasChars) {
      if (this.peek === `\n`) this.line++;
      this.next;
    }
    if (!this.hasChars) {
      this.err('Unterminated string');
    }
    this.next;
    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(STRING, value);
  }

  private match(c: string) {
    if (!this.hasChars) return false;
    if (this.source.charAt(this.current) !== c) return false;
    this.current++;
    return true;
  }
  private write(type: TokenType) {
    this.addToken(type, null);
  }
  private err(msg: string) {
    this.errors.push(new Err(msg, this.line));
    this.didErr = true;
  }
  private addToken(type: TokenType, literal: any) {
    const txt = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(type, txt, literal, this.line));
  }
  private get peek() {
    if (!this.hasChars) return '\0';
    return this.source.charAt(this.current);
  }
  private get next(): string {
    return this.source.charAt(this.current++);
  }
}

/* -------------------------------------------------------------------------- */
/*                                  AST NODES                                 */
/* -------------------------------------------------------------------------- */
/**
 * The classes that follow are all AST nodes. They’re used exclusively by the
 * the `PRex` parser. They aren’t useful on their own.
 */

enum NodeType {
  GROUPING = 'GROUPING_EXPRESSION',
  BINEX = 'BINARY_EXPRESSION',
  UNEX = 'UNARY_EXPRESSION',
  DEFINITION = 'DEFINITION_EXPRESSION',
  INTEGER = 'LITERAL_INTEGER',
  REAL = 'LITERAL_REAL',
  BOOL = 'LITERAL_BOOL',
  NULL = 'LITERAL_NULL',
  STRING = 'LITERAL_STRING',
  EXPRESSIONS = 'EXPRESSION_LIST',
  ERROR = 'ERROR',
}

class Expression {
  type: NodeType;
  constructor(type: NodeType) {
    this.type = type;
  }
}

class ExpressionList extends Expression {
  expressions: Expression[];
  constructor(exprs: Expression[]) {
    super(NodeType.EXPRESSIONS);
    this.expressions = exprs;
  }
}

class Group extends Expression {
  expr: Expression;
  constructor(expr: Expression) {
    super(NodeType.GROUPING);
    this.expr = expr;
  }
}
class Binex extends Expression {
  left: Expression;
  operator: Token;
  right: Expression;
  constructor(left: Expression, operator: Token, right: Expression) {
    super(NodeType.BINEX);
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
}

class Unex extends Expression {
  operator: Token;
  operand: Expression;
  constructor(operator: Token, operand: Expression) {
    super(NodeType.UNEX);
    this.operator = operator;
    this.operand = operand;
  }
}

class Defex extends Expression {
  identifier: Token;
  value: Expression;
  constructor(identifier: Token, value: Expression) {
    super(NodeType.DEFINITION);
    this.identifier = identifier;
    this.value = value;
  }
}

/**
 * Instances of a literal expression.
 */

class Integer extends Expression {
  value: number;
  constructor(value: number) {
    super(NodeType.INTEGER);
    this.value = value;
  }
}
class Real extends Expression {
  value: number;
  constructor(value: number) {
    super(NodeType.REAL);
    this.value = value;
  }
}
class Bool extends Expression {
  value: boolean;
  constructor(value: boolean) {
    super(NodeType.BOOL);
    this.value = value;
  }
}
class Null extends Expression {
  value: null;
  constructor(value: null) {
    super(NodeType.NULL);
    this.value = value;
  }
}
class String extends Expression {
  value: string;
  constructor(value: string) {
    super(NodeType.STRING);
    this.value = value;
  }
}

class ParserError extends Expression {
  message: string;
  line: number;
  constructor(message: string, line: number) {
    super(NodeType.ERROR);
    this.message = `Parser Error | line ${line} | ${message}`;
    this.line = line;
  }
}

/* -------------------------------------------------------------------------- */
/*                                    PRex                                    */
/* -------------------------------------------------------------------------- */
/**
 * A recursive descent parser.
 */

class PRex {
  private tokens: Token[];
  src: string;
  private current: number;
  private scanner: Scanner;
  didErr: boolean;
  error: ParserError;
  constructor() {
    this.current = 0;
    this.scanner = new Scanner();
    this.didErr = false;
  }

  /**
   * Parses the `input` string.
   */
  parse(input: string) {
    this.src = input;
    let scannerOutput = this.scanner.scanTokens(input);

    if (this.scanner.didErr) {
      return scannerOutput as Err[];
    } else {
      this.tokens = scannerOutput as Token[];
      return this.expression();
    }
  }

  /**
   * Expands the `equality` grammar rule.
   *
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   * expression ⟹ equality
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   */
  private expression() {
    const expr = this.equality();
    this.eat(TokenType.SEMICOLON, 'Expected a semicolon.');
    if (this.didErr) {
      return this.error;
    }
    return expr;
  }

  /**
   * The equality grammar rule.
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   * equality ⟹ comparison ( (`!=`|`==`) comparsion )* ;
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   */
  private equality() {
    let expr = this.comparison();
    while (this.match(BANG_EQUAL, EQUAL_EQUAL)) {
      let operator: Token = this.previous();
      let right = this.comparison();
      expr = new Binex(expr, operator, right);
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
    while (this.match(GREATER, GREATER_EQUAL, LESS, LESS_EQUAL)) {
      let operator = this.previous();
      let right = this.term();
      expr = new Binex(expr, operator, right);
      if (this.didErr) return this.error;
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
    while (this.match(MINUS, PLUS)) {
      let operator = this.previous();
      let right = this.factor();
      expr = new Binex(expr, operator, right);
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
    let expr = this.unaryPrefix();
    while (this.match(SLASH, QUOT, STAR, MOD, REM, CONCAT)) {
      let operator = this.previous();
      let right = this.unaryPrefix();
      expr = new Binex(expr, operator, right);
    }
    return expr;
  }

  /**
   * Applies the unary-expression grammar rule.
   */
  private unaryPrefix(): Expression {
    if (this.match(BANG, MINUS, LOG, LN, LG, SQRT)) {
      let operator = this.previous();
      let right = this.unaryPrefix();
      return new Unex(operator, right);
    }
    return this.primary();
  }

  /**
   * Applies the primary-expression grammar rule.
   */
  private primary(): Expression {
    if (this.match(FALSE)) return new Bool(false);
    if (this.match(TRUE)) return new Bool(true);
    if (this.match(NULL)) return new Null(null);
    if (this.match(REAL)) return new Real(Number(this.previous().literal));
    if (this.match(INTEGER))
      return new Integer(Number(this.previous().literal));
    if (this.match(STRING)) return new String(this.previous().literal);
    if (this.match(LEFT_PAREN)) {
      let expr = this.expression();
      this.eat(RIGHT_PAREN, 'expected closing right parenthesis');
      return new Group(expr);
    }
    return this.setError('Unrecognized grammar.');
  }

  /* ------------------------------- AUXILIARIES ------------------------------ */
  /**
   * All of the methods that follow are auxiliary methods for the parsing methods
   * above. These methods are all private. They aren’t intended to be used by the
   * user.
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
  private eat(type: TokenType, message: string) {
    if (this.check(type)) return this.advance();
    this.setError(message);
  }

  private setError(message: string) {
    this.didErr = true;
    this.error = new ParserError(message, this.tokens[this.current - 1].line);
    return this.error;
  }

  /**
   * Returns `true` if the parser has reached
   * the end of the tokens array, `false`
   * otherwise.
   */
  private atEnd(): boolean {
    return this.peek().type === EOF;
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

const input = `
1+5;
`;

const result = mathParser.parse(input);
// const result = new Scanner().scanTokens(input);

print(result);
