import { ToString } from "./ToString.js";
import { Compile } from "./compiler.js";
import { Interpreter } from "./interpreter.js";
import { Lexer } from "./lexer.js";
import {
  ast,
  ASTNode,
  Errnode,
  Root,
  Sym,
  Tuple,
  Vector,
} from "./nodes/index.js";
import { corelib } from "./scope.js";
import { PREC, TOKEN } from "./structs/enums.js";
import { List } from "./structs/list.js";
import { is } from "./structs/mathfn.js";
import { split, tree } from "./structs/stringfn.js";
import { Token } from "./structs/token.js";

export interface Parser {
  /**
   * The result of the parsing
   * is an array of ASTs.
   * If only one statement (an expression
   * terminated by a semicolon) is entered,
   * the result will have a length of 1.
   */
  result: Root;
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
  token: Token = Token.nil;
  error: Errnode | null;
  lastToken: Token = Token.nil;
  private compiler: Compile = new Compile();
  private lastNode: ASTNode = ast.nil;
  private scanner: Lexer = new Lexer();
  private idx: number = 1;
  private funcNames: Set<string> = new Set();
  private source: string = "";
  constructor() {
    this.error = null;
  }
  static build(op: string, params: string[]) {
    const input = Parser.make(op, params);
    const p = new Parser();
    return p.parse(input);
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

  /* -------------------------------------------------------------------------- */
  /* § Parse                                                                    */
  /* -------------------------------------------------------------------------- */
  /**
   * Initializes the input source string
   * for scanning.
   */
  private init(source: string) {
    this.source = source;
    this.scanner.init(source);
    this.token = this.scanner.getToken();
  }

  public parse(source: string): Root {
    this.init(source);
    const result = this.stmntList();
    if (this.error !== null) {
      this.result = ast.root([this.error]);
    } else {
      this.result = ast.root(result);
    }
    return this.result;
  }

  private stmntList() {
    const statements: ASTNode[] = [this.stmnt()];
    while (!this.token.isEOF && this.error === null) {
      if (this.error) return this.error;
      statements.push(this.stmnt());
    }
    return statements;
  }

  private stmnt() {
    this.match([TOKEN.SEMICOLON]);
    switch (true) {
      case this.match([TOKEN.IF]):
        return this.conditional();
      case this.match([TOKEN.LET]):
        return this.variableDeclaration();
      case this.match([TOKEN.LBRACE]):
        return this.block();
      default:
        return this.exprStmt();
    }
  }

  evaluate(n: ASTNode) {
    const i = new Interpreter();
    return n.accept(i);
  }

  private conditional() {
    const parser = "[conditional]: ";
    const err1 = parser + "Expected ‘(’";
    const err2 = parser + "Expected ‘)’";
    this.eat(TOKEN.LPAREN, err1);
    const test = this.expression();
    this.eat(TOKEN.RPAREN, err2);
    const consequent: ASTNode = this.stmnt();
    const alternate: ASTNode = this.match([TOKEN.ELSE])
      ? this.stmnt()
      : ast.nil;
    return ast.cond(test, consequent, alternate);
  }

  private block() {
    const parser = "[block]: ";
    const err = parser + "Expected ‘}’ to close block.";
    const statements: ASTNode[] = [];
    while (!this.check(TOKEN.RBRACE) && !this.token.isEOF) {
      statements.push(this.stmnt());
    }
    this.eat(TOKEN.RBRACE, err);
    return ast.block(statements);
  }

  private variableDeclaration() {
    const parser = "[variable-declaration]: ";
    const err1 = parser + "Expected variable name";
    const name = this.eat(TOKEN.SYMBOL, err1);
    let init: ASTNode = ast.nil;
    if (this.match([TOKEN.LPAREN])) {
      return this.functionDeclaration(name);
    }
    if (this.match([TOKEN.ASSIGN])) init = this.exprStmt();
    return ast.varDeclaration(name, init, this.token.line);
  }

  private functionDeclaration(name: string) {
    this.funcNames.add(name);
    let params: Sym[] = [];
    const parser = "[function-declaration]: ";
    const err1 = parser + "Expected name";
    const err2 = parser + "Expected ‘)’";
    if (!this.check(TOKEN.RPAREN)) {
      do {
        const n = this.eat(TOKEN.SYMBOL, err1);
        params.push(ast.symbol(n));
      } while (this.match([TOKEN.COMMA]));
      this.eat(TOKEN.RPAREN, err2);
    } else this.eat(TOKEN.RPAREN, err2);
    const err3 = parser + "Expected assignment operator ‘=’";
    this.eat(TOKEN.ASSIGN, err3);
    const body: ASTNode = this.stmnt();
    return ast.funDeclaration(name, params, body);
  }

  private exprStmt() {
    const expr = this.expression();
    while (this.check(TOKEN.SEMICOLON)) {
      this.advance();
    }
    if (
      this.token.isEOF || this.lastToken.isRightBrace ||
      this.lastToken.isSemicolon
    ) {
      return expr;
    } else {
      const parser = "[expression-statement]: ";
      const err1 = parser + "Expected ‘;’ to end statement";
      this.eat(TOKEN.SEMICOLON, err1);
    }
    return expr;
  }

  private lit(node: (lexeme: string) => ASTNode) {
    const previousToken = this.advance();
    let newnode = node(previousToken.lexeme);
    if ((newnode.isNum()) && this.token.isSymbol) {
      if (this.isVariableName(this.token.lexeme)) {
        const sym = this.advance();
        let rhs = ast.symbol(sym.lexeme);
        newnode = ast.binex(newnode, "*", rhs);
      }
      if (corelib.hasFunction(this.token.lexeme)) {
        const sym = this.advance();
        const s = ast.symbol(sym.lexeme);
        let rhs = this.callexpr(s);
        newnode = ast.binex(newnode, "*", rhs);
      }
    }
    if (this.token.isLeftParen) {
      const rhs = this.group();
      newnode = ast.binex(newnode, "*", rhs);
    }
    this.lastNode = newnode;
    return newnode;
  }

  private expression(minbp = PREC.NON) {
    if (this.error !== null) return this.error as ASTNode;
    let lhs: ASTNode = ast.nil;
    switch (true) {
      case this.token.isAtomic:
        lhs = this.literal();
        break;
      case this.token.isLeftParen:
        lhs = this.group();
        if (lhs.isGroup() && lhs.expression.isNum()) {
          const rhs = this.expression();
          lhs = ast.binex(lhs, "*", rhs);
        }
        if ((this.token.isLeftParen) && !this.lastNode.isCallExpr()) {
          const rhs = this.group();
          lhs = ast.binex(lhs, "*", rhs);
        }
        break;
      case this.token.isLeftBrace:
        lhs = this.block();
        break;
      case this.token.isLeftBracket:
        lhs = this.array();
        break;
      case this.token.isVbar:
        lhs = this.absoluteValue();
        break;
    }
    while (this.token.isOperable && this.error === null) {
      if (this.token.type === TOKEN.EOF) break;
      const op = this.token;
      if (op.isKeyword) this.panic("found prohibited keyword");
      if (op.bp < minbp) break;
      this.advance();
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
    this.lastNode = expr;
    return expr;
  }

  private literal() {
    switch (this.token.type) {
      case TOKEN.SYMBOL:
        return this.id();
      case TOKEN.INT:
        return this.lit((lexeme) => ast.int(lexeme));
      case TOKEN.FLOAT:
        return this.lit((lexeme) => ast.float(lexeme));
      case TOKEN.OCTAL:
        return this.lit((lexeme) => ast.int(lexeme, 8));
      case TOKEN.HEX:
        return this.lit((lexeme) => ast.int(lexeme, 16));
      case TOKEN.BINARY:
        return this.lit((lexeme) => ast.int(lexeme, 2));
      case TOKEN.FRAC:
        return this.lit((lexeme) => ast.fraction(lexeme));
      case TOKEN.SCINUM:
        const prevToken = this.advance();
        return this.expand(prevToken.lexeme);
      case TOKEN.TRUE:
        return this.lit(() => ast.bool(true));
      case TOKEN.FALSE:
        return this.lit(() => ast.bool(false));
      case TOKEN.STRING:
        return this.lit((lexeme) => ast.string(lexeme));
      case TOKEN.NULL:
        return this.lit(() => ast.nil);
      case TOKEN.COMPLEX:
        return this.lit((lexeme) => ast.complex(lexeme));
      default:
        return ast.nil;
    }
  }

  private absoluteValue() {
    const parser = "[absolute-value]: ";
    const err = parser + "Expected ‘|’";
    this.eat(TOKEN.VBAR, err);
    const expr = this.expression(PREC.NON);
    this.eat(TOKEN.VBAR, err);
    return ast.callExpr("abs", [expr], corelib.getFunction("abs"));
  }

  private group(): ASTNode {
    const parser = "[parenthesized-expression]: ";
    const err1 = parser + "Expected ‘(’";
    const err2 = parser + "Expected ‘)’";
    this.eat(TOKEN.LPAREN, err1);
    const expr = this.expression(PREC.NON);
    let elements = List.of(expr);
    if (this.match([TOKEN.COMMA])) {
      do {
        elements.push(this.expression());
      } while (this.match([TOKEN.COMMA]));
      this.eat(TOKEN.RPAREN, err2);
      return ast.tuple(elements);
    } else this.eat(TOKEN.RPAREN, err2);
    if (this.scanner.prevToken.type === TOKEN.PLUS_PLUS) {
      return ast.tuple(elements);
    }
    return ast.group(expr);
  }

  private isVariableName(name: string) {
    return (!this.funcNames.has(name) && !corelib.hasFunction(name)) ||
      corelib.hasConstant(name);
  }

  private id(): ASTNode {
    const parser = "[identifier]: ";
    const err = parser + "Expected valid identifier";
    const name = this.eat(TOKEN.SYMBOL, err);
    let node = ast.symbol(name);
    if (this.check(TOKEN.LPAREN)) {
      return this.callexpr(node);
    }
    if (this.match([TOKEN.ASSIGN])) {
      const value = this.expression();
      return ast.assign(name, value);
    }
    return node;
  }

  private callexpr(node: Sym): ASTNode {
    const parser = "[call-expression]: ";
    const err1 = parser + "Expected ‘(’";
    const err2 = parser + "Expected ‘)’";
    if (this.isVariableName(node.value)) {
      let rhs = this.group();
      return ast.binex(node, "*", rhs);
    }
    this.eat(TOKEN.LPAREN, err1);
    let params: ASTNode[] = [];
    if (!this.check(TOKEN.RPAREN)) {
      do {
        let param = this.expression();
        params.push(param);
      } while (this.match([TOKEN.COMMA]));
      this.eat(TOKEN.RPAREN, err2);
    } else this.eat(TOKEN.RPAREN, err2);
    return ast.callExpr(
      node.value,
      params,
      corelib.getFunction(node.value),
    );
  }

  private array() {
    let builder: "matrix" | "vector" = "vector";
    let elements: ASTNode[] = [];
    const parser = "[array]: ";
    const err1 = parser + "Expected ‘[’";
    this.eat(TOKEN.LBRACKET, err1);
    let element = this.expression();
    if (this.match([TOKEN.COLON])) {
      let rhs = this.expression();
      let step: ASTNode = ast.int("1");
      if (this.match([TOKEN.COLON])) {
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
    if (element instanceof Vector) {
      cols = element.len;
      rows += 1;
      builder = "matrix";
    }
    elements.push(element);
    const err3 = parser + "Matrices must only have vector elements.";
    const err4 = parser + "No jagged arrays permitted";
    while (this.match([TOKEN.COMMA])) {
      let expr = this.expression();
      if (builder === "matrix" && (!expr.isVector())) {
        this.panic(err3);
      }
      if (expr instanceof Vector) {
        builder = "matrix";
        rows += 1;
        if (cols !== expr.len) this.panic(err4);
      }
      elements.push(expr);
    }

    const err2 = parser + "Expected ‘]’";
    this.eat(TOKEN.RBRACKET, err2);
    return builder === "matrix"
      ? ast.matrix(elements as Vector[], rows, cols)
      : ast.vector(elements);
  }

  /**
   * Special handling for scientific numbers.
   * To simplify the type system, we convert
   * these numbers into a compound expression `a^b`,
   * where `a` is a `float` or `integer`.
   */
  private expand(lexeme: string) {
    const [a, b] = split(lexeme, "e");
    const left = is.integer(a) ? ast.int(a) : ast.float(a);
    const right = is.integer(b) ? ast.int(b) : ast.float(b);
    return ast.binex(left, "^", right);
  }

  /**
   * Returns true if any of the supplied
   * token types matches. False otherwise.
   * If a match is found, the next token
   * is requested from the lexer.
   */
  private match(tokenTypes: TOKEN[]) {
    if (this.error) return false;
    if (this.check(tokenTypes[0])) {
      this.advance();
      return true;
    }
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
    if (this.error || type === TOKEN.EOF) return false;
    return this.token.type === type;
  }

  get val() {
    const n = new Interpreter();
    const out = this.result.accept(n);
    return n.stringify(out);
  }

  toString(out: ASTNode) {
    const s = new ToString();
    return out.accept(s);
  }

  get ast() {
    if (this.error) {
      return this.error.value;
    }
    return tree(this.result, (node) => {
      if (node instanceof ASTNode) node.kind = node.nkind as any;
      if (node instanceof Tuple) node.value = node.value.array as any;
    });
  }

  private panic(messages: string) {
    const line = this.token.line;
    const plexeme = this.lastToken.lexeme;
    const ptypename = this.lastToken.typename;
    const lastNode = this.lastNode.nkind;
    const line0 = `Parsing Error:\n`;
    const line2 = `Line: ${line}\n`;
    const line3 = `Last lexeme parsed: A ${ptypename} “${plexeme}”\n`;
    const line4 = `Last semantic parsed: ${lastNode}\n`;
    const message = line0 + line2 + line3 + line4 + messages;
    this.error = ast.error(message);
    return this.error;
  }

  private eat(tokenType: TOKEN, message: string) {
    const token = this.token;
    if (token.type === TOKEN.EOF) {
      if (this.error) {
        return this.error.value;
      }
      const erm = `Abrupt end of input.`;
      this.error = ast.error(erm);
      this.panic(erm);
      return erm;
    }
    if (token.type !== tokenType) {
      this.panic(message);
      return message;
    }
    this.advance();
    return token.lexeme;
  }
  private advance() {
    if (this.token.type === TOKEN.ERROR) {
      this.panic(`[scanner]: ${this.token.lexeme}`);
      this.token = new Token(TOKEN.EOF, "", this.token.line);
      return this.token;
    }
    if (this.error) {
      this.scanner.init("");
      this.token = new Token(TOKEN.EOF, "", this.token.line);
      return this.token;
    }
    this.lastToken = this.token;
    this.token = this.scanner.getToken();
    this.idx = this.scanner.current;
    return this.lastToken;
  }

  compile() {
    return this.result.accept(this.compiler);
  }
}
