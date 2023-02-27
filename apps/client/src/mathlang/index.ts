import { log, str } from "./dev";
import { Queue } from "./queue";
import { NUM_TOKEN, TOKEN, Token } from "./tokentype";
import { error } from "./error";
import {
  ATOM,
  Err,
  EXPR,
  Expr,
  Lit,
  NIL,
  Nil,
  OPERATOR,
  REF,
  Subtree,
  Sym,
} from "./nodes";
import { AST, Atom, Root, UnaryExpr } from "./nodes";
import { Environment } from "./env";

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
      if (this.match("b")) {
        return this.binary;
      }
      if (this.match("o")) {
        return this.octal;
      }
      if (this.match("x")) {
        return this.hex;
      }
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
  private isSpace(s: string) {
    return /\s/.test(s);
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

interface Rule {
  left: "term" | "factor" | "quotient" | "unaryPrefix" | "imul";
  ops: TOKEN[];
  right: "term" | "factor" | "quotient" | "unaryPrefix" | "imul";
  node: (left: AST, operator: OPERATOR, right: AST) => AST;
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
  error: Err | Nil;
  /**
   * The result of the parsing
   * is an array of ASTs.
   * If only one statement (an expression
   * terminated by a semicolon) is entered,
   * the result will have a length of 1.
   */
  result: AST[];
  /**
   * Generates an array of tokens from
   * the input source. This method isn't
   * used by the parser, but is useful
   * for debugging expressions. The
   * result property always has at least
   * one AST. By default, it contains
   * the empty node, an object with the shape:
   * ~~~
   * {value: 'null', kind: 'null' }
   * ~~~
   * Note that the value is a string `'null'`,
   * not the literal `null`. If an error
   * occurred during parsing, then the result
   * field contains a single error node:
   * ~~~
   * {value: [error-message], kind: 'error' }
   * ~~~
   * where [error-message] is a string.
   */
  tokenize(source: string): Token[];
  /**
   * Parses the input source, returning
   * an AST. The parse result
   * is accessible via the result property.
   * If an error occurred during the parse,
   * the result property will contain an
   * error node.
   */
  parse(source: string): AST;
}

type PrecRule = { prec: number; arity: number; assoc: "left" | "right" };
type RuleSet = Record<string, PrecRule>;

type LIB = {
  constants: { [key: string]: string };
  functions: { [key: string]: string };
};
const GLOBAL: LIB = {
  constants: {
    e: `Math.E`,
    PI: `Math.PI`,
    LN2: `Math.LN2`,
    LN10: `Math.LN10`,
    LOG2E: `Math.LOG2E`,
    LOG10E: `Math.LOG10E`,
    SQRT1_2: `Math.SQRT1_2`,
    SQRT2: `Math.SQRT2`,
  },
  functions: {
    abs: `Math.abs`,
    acos: `Math.acos`,
    acosh: `Math.acosh`,
    asin: `Math.asin`,
    asinh: `Math.asinh`,
    atan: `Math.atan`,
    atanh: `Math.atanh`,
    atan2: `Math.atan2`,
    cbrt: `Math.cbrt`,
    ceil: `Math.ceil`,
    clz32: `Math.clz32`,
    cos: `Math.cos`,
    cosh: `Math.cosh`,
    exp: `Math.exp`,
    expm1: `Math.expm1`,
    floor: `Math.floor`,
    fround: `Math.fround`,
    hypot: `Math.hypot`,
    imul: `Math.imul`,
    log: `Math.log`,
    ln: `Math.log`,
    log1p: `Math.log1p`,
    log10: `Math.log10`,
    log2: `Math.log2`,
    lg: `Math.log2`,
    max: `Math.max`,
    min: `Math.min`,
    pow: `Math.pow`,
    random: `Math.random`,
    round: `Math.round`,
    sign: `Math.sign`,
    sin: `Math.sin`,
    sinh: `Math.sinh`,
    sqrt: `Math.sqrt`,
    tan: `Math.tan`,
    tanh: `Math.tanh`,
    trunc: `Math.trunc`,
  },
};

export class Parser {
  private previous: Token;
  private scanner;
  private peek: Token;
  private rules: RuleSet;
  private queue: Queue<Token>;
  private opStack: Token[];
  private environment: Environment;
  private idx: number;
  private global: LIB;
  constructor(rules?: RuleSet) {
    this.global = GLOBAL;
    this.idx = 0;
    this.environment = new Environment();
    this.source = "";
    this.error = NIL;
    this.queue = new Queue();
    this.opStack = [];
    this.scanner = new Lexer();
    this.previous = new Token(TOKEN.NIL, "", 0);
    this.peek = new Token(TOKEN.NIL, "", 0);
    this.result = [new Atom("null", ATOM.NULL)];
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
    return this.global.functions.hasOwnProperty(s);
  }

  /* -------------------------------------------------------------------------- */
  /*                                SHUNTING YARD                               */
  /* -------------------------------------------------------------------------- */
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

  /* -------------------------------------------------------------------------- */
  /*                                  TOKENIZE                                  */
  /* -------------------------------------------------------------------------- */
  tokenize(src: string) {
    let out = [];
    this.scanner.init(src);
    while (true) {
      const token = this.scanner.getToken();
      out.push(token);
      if (token.type === TOKEN.EOF) break;
    }
    return out;
  }
  private init(source: string) {
    this.source = source;
    this.scanner.init(source);
    this.peek = this.scanner.getToken();
    this.previous = this.peek;
  }

  /* -------------------------------------------------------------------------- */
  /*                               PRIMARY PARSER                               */
  /* -------------------------------------------------------------------------- */
  parse(source: string) {
    this.init(source);
    this.result = this.stmntList();
    if (this.error instanceof Err) this.result = [this.error];
    return new Root(this.result, this.environment);
  }

  /* -------------------------- Parse: Statement List ------------------------- */
  private stmntList() {
    const statements: AST[] = [this.stmnt()];
    while (this.peek.type !== TOKEN.EOF) {
      statements.push(this.stmnt());
    }
    return statements;
  }

  /* ---------------------------- Parse: Statement ---------------------------- */
  private stmnt() {
    return this.variableDeclaration();
  }

  /* ----------------------- Parse: Variable Declaration ---------------------- */
  private variableDeclaration() {
    if (this.match([TOKEN.LET])) {
      const name = this.eat(
        TOKEN.SYMBOL,
        "Expected variable name.",
        "variable-declaration",
      );
      const sym = Lit.symbol(name);
      let init = NIL;
      if (this.match([TOKEN.LEFT_PAREN])) {
        return this.functionDeclaration(sym);
      }
      if (this.match([TOKEN.ASSIGN])) init = this.expression();
      this.eat(
        TOKEN.SEMICOLON,
        error.expected.semicolon,
        "variable-declaration",
      );
      this.environment.declareVariable(name, init);
      return Expr.variableDefinition(sym, init);
    }
    return this.exprStmt();
  }

  private functionDeclaration(node: Sym) {
    let params: AST[] = [];
    if (!this.check(TOKEN.RIGHT_PAREN)) {
      do {
        params.push(this.expression());
      } while (this.match([TOKEN.COMMA]));
      this.eat(
        TOKEN.RIGHT_PAREN,
        "expected ‘)’ to close the parameter list",
        "function-declaration",
      );
    } else {this.eat(
        TOKEN.RIGHT_PAREN,
        "expected ‘)’ to close the parameter list",
        "function-declaration",
      );}
    this.eat(
      TOKEN.ASSIGN,
      "Expected assignment operator ‘:=’",
      "function-declaration",
    );
    const body = this.expression();
    this.environment.declareFunction(node.value, params, body);
    return Expr.functionDefinition(node, params, body);
  }

  /* ----------------------- Parse: Expression Statement ---------------------- */
  private exprStmt() {
    const expr = this.expression();
    if (this.source[this.idx] === undefined) {
      this.advance();
    } else {this.eat(
        TOKEN.SEMICOLON,
        error.expected.semicolon,
        "expression-statement",
      );}
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
      node: (left, op, right) => Expr.binaryRelation(left, op, right),
    });
  }

  /* ------------------------------- Parse: Term ------------------------------ */
  private term() {
    return this.parseExpression({
      left: "factor",
      ops: [TOKEN.MINUS, TOKEN.PLUS],
      right: "factor",
      node: (left, op, right) =>
        this.isAlgebraic(left, right)
          ? Expr.algebraBinary(left, op, right)
          : Expr.arithmeticBinary(left, op, right),
    });
  }

  /* ------------------------------ Parse: Factor ----------------------------- */
  private factor() {
    return this.parseExpression({
      left: "imul",
      ops: [TOKEN.STAR, TOKEN.SLASH],
      right: "imul",
      node: (left, op, right) =>
        this.isAlgebraic(left, right)
          ? Expr.algebraBinary(left, op, right)
          : Expr.arithmeticBinary(left, op, right),
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
      node = this.isAlgebraic(node, prev)
        ? Expr.algebraBinary(node, "*", prev)
        : Expr.arithmeticBinary(node, "*", prev);
    }
    return node;
  }

  /* ----------------------------- Parse: Quotient ---------------------------- */
  private quotient() {
    return this.parseExpression({
      left: "unaryPrefix",
      ops: [TOKEN.PERCENT, TOKEN.MOD, TOKEN.REM, TOKEN.DIV],
      right: "unaryPrefix",
      node: (left, op, right) =>
        this.isAlgebraic(left, right)
          ? Expr.algebraBinary(left, op, right)
          : Expr.arithmeticBinary(left, op, right),
    });
  }

  /* --------------------------- Parse: Unary Prefix -------------------------- */
  private unaryPrefix() {
    if (this.match([TOKEN.NOT, TOKEN.TILDE])) {
      const op = this.previous.lexeme as OPERATOR;
      const arg = this.power();
      const type: EXPR = op === "~" ? EXPR.BITWISE : EXPR.LOGIC;
      const kind: EXPR = this.isAlgebraic(arg) ? EXPR.ALGEBRAIC : type;
      return new UnaryExpr(op, Expr.tuple([arg]), kind, "core");
    }
    return this.power();
  }

  /* ------------------------------ Parse: Power ------------------------------ */
  private power(): AST {
    let node: AST = this.primary();
    while (this.match([TOKEN.CARET])) {
      const op = this.previous.lexeme as OPERATOR;
      const right: AST = this.unaryPrefix();
      node = this.isAlgebraic(node, right)
        ? Expr.algebraBinary(node, op, right)
        : Expr.arithmeticBinary(node, op, right);
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
  private id(): AST {
    const name = this.eat(TOKEN.SYMBOL, error.expected.id, "variable");
    let node: Sym = new Sym(name);
    if (this.check(TOKEN.LEFT_PAREN) && this.isFunction(name)) {
      return this.callexpr(node);
    }
    // if (this.match([TOKEN.ASSIGN])) {
    // const body: AST = this.expression();
    // node = new Definition(node, [], body, "variable-definition");
    // }
    // if (this.match([TOKEN.LEFT_PAREN])) {
    // node = this.callexpr(node);
    // return node;
    // }
    return node;
  }

  /* -------------------------- Parse: Function Call -------------------------- */
  private callexpr(node: Sym): AST {
    this.eat(TOKEN.LEFT_PAREN, "Expected ‘(’", "call-expression");
    let params: AST[] = [];
    if (!this.check(TOKEN.RIGHT_PAREN)) {
      do {
        params.push(this.expression());
      } while (this.match([TOKEN.COMMA]));
      this.eat(TOKEN.RIGHT_PAREN, "Expected ‘)’", "call-expression");
    } else this.eat(TOKEN.RIGHT_PAREN, "Expected ‘)’", "call-expression");
    let cat: REF = this.isCoreFunction(node.value) ? "core" : "user";
    return Expr.functionCall(node.value, params, cat);
  }

  /* ------------------------ Parse: Braced Expression ------------------------ */
  private braced(): AST {
    this.eat(TOKEN.LEFT_BRACE, error.expected.leftBrace, "braced-expression");
    let expr = this.expression();
    if (this.match([TOKEN.COMMA])) {
      let elements = [expr];
      do {
        elements.push(this.expression());
      } while (this.match([TOKEN.COMMA]));
      this.eat(
        TOKEN.RIGHT_BRACE,
        error.expected.rightBrace,
        "braced-expression",
      );
      return Expr.functionCall("set", elements, "set");
    } else {this.eat(
        TOKEN.RIGHT_BRACE,
        error.expected.rightBrace,
        "braced-expression",
      );}
    return new Subtree([expr]);
  }

  /* --------------------- Parse: Parenthesized Expression -------------------- */
  private parend(): AST {
    this.eat(
      TOKEN.LEFT_PAREN,
      error.expected.leftParen,
      "parenthesized-expression",
    );
    let expr = this.expression();
    if (this.match([TOKEN.COMMA])) {
      let elements = [expr];
      do {
        elements.push(this.expression());
      } while (this.match([TOKEN.COMMA]));
      this.eat(TOKEN.RIGHT_PAREN, "Expected ‘)’", "parenthesized-expression");
      return Expr.functionCall("list", elements, "list");
    } else {this.eat(
        TOKEN.RIGHT_PAREN,
        "Expected ‘)’",
        "parenthesized-expression",
      );}
    return expr;
  }

  /* ------------------------------ Parse: Array ------------------------------ */
  private array() {
    let elements: AST[] = [];
    let cat: REF = "array";
    this.eat(TOKEN.LEFT_BRACKET, "Expected ‘[’", "bracketed-expression");
    let elem = this.expression();
    let rows = 0;
    let cols = 0;
    if (elem instanceof UnaryExpr) {
      cols = elem.arglen;
      rows += 1;
    }
    elements.push(elem);
    while (this.match([TOKEN.COMMA])) {
      let expr = this.expression();
      if (expr instanceof UnaryExpr) {
        cat = "matrix";
        rows += 1;
        if (cols !== expr.arglen) {
          this.croak("No jagged arrays permitted", "array");
        }
      }
      elements.push(expr);
    }
    this.eat(TOKEN.RIGHT_BRACKET, "Expected ‘]’", "bracketed-expression");
    return Expr.functionCall("list", elements, cat);
  }

  /* ----------------------------- Parse: Lit ----------------------------- */
  private literal() {
    let lexeme = "";
    switch (this.peek.type) {
      case TOKEN.INTEGER:
        lexeme = this.eat(TOKEN.INTEGER, error.expected.number, "integer");
        return Lit.integer(lexeme);

      case TOKEN.FLOAT:
        lexeme = this.eat(TOKEN.FLOAT, error.expected.number, "float");
        return Lit.float(lexeme);

      case TOKEN.COMPLEX_NUMBER:
        lexeme = this.eat(
          TOKEN.COMPLEX_NUMBER,
          error.expected.number,
          "complex-number",
        );
        return Lit.complex(lexeme);

      case TOKEN.OCTAL_NUMBER:
        lexeme = this.eat(
          TOKEN.OCTAL_NUMBER,
          error.expected.number,
          "octal-number",
        );
        return Lit.integer(Number.parseInt(lexeme, 8));

      case TOKEN.HEX_NUMBER:
        lexeme = this.eat(
          TOKEN.HEX_NUMBER,
          error.expected.number,
          "hex-number",
        );
        return Lit.integer(Number.parseInt(lexeme, 16));

      case TOKEN.BINARY_NUMBER:
        lexeme = this.eat(
          TOKEN.BINARY_NUMBER,
          error.expected.number,
          "binary-number",
        );
        return Lit.integer(Number.parseInt(lexeme, 2));

      case TOKEN.STRING:
        lexeme = this.eat(TOKEN.STRING, error.expected.string, "string");
        return Lit.string(lexeme);

      case TOKEN.TRUE:
        lexeme = this.eat(TOKEN.TRUE, error.expected.true, "true");
        return Lit.integer(1);

      case TOKEN.FALSE:
        lexeme = this.eat(TOKEN.FALSE, error.expected.false, "false");
        return Lit.integer(0);

      case TOKEN.NULL:
        lexeme = this.eat(TOKEN.NULL, error.expected.null, "null");
        return Lit.nil();

      case TOKEN.FRACTION:
        lexeme = this.eat(TOKEN.FRACTION, error.expected.number, "fraction");
        return Lit.fraction(lexeme);

      case TOKEN.SCIENTIFIC_NUMBER:
        lexeme = this.eat(
          TOKEN.SCIENTIFIC_NUMBER,
          error.expected.number,
          "scientific-number",
        );
        return this.expand(lexeme, "^");

      default:
        return this.croak(`Invalid syntax.`, "literal");
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                               UTILITY METHODS                              */
  /* -------------------------------------------------------------------------- */

  croak(message: string, source: string) {
    message =
      `Line[${this.peek.line}]: ${message} | During: ${source} parsing.`;
    this.error = new Err(message);
    return this.error;
  }

  /**
   * Special handling for scientific numbers.
   * To simplify the type system, we convert
   * these numbers into a compound expression `a^b`,
   * where `a` is a `float` or `integer`.
   */
  private expand(lexeme: string, op: "/" | "^") {
    const splitter = op === "/" ? /\// : /[eE]/;
    const parts = lexeme.split(splitter);
    if (parts.length !== 2) {
      const numtype = op === "/" ? "fraction" : "scientific-number";
      const message = `[literal]: Invalid ${numtype} encountered.`;
      return this.croak(message, "expand scientific-number");
    }
    const LEFT = parts[0];
    const RIGHT = parts[1];
    const float = /^[-+]?(0|[1-9]\d*)(\.\d+)/;
    const typeLEFT: ATOM = float.test(LEFT) ? ATOM.FLOAT : ATOM.INT;
    const typeRIGHT: ATOM = float.test(RIGHT) ? ATOM.FLOAT : ATOM.INT;
    const left = new Atom(LEFT, typeLEFT);
    const right = new Atom(RIGHT, typeRIGHT);
    return Expr.arithmeticBinary(left, op, right);
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
  private eat(tokenType: TOKEN, message: string, source: string) {
    const token = this.peek;
    if (token.type === TOKEN.EOF) {
      this.croak(`${message} at end.`, source);
    }
    if (token.type === TOKEN.ERROR || token.type !== tokenType) {
      this.croak(`${message}, got ${token.lexeme}`, source);
    }
    this.advance();
    return token.lexeme;
  }
  private parseExpression({ left, ops, right, node }: Rule): AST {
    let LEFT: AST = this[left]();
    while (this.match(ops)) {
      const OP = this.previous.lexeme as OPERATOR;
      const RIGHT = this[right]();
      LEFT = node(LEFT, OP, RIGHT);
    }
    return LEFT;
  }
  private isAlgebraic(...nodes: AST[]) {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].isSymbol() || nodes[i].isAlgebraic()) {
        return true;
      }
    }
    return false;
  }
  private get hasTokens() {
    return this.peek.type !== TOKEN.EOF;
  }
  build(op:string, params:string[]) {
    const input = Parser.make(op, params);
    return this.parse(input);
  }
  static make(op:string, params:string[]) {
    let input = '';
    let args = params.map(s=> s.length > 0 ? `(${s})` : s);
    if (/^[a-zA-Z]/.test(op)) {
      input = `${op}(${args.join(', ')})`;
    }
    input = args.join(` ${op} `);
    return input;
  }
  eval(src:string) {
    const parsing = this.parse(src);
    return parsing.eval();
  }
}



// const parser = new Parser();
// const tree = parser.parse(`[1,2,3]`);
// const tree = parser.eval('[[1,2,3]]');
// const tree = parser.parse(expr).eval();
// log(tree);
// log(str(tree))