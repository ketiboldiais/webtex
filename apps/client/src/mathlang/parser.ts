import { log } from "./dev.js";
import { Queue } from "./queue.js";
import { NUM_TOKEN, TOKEN, Token } from "./tokentype.js";

/* -------------------------------------------------------------------------- */
/*                                    LEXER                                   */
/* -------------------------------------------------------------------------- */

const keywords = {
  [`and`]: TOKEN.AND,
  [`nand`]: TOKEN.NAND,
  [`class`]: TOKEN.CLASS,
  [`throw`]: TOKEN.THROW,
  [`div`]: TOKEN.DIV,
  [`else`]: TOKEN.ELSE,
  [`for`]: TOKEN.FOR,
  [`function`]: TOKEN.FUNCTION,
  [`fn`]: TOKEN.FN,
  [`if`]: TOKEN.IF,
  [`return`]: TOKEN.RETURN,
  [`super`]: TOKEN.SUPER,
  [`this`]: TOKEN.THIS,
  [`that`]: TOKEN.THAT,
  [`while`]: TOKEN.WHILE,
  [`do`]: TOKEN.DO,
  [`Inf`]: TOKEN.INF,
  [`mod`]: TOKEN.MOD,
  [`nor`]: TOKEN.NOR,
  [`NaN`]: TOKEN.NAN,
  [`not`]: TOKEN.NOT,
  [`null`]: TOKEN.NULL,
  [`or`]: TOKEN.OR,
  [`rem`]: TOKEN.REM,
  [`to`]: TOKEN.TO,
  [`true`]: TOKEN.TRUE,
  [`false`]: TOKEN.FALSE,
  [`xor`]: TOKEN.XOR,
  [`xnor`]: TOKEN.XNOR,
  [`let`]: TOKEN.LET,
  [`var`]: TOKEN.VAR,
  [`const`]: TOKEN.CONST,
};
type Keyword = keyof typeof keywords;
type LEXEME = Lexeme | Keyword;

export interface Lexer {
  source: string;
  start: number;
  current: number;
  end: number;
  line: number;
  numtype: NUM_TOKEN;
}
export class Lexer {
  init(source: string) {
    this.source = source;
    this.start = 0;
    this.current = 0;
    this.end = source.length;
    this.line = 1;
    return this;
  }
  private get atEnd() {
    return this.start >= this.end;
  }
  private errorToken(message: string) {
    return new Token(TOKEN.ERROR, message, this.line);
  }
  private token(type: TOKEN, lex?: string) {
    const lexeme = lex ?? this.source.substring(this.start, this.current);
    const line = this.line;
    const out = new Token(type, lexeme, line);
    return out;
  }
  private get peek(): LEXEME {
    return this.source[this.current] as LEXEME;
  }
  private peekNext(by: number = 1): string {
    if (this.atEnd) return "";
    return this.source[this.current + by] as LEXEME;
  }
  private advance() {
    this.current++;
    return this.source[this.current - 1] as LEXEME;
  }

  private skipWhitespace() {
    while (true) {
      const c = this.peek;
      switch (c) {
        case " ":
        case "\r":
        case "\t":
          this.advance();
          break;
        case "\n":
          this.line += 1;
          this.advance();
          break;
        default:
          return;
      }
    }
  }
  getToken() {
    this.skipWhitespace();
    this.start = this.current;
    if (this.atEnd) return this.token(TOKEN.EOF);
    const c = this.advance();
    if (this.isAlpha(c)) return this.identifier();
    if (this.isDigit(c)) {
      this.numtype = TOKEN.INTEGER;
      return this.number();
    }
    switch (c) {
      case `,`:
        return this.token(TOKEN.COMMA);
      case `(`:
        return this.token(TOKEN.LEFT_PAREN);
      case `)`:
        return this.token(TOKEN.RIGHT_PAREN);
      case `[`:
        return this.token(TOKEN.LEFT_BRACKET);
      case `]`:
        return this.token(TOKEN.RIGHT_BRACKET);
      case `{`:
        return this.token(TOKEN.LEFT_BRACE);
      case `}`:
        return this.token(TOKEN.RIGHT_BRACE);
      case `'`:
        return this.token(TOKEN.SINGLE_QUOTE);
      case `;`:
        return this.token(TOKEN.SEMICOLON);
      case `+`:
        return this.token(TOKEN.PLUS);
      case "-":
        if (this.isDigit(this.peek)) {
          this.advance();
          this.numtype = TOKEN.INTEGER;
          return this.number();
        }
        return this.token(TOKEN.MINUS);
      case "?":
        return this.token(TOKEN.EROTEME);
      case ":":
        return this.token(this.match("=") ? TOKEN.ASSIGN : TOKEN.COLON);
      case "&":
        return this.token(TOKEN.AMP);
      case "*":
        return this.token(TOKEN.STAR);
      case "/":
        return this.token(TOKEN.SLASH);
      case "%":
        return this.token(TOKEN.PERCENT);
      case "~":
        return this.token(TOKEN.TILDE);
      case "|":
        return this.token(TOKEN.VBAR);
      case ".":
        return this.token(TOKEN.DOT);
      case "^":
        return this.token(this.match("|") ? TOKEN.CARET_VBAR : TOKEN.CARET);
      case "!":
        return this.token(this.match("=") ? TOKEN.NEQ : TOKEN.BANG);
      case "=":
        return this.token(this.match("=") ? TOKEN.DEQUAL : TOKEN.EQUAL);
      case "<":
        return this.token(
          this.match("=")
            ? TOKEN.LTE
            : this.match("<")
            ? TOKEN.LSHIFT
            : TOKEN.LT,
        );
      case ">":
        return this.token(
          this.match("=")
            ? TOKEN.GTE
            : this.match(">")
            ? this.match(">") ? TOKEN.LOG_SHIFT : TOKEN.GTE
            : TOKEN.GT,
        );
      case `"`:
        return this.string;
    }

    return this.errorToken(`unrecognized token: ‘${c}’`);
  }
  private get seesScientific() {
    return (this.peek === "e" || this.peek === "E") &&
      (this.peekNext() === "-" || this.peekNext() === "+" ||
        this.isDigit(this.peekNext()));
  }
  private get stillSeesNumber() {
    return (this.isDigit(this.peekNext())) &&
      (this.peek === "." || this.peek === "/");
  }
  private number() {
    while (this.isDigit(this.peek)) this.advance();
    if (this.prev === "0") {
      if (this.match("b")) return this.binary;
      if (this.match("o")) return this.octal;
      if (this.match("x")) return this.hex;
    }
    if (this.stillSeesNumber) {
      if (this.peek === ".") this.numtype = TOKEN.FLOAT;
      if (this.peek === "/") this.numtype = TOKEN.FRACTION;
      this.advance();
      while (this.isDigit(this.peek)) this.advance();
    }
    if (this.seesScientific) {
      this.advance();
      this.scientific;
    }
    if (
      this.peek === ("i") &&
      (!this.isAlpha(this.peekNext()))
    ) {
      this.advance();
      this.numtype = TOKEN.COMPLEX_NUMBER;
    }
    return this.token(this.numtype);
  }
  private get scientific() {
    this.advance();
    this.number();
    this.numtype = TOKEN.SCIENTIFIC_NUMBER;
    return this.token(this.numtype);
  }
  private get binary() {
    while (this.peek === "0" || this.peek === "1") {
      this.advance();
    }
    this.numtype = TOKEN.BINARY_NUMBER;
    return this.token(this.numtype);
  }
  private get octal() {
    while ("0" <= this.peek && this.peek <= "7") {
      this.advance();
    }
    this.numtype = TOKEN.OCTAL_NUMBER;
    return this.token(this.numtype);
  }
  private get prev() {
    return this.source[this.current - 1];
  }
  private get hex() {
    while (
      (this.peek >= "0" && this.peek <= "9") ||
      (this.peek >= "a" && this.peek <= "f") ||
      (this.peek >= "A" && this.peek <= "F")
    ) {
      this.advance();
    }
    this.numtype = TOKEN.HEX_NUMBER;
    return this.token(this.numtype);
  }
  private isDigit(c: string) {
    return c >= "0" && c <= "9";
  }
  private isAlpha(c: string) {
    return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || (c === "_");
  }
  private identifier() {
    while (this.isAlpha(this.peek) || this.isDigit(this.peek)) this.advance();
    return this.token(this.identifierType());
  }
  private identifierType(): TOKEN {
    const remaining = this.source.substring(this.start, this.current);
    if (keywords.hasOwnProperty(remaining)) {
      return keywords[remaining as Keyword];
    }
    return TOKEN.SYMBOL;
  }
  private get string() {
    while (this.peek !== `"` && !this.atEnd) {
      if (this.peek === `\n`) this.line += 1;
      this.advance();
    }
    if (this.atEnd) return this.errorToken(`Unterminated string.`);
    this.advance();
    return this.token(TOKEN.STRING);
  }
  private match(expected: LEXEME) {
    if (this.atEnd) return false;
    if (this.source[this.current] !== expected) return false;
    this.current += 1;
    return true;
  }
}

/* -------------------------------------------------------------------------- */
/*                                   PARSER                                   */
/* -------------------------------------------------------------------------- */

import {
  ast,
  ASTNode,
  EXPR,
  Interpreter,
  print,
  Root,
  ToString,
  Vector,
} from "./node.js";

class TokenStream {
  tokens: Token[];
  length: number;
  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.length = tokens.length;
  }
  toString() {
    function buildTokenString(token: Token) {
      const lex = ` ${token.lexeme}`.padEnd(12);
      const line = ` ${token.line}`.padEnd(8);
      const type = ` ${TOKEN[token.type]}`.padEnd(25);
      return `|${lex}|${line}|${type}|`;
    }
    const lex = ` Token`.padEnd(12);
    const line = ` Line`.padEnd(8);
    const type = ` Type`.padEnd(25);
    const _lex = `------------`;
    const _line = `--------`;
    const _type = `-------------------------`;
    const header = `|${lex}|${line}|${type}|\n`;
    const _header = `|${_lex}|${_line}|${_type}|\n`;
    let str = header + _header;
    for (let i = 0; i < this.length; i++) {
      str += buildTokenString(this.tokens[i]) + `\n`;
    }
    return str;
  }
}

interface Rule {
  left: "term" | "factor" | "quotient" | "unaryPrefix" | "imul";
  ops: TOKEN[];
  right: "term" | "factor" | "quotient" | "unaryPrefix" | "imul";
  astnode: (left: ASTNode, operator: string, right: ASTNode) => ASTNode;
}

export interface Parser {
  /** The input to parse. */
  source: string;
  /**
   * An error message indicating an
   * error during the parse. If
   * no error occurred, the field
   * is the empty string.
   */
  error: string | null;
  /**
   * The result of the parsing
   * is an array of ASTs.
   * If only one statement (an expression
   * terminated by a semicolon) is entered,
   * the result will have a length of 1.
   */
  result: Root;
  /**
   * Generates an array of tokens from
   * the input source. This method isn't
   * used by the parser, but is useful
   * for debugging expressions. The
   * result property always has at least
   * one ASTNode. By default, it contains
   * the empty astnode, an object with the shape:
   * ~~~
   * {value: 'null', kind: 'null' }
   * ~~~
   * Note that the value is a string `'null'`,
   * not the literal `null`. If an error
   * occurred during parsing, then the result
   * field contains a single error astnode:
   * ~~~
   * {value: [error-message], kind: 'error' }
   * ~~~
   * where [error-message] is a string.
   */
  tokenize(source: string): TokenStream;
  /**
   * Parses the input source, returning
   * an ASTNode. The parse result
   * is accessible via the result property.
   * If an error occurred during the parse,
   * the result property will contain an
   * error astnode.
   */
  parse(source: string): this;
}

type PrecRule = { prec: number; arity: number; assoc: "left" | "right" };
type RuleSet = Record<string, PrecRule>;
import { math } from "./node.js";
type LIB = {
  constants: { [key: string]: number };
  functions: { [key: string]: Function };
};
export const GLOBAL: LIB = {
  constants: {
    e: Math.E,
    PI: Math.PI,
    LN2: Math.LN2,
    LN10: Math.LN10,
    LOG2E: Math.LOG2E,
    LOG10E: Math.LOG10E,
    SQRT1_2: Math.SQRT1_2,
    SQRT2: Math.SQRT2,
  },
  functions: {
    abs: Math.abs,
    acos: Math.acos,
    acosh: Math.acosh,
    asin: Math.asin,
    asinh: Math.asinh,
    atan: Math.atan,
    atanh: Math.atanh,
    atan2: Math.atan2,
    cbrt: Math.cbrt,
    ceil: Math.ceil,
    clz32: Math.clz32,
    cos: Math.cos,
    cosh: Math.cosh,
    exp: Math.exp,
    expm1: Math.expm1,
    floor: Math.floor,
    fround: Math.fround,
    hypot: Math.hypot,
    imul: Math.imul,
    log: Math.log,
    ln: Math.log,
    log1p: Math.log1p,
    log10: Math.log10,
    log2: Math.log2,
    lg: Math.log2,
    max: Math.max,
    min: Math.min,
    pow: Math.pow,
    random: Math.random,
    round: Math.round,
    sign: Math.sign,
    sin: Math.sin,
    sinh: Math.sinh,
    sqrt: Math.sqrt,
    tan: Math.tan,
    tanh: Math.tanh,
    trunc: Math.trunc,
  },
};

/* -------------------------------------------------------------------------- */
/*                                 ENVIRONMENT                                */
/* -------------------------------------------------------------------------- */

export class Environment {
  variables: Map<string, ASTNode>;
  constants: Map<string, ASTNode>;
  functions: Map<string, { params: ASTNode[]; body: ASTNode }>;
  parent?: Environment;
  lib: LIB;
  constructor(lib: LIB, parent?: Environment) {
    this.variables = new Map();
    this.constants = new Map();
    this.functions = new Map();
    this.lib = lib;
    this.parent = parent;
  }
  declareFunction(name: string, params: ASTNode[], body: ASTNode) {
    this.functions.set(name, { params, body });
  }
  declareVariable(name: string, value: ASTNode): ASTNode | null {
    if (this.variables.has(name)) {
      return null;
    }
    this.variables.set(name, value);
    return value;
  }
  resolve(name: string): Environment | null {
    if (this.variables.has(name)) {
      return this;
    }
    if (this.parent === undefined) {
      return null;
    }
    return this.parent.resolve(name);
  }
  lookup(name: string) {
    const env = this.resolve(name);
    if (env === null) return null;
    return env?.variables.get(name);
  }
}

export class Parser {
  private previous: Token;
  private scanner: Lexer;
  private peek: Token;
  private rules: RuleSet;
  private queue: Queue<Token>;
  private opStack: Token[];
  private environment: Environment;
  private idx: number;
  constructor(rules?: RuleSet) {
    this.idx = 0;
    this.environment = new Environment(GLOBAL);
    this.source = "";
    this.error = null;
    this.queue = new Queue();
    this.opStack = [];
    this.scanner = new Lexer();
    this.previous = new Token(TOKEN.NIL, "", 0);
    this.peek = new Token(TOKEN.NIL, "", 0);
    this.rules = rules || {
      ["+"]: { prec: 0, arity: 2, assoc: "left" },
      ["-"]: { prec: 0, arity: 2, assoc: "left" },
      ["*"]: { prec: 1, arity: 2, assoc: "left" },
      ["/"]: { prec: 1, arity: 2, assoc: "left" },
      ["^"]: { prec: 2, arity: 2, assoc: "right" },
      ["!"]: { prec: 3, arity: 2, assoc: "right" },
    };
  }
  private isFunction(s: string) {
    return this.isCoreFunction(s) ||
      this.environment.functions.has(s);
  }
  private isUserFunction(s: string) {
    return this.environment.functions.has(s);
  }
  private isCoreFunction(s: string) {
    return this.environment.lib.functions.hasOwnProperty(s);
  }

  get string() {
    return print(this.result);
  }

  /* ------------------------------ SHUNTING YARD ----------------------------- */

  private isOp(token: Token) {
    return this.rules.hasOwnProperty(token.lexeme);
  }
  private get stackHasOperator() {
    if (this.opStack.length === 0) return false;
    return this.ruleIsDefined(this.opStack[this.opStack.length - 1]);
  }
  private ruleIsDefined(token: Token) {
    return this.rules.hasOwnProperty(token.lexeme);
  }
  private precedenceOf(token: Token) {
    if (!this.ruleIsDefined(token)) return -Infinity;
    const r = this.rules[token.lexeme];
    return r.prec;
  }
  private get topOfStack() {
    return this.opStack[this.opStack.length - 1];
  }

  private associates(token: Token, dir: "left" | "right") {
    if (this.ruleIsDefined(token)) {
      return this.rules[token.lexeme].assoc === dir;
    }
    return false;
  }
  private get bindsLeft() {
    return (this.associates(this.peek, "left") &&
      this.precedenceOf(this.peek) <= this.precedenceOf(this.topOfStack));
  }
  private get bindsRight() {
    return (this.associates(this.peek, "right") &&
      this.precedenceOf(this.peek) < this.precedenceOf(this.topOfStack));
  }
  shunt(src: string) {
    this.init(src);
    while (this.hasTokens) {
      if (this.isOp(this.peek)) {
        while (this.stackHasOperator && (this.bindsLeft) || (this.bindsRight)) {
          const op = this.opStack.pop();
          this.queue.enqueue(op);
        }
        this.opStack.push(this.peek);
      } else if (this.peek.type === TOKEN.LEFT_PAREN) {
        this.opStack.push(this.peek);
      } else if (this.peek.type === TOKEN.RIGHT_PAREN) {
        while (this.opStack.length) {
          const out = this.opStack.pop();
          if (out?.type !== TOKEN.LEFT_PAREN) this.queue.enqueue(out);
          if (this.topOfStack.type === TOKEN.LEFT_PAREN) {
            this.opStack.pop();
            break;
          }
        }
      } else this.queue.enqueue(this.peek);
      this.advance();
    }
    while (this.opStack.length !== 0) {
      const out = this.opStack.pop();
      if (out !== undefined) this.queue.enqueue(out);
    }
    return this.queue.array;
  }

  /* -------------------------------- TOKENIZE -------------------------------- */
  tokenize(src: string) {
    let out: Token[] = [];
    this.scanner.init(src);
    while (true) {
      const token = this.scanner.getToken();
      out.push(token);
      if (token.type === TOKEN.EOF) break;
    }
    return new TokenStream(out);
  }
  private init(source: string) {
    this.source = source;
    this.scanner.init(source);
    this.peek = this.scanner.getToken();
    this.previous = this.peek;
  }

  /* -------------------------- BEGIN PRIMARY PARSER -------------------------- */

  parse(source: string) {
    this.init(source);
    const result = this.stmntList();
    if (this.error !== null) {
      this.result = ast.root(this.error);
    }
    this.result = ast.root(result);
    return this;
  }

  /* -------------------------- Parse: Statement List ------------------------- */

  private stmntList() {
    const statements: ASTNode[] = [this.stmnt()];
    while (this.peek.type !== TOKEN.EOF) {
      statements.push(this.stmnt());
    }
    return statements;
  }

  /* ---------------------------- Parse: Statement ---------------------------- */

  private stmnt() {
    // return this.exprStmt();
    return this.variableDeclaration();
  }

  /* ----------------------- Parse: Variable Declaration ---------------------- */
  private variableDeclaration() {
    if (this.match([TOKEN.LET])) {
      const name = this.eat(
        TOKEN.SYMBOL,
        this.expected("variable-name"),
      );
      const sym = ast.symbol(name);
      let init: ASTNode = ast.nil;
      if (this.match([TOKEN.LEFT_PAREN])) {
        return this.functionDeclaration(name);
      }
      if (this.match([TOKEN.ASSIGN])) init = this.expression();
      this.eat(TOKEN.SEMICOLON, this.expected(";"));
      this.environment.declareVariable(name, init);
      return ast.def(name, [], init);
    }
    return this.exprStmt();
  }
  private functionDeclaration(name: string) {
    let params: ASTNode[] = [];
    if (!this.check(TOKEN.RIGHT_PAREN)) {
      do {
        params.push(this.expression());
      } while (this.match([TOKEN.COMMA]));
      this.eat(TOKEN.RIGHT_PAREN, this.expected(")"));
    } else this.eat(TOKEN.RIGHT_PAREN, this.expected(")"));
    this.eat(TOKEN.ASSIGN, this.expected(":="));
    const body = this.expression();
    this.environment.declareFunction(name, params, body);
    return ast.def(name, params, body);
  }

  private isDefined(n: string) {
    return this.environment.variables.has(n) ||
      this.environment.functions.has(n);
  }
  private unaryExpression(op: string, args: ASTNode[]) {
    return !this.isDefined(op) ? ast.algebra1(op, args) : ast.unex(op, args);
  }

  private binaryExpression(left: ASTNode, op: string, right: ASTNode) {
    let type = EXPR.ARITHMETIC;
    if (
      left.isSymbol() && !this.isDefined(left.value) ||
      (right.isSymbol() && !this.isDefined(right.value)) ||
      (left.isBinaryExpr()) && left.type === EXPR.ALGEBRAIC ||
      (right.isBinaryExpr()) && right.type === EXPR.ALGEBRAIC ||
      (left.isUnaryExpr()) && left.type === EXPR.ALGEBRAIC ||
      (right.isUnaryExpr()) && right.type === EXPR.ALGEBRAIC
    ) {
      type = EXPR.ALGEBRAIC;
    }
    return ast.binex(left, op, right, type);
  }

  /* ----------------------- Parse: Expression Statement ---------------------- */
  private exprStmt() {
    const expr = this.expression();
    if (this.source[this.idx] === undefined) {
      this.advance();
    } else this.eat(TOKEN.SEMICOLON, this.expected(";"));
    return expr;
  }

  /* ---------------------------- Parse: Expression --------------------------- */
  private expression() {
    return this.relation();
  }

  /* ----------------------------- Parse: Relation ---------------------------- */
  private relation() {
    return this.parseExpression({
      left: "term",
      ops: [TOKEN.NEQ, TOKEN.EQUAL, TOKEN.LTE, TOKEN.GTE, TOKEN.LT, TOKEN.GT],
      right: "term",
      astnode: (left, op, right) => this.binaryExpression(left, op, right),
    });
  }

  /* ------------------------------- Parse: Term ------------------------------ */
  private term() {
    return this.parseExpression({
      left: "factor",
      ops: [TOKEN.MINUS, TOKEN.PLUS],
      right: "factor",
      astnode: (left, op, right) => this.binaryExpression(left, op, right),
    });
  }

  /* ------------------------------ Parse: Factor ----------------------------- */
  private factor() {
    return this.parseExpression({
      left: "imul",
      ops: [TOKEN.STAR, TOKEN.SLASH],
      right: "imul",
      astnode: (left, op, right) => this.binaryExpression(left, op, right),
    });
  }

  /* --------------------- Parse: Implicit Multiplication --------------------- */

  private imul() {
    let node = this.quotient();
    let prev = node;
    while (
      this.sees(
        TOKEN.SYMBOL,
        TOKEN.LEFT_PAREN,
        TOKEN.INTEGER,
        TOKEN.FRACTION,
        TOKEN.FLOAT,
        TOKEN.COMPLEX_NUMBER,
        TOKEN.OCTAL_NUMBER,
        TOKEN.HEX_NUMBER,
        TOKEN.BINARY_NUMBER,
        TOKEN.SCIENTIFIC_NUMBER,
      )
    ) {
      prev = this.quotient();
      node = this.binaryExpression(node, "*", prev);
    }
    return node;
  }

  /* ----------------------------- Parse: Quotient ---------------------------- */

  private quotient() {
    return this.parseExpression({
      left: "unaryPrefix",
      ops: [TOKEN.PERCENT, TOKEN.MOD, TOKEN.REM, TOKEN.DIV],
      right: "unaryPrefix",
      astnode: (left, op, right) => this.binaryExpression(left, op, right),
    });
  }

  /* --------------------------- Parse: Unary Prefix -------------------------- */

  private unaryPrefix() {
    if (this.match([TOKEN.NOT, TOKEN.TILDE])) {
      const op = this.previous.lexeme;
      const arg = this.power();
      return this.unaryExpression(op, [arg]);
    }
    return this.power();
  }

  /* ------------------------------ Parse: Power ------------------------------ */

  private power(): ASTNode {
    let node: ASTNode = this.primary();
    while (this.match([TOKEN.CARET])) {
      const op = this.previous.lexeme;
      const arg: ASTNode = this.unaryPrefix();
      node = this.binaryExpression(node, op, arg);
    }
    return node;
  }

  /* ----------------------------- Parse: Primary ----------------------------- */

  private primary() {
    switch (this.peek.type) {
      case TOKEN.LEFT_PAREN:
        return this.parend();
      case TOKEN.SYMBOL:
        return this.id();
      case TOKEN.LEFT_BRACKET:
        return this.array();
      case TOKEN.LEFT_BRACE:
        return this.braced();
      default:
        return this.literal();
    }
  }

  /* ----------------------------- Parse: Variable ---------------------------- */

  private id(): ASTNode {
    const name = this.eat(TOKEN.SYMBOL, this.expected("id"));
    let node = ast.symbol(name);
    if (this.check(TOKEN.LEFT_PAREN) && this.isFunction(name)) {
      return this.callexpr(name);
    }
    return node;
  }

  /* -------------------------- Parse: Function Call -------------------------- */

  private callexpr(name: string): ASTNode {
    this.eat(TOKEN.LEFT_PAREN, this.expected("("));
    let params: ASTNode[] = [];
    if (!this.check(TOKEN.RIGHT_PAREN)) {
      do {
        params.push(this.expression());
      } while (this.match([TOKEN.COMMA]));
      this.eat(TOKEN.RIGHT_PAREN, this.expected(")"));
    } else this.eat(TOKEN.RIGHT_PAREN, this.expected(")"));
    return this.unaryExpression(name, params);
  }

  private expected(s: string) {
    return `Expected ${s}`;
  }

  /* ------------------------ Parse: Braced Expression ------------------------ */
  private braced(): ASTNode {
    this.eat(TOKEN.LEFT_BRACE, this.expected("{"));
    let expr = this.expression();
    if (this.match([TOKEN.COMMA])) {
      let elements = [expr];
      do {
        elements.push(this.expression());
      } while (this.match([TOKEN.COMMA]));
      this.eat(TOKEN.RIGHT_BRACE, this.expected("{"));
      return ast.unex("set", elements, EXPR.ALGEBRAIC);
    } else this.eat(TOKEN.RIGHT_BRACE, this.expected("{"));
    return ast.block([expr]);
  }

  /* --------------------- Parse: Parenthesized Expression -------------------- */
  private parend(): ASTNode {
    this.eat(TOKEN.LEFT_PAREN, this.expected("("));
    let expr = this.expression();
    if (this.match([TOKEN.COMMA])) {
      let elements = [expr];
      do {
        elements.push(this.expression());
      } while (this.match([TOKEN.COMMA]));
      this.eat(TOKEN.RIGHT_PAREN, this.expected("("));
      return ast.unex("list", elements, EXPR.ALGEBRAIC);
    } else this.eat(TOKEN.RIGHT_PAREN, this.expected(")"));
    return expr;
  }

  /* § Parse Array ------------------------------------------------------------ */
  private array() {
    let builder: "matrix" | "vector" = "vector";
    let elements: (ASTNode[]) = [];
    this.eat(TOKEN.LEFT_BRACKET, this.expected("["));
    let element = this.expression();
    let rows = 0;
    let cols = 0;
    if (element instanceof Vector) {
      cols = element.len;
      rows += 1;
      builder = "matrix";
    } 
    elements.push(element);
    while (this.match([TOKEN.COMMA])) {
      let expr = this.expression();
      if (builder === 'matrix' && (!expr.isVector())) {
        throw new Error('Matrices must only have vector elements.')
      }
      if (expr instanceof Vector) {
        builder = "matrix";
        rows += 1;
        if (cols !== expr.len) this.croak("No jagged arrays permitted");
      }
      elements.push(expr);
    }
    this.eat(TOKEN.RIGHT_BRACKET, this.expected("]"));
    return builder === "matrix"
      ? ast.matrix(elements as Vector[], rows, cols)
      : ast.vector(elements);
  }

  private eatNumber(tokenType: TOKEN) {
    return this.eat(tokenType, "Expected number");
  }

  /* § Parse Literal ---------------------------------------------------------- */
  private literal() {
    let lexeme = "";
    switch (this.peek.type) {
      case TOKEN.INTEGER:
        lexeme = this.eatNumber(TOKEN.INTEGER);
        return ast.int(lexeme);
      case TOKEN.FLOAT:
        lexeme = this.eatNumber(TOKEN.FLOAT);
        return ast.float(lexeme);
      case TOKEN.COMPLEX_NUMBER:
        lexeme = this.eatNumber(TOKEN.COMPLEX_NUMBER);
        return ast.complex(lexeme);
      case TOKEN.OCTAL_NUMBER:
        lexeme = this.eatNumber(TOKEN.OCTAL_NUMBER);
        return ast.int(lexeme, 8);
      case TOKEN.HEX_NUMBER:
        lexeme = this.eatNumber(TOKEN.HEX_NUMBER);
        return ast.int(lexeme, 16);
      case TOKEN.BINARY_NUMBER:
        lexeme = this.eatNumber(TOKEN.BINARY_NUMBER);
        return ast.int(lexeme, 2);
      case TOKEN.TRUE:
        lexeme = this.eatNumber(TOKEN.TRUE);
        return ast.bool(true);
      case TOKEN.FALSE:
        lexeme = this.eatNumber(TOKEN.FALSE);
        return ast.bool(false);
      case TOKEN.FRACTION:
        lexeme = this.eatNumber(TOKEN.FRACTION);
        return ast.fraction(lexeme);
      case TOKEN.SCIENTIFIC_NUMBER:
        lexeme = this.eatNumber(TOKEN.SCIENTIFIC_NUMBER);
        return this.expand(lexeme);
      case TOKEN.STRING:
        lexeme = this.eat(TOKEN.STRING, this.expected("string"));
        return ast.string(lexeme);
      case TOKEN.NULL:
        lexeme = this.eat(TOKEN.NULL, this.expected("null"));
        return ast.nil;
      default:
        return ast.nil;
    }
  }

  /* § Utility Methods -------------------------------------------------------- */

  croak(message: string) {
    message = `Line[${this.peek.line}]: ${message}`;
    this.error = message;
  }

  /**
   * Special handling for scientific numbers.
   * To simplify the type system, we convert
   * these numbers into a compound expression `a^b`,
   * where `a` is a `float` or `integer`.
   */
  private expand(lexeme: string) {
    const [a, b] = math.split(lexeme, "e");
    const left = math.is.integer(a) ? ast.int(a) : ast.float(a);
    const right = math.is.integer(b) ? ast.int(b) : ast.float(b);
    return this.binaryExpression(left, "^", right);
  }

  /**
   * Returns true if any of the supplied
   * token types matches. False otherwise.
   * If a match is found, the next token
   * is requested from the lexer.
   */
  private match(tokenTypes: TOKEN[]) {
    for (let i = 0; i < tokenTypes.length; i++) {
      const tokentype = tokenTypes[i];
      if (this.check(tokentype)) {
        this.advance();
        return true;
      }
    }
    return false;
  }
  private sees(...types: TOKEN[]) {
    if (types[0] === TOKEN.EOF) return false;
    for (let i = 0; i < types.length; i++) {
      if (this.peek.type === types[i]) return true;
    }
    return false;
  }
  private check(type: TOKEN) {
    if (type === TOKEN.EOF) return false;
    return this.peek.type === type;
  }
  private advance() {
    this.previous = this.peek;
    this.peek = this.scanner.getToken();
    this.idx = this.scanner.current;
    return this.previous;
  }
  private eat(tokenType: TOKEN, message: string) {
    const token = this.peek;
    if (token.type === TOKEN.EOF) {
      this.croak(`${message} at end.`);
    }
    if (token.type === TOKEN.ERROR || token.type !== tokenType) {
      this.croak(`${message}, got ${token.lexeme}`);
    }
    this.advance();
    return token.lexeme;
  }
  private parseExpression({ left, ops, right, astnode }: Rule): ASTNode {
    let LEFT: ASTNode = this[left]();
    while (this.match(ops)) {
      const OP = this.previous.lexeme;
      const RIGHT = this[right]();
      LEFT = astnode(LEFT, OP, RIGHT);
    }
    return LEFT;
  }
  private get hasTokens() {
    return this.peek.type !== TOKEN.EOF;
  }
  build(op: string, params: string[]) {
    const input = Parser.make(op, params);
    return this.parse(input);
  }
  static make(op: string, params: string[]) {
    let input = "";
    let args = params.map((s) => s.length > 0 ? `(${s})` : s);
    if (/^[a-zA-Z]/.test(op)) {
      input = `${op}(${args.join(", ")})`;
    }
    input = args.join(` ${op} `);
    return input;
  }
  eval() {
    const n = new Interpreter(this.environment);
    const out = this.result.accept(n);
    return n.stringify(out);
  }
  toString(out: ASTNode = this.result) {
    const s = new ToString();
    return out.accept(s);
  }
}

const parser = new Parser();
const tree1 = parser.parse(`
[[1.2,2,3], [3,4,16], [22,8,1/2]]
+
[[9,1/8,3/4], [2,9,5], [3,1,8]]
`);
// log(tree1.toString());
// log(tree1.string);
const result1 = tree1.eval();
log(result1);
// log(tree1.toString())
// log(tree1.string);
