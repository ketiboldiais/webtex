import {
  isAlpha,
  isDotDigit,
  StringNumType,
  verifyNumber,
} from "./stringfn.js";
import { TexTokenType, token } from "./enums.js";

export type NodeBuilder<A, B, C, D, E, F> = {
  number: (value: string, kind: StringNumType) => A;
  isNumber: (value: any) => boolean;
  string: (value: string) => B;
  isString: (value: any) => boolean;
  symbol: (value: string) => C;
  isSymbol: (value: any) => boolean;
  fn: (value: [C, ...(A | B | C | D | E | F)[]]) => D;
  isFn: (value: any) => boolean;
  list: (value: (A | B | C | D | E | F)[]) => E;
  nil: () => F;
  isList: (value: any) => boolean;
  isNil: (value: any) => boolean;
  functions: NamedDef;
  delimiters: OpDef[];
  operators: OpDef[];
  symbols: NamedDef;
};

export type TexToken = {
  type: number;
  subtype: string;
  lexeme: string;
  line: number;
  bp: number;
};

export type TexSymbol = {
  bp: number;
  latex: string;
};

type NamedDef = {
  [key: string]: {
    bp: number;
  };
};
export type TokenSpec = {
  delimiters: OpDef[];
  operators: OpDef[];
  symbols: NamedDef;
  functions: NamedDef;
};
export type OpDef = {
  pattern: RegExp;
  bp: number;
  lex?: string;
};

export interface Parslet<A, B, C, D, E, F> {
  result: A | B | C | D | E | F;
}
export class Parslet<A, B, C, D, E, F> {
  private source: string = "";
  private line: number = 0;
  private delimiters: OpDef[];
  private functions: NamedDef;
  private operators: OpDef[];
  private symbols: NamedDef;
  private index: number = -1;
  private isFunction(s: string) {
    return this.functions[s] !== undefined;
  }
  private get currentString() {
    return this.source.substring(this.index, this.len);
  }
  private isSymbol(t: string) {
    return this.symbols[t] !== undefined;
  }
  private newToken(
    t: TexTokenType,
    subtype: string,
    lex?: string,
    bp = 1,
  ): TexToken {
    const lexeme = lex !== undefined ? lex : this.currentString;
    const line = this.line;
    const out = this.makeToken(t, subtype, lexeme, line, bp);
    return out;
  }
  private get atEnd() {
    return this.index >= this.len;
  }
  private get char() {
    return this.currentString[0];
  }
  private skipSpace() {
    while (!this.atEnd) {
      const c = this.char;
      switch (c) {
        case " ":
        case "\r":
        case "\t":
          this.index++;
          break;
        case "\n":
          this.line++;
          this.index++;
          break;
        default:
          return;
      }
    }
  }
  private errorToken(message: string) {
    return this.newToken("error", "error", message, 0);
  }
  private makeToken(
    tokenType: TexTokenType,
    subtype: string,
    lexeme: string,
    line = 0,
    bp = 0,
  ): TexToken {
    return { type: token[tokenType], subtype, lexeme, line, bp };
  }
  tokenize(src: string) {
    const out: any[] = [];
    this.initState(src);
    while (this.peek.type !== token.eof) {
      out.push(this.peek);
      this.advance();
    }
    return out;
  }

  private getToken() {
    if (this.atEnd) return this.newToken("eof", "eof", "EOF", 0);
    this.skipSpace();
    for (let i = 0; i < this.operators.length; i++) {
      const rule = this.operators[i];
      const res = rule.pattern.exec(this.currentString);
      if (res !== null) {
        this.index += res[0].length;
        return this.newToken("func", "func", res[0], rule.bp);
      }
    }
    for (let i = 0; i < this.delimiters.length; i++) {
      const rule = this.delimiters[i];
      const res = rule.pattern.exec(this.currentString);
      if (res !== null) {
        this.index += res[0].length;
        return this.newToken("delimiter", res[0], res[0], rule.bp);
      }
    }
    if (isDotDigit(this.char)) {
      const res = verifyNumber(this.currentString);
      if (res.kind !== "unknown") {
        this.index += res.num.length;
        return this.newToken("number", res.kind, res.num, 0);
      }
      return this.errorToken(`Unknown numeric format.`);
    }
    if (this.char === `"`) {
      let c = this.char;
      this.index++;
      while (this.char !== `"` && this.index < this.len) {
        c += this.source[this.index];
        this.index++;
      }
      if (this.char === `"`) {
        c += this.char;
        this.index++;
      } else return this.errorToken("Unterminated string");
      return this.newToken("string", c);
    }
    if (isAlpha(this.char)) {
      let text = "";
      while (isAlpha(this.char) && (this.index) < this.len) {
        text += this.source[this.index];
        this.index++;
      }
      if (this.isFunction(text)) {
        const tk = this.functions[text];
        return this.newToken("func", "func", text, tk.bp);
      } else if (this.isSymbol(text)) {
        const tk = this.symbols[text];
        return this.newToken("symbol", "symbol", text, tk.bp);
      } else return this.newToken("symbol", "symbol", text);
    }
    this.index++;
    return this.errorToken("Unknown token.");
  }
  private initState(source: string) {
    this.source = source;
    this.len = source.length;
    this.line = 1;
    this.index = 0;
    this.advance();
  }
  private len: number = 0;
  private peek: TexToken = this.makeToken("nil", "util", "", -1);
  private prevtoken: TexToken = this.makeToken("nil", "util", "", -1);
  private node: NodeBuilder<A, B, C, D, E, F>;
  private error: string | null = null;
  constructor(nodes: NodeBuilder<A, B, C, D, E, F>) {
    this.node = nodes;
    this.delimiters = nodes.delimiters;
    this.symbols = nodes.symbols;
    this.operators = nodes.operators;
    this.functions = nodes.functions;
  }

  parse(source: string): A | B | C | D | E | F {
    this.initState(source);
    this.result = this.expression();
    return this.result;
  }

  private isVariableName(tkn: TexToken) {
    return isAlpha(tkn.lexeme) && tkn.type === token.symbol &&
      this.functions[tkn.lexeme] === undefined;
  }

  private parend() {
    this.eat("delimiter");
    let expr = this.expression(0);
    this.eat("delimiter");
    const op = this.node.symbol("*");
    if (this.isVariableName(this.peek)) {
      const rhs = this.expression(0);
      expr = this.node.fn([op, expr, rhs]);
    }
    while (this.peek.lexeme === "(") {
      this.eat("delimiter");
      let rhs = this.expression(0);
      this.eat("delimiter");
      expr = this.node.fn([op, expr, rhs]);
    }
    return expr;
  }

  private isOpToken(tkn: TexToken) {
    return tkn.type === token.func;
  }

  private bracketed() {
    this.eat("delimiter");
    let list: (A | B | C | D | E | F)[] = [this.expression(0)];
    while (this.match(",")) {
      list.push(this.expression(0));
    }
    this.eat("delimiter");
    return this.node.list(list);
  }

  private match(expected: string) {
    if (this.error || this.peek.lexeme !== expected) {
      return false;
    }
    this.advance();
    return true;
  }

  private expression(minbp = 0): A | B | C | D | E | F {
    if (this.error !== null) return this.node.string(this.error);
    let lhs: A | B | C | D | E | F = this.node.nil();
    switch (true) {
      case this.peek.lexeme === "[":
        lhs = this.bracketed();
        break;
      case this.peek.lexeme === "(":
        lhs = this.parend();
        break;
      case this.peek.type === token.string:
        lhs = this.string();
        break;
      case this.peek.type === token.number:
        lhs = this.number();
        break;
      case this.peek.type === token.func:
        lhs = this.call();
        break;
      case this.peek.type === token.symbol:
        lhs = this.symbol();
        break;
    }
    while (this.isOpToken(this.peek)) {
      if (this.peek.type === token.eof) break;
      const op = this.peek;
      if (op.bp < minbp) break;
      this.advance();
      let rhs = this.expression(op.bp);
      lhs = this.node.fn([this.node.symbol(op.lexeme), lhs, rhs]);
    }
    return lhs;
  }

  private call() {
    const tkn = this.eat("func");
    if (this.peek.lexeme === "(") this.advance();
    if (this.peek.lexeme === "^") {
      const fn = this.node.symbol(tkn.lexeme);
      const pow = this.advance();
      let exponent: A | B | C | D | E | F = this.node.nil();
      if (this.peek.type === token.number) {
        const n = this.advance();
        exponent = this.node.number(n.lexeme, n.subtype as any);
      } else if (this.peek.type === token.symbol) {
        const s = this.advance();
        exponent = this.node.symbol(s.lexeme);
      } else exponent = this.expression(0);
      let exp = this.expression(100);
      const op = this.node.symbol(pow.lexeme);
      const res = this.node.fn([op, this.node.fn([fn, exp]), exponent]);
      return res;
    }
    const expr = this.expression(0);
    const sym = this.node.symbol(tkn.lexeme);
    if (this.peek.lexeme === ")") this.advance();
    return this.node.fn([sym, expr]);
  }

  private symbol() {
    const tkn = this.eat("symbol");
    let node: A | B | C | D | E | F = this.node.symbol(tkn.lexeme);
    if (this.peek.lexeme === "(") {
      let rhs = this.parend();
      const op = this.node.symbol("*");
      node = this.node.fn([op, node, rhs]);
    }
    return node;
  }

  private string() {
    const res = this.eat("string");
    return this.node.string(res.lexeme);
  }
  private number() {
    const res = this.eat("number");
    let node: A | B | C | D | E | F = this.node.number(
      res.lexeme,
      res.subtype as StringNumType,
    );
    if (this.peek.type === token.symbol) {
      const sym = this.advance();
      const node2 = this.node.symbol(sym.lexeme);
      node = this.node.fn([this.node.symbol("*"), node, node2]);
    }
    if (this.peek.lexeme === "(") {
      const rhs = this.parend();
      node = this.node.fn([this.node.symbol("*"), node, rhs]);
    }
    return node;
  }

  private eat(type: TexTokenType) {
    const tk = this.peek;
    const res = this.advance();
    return res;
  }

  private advance() {
    this.prevtoken = this.peek;
    this.peek = this.getToken();
    return this.prevtoken;
  }
}
