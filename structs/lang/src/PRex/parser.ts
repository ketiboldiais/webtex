import {
  ParserError,
  Program,
  Stmt,
  Expr,
  SymbolExpr,
  StringLiteral,
  NullLiteral,
  IntegerLiteral,
  RealLiteral,
  BooleanLiteral,
  BinaryExpr,
  UnaryExpr,
} from './nodes';
import { TokenType } from './token';
import { Tokenizer } from './tokenizer';
import { Token, NodeType } from './typings';

class Parser {
  private tokens: Token[] = [];
  private tokenizer: Tokenizer;
  private current: number;
  private error: ParserError | null;
  constructor() {
    this.tokenizer = new Tokenizer();
    this.current = 0;
    this.error = null;
  }

  /**
   * Parses the argument `src`, following the
   * order of precedence:
   *
   * 1. assignment expression
   * 2. member expression
   * 3. call expression
   * 4. logical expression
   * 5. comparison expression
   * 6. additive binary expression
   * 7. multiplicative binary expression
   * 8. exponentional binary expression
   * 9. unary expression
   * 10. primary expression
   */
  public parse(src: string): Program | ParserError {
    this.tokens = this.tokenizer.scan(src);
    if (this.tokenizer.error) {
      return this.tokenizer.result;
    }
    let body: Stmt[] = [];
    while (this.hasTokens()) {
      body.push(this.parseStmt());
      if (this.error) return this.error;
    }
    return new Program(body);
  }
  private parseStmt(): Stmt {
    return this.parseExpr();
  }
  private parseExpr(): Expr {
    return this.addExpr();
  }
  private addExpr(): Expr {
    let expr = this.mulExpr();
    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      let operator = this.prev();
      let right = this.mulExpr();
      expr = this.makeBinex(expr, operator.type, right);
    }
    return expr;
  }
  private mulExpr(): Expr {
    let expr = this.parsePrimaryExpr();
    while (
      this.match(
        TokenType.MUL,
        TokenType.DIV,
        TokenType.QUOT,
        TokenType.REM,
        TokenType.MOD
      )
    ) {
      let operator = this.prev();
      let right = this.parsePrimaryExpr();
      expr = this.makeBinex(expr, operator.type, right);
    }
    return expr;
  }

  private parsePrimaryExpr(): Expr {
    const tk = this.advance();
    switch (tk.type) {
      case TokenType.SYMBOL:
        return this.makeSymbolExpr(tk.value);
      case TokenType.INTEGER:
        return this.makeInteger(tk.value);
      case TokenType.REAL:
        return this.makeReal(tk.value);
      case TokenType.STRING:
        return this.makeString(tk.value);
      case TokenType.BOOL:
        return this.makeBool(tk.value);
      case TokenType.NULL:
        return this.makeNull();
      case TokenType.LPAREN: {
        let expr = this.parseExpr();
        this.eat(TokenType.RPAREN, 'Expected right paren.');
        return expr;
      }
      default:
        return this.croak(`Unexpected token.`);
    }
  }
  private match(...tokentypes: TokenType[]): boolean {
    for (let i = 0; i < tokentypes.length; i++) {
      if (this.check(tokentypes[i])) {
        this.advance();
        return true;
      }
    }
    return false;
  }
  private eat(type: TokenType, message: string) {
    if (this.check(type)) return this.advance();
    else this.croak(message);
  }
  private check(type: TokenType): boolean {
    if (!this.hasTokens()) return false;
    return this.peek().type === type;
  }
  private advance(): Token {
    if (this.hasTokens()) this.current += 1;
    return this.prev();
  }
  private prev(): Token {
    return this.tokens[this.current - 1];
  }
  private peek(): Token {
    return this.tokens[this.current];
  }
  private hasTokens(): boolean {
    return this.peek().type !== TokenType.EOF;
  }
  private croak(message: string): ParserError {
    const error = new ParserError(
      `Parser Error | Line[${this.peek().line}] | ${message}`,
      this.peek().line
    );
    this.error = error;
    return error;
  }
  private makeSymbolExpr(symbol: string): SymbolExpr {
    return new SymbolExpr(symbol);
  }
  private makeString(value: string): StringLiteral {
    return { node: NodeType.STRING, value };
  }
  private makeNull(): NullLiteral {
    return new NullLiteral();
  }
  private makeInteger(value: number): IntegerLiteral {
    return new IntegerLiteral(value);
  }
  private makeReal(value: number): RealLiteral {
    return new RealLiteral(value);
  }
  private makeBool(value: boolean): BooleanLiteral {
    return new BooleanLiteral(value);
  }
  private makeBinex(left: Expr, operator: TokenType, right: Expr): BinaryExpr {
    return new BinaryExpr(left, operator, right);
  }
  private makeUnaryExpr(operand: Expr): UnaryExpr {
    return new UnaryExpr(operand);
  }
}

export const parser = new Parser();
