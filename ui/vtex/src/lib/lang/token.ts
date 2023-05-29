export const _ = null;
export const safe = <T>(fallback: T, current?: T | null): T => (
  current === undefined || current === null ? fallback : current
);
export enum tkn {
  nil,
  eof,
  error,
  unknown,

  /**
   * Lexeme: `;`
   */
  semicolon,

  /**
   * Lexeme: `,`
   */
  comma,

  /**
   * Lexeme: `.`
   */
  dot,

  /**
   * Lexeme: `:`
   */
  colon,

  /**
   * Lexeme: `(`
   */
  left_paren,

  /**
   * Lexeme: `)`
   */
  right_paren,

  /**
   * Lexeme: `[`
   */
  left_bracket,

  /**
   * Lexeme: `]`
   */
  right_bracket,

  /**
   * Lexeme: `{`
   */
  left_brace,
  /**
   * Lexeme: `}`
   */
  right_brace,
  /**
   * Lexeme: `!`
   */
  bang,
  /**
   * Lexeme: `=`
   */
  eq,
  /**
   * Lexeme: `!=`
   */
  neq,
  /**
   * Lexeme: `==`
   */
  deq,
  /**
   * Lexeme: `+`
   */
  plus,
  /**
   * Lexeme: `-`
   */
  minus,
  /**
   * Lexeme: `*`
   */
  star,

  /**
   * Lexeme: `%`
   */
  percent,

  /**
   * Lexeme: `^`
   */
  caret,

  /**
   * Lexeme: `/`
   */
  slash,

  /**
   * Lexeme: `<`
   */
  lt,

  /**
   * Lexeme: `<=`
   */
  leq,

  /**
   * Lexeme: `>`
   */
  gt,

  /**
   * Lexeme: `>=`
   */
  geq,

  string,
  integer,
  float,
  hex,
  binary,
  octal,
  scinum,
  symbol,

  let,
  print,
  fn,
  rem,
  mod,
  div,
  sqrt,
  not,
  and,
  nand,
  or,
  nor,
  xor,
  xnor,
  struct,
  for,
  while,
  is,
  return,
  true,
  false,
  inf,
  nan,
  null,
  if,
  else,
  texcode,
}

export type $Token = {
  type: string;
  lexeme: string;
  column: number;
  line: number;
};

export class Token {
  _type: tkn;
  _lexeme: string;
  _column: number;
  _line: number;
  constructor(
    type: tkn,
    lexeme: string,
    column: number,
    line: number,
  ) {
    this._type = type;
    this._lexeme = lexeme;
    this._column = column;
    this._line = line;
  }
  json(): $Token {
    const type = tkn[this._type];
    const lexeme = this._lexeme;
    const column = this._column;
    const line = this._line;
    return ({ type, lexeme, column, line });
  }
  among(...types: tkn[]) {
    for (let i = 0; i < types.length; i++) {
      const type = types[i];
      if (this._type === type) return true;
    }
    return false;
  }
  is(type: tkn) {
    return this._type === type;
  }
  isnt(type: tkn) {
    return this._type !== type;
  }
  lex(lexeme: string) {
    if (this._lexeme) return this;
    return this.lexeme(lexeme);
  }
  lexeme(lexeme: string) {
    return this.clone(_, lexeme);
  }
  column(column: number) {
    return this.clone(_, _, column);
  }
  line(line: number) {
    return this.clone(_, _, _, line);
  }
  type(type: tkn) {
    return this.clone(type);
  }
  clone(
    type: tkn | null = null,
    lexeme: string | null = null,
    column: number | null = null,
    line: number | null = null,
  ) {
    return new Token(
      safe(this._type, type),
      safe(this._lexeme, lexeme),
      safe(this._column, column),
      safe(this._line, line),
    );
  }
  herald() {
    const L = this._line;
    const C = this._column;
    return `On line ${L}, column ${C}:`
  }
  map<T>(f: (t: Token) => T) {
    return f(this.clone());
  }
  match(type: tkn, f: (t: Token) => Token) {
    if (this._type === type) {
      return f(this.clone());
    }
    return this;
  }
}

export const token = (
  type: tkn = tkn.nil,
  lexeme: string = "",
  column: number = 0,
  line: number = 0,
) => new Token(type, lexeme, column, line);
