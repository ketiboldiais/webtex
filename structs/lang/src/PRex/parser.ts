import { log } from '../utils/index.js';
import { Tokenizer, TokenType } from './tokenizer';
import { Token, NodeType } from './typings';
import { any } from '../PCox/index.js';

/* -------------------------------------------------------------------------- */
/*                         ALGEBRAIC EXPRESSION PARSER                        */
/* -------------------------------------------------------------------------- */
/**
 * This is the algebraic expression parser.
 */

/* -------------------------------------------------------------------------- */
/*                                  AST NODES                                 */
/* -------------------------------------------------------------------------- */

export class StatementNode {
  node: NodeType;
  value: any;
  constructor(node: NodeType, value: any = null) {
    this.node = node;
    this.value = value;
  }
}

export class Program extends StatementNode {
  node: NodeType.PROGRAM;
  body: StatementNode[];
  constructor(body: StatementNode[]) {
    super(NodeType.PROGRAM);
    this.node = NodeType.PROGRAM;
    this.body = body;
  }
}

export class VariableDeclarationNode extends StatementNode {
  node: NodeType.VAR;
  symbol: string;
  value: ExpressionNode;
  constant: boolean;
  constructor(
    symbol: string,
    value: ExpressionNode,
    constant: boolean = false
  ) {
    super(NodeType.VAR);
    this.node = NodeType.VAR;
    this.symbol = symbol;
    this.value = value;
    this.constant = constant;
  }
}

export class AssignmentExpressionNode extends StatementNode {
  node: NodeType.ASSIGNMENT_EXPRESSION;
  symbol: string;
  value: any;
  constructor(symbol: string, value: any) {
    super(NodeType.ASSIGNMENT_EXPRESSION, value);
    this.node = NodeType.ASSIGNMENT_EXPRESSION;
    this.symbol = symbol;
    this.value = value;
  }
}

export class BlockNode extends StatementNode {
  value: StatementNode[];
  node: NodeType.BLOCK;
  constructor(value: StatementNode[]) {
    super(NodeType.BLOCK, value);
    this.node = NodeType.BLOCK;
    this.value = value;
  }
}
export class EmptyStatementNode extends StatementNode {
  node: NodeType.EMPTY_STATEMENT;
  constructor() {
    super(NodeType.EMPTY_STATEMENT, null);
    this.node = NodeType.EMPTY_STATEMENT;
  }
}
export class ExpressionNode extends StatementNode {
  value: any;
  node: NodeType;
  constructor(value: any, node: NodeType) {
    super(node, value);
    this.value = value;
    this.node = node;
  }
}

export class BinaryExpressionNode extends ExpressionNode {
  node: NodeType.BINARY_EXPRESSION;
  left: ExpressionNode;
  operator: TokenType;
  right: ExpressionNode;
  constructor(
    left: ExpressionNode,
    operator: TokenType,
    right: ExpressionNode
  ) {
    super(null, NodeType.BINARY_EXPRESSION);
    this.node = NodeType.BINARY_EXPRESSION;
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
}

export class UnaryExpressionNode extends ExpressionNode {
  node: NodeType.UNARY_EXPRESSION;
  operand: ExpressionNode;
  constructor(operand: ExpressionNode) {
    super(null, NodeType.UNARY_EXPRESSION);
    this.node = NodeType.UNARY_EXPRESSION;
    this.operand = operand;
  }
}

export class SymbolNode extends ExpressionNode {
  node: NodeType.SYMBOL;
  symbol: string;
  constructor(symbol: string) {
    super(symbol, NodeType.SYMBOL);
    this.node = NodeType.SYMBOL;
    this.symbol = symbol;
  }
}

export class PropertyNode extends ExpressionNode {
  node: NodeType.PROPERTY;
  value: [string, ExpressionNode];
  constructor(keyValuePair: [string, ExpressionNode]) {
    super(keyValuePair, NodeType.PROPERTY);
    this.node = NodeType.PROPERTY;
    this.value = keyValuePair;
  }
}

export class StructNode extends ExpressionNode {
  node: NodeType.STRUCT;
  value: PropertyNode[];
  constructor(properties: PropertyNode[]) {
    super(properties, NodeType.STRUCT);
    this.node = NodeType.STRUCT;
    this.value = properties;
  }
}

export class IntNode extends ExpressionNode {
  node: NodeType.INTEGER;
  value: number;
  constructor(value: number) {
    super(value, NodeType.INTEGER);
    this.value = value;
    this.node = NodeType.INTEGER;
  }
}

export class RealNode extends ExpressionNode {
  node: NodeType.REAL;
  value: number;
  constructor(value: number) {
    super(value, NodeType.REAL);
    this.value = value;
    this.node = NodeType.REAL;
  }
}

export class StringNode extends ExpressionNode {
  node: NodeType.STRING;
  value: string;
  constructor(value: string) {
    super(value, NodeType.STRING);
    this.node = NodeType.STRING;
    this.value = value;
  }
}

export class BoolNode extends ExpressionNode {
  node: NodeType.BOOL;
  value: boolean;
  constructor(value: boolean) {
    super(value, NodeType.BOOL);
    this.node = NodeType.BOOL;
    this.value = value;
  }
}

export class NullNode extends ExpressionNode {
  node: NodeType.NULL;
  value: null;
  constructor() {
    super(null, NodeType.NULL);
    this.value = null;
    this.node = NodeType.NULL;
  }
}

export class ConditionalNode extends ExpressionNode {
  node: NodeType.CONDITIONAL;
  value: null;
  constructor() {
    super(null, NodeType.NULL);
    this.node = NodeType.CONDITIONAL;
    this.value = null;
  }
}

export class ParserError extends ExpressionNode {
  node: NodeType.PARSER_ERROR;
  message: string;
  line: number;
  constructor(message: string, line: number) {
    super(message, NodeType.PARSER_ERROR);
    this.message = message;
    this.line = line;
  }
}

export class Algebra extends ExpressionNode {
  node: NodeType.ALGEBRA;
  value: ExpressionNode;
  constructor(expr: ExpressionNode) {
    super(expr, NodeType.ALGEBRA);
    this.node = NodeType.ALGEBRA;
    this.value = expr;
  }
}

/* -------------------------------------------------------------------------- */
/*                                   PARSER                                   */
/* -------------------------------------------------------------------------- */

class Parser {
  private tokens: Token[] = [];
  private tokenizer: Tokenizer;
  private current: number;
  private nil: NullNode;
  private error: ParserError | null;
  constructor() {
    this.tokenizer = new Tokenizer();
    this.current = 0;
    this.nil = new NullNode();
    this.error = null;
  }

  /**
   * Given an input source code, parses the code
   * according to the following grammar:
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   * => Program
   *    => Statement List
   *       => StatementNode
   *          => Block Statement
   *             => Statement List
   *          => Variable Declaration
   *          => Expression
   *             => Assignment Expression
   *             => Member Expression
   *             => Call Expression
   *             => Logical Expression
   *             => Comparison Expression
   *             => Additive Expression
   *             => Multplicative Expression
   *             => Exponential Expression
   *             => Unary Expression
   *             => Primary Expression
   *                => Literal
   *                => Expression
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   */
  public parse(sourceCode: string): Program | ParserError {
    this.tokens = this.tokenizer.scan(sourceCode);
    if (this.tokenizer.error) {
      return this.tokenizer.result;
    }
    let body = this.parse_statement_list();
    if (body instanceof ParserError) return body;
    return new Program(body);
  }

  private parse_statement_list(
    stop: any = null
  ): StatementNode[] | ParserError {
    let body: StatementNode[] = [];
    while (this.hasTokens() && this.peek().type !== stop) {
      body.push(this.parse_statement());
      if (this.error) return this.error;
    }
    return body;
  }

  /**
   * Parses a statement.
   */
  private parse_statement(): StatementNode {
    switch (this.peek().type) {
      case TokenType.SEMICOLON:
        return this.parse_empty_statement();
      case TokenType.LBRACE:
        return this.parse_block();
      case TokenType.CONST:
      case TokenType.LET:
        return this.parse_var_declaration();
      default:
        return this.parse_expression();
    }
  }

  private parse_empty_statement(): StatementNode {
    this.advance();
    return new EmptyStatementNode();
  }

  private parse_block(): StatementNode | ParserError {
    this.advance();
    const body =
      this.peek().type !== TokenType.RBRACE
        ? this.parse_statement_list(TokenType.RBRACE)
        : [];
    this.eat(TokenType.RBRACE, 'Expected “}” to close block.');
    return new BlockNode(body as StatementNode[]);
  }

  /**
   * Parses a declaration.
   */
  private parse_var_declaration(): StatementNode {
    if (this.match(TokenType.LET)) {
      return this.parse_var(false);
    }
    if (this.match(TokenType.CONST)) {
      return this.parse_var(true);
    }
    return this.parse_statement();
  }

  /**
   * Parses a variable declaration.
   */
  parse_var(isConst: boolean): StatementNode {
    let name = this.eat(TokenType.SYMBOL, 'Expected a variable name.');
    if (name instanceof ParserError) return name;
    let init: ExpressionNode = this.nil;
    if (this.match(TokenType.EQUAL)) {
      init = this.parse_expression();
      if (isConst && !init)
        this.croak(
          'Constant declarations must be initialized inline.',
          'parsing variable'
        );
    }
    return new VariableDeclarationNode(name.value, init, isConst);
  }

  /**
   * Parses an expression.
   */
  private parse_expression(): ExpressionNode {
    const value = this.parse_assignment_expression();
    this.eat(TokenType.SEMICOLON, 'All statements must end with a semicolon.');
    return value;
  }

  private parse_assignment_expression(): ExpressionNode {
    let expr = this.parse_logical_expression();
    if (this.match(TokenType.EQUAL)) {
      let value = this.parse_logical_expression();
      if (expr instanceof SymbolNode) {
        let name = expr.symbol;
        return new AssignmentExpressionNode(name, value);
      }
      this.croak('Invalid assignment target.', 'parsing assignment expression');
    }
    return expr;
  }

  private parse_logical_expression(): ExpressionNode {
    return this.parse_and_expression();
  }

  private parse_and_expression(): ExpressionNode {
    let expr = this.parse_or_expression();
    while (this.match(TokenType.AND)) {
      let operator = this.prev();
      let right = this.parse_or_expression();
      expr = new BinaryExpressionNode(expr, operator.type, right);
    }
    return expr;
  }

  private parse_or_expression(): ExpressionNode {
    let expr = this.parse_nand_expression();
    while (this.match(TokenType.OR)) {
      let operator = this.prev();
      let right = this.parse_nand_expression();
      expr = new BinaryExpressionNode(expr, operator.type, right);
    }
    return expr;
  }

  private parse_nand_expression(): ExpressionNode {
    let expr = this.parse_nor_expression();
    while (this.match(TokenType.NAND)) {
      let operator = this.prev();
      let right = this.parse_nor_expression();
      expr = new BinaryExpressionNode(expr, operator.type, right);
    }
    return expr;
  }

  /**
   * Parses a `nor` expression.
   * @example
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   * let a = false
   * let b = false
   * let c = a nor b // true
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   */
  private parse_nor_expression() {
    let expr = this.parse_xor_expression();
    while (this.match(TokenType.NOR)) {
      let operator = this.prev();
      let right = this.parse_nor_expression();
      expr = new BinaryExpressionNode(expr, operator.type, right);
    }
    return expr;
  }

  /**
   * Parses a `xor` expression.
   */
  private parse_xor_expression() {
    let expr = this.parse_xnor_expression();
    while (this.match(TokenType.XOR)) {
      let operator = this.prev();
      let right = this.parse_nor_expression();
      expr = new BinaryExpressionNode(expr, operator.type, right);
    }
    return expr;
  }

  private parse_xnor_expression() {
    let expr = this.parse_equality_expression();
    while (this.match(TokenType.XNOR)) {
      let operator = this.prev();
      let right = this.parse_equality_expression();
      expr = new BinaryExpressionNode(expr, operator.type, right);
    }
    return expr;
  }

  private parse_equality_expression(): ExpressionNode {
    let expr = this.relational_expression();
    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      let operator = this.prev();
      let right = this.relational_expression();
      expr = new BinaryExpressionNode(expr, operator.type, right);
    }
    return expr;
  }

  private relational_expression(): ExpressionNode {
    let expr = this.parse_additive_expression();
    while (
      this.match(TokenType.GT, TokenType.GTE, TokenType.LT, TokenType.LTE)
    ) {
      let operator = this.prev();
      let right = this.parse_additive_expression();
      expr = new BinaryExpressionNode(expr, operator.type, right);
    }
    return expr;
  }

  /**
   * Parses an additive expression.
   */
  private parse_additive_expression(): ExpressionNode {
    let expr = this.parse_multiplicative_expression();
    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      let operator = this.prev();
      let right = this.parse_multiplicative_expression();
      expr = new BinaryExpressionNode(expr, operator.type, right);
    }
    return expr;
  }

  /**
   * Parses a multiplicative expression.
   */
  private parse_multiplicative_expression(): ExpressionNode {
    let expr = this.parse_exponential_expression();
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
      let right = this.parse_exponential_expression();
      expr = new BinaryExpressionNode(expr, operator.type, right);
    }
    return expr;
  }

  private parse_exponential_expression(): ExpressionNode {
    let expr = this.parse_primary_expression();
    if (this.match(TokenType.CARET)) {
      let operator = this.prev();
      let right = this.parse_additive_expression();
      expr = new BinaryExpressionNode(expr, operator.type, right);
    }
    return expr;
  }

  private parse_primary_expression(): ExpressionNode {
    const tk = this.advance();
    switch (tk.type) {
      case TokenType.SYMBOL:
        return new SymbolNode(tk.value);
      case TokenType.INTEGER:
        return new IntNode(tk.value);
      case TokenType.REAL:
        return new RealNode(tk.value);
      case TokenType.STRING:
        return new StringNode(tk.value);
      case TokenType.BOOL:
        return new BoolNode(tk.value);
      case TokenType.NULL:
        return this.nil;
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
}

export const parser = new Parser();
const input = `

let x = 5;
{
  let y = 10;
}

`;
log(parser.parse(input));
