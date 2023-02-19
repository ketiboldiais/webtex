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


const sexpression: Settings<any> = {
  binaryExpression: (left, op, right) => [op, [left, right]],
  unaryExpression: (op, right) => [op, right],
  variable: (name) => [name],
  operator: (op) => (op),
  callExpression: (name, params) => [name, [params]],
  error: (error) => (error),
  list: (elements) => (elements),
  literal: (value) => (value),
  root: (r) => (r),
};

const defaults: Settings<any> = {
  binaryExpression: (left, op, right) => ({
    left,
    op,
    right,
    type: "binary-expression",
  }),
  unaryExpression: (op, right) => ({ op, right, type: "unary-expression" }),
  variable: (name) => ({ name, type: "variable" }),
  operator: (op) => ({ op, type: "operator" }),
  callExpression: (name, params) => ({ name, params, type: "function-call" }),
  error: (error) => ({ error, type: "error" }),
  list: (elements) => ({ elements, type: "elements" }),
  literal: (value) => ({ value, type: "literal" }),
  root: (root) => ({ root, type: "root" }),
};
type State = {
  src: string;
  start: number;
  end: number;
  danglingDelimiter: boolean;
  prevtoken: string;
  remaining: string;
  error: string | null;
};

interface Settings<NODE> {
  binaryExpression: (left: NODE, op: NODE, right: NODE) => NODE;
  unaryExpression: (op: NODE, right: NODE) => NODE;
  variable: (p: string) => NODE;
  operator: (p: string) => NODE;
  callExpression: (name: NODE, params: (NODE)[]) => NODE;
  error: (p: string) => NODE;
  list: (elements: (NODE)[]) => NODE;
  literal: (p: string) => NODE;
  root: (r: NODE) => NODE;
}

const parsing = Parser().run('2+5+7');
console.log(parsing);

function Parser<NODE>(settings: Settings<NODE> = defaults) {
  const root = settings.root;
  const binex = settings.binaryExpression;
  const binop = settings.operator;
  const callnode = settings.callExpression;
  const err = settings.error;
  const listnode = settings.list;
  const prefixUnary = settings.unaryExpression;
  const unaryop = settings.operator;
  const variable = settings.variable;
  const litnode = settings.literal;

  /** Parsing template for unary prefix expressions. */
  const unaryexp = (
    state: State,
    operator: unaryOperator,
    child: (state: State) => NODE,
  ): NODE => {
    let expr = child(state);
    const parser = ast.operator.unary[operator];
    while (check(state, [parser])) {
      let op = parser.run(state.remaining);
      if (!op.err) tick(state, op);
      let right = child(state);
      expr = prefixUnary(unaryop(op.res), right);
    }
    return expr;
  };

  /**
   * Parsing template for binary expressions.
   * Note that this doesn't account for right-associativity.
   * We leave that to the interpreter.
   */
  const binexp = (
    state: State,
    operator: binaryOperator,
    child: (state: State) => NODE,
  ): NODE => {
    let expr = child(state);
    const parser = ast.operator.binary[operator];
    while (check(state, [parser])) {
      let op = parser.run(state.remaining);
      if (!op.err) tick(state, op);
      let right = child(state);
      expr = binex(expr, binop(op.res), right);
    }
    return expr;
  };

  /** Parsing template for literal values. */
  const literal = (
    state: State,
    typename: literal,
    child: (state: State) => NODE,
  ): NODE => {
    const parser = ast.lit[typename];
    const parsing: R<string> | null = check(state, [parser]);
    if (parsing) {
      tick(state, parsing);
      return litnode(parsing.res);
    }
    return child(state);
  };

  /**
   * Token specification object.
   * The keys in this object are strictly
   * defined in types.d.ts.
   * Adding a key that isn't specified in
   * types.d.ts will cause errors.
   */
  const ast = {
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

  /**
   * Returns an error node. This is only reached if
   * the parser hits a character not found in the
   * tokenspec.
   */
  const EOI = (state: State) => {
    panic(state, "Unexpected end of input");
    return err("unexpected end of input");
  };

  /**
   * Parses a bracketed expression.
   * In mathlang, brackets are used exclusively
   * for lists. They are not used for property
   * indexing like JavaScript.
   */
  const bracketExp = (state: State): NODE => {
    if (check(state, [ast.delimiter["["]])) {
      let elements: (NODE)[] = [];
      eat(state, ast.delimiter["["]);
      elements.push(expression(state));
      while (check(state, [ast.delimiter[","]])) {
        eat(state, ast.delimiter[","]);
        elements.push(expression(state));
      }
      const ateLeftBracket = eat(state, ast.delimiter["]"]);
      if (!ateLeftBracket) panic(state, "expected right bracket");
      return listnode(elements);
    }
    return EOI(state);
  };

  /** Parses a function call expression. */
  const callExpr = (state: State, node: NODE): NODE => {
    let args: (NODE)[] = [];
    eat(state, ast.delimiter["("]);
    if (!check(state, [ast.delimiter[")"]])) {
      args.push(expression(state));
      while (check(state, [ast.delimiter[","]])) {
        eat(state, ast.delimiter[","]);
        args.push(expression(state));
      }
      const ateRightParen = eat(state, ast.delimiter[")"]);
      if (!ateRightParen) panic(state, "expected right paren");
      node = callnode(node, args);
    } else eat(state, ast.delimiter[")"]);
    return node;
  };

  /** Parses a parenthesized expression. */
  const parenExp = (state: State): NODE => {
    if (check(state, [ast.delimiter["("]])) {
      eat(state, ast.delimiter["("]);
      let expr = expression(state);
      eat(state, ast.delimiter[")"]);
      return expr;
    }
    return bracketExp(state);
  };
  /**
   * Parses a variable. Note the branching here.
   * We regonize the syntax `f(x)` as a function
   * call. So, if we encounter a variable followed
   * by a left-paren, we parse a call expression.
   * Otherwise, we parse a parenthesized expression.
   */
  const varnode = (state: State): NODE => {
    const parsing = check<string>(state, [ast.symbol.variable]);
    if (parsing) {
      tick(state, parsing);
      let node = variable(parsing.res);
      if (check(state, [ast.delimiter["("]])) {
        node = callExpr(state, node);
      }
      return node;
    }
    return parenExp(state);
  };
  const string = (state: State): NODE => literal(state, "string", varnode);
  const bool = (state: State): NODE => literal(state, "bool", string);
  const integer = (state: State): NODE => literal(state, "integer", bool);
  const float = (state: State): NODE => literal(state, "float", integer);
  const rational = (state: State): NODE => literal(state, "rational", float);
  const scinum = (state: State): NODE => literal(state, "scientific", rational);
  const octalnum = (state: State): NODE => literal(state, "octal", scinum);
  const binarynum = (state: State): NODE => literal(state, "binary", octalnum);
  const hex = (state: State): NODE => literal(state, "hexadecimal", binarynum);
  const power = (state: State): NODE => binexp(state, "^", hex);
  const unaryNot = (state: State): NODE => unaryexp(state, "not", power);
  const mod = (state: State): NODE => binexp(state, "mod", unaryNot);
  const rem = (state: State): NODE => binexp(state, "rem", mod);
  const percent = (state: State): NODE => binexp(state, "%", rem);
  const juxtaprod = (state: State): NODE => {
    let n = percent(state);
    let last = n;
    const [vars, nums, lparen] = [
      ast.symbol.variable,
      num("any"),
      ast.delimiter["("],
    ];
    while (check(state, [vars, nums, lparen])) {
      last = percent(state);
      n = binex(n, binop("*"), last);
    }
    return n;
  };
  const prodexp = (state: State): NODE => binexp(state, "*", juxtaprod);
  const divexp = (state: State): NODE => binexp(state, "/", prodexp);
  const difexp = (state: State): NODE => binexp(state, "-", divexp);
  const sumexp = (state: State): NODE => binexp(state, "+", difexp);
  const convert = (state: State): NODE => binexp(state, "to", sumexp);
  const logShift = (state: State): NODE => binexp(state, ">>>", convert);
  const shiftRight = (state: State): NODE => binexp(state, "<<", logShift);
  const shiftLeft = (state: State): NODE => binexp(state, ">>", shiftRight);
  const gt = (state: State): NODE => binexp(state, ">", shiftLeft);
  const lt = (state: State): NODE => binexp(state, "<", gt);
  const lte = (state: State): NODE => binexp(state, "<=", lt);
  const gte = (state: State): NODE => binexp(state, ">=", lte);
  const equality = (state: State): NODE => binexp(state, "=", gte);
  const doubleEqual = (state: State): NODE => binexp(state, "==", equality);
  const unequal = (state: State): NODE => binexp(state, "!=", doubleEqual);
  const bitwiseand = (state: State): NODE => binexp(state, "&", unequal);
  const bitwiseor = (state: State): NODE => binexp(state, "|", bitwiseand);
  const expression = (state: State): NODE => bitwiseor(state);
  const run = (src: string): NODE => {
    const state = enstate(src);
    let node;
    while (state.start < state.end && state.remaining) {
      node = root(expression(state));
      if (state.error) return err(state.error);
    }
    return node as NODE;
  };

  /** Puts the state in panic mode, immediately halting execution. */
  function panic(state: State, error: string) {
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
    const parsed = Array.isArray(result.res) ? result.res.join("") : result.res;
    if (state.start > state.src.length) {
      panic(state, "Unexpected overread.");
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

  return { run };
}
