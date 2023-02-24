import { log, str } from "./dev";
import { Queue } from "./queue";
import { error, TOKEN, Token } from "./tokentype";

const keywords = {
  [`and`]: TOKEN.AND, [`nand`]: TOKEN.NAND, [`class`]: TOKEN.CLASS,
  [`throw`]: TOKEN.THROW, [`div`]: TOKEN.DIV, [`else`]: TOKEN.ELSE,
  [`for`]: TOKEN.FOR, [`function`]: TOKEN.FUNCTION, [`fn`]: TOKEN.FN,
  [`if`]: TOKEN.IF, [`return`]: TOKEN.RETURN, [`super`]: TOKEN.SUPER,
  [`this`]: TOKEN.THIS, [`that`]: TOKEN.THAT, [`while`]: TOKEN.WHILE,
  [`do`]: TOKEN.DO, [`Inf`]: TOKEN.INF, [`mod`]: TOKEN.MOD,
  [`nor`]: TOKEN.NOR, [`NaN`]: TOKEN.NAN, [`not`]: TOKEN.NOT,
  [`null`]: TOKEN.NULL, [`or`]: TOKEN.OR, [`rem`]: TOKEN.REM,
  [`to`]: TOKEN.TO, [`true`]: TOKEN.TRUE, [`false`]: TOKEN.FALSE,
  [`xor`]: TOKEN.XOR, [`xnor`]: TOKEN.XNOR, [`let`]: TOKEN.LET,
  [`var`]: TOKEN.VAR, [`const`]: TOKEN.CONST,
};
type Keyword = keyof typeof keywords;
type LEXEME = Lexeme | Keyword;

export interface Lexer {
  source: string;
  start: number;
  current: number;
  end: number;
  line: number;
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
  private get peekNext(): string {
    if (this.atEnd) return "";
    return this.source[this.current + 1] as LEXEME;
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
    if (this.isDigit(c)) return this.number;
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
          return this.number;
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
        return this.token(
          this.match("*")
            ? TOKEN.DOT_STAR
            : this.match("/")
            ? TOKEN.DOT_SLASH
            : this.match("%")
            ? TOKEN.DOT_PERCENT
            : this.match("^")
            ? TOKEN.DOT_CARET
            : TOKEN.DOT,
        );
      case "^":
        return this.token(
          this.match("|") ? TOKEN.CARET_VBAR : TOKEN.CARET,
        );
      case "!":
        return this.token(
          this.match("=") ? TOKEN.NEQ : TOKEN.BANG,
        );
      case "=":
        return this.token(
          this.match("=") ? TOKEN.DEQUAL : TOKEN.EQUAL,
        );
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

    return this.errorToken(`Unrecognized token.`);
  }
  private get number() {
    while (this.isDigit(this.peek)) this.advance();
    if (this.prev === "0") {
      if (this.match("b")) return this.binary;
      if (this.match("o")) return this.octal;
      if (this.match("x")) return this.hex;
    }
    if (
      (this.peek === "." || this.peek === "/") &&
      (this.isDigit(this.peekNext))
    ) {
      this.advance();
      while (this.isDigit(this.peek)) this.advance();
    }
    if (
      (this.peek === "e" || this.peek === "E") &&
      (this.peekNext === "-" || this.peekNext === "+" ||
        this.isDigit(this.peekNext))
    ) {
      this.advance();
      this.scientific;
    }
    this.match("i");
    return this.token(TOKEN.NUMBER);
  }
  private get scientific() {
    this.advance();
    return this.number;
  }
  private get binary() {
    while (this.peek === "0" || this.peek === "1") {
      this.advance();
    }
    return this.token(TOKEN.NUMBER);
  }
  private get octal() {
    while ("0" <= this.peek && this.peek <= "7") {
      this.advance();
    }
    return this.token(TOKEN.NUMBER);
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
    return this.token(TOKEN.NUMBER);
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
  left: "relation" | "term" | "factor" | "quotient" | "unaryPrefix" | "imul";
  ops: TOKEN[];
  right: "relation" | "term" | "factor" | "quotient" | "unaryPrefix" | "imul";
  node: (left: ASTNode, operator: string, right: ASTNode) => ASTNode;
}

type Nonatomic =
  | "function-apply"
  | "function-define"
  | "lemma"
  | "relation"
  | "algebraic-binary"
  | "algebraic-unary";

type Atomic = "number" | "string" | "bool" | "null" | "symbol" | "error";

interface ASTNode {
  forEachLeft(fn: (n: ASTNode | string) => void): this;
  forEachRight(fn: (n: ASTNode | string) => void): this;
}

class Atom implements ASTNode {
  value: string;
  kind: Atomic;
  constructor(value: string, kind: Atomic) {
    this.value = value;
    this.kind = kind;
  }
  forEachLeft(fn: (n: string | ASTNode) => void) {
    fn(this.value);
    return this;
  }
  forEachRight(fn: (n: string | ASTNode) => void) {
    fn(this.value);
    return this;
  }
}

class Compound implements ASTNode {
  left: ASTNode[];
  op: string;
  right: ASTNode[];
  kind: Nonatomic;
  constructor(
    left: ASTNode[],
    op: string,
    right: ASTNode[],
    kind: Nonatomic,
  ) {
    this.left = left;
    this.op = op;
    this.right = right;
    this.kind = kind;
  }
  forEachLeft(fn: (n: string | ASTNode) => void) {
    this.left.forEach((node) => fn(node));
    return this;
  }
  forEachRight(fn: (n: string | ASTNode) => void) {
    this.right.forEach((node) => fn(node));
    return this;
  }
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
  error: string;
  /**
   * The result of the parsing
   * is an array of ASTNodes.
   * If only one statement (an expression
   * terminated by a semicolon) is entered,
   * the result will have a length of 1.
   */
  result: ASTNode[];
  /**
   * Generates an array of tokens from
   * the input source. This method isn't
   * used by the parser, but is useful
   * for debugging expressions. The
   * result property always has at least
   * one ASTNode. By default, it contains
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
   * the Parser instance. The parse result
   * is accessible via the result property.
   * If an error occurred during the parse,
   * the result property will contain an
   * error node.
   */
  parse(source: string): this;
}

export class Parser {
  private previous: Token;
  private scanner;
  private peek: Token;
  private rules: RuleSet;
  private queue: Queue<Token>;
  private opStack: Token[];
  private nodeStack: ASTNode[];
  constructor(rules?: RuleSet) {
    this.source = "";
    this.error = "";
    this.queue = new Queue();
    this.opStack = [];
    this.nodeStack = [];
    this.scanner = new Lexer();
    this.previous = new Token(TOKEN.NIL, "", 0);
    this.peek = new Token(TOKEN.NIL, "", 0);
    this.result = [new Atom("null", "null")];
    this.rules = rules || {
      ["+"]: { prec: 0, arity: 2, assoc: "left" },
      ["-"]: { prec: 0, arity: 2, assoc: "left" },
      ["*"]: { prec: 5, arity: 2, assoc: "left" },
      ["/"]: { prec: 5, arity: 2, assoc: "left" },
      ["^"]: { prec: 10, arity: 2, assoc: "right" },
    };
  }
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
          const out1 = this.opStack.pop();
          this.queue.enqueue(out1);
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
      } else {
        this.queue.enqueue(this.peek);
        this.nodeStack.push(new Atom(this.peek.lexeme, "number"));
      }
      this.advance();
    }
    while (this.opStack.length !== 0) {
      const out = this.opStack.pop();
      if (out !== undefined) this.queue.enqueue(out);
    }
    log(this);
    return this.queue.array;
  }
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
  parse(source: string) {
    (source[source.length - 1] !== ";") && (source += ";");
    this.init(source);
    this.result = this.stmntList();
    if (this.error) this.result = [new Atom(this.error, "error")];
    return this;
  }
  private stmntList() {
    const statements: ASTNode[] = [this.stmnt()];
    while (this.peek.type !== TOKEN.EOF) {
      statements.push(this.stmnt());
    }
    return statements;
  }
  private stmnt() {
    return this.exprStmt();
  }
  private exprStmt() {
    const expr = this.expression();
    this.eat(TOKEN.SEMICOLON, error.expected.semicolon);
    return expr;
  }
  private expression() {
    return this.equality();
  }
  private parseExpression({ left, ops, right, node }: Rule) {
    let LEFT: ASTNode = this[left]();
    while (this.match(ops)) {
      const OP = this.previous.lexeme;
      const RIGHT = this[right]();
      LEFT = node(LEFT, OP, RIGHT);
    }
    return LEFT;
  }
  private equality() {
    return this.parseExpression({
      left: "relation",
      ops: [TOKEN.NEQ, TOKEN.EQUAL],
      right: "relation",
      node: (left, op, right) => new Compound([left], op, [right], "relation"),
    });
  }
  private relation() {
    return this.parseExpression({
      left: "term",
      ops: [TOKEN.LTE, TOKEN.GTE, TOKEN.LT, TOKEN.GT],
      right: "term",
      node: (left, operator, right) =>
        new Compound([left], operator, [right], "relation"),
    });
  }

  private term() {
    return this.parseExpression({
      left: "factor",
      ops: [TOKEN.MINUS, TOKEN.PLUS],
      right: "factor",
      node: (left, op, right) =>
        new Compound([left], op, [right], "algebraic-binary"),
    });
  }

  private factor() {
    return this.parseExpression({
      left: "imul",
      ops: [TOKEN.STAR, TOKEN.SLASH, TOKEN.DOT_SLASH, TOKEN.DOT_STAR],
      right: "imul",
      node: (left, op, right) =>
        new Compound([left], op, [right], "algebraic-binary"),
    });
  }

  private imul() {
    let node = this.quotient();
    return node;
  }

  private quotient() {
    return this.parseExpression({
      left: "unaryPrefix",
      ops: [TOKEN.PERCENT, TOKEN.MOD, TOKEN.REM, TOKEN.DIV],
      right: "unaryPrefix",
      node: (left, op, right) =>
        new Compound([left], op, [right], "algebraic-binary"),
    });
  }
  private unaryPrefix() {
    if (this.match([TOKEN.NOT, TOKEN.TILDE])) {
      const op = this.previous.lexeme;
      const right = this.power();
      return new Compound([], op, [right], "algebraic-unary");
    }
    return this.power();
  }
  private power(): ASTNode {
    let node: ASTNode = this.primary();
    while (this.match([TOKEN.CARET, TOKEN.DOT_CARET])) {
      const op = this.previous.lexeme;
      const right: ASTNode = this.unaryPrefix();
      node = new Compound([node], op, [right], "algebraic-binary");
    }
    return node;
  }

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

  private id(): ASTNode {
    const name = this.eat(TOKEN.SYMBOL, error.expected.id);
    let node: ASTNode = new Atom(name, "symbol");
    if (this.match([TOKEN.ASSIGN])) {
      const body: ASTNode = this.expression();
      node = new Compound([body], name, [], "function-define");
    }
    if (this.match([TOKEN.LEFT_PAREN])) {
      node = this.callexpr(node);
      return node;
    }
    return node;
  }

  private callexpr(node: ASTNode): ASTNode {
    let params: ASTNode[] = [];
    if (!this.check(TOKEN.RIGHT_PAREN)) {
      do {
        params.push(this.expression());
      } while (this.match([TOKEN.COMMA]));
      this.eat(TOKEN.RIGHT_PAREN, error.expected.rightParen);
    } else this.eat(TOKEN.RIGHT_PAREN, error.expected.rightParen);
    if (this.match([TOKEN.ASSIGN])) {
      const body = this.expression();
      node = new Compound(params, "define", [body], "function-define");
    } else node = new Compound([node], "call", params, "function-apply");
    return node;
  }

  private braced(): ASTNode {
    this.eat(TOKEN.LEFT_BRACE, error.expected.leftBrace);
    let expr = this.expression();
    if (this.match([TOKEN.COMMA])) {
      let elements = [expr];
      do {
        elements.push(this.expression());
      } while (this.match([TOKEN.COMMA]));
      this.eat(TOKEN.RIGHT_BRACE, error.expected.rightBrace);
      return new Compound(elements, "list", [], "function-apply");
    } else this.eat(TOKEN.RIGHT_BRACE, error.expected.rightBrace);
    return new Compound([expr], "lemma", [], "function-apply");
  }

  private parend(): ASTNode {
    this.eat(TOKEN.LEFT_PAREN, error.expected.leftParen);
    let expr = this.expression();
    if (this.match([TOKEN.COMMA])) {
      let elements = [expr];
      do {
        elements.push(this.expression());
      } while (this.match([TOKEN.COMMA]));
      this.eat(TOKEN.RIGHT_PAREN, error.expected.rightParen);
      return new Compound(elements, "tuple", [], "function-apply");
    } else this.eat(TOKEN.RIGHT_PAREN, error.expected.rightParen);
    return expr;
  }

  private array() {
    let elements: ASTNode[] = [];
    this.eat(TOKEN.LEFT_BRACKET, error.expected.leftBracket);
    let elem = this.expression();
    let rows = 0;
    let cols = 0;
    if (elem instanceof Compound) {
      cols = elem.left.length;
      rows += 1;
    }
    elements.push(elem);
    while (this.match([TOKEN.COMMA])) {
      let expr = this.expression();
      if (expr instanceof Compound) {
        rows += 1;
        if (cols !== expr.left.length) {
          throw new SyntaxError(error.noJaggedArrays);
        }
      }
      elements.push(expr);
    }
    this.eat(TOKEN.RIGHT_BRACKET, error.expected.rightBracket);
    return new Compound(elements, "list", [], "function-apply");
  }

  private get hasTokens() {
    return this.peek.type !== TOKEN.EOF;
  }

  private literal() {
    let lexeme = "";
    switch (this.peek.type) {
      case TOKEN.NUMBER:
        lexeme = this.eat(TOKEN.NUMBER, error.expected.number);
        return new Atom(lexeme, "number");
      case TOKEN.STRING:
        lexeme = this.eat(TOKEN.STRING, error.expected.string);
        return new Atom(lexeme, "string");
      case TOKEN.TRUE:
        lexeme = this.eat(TOKEN.TRUE, error.expected.true);
        return new Atom(lexeme, "bool");
      case TOKEN.FALSE:
        lexeme = this.eat(TOKEN.FALSE, error.expected.false);
        return new Atom(lexeme, "bool");
      case TOKEN.NULL:
        lexeme = this.eat(TOKEN.NULL, error.expected.null);
        return new Atom(lexeme, "null");
      default:
        throw new SyntaxError(`Unrecognized token: [${this.peek.type}]`);
    }
  }
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
  private check(type: TOKEN) {
    if (type === TOKEN.EOF) return false;
    return this.peek.type === type;
  }
  private advance() {
    this.previous = this.peek;
    this.peek = this.scanner.getToken();
    return this.previous;
  }
  private eat(tokenType: TOKEN, message: string) {
    const token = this.peek;
    if (token.type === TOKEN.EOF) {
      this.error = `[Line: ${token.line}] | ${message} at end.`;
      throw new SyntaxError(this.error);
    }
    if (token.type === TOKEN.ERROR || token.type !== tokenType) {
      this.error = `[Line: ${token.line}] | ${message} | got ${token.lexeme}`;
      throw new SyntaxError(this.error);
    }
    this.advance();
    return token.lexeme;
  }
}
type RuleSet = {
  [key: string]: { prec: number; arity: number; assoc: "left" | "right" };
};

const parser = new Parser();
const rpn = parser.shunt("4 + 4 * 2 / (1 - 5)");
log(rpn);
