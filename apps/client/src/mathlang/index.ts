import treeify from "treeify";
import { mathfn } from "./util.js";
import { amid, apart, ch, chain, choice, P } from "./combinators.js";
import { isNumeric, literals, node, token } from "./nodes.js";
const { log: show } = console;
const view = (x: any) => show(treeify.asTree(x, true, true));

function Parser({ ast }: ParserSettings) {
  const binexBuilder = ast === "conventional" ? binaryExpr : naryExpr;

  function parse(src: string): astnode[] {
    const state = enstate(src);
    let ast: astnode[] = [];
    while (state.start < state.end && state.remaining) {
      const node = fexpr(state);
      if (state.error.length) return state.error;
      ast.push(node);
    }
    return ast;
  }

  /**
   * Parses a function definition.
   */
  function fexpr(state: State): astnode {
    const holder = "fexpr";
    const parend = amid(ch("("), ch(")"));
    const comma_separated = apart(ch(","));
    const params = parend(comma_separated(token.symbol.variable));
    const fndecl = chain([token.symbol.variable, params, ch("=")]);
    const p = check(state, [fndecl]);
    if (p !== null) {
      const fname = token.symbol.variable.run(state.remaining);
      tick(state, fname, holder);
      const args = params.run(state.remaining);
      tick(state, args, holder);
      eat(state, ch("="), holder);
      let body = expression(state);
      return node.fndef(
        fname.res,
        args.res,
        body,
      );
    }
    return expression(state);
  }

  /** Parses an expression. */
  function expression(state: State): astnode {
    return bitwiseor(state);
  }

  function bitwiseor(state: State): astnode {
    return binexBuilder(
      state,
      bitwiseand,
      ["|"],
      "bitwise-or-expression-parser",
    );
  }

  function bitwiseand(state: State): astnode {
    return binexBuilder(
      state,
      equality,
      ["&"],
      "bitwise-and-expression-parser",
    );
  }

  /** Parses an equality expression. */
  function equality(state: State): astnode {
    return binexBuilder(
      state,
      comparison,
      ["==", "!=", "="],
      "equality-expression-parser",
    );
  }

  /** Parses a comparison expression. */
  function comparison(state: State): astnode {
    return binexBuilder(
      state,
      bitshift,
      [">=", "<=", ">", "<"],
      "comparison-expression-parser",
    );
  }

  /** Parses a bitshift. */
  function bitshift(state: State): astnode {
    return binexBuilder(
      state,
      convert,
      [">>", "<<", ">>>"],
      "bitshift-expression-parser",
    );
  }

  /** Parses a conversion expression. */
  function convert(state: State): astnode {
    return binexBuilder(
      state,
      sum,
      ["to"],
      "convert-expression-parser",
    );
  }

  /** Parses a sum expression. */
  function sum(state: State): astnode {
    return binexBuilder(
      state,
      product,
      ["+", "-"],
      "sum-expression-parser",
    );
  }

  /** Parses a product expression. */
  function product(state: State): astnode {
    return binexBuilder(
      state,
      quotient,
      ["*", "/"],
      "product",
    );
  }

  /**
   * Parses a quotient expression.
   * - `%` - integer division
   * - `rem` - remainder
   * - `mod` - modulo
   */
  function quotient(state: State): astnode {
    return binexBuilder(
      state,
      unaryPrefix,
      ["%", "rem", "mod"],
      "quotient-expression-parser",
    );
  }

  /** Parses a unary prefix expression. */
  function unaryPrefix(state: State): astnode {
    const holder = "unary-prefix-expression-parser";
    const op = check(state, ["+", "~", "not"]);
    if (op !== null) {
      const operator = op.res[0];
      tick(state, op, holder);
      const right = unaryPrefix(state);
      return node.unex(operator, right);
    }
    return power(state);
  }

  /** Parses a power expression. */
  function power(state: State): astnode {
    return binexBuilder(
      state,
      callExpr,
      ["^"],
      "power-expression-parser",
    );
  }

  /** Parses a function call expression. */
  function callExpr(state: State): astnode {
    const holder = "call-expression-parser";
    const fname = check(state, [token.symbol.funcname, token.delimiter.lparen]);
    if (fname !== null && fname.res in mathfn) {
      const caller = token.symbol.funcname.run(state.remaining);
      tick(state, caller, holder);
      const args = parenExpr(state);
      return node.call(caller.res, args);
    }
    return primary(state);
  }

  /**
   * Parse a primary expression.
   * Long winding path here because of implicit multiplication
   * support. There are a few cases (checkmarks indicate
   * currently supported cases):
   * @example - 2x ✓
   * @example - 2x + 1 ✓
   * @example - 2(x + 1) ✓
   * @example - 2x(x + 1) ✓
   * @example - (x + 1)(x + 1) ⨉
   * The last case hasn't been handled yet and I'm not
   * sure if we want to support it. The trouble comes
   * from our support for currying: f(x)(x)(x).
   */

  function primary(state: State): astnode {
    const holder = "primary-expression-parser";
    const res = literals.run(state.remaining);
    if (isNumeric(res)) {
      tick(state, res, holder);
      if (check(state, [token.symbol.variable])) {
        return impmul(state, res);
      }
      if (check(state, ["("])) {
        const left = node.literal(res.res, res.type as litType);
        let right = parenExpr(state);
        return node.binex(left, "*", right);
      }
    }
    if (check(state, ["("])) {
      let expr = parenExpr(state);
      return expr;
    }
    if (res.err) {
      const err = state.remaining[0];
      panic(state, `Unrecognized token: ${err}`, holder);
    }
    tick(state, res, holder);
    return node.literal(res.res, res.type as litType);
  }
  
  

  function impmul(state: State, res: R<litType>): astnode {
    const holder = "implicit-multiplication-parser";
    const left = node.literal(res.res, res.type as litType);
    const varsym = token.symbol.variable.run(state.remaining);
    tick(state, varsym, holder);
    const right = node.literal(varsym.res, varsym.type as litType);
    show(right);
    const expr = node.binex(left, "*", right);
    if (check(state, ["("])) {
      let right = parenExpr(state);
      const result = node.binex(expr, "*", right);
      return result;
    }
    return expr;
  }

  /** Parses a parenthesized expression. */
  function parenExpr(state: State): astnode {
    const holder = "parenExpr";
    if (!eat(state, token.delimiter.lparen, holder)) {
      panic(state, "Missing: ‘(’", "parenExpr");
    }
    const expr = expression(state);
    if (!eat(state, token.delimiter.rparen, holder)) {
      panic(state, "Missing: ‘)’", "parenExpr");
    }
    return expr;
  }

  /* ---------------------------- Utility Functions --------------------------- */
  /**
   * Puts the state in panic mode, immediately halting execution.
   */
  function panic(state: State, error: string, parser: string) {
    state.error.push(err(error, parser));
    state.start += state.end;
  }

  /**
   * Initializes the parser state.
   * @param {string} src - The input string to parse.
   * @return {State} An object with the shape:
   * ~~~
   * type State = {
   *   src: string; // source input
   *   start: number; // current starting index
   *   end: number; // ending index
   *   previous: [number, number]; // [previous start, previous end]
   *   remaining: string; // remaining input to parse
   * }
   * ~~~
   */
  function enstate(src: string): State {
    return ({
      src,
      start: 0,
      end: src.length,
      remaining: src,
      prevtoken: "",
      error: [],
      logs: []
    });
  }

  /**
   * Checks if the remaining source contains a possible match.
   * The parser combinators will match if they encounter a match.
   * But, we don't always want that because of context. The `check`
   * function allows us to try a conditional parse. What to do
   * in the event of a successful (or unsuccessful) parse is determined
   * by the caller.
   *
   * @param {State} state - The current state object.
   * @param {P<string>[]} parsers - An array of string parsers. The function
   * takes an array of parsers because we don't want to just check for a single
   * character. For example, we might have an array token like `[1,2,3,4,5]`.
   * We can't check for that with just a single character.
   * @return {boolean} True if a match is found, false otherwise.
   */
  function check<t>(
    state: State,
    parsers: (P<t> | string)[],
  ): R<string> | null {
    const count = parsers.length;
    for (let i = 0; i < count; i++) {
      let parser = parsers[i] instanceof P
        ? parsers[i] as P<t>
        : ch(parsers[i] as string);
      const res = parser.run(state.remaining);
      if (!res.err) return res;
    }
    return null;
  }

  /**
   * Updates the current state's indices.
   * @param {State} state - The current state object.
   * @param {Res} result - The result of a string parser combinator.
   * @warn These indices may be removed in the future because the parser
   * currently only relies on the `State.remaining` property
   * for reading. They're kept for now because of pending investigations
   * into integrating an Earley parsing utility.
   */
  function tick(state: State, result: Res, holder: string) {
    show(state);
    const parsed = Array.isArray(result.res) ? result.res.join("") : result.res;
    if (state.start > state.src.length) {
      panic(state, "unexpected overread", holder);
      return;
    }
    const remainingLength = result.rem.length;
    state.prevtoken = parsed;
    state.start = state.src.length - remainingLength;
    state.remaining = result.rem;
  }

  /**
   * Consumes the token. If it matches, move forward.
   * If it doesn't don't move forward.
   */
  function eat(state: State, parser: P<string>, holder: string) {
    const res = parser.run(state.remaining);
    if (res.err) return false;
    tick(state, res, holder);
    return true;
  }

  /**
   * Parsing binary expressions always follows the same
   * form. This function is essentially a template.
   */
  function naryExpr(
    state: State,
    child: parser,
    tokens: string[],
    holder: string,
  ): astnode {
    let expr = child(state);
    const conditions = tokens.map((s) => ch(s));
    if (check(state, conditions)) {
      let out = [expr];
      let op = choice(conditions).run(state.remaining);
      while (check(state, conditions)) {
        op = choice(conditions).run(state.remaining);
        if (!op.err) tick(state, op, holder);
        let right = child(state);
        out.push(right);
      }
      expr = node.nary(out, op.res);
    }
    return expr;
  }

  /**
   * Parsing binary expressions always follows the same
   * form. This function is essentially a template.
   */
  function binaryExpr(
    state: State,
    child: parser,
    tokens: (string | P<string>)[],
    holder: string,
  ): astnode {
    let expr = child(state);
    const conditions = tokens.map((s) => s instanceof P ? s : ch(s));
    while (check(state, conditions)) {
      let op = choice(conditions).run(state.remaining);
      if (!op.err) tick(state, op, holder);
      let right = child(state);
      expr = node.binex(expr, op.res, right);
    }
    return expr;
  }

  function err(error: string, parser: string): errnode {
    return ({
      error,
      origin: `Parser[${parser}]`,
      type: "error",
    });
  }

  return { parse };
}

/* ------------------- Live Testing - Remove in Production ------------------ */

const parser = Parser({
  ast: "conventional",
});
const result = parser.parse("[1]");
show(result);
view(result);
