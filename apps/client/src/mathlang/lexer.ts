import { Keyword, keywords, NUM_TOKEN, TOKEN } from "./structs/enums.js";
import { isAlpha } from "./structs/stringfn.js";
import { Token, TokenStream } from "./structs/token.js";

export interface Lexer {
  source: string;
  start: number;
  current: number;
  prevToken: Token;
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
    this.prevToken = Token.nil;
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
    this.prevToken = out;
    return out;
  }
  private get peek() {
    return this.source[this.current];
  }
  private peekNext(by: number = 1): string {
    if (this.atEnd) return "";
    return this.source[this.current + by];
  }
  private advance() {
    this.current++;
    const out = this.source[this.current - 1];
    return out;
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
    if (isAlpha(c)) return this.identifier();
    if (this.isDigit(c)) {
      this.numtype = TOKEN.INT;
      return this.number();
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
          this.isDigit(this.peek) && !this.prevToken.isNumber &&
          !this.prevToken.isSymbol
        ) {
          this.advance();
          this.numtype = TOKEN.INT;
          return this.number();
        }
        if (this.prevToken.isNumber || this.prevToken.isSymbol) {
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
        if (this.isDigit(this.peek)) {
          this.advance();
          const tk = this.number();
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
        return this.string;
    }

    return this.errorToken(`Unrecognized token “${c}”`);
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
      if (this.peek === "/") this.numtype = TOKEN.FRAC;
      this.advance();
      while (this.isDigit(this.peek)) this.advance();
    }
    if (this.seesScientific) {
      this.advance();
      this.scientific;
    }
    if (
      this.peek === ("i") &&
      (!isAlpha(this.peekNext()))
    ) {
      this.advance();
      this.numtype = TOKEN.COMPLEX;
    }
    return this.numberToken;
  }
  get numberToken() {
    return this.token(this.numtype);
  }
  private get scientific() {
    this.advance();
    this.number();
    this.numtype = TOKEN.SCINUM;
    return this.numberToken;
  }
  private get binary() {
    while (this.peek === "0" || this.peek === "1") {
      this.advance();
    }
    this.numtype = TOKEN.BINARY;
    return this.numberToken;
  }
  private get octal() {
    while ("0" <= this.peek && this.peek <= "7") {
      this.advance();
    }
    this.numtype = TOKEN.OCTAL;
    return this.numberToken;
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
    this.numtype = TOKEN.HEX;
    return this.numberToken;
  }
  private isDigit(c: string) {
    return c >= "0" && c <= "9";
  }
  private identifier() {
    while (isAlpha(this.peek) || this.isDigit(this.peek)) {
      this.advance();
    }
    const remaining = this.source.substring(this.start, this.current);
    if (keywords.hasOwnProperty(remaining)) {
      const type = keywords[remaining as Keyword];
      return this.token(type);
    }
    return this.token(TOKEN.SYMBOL);
  }
  private get string() {
    while (this.peek !== `"` && !this.atEnd) {
      if (this.peek === `\n`) this.line += 1;
      this.advance();
    }
    if (this.atEnd) return this.errorToken(`Unterminated string.`);
    this.advance();
    return this.token(TOKEN.STRING, "atom");
  }
  private match(expected: string) {
    if (this.atEnd) return false;
    if (this.source[this.current] !== expected) return false;
    this.current += 1;
    return true;
  }
  get nextChar() {
    return this.source[this.start + 1];
  }
  get previousChar() {
    return this.source[this.current - 1];
  }

  static tokenize(source: string): TokenStream {
    let out: Token[] = [];
    const lexer = new Lexer();
    lexer.init(source);
    let token = Token.nil;
    while (!token.isEOF) {
      token = lexer.getToken();
      out.push(token);
      if (token.type === TOKEN.EOF) break;
    }
    return new TokenStream(out);
  }
}
