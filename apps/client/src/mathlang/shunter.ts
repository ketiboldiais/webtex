import { ToLatex } from "./ToLatex.js";
import { ToString } from "./ToString.js";
import { Compile, Runtimeval } from "./compiler.js";
import { Fn } from "./fn.js";
import { Interpreter } from "./interpreter.js";
import { Lexer } from "./lexer.js";
import { ast, ASTNode, Root, Sym, Vector } from "./nodes/index.js";
import { corelib } from "./scope.js";
import { PREC, TOKEN } from "./structs/enums.js";
import { Token } from "./structs/token.js";

export class Shunter {
  private prevToken: Token = Token.nil;
  private peek: Token = Token.nil;
  private scanner: Lexer = new Lexer();
  private source: string = "";
  private error: ASTNode = ast.nil;
  private lastNode: ASTNode = ast.nil;
  result: ASTNode = ast.nil;

  get strLex() {
    return ast.placeHolder(this.peek.lexeme);
  }

  private match(...tokenTypes: TOKEN[]) {
    if (!this.error.isNull()) return false;
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

  private init(src: string) {
    this.source = src;
    this.scanner.init(src);
    this.peek = this.scanner.getToken();
  }

  parse(expression: string) {
    this.init(expression);
    this.result = this.expr();
    return this;
  }

  private bracedExpr() {
    this.advance();
    return ast.nil;
  }
  private bracketExpr() {
    let builder: "matrix" | "vector" = "vector";
    let elements: ASTNode[] = [];
    this.eat(TOKEN.LBRACKET);
    let element = this.expr();
    let rows = 0;
    let cols = 0;
    if (element instanceof Vector) {
      cols = element.len;
      rows += 1;
      builder = "matrix";
    }
    elements.push(element);
    while (this.match(TOKEN.COMMA)) {
      let expr = this.expr();
      if (expr instanceof Vector) {
        builder = "matrix";
        rows += 1;
      }
      elements.push(expr);
    }
    this.eat(TOKEN.RBRACKET);
    return builder === "matrix"
      ? ast.matrix(elements as Vector[], rows, cols)
      : ast.vector(elements);
  }
  private group() {
    this.eat(TOKEN.LPAREN);
    const expr = this.expr(PREC.NON);
    this.eat(TOKEN.RPAREN);
    return ast.group(expr);
  }
  private call(node: Sym) {
    const name = node.value;
    this.eat(TOKEN.LPAREN);
    const params: ASTNode[] = [];
    if (!this.check(TOKEN.RPAREN)) {
      do {
        let param = this.expr();
        params.push(param);
      } while (this.match(TOKEN.COMMA) && !this.peek.isEOF);
      this.eat(TOKEN.RPAREN);
    }
    return ast.callExpr(name, params, corelib.getFunction(name));
  }
  private check(type: TOKEN) {
    if (!this.error.isNull() || type === TOKEN.EOF) return false;
    return this.peek.type === type;
  }
  private symbol() {
    const name = this.eat(TOKEN.SYMBOL);
    let node = ast.symbol(name.lexeme);
    if (this.check(TOKEN.LPAREN) || corelib.hasFunction(node.value)) {
      return this.call(node);
    }
    return node;
  }
  private literal() {
    if (this.peek.isSymbol) return this.symbol();
    const token = this.advance();
    const lex = token.lexeme;
    let newnode: ASTNode = ast.nil;
    switch (token.type) {
      case TOKEN.INT:
        newnode = ast.int(lex);
        break;
      case TOKEN.FLOAT:
        newnode = ast.float(lex);
        break;
      case TOKEN.OCTAL:
        newnode = ast.int(lex, 8);
        break;
      case TOKEN.HEX:
        newnode = ast.int(lex, 16);
        break;
      case TOKEN.BINARY:
        newnode = ast.int(lex, 2);
        break;
      case TOKEN.FRAC:
        newnode = ast.fraction(lex);
        break;
      case TOKEN.TRUE:
        newnode = ast.bool(true);
        break;
      case TOKEN.FALSE:
        newnode = ast.bool(false);
        break;
      case TOKEN.STRING:
        newnode = ast.string(lex);
        break;
      case TOKEN.COMPLEX:
        newnode = ast.complex(lex);
        break;
    }
    if (newnode.isNum() && this.peek.isSymbol) {
      if (this.isVariableName(this.peek.lexeme)) {
        const sym = this.advance();
        let rhs = ast.symbol(sym.lexeme);
        newnode = ast.binex(newnode, "*", rhs);
      }
      if (corelib.hasFunction(this.peek.lexeme)) {
        const sym = this.advance();
        const s = ast.symbol(sym.lexeme);
        let rhs = this.call(s);
        newnode = ast.binex(newnode, "*", rhs);
      }
    }
    if (this.peek.isLeftParen) {
      const rhs = this.group();
      newnode = ast.binex(newnode, "*", rhs);
    }
    this.lastNode = newnode;
    return newnode;
  }
  isVariableName(name: string) {
    return (!corelib.hasFunction(name) || corelib.hasConstant(name));
  }
  private expr(minbp: PREC = PREC.NON) {
    let lhs: ASTNode = ast.nil;
    if (!this.error.isNull()) return lhs;
    switch (true) {
      case this.peek.isAtomic:
        lhs = this.literal();
        break;
      case this.peek.isLeftParen:
        lhs = this.group();
        if (lhs.isGroup() && lhs.expression.isNum()) {
          const rhs = this.expr();
          lhs = ast.binex(lhs, "*", rhs);
        }
        if ((this.peek.isLeftParen) && !this.lastNode.isCallExpr()) {
          const rhs = this.group();
          lhs = ast.binex(lhs, "*", rhs);
        }
        break;
      case this.peek.isLeftBrace:
        lhs = this.bracedExpr();
        break;
      case this.peek.isLeftBracket:
        lhs = this.bracketExpr();
        break;
    }
    while (this.peek.isOperable && this.error.isNull()) {
      if (this.peek.isEOF) break;
      const op = this.peek;
      if (op.bp < minbp) break;
      this.advance();
      let rhs = this.expr(op.bp);
      lhs = this.makeExpr(lhs, op.lexeme, rhs);
    }
    return lhs;
  }
  private makeExpr(lhs: ASTNode, op: string, rhs: ASTNode) {
    let expr: ASTNode = ast.nil;
    switch (true) {
      case (!lhs.isNull() && !rhs.isNull()):
        expr = ast.binex(lhs, op, rhs);
        if (
          lhs.isNum() && rhs.isNum() && op === "/" && lhs.isInteger &&
          rhs.isInteger
        ) {
          const res = `${lhs.raw}/${rhs.raw}`;
          expr = ast.fraction(res);
        }
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
  private eat(tokenType: TOKEN) {
    const token = this.peek;
    if (token.type === TOKEN.EOF) {
      this.error = ast.string(token.lexeme);
    }
    if (token.type !== tokenType) {
      this.error = ast.string(token.lexeme);
    }
    this.advance();
    return token;
  }
  private advance() {
    this.prevToken = this.peek;
    this.peek = this.scanner.getToken();
    return this.prevToken;
  }
  get latex() {
    return this.result.accept(new ToLatex());
  }
  evaluate() {
    return this.result.accept(new Interpreter()).accept(new ToLatex());
  }
  strung() {
    return this.result.accept(new ToString());
  }
  compileFunction(body: string, params: string[]): string | Function {
    const args = params.map((s) => ast.symbol(s));
    const def = this.parse(body).result;
    const c = new Compile();
    const root = new Root([ast.funDeclaration("f", args, def)]);
    const { result, err } = root.accept(c) as Runtimeval;
    if (result instanceof Fn) {
      return (...as: any[]) => result.call(c, as);
    }
    if (err) return err;
    return `Invalid expression ${body}`;
  }
}

