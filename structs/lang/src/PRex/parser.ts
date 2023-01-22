import { log } from '../utils/index.js';
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
  VarDecl,
  AssignmentExpr,
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

  /**
   * Parses a statement.
   */
  private parseStmt(): Stmt {
    switch (this.peek().type) {
      case TokenType.CONST:
      case TokenType.LET:
        return this.parse_var_declaration();
      default:
        return this.parse_expression();
    }
  }

  /**
   * Parses a declaration.
   */
  private parse_var_declaration(): Stmt {
    if (this.match(TokenType.LET)) {
      return this.parse_var(false);
    } else if (this.match(TokenType.CONST)) {
      return this.parse_var(true);
    } else {
      return this.parseStmt();
    }
  }

  /**
   * Parses a variable declaration.
   */
  parse_var(isConst: boolean): Stmt {
    let name = this.eat(TokenType.SYMBOL, 'Expected a variable name.');
    if (name instanceof ParserError) return name;
    let init: Expr = new NullLiteral();
    if (this.match(TokenType.EQUAL)) {
      init = this.parse_expression();
      if (isConst && !init)
        this.croak(
          'Constant declarations must be initialized inline.',
          'parsing variable'
        );
    }
    return new VarDecl(name.value, init, isConst);
  }

  /**
   * Parses an expression.
   */
  private parse_expression(): Expr {
    const value = this.parse_assignment_expression();
    this.eat(TokenType.SEMICOLON, 'All statements must end with a semicolon.');
    return value;
  }

  private parse_assignment_expression(): Expr {
    let expr = this.parse_additive_expression();
    if (this.match(TokenType.EQUAL)) {
      let value = this.parse_assignment_expression();
      if (expr instanceof SymbolExpr) {
        let name = expr.symbol;
        return new AssignmentExpr(name, value);
      }
      this.croak('Invalid assignment target.', 'parsing assignment expression');
    }
    return expr;
  }

  /**
   * Parses an additive expression.
   */
  private parse_additive_expression(): Expr {
    let expr = this.parse_multiplicative_expression();
    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      let operator = this.prev();
      let right = this.parse_multiplicative_expression();
      expr = this.makeBinex(expr, operator.type, right);
    }
    return expr;
  }

  /**
   * Parses a multiplicative expression.
   */
  private parse_multiplicative_expression(): Expr {
    let expr = this.parse_primary_expression();
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
      let right = this.parse_primary_expression();
      expr = this.makeBinex(expr, operator.type, right);
    }
    return expr;
  }

  private parse_primary_expression(): Expr {
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
        let expr = this.parse_expression();
        this.eat(TokenType.RPAREN, 'Expected right paren.');
        return expr;
      }
      default:
        return this.croak(
          `Unexpected token: [${tk.value}]`,
          'parsing primary expression'
        );
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
    else return this.croak(message, 'eating token');
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
  private croak(message: string, method: string): ParserError {
    const error = new ParserError(
      `ParserError while ${method} | Line[${this.peek().line}] | ${message}`,
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

// const input = `

// let x = 2 * pi;
// x = 4;
// `;

// log(parser.parse(input));
