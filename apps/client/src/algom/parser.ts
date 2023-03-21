import {
  Compile,
  Interpreter,
  Runtimeval,
  ToLatex,
  ToString,
} from "./visitors/index.js";
import { Fn } from "./fn.js";
import { ast, Atom } from "./ast/astnode.js";
import {
  ASTNode,
  C,
  ErrorNode,
  Root,
  SymbolNode,
  TupleNode,
  VectorNode,
} from "./ast/index.js";
import { corelib } from "./scope.js";
import { Keyword, keywords, NODE, PREC, TOKEN } from "./structs/enums.js";
import { List } from "./structs/list.js";
import { is } from "./structs/mathfn.js";
import {
  isAlpha,
  isDigit,
  isHexDigit,
  split,
  tree,
} from "./structs/stringfn.js";
import { Token, TokenStream } from "./structs/token.js";

export interface Parser {
  /**
   * Parses the input source, returning
   * an ASTNode. The parse result
   * is accessible via the result property.
   * If an error occurred during the parse,
   * the result property will contain an
   * error astnode.
   */
  parse(source: string): Root;
}
export class Parser {
  /* -------------------------------------------------------------------------- */
  /* § Lexer API                                                                */
  /* -------------------------------------------------------------------------- */

  private source: string = "";
  private start: number = 0;
  private current: number = 0;
  private prev: Token = Token.nil;
  private line: number = 1;
  private numtype: TOKEN = TOKEN.INT;
  private peek: Token = Token.nil;
  private error: ErrorNode | null;
  private lastNode: NODE = NODE.NULL;
  private funcs: Set<string> = new Set();
  private strict: boolean = true;

  CLEAN() {
    this.source = "";
    this.start = 0;
    this.current = 0;
    this.prev = Token.nil;
    this.line = 1;
    this.start = 0;
    this.current = 0;
    this.prev = Token.nil;
    this.peek = Token.nil;
    this.numtype = TOKEN.INT;
    this.error = null;
    this.strict = true;
    this.funcs.clear();
  }

  private get atEOF() {
    return this.start >= this.source.length;
  }
  private errorToken(message: string) {
    return new Token(TOKEN.ERROR, message);
  }
  private token(type: TOKEN, lex?: string) {
    const lexeme = lex ?? this.substr;
    const out = new Token(type, lexeme);
    this.prev = out;
    return out;
  }

  private get substr() {
    return this.source.substring(this.start, this.current);
  }

  private get char() {
    return this.source[this.current];
  }

  private get nextChar() {
    if (this.atEOF) return "";
    return this.source[this.current + 1];
  }
  private advance() {
    this.current++;
    const out = this.source[this.current - 1];
    return out;
  }
  private skipWhitespace() {
    while (!this.atEOF) {
      const c = this.char;
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

  private IDENTIFIER() {
    while (isAlpha(this.char) || isDigit(this.char)) {
      this.advance();
    }
    const remaining = this.source.substring(this.start, this.current);
    if (keywords[remaining as Keyword] !== undefined) {
      const type = keywords[remaining as Keyword];
      return this.token(type);
    }
    return this.token(TOKEN.SYMBOL);
  }
  private STRING() {
    while (this.char !== `"` && !this.atEOF) {
      if (this.char === `\n`) {
        this.line += 1;
      }
      this.advance();
    }
    if (this.atEOF) {
      return this.errorToken("Unterminated string");
    }
    this.advance();
    return this.token(TOKEN.STRING);
  }
  private match(expected: string) {
    if (this.atEOF) return false;
    if (this.source[this.current] !== expected) return false;
    this.current += 1;
    return true;
  }
  private get PREV() {
    return this.source[this.current - 1];
  }
  private NUMBER() {
    while (isDigit(this.char)) {
      this.advance();
    }
    if (this.PREV === "0") {
      if (this.match("b")) return this.BINARY();
      if (this.match("o")) return this.OCTAL();
      if (this.match("x")) return this.HEX();
    }
    if (this.stillSeesNumber) {
      this.advance();
      while (isDigit(this.char)) {
        this.advance();
      }
    }
    if (this.seesScientific) {
      this.advance();
      this.scientific();
    }
    if (this.char === "i" && isAlpha(this.nextChar)) {
      this.advance();
      this.numtype = TOKEN.COMPLEX;
    }
    return this.token(this.numtype);
  }

  private scientific() {
    this.advance();
    this.NUMBER();
    this.numtype = TOKEN.SCINUM;
    return this.token(this.numtype);
  }

  private get seesScientific() {
    return (this.char === "e" || this.char === "E") &&
      (this.nextChar === "-" || this.nextChar === "+" ||
        isDigit(this.nextChar));
  }

  private get stillSeesNumber() {
    if (isDigit(this.nextChar)) {
      if (this.char === ".") {
        this.numtype = TOKEN.FLOAT;
        return true;
      }
      if (this.char === "/") {
        this.numtype = TOKEN.FRAC;
        return true;
      }
    }
    return false;
  }

  private HEX() {
    while (isHexDigit(this.char)) {
      this.advance();
    }
    this.numtype = TOKEN.HEX;
    return this.token(this.numtype);
  }

  private OCTAL() {
    while ("0" <= this.char && this.char <= "7") {
      this.advance();
    }
    this.numtype = TOKEN.OCTAL;
    return this.token(this.numtype);
  }

  private BINARY() {
    while (this.char === "0" || this.char === "1") {
      this.advance();
    }
    this.numtype = TOKEN.BINARY;
    return this.token(this.numtype);
  }

  private GetToken() {
    this.skipWhitespace();
    this.start = this.current;
    if (this.atEOF) return Token.EOF;
    const c = this.advance();
    if (isAlpha(c)) return this.IDENTIFIER();
    if (isDigit(c)) {
      this.numtype = TOKEN.INT;
      return this.NUMBER();
    }
    switch (c) {
      case `,`:
        return this.token(TOKEN.COMMA);
      case `(`:
        return this.token(TOKEN.LPAREN);
      case `)`:
        return this.token(TOKEN.RPAREN);
      case `[`:
        return this.token(TOKEN.LBRACKET);
      case `]`:
        return this.token(TOKEN.RBRACKET);
      case `{`:
        return this.token(TOKEN.LBRACE);
      case `}`:
        return this.token(TOKEN.RBRACE);
      case `'`:
        return this.token(TOKEN.SQUOTE);
      case `;`:
        return this.token(TOKEN.SEMICOLON);
      case `+`:
        return this.token(this.match("+") ? TOKEN.PLUS_PLUS : TOKEN.PLUS);
      case "-":
        if (
          isDigit(this.char) && !this.prev.isNumber &&
          this.prev.type !== TOKEN.SYMBOL
        ) {
          this.advance();
          this.numtype = TOKEN.INT;
          return this.NUMBER();
        }
        if (this.prev.isNumber || this.prev.type !== TOKEN.SYMBOL) {
          return this.token(TOKEN.MINUS);
        }
        return this.token(TOKEN.NEGATE);
      case "?":
        return this.token(TOKEN.QUERY);
      case ":":
        return this.token(TOKEN.COLON);
      case "&":
        return this.token(TOKEN.AMP);
      case "*":
        return this.token(TOKEN.STAR);
      case "/":
        return this.token(this.match("/") ? TOKEN.DIV : TOKEN.SLASH);
      case "%":
        return this.token(TOKEN.PERCENT);
      case "~":
        return this.token(TOKEN.TILDE);
      case "|":
        return this.token(TOKEN.VBAR);
      case ".":
        if (isDigit(this.char)) {
          this.advance();
          const tk = this.NUMBER();
          return this.token(TOKEN.FLOAT, "0" + tk.lexeme);
        }
        return this.token(TOKEN.DOT);
      case "^":
        return this.token(TOKEN.CARET);
      case "!":
        return this.token(this.match("=") ? TOKEN.NEQ : TOKEN.BANG);
      case "=":
        return this.token(this.match("=") ? TOKEN.DEQUAL : TOKEN.ASSIGN);
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
            ? TOKEN.LTE
            : this.match(">")
            ? TOKEN.RSHIFT
            : TOKEN.LT,
        );
      case `"`:
        return this.STRING();
    }
    return this.errorToken(`Unrecognized token ${c}.`);
  }

  INIT(source: string) {
    this.source = source;
    this.start = 0;
    this.current = 0;
    this.prev = Token.nil;
    this.line = 1;
    return this.GetToken();
  }

  constructor() {
    this.error = null;
  }

  /* -------------------------------------------------------------------------- */
  /* § Public API                                                               */
  /* -------------------------------------------------------------------------- */

  tokenize(source: string) {
    let out: Token[] = [];
    this.INIT(source);
    let token = Token.nil;
    while (token.type !== TOKEN.EOF) {
      token = this.GetToken();
      out.push(token);
      if (token.type === TOKEN.EOF) break;
    }
    this.INIT("");
    return new TokenStream(out);
  }

  evaluate(n: ASTNode) {
    const i = new Interpreter();
    return n.accept(i);
  }

  parseExpr(expression: string) {
    this.peek = this.INIT(expression);
    this.strict = false;
    const result = this.expression();
    this.CLEAN();
    return result;
  }

  private atom(builder: (lex: string) => Atom) {
    const token = this.tick();
    const newnode = builder(token.lexeme);
    this.lastNode = newnode.kind;
    return newnode;
  }

  latex(src: string) {
    return this.parse(src).accept(new ToLatex());
  }
  compute(src: string) {
    return this.parse(src).accept(new Interpreter()).accept(new ToLatex());
  }
  stringify(src: string) {
    return this.parse(src).accept(new ToString());
  }
  compileFunction(body: string, params: string[]): string | Function {
    const args = params.map((s) => ast.symbol(s));
    const def = this.parseExpr(body);
    const c = new Compile();
    const root = new Root([ast.funDeclaration("f", args, def)]);
    const { result, err } = root.accept(c) as Runtimeval;
    if (result instanceof Fn) {
      return (...as: any[]) => result.call(c, as);
    }
    if (err) return err;
    return `Invalid expression ${body}`;
  }
  parse(source: string): ASTNode {
    this.peek = this.INIT(source);
    let result: ASTNode[] | ASTNode = this.stmntList();
    if (this.error !== null) {
      result = ast.root([this.error]);
    } else {
      result = ast.root(result);
    }
    this.CLEAN();
    return result;
  }

  /* -------------------------------------------------------------------------- */
  /* § Parse Methods                                                            */
  /* -------------------------------------------------------------------------- */

  private stmntList() {
    const statements: ASTNode[] = [];
    while ((this.peek.type !== TOKEN.EOF) && this.error === null) {
      if (this.error) return this.error;
      statements.push(this.stmnt());
    }
    return statements;
  }

  private stmnt() {
    if (this.check(TOKEN.SEMICOLON)) {
      this.tick();
    }
    if (this.reads(TOKEN.LET)) {
      return this.variableDeclaration();
    }
    if (this.reads(TOKEN.IF)) {
      return this.conditional();
    }
    if (this.reads(TOKEN.WHILE)) {
      return this.whileStmt();
    }
    if (this.reads(TOKEN.LBRACE)) {
      return this.block();
    }
    return this.exprStmt();
  }

  whileStmt(): ASTNode {
    this.eat(TOKEN.LPAREN, "expected [(] after [while]");
    const condition = this.expression();
    this.eat(TOKEN.RPAREN, "expected [)] after [while]");
    const body = this.stmnt();
    return ast.whileStmt(condition, body);
  }

  private reads(type: TOKEN) {
    if (this.check(type)) {
      this.tick();
      return true;
    }
    return false;
  }

  private check(type: TOKEN) {
    if (this.atEOF || this.error !== null) return false;
    return this.peek.type === type;
  }

  private conditional() {
    this.eat(TOKEN.LPAREN, "Expected ( in conditonal.");
    const test = this.expression();
    this.eat(TOKEN.RPAREN, "Expected ) to close conditional.");
    const consequent: ASTNode = this.stmnt();
    const alternate: ASTNode = this.reads(TOKEN.ELSE) ? this.stmnt() : ast.nil;
    return ast.cond(test, consequent, alternate);
  }

  private block() {
    const statements: ASTNode[] = [];
    while (!this.peek.is(TOKEN.RBRACE) && this.error === null) {
      statements.push(this.stmnt());
    }
    this.eat(TOKEN.RBRACE, "Expected } to close block.");
    return ast.block(statements);
  }

  private variableDeclaration() {
    const name = this.eat(TOKEN.SYMBOL, "Expected valid variable name.");
    let init: ASTNode = ast.nil;
    if (this.reads(TOKEN.LPAREN)) {
      return this.functionDeclaration(name);
    }
    if (this.reads(TOKEN.ASSIGN)) {
      init = this.exprStmt();
    }
    return ast.varDeclaration(name, init, this.line);
  }

  private functionDeclaration(name: string) {
    this.funcs.add(name);
    let params: SymbolNode[] = [];
    if (!this.peek.is(TOKEN.RPAREN) && this.error === null) {
      do {
        const n = this.eat(TOKEN.SYMBOL, "Expected function name.");
        params.push(ast.symbol(n));
      } while (this.reads(TOKEN.COMMA));
      this.eat(TOKEN.RPAREN, "Expected ) to close params.");
    } else this.eat(TOKEN.RPAREN, "Expected ) to close params.");
    this.eat(TOKEN.ASSIGN, "Expected = operator in function declaration.");
    const body: ASTNode = this.stmnt();
    return ast.funDeclaration(name, params, body);
  }

  private exprStmt() {
    const expr = this.expression();
    if (this.atEOF || this.lastNode === NODE.BLOCK) {
      return expr;
    }
    this.eat(TOKEN.SEMICOLON, "Statements must end with ;");
    return expr;
  }

  private expression(minbp = PREC.NON) {
    if (this.strict && this.error !== null) return this.error as ASTNode;
    let lhs: ASTNode = ast.nil;
    switch (this.peek.type) {
      case TOKEN.SYMBOL:
        lhs = this.id();
        break;
      case TOKEN.FALSE:
        lhs = this.atom(() => ast.bool(false));
        break;
      case TOKEN.TRUE:
        lhs = this.atom(() => ast.bool(true));
        break;
      case TOKEN.STRING:
        lhs = this.atom((lexeme) => ast.string(lexeme));
        break;
      case TOKEN.NULL:
        lhs = this.atom(() => ast.nil);
        break;
      case TOKEN.LPAREN:
        lhs = this.group();
        if (lhs.isGroup() && lhs.expression.isNum()) {
          const rhs = this.expression();
          lhs = ast.binex(lhs, "*", rhs);
        }
        if (
          (this.check(TOKEN.LPAREN)) && this.lastNode !== NODE.CALL_EXPRESSION
        ) {
          const rhs = this.group();
          lhs = ast.binex(lhs, "*", rhs);
        }
        break;
      case TOKEN.LBRACE:
        lhs = this.block();
        break;
      case TOKEN.LBRACKET:
        lhs = this.array();
        break;
      case TOKEN.VBAR:
        lhs = this.absoluteValue();
        break;
      default:
        lhs = this.IMUL(lhs);
    }
    while (this.peek.isOperable && this.error === null) {
      if (this.peek.type === TOKEN.EOF) break;
      const op = this.peek;
      if (this.strict && op.isKeyword) {
        this.panic("found prohibited keyword");
      }
      if (op.bp < minbp) break;
      this.tick();
      let rhs = this.expression(op.bp);
      lhs = this.makeExpr(lhs, op.lexeme, rhs);
    }
    return lhs;
  }

  private makeExpr(lhs: ASTNode, op: string, rhs: ASTNode) {
    let expr: ASTNode = ast.nil;
    switch (true) {
      case (!lhs.isNull() && !rhs.isNull()):
        expr = ast.binex(lhs, op, rhs);
        break;
      case (!lhs.isNull() && rhs.isNull()):
        expr = ast.unex(op, lhs);
        break;
      case (lhs.isNull() && !rhs.isNull()):
        expr = ast.unex(op, rhs);
        break;
    }
    this.lastNode = expr.kind;
    return expr;
  }

  private IMUL(newnode: ASTNode) {
    switch (this.peek.type) {
      case TOKEN.INT:
        newnode = this.atom((lex) => ast.int(lex));
        break;
      case TOKEN.FLOAT:
        newnode = this.atom((lex) => ast.float(lex));
        break;
      case TOKEN.FRAC:
        newnode = this.atom((lex) => ast.fraction(lex));
        break;
      case TOKEN.BINARY:
        newnode = this.atom((lex) => ast.int(lex, 2));
        break;
      case TOKEN.OCTAL:
        newnode = this.atom((lex) => ast.int(lex, 8));
        break;
      case TOKEN.HEX:
        newnode = this.atom((lex) => ast.int(lex, 16));
        break;
      case TOKEN.INF:
        newnode = this.atom(() => C.inf);
        break;
      case TOKEN.NAN:
        newnode = this.atom(() => C.nan);
        break;
      case TOKEN.SCINUM: {
        const token = this.tick();
        const [a, b] = split(token.lexeme, "e");
        const base10 = ast.int("10");
        const left = is.integer(a) ? ast.int(a) : ast.float(a);
        const B = Number.parseInt(b).toString();
        const right = ast.int(B);
        const exp = ast.binex(base10, "^", right);
        newnode = ast.binex(left, "*", exp);
        break;
      }
      case TOKEN.COMPLEX:
        // TODO - should lookback to get the form `a + bi` rather than `bi`
        throw new Error("Complex uimplemented.");
    }
    if (this.check(TOKEN.SYMBOL)) {
      if (this.isVariableName(this.peek.lexeme)) {
        const rhs = this.expression();
        newnode = ast.binex(newnode, "*", rhs);
      }
      if (corelib.hasFunction(this.peek.lexeme)) {
        const sym = this.atom((lex) => ast.symbol(lex));
        const rhs = this.callexpr(sym as SymbolNode);
        newnode = ast.binex(newnode, "*", rhs);
      }
    }
    if (this.check(TOKEN.LPAREN)) {
      const rhs = this.group();
      newnode = ast.binex(newnode, "*", rhs);
    }
    this.lastNode = newnode.kind;
    return newnode;
  }

  private absoluteValue() {
    this.eat(TOKEN.VBAR, "Expected | in absolute-value.");
    const expr = this.expression(PREC.NON);
    this.eat(TOKEN.VBAR, "Expected closing | in absolute-value.");
    return ast.callExpr("abs", [expr], corelib.getFunction("abs"));
  }

  private group(): ASTNode {
    this.eat(TOKEN.LPAREN, "Expected in ( in group.");
    const expr = this.expression(PREC.NON);
    let elements = List.of(expr);
    if (this.reads(TOKEN.COMMA)) {
      do {
        elements.push(this.expression());
      } while (this.reads(TOKEN.COMMA));
      this.eat(TOKEN.RPAREN, "Expected ) to close group.");
      return ast.tuple(elements);
    } else this.eat(TOKEN.RPAREN, "Expected ) to close group.");
    if (this.prev.type === TOKEN.PLUS_PLUS) {
      return ast.tuple(elements);
    }
    return ast.group(expr);
  }

  private isVariableName(name: string) {
    return (!this.funcs.has(name) && !corelib.hasFunction(name)) ||
      corelib.hasConstant(name);
  }

  private id(): ASTNode {
    const name = this.eat(TOKEN.SYMBOL, "Expected valid identifier.");
    let node = ast.symbol(name);
    if (this.peek.is(TOKEN.LPAREN) && this.error === null) {
      return this.callexpr(node);
    }
    if (this.reads(TOKEN.ASSIGN)) {
      const value = this.expression();
      return ast.assign(name, value);
    }
    return node;
  }

  private callexpr(node: SymbolNode): ASTNode {
    if (this.isVariableName(node.value)) {
      let rhs = this.group();
      return ast.binex(node, "*", rhs);
    }
    this.eat(TOKEN.LPAREN, "Expected ( in call-expression");
    let params: ASTNode[] = [];
    if (this.peek.type !== TOKEN.RPAREN && this.error === null) {
      do {
        params.push(this.expression());
      } while (this.reads(TOKEN.COMMA));
      this.eat(TOKEN.RPAREN, "Expected ) in call-expression");
    } else this.eat(TOKEN.RPAREN, "Expected ) in call-expression");
    return ast.callExpr(
      node.value,
      params,
      corelib.getFunction(node.value),
    );
  }

  private array() {
    let builder: "matrix" | "vector" = "vector";
    let elements: ASTNode[] = [];
    this.eat(TOKEN.LBRACKET, "Expected [ in array");
    let element = this.expression();
    if (this.reads(TOKEN.COLON)) {
      let rhs = this.expression();
      let step: ASTNode = ast.int("1");
      if (this.reads(TOKEN.COLON)) {
        step = this.expression();
      }
      this.eat(TOKEN.RBRACKET, `Expected ‘]’ to close the range.`);
      return ast.callExpr(
        "range",
        [element, rhs, step],
        corelib.getFunction("range"),
      );
    }
    let rows = 0;
    let cols = 0;
    if (element instanceof VectorNode) {
      cols = element.len;
      rows += 1;
      builder = "matrix";
    }
    elements.push(element);
    while (this.reads(TOKEN.COMMA)) {
      let expr = this.expression();
      if (builder === "matrix" && (!expr.isVector())) {
        this.panic("Only vectors permitted in matrices.");
      }
      if (expr instanceof VectorNode) {
        builder = "matrix";
        rows += 1;
        if (cols !== expr.len) this.panic("Jagged arrays not permitted.");
      }
      elements.push(expr);
    }

    this.eat(TOKEN.RBRACKET, "Expected ] in array.");
    return builder === "matrix"
      ? ast.matrix(elements as VectorNode[], rows, cols)
      : ast.vector(elements);
  }

  EVAL(src: string) {
    const n = new Interpreter();
    const out = this.parse(src).accept(n);
    return n.stringify(out);
  }

  str(src: string) {
    const p = this.parse(src);
    return this.toString(p);
  }

  ast(src: string) {
    const res = this.parse(src);
    if (res.erred) {
      return res.val;
    }

    return tree(res, (node) => {
      if (node instanceof ASTNode) node.kind = node.nkind as any;
      if (node instanceof TupleNode) node.value = node.value.array as any;
    });
  }

  private toString(out: ASTNode) {
    const s = new ToString();
    return out.accept(s);
  }

  private panic(messages: string) {
    const line = this.line;
    const plexeme = this.prev.lexeme;
    const ptypename = this.prev.typename;
    const lastNode = NODE[this.lastNode];
    const line0 = `Parsing Error:\n`;
    const line2 = `Line: ${line}\n`;
    const line3 = `Last lexeme parsed: A ${ptypename} “${plexeme}”\n`;
    const line4 = `Last semantic parsed: ${lastNode}\n`;
    const message = line0 + line2 + line3 + line4 + messages;
    this.error = ast.error(message);
    return this.error;
  }

  private strictHandling(tokenType: TOKEN, message: string) {
    if (this.peek.type === TOKEN.EOF) {
      if (this.error) {
        return this.error.value;
      }
      const erm = `Abrupt end of input.`;
      this.error = ast.error(erm);
      this.panic(erm);
      return erm;
    }
    if (this.peek.type !== tokenType) {
      this.panic(message);
      return message;
    }
    return null;
  }

  private eat(tokenType: TOKEN, message: string = "") {
    const token = this.peek;
    if (this.strict) {
      const res = this.strictHandling(tokenType, message);
      if (res) return res;
    } else {
      if (token.type === TOKEN.EOF || token.type !== tokenType) {
        this.error = ast.string(token.lexeme);
      }
    }
    this.tick();
    return token.lexeme;
  }

  private tick() {
    if (this.peek.type === TOKEN.ERROR && this.strict) {
      this.panic(`[scanner]: ${this.peek.lexeme}`);
      this.peek = new Token(TOKEN.EOF, "");
      return this.peek;
    }
    if (this.error !== null && this.strict) {
      this.peek = Token.EOF;
      return this.peek;
    }
    const token = this.peek;
    this.peek = this.GetToken();
    return token;
  }

  compile(src: string) {
    return this.parse(src).accept(new Compile());
  }
}

const p = new Parser();
const expr = `
let x = 5;
x = 7;
`;
console.log(p.parse(expr));
