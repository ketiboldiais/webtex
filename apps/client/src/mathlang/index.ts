import treeify from "treeify";
import { mathfn } from "./constants.js";
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
      if (state.error) return state.error;
      ast.push(node);
    }
    return ast;
  }

  /**
   * Parses a function definition.
   */
  function fexpr(state: State) {
    const parend = amid(ch("("), ch(")"));
    const comma_separated = apart(ch(","));
    const params = parend(comma_separated(token.symbol.variable));
    const fndecl = chain([token.symbol.variable, params, token.relation["="]]);
    const p = check(state, [fndecl]);
    if (p !== null) {
      const fname = token.symbol.variable.run(state.remaining);
      tick(state, fname);
      const args = params.run(state.remaining);
      tick(state, args);
      eat(state, token.relation["="]);
      let body = expression(state);
      return node.fndef(
        fname.res,
        args.res,
        body,
      );
    }
    return expression(state);
  }

  /**
   * Parses an expression.
   *
   * ~~~bnf
   * <expression> ::= <equality>
   * ~~~
   */
  function expression(state: State): astnode {
    return equality(state);
  }

  /**
   * Parses an equality expression.
   *
   * ~~~bnf
   * <equality> ::= <comparison>
   *              | <equality> ('!='|'='|'==') <comparison>
   * ~~~
   */

  function equality(state: State) {
    return binexBuilder(
      state,
      comparison,
      [
        token.relation["!="],
        token.relation["=="],
        token.relation["="],
      ],
    );
  }

  /**
   * Parses a comparison expression.
   *
   * ~~~bnf
   * <comparison> ::= <sum>
   *                | <comparison> ('>='|'<='|'>'|'<') <sum>
   * ~~~
   */
  function comparison(state: State) {
    return binexBuilder(
      state,
      sum,
      [
        token.relation[">="],
        token.relation["<="],
        token.relation[">"],
        token.relation["<"],
      ],
    );
  }

  /**
   * Parses a sum expression.
   *
   * ~~~bnf
   * <sum> ::= <product>
   *         | <sum> ('+'|'-') <product>
   * ~~~
   */
  function sum(state: State) {
    return binexBuilder(
      state,
      product,
      [token.binop["+"], token.binop["-"]],
    );
  }

  /**
   * Parses a product expression.
   *
   * ~~~bnf
   * <product> ::= <quotient>
   *             | <product> (`*`|`/`) <quotient>
   * ~~~
   */
  function product(state: State) {
    return binexBuilder(
      state,
      quotient,
      [token.binop["*"], token.binop["/"]],
    );
  }

  /**
   * Parses a quotient expression.
   * - `%` - integer division
   * - `rem` - remainder
   * - `mod` - modulo
   *
   * ~~~bnf
   * <quotient> ::= <unaryPrefix>
   *              | <quotient> (`%`|`rem`|`mod`) <unaryPrefix>
   * ~~~
   */
  function quotient(state: State) {
    return binexBuilder(
      state,
      unaryPrefix,
      [
        token.binop["%"],
        token.binop.rem,
        token.binop.mod,
      ],
    );
  }

  /**
   * Parses a unary prefix expression.
   *
   * ~~~bnf
   * <unaryPrefix> ::= <power>
   *                 | ('+'|'not'|'~') <unaryPrefix>
   * ~~~
   */
  function unaryPrefix(state: State): astnode {
    const op = check(state, [
      token.unaryop["+"],
      token.unaryop["~"],
      token.unaryop.not,
    ]);
    if (op !== null) {
      const operator = op.res[0];
      tick(state, op);
      const right = unaryPrefix(state);
      return node.unex(operator, right);
    }
    return power(state);
  }

  /**
   * Parses a power.
   *
   * ~~~bnf
   * <power> ::= <primary>
   *           | <power> (`^`) <primary>
   * ~~~
   */
  function power(state: State) {
    return binexBuilder(
      state,
      callExpr,
      [token.binop["^"]],
    );
  }

  /**
   * Parses a function call expression.
   */
  function callExpr(state: State) {
    const fname = check(state, [token.symbol.funcname, token.delimiter.lparen]);
    if (fname !== null && fname.res in mathfn) {
      const caller = token.symbol.funcname.run(state.remaining);
      tick(state, caller);
      const args = parenExpr(state);
      return node.call(caller.res, args);
    }
    return primary(state);
  }

  /**
   * Parse a primary expression.
   *
   * ~~~bnf
   * <primary> ::= <number-hexadecimal>
   *             | <number-binary>
   *             | <number-octal>
   *             | <number-scientific>
   *             | <number-rational>
   *             | <number-integer>
   *             | 'false'
   *             | 'true'
   *             | 'Infinity'
   *             | 'NaN'
   *             | <sym>
   *             | '(' expression ')'
   * ~~~
   *
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
  function primary(state: State) {
    const res = literals.run(state.remaining);
    const Lparen = check(state, [token.delimiter.lparen]);
    /** */
    if (isNumeric(res)) {
      tick(state, res);
      if (check(state, [token.symbol.variable])) {
        const left = node.literal(res.res, res.type as litType);
        const varsym = token.symbol.variable.run(state.remaining);
        tick(state, varsym);
        const right = node.literal(varsym.res, res.type as litType);
        const expr = node.binex(left, "*", right);
        if (check(state, [token.delimiter.lparen])) {
          let right = parenExpr(state);
          const result = node.binex(expr, "*", right);
          return result;
        }
        return expr;
      }
      if (check(state, [token.delimiter.lparen])) {
        const left = node.literal(res.res, res.type as litType);
        let right = parenExpr(state);
        return node.binex(left, "*", right);
      }
    }
    if (Lparen !== null) {
      let expr = parenExpr(state);
      return expr;
    }
    if (res.err) {
      const err = state.remaining[0];
      panic(state, `Unrecognized token: ${err}`, "primary");
    }
    tick(state, res);
    return node.literal(res.res, res.type as litType);
  }

  function parenExpr(state: State) {
    if (!eat(state, token.delimiter.lparen)) {
      panic(state, "Missing: ‘(’", "parenExpr");
    }
    const expr = expression(state);
    if (!eat(state, token.delimiter.rparen)) {
      panic(state, "Missing: ‘)’", "parenExpr");
    }
    return expr;
  }

  /* ---------------------------- Utility Functions --------------------------- */
  /**
   * Puts the state in panic mode, immediately halting execution.
   */
  function panic(state: State, error: string, parser: string) {
    state.error = err(error, parser);
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
      previous: [0, src.length],
      remaining: src,
      error: null,
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
  function check<t>(state: State, parsers: P<t>[]): R<t> | null {
    const count = parsers.length;
    for (let i = 0; i < count; i++) {
      const parser = parsers[i];
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
  function tick(state: State, result: Res) {
    let resultLength = result.res.length;
    if (Array.isArray(result.res)) resultLength = result.res.join("").length;
    const remainingLength = result.rem.length;
    state.previous = [state.start, state.start + resultLength];
    state.start = state.src.length - remainingLength;
    state.remaining = result.rem;
  }

  /**
   * Consumes the token. If it matches, move forward.
   * If it doesn't don't move forward.
   */
  function eat(state: State, parser: P<string>) {
    const res = parser.run(state.remaining);
    if (res.err) return false;
    tick(state, res);
    return true;
  }

  /**
   * Parsing binary expressions always follows the same
   * form. This function is essentially a template.
   */
  function naryExpr(
    state: State,
    child: parser,
    conditions: P<string>[],
  ) {
    let expr = child(state);
    if (check(state, conditions)) {
      let out = [expr];
      let op = choice(conditions).run(state.remaining);
      while (check(state, conditions)) {
        op = choice(conditions).run(state.remaining);
        if (!op.err) tick(state, op);
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
    conditions: P<string>[],
  ) {
    let expr = child(state);
    while (check(state, conditions)) {
      let op = choice(conditions).run(state.remaining);
      if (!op.err) tick(state, op);
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

const parser = Parser({
  ast: "algebraic",
});

const result = parser.parse("5 < x < 10");

show(result);
view(result);
