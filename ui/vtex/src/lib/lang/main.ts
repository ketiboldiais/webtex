import { Either, Left, left, Right, right } from "./aux/either.js";
import { range } from "./aux/looper.js";
import { box } from "./aux/maybe.js";
import { mod, percent, rem } from "./core/count.js";
import { Stack } from "./core/stack.js";
// import { Env, isEnvError } from "./env.js";
import { ErrorReport, expectedError, mutError } from "./error.js";
import { ASTNode } from "./nodes/abstract.node.js";
import { Assign, assignment } from "./nodes/assignment.node.js";
import { BinaryExpression, binex } from "./nodes/binex.node.js";
import { Block, block } from "./nodes/block.node.js";
import { Bool, falseNode, trueNode } from "./nodes/bool.node.js";
import { Call, call } from "./nodes/call.node.js";
import { cond, Conditional } from "./nodes/cond.node.js";
import { fnDef, FunctionDeclaration } from "./nodes/function.node.js";
import { Loop, loop } from "./nodes/loop.node.js";
import { isNilNode, Nil, nilNode } from "./nodes/nil.node.js";
import {
  binary,
  hex,
  inf,
  int,
  nan,
  Num,
  octal,
  real,
} from "./nodes/number.node.js";
import { PrintNode, printnode } from "./nodes/print.node.js";
import { Str, str } from "./nodes/string.node.js";
import { isSymbolNode, Sym, sym } from "./nodes/symbol.node.js";
import { Tuple } from "./nodes/tuple.node.js";
import { unary, UnaryExpression } from "./nodes/unary.node.js";
import {
  constantDef,
  varDef,
  VariableDeclaration,
} from "./nodes/variable.node.js";
import { Vector, vector } from "./nodes/vector.node.js";
import { Visitor } from "./nodes/visitor.definition.js";
import { isLatinGreek } from "./utils.js";
import { isDigit, print } from "./utils.js";

export const parserError = (
  message: string,
  token: Token,
) =>
  new ErrorReport(
    token.Line,
    token.Column,
    message,
    "Parser Error",
  );
export const scannerError = (
  message: string,
  token: Token,
) =>
  new ErrorReport(
    token.Line,
    token.Column,
    message,
    "Scanning Error",
  );

export enum tt {
  // § Utility Tokens
  eof,
  nil,
  error,
  print,

  // § Delimiter Tokens
  /**
   * ### Lexeme: `(`
   * This token type must always be accompanied
   * by its sibling {@link tt.right_paren}.
   */
  left_paren,

  /**
   * ### Lexeme: `)`
   * This token type must always be accompanied
   * by its sibling {@link tt.left_paren}.
   */
  right_paren,

  /**
   * ### Lexeme: `{`
   * This token type must always be accompanied
   * by its sibling {@link tt.right_brace}.
   */
  left_brace,

  /**
   * ### Lexeme: `}`
   * This token type must always be accompanied
   * by its sibling {@link tt.left_brace}.
   */
  right_brace,

  /**
   * ### Lexeme: `[`
   * This token type must always be accompanied
   * by its sibling {@link tt.right_bracket}.
   */
  left_bracket,

  /**
   * ### Lexeme: `]`
   * This token type must always be accompanied
   * by its sibling {@link tt.left_bracket}.
   */
  right_bracket,

  /**
   * ### Lexeme: `,`
   * This is a strict delimiter.
   */
  comma,

  /**
   * ### Lexeme: `;`
   * - This is a strict delimiter.
   */
  semicolon,

  /**
   * ### Lexeme: `.`
   * This is a contextual token type.
   */
  dot,

  // § Infix operator tokens
  /**
   * ### Lexeme: `-`
   * A token type indicating either the unary `-`
   * (numeric negation) or the binary `-`
   * (numeric subtraction).
   *
   * @example
   * ~~~
   * 3 - 1 // reduces to 2
   * -5 // reduces to -5
   * --10 // reduces to 10
   * ~~~
   */
  minus,

  /**
   * ### Lexeme: `+`
   * A token type indicating either the unary `+`
   * (numeric positivization) or the binary `+`
   * (numeric addition).
   *
   * @example
   * ~~~
   * 5 + 2 // reduces to 7
   * +8 // reduces to 8
   * +-8 // reduces to -8
   * ~~~
   */
  plus,

  /**
   * ### Lexeme: `++`
   * A token type indicating the postfix `++`
   * (increment).
   *
   * @example
   * ~~~
   * let x = 2;
   * x++ // x = 3
   * ~~~
   */
  plus_plus,

  /**
   * ### Lexeme: `--`
   * A token type indicating the postfix `--`
   * (increment).
   *
   * @example
   * ~~~
   * let x = 2;
   * x-- // x = 1;
   * ~~~
   */
  minus_minus,

  /**
   * ### Lexeme: `/`
   * A token type indicating the
   * binary `/` (numeric division).
   *
   * __Cross References__.
   * 1. _See also_ {@link tt.NaN}.
   *
   * @example
   * ~~~
   * 4/2 // reduces to 2
   * -5/2 // reduces to -2.5
   * 5/0 // reduces to NaN
   * ~~~
   */
  slash,

  /**
   * ### Lexeme: `*`
   * A token type indicating the
   * binary `*` (numeric multiplication).
   *
   * @example
   * ~~~
   * 12 * 2 // reduces to 24
   * -9 * 3 // reduces to -27
   * ~~~
   */
  star,

  /**
   * ### Lexeme: `!`
   * A token type indicating the
   * operator `!` (factorial).
   *
   * __Cross References__.
   * 1. _See also_ {@link tt.NaN}.
   *
   * @example
   * ~~~
   * 3! // reduces to 6
   * -2! // reduces to NaN
   * ~~~
   */
  bang,

  /**
   * ### Lexeme: `=`
   * A token type indicating the
   * binary operator `=` (assignment).
   *
   * __Cross References__.
   * 1. _See also_ {@link tt.let}.
   * 2. _See also_ {@link tt.var}.
   *
   * @example
   * ~~~
   * let x = 2; // reduces to 2 (immutable variable)
   * let var y = 3; // reduces 3 (mutable variable)
   * fn f(x) = x^2 // reduces to true (function declaration)
   * ~~~
   */
  eq,

  /**
   * ### Lexeme: `!=`
   * A token type indicating the
   * binary operator `!=` (inequality).
   *
   * @example
   * ~~~
   * let x = 2; // reduces to 2 (immutable variable)
   * let y = 3; // reduces to 3 (immutable variable)
   * x != y // reduces to true
   * ~~~
   */
  neq,

  /**
   * ### Lexeme: `==`
   * A token type indicating the
   * binary operator `==` (strict equality).
   *
   * @example
   * ~~~
   * let x = 2; // reduces to 2 (immutable variable)
   * let y = 3; // reduces to 3 (immutable variable)
   * let z = 2;
   * x == y // reduces to false
   * x == z // reduces to true
   * ~~~
   */
  deq,

  /**
   * ### Lexeme: `>`
   * A token type indicating the
   * binary relational operator `>`
   * (the is-greater-than relation).
   *
   * @example
   * ~~~
   * let x = 2; // reduces to 2 (immutable variable)
   * let y = 3; // reduces to 3 (immutable variable)
   * let z = 2;
   * x > y // reduces to false
   * x > z // reduces to false
   * y > x // reduces to true
   * ~~~
   */
  gt,

  /**
   * ### Lexeme: `>=`
   * A token type indicating the
   * binary relational operator `>`
   * (the is-greater-than-or-equal-to relation).
   *
   * @example
   * ~~~
   * let x = 2; // reduces to 2 (immutable variable)
   * let y = 3; // reduces to 3 (immutable variable)
   * let z = 2;
   * x >= y // reduces to false
   * x >= z // reduces to true
   * y >= x // reduces to true
   * ~~~
   */
  geq,

  /**
   * ### Lexeme: `<`
   * A token type indicating the
   * binary relational operator `<`
   * (the is-less-than relation).
   *
   * @example
   * ~~~
   * let x = 2; // reduces to 2 (immutable variable)
   * let y = 3; // reduces to 3 (immutable variable)
   * let z = 2;
   * x < y // reduces to true
   * x < z // reduces to false
   * y < x // reduces to false
   * ~~~
   */
  lt,

  /**
   * ### Lexeme: `<=`
   * A token type indicating the
   * binary relational operator `<`
   * (the is-less-than-or-equal-to relation).
   *
   * @example
   * ~~~
   * let x = 2; // reduces to 2 (immutable variable)
   * let y = 3; // reduces to 3 (immutable variable)
   * let z = 2;
   * x <= y // reduces to true
   * x <= z // reduces to true
   * y <= x // reduces to false
   * ~~~
   */
  leq,

  /**
   * ### Lexeme: `^`
   * A token type indicating the
   * binary arithmetic operator `<`
   * (exponentiation).
   *
   * @example
   * ~~~
   * 2^2 // reduces to 4
   * 2^2+1 // reduces to 8 (exponentiation is right-associative)
   * -3^2 // reduces to 9
   * ~~~
   */
  caret,

  /**
   * ### Lexeme: `%`
   * A token type indicating the
   * percentage operator `%` (this
   * returns the percentage of a number,
   * not the remainder, as is the case
   * in other languages).
   *
   * __Cross-References__.
   * 1. For the signed remainder, _see_ {@link tt.rem}.
   * 2. For the modulo operator, _see_ {@link tt.mod}.
   *
   * @example
   * ~~~
   * 2 % 4 // reduces to 0.08
   * 10 % 16.25 // reduces to 1.625
   * ~~~
   */
  percent,

  /**
   * ### Lexeme: `rem`
   * A token type indicating
   * the binary operator `rem` (the
   * signed remainder operator). This is
   * equivalent to the `%` in other languages.
   *
   * __Cross-References__.
   * 1. _See also_ {@link tt.percent} (describing the
   *   the operator `%`).
   * 2. For the modulo operator, _see_ {@link tt.mod}.
   *
   * @example
   * ~~~
   * (-13) rem 64 // reduces to -13 (not 51)
   * ~~~
   */
  rem,

  /**
   * ### Lexeme: `mod`
   * A token type indicating the binary
   * operator `mod` (the modulo operator).
   *
   * Where `a` and `b` are integers, this operator
   * is equivalent to writing:
   *
   * ~~~js
   * ((a % b) + b) % b
   * ~~~
   *
   * in a language where the glyph `%` maps
   * to a signed remainder operator (e.g., in
   * JavaScript, C, C++, etc.)
   *
   * __Cross-References__.
   * 1. _See also_ {@link tt.percent} (describing the
   *   the operator `%`).
   * 2. For the modulo operator, _see_ {@link tt.mod}.
   *
   * @example
   * ~~~
   * (-13) mod 64 // reduces to 51 (not -13)
   * 5 mod 22 // reduces to 5
   * 2 mod 22 // reduces to 20
   * ~~~
   */
  mod,

  // § Complex Assignments
  /**
   * ### Lexeme: `+=`
   * Complex assignment of add and assign.
   *
   * @example
   * ~~~
   * let a = 12;
   * a += 5; // a -> 17
   * ~~~
   */
  plus_equals,

  /**
   * ### Lexeme: `-=`
   * Complex assignment of minus and assign.
   *
   * @example
   * ~~~
   * let a = 10;
   * a -= 5; // a -> 5
   * ~~~
   */
  minus_equals,

  /**
   * ### Lexeme: `/=`
   * Complex assignment of power and assign.
   *
   * @example
   * ~~~
   * let a = 10;
   * a ^= 2; // a -> 100
   * ~~~
   */
  caret_equals,

  /**
   * ### Lexeme: `/=`
   * Complex assignment of multiply and assign.
   *
   * @example
   * ~~~
   * let a = 20;
   * a *= 5; // a -> 100
   * ~~~
   */
  star_equals,

  /**
   * ### Lexeme: `/=`
   * Complex assignment of divide and assign.
   *
   * @example
   * ~~~
   * let a = 20;
   * a /= 5; // a -> 4
   * ~~~
   */
  slash_equals,

  // § Literal Tokens
  int,
  float,
  hex,
  binary,
  octal,
  symbol,
  string,
  Inf,
  NaN,

  /**
   * ### Lexeme: `let`
   * A token type mapping to
   * the keyword `let` (indicating
   * a variable declaration). Note
   * that variables in Writ are
   * immutable by default.
   *
   * __Cross References__.
   * 1. Mutable variables are indicated by the
   *    keyword `var`. _See_ {@link tt.var}.
   *
   * @example
   * ~~~
   * let x = 2; // reduces to 2 (immutable variable)
   * ~~~
   */
  let,

  /**
   * ### Lexeme: `fn`
   * A token type mapping to
   * the keyword `fn` (indicating
   * a function declaration). Function
   * declarations always default to reducing
   * to `true` at runtime. The assignment
   * operator `=` must always follow
   * the parameter list.
   *
   * @example
   * ~~~
   * fn f(x) = x^2;
   * fn h(x,y) = {
   *   (x/2) + (y/2);
   * }
   * ~~~
   */
  fn,

  /**
   * ### Lexeme: `var`
   * A token type mapping to
   * the keyword `var` (indicating
   * a mutable variable).
   *
   * @example
   * ~~~
   * let var x = 2; // reduces to 2
   * ~~~
   */
  var,
  not,
  and,
  or,
  if,
  else,
  false,
  true,
  class,
  super,
  this,
  for,
  while,
  return,
  null,
}

/**
 * Consider the expression
 *
 * ~~~
 * 1 + 2 * 3
 * ~~~
 *
 * This generates the following token stream:
 *
 * ~~~
 * [int, plus, int, star, int]
 * ~~~
 *
 * There are two possible trees we can generate fom this stream.
 * Either:
 *
 * ~~~
 *   plus
 *  /    \
 * 1     star
 *      /    \
 *     2      3
 * ~~~
 *
 * Or:
 *
 * ~~~
 *      star
 *     /    \
 *   plus    3
 *  /    \
 * 1      2
 * ~~~
 *
 * We want to avoid this ambiguity. We can resolve
 * this ambiguity through a technique called
 * _Pratt parsing_. The idea:
 *
 * 1. For any given operator `f`, there exists a value
 *    called a _binding power_, which we denote as `BP(f)`.
 * 2. Given two operators `f1` and `f2`, if `BP(f1) < BP(f2)`,
 *    then we say that _`f2` has higher precedence than `f1`_ (and
 *    conversely, that _`f1` has lower precedence than `f2`_).
 *
 * This handles the cases for the strictly-ordered relations `<` and
 * `>`. But what happens if `BP(f1) = BP(f2)`? For example, it’s
 * perfectly reasonable to write:
 * ~~~
 * 2 + 5 + 8
 * ~~~
 * For such expressions, we rely on _associativity_:
 *
 * 1. For any given operator `f`, there exists a pair of
 *    integer constants `(L,R)`. We call `L` the _left denotation_
 *    of `f`, and `R` the _right denotation_ of `f`. We denote this
 *    the pair with the notation `D(f)`.
 * 2. Given two operators `f1` and `f2`, both instances of the
 *    operator `f`, then `f2` has higher precedence than `f1` if,
 *    and only if, given `D(f) = (a, b)`, `BP(f2) + b > BP(f1) + a`.
 *
 * In short, we _nudge_ the binding powers of the operators slightly.
 * The `+` operator, for example, is left-associative, so
 * the left-hand side of the expression gets a slight-nudge (thereby
 * positioned at a lower depth in the tree). The `^` operator, in
 * contrast, is right-associative. So, whatever lies to its right
 * gets the nudge.
 *
 * @enum
 */
enum bp {
  nil,
  assign,
  complex_assign,
  group,
  atom,
  or,
  nor,
  and,
  nand,
  xor,
  xnor,
  equivalence,
  equality,
  comparison,
  sum,
  product,
  quotient,
  power,
  prefix,
  postfix,
  call,
  primary,
  abort,
}

export class Token {
  constructor(
    public Type: tt,
    public Lexeme: string,
    public Line: number,
    public Column: number,
  ) {}
  /**
   * Returns true if this token
   * is the given type, false
   * otherwise.
   */
  is(type: tt) {
    return this.Type === type;
  }

  /**
   * Returns true if this token
   * is the {@link tt.error} token
   * type.
   */
  isErrorToken() {
    return this.Type === tt.error;
  }

  lexemeIs(lexeme: string) {
    return this.Lexeme === lexeme;
  }

  /**
   * Applies the given callback
   * (that returns a `Token`)
   * with with access to this
   * Token as an argument.
   */
  map(f: (t: Token) => Token) {
    return f(this.clone());
  }

  /**
   * Applies the given callback,
   * with access to this token
   * as an argument.
   */
  then<T>(f: (t: Token) => T): T {
    return f(this.clone());
  }

  /**
   * Sets the token’s column number.
   */
  acolumned(column: number) {
    this.Column = column;
    return this;
  }

  /**
   * Sets the token’s lexeme.
   */
  lex(lexeme: string) {
    this.Lexeme = lexeme;
    return this;
  }

  /**
   * Sets the token’s line number.
   */
  aligned(line: number) {
    this.Line = line;
    return this;
  }

  /**
   * Sets the token’s type.
   */
  atyped(type: tt) {
    this.Type = type;
    return this;
  }

  /**
   * Returns the token as a plain
   * JavaScript object.
   */
  json() {
    const type = tt[this.Type];
    const lexeme = this.Lexeme;
    const line = this.Line;
    const column = this.Column;
    return { type, lexeme, line, column };
  }

  /**
   * Returns a copy of this token.
   */
  clone() {
    return new Token(
      this.Type,
      this.Lexeme,
      this.Line,
      this.Column,
    );
  }

  /**
   * Transforms this token into the new token
   * on the first matching pattern.
   *
   * @param patterns
   * - An array of tuples, where each tuple has
   *   the type `[tt,f]`, defined as follows:
   *   1. `tt` is a {@link tt|token type}.
   *   2. `f` is a function that takes this token
   *      and returns a new token.
   */
  match(patterns: [tt, (t: Token) => Token][]) {
    let out = this.clone();
    for (let i = 0; i < patterns.length; i++) {
      const [type, f] = patterns[i];
      if (this.Type !== type) continue;
      out = f(this);
    }
    return out;
  }
}

/**
 * Creates a new token.
 *
 * @param type
 * - The token type. _See_ {@link tt}.
 * @param lexeme
 * - The token’s lexeme.
 * @param line
 * - The line where this token’s lexeme first occurred.
 * @param column
 * - The column where this token’s lexeme first occurred.
 */
const token = (
  type: tt,
  lexeme: string,
  line: number,
  column: number,
) => new Token(type, lexeme, line, column);

/**
 * An empty token for initializing
 * the engine’s state.
 */
const nilToken = token(tt.nil, "", -1, -1);

/**
 * A token indicating the end of input.
 */
const EOF = (line: number, column: number) =>
  token(tt.eof, "END", line, column);

/**
 * Returns a new token,
 * ignoring line and
 * column numbers.
 */
const tkn = (
  type: tt,
  lexeme: string = "",
) => token(type, lexeme, 0, 0);

/**
 * Returns a new character
 * guard.
 *
 * @param target
 * - The character to check against.
 */
const ischar = (target: string) => (c: string) => target === c;

/**
 * Returns `true` if the given
 * character is the glyph `.`,
 * `false` otherwise.
 */
const isDot = ischar(".");

/**
 * Returns `true` if the
 * first character is a dot,
 * and the second character
 * is a digit, `false` otherwise.
 *
 * @param c1
 * - The first character
 *   (expected to be a dot).
 * @param c2
 * - The second character
 *   (expected to be a number).
 */
const isDotDigit = (
  c1: string,
  c2: string,
) => isDot(c1) && isDigit(c2);

const isLetterX = ischar("x");
const isLetterB = ischar("b");
const isLetterO = ischar("o");
const isZero = ischar("0");
const isWS = (c: string) => (
  c === " " ||
  c === "\t" ||
  c === "\n" ||
  c === "\r"
);

const is0x = (c1: string, c2: string) => isZero(c1) && isLetterX(c2);
const is0b = (c1: string, c2: string) => isZero(c1) && isLetterB(c2);
const is0o = (c1: string, c2: string) => isZero(c1) && isLetterO(c2);

/**
 * Returns true if the
 * given character `c` is a
 * `0` or a `1` (a binary digit),
 * false otherwise.
 */
const isBigit = (c: string) => (c === "0") || (c === "1");

/**
 * Returns true if the given character `c`
 * is a hexadecimal glyph, false otherwise.
 * Hexadecimal glyphs are defined as:
 *
 * 1. An ASCII character within the closed
 *    interval of `a` through `f`, or
 * 2. An ASCII character within the closed
 *    interval of `A` through `F`, or
 * 3. An ASCII character within the closed
 *    interval of `0` through `9`.
 */
const isHexit = (c: string) => (
  (c >= "a" && c <= "f") ||
  (c >= "A" && c <= "F") ||
  (c >= "0" && c <= "9")
);

/**
 * Returns true if the given character `c`
 * is an octal glyph, false otherwise.
 * Octal glyphs are defined as:
 *
 * - An ASCII character within the closed
 *    interval of `0` through `7`.
 */
const isOctit = (c: string) => (c >= "0" && c <= "7");

const scan1 = (
  char: string,
  defaultHandler: (c: string) => Token,
) => {
  const token = (t: tt) => tkn(t, char);
  // deno-fmt-ignore
  switch (char) {
    case "(": return token(tt.left_paren);
    case ")": return token(tt.right_paren);
    case "[": return token(tt.left_bracket);
    case "]": return token(tt.right_bracket);
    case "{": return token(tt.left_brace);
    case "}": return token(tt.right_brace);
    case ",": return token(tt.comma);
    case ";": return token(tt.semicolon);
    case "+": return token(tt.plus);
    case "-": return token(tt.minus);
    case "*": return token(tt.star);
    case "/": return token(tt.slash);
    case "^": return token(tt.caret);
    case "%": return token(tt.percent);
    case "=": return token(tt.eq);
    case "<": return token(tt.lt);
    case ">": return token(tt.gt);
    case "!": return token(tt.bang);
    case ".": return token(tt.dot);
    case `"`: return token(tt.string);
    default: return defaultHandler(char);
  }
};

const symToken = (text: string) => {
  const token = (t: tt) => tkn(t, text);
  // deno-fmt-ignore
  switch (text) {
    case "let": return token(tt.let);
    case "fn": return token(tt.fn);
    case "print": return token(tt.print);
    case "var": return token(tt.var);
    case "rem": return token(tt.rem);
    case "mod": return token(tt.mod);
    case "and": return token(tt.and);
    case "not": return token(tt.not);
    case "or": return token(tt.or);
    case "if": return token(tt.if);
    case "else": return token(tt.else);
    case "false": return token(tt.false);
    case "true": return token(tt.true);
    case "NaN": return token(tt.NaN);
    case "Inf": return token(tt.Inf);
    case "class": return token(tt.class);
    case "super": return token(tt.super);
    case "this": return token(tt.this);
    case "for": return token(tt.for);
    case "while": return token(tt.while);
    case "return": return token(tt.return);
    case "null": return token(tt.null);
    default: return token(tt.symbol);
  }
};

type Parsing = (prev: Token, prePrev: Token) =>
  | Left<ErrorReport>
  | Right<ASTNode>;

type SyntaxAnalysis = {
  result: ASTNode[];
  error: ErrorReport | null;
};

export function code(
  text: string,
) {
  /**
   * The length of the input text, this
   * is the maximum possible index.
   * All loops must obey this boundary.
   */
  const MAX = text.length;

  /**
   * An array holding error
   * reports. If this array
   * has an element, then
   * all work will cease.
   */
  const ERRORS: ErrorReport[] = [];

  /**
   * Returns true if an error occurred.
   */
  const errorOccurred = () => ERRORS.length !== 0;

  /**
   * The `start` of the given lexeme.
   * This is a stateful variable.
   */
  let $start = 0;

  /**
   * The `current` variable holds
   * the ending index of the current
   * lexeme. This a stateful variable.
   */
  let $current = 0;

  /**
   * The `line` variable binds
   * the line number where the
   * current token first occurred.
   * This is a stateful variable.
   */
  let $line = 1;

  /**
   * The `column` variable
   * binds the line number where
   * the current token first occurred.
   * This is a stateful variable.
   */
  let $column = -1;

  const tickNewLine = () => {
    $column = 0;
    $line++;
    return $current++;
  };

  const advance = () => {
    $column++;
    return $current++;
  };

  const tick = () => text[$current++];

  const lex = () => text.slice($start, $current);

  const END = () => ($current >= MAX) || ERRORS.length !== 0;

  const char = () => text[$current];

  const char2 = () => (END() ? "" : text[$current + 1]);

  const charIs = (c: string) => text[$current] === c;

  const newToken = (type: tt, lexeme: string) =>
    token(type, lexeme, $line, $column);

  const errToken = (message: string) => {
    const errorMessage = `[Scanner]: ` + message;
    const error = newToken(tt.error, errorMessage);
    ERRORS.push(scannerError(errorMessage, error));
    return error;
  };

  const match = (c: string) =>
    !END() &&
    charIs(c) &&
    typeof text[$current++] === "string";

  const skipWhitespace = () => {
    while (!END()) {
      const c = char();
      // deno-fmt-ignore
      switch (c) {
        case " ":
        case "\r":
        case "\t": advance(); break;
        case "\n": tickNewLine(); break;
        default: return c;
      }
    }
    return text[$current];
  };

  const scanString = () => {
    const breakCondition = () => !END() && !charIs(`"`);
    const action = () => charIs(`\n`) ? tickNewLine() : advance();
    range(breakCondition, action, MAX);
    if (END()) return errToken(`Unterminated string.`);
    advance(); // eat the closing quote
    return newToken(tt.string, lex().slice(1, -1));
  };

  const scanNonBase10 = (
    type: tt.hex | tt.octal | tt.binary,
    digitTest: (c: string) => boolean,
  ) =>
  () => {
    advance(); // eat the '0'
    advance(); // eat the denotation ('x', 'b', or 'o')
    if (digitTest(char())) {
      while (digitTest(char())) {
        advance();
        if (!digitTest(char()) && isWS(char2())) {
          return errToken(
            `Expected ${tt[type]}, but got a non-${
              tt[type]
            } digit, “${char()}”`,
          );
        }
      }
    } else {
      return errToken(`Expected ${tt[type]} number.`);
    }
    return newToken(type, lex());
  };

  /**
   * Scans a hexadecimal number.
   */
  const scanHex = scanNonBase10(tt.hex, isHexit);

  /**
   * Scans a binary number.
   */
  const scanBinary = scanNonBase10(tt.binary, isBigit);

  /**
   * Scans an octal number.
   */
  const scanOctal = scanNonBase10(tt.octal, isOctit);

  const scanInt = () => {
    while (isDigit(char()) && !END()) advance();
    return isDotDigit(char(), char2()) ? scanDot() : newToken(tt.int, lex());
  };

  const scanDot = () => {
    advance();
    while (isDigit(char()) && !END()) advance();
    return newToken(tt.float, lex());
  };

  // deno-fmt-ignore
  const pickLeftOn = (exp: string) => (
    a: tt, b: tt
  ) => (
    t: Token
  ) => t.atyped(match(exp) ? a : b);

  const leftOnEqual = pickLeftOn("=");
  const leftOnPlus = pickLeftOn("+");
  const leftOnMinus = pickLeftOn("-");

  const twoCharTokens: [tt, (t: Token) => Token][] = [
    [tt.bang, leftOnEqual(tt.neq, tt.bang)],
    [tt.eq, leftOnEqual(tt.deq, tt.eq)],
    [tt.lt, leftOnEqual(tt.leq, tt.lt)],
    [tt.gt, leftOnEqual(tt.geq, tt.gt)],
    [tt.plus, leftOnEqual(tt.plus_equals, tt.plus)],
    [tt.plus, leftOnPlus(tt.plus_plus, tt.plus)],
    [tt.minus, leftOnEqual(tt.minus_equals, tt.minus)],
    [tt.minus, leftOnMinus(tt.minus_minus, tt.minus)],
    [tt.slash, leftOnEqual(tt.slash_equals, tt.slash)],
    [tt.star, leftOnEqual(tt.star_equals, tt.star)],
    [tt.caret, leftOnEqual(tt.caret_equals, tt.caret)],
    [tt.dot, (t) => isDigit(char()) ? scanInt().atyped(tt.float) : t],
  ];

  const unknownToken = (c: string) => errToken(`Unknown token ${c}`);

  const scanSymbol = () => {
    while (isLatinGreek(char()) || isDigit(char())) advance();
    const text = lex();
    return symToken(text).aligned($line).acolumned($column);
  };

  // deno-fmt-ignore
  const mapfn = (token: Token) => token.lexemeIs(`"`) 
    ? scanString() 
    : token.is(tt.error) 
      ? token 
      : token.lex(lex());

  /**
   * Returns the next token from
   * the given text.
   */
  const nextToken = (): Token => {
    skipWhitespace();
    if (END()) return EOF($line, $column);
    $start = $current;
    const c = tick();
    if (is0b(c, char())) return scanBinary();
    if (is0o(c, char())) return scanOctal();
    if (is0x(c, char())) return scanHex();
    if (isLatinGreek(c)) return scanSymbol();
    return isDigit(c) ? scanInt() : scan1(c, unknownToken)
      .match(twoCharTokens)
      .aligned($line)
      .acolumned($column)
      .map(mapfn);
  };
  /**
   * Tokenizes the expression.
   * @returns An array of {@link Token|tokens}.
   */
  const tokenize = () => range(() => !END(), nextToken, MAX);

  // § Parsing Functions =============================================

  /**
   * The last parsing result. This is either
   * {@link ErrorReport} or an {@link ASTNode}.
   */
  let $lastParse: Either<ErrorReport, ASTNode> = right(nilNode);

  /**
   * The next token to be read
   * (I.e., the lookahead token).
   */
  let $peek = nilToken;

  /**
   * The current token under
   * consideration.
   */
  let $prev = nilToken;

  /**
   * Reads the next token in the provided
   * text string, and returns the last
   * read token. (All the parsing functions
   * have a lookahead of 1.)
   */
  const push = () => {
    $prev = $peek;
    $peek = nextToken();
    if ($peek.isErrorToken()) {
      return $peek;
    }
    return $prev;
  };

  /**
   * Parses a parenthesized expression.
   */
  const group = () => {
    const output = (node: ASTNode) => (t: Token) => (
      t.is(tt.right_paren)
        ? right(node)
        : pError(expectedError("group-expression", `)`, t))
    );
    const result = parseExpression()
      .chain((node) => push().then(output(node)));
    return result;
  };

  /**
   * Generates and returns a parser
   * error.
   */
  const pError = (msg: string, token: Token = $prev) => {
    const error = parserError(msg, token);
    ERRORS.push(error);
    return left(error);
  };

  const star = (t: Token) => t.clone().lex("*").atyped(tt.star);

  /**
   * Parses a numeric token. Numeric
   * tokens are any of the following:
   *
   * 1. {@link tt.int},
   * 2. {@link tt.float},
   * 3. {@link tt.Inf},
   * 4. {@link tt.NaN},
   * 5. {@link tt.binary},
   * 6. {@link tt.octal},
   * 7. {@link tt.hex},
   */
  const num = (token: Token) => {
    const lexeme = token.Lexeme;
    let out: ASTNode = nilNode;
    // deno-fmt-ignore
    switch (token.Type) {
      case tt.int: out = int(lexeme); break;
      case tt.float: out = real(lexeme); break;
      case tt.Inf: out = inf; break;
      case tt.NaN: out = nan; break;
      case tt.binary: out = binary(lexeme); break;
      case tt.octal: out = octal(lexeme); break;
      case tt.hex: out = hex(lexeme); break;
    }
    if (isNilNode(out)) {
      return pError(expectedError(
        `numeric-literal`,
        `number`,
        token,
      ));
    }
    if (nextTokenIs(tt.left_paren)) {
      return group().map((n) => binex(out, star($prev), n));
    }
    if (nextTokenIs(tt.symbol)) {
      const expr = binex(out, star($prev), sym($prev));
      return nextTokenIs(tt.left_paren)
        ? group().map((e) => binex(expr, star($prev), e))
        : right(expr);
    }
    return right(out);
  };

  /**
   * Parses an atom from the set of token types
   * {@link tt.string}, {@link tt.null}, {@link tt.false},
   * and {@link tt.true}.
   */
  const atom = (token: Token) => {
    const lexeme = token.Lexeme;
    // deno-fmt-ignore
    switch (token.Type) {
      case tt.string: return right(str(lexeme));
      case tt.null: return right(nilNode);
      case tt.false: return right(falseNode);
      case tt.true: return right(trueNode);
      default: return pError(expectedError(
        `atom`, `literal`, token
      ))
    }
  };

  /**
   * Parses a postfix expression.
   *
   * @param token - The token corresponding
   * to the expression’s prefix operator.
   */
  const postfix = (
    token: Token,
  ): Either<ErrorReport, UnaryExpression> => {
    const mapFn = (arg: ASTNode) => unary(token, arg);
    return $lastParse.map(mapFn);
  };

  /**
   * Parses a prefix expression.
   *
   * @param token - The token corresponding
   * to the expression’s prefix operator.
   */
  const prefix = (
    token: Token,
  ): Either<ErrorReport, UnaryExpression> => {
    const mapFn = (arg: ASTNode) => unary(token, arg);
    return parseExpression().map(mapFn);
  };

  const newop = (
    type: tt,
    lex: string,
  ) => $prev.clone().atyped(type).lex(lex);

  const assignOp = (type: tt) => {
    switch (type) {
      case tt.plus_equals:
        return newop(tt.plus, "+");
      case tt.star_equals:
        return newop(tt.star, "*");
      case tt.caret_equals:
        return newop(tt.caret, "^");
      case tt.minus_equals:
        return newop(tt.minus, "-");
      case tt.slash_equals:
        return newop(tt.slash, "/");
    }
  };

  const complex_assign = (token: Token) => {
    const assign = (lhs: Sym) => (rhs: ASTNode) => {
      const op = assignOp(token.Type);
      if (op === undefined) {
        return pError(expectedError(
          `complex-assign`,
          `complex assignment`,
          token,
        ));
      }
      const binexRight = binex(lhs, op, rhs);
      const output = assignment(lhs, binexRight);
      return right(output);
    };
    return $lastParse.chain((node) => {
      if (!isSymbolNode(node)) {
        return pError(
          `[complex-assign]: Complex assignment. The right-hand side of a complex assign must be an identifier.`,
        );
      }
      return parseExpression().chain(assign(node));
    });
  };

  /**
   * Parses an infix expression.
   *
   * @param token - The token corresponding
   * to the expression’s infix operator.
   */
  const infix = (
    token: Token,
  ): Either<ErrorReport, BinaryExpression> => {
    const mapFn = (lhs: ASTNode) => (rhs: ASTNode) => binex(lhs, token, rhs);
    const chainFn = (
      lhs: ASTNode,
    ) => parseExpression().map(mapFn(lhs));
    const expr = $lastParse.chain(chainFn);
    return expr;
  };

  /**
   * Returns a left-result
   * of the last occurring error.
   */
  const ERROR = () => {
    return left(ERRORS[ERRORS.length - 1]);
  };

  const unassignable = (
    token: Token,
  ) => precedenceOf(token.Type) > bp.assign;

  /**
   * Parses a variable.
   */
  const variable = (
    prevToken: Token,
    p: Token,
  ): Either<ErrorReport, (Sym | Assign)> => {
    const id = sym(prevToken);

    const statement = (node: Assign) => () =>
      noSemicolonNeeded() ? right(node) : push().then(
        (t) =>
          t.is(tt.semicolon)
            ? right(node)
            : pError(expectedError(`variable`, `;`, t)),
      );

    const newnode = (node: () => Either<ErrorReport, Assign>) => {
      return unassignable(p)
        ? pError(`[variable]: invalid assignment`)
        : node();
    };

    const mutateAssign = (type: tt, lexeme: string) =>
      newnode(
        statement(
          assignment(id, binex(id, newop(type, lexeme), int("1"))),
        ),
      );

    if (nextTokenIs(tt.minus_minus)) {
      return mutateAssign(tt.minus, "-");
    }
    if (nextTokenIs(tt.plus_plus)) {
      return mutateAssign(tt.plus, "+");
    }
    if (nextTokenIs(tt.eq)) {
      return newnode(
        () => parseExpression().map((n) => assignment(id, n)),
      );
    }
    return right(id);
  };

  const CALL = (): Either<ErrorReport, Call> => {
    const name = $lastParse;
    if (name.isLeft()) return name;
    const callname = name.unwrap();
    if (!isSymbolNode(callname)) {
      return pError(`Expected function name`);
    }
    const args = parseDelimited(
      `call`,
      tt.nil,
      (n: ASTNode) => right(n),
      tt.right_paren,
    );
    return args.map((as) => call(callname, as));
  };

  // § Array Parser
  const array = (): Either<ErrorReport, Vector> => {
    const elements: ASTNode[] = [];
    if (!$peek.is(tt.right_bracket)) {
      do {
        parseExpression().map((n) => elements.push(n));
      } while (nextTokenIs(tt.comma));
    }
    const result = (t: Token) => {
      if (t.is(tt.right_bracket)) return right(vector(elements));
      return pError(expectedError("array", "[", t));
    };
    return push().then(result);
  };

  // § Parse Rules Record ============================================
  const __ = () => right(nilNode);
  const __o = bp.nil;

  /**
   * @internal
   * __DO NOT MODIFY THIS TABLE__.
   * This the Pratt parser’s orchestrator.
   * This table lays out the precedence map (right-most
   * column) as well as the left- and right-parsers.
   * Slots labeled with three underscores correspond
   * to the null parser (_see_ {@link Engine.___}).
   * These are slots that are open for filling.
   * That parser always returns the null node.
   * We use the underscores to avoid the clutter
   * resulting from a full name.
   */
  const ParseRules: Record<tt, [Parsing, Parsing, bp]> = {
    [tt.eof]: [__, __, __o],
    [tt.nil]: [__, __, __o],
    [tt.error]: [ERROR, __, __o],
    [tt.left_paren]: [group, CALL, bp.call],
    [tt.right_paren]: [__, __, __o],
    [tt.left_brace]: [__, __, __o],
    [tt.right_brace]: [__, __, __o],
    [tt.left_bracket]: [array, __, __o],
    [tt.right_bracket]: [__, __, __o],
    [tt.comma]: [__, __, __o],
    [tt.semicolon]: [__, __, __o],
    [tt.dot]: [__, __, __o],

    [tt.and]: [__, infix, bp.and],
    [tt.or]: [__, infix, bp.or],
    [tt.not]: [prefix, __, bp.prefix],

    [tt.plus_equals]: [__, complex_assign, bp.complex_assign],
    [tt.minus_equals]: [__, complex_assign, bp.complex_assign],
    [tt.star_equals]: [__, complex_assign, bp.complex_assign],
    [tt.caret_equals]: [__, complex_assign, bp.complex_assign],
    [tt.slash_equals]: [__, complex_assign, bp.complex_assign],
    [tt.eq]: [__, __, __o],
    [tt.print]: [__, __, __o],
    [tt.plus_plus]: [__, __, __o],
    [tt.minus_minus]: [__, __, __o],

    [tt.neq]: [__, infix, bp.comparison],
    [tt.deq]: [__, infix, bp.equality],
    [tt.gt]: [__, infix, bp.comparison],
    [tt.geq]: [__, infix, bp.comparison],
    [tt.lt]: [__, infix, bp.comparison],
    [tt.leq]: [__, infix, bp.comparison],

    [tt.minus]: [prefix, infix, bp.sum],
    [tt.plus]: [prefix, infix, bp.sum],
    [tt.slash]: [__, infix, bp.product],
    [tt.star]: [__, infix, bp.product],
    [tt.percent]: [__, infix, bp.product],
    [tt.mod]: [__, infix, bp.quotient],
    [tt.rem]: [__, infix, bp.quotient],
    [tt.caret]: [__, infix, bp.power],

    [tt.bang]: [__, postfix, bp.postfix],
    [tt.int]: [num, __, bp.atom],
    [tt.float]: [num, __, bp.atom],
    [tt.Inf]: [num, __, bp.atom],
    [tt.NaN]: [num, __, bp.atom],
    [tt.hex]: [num, __, bp.atom],
    [tt.binary]: [num, __, bp.atom],
    [tt.octal]: [num, __, bp.atom],
    [tt.symbol]: [variable, __, bp.atom],
    [tt.string]: [atom, __, bp.atom],
    [tt.false]: [atom, __, bp.atom],
    [tt.true]: [atom, __, bp.atom],
    [tt.null]: [atom, __, bp.atom],

    [tt.let]: [__, __, __o],
    [tt.var]: [__, __, __o],
    [tt.fn]: [__, __, __o],
    [tt.if]: [__, __, __o],
    [tt.else]: [__, __, __o],
    [tt.class]: [__, __, __o],
    [tt.super]: [__, __, __o],
    [tt.this]: [__, __, __o],
    [tt.for]: [__, __, __o],
    [tt.while]: [__, __, __o],
    [tt.return]: [__, __, __o],
  };

  /**
   * Returns the prefix parser from the
   * {@link ParseRules}.
   */
  const prefixRule = (tokenType: tt) => ParseRules[tokenType][0];

  /**
   * Returns the infix parser from the
   * {@link ParseRules}.
   */
  const infixRule = (tokenType: tt) => ParseRules[tokenType][1];

  /**
   * Returns the precedence of the given token type.
   * {@link ParseRules}.
   */
  const precedenceOf = (tokenType: tt) => ParseRules[tokenType][2];

  /**
   * Parses an expression with Pratt parsing.
   *
   * @param minbp - The initial base case bp. If
   * a `bp` lower than {@link bp.none} is passed,
   * the right-hand side of the expression
   * isn’t parsed.
   */
  const parseExpression = (
    minbp = bp.assign,
  ): Either<ErrorReport, ASTNode> => {
    if (errorOccurred()) return ERROR();
    let beforePeek = $prev;
    let token = push();
    const prefix = prefixRule(token.Type);
    let left = prefix(token, beforePeek);
    if (errorOccurred()) return ERROR();
    $lastParse = left;
    while (minbp < precedenceOf($peek.Type) && !END()) {
      beforePeek = token;
      token = push();
      const infix = infixRule(token.Type);
      const right = infix(token, beforePeek);
      if (errorOccurred()) return ERROR();
      if (right.isLeft()) return right;
      left = right;
      $lastParse = left;
    }
    return left;
  };

  /**
   * Returns `true` if the {@link $peek}
   * matches the provided type (false
   * otherwise). If the {@link $peek} matches,
   * then the {@link push} function is called,
   * thereby updating the current {@link $prev}
   * and {@link $peek} (i.e., advancing the
   * parser).
   */
  const nextTokenIs = (type: tt): boolean => {
    if ($peek.is(type)) {
      push();
      return true;
    }
    return false;
  };

  /**
   * Returns `true` if no semicolons
   * are needed to terminate the
   * statement, otherwise false.
   *
   * Semicolons are not needed if
   * any of the following
   * conditions are true:
   *
   * 1. The next token is the
   *    {@link tt.eof|end of input token}.
   * 2. The next token is a
   *    {@link tt.right_brace|right brace}.
   * 3. The current token is a
   *    {@link tt.right_brace|right brace}.
   */
  const noSemicolonNeeded = (): boolean => {
    const res = $peek.is(tt.eof) ||
      $peek.is(tt.right_brace) ||
      $prev.is(tt.right_brace) ||
      $prev.is(tt.semicolon);
    return res;
  };

  /**
   * Parses an expression statement.
   * Expression statements must be
   * terminated with a semicolon,
   * unless a
   * {@link noSemicolonNeeded|semicolon exception}
   * applies.
   *
   * __Cross References__.
   * 1. _See also_ {@link noSemicolonNeeded} (defining
   *    when semicolons are unnecessary).
   */
  const EXPR = (): Either<ErrorReport, ASTNode> => {
    const output = (node: ASTNode) => {
      const ok = right(node);
      if (noSemicolonNeeded()) {
        return ok;
      }
      const res = push().then((t) =>
        t.is(tt.semicolon) || t.is(tt.eof) ? ok : pError(
          expectedError(`expression-statement`, `;`, t),
        )
      );
      return res;
    };
    const res = parseExpression().chain(output);
    return res;
  };

  /**
   * Parses a loop statement.
   */
  const LOOP = (): Either<ErrorReport, Loop> => {
    const condition = parseExpression();
    const statement = push().then((t) =>
      t.is(tt.left_brace)
        ? condition.chain((c) => BLOCK().map((b) => loop(c, b)))
        : pError(`while condition must be followed by block`)
    );
    return statement;
  };

  /**
   * Parses a variable declaration.
   */
  const VAR = (): Either<ErrorReport, VariableDeclaration> => {
    const nil = right(nilNode);
    const mutable = nextTokenIs(tt.var);
    const id = push();
    const val = () => {
      if (nextTokenIs(tt.eq)) {
        return EXPR();
      } else if (mutable) {
        if (noSemicolonNeeded()) return nil;
        return push().then((t) =>
          t.is(tt.semicolon) ? nil : pError(
            expectedError(`variable-declaration`, `‘;’`, t),
          )
        );
      } else {
        return pError(mutError(id.Lexeme));
      }
    };
    const node = (val: ASTNode) => (mutable ? varDef : constantDef)(id, val);
    const varname = (token: Token) =>
      token.is(tt.symbol) ? val() : pError(
        expectedError(
          `variable-declaration`,
          `variable name`,
          token,
        ),
      );
    const output = id.then(varname).map(node);
    return output;
  };

  /**
   * Parses an if-statement.
   */
  const IF_ELSE = (): Either<ErrorReport, Conditional> => {
    const condition = parseExpression();
    const statement = (c: ASTNode) =>
      BLOCK().chain((ifNode) =>
        nextTokenIs(tt.else)
          ? STATEMENT().map((elseNode) => cond(c, ifNode, elseNode))
          : right(cond(c, ifNode, nilNode))
      );
    const output = (token: Token) =>
      token.is(tt.left_brace)
        ? condition.chain(statement)
        : pError(`if-condition must be followed by a block.`);
    const result = push().then(output);
    return result;
  };

  /**
   * Parses delimited content.
   * @param source - The name of the parser calling this function.
   * @param leftDelim
   * - The opening delimiter (e.g., a left-paren). To prevent
   *   this function from enforcing an opening delimiter,
   *   pass {@link tt.nil}. This may be necessary because
   *   either the parser caller has already consumed the delimiter
   *   (e.g., the {@link CALL|function call parser}), or the
   *   {@link parseExpression|Pratt parser} has consumed it by
   *   way of precedence.
   * @param parser
   * - A callback function that determines what should be pushed
   *   to the output array, given the recently parsed node. This
   *   provides the caller a means of ensuring a homogenous list
   *   (e.g., {@link FUNCTION|function declaration} parser
   *   requires all parameters to be symbols).
   * @param rightDelim
   * - The closing, right delimiter (e.g., a right-paren).
   */
  const parseDelimited = <T>(
    source: string,
    leftDelim: tt,
    parser: (n: ASTNode) => Either<ErrorReport, T>,
    rightDelim: tt,
  ) => {
    const elements: T[] = [];
    if (leftDelim !== tt.nil && !push().is(leftDelim)) {
      return pError(
        expectedError(source, `${tt[leftDelim]}`, $prev),
      );
    }
    if (!$peek.is(rightDelim)) {
      do {
        const node = parseExpression();
        if (node.isLeft()) return node;
        const element = parser(node.unwrap());
        if (element.isLeft()) return element;
        elements.push(element.unwrap());
      } while (nextTokenIs(tt.comma));
    }
    return push().then((t) =>
      t.is(rightDelim)
        ? right(elements)
        : pError(expectedError(source, `${tt[t.Type]}`, t))
    );
  };

  // deno-fmt-ignore
  const failedExpect = (
    source: string,
    expected: string,
  ) => (
    token: Token
  ) => pError(expectedError(source, expected, token));

  /**
   * Parses a function declaration.
   */
  const FUNCTION = (): Either<ErrorReport, FunctionDeclaration> => {
    // reports an invalid identifier error
    const nameError = failedExpect(`Function`, `name`);
    if (!$peek.is(tt.symbol)) return nameError($peek);

    // reports the failed assignment error
    const assignError = failedExpect(`Function`, `=`);

    // reports a non-homogenous parameter list error
    const paramError = failedExpect(`Function`, `parameter-list`);

    // parameter parser
    const parameters = () =>
      parseDelimited(
        `Function`,
        tt.left_paren, // params must begin with left-paren
        (node: ASTNode) =>
          isSymbolNode(node) // if the parameter node is a symbol
            ? right(node) // allow the node entry into the list
            : paramError($prev), // syntax error
        tt.right_paren, // params must close with a right-paren
      );

    // function body parser
    const Body = (name: Token, params: Sym[]) => (body: ASTNode) =>
      fnDef(
        sym(name),
        params,
        body,
      );

    return push().then((name) =>
      parameters().chain((params) =>
        $peek.is(tt.left_brace) // if the next token is a left-brace
          ? STATEMENT().map(Body(name, params)) // return the function
          : push().then((token) =>
            // otherwise
            token.is(tt.eq) // we expect an assignment '='
              ? STATEMENT().map(Body(name, params))
              : assignError(token)
          )
      )
    );
  };

  /**
   * Parses a block statement.
   */
  const BLOCK = (): Either<ErrorReport, Block> => {
    let statements: ASTNode[] = [];
    while (!$peek.is(tt.right_brace) && !END()) {
      const statement = STATEMENT();
      if (statement.isLeft()) return statement;
      statements.push(statement.unwrap());
    }
    return push().then((t) =>
      t.is(tt.right_brace)
        ? right(block(statements))
        : pError(expectedError(`block`, `}`, t))
    );
  };

  const PRINT = (): Either<ErrorReport, ASTNode> => {
    const target = STATEMENT().map((n) => printnode(n));
    return target;
  };

  const STATEMENT = (): Either<ErrorReport, ASTNode> => {
    if (nextTokenIs(tt.print)) return PRINT();
    if (nextTokenIs(tt.fn)) return FUNCTION();
    if (nextTokenIs(tt.while)) return LOOP();
    if (nextTokenIs(tt.if)) return IF_ELSE();
    if (nextTokenIs(tt.left_brace)) return BLOCK();
    if (nextTokenIs(tt.let)) return VAR();
    return EXPR();
  };

  const parsing = (
    result: ASTNode[],
  ): SyntaxAnalysis => ({
    result,
    error: null,
  });
  const failedParsing = (error: ErrorReport): SyntaxAnalysis => ({
    result: [],
    error,
  });

  /**
   * Parses the provided text.
   * @returns
   * - Either an {@link ErrorReport} or an
   *   array of {@link ASTNode}.
   */
  const parse = () => {
    const croak = () => failedParsing(ERROR().unwrap());
    const out: ASTNode[] = [];
    push(); // prime the parser
    if (errorOccurred()) return croak();
    while (!END()) {
      const node = STATEMENT();
      if (node.isLeft()) return croak();
      out.push(node.unwrap());
    }
    // reset all stateful variables
    $column = 0;
    $current = 0;
    $lastParse = right(nilNode);
    $line = 0;
    $peek = nilToken;
    $prev = nilToken;
    $start = 0;
    return parsing(out);
  };
  return {
    tokenize,
    parse,
  };
}
const parse = (text: string) => code(text).parse();
const scan = (text: string) => code(text).tokenize();
function isTruthy(x: any): boolean {
  if (typeof x === "boolean") return x;
  if (x === null || x === undefined) return false;
  if (x === 0) return false;
  if (Array.isArray(x) && x.length === 0) return false;
  return true;
}
class Callable {
  arity: number;
  env: Env<any>;
  body: Block;
  params: Sym[];
  constructor(node: FunctionDeclaration, env: Env<any>) {
    this.arity = node.arity();
    this.body = node.bodyNode();
    this.params = node.paramNodes();
    this.env = env;
  }
  interpret(interpreter: Interpreter, args: any[]) {
    const scope = new Env(this.env.clone());
    for (let i = 0; i < this.arity; i++) {
      const p = this.params[i].id();
      scope.define(p, args[i]);
    }
    const out = interpreter.execute(this.body, scope);
    return out;
  }
}
class Env<T> {
  values: Map<string, T>;
  parent: Env<T> | null;
  error: string | null = null;
  constructor(parent?: Env<T>) {
    this.parent = parent === undefined ? null : parent;
    this.values = new Map();
  }
  clone() {
    const x = new Env();
    x.parent = this.parent;
    x.values = this.values;
    return x;
  }
  ancestor(distance: number) {
    let environment = this.clone();
    for (let i = 0; i < distance; i++) {
      environment = environment.parent!;
    }
    return environment as any as Env<T>;
  }
  assignAt(distance: number, name: string, value: T): T {
    this.ancestor(distance).values.set(name, value);
    return value;
  }
  getAt(distance: number, name: string) {
    const A = this.ancestor(distance);
    const out = A.values.get(name)!;
    return out;
  }
  read(name: string): T | null {
    if (this.values.has(name)) {
      return this.values.get(name)!;
    }
    if (this.parent !== null) {
      return this.parent.read(name);
    }
    this.ERROR(`Variable ${name} does not exist.`);
    return null;
  }
  ERROR(message: string) {
    this.error = message;
  }
  define(name: string, value: T): T {
    this.values.set(name, value);
    return value;
  }
  assign(name: string, value: T): T | null {
    if (this.values.has(name)) {
      this.values.set(name, value);
      return value;
    }
    if (this.parent !== null) {
      this.parent.assign(name, value);
      return value;
    }
    this.ERROR(`${name} is undeclared`);
    return null;
  }
}
type SCOPE = Map<string, boolean>;
class Resolver implements Visitor<void> {
  scopes: Stack<SCOPE>;
  locals: Map<ASTNode, number>;
  error: string | null = null;
  constructor() {
    this.scopes = new Stack();
    this.locals = new Map();
  }
  ERROR(message: string) {
    this.error = message;
  }
  addLocal(node: ASTNode, depth: number) {
    this.locals.set(node, depth);
  }
  number(_: Num): void {
    return;
  }
  nil(_: Nil): void {
    return;
  }
  bool(_: Bool): void {
    return;
  }
  symbol(node: Sym): void {
    const name = node.id();
    if (this.scopes.peekIs((x) => x.get(name) === false)) {
      this.ERROR(
        `Can’t read local variable ${name} in its own initializer.`,
      );
    }
    this.resolveLocal(node, name);
    return;
  }
  resolveLocal(expr: ASTNode, name: string) {
    for (let i = this.scopes.size() - 1; i >= 0; i--) {
      if (this.scopes.at(i, (x) => x.has(name))) {
        this.addLocal(
          expr,
          this.scopes.size() - 1 - i,
        );
        return;
      }
    }
  }
  string(_: Str): void {
    return;
  }
  call(node: Call): void {
    this.resolveNode(node.callee());
    node.forEachArg((arg) => this.resolveNode(arg));
    return;
  }
  unary(node: UnaryExpression): void {
    this.resolveNode(node.arg());
    return;
  }
  binex(node: BinaryExpression): void {
    this.resolveNode(node.leftNode());
    this.resolveNode(node.rightNode());
    return;
  }
  resolveFunction(node: FunctionDeclaration): void {
    this.beginScope();
    node.forEachParam((p) => {
      this.declare(p.id());
      this.define(p.id());
    });
    this.resolveNode(node.bodyNode());
    this.endScope();
    return;
  }
  funcDef(node: FunctionDeclaration): void {
    this.declare(node.name());
    this.define(node.name());
    this.resolveFunction(node);
    return;
  }
  declare(name: string): void {
    if (this.scopes.isEmpty()) return;
    this.scopes.onPeek((scope) => scope.set(name, false));
  }
  define(name: string): void {
    if (this.scopes.isEmpty()) return;
    this.scopes.onPeek((scope) => scope.set(name, true));
  }
  varDef(node: VariableDeclaration): void {
    this.declare(node.variableName());
    this.resolveNode(node.value());
    this.define(node.variableName());
    return;
  }
  vector(node: Vector): void {
    node.forEach((n) => this.resolveNode(n));
    return;
  }
  resolve(nodes: ASTNode[]) {
    this.resolveAll(nodes);
    return this.locals;
  }
  resolveNode(node: ASTNode) {
    node.accept(this);
  }
  resolveAll(nodes: ASTNode[]) {
    for (let i = 0; i < nodes.length; i++) {
      this.resolveNode(nodes[i]);
    }
  }
  beginScope() {
    this.scopes.push(new Map());
  }
  endScope() {
    this.scopes.pop();
  }
  block(node: Block): void {
    this.beginScope();
    this.resolveAll(node.nodes());
    this.endScope();
    return;
  }
  loop(node: Loop): void {
    this.resolveNode(node.conditionNode());
    this.resolveNode(node.bodyNode());
    return;
  }
  assign(node: Assign): void {
    this.resolveNode(node.RValue());
    this.resolveLocal(node, node.name());
    return;
  }
  tuple(node: Tuple<ASTNode>): void {
    node.forEach((n) => this.resolveNode(n));
    return;
  }
  cond(node: Conditional): void {
    this.resolveNode(node.conditionNode());
    this.resolveNode(node.ifNode());
    this.resolveNode(node.elseNode());
    return;
  }
  print(node: PrintNode): void {
    this.resolveNode(node.target());
    return;
  }
}

class Interpreter implements Visitor<any> {
  environment: Env<any>;
  globals: Env<any>;
  envError: string | null;
  locals: Map<ASTNode, number>;
  setEnvError(message: string) {
    this.envError = "[Environment] " + message;
  }
  resolverError: string | null;
  setResolverError(message: string) {
    this.resolverError = "[Resolver] " + message;
  }
  constructor() {
    this.globals = new Env();
    this.environment = this.globals;
    this.envError = null;
    this.resolverError = null;
    this.locals = new Map();
  }
  setLocals(locals: Map<ASTNode, number>) {
    this.locals = locals;
    return this;
  }
  resolve(node: ASTNode, depth: number) {
    this.locals.set(node, depth);
  }
  evalnode(node: ASTNode): any {
    const res = node.accept(this as any);
    return res;
  }
  print(node: PrintNode) {
    const value = this.evalnode(node.target());
    console.log(value);
    return value;
  }
  number(node: Num): any {
    return node.lit();
  }
  nil(_: Nil): any {
    return null;
  }
  bool(node: Bool): any {
    return node.lit();
  }
  string(node: Str) {
    return node.lit();
  }
  lookupVar(name: string, expr: ASTNode) {
    const distance = this.locals.get(expr);
    if (distance !== undefined) {
      const out = this.environment.getAt(distance - 1, name);
      if (this.environment.error) {
        this.setEnvError(this.environment.error);
      }
      return out;
    } else {
      const res = this.globals.read(name);
      if (this.globals.error) {
        this.setEnvError(this.globals.error);
      }
      return res;
    }
  }
  symbol(node: Sym) {
    const out = this.lookupVar(node.id(), node);
    return out;
  }
  call(node: Call) {
    const args: any[] = [];
    const callee = node.callee();
    const arglen = node.arity();
    const callArgs = node.args();
    for (let i = 0; i < arglen; i++) {
      args.push(this.evalnode(callArgs[i]));
    }
    const fn = this.environment.read(callee.id());
    if (fn instanceof Callable) {
      const out = fn.interpret(this, args);
      return out;
    }
    return null;
  }
  unary(node: UnaryExpression) {
    const op = node.op();
    const arg = this.evalnode(node.arg());
    // deno-fmt-ignore
    switch (op) {
      case tt.minus: return -arg;
      case tt.plus: return +arg;
      case tt.not: return !isTruthy(arg);
    }
    return null;
  }
  binex(node: BinaryExpression) {
    const left = node.leftNode();
    const right = node.rightNode();
    const L = this.evalnode(left);
    const R = this.evalnode(right);
    const op = node.op();
    // deno-fmt-ignore
    switch (op) {
      case tt.plus: return L + R;
      case tt.minus: return L - R;
      case tt.slash: return L / R;
      case tt.star: return L * R;
      case tt.deq: return L === R;
      case tt.neq: return L !== R;
      case tt.gt: return L > R;
      case tt.lt: return L < R;
      case tt.geq: return L >= R;
      case tt.leq: return L <= R;
      case tt.caret: return L ** R;
      case tt.percent: return percent(L,R);
      case tt.rem: return rem(L,R);
      case tt.mod: return mod(L,R);
      case tt.and: return isTruthy(L) && isTruthy(R);
      case tt.or: return isTruthy(L) || isTruthy(R);
    }
    return null;
  }
  funcDef(node: FunctionDeclaration) {
    const f = new Callable(node, this.environment);
    this.environment.define(node.name(), f);
    return null;
  }
  varDef(node: VariableDeclaration) {
    const val = this.evalnode(node.value());
    this.environment.define(node.variableName(), val);
    return val;
  }
  vector(node: Vector) {
    const out = [];
    const elements = node.value();
    for (let i = 0; i < elements.length; i++) {
      out.push(this.evalnode(elements[i]));
    }
    return out;
  }

  execute(block: Block, env: Env<any>) {
    const nodes = block.nodes();
    const prev = this.environment;
    let res: any = null;
    this.environment = env;
    for (let i = 0; i < nodes.length; i++) {
      res = nodes[i].accept(this);
    }
    this.environment = prev;
    return res;
  }
  block(node: Block) {
    const e = new Env(this.environment);
    return this.execute(node, e);
  }
  loop(node: Loop) {
    const condition = node.conditionNode();
    const body = node.bodyNode();
    let result: any = null;
    while (isTruthy(this.evalnode(condition))) {
      result = this.evalnode(body);
    }
    return result;
  }
  assign(node: Assign) {
    const name = node.name();
    const value = this.evalnode(node.RValue());
    const distance = this.locals.get(node);
    if (distance !== undefined) {
      this.environment.assignAt(distance, name, value);
      if (this.environment.error) {
        this.setEnvError(this.environment.error);
      }
    } else {
      this.globals.assign(name, value);
      if (this.globals.error) {
        this.setEnvError(this.globals.error);
      }
    }
  }
  tuple(node: Tuple<ASTNode>) {
    const elements = node.value().toArray();
    const out = [];
    for (let i = 0; i < elements.length; i++) {
      out.push(this.evalnode(elements[i]));
    }
    return out;
  }
  cond(node: Conditional) {
    const condition = this.evalnode(node.conditionNode());
    if (isTruthy(condition)) {
      return this.evalnode(node.ifNode());
    } else {
      return this.evalnode(node.elseNode());
    }
  }
  interpret(nodes: ASTNode[]) {
    if (this.resolverError) return this.resolverError;
    let result: any = null;
    for (let i = 0; i < nodes.length; i++) {
      result = nodes[i].accept(this);
      if (this.envError) return this.envError;
    }
    return result;
  }
}

type Resolution = {
  locals: Map<ASTNode, number>;
  ast: ASTNode[];
};

function resolve(
  parsing: SyntaxAnalysis,
): Either<ErrorReport, Resolution> {
  const error = parsing.error;
  if (error !== null) return left(error);
  const nodes = parsing.result;
  const resolver = new Resolver();
  const locals = resolver.resolve(nodes);
  const ast = parsing.result;
  return right({ locals, ast });
}

const source = `

let a = 12;
let b = a + 13;

print b;

`;

// const parsing = parse(source);
// print(parsing);

const res = evaluate(resolve(parse(source)));

// print(res);

export function evaluate(analysis: Either<ErrorReport, Resolution>) {
  if (analysis.isLeft()) return analysis.unwrap();
  const pkg = analysis.unwrap();
  const nodes = pkg.ast;
  const locals = pkg.locals;
  const interpreter = new Interpreter().setLocals(locals);
  let result: any = interpreter.interpret(nodes);
  return result;
}
