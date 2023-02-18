import {
  ch,
  chain,
  choice,
  dquotedString,
  latin,
  lit,
  many,
  num,
  P,
  R,
  term,
} from "./combinators";

function Parser() {
  /** Token specifications. */
  const ast: tokenspec = {
    lit: {
      hexadecimal: num("hex"),
      binary: num("binary"),
      octal: num("octal"),
      scientific: num("scientific"),
      float: num("float"),
      integer: num("integer"),
      rational: num("rational"),
      string: term(dquotedString),
      bool: choice([ch("true"), ch("false")]),
    },
    delimiter: {
      ["("]: ch("("),
      [")"]: ch(")"),
      [","]: ch(","),
      ["["]: ch("["),
      ["]"]: ch("]"),
    },
    symbol: {
      variable: chain([many([latin("any")])]).map((d) => d.flat().join("")),
    },
    operator: {
      binary: {
        ["|"]: ch("|"),
        ["&"]: ch("&"),
        ["!="]: ch("!="),
        ["=="]: ch("!="),
        ["="]: ch("="),
        [">="]: ch(">="),
        ["<="]: ch("<="),
        ["<"]: ch("<"),
        [">"]: ch(">"),
        [">>"]: ch(">>"),
        ["<<"]: ch("<<"),
        [">>>"]: ch(">>>"),
        ["to"]: ch("to"),
        ["+"]: ch("+"),
        ["-"]: ch("-"),
        ["/"]: ch("/"),
        ["*"]: ch("*"),
        ["%"]: ch("%"),
        ["rem"]: ch("rem"),
        ["mod"]: ch("mod"),
        ["++"]: ch("++"),
        ["--"]: ch("--"),
        ["^"]: ch("^"),
      },
      unary: {
        ["+"]: lit("+"),
        ["-"]: lit("-"),
        ["not"]: lit("not"),
        ["~"]: lit("~"),
      },
    },
  };

  const nil: emptynode = { value: "empty", kind: "empty::empty" };

  function parse(src: string): astnode {
    const state = enstate(src);
    let node: rootnode = { value: nil, kind: "tree::root" };
    while (state.start < state.end && state.remaining) {
      node.value = expression(state);
      if (state.error) return state.error;
    }
    return node;
  }

  function expression(state: State): astnode {
    return bitwiseor(state);
  }

  function bitwiseor(state: State): astnode {
    return binexp(state, "|", bitwiseand);
  }

  function bitwiseand(state: State): astnode {
    return binexp(state, "&", unequal);
  }

  function unequal(state: State) {
    return binexp(state, "!=", doubleEqual);
  }

  function doubleEqual(state: State): astnode {
    return binexp(state, "==", equality);
  }

  function equality(state: State): astnode {
    return binexp(state, "=", gte);
  }

  function gte(state: State): astnode {
    return binexp(state, ">=", lte);
  }

  function lte(state: State): astnode {
    return binexp(state, "<=", lt);
  }

  function lt(state: State): astnode {
    return binexp(state, "<", gt);
  }

  function gt(state: State): astnode {
    return binexp(state, ">", shiftLeft);
  }

  function shiftLeft(state: State): astnode {
    return binexp(state, ">>", shiftRight);
  }

  function shiftRight(state: State): astnode {
    return binexp(state, "<<", logShift);
  }

  function logShift(state: State): astnode {
    return binexp(state, ">>>", convert);
  }

  function convert(state: State): astnode {
    return binexp(state, "to", sumexp);
  }

  function sumexp(state: State): astnode {
    return binexp(state, "+", difexp);
  }

  function difexp(state: State): astnode {
    return binexp(state, "-", divexp);
  }

  function divexp(state: State): astnode {
    return binexp(state, "/", prodexp);
  }

  function prodexp(state: State): astnode {
    return binexp(state, "*", juxtaprod);
  }

  function juxtaprod(state: State) {
    let n = percent(state);
    let last = n;
    while (
      check(state, [ast.symbol.variable, num("any"), ast.delimiter["("]])
    ) {
      last = percent(state);
      n = binex(n, opnode("*"), last);
    }
    return n;
  }

  function percent(state: State) {
    return binexp(state, "%", rem);
  }

  function rem(state: State) {
    return binexp(state, "rem", mod);
  }

  function mod(state: State) {
    return binexp(state, "mod", unaryPlus);
  }

  function unaryPlus(state: State): astnode {
    return unaryPrefixExp(state, "+", unaryMinus);
  }

  function unaryMinus(state: State): astnode {
    return unaryPrefixExp(state, "-", unaryNot);
  }

  function unaryNot(state: State): astnode {
    return unaryPrefixExp(state, "not", powex);
  }

  function powex(state: State): astnode {
    return binexp(state, "^", literal_hex);
  }

  function literal_hex(state: State): astnode {
    return literal(state, "hexadecimal", binarynum);
  }

  function binarynum(state: State): astnode {
    return literal(state, "binary", octalnum);
  }

  function octalnum(state: State): astnode {
    return literal(state, "octal", scinum);
  }

  function scinum(state: State): astnode {
    return literal(state, "scientific", rational);
  }

  function rational(state: State): astnode {
    return literal(state, "rational", float);
  }

  function float(state: State): astnode {
    return literal(state, "float", integer);
  }

  function integer(state: State): astnode {
    return literal(state, "integer", bool);
  }

  function bool(state: State): astnode {
    return literal(state, "bool", string);
  }

  function string(state: State): astnode {
    return literal(state, "string", varnode);
  }

  function varnode(state: State): astnode {
    const parsing = check<string>(state, [ast.symbol.variable]);
    if (parsing) {
      tick(state, parsing);
      let node: astnode = variable(parsing.res);
      if (check(state, [ast.delimiter["("]])) {
        node = callExpr(state, node);
      }
      return node;
    }
    return parenExp(state);
  }

  function callExpr(state: State, node: astnode): astnode {
    let args: astnode[] = [];
    eat(state, ast.delimiter["("]);
    if (!check(state, [ast.delimiter[")"]])) {
      args.push(expression(state));
      while (check(state, [ast.delimiter[","]])) {
        eat(state, ast.delimiter[","]);
        args.push(expression(state));
      }
      const ateRightParen = eat(state, ast.delimiter[")"]);
      if (!ateRightParen) panic(state, err("expected right paren"));
      node = callnode(node, args);
    } else eat(state, ast.delimiter[")"]);
    return node;
  }

  function parenExp(state: State): astnode {
    if (check(state, [ast.delimiter["("]])) {
      eat(state, ast.delimiter["("]);
      let expr = expression(state);
      eat(state, ast.delimiter[")"]);
      return expr;
    }
    return bracketExp(state);
  }

  function bracketExp(state: State): astnode {
    if (check(state, [ast.delimiter["["]])) {
      let elements: astnode[] = [];
      eat(state, ast.delimiter["["]);
      elements.push(expression(state));
      while (check(state, [ast.delimiter[","]])) {
        eat(state, ast.delimiter[","]);
        elements.push(expression(state));
      }
      const ateLeftBracket = eat(state, ast.delimiter["]"]);
      if (!ateLeftBracket) panic(state, err("expected right bracket"));
      return listnode(elements);
    }
    return perror(state);
  }

  function listnode(value: astnode[]): listnode {
    return { value, kind: "list::list" };
  }

  function perror(state: State) {
    const error = err("Unexpected end of input");
    panic(state, error);
    return error;
  }

  /** Puts the state in panic mode, immediately halting execution. */
  function panic(state: State, error: errnode) {
    state.error = error;
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
      danglingDelimiter: false,
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
   */
  function check<t>(state: State, parsers: P<t>[]) {
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
    const parsed = Array.isArray(result.res) ? result.res.join("") : result.res;
    if (state.start > state.src.length) {
      panic(state, err("Unexpected overread."));
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
  function eat(state: State, parser: P<string>) {
    const res = parser.run(state.remaining);
    if (res.err) return false;
    tick(state, res);
    return true;
  }

  function callnode(name: astnode, args: astnode[]): callnode {
    return { value: { name, args }, kind: "function::call" };
  }

  function opnode(value: Operator): opnode {
    return { value, kind: `operator` };
  }

  function binex(left: astnode, op: opnode, right: astnode): binexnode {
    return {
      value: { left, op, right },
      kind: `binary-expression`,
    };
  }

  function litnode(value: string, kind: literal) {
    return { value, kind };
  }

  function prefixUnary(op: opnode, right: astnode): preFixUnaryNode {
    return ({
      value: {
        op,
        right,
      },
      kind: `unary-expression`,
    });
  }

  function variable(value: string): varnode {
    return { value, kind: "variable" };
  }

  function err(value: string): errnode {
    return { value, kind: "error::error" };
  }

  function literal(state: State, typename: literal, child: parser): astnode {
    const parser = ast.lit[typename];
    const parsing: R<string> | null = check(state, [parser]);
    if (parsing) {
      tick(state, parsing);
      return litnode(parsing.res, typename);
    }
    return child(state);
  }

  function unaryPrefixExp(
    state: State,
    operator: unaryOperator,
    child: parser,
  ) {
    let expr = child(state);
    const parser = ast.operator.unary[operator];
    while (check(state, [parser])) {
      let op = parser.run(state.remaining);
      if (!op.err) tick(state, op);
      let right = child(state);
      expr = prefixUnary(opnode(op.res), right);
    }
    return expr;
  }

  function binexp(state: State, op: binaryOperator, child: parser): astnode {
    let expr = child(state);
    const parser = ast.operator.binary[op];
    while (check(state, [parser])) {
      let op = parser.run(state.remaining);
      if (!op.err) tick(state, op);
      let right = child(state);
      expr = binex(expr, opnode(op.res), right);
    }
    return expr;
  }

  return { parse };
}

/* ------------------- Live Testing - Remove in Production ------------------ */

import treeify from "treeify";
function log(k: any) {
  console.log(k);
}
const view = (x: any) => log(treeify.asTree(x, true, true));
const parser = Parser();
const result = parser.parse(`f(x,y) = x^2 + y^2`);
log(result);
view(result);
