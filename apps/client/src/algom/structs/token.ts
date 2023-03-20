import { KIND, NUM_TOKEN, numerics, TOKEN, TokenRecord } from "./enums.js";

export interface Token {
  type: TOKEN;
  lexeme: string;
}

export class Token {
  constructor(type: TOKEN, lexeme: string) {
    this.type = type;
    this.lexeme = lexeme;
  }
  is(type: TOKEN) {
    return this.type === type;
  }
  static EOF = new Token(TOKEN.EOF, "");
  get typename() {
    return TOKEN[this.type].replace("_", "-").toLowerCase();
  }
  get isNumber() {
    return numerics[this.type as NUM_TOKEN] !== undefined;
  }
  get isIllegal() {
    return TokenRecord[this.type].kind === KIND.ILLEGAL;
  }
  get isPrefix() {
    return TokenRecord[this.type].kind === KIND.PREFIX;
  }
  get isPostfix() {
    return TokenRecord[this.type].kind === KIND.POSTFIX;
  }
  get isInfix() {
    return TokenRecord[this.type].kind === KIND.INFIX;
  }
  get isMixfix() {
    return TokenRecord[this.type].kind === KIND.MIXFIX;
  }
  get isAtomic() {
    return TokenRecord[this.type].kind === KIND.ATOMIC;
  }
  get isOperable() {
    return this.type !== TOKEN.EOF && (this.type !== TOKEN.SEMICOLON) &&
      !this.isDelimiter &&
      this.type !== TOKEN.ASSIGN;
  }
  get isOperator() {
    return this.isInfix ||
      this.isPostfix ||
      this.isPrefix ||
      this.isMixfix;
  }
  get isDelimiter() {
    return TokenRecord[this.type].kind === KIND.DELIM;
  }
  get bp() {
    return TokenRecord[this.type].prec;
  }
  get isKeyword() {
    return TokenRecord[this.type].kind === KIND.KEYWORD ||
      TokenRecord[this.type].kind === KIND.ILLEGAL;
  }
  static nil = new Token(TOKEN.NIL, "");
  toString(lexPad = 2, typePad = 0) {
    const lex = `${this.lexeme}`.padEnd(lexPad);
    const type = `${this.typename}`.padEnd(typePad);
    return `[${lex}][${type}]`;
  }
}

export class TokenStream {
  tokens: Token[];
  length: number;
  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.length = tokens.length;
  }
  toString() {
    let str = "";
    for (let i = 0; i < this.length; i++) {
      str += this.tokens[i].toString() + `\n`;
    }
    return str;
  }
}
