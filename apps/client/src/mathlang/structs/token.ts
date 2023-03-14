import { FIX, KIND, NUM_TOKEN, numerics, TOKEN, TokenRecord } from "./enums.js";
import { corelib } from "../scope.js";

export interface Token {
  type: TOKEN;
  lexeme: string;
  line: number;
  latex: string;
}

export class Token {
  constructor(type: TOKEN, lexeme: string, line: number, latex = lexeme) {
    this.type = type;
    this.lexeme = lexeme;
    this.line = line;
    this.latex = latex;
  }
  get isNativeSymbol() {
    return corelib.hasConstant(this.lexeme);
  }
  get isNativeFunction() {
    return corelib.hasFunction(this.lexeme);
  }
  setLatex(latex: string) {
    this.latex = latex;
    return this;
  }
  get isSemicolon() {
    return this.type === TOKEN.SEMICOLON;
  }
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
    return !this.isEOF && !this.isSemicolon && !this.isDelimiter &&
      this.type !== TOKEN.ASSIGN;
  }
  get isOperator() {
    return this.isInfix ||
      this.isPostfix ||
      this.isPrefix ||
      this.isMixfix;
  }
  isLeftOf(op2:Token) {
    return this.isLeftAssociative && this.bp <= op2.bp;
  }
  isRightOf(op2:Token) {
    return this.isRightAssociative && this.bp < op2.bp;
  }
  get isChainAssociative() {
    return TokenRecord[this.type].fixity === FIX.CHAIN;
  }
  get isLeftAssociative() {
    return TokenRecord[this.type].fixity === FIX.LEFT;
  }
  get isRightAssociative() {
    return TokenRecord[this.type].fixity === FIX.RIGHT;
  }
  get isDelimiter() {
    return TokenRecord[this.type].kind === KIND.DELIM;
  }
  get isComma() {
    return this.type === TOKEN.COMMA;
  }
  get isEOF() {
    return this.type === TOKEN.EOF;
  }
  get bp() {
    return TokenRecord[this.type].prec;
  }
  get isVbar() {
    return this.type === TOKEN.VBAR;
  }
  get isRightBrace() {
    return this.type === TOKEN.RBRACE;
  }
  get isLeftBrace() {
    return this.type === TOKEN.LBRACE;
  }
  get isLeftParen() {
    return this.type === TOKEN.LPAREN;
  }
  get isKeyword() {
    return TokenRecord[this.type].kind === KIND.KEYWORD ||
      TokenRecord[this.type].kind === KIND.ILLEGAL;
  }
  get isRightParen() {
    return this.type === TOKEN.RPAREN;
  }
  get isLeftBracket() {
    return this.type === TOKEN.LBRACKET;
  }
  get isRightBracket() {
    return this.type === TOKEN.RBRACKET;
  }
  get isSymbol() {
    return this.type === TOKEN.SYMBOL;
  }
  static nil = new Token(TOKEN.NIL, "", -1);
  toString(linePad = 0, lexPad = 2, typePad = 0) {
    const lex = `${this.lexeme}`.padEnd(lexPad);
    const line = `${this.line}`.padEnd(linePad);
    const type = `${this.typename}`.padEnd(typePad);
    return `(${line})[ ${lex}][${type}]`;
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
