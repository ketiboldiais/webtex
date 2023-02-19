import {
  amid,
  ch,
  chain,
  choice,
  dquotedString,
  latin,
  lazy,
  lit,
  many,
  num,
  P,
  R,
  repeat,
  term,
} from "./combinators";
import {
  binex,
  binop,
  callnode,
  err,
  listnode,
  litnode,
  prefixUnary,
  unaryop,
  variable,
} from "./nodes";

namespace algebra {
  export function make(src: string) {
    const numeral = many([num("any")]).typemap((d) => "number");
    const variable = many([latin("any")]).typemap((d) => "variable");
    const digits = term(many([numeral, variable]));
    const lparen = ch("(");
    const rparen = ch(")");
    const parend = amid<string, string, Tup>(lparen, rparen);
    const operator = choice([
      ch("+"),
      ch("-"),
      ch("*"),
      ch("%"),
      ch("//"),
      ch("/"),
      ch("mod"),
      ch("cos"),
      ch("sin"),
      ch("tan"),
      ch("rem"),
    ]);
    const expr: P<Tup> = lazy(() => choice([digits, operation]));
    const operation = choice([
      parend(
        chain([
          operator,
          repeat(expr),
        ]),
      ),
      chain([operator, repeat(expr)]),
    ]).map<Tup>((d) => typeof d === "string" ? d : d.flat());
    return expr.run(src).res;
  }

  /* -------------------------------------------------------------------------- */
  /*                                   PARSER                                   */
  /* -------------------------------------------------------------------------- */

  export function parse(src: string) {
    /**
     * Token specification object.
     * The keys in this object are strictly
     * defined in types.d.ts.
     * Adding a key that isn't specified in
     * types.d.ts will cause errors.
     */
    const ast: tokenspec = {
      lit: {
        hexadecimal: term(num("hex")),
        binary: term(num("binary")),
        octal: term(num("octal")),
        scientific: term(num("scientific")),
        float: term(num("float")),
        integer: term(num("integer")),
        rational: term(num("rational")),
        string: term(dquotedString),
        bool: term(choice([ch("true"), ch("false")])),
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
          ["not"]: lit("not"),
          ["~"]: lit("~"),
        },
      },
    };

    const nil: emptynode = { value: "empty", kind: "empty" };

    function run(src: string) {
      const state = enstate(src);
      let node: rootnode = { value: nil, kind: "root" };
      while (state.start < state.end && state.remaining) {
        node.value = expression(state);
        if (state.error) {
          node.value = state.error;
          return node;
        }
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

    /**
     * Parses a conversion expression.
     * E.g., 2kg to lbs
     */
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

    /** Parses 'implicit multiplication.' */
    function juxtaprod(state: State) {
      let n = percent(state);
      let last = n;
      while (
        check(state, [ast.symbol.variable, num("any"), ast.delimiter["("]])
      ) {
        last = percent(state);
        n = binex(n, binop("*"), last);
      }
      return n;
    }

    /** Parses a % b. We treat this expression as the integer quotient. */
    function percent(state: State) {
      return binexp(state, "%", rem);
    }

    /** Parses a rem b. (Follows the mathematical definition of remainder). */
    function rem(state: State) {
      return binexp(state, "rem", mod);
    }

    /** Parses a mod b. (Follows JS's definition of '%'. */
    function mod(state: State) {
      return binexp(state, "mod", unaryNot);
    }

    function unaryNot(state: State): astnode {
      return unaryPrefixExp(state, "not", powex);
    }

    function powex(state: State): astnode {
      return binexp(state, "^", literal_hex);
    }

    // BEGIN LITERAL PARSING

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

    // END LITERAL PARSING

    /**
     * Parses a variable. Note the branching here.
     * We regonize the syntax `f(x)` as a function
     * call. So, if we encounter a variable followed
     * by a left-paren, we parse a call expression.
     * Otherwise, we parse a parenthesized expression.
     */
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

    /** Parses a function call expression. */
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

    /** Parses a parenthesized expression. */
    function parenExp(state: State): astnode {
      if (check(state, [ast.delimiter["("]])) {
        eat(state, ast.delimiter["("]);
        let expr = expression(state);
        eat(state, ast.delimiter[")"]);
        return expr;
      }
      return bracketExp(state);
    }

    /**
     * Parses a bracketed expression.
     * In mathlang, brackets are used exclusively
     * for lists. They are not used for property
     * indexing like JavaScript.
     */
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
      return EOI(state);
    }

    /**
     * Returns an error node. This is only reached if
     * the parser hits a character not found in the
     * tokenspec.
     */
    function EOI(state: State) {
      const error = err("Unexpected end of input");
      panic(state, error);
      return error;
    }

    /** Puts the state in panic mode, immediately halting execution. */
    function panic(state: State, error: errnode) {
      state.error = error;
      state.start += state.end;
    }

    /** Initializes the parser state. */
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

    /** Updates the current state's indices. */
    function tick(state: State, result: Res) {
      const parsed = Array.isArray(result.res)
        ? result.res.join("")
        : result.res;
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

    /** Parsing template for unary prefix expressions. */
    function unaryPrefixExp(
      state: State,
      operator: unaryOperator,
      child: parser,
    ): astnode {
      let expr = child(state);
      const parser = ast.operator.unary[operator];
      while (check(state, [parser])) {
        let op = parser.run(state.remaining);
        if (!op.err) tick(state, op);
        let right = child(state);
        expr = prefixUnary(unaryop(op.res), right);
      }
      return expr;
    }

    /**
     * Parsing template for binary expressions.
     * Note that this doesn't account for right-associativity.
     * We leave that to the interpreter.
     */
    function binexp(
      state: State,
      operator: binaryOperator,
      child: parser,
    ): astnode {
      let expr = child(state);
      const parser = ast.operator.binary[operator];
      while (check(state, [parser])) {
        let op = parser.run(state.remaining);
        if (!op.err) tick(state, op);
        let right = child(state);
        expr = binex(expr, binop(op.res), right);
      }
      return expr;
    }

    /** Parsing template for literal values. */
    function literal(state: State, typename: literal, child: parser): astnode {
      const parser = ast.lit[typename];
      const parsing: R<string> | null = check(state, [parser]);
      if (parsing) {
        tick(state, parsing);
        return litnode(parsing.res, typename);
      }
      return child(state);
    }

    return run(src);
  }

  export function kind(node: astnode): nodekind {
    function k(n: astnode): nodekind {
      switch (n.kind) {
        case "root":
          return k(n.value);
        case "binary":
          return n.kind;
        case "binary-expression":
          return n.value.op.kind;
        case "bool":
          return n.kind;
        case "empty":
          return n.kind;
        case "error":
          return n.kind;
        case "float":
          return n.kind;
        case "function::call":
          return n.kind;
        case "hexadecimal":
          return n.kind;
        case "integer":
          return n.kind;
        case "list":
          return n.kind;
        case "octal":
          return n.kind;
        case "rational":
          return n.kind;
        case "scientific":
          return n.kind;
        case "string":
          return n.kind;
        case "variable":
          return n.kind;
        case "unary-expression":
          return n.value.op.kind;
        default:
          return "unknown";
      }
    }
    return k(node);
  }
}

/* ------------------- Live Testing - Remove in Production ------------------ */

import treeify from "treeify";

function log(objx: any) {
  console.log(objx);
}

const view = (x: any) => log(treeify.asTree(x, true, true));
const { parse, kind } = algebra;

const p = parse("2 + 1 = x");
const k = kind(p);
log(k);
log(p);
