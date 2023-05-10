import { isDigit, isSymbol } from "./utils.js";
import { box, Maybe } from "./aux/maybe.js";
import { tkn, Token, token } from "./token.js";
import { ASTNode } from "./nodes/abstract.node.js";
import { inf, int, nan, real } from "./nodes/number.node.js";
import { nilNode } from "./nodes/nil.node.js";
import { binex } from "./nodes/binex.node.js";
import { ErrorReport, parserError, scannerError } from "./error.js";
import { falseNode, trueNode } from "./nodes/bool.node.js";
import { isSymbolNode, Sym, sym } from "./nodes/symbol.node.js";
import { call } from "./nodes/call.node.js";
import {
  dottedNumber,
  floatingPointNumber,
  integer,
  lit,
  maybe,
  some,
  word,
} from "./reader.js";
import { unary } from "./nodes/unary.node.js";
import { str } from "./nodes/string.node.js";
import { print } from "./utils.js";
import {
  Assign,
  assignment,
  isAssignmentNode,
} from "./nodes/assignment.node.js";
import { NodeType } from "./nodes/node.type.js";
import { varDef } from "./nodes/variable.node.js";
import { vector } from "./nodes/vector.node.js";
import { fnDef } from "./nodes/function.node.js";
import { block } from "./nodes/block.node.js";
import { isTupleNode, Tuple, tuple } from "./nodes/tuple.node.js";
import { cond } from "./nodes/cond.node.js";

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
  none,
  atom,
  assign,
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
}
const nil = Maybe.none<ASTNode>();

const SYMBOL = "SYMBOL";
const NUMBER = "NUMBER";
const ATOM = "ATOM";
const INFIX = "INFIX";
const PREFIX = "PREFIX";
const POSTFIX = "POSTFIX";
const GROUP = "GROUP";
const BLOCK = "BLOCK";
const ARRAY = "ARRAY";
const __ = "NIL";

type Parser =
  | typeof __
  | typeof ATOM
  | typeof GROUP
  | typeof SYMBOL
  | typeof BLOCK
  | typeof ARRAY
  | typeof NUMBER
  | typeof PREFIX
  | typeof POSTFIX
  | typeof INFIX;
type ParseRule = Parser;
type ParserRecord = Record<tkn, [ParseRule, ParseRule, bp]>;
const NONE = bp.nil;

const prog = (parsing: ASTNode[], error: ErrorReport | null) => ({
  parsing,
  error,
});
type Program = ReturnType<typeof prog>;

// § Parse Rules Record
/**
 * A table of all the parsers accessible
 * to {@link Engine.parseExpression}.
 */
const ParseRules: ParserRecord = {
  [tkn.string]: [ATOM, __, bp.atom],
  [tkn.symbol]: [SYMBOL, __, bp.atom],
  [tkn.and]: [__, INFIX, bp.and],
  [tkn.or]: [__, INFIX, bp.or],
  [tkn.nand]: [__, INFIX, bp.nand],
  [tkn.nor]: [__, INFIX, bp.nor],
  [tkn.xor]: [__, INFIX, bp.xor],
  [tkn.xnor]: [__, INFIX, bp.xnor],
  [tkn.not]: [PREFIX, __, bp.prefix],
  [tkn.is]: [__, INFIX, bp.equivalence],
  [tkn.return]: [__, __, bp.nil],
  [tkn.this]: [__, __, NONE],
  [tkn.let]: [__, __, NONE],
  [tkn.def]: [__, __, NONE],
  [tkn.while]: [__, __, NONE],
  [tkn.true]: [ATOM, __, bp.atom],
  [tkn.false]: [ATOM, __, bp.atom],
  [tkn.NaN]: [NUMBER, __, bp.atom],
  [tkn.Inf]: [NUMBER, __, bp.atom],
  [tkn.do]: [__, __, NONE],
  [tkn.rem]: [__, INFIX, bp.quotient],
  [tkn.mod]: [__, INFIX, bp.quotient],
  [tkn.div]: [__, INFIX, bp.quotient],
  [tkn.class]: [__, __, NONE],
  [tkn.if]: [__, __, NONE],
  [tkn.else]: [__, __, NONE],
  [tkn.for]: [__, __, NONE],
  [tkn.null]: [ATOM, __, bp.atom],
  [tkn.end]: [__, __, NONE],
  [tkn.error]: [__, __, NONE],
  [tkn.none]: [__, __, NONE],
  [tkn.left_paren]: [GROUP, __, bp.none],
  [tkn.right_paren]: [__, __, bp.nil],
  [tkn.left_bracket]: [ARRAY, __, bp.atom],
  [tkn.right_bracket]: [__, __, bp.nil],
  [tkn.left_brace]: [BLOCK, __, bp.nil],
  [tkn.right_brace]: [__, __, bp.nil],
  [tkn.vbar]: [__, __, bp.nil],
  [tkn.semicolon]: [__, __, NONE],
  [tkn.comma]: [__, __, NONE],
  [tkn.dot]: [__, __, bp.nil],
  [tkn.plus]: [PREFIX, INFIX, bp.sum],
  [tkn.minus]: [PREFIX, INFIX, bp.sum],
  [tkn.bang]: [__, POSTFIX, bp.postfix],
  [tkn.star]: [__, INFIX, bp.product],
  [tkn.slash]: [__, INFIX, bp.product],
  [tkn.caret]: [__, INFIX, bp.power],
  [tkn.percent]: [__, INFIX, bp.product],
  [tkn.eq]: [__, __, bp.nil],
  [tkn.deq]: [__, INFIX, bp.equality],
  [tkn.neq]: [__, INFIX, bp.equality],
  [tkn.lt]: [__, INFIX, bp.comparison],
  [tkn.leq]: [__, INFIX, bp.comparison],
  [tkn.gt]: [__, INFIX, bp.comparison],
  [tkn.geq]: [__, INFIX, bp.comparison],
  [tkn.int]: [NUMBER, __, bp.atom],
  [tkn.float]: [NUMBER, __, bp.atom],
  [tkn.scinum]: [NUMBER, __, bp.atom],
  [tkn.call]: [__, __, bp.call],
  [tkn.const]: [__, __, NONE],
};

/**
 * Returns the prefix parser from the
 * {@link parseRules}.
 */
const prefixRule = (tokenType: tkn) => ParseRules[tokenType][0];

/**
 * Returns the infix parser from the
 * {@link parseRules}.
 */
const infixRule = (tokenType: tkn) => ParseRules[tokenType][1];

/**
 * Returns the precedence of the given token type.
 */
const precedenceOf = (tokenType: tkn) => ParseRules[tokenType][2];

/**
 * This token is used purely to ensure
 * the {@link Engine.RecentToken} and
 * {@link Engine.PreviousToken} fields
 * always have some token initialized.
 */
const initialToken = token(tkn.none, "");

export class Engine {
  /**
   * The `RecentToken` property
   * maps to the token the Engine
   * last scanned.
   */
  private RecentToken: Token;

  /**
   * Strings to tokenize, parse,
   * or evaluate are always stored
   * in the `InputString` field.
   */
  private Input: string;

  /**
   * The `StartIndex` maps to
   * the character index of
   * the current lexeme.
   */
  private StartIndex: number;

  /**
   * The `CurrentIndex` maps to
   * the {@link Engine.Input} index
   * the engine’s scanner is currently
   * on.
   */
  private CurrentIndex: number;

  /**
   * The `Line` property
   * maps to a line number in
   * {@link Engine.Input}. Specifically,
   * the line where the
   * {@link Engine.RecentToken} was
   * generated.
   */
  private Line: number;

  /**
   * The `Column` property maps
   * to the column the
   * {@link Engine.RecentToken}
   * was generated.
   */
  private Column: number;

  /**
   * Records the node parsed
   * just before {@link Engine.recentNode}.
   */
  private LastNode: Maybe<ASTNode>;

  /**
   * The `Error` property maps to either `null`
   * or an {@link ErrorReport}. If an error occurs
   * during the scanning or parsing stage, this
   * field will be initialized.
   *
   * __References__.
   * 1. _See also_ {@link Engine.syntaxError} (the method
   *   called for errors during parsing).
   */
  private Error: ErrorReport | null;

  // § Engine Constructor ============================================
  constructor() {
    this.Input = "";
    this.LastNode = nil;
    this.RecentToken = initialToken;
    this.Peek = initialToken;
    this.Previous = initialToken;
    this.StartIndex = 0;
    this.CurrentIndex = 0;
    this.Column = 0;
    this.Line = 0;
    this.Error = null;
  }

  /**
   * Initializes the Engine’s state.
   * This method should always be called
   * before invoking, and before returning
   * from, the following methods:
   *
   * 1. {@link Engine.tokenize}
   * 2. {@link Engine.parse}
   * 3. {@link Engine.evaluate}
   */
  private init(src: string) {
    this.Input = src;
    this.LastNode = nil;
    this.RecentToken = initialToken;
    this.Peek = initialToken;
    this.Previous = initialToken;
    this.StartIndex = 0;
    this.CurrentIndex = 0;
    this.Column = 0;
    this.Line = 0;
    this.Error = null;
  }

  /**
   * Returns true if the Engine has
   * no more characters to scan.
   */
  private atEnd() {
    return (
      this.CurrentIndex >= this.Input.length
    ) || (this.Error !== null);
  }

  /**
   * Returns true if the Engine is
   * in the OK state and false otherwise.
   *
   * __References__.
   * 1. _See also_ {@link Engine.State} (providing
   *   a broader description of the Engine’s state).
   */
  private isSafe() {
    return this.Error === null;
  }

  /**
   * The `lexeme` method returns a slice
   * of the current {@link Engine.Input},
   * based on {@link Engine.StartIndex} and
   * {@link Engine.CurrentIndex}.
   */
  private lexeme() {
    return this.Input.slice(this.StartIndex, this.CurrentIndex);
  }

  /**
   * Creates a new {@link Token}. We use
   * a separate method for token creation
   * to ensure every token generated has
   * a line number and a column.
   *
   * @param type - The token’s defined type.
   * @param lexeme - The token’s given lexeme.
   * @returns A new Token.
   *
   * __References__.
   * 1. For token type definitions, _see_ {@link tkn}.
   * 2. _See also_ {@link token} (implementing the Token
   * factory function used).
   */
  private newToken(type: tkn, lexeme?: string) {
    const line = this.Line;
    const column = this.Column;
    lexeme = lexeme ? lexeme : this.lexeme();
    const out = token(type, lexeme, line, column);
    this.RecentToken = out;
    return out;
  }

  /**
   * Generates a lexical error and initializes
   * the {@link Engine.Error} field.
   * If this method is called, the engine will cease
   * all further operations.
   */
  private lexicalError(message: string) {
    const out = this.newToken(tkn.error, message);
    this.Error = scannerError(message, out);
    return out;
  }

  /**
   * Returns the next character within
   * {@link Engine.Input}, given the
   * {@link Engine.CurrentIndex}.
   *
   * __References__.
   * 1. _See also_ {@link Engine.getNextToken} (the
   * predominant user of this method).
   */
  private getChar() {
    this.Column++;
    return this.Input[this.CurrentIndex++];
  }

  /**
   * Returns the character at
   * {@link Engine.CurrentIndex}, _without_
   * consuming the character.
   */
  private peekChar() {
    return this.Input[this.CurrentIndex];
  }

  /**
   * Returns the character at one more than the
   * {@link Engine.CurrentIndex}, _without_
   * consuming the character.
   */
  private peekNextChar() {
    if (this.CurrentIndex + 1 >= this.Input.length) {
      return "";
    }
    return this.Input[this.CurrentIndex + 1];
  }

  /**
   * The `tick` method is used to increment both
   * the {@link Engine.Column} and
   * {@link Engine.CurrentIndex} (scanner methods
   * should never directly mutate these properties).
   * Parsing methods should never call this method.
   */
  private tick() {
    this.Column++;
    this.CurrentIndex++;
  }

  /**
   * Continously moves {@link Engine.CurrentIndex}
   * forward at every whitespace character.
   * This has the effect of skipping such
   * characters.
   */
  private skipWhitespace() {
    while (this.canLoop()) {
      const c = this.peekChar();
      if (this.Error !== null) break;
      switch (c) {
        case " ":
        case "\t":
          this.tick();
          break;
        case "\r":
        case "\n":
          this.tick();
          this.Line++;
          this.Column = 0;
          break;
        default:
          return;
      }
    }
  }

  /**
   * Given the `char` argument,
   * increments {@link Engine.CurrentIndex}
   * if the given character matches, and returns
   * true. Otherwise, returns false without
   * an increment.
   */
  private match(char: string) {
    if (this.atEnd()) return false;
    if (this.Input[this.CurrentIndex] !== char) {
      return false;
    }
    this.tick();
    return true;
  }

  /**
   * Returns the token corresponding
   * to the given symbol.
   *
   * @param lexeme - The lexeme to tokenize.
   */
  private determineSymbolType(lexeme: string) {
    // deno-fmt-ignore
    switch (lexeme) {
      case "and": return tkn.and;
      case "or": return tkn.or;
      case "nand": return tkn.nand;
      case "nor": return tkn.nor;
      case "xor": return tkn.xor;
      case "xnor": return tkn.xnor;
      case "not": return tkn.not;
      case "is": return tkn.is;
      case "return": return tkn.return;
      case "this": return tkn.this;
      case "let": return tkn.let;
      case "const": return tkn.const;
      case "def": return tkn.def;
      case "while": return tkn.while;
      case "true": return tkn.true;
      case "false": return tkn.false;
      case "NaN": return tkn.NaN;
      case "Inf": return tkn.Inf;
      case "do": return tkn.do;
      case "rem": return tkn.rem;
      case "mod": return tkn.mod;
      case "div": return tkn.div;
      case "class": return tkn.class;
      case "if": return tkn.if;
      case "else": return tkn.else;
      case "for": return tkn.for;
      case "null": return tkn.null;
      default: return tkn.symbol;
    }
  }

  /**
   * Scans for keywords and identifiers.
   */
  private scanSymbol() {
    const engine = this;
    while (
      engine.canLoop() &&
      (isSymbol(engine.peekChar()) || isDigit(engine.peekChar()))
    ) {
      engine.tick();
      if (engine.atEnd()) {
        break;
      }
    }
    const text = engine.Input.slice(
      engine.StartIndex,
      engine.CurrentIndex,
    );
    const symbolTokenType = engine.determineSymbolType(text);
    return engine.newToken(symbolTokenType);
  }

  /**
   * Returns the next token from the
   * {@link Engine.Input}.
   */
  private scanNextToken() {
    if (this.Error) return this.newToken(tkn.end, "END");
    this.skipWhitespace();

    if (this.atEnd()) {
      return this.newToken(tkn.end, "END");
    }

    this.StartIndex = this.CurrentIndex;

    if (isSymbol(this.peekChar())) {
      return this.scanSymbol();
    }

    if (isDigit(this.peekChar())) {
      return this.scanNumber();
    }

    const char = this.getChar();
    const peek = this.peekChar();

    if (char === "." && isDigit(peek)) {
      return this.scanNumber(tkn.float);
    }

    let type = tkn.error;

    // deno-fmt-ignore
    switch (char) {
      case '(': type = tkn.left_paren; break;
      case ')': type = tkn.right_paren; break;
      case '[': type = tkn.left_bracket; break;
      case ']': type = tkn.right_bracket; break;
      case '{': type = tkn.left_brace; break;
      case '}': type = tkn.right_brace; break;
      case ',': type = tkn.comma; break;
      case '-': type = tkn.minus; break;
      case '.': type = tkn.dot; break;
      case '+': type = tkn.plus; break;
      case '^': type = tkn.caret; break;
      case ';': type = tkn.semicolon; break;
      case '*': type = tkn.star; break;
      case '|': type = tkn.vbar; break;
      case '/': type = tkn.slash; break;
      case '!': type = this.match('=') ? tkn.neq : tkn.bang; break;
      case '=': type = this.match('=') ? tkn.deq : tkn.eq; break;
      case '<': type = this.match('=') ? tkn.leq : tkn.lt; break;
      case '>': type = this.match('=') ? tkn.geq : tkn.gt; break;
      case '"': return this.scanStringLiteral();
    }
    return type === tkn.error
      ? this.lexicalError(`Unrecognized token: [${char}]`)
      : this.newToken(type);
  }

  /**
   * Scans a string value. Strings always
   * start with an opening `"` (double quote) and
   * end with a closing `"`.
   *
   * __References__.
   * 1. See {@link Engine.getNextToken} (containing
   *    the triggering case for calling this method).
   */
  private scanStringLiteral() {
    const engine = this;
    while (
      (engine.peekChar() !== `"`) &&
      (engine.canLoop())
    ) {
      engine.tick();
      if (engine.peekChar() === `\n`) {
        engine.Line++;
        engine.Column = 0;
      }
    }
    if (engine.atEnd()) {
      return engine.lexicalError("Unterminated string.");
    }
    engine.tick();
    const lexeme = this.Input.slice(
      engine.StartIndex + 1,
      engine.CurrentIndex - 1,
    );
    return engine.newToken(tkn.string, lexeme);
  }

  /**
   * The `canLoop` method is the primary
   * guard for most loops within the engine.
   * It returns false if the engine is no longer
   * in the ok state or if the engine has reached
   * the end of input (prematurely or otherwise).
   * Else, returns true.
   */
  private canLoop() {
    return !this.atEnd() && this.isSafe();
  }

  /**
   * Scans for a number token.
   * Numbers are goverened by the following
   * premises.
   *
   * Digit-separated numbers are recognized.
   *
   * E.g., `132_122`, or `2_854.321_553`.
   * If a separator is used (the character `_`),
   * it must always be followed by either:
   *
   * 1. Three digits (the digitGroupSize), or
   * 2. A dot followed by three digits
   *
   * @param type - The initial numeric token type.
   * The scanner method allows setting this type
   * because we allow dotted numbers.
   */
  private scanNumber(type: tkn = tkn.int) {
    const engine = this;
    let hasSeparators = false;
    while (engine.canLoop() && isDigit(this.peekChar())) {
      engine.tick();

      // If the current character is a digit and the
      // the next character is the separator `_`,
      // then this is a separated number.
      if (this.peekChar() === "_" && isDigit(this.peekNextChar())) {
        const digitGroupSize = 3;
        let digitCount = 0;
        while ((digitCount < digitGroupSize) && this.canLoop()) {
          engine.tick();
          digitCount++;
        }

        // If we don’t get three digits following
        // the `_`, then this is not a valid
        // digit group.
        if (digitCount !== digitGroupSize) {
          const msg = `Invalid separated number.`;
          return engine.lexicalError(msg);
        }
        hasSeparators = true;
      }

      // If the current character is a dot
      // and the next character is a digit,
      // then this a floating point number.
      if (
        (engine.peekChar() === ".") &&
        isDigit(engine.peekNextChar())
      ) {
        type = tkn.float; // change the output token type
        engine.tick();

        // We continue incrementing so long as we see digits.
        // This consumes the digits following the `.`
        while (isDigit(engine.peekChar()) && this.canLoop()) {
          engine.tick();
        }
      }

      // If the current character is an `E`, then
      if (engine.peekChar() === "E") {
        engine.tick();
        if (
          (engine.peekChar() === "+") || // allow leading '+'
          (engine.peekChar() === "-") || // allow leading '-'
          (isDigit(engine.peekNextChar())) // but only integer powers
        ) {
          type = tkn.scinum;
          engine.tick();
          while (isDigit(engine.peekChar()) && this.canLoop()) {
            engine.tick();
          }
        } else {
          return engine.lexicalError("Invalid scientific number.");
        }
      }
    }
    // replace the thousands separators to ensure correct
    // number cast in parser
    let lexeme = this.lexeme();
    if (hasSeparators) {
      lexeme = lexeme.replaceAll("_", "");
    }
    return engine.newToken(type, lexeme);
  }

  /**
   * Tokenizes the given input string.
   * This method is used primarily for testing,
   * and isn’t directly used by the Engine
   * substantively. It is exposed in the public API
   * as a debugging tool.
   *
   * @param text
   * The input text to tokenize.
   *
   * @param fn
   * An optional callback that takes a Token and
   * returns some type X. The return type
   * of the callback will be pushed to the
   * output array. Defaults to the token scanned.
   *
   * __References__.
   * 1. _See_ {@link Token} (defining _Token_).
   */
  public tokenize<X = Token>(text: string, fn?: (t: Token) => X) {
    this.init(text);
    const output: X[] = [];
    while (this.canLoop()) {
      const token = this.scanNextToken();
      output.push((fn ? fn(token) : token) as unknown as X);
    }
    return output;
  }

  // § Parser Methods ================================================

  /**
   * The `peek` property holds the next
   * token scanned. This gives the parser
   * a lookahead of one.
   */
  private Peek: Token;
  /**
   * The `Previous` property
   * holds the token most recently
   * scanned.
   */
  private Previous: Token;

  /**
   * Tokenizes the next character and returns
   * the current {@link Engine.Peek}.
   */
  private advance() {
    const token = this.Peek;
    this.Previous = token;
    this.Peek = this.scanNextToken();
    return token;
  }

  /**
   * Initializes the engine’s {@link Engine.Error}
   * property. Calling this method will halt any
   * further work.
   *
   * @param message - An error message to report.
   * @param token - The token received by the called
   * parser.
   *
   * @returns An AST Node of nothing.
   */
  private syntaxError(message: string, token: Token): Maybe<ASTNode> {
    this.Error = parserError(message, token);
    return nil;
  }

  /**
   * Parses the given input text.
   * Returns either an {@link ErrorReport} or
   * a {@link Maybe} of type {@link ASTNode}.
   */
  public parse(text: string): Program {
    this.init(text);
    this.advance();
    const result = prog([], null);
    while (this.canLoop()) {
      if (this.Error !== null) break;
      const node = this.STATEMENT();
      if (!node.isNothing()) {
        result.parsing.push(node.unwrap(nilNode));
      }
    }
    if (this.Error) {
      result.error = this.Error;
      result.parsing = [];
      return result;
    }
    return result;
  }

  /**
   * Parses a single statement.
   */
  private STATEMENT() {
    if (this.Error) return nil;
    switch (this.Peek.type) {
      case tkn.if:
        return this.COND();
      case tkn.def:
        return this.FUNCTION_DECLARATION();
      case tkn.let:
        return this.VARIABLE_DECLARATION();
      default:
        return this.EXPRESSION();
    }
  }

  /**
   * Returns true if no semicolon
   * is needed to terminate a given
   * statement.
   */
  private noSemicolonNeeded() {
    return (
      this.Peek.isEOF() ||
      this.Peek.is(tkn.right_brace) ||
      this.Previous.is(tkn.right_brace)
    );
  }

  /**
   * Given the argument token type,
   * _advances the engine_ and returns
   * true if the argument matches the
   * current {@link Engine.Peek}.
   * Otherwise, returns false without
   * advancing.
   *
   * __References__.
   * 1. _See also_ {@link Engine.Check} (the
   *    engine method that checks for a match
   *    without any advancement).
   */
  private matches(tokenType: tkn) {
    if (this.check(tokenType)) {
      this.advance();
      return true;
    }
    return false;
  }

  delimited<T extends ASTNode>(
    openingDelimiter: [tkn, string],
    handler: (node: ASTNode) => T | null,
    separator: tkn,
    closingDelimiter: [tkn, string],
    strict?: string,
  ) {
    const result: T[] = [];
    const [d1, e1] = openingDelimiter;
    if (this.Previous.type !== d1) {
      return this.syntaxError(e1, this.Previous);
    }
    const [d2, e2] = closingDelimiter;
    if (!this.check(d2)) {
      do {
        const node = this.parseExpression();
        const r = handler(node.unwrap(nilNode));
        if (r !== null) {
          result.push(r);
        } else if (strict) {
          return this.syntaxError(strict, this.Previous);
        }
      } while (this.matches(separator) && this.canLoop());
    }
    if (!this.matches(d2)) {
      return this.syntaxError(e2, this.Previous);
    }
    return result;
  }

  ARRAY() {
    const node = this.delimited(
      [tkn.left_bracket, `[ARRAY]: Expected '['`],
      (node) => node,
      tkn.comma,
      [tkn.right_bracket, `[ARRAY]: Expected ']'`],
    );
    if (Array.isArray(node)) {
      return box(vector(node));
    }
    return node;
  }

  /**
   * Parses a variable declaration.
   */
  private VARIABLE_DECLARATION() {
    const engine = this;
    engine.advance(); // eat the let
    const node = engine.EXPRESSION().map((astnode) => {
      if (isAssignmentNode(astnode)) {
        return varDef(astnode.symbol(), astnode.value());
      } else if (isSymbolNode(astnode)) {
        return varDef(astnode, nilNode);
      } else return null;
    });
    if (node.isNothing()) {
      return this.syntaxError(
        `Invalid variable declaration`,
        engine.Peek,
      );
    }
    return node;
  }

  private consume(
    then: (token: Token) => Maybe<ASTNode>,
  ) {
    if (this.Error) return nil;
    const tk = this.advance();
    return then(tk);
  }

  private eat(
    tokenType: tkn,
    errorMessage: string,
    then: (token: Token) => Maybe<ASTNode>,
  ) {
    if (this.Error) return nil;
    if (this.check(tokenType)) {
      const tk = this.advance();
      return then(tk);
    } else {
      return this.syntaxError(errorMessage, this.Peek);
    }
  }

  /**
   * Returns true if the {@link Engine.Peek}
   * is the given token type. False otherwise.
   */
  private check(tokenType: tkn) {
    if (this.atEnd() || this.Error !== null) return false;
    return this.Peek.type === tokenType;
  }

  BLOCK() {
    this.advance(); // eat the opening `{`
    const statements: ASTNode[] = [];
    while (this.Peek.type !== tkn.right_brace && this.canLoop()) {
      const stmt = this.STATEMENT();
      if (!stmt.isNothing()) {
        const n = stmt.unwrap(nilNode);
        statements.push(n);
      }
    }
    return this.eat(
      tkn.right_brace,
      `Expected '}' to close block`,
      () => box(block(statements)),
    );
  }
  List<T extends ASTNode>(
    filter: (node: ASTNode) => node is T,
  ) {
    this.advance();
    const elems = this.delimited(
      [tkn.left_paren, `Expected '(' to open tuple`],
      (node) => filter(node) ? node : null,
      tkn.comma,
      [tkn.right_paren, `Expected ')' to close tuple`],
      `Tuples must be homogenous`,
    );
    if (Array.isArray(elems)) {
      return box(tuple<T>(elems));
    }
    return box(tuple<T>([]));
  }

  FUNCTION_DECLARATION(): Maybe<ASTNode> {
    this.advance(); // eat the def
    const fnameError = `Expected valid function name.`;
    const expectedAssign = `Expected assignment operator '='`;
    return this.eat(
      tkn.symbol,
      fnameError,
      (t) =>
        box(sym(t)).ap((name) =>
          this.List(isSymbolNode).ap((parameters) =>
            this.eat(tkn.eq, expectedAssign, () =>
              this.EXPRESSION().map(
                (body) =>
                  fnDef(
                    name,
                    parameters.items.toArray(),
                    body,
                  ),
              ))
          )
        ),
    );
  }

  private COND() {
    const engine = this;
    engine.advance(); // eat the if
    const condition = engine.parseExpression(bp.nil).unwrap(nilNode)
    engine.advance();
    const ifBlock = engine.BLOCK().unwrap(nilNode);
    let elseBlock:ASTNode = nilNode;
    if (engine.matches(tkn.else)) {
      elseBlock = engine.BLOCK().unwrap(nilNode)
    }
    return box(cond(condition, ifBlock, elseBlock));
  }

  private CONDITIONAL(): Maybe<ASTNode> {
    const engine = this;
    engine.advance(); // eat the `if`

    // deno-fmt-ignore
    const parseBranch = (condition: ASTNode) =>
      engine.STATEMENT().map((body) =>
        cond(
          condition,
          body,
          engine.matches(tkn.else) 
            ? engine.STATEMENT().unwrap(nilNode) 
            : nilNode,
        )
      );

    const parseCondition = () =>
      engine.parseExpression().ap((condition) =>
        engine.eat(
          tkn.right_paren,
          `Expected ')' to close condition`,
          () => parseBranch(condition),
        )
      );

    return engine.eat(
      tkn.left_paren,
      `Expected '(' before condition`,
      parseCondition,
    );
  }

  /**
   * Parses an expression statement.
   */
  private EXPRESSION() {
    const result = this.parseExpression();
    return this.noSemicolonNeeded() ? result : this.eat(
      tkn.semicolon,
      `Expected ';' to end statement.`,
      () => result,
    );
  }

  /**
   * Parses a symbol.
   */
  private SYMBOL(): Maybe<Assign> | Maybe<Sym> {
    const token = this.Previous;
    if (this.matches(tkn.eq)) {
      const def = this.parseExpression();
      const name = sym(token);
      return def.map<Assign>((n) => assignment(name, n));
    }
    return box(sym(token));
  }

  /**
   * Parses a numeric value.
   */
  private NUMBER(): Maybe<ASTNode> {
    const token = this.Previous;
    let out = nil;
    switch (token.type) {
      case tkn.NaN:
        out = box(nan);
        break;
      case tkn.Inf:
        out = box(inf);
        break;
      case tkn.int:
        out = box(int(token.lexeme));
        break;
      case tkn.float:
        out = box(real(token.lexeme));
        break;
      case tkn.scinum:
        out = this.parseScientificNumber();
        break;
    }
    if (out.isNothing()) {
      const message = `Unknown literal: ${token.lexeme}`;
      return this.syntaxError(message, token);
    }
    if (this.Peek.isSymbol()) {
      const rhs = this.parseExpression();
      const op = this.Peek.clone("*", tkn.star);
      const right = rhs.unwrap(nilNode);
      return out.map((node) => binex(node, op, right));
    }
    return out;
  }

  private parseScientificNumber(): Maybe<ASTNode> {
    const token = this.Previous;
    const lexeme = token.lexeme;
    const args = lexeme.split("E");
    const message = `Invalid scientific number: ${lexeme}`;
    if (args.length !== 2) {
      return this.syntaxError(message, token);
    }
    const base = some([
      dottedNumber.map((r) => real(r)),
      floatingPointNumber.map((r) => real(r)),
      integer.map((r) => int(r)),
    ]).run(args[0]);

    if (base.erred) {
      return this.syntaxError(message, token);
    }

    const exp = word([
      maybe(lit("+").or(lit("-"))),
      integer,
    ]).map((r) => int(r)).run(args[1]);

    if (exp.erred) {
      return this.syntaxError(message, token);
    }
    const tokenCopy = token.clone("E", tkn.call);
    const name = sym(tokenCopy);
    const arg1 = base.result;
    const arg2 = exp.result;
    const node = call(name, [arg1, arg2]);
    return box(node);
  }

  /**
   * Parses an atomic value, other than numeric
   * values. Numeric values are handled separately
   * because we allow implicit multiplication.
   *
   * __References__.
   * 1. For the numeric value parser,
   *    _see_ {@link Engine.NUMBER}.
   */
  private ATOM(): Maybe<ASTNode> {
    const token = this.Previous;
    switch (token.type) {
      case tkn.string:
        return box(str(token.lexeme));
      case tkn.null:
        return box(nilNode);
      case tkn.false:
        return box(falseNode);
      case tkn.true:
        return box(trueNode);
    }
    const message = `Unknown literal: ${token.lexeme}`;
    return this.syntaxError(message, token);
  }

  private GROUP(): Maybe<ASTNode> {
    const expr = this.parseExpression();
    const peek = this.advance();
    if (peek.type !== tkn.right_paren) {
      const msg = `Expected closing ')'`;
      return this.syntaxError(msg, peek);
    }
    return expr;
  }

  /**
   * Parses expressions with prefix operators.
   */
  private PREFIX(): Maybe<ASTNode> {
    const op = this.Previous;
    const operand = this.parseExpression();
    if (operand.isNothing()) {
      const message = `Invalid right-hand side of [${op.lexeme}].`;
      return this.syntaxError(message, op);
    }
    return operand.map((arg) => unary(op, arg));
  }

  /**
   * Parses expressions with postfix operators.
   */
  private POSTFIX(): Maybe<ASTNode> {
    const peek = this.Previous;
    const arg = this.LastNode;
    return arg.map((a) => unary(peek, a));
  }

  /**
   * Parses expressions with infix operators.
   */
  private INFIX(): Maybe<ASTNode> {
    const op = this.Previous;
    const left = this.LastNode;
    const right = this.parseExpression();
    const rhs = right.unwrap(nilNode);
    return left.map((node) => binex(node, op, rhs));
  }

  /**
   * Returns the AST Node of nothing.
   * This is purely used to ensure the
   * {@link ParseRules} table is safe
   * to index into.
   */
  private NIL() {
    return nil;
  }

  /**
   * Parses an expression.
   * @param minBP - The default (base-case) {@link bp}.
   */
  private parseExpression(minbp = bp.none): Maybe<ASTNode> {
    if (this.Error !== null) return nil;
    let peek = this.advance();
    const prefix = prefixRule(peek.type);
    let left = this[prefix]();
    this.LastNode = left;
    while (minbp < precedenceOf(this.Peek.type) && this.canLoop()) {
      peek = this.advance();
      if (this.Peek.isEOF()) break;
      if (this.Error !== null) break;
      const infix = infixRule(peek.type);
      const right = this[infix]();
      if (right.isNothing()) return left;
      left = right;
      this.LastNode = left;
    }
    return left;
  }
}

const engine = new Engine();
const src = `
def f(x) = {
  let y = x^2;
}
`;
const tree = engine.parse(src);
print(engine);
print(tree, "json");
