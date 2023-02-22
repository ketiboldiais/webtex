import treeify from "treeify";
import {
  a,
  chain,
  dquoted,
  literal,
  of,
  oneof,
  P,
  R,
  regex,
  term,
} from "./combinators";

const { log } = console;

const view = (x: any) => log(treeify.asTree(x, true, false));

const node: nodeFactory = (op) => (...x) => ({ ...op(...x) });

const num = node((value: string) => ({
  value,
  kind: "NUMBER",
  atomic: true,
} as $numnode));

const scinum = node((value: string) => ({
  value: value.split("E").length === 1 ? value.split("e") : value.split("E"),
  kind: "SCIENTIFIC-NUMBER",
  atomic: true,
} as $scinode));

const complexnum = node((value: string) => ({
  value,
  kind: "COMPLEX-NUMBER",
  atomic: true,
} as $complexnode));

const str = node((value: string) => ({
  value,
  kind: "STRING",
  atomic: true,
} as $strnode));

const bool = node((val: string) => ({
  value: val === "true",
  kind: "BOOL",
  atomic: true,
} as $boolnode));

const frac = node((src: string) => ({
  value: src.split("/"),
  kind: "FRACTION",
  atomic: true,
} as $fracnode));

const symbolnode = node((value: string, native = "") => ({
  value,
  kind: "SYMBOL",
  native,
  atomic: true,
} as $symnode));

const nil: $nilnode = { value: "nil", kind: "NIL", atomic: true };
const err = (error: string) => ({
  error,
  kind: "ERROR",
  atomic: true,
} as $errnode);

type OP_NAME = typeof operators[keyof typeof operators];
type Operator = keyof typeof operators;

/** Operators record. */
const operators = {
  "+": "ADD",
  "^": "POW",
  "-": "SUB",
  "*": "MUL",
  ".*": "DOTMUL",
  "./": "DOTDIV",
  "//": "QUOT",
  "%": "BMOD",
  "rem": "REM",
  "mod": "MOD",
  "not": "NOT",
  "~": "BITNOT",
  "div": "DIV",
  "!": "FACT",
  "'": "DERIVE",
} as const;

const relnode = node((op: string, params: astnode[]) => ({
  op,
  params,
  kind: "RELATION",
  atomic: false,
} as $relnode));

const defnode = node((op: astnode, children: astnode[], body: astnode) => ({
  op,
  kind: "FUNCTION_DEFINITION",
  children,
  body,
  atomic: false,
} as $defnode));

const callnode = node((op: astnode, args: astnode[], native = "") => ({
  op,
  kind: "FUNCTION_CALL",
  native,
  args,
  atomic: false,
} as $callnode));

const operator = node((
  op: Operator,
  kind: OP_NAME,
  args: astnode[],
  associativity: "left" | "right",
) => ({
  op,
  kind,
  args,
  associativity,
  atomic: false,
} as $opnode));

interface ParserSettings {
  logging: boolean;
  constants: { [key: string]: string };
  functions: { [key: string]: string };
}
const defaultSettings: ParserSettings = {
  logging: false,
  functions: {
    abs: `Math.abs`,
    acos: `Math.acos`,
    acosh: `Math.acosh`,
    asin: `Math.asin`,
    asinh: `Math.asinh`,
    atan: `Math.atan`,
    atanh: `Math.atanh`,
    atan2: `Math.atan2`,
    cbrt: `Math.cbrt`,
    ceil: `Math.ceil`,
    clz32: `Math.clz32`,
    cos: `Math.cos`,
    cosh: `Math.cosh`,
    exp: `Math.exp`,
    expm1: `Math.expm1`,
    floor: `Math.floor`,
    fround: `Math.fround`,
    hypot: `Math.hypot`,
    imul: `Math.imul`,
    log: `Math.log`,
    ln: `Math.log`,
    log1p: `Math.log1p`,
    log10: `Math.log10`,
    lg: `Math.log2`,
    log2: `Math.log2`,
    max: `Math.max`,
    min: `Math.min`,
    pow: `Math.pow`,
    random: `Math.random`,
    round: `Math.round`,
    sign: `Math.sign`,
    sin: `Math.sin`,
    sinh: `Math.sinh`,
    sqrt: `Math.sqrt`,
    tan: `Math.tan`,
    tanh: `Math.tanh`,
    trunc: `Math.trunc`,
  },
  constants: {
    e: `Math.E`,
    ln2: `Math.LN2`,
    ln10: `Math.LN10`,
    log2e: `Math.LOG2E`,
    pi: `Math.PI`,
    sqrt1_2: `Math.SQRT1_2`,
    sqrt2: `Math.SQRT2`,
  },
};
function Parser(settings: ParserSettings = defaultSettings) {
  const withLogs = settings.logging;
  const tickWithLogs = (state: State, result: R<string>) => {
    state.logs.push(`PARSED: ${result.res}`);
    state.prev = result.res;
    state.idx = state.src.length - result.rem.length;
    state.rem = result.rem;
  };

  /** Updates the state indices.  */
  const tickWithoutLogs = (state: State, result: R<string>) => {
    state.prev = result.res;
    state.idx = state.src.length - result.rem.length;
    state.rem = result.rem;
  };
  const tick = withLogs ? tickWithLogs : tickWithoutLogs;

  const enstate = (src: string) => ({
    src,
    rem: src,
    prev: "",
    idx: 0,
    error: "",
    logs: [],
  });

  const token = {
    variable: regex(/^\w+/),
    number: of("real-number"),

    // unary-prefix
    ["not"]: a("not"),
    ["~"]: a("~"),

    // unary-postfix
    ["!"]: a("!"),
    ["'"]: a("'"),

    // delimiters
    ["("]: a("("),
    [")"]: a(")"),
    ["["]: a("["),
    ["]"]: a("]"),
    ["{"]: a("{"),
    ["}"]: a("}"),
    [","]: a(","),

    // relational-operators
    ["="]: a("="),
    ["!="]: a("!="),
    ["<"]: a("<"),
    [">"]: a(">"),
    ["<="]: a("<="),
    [">="]: a(">="),

    // assignment operator
    [":="]: a(":="),
  };

  const panic = (state: State, reason: string) => {
    state.error = reason;
  };

  /** Consumes an expected token. */
  const eat = (state: State, parser: P<string>) => {
    const result = parser.run(state.rem);
    if (result.err) {
      return false;
    }
    tick(state, result);
    return true;
  };

  /** If the parser succeeds, updates the state and returns true. Else, false. */
  const match = (state: State, parser: P<string>) => {
    const res = parser.run(state.rem);
    if (!res.err) {
      tick(state, res);
      return true;
    }
    return false;
  };

  /** Checks if the token matches without updating the state. */
  const check = (state: State, parser: P<string>) => {
    const result = parser.run(state.rem);
    if (!result.err) return result;
    return null;
  };

  /** Template for parsing constant nodes. */
  const lit: litfn = (state, parser, nextStage, nodeBuilder) => {
    const result = parser.run(state.rem);
    if (!result.err) {
      tick(state, result);
      return nodeBuilder(result.res);
    }
    withLogs && state.logs.push(`CALL: ${nextStage.name}`);
    return nextStage(state);
  };

  /** Parses the expression string, returning a parse tree.*/
  function parse(expression: string) {
    expression = expression.trim();
    const state = enstate(expression);
    const root: $rootnode = { value: nil, kind: "ROOT", atomic: false };
    while (state.rem && state.idx < state.src.length && !state.error) {
      root.value = expr(state);
    }
    return withLogs ? { state, root } : { root };
  }
  function expr(state: State) {
    withLogs && state.logs.push(`CALL: expr`);
    if (state.error) return nil;
    return relation(state);
  }
  function relation(state: State) {
    let node = addition(state);
    let params: astnode[] = [];
    const tokens = oneof([
      token["<="],
      token[">="],
      token["<"],
      token[">"],
      token["!="],
      token["="],
    ]);
    while (match(state, tokens)) {
      const op = state.prev;
      const right = addition(state);
      params = [node, right];
      node = relnode(op, params);
    }
    return node;
  }

  /**
   * Parses an additive expression.
   * @example
   * a + b   // (real addition)
   * a - b   // (real subtraction)
   */
  function addition(state: State) {
    withLogs && state.logs.push(`CALL: addition`);
    let node: astnode = product(state);
    let params: astnode[] = [];
    const plus = oneof([a("+"), a("-")]);
    while (match(state, plus)) {
      const op = state.prev as Operator;
      const name = operators[op];
      const right = product(state);
      params = [node, right];
      node = operator(op, name, params, "left");
    }
    return node;
  }

  /**
   * Parses a product expression.
   * @example
   * a ./ b   // (dot division)
   * a .* b   // (dot product)
   * a * b    // (real multiplication)
   * a / b    // (real division)
   */
  function product(state: State) {
    withLogs && state.logs.push(`CALL: product`);
    let node: astnode = implicitProduct(state);
    let prev: astnode = node;
    const ops = oneof([a("./"), a(".*"), a("*"), a("/")]);
    while (match(state, ops)) {
      const op = state.prev as Operator;
      const name = operators[op];
      prev = implicitProduct(state);
      node = operator(op, name, [node, prev], "left");
    }
    return node;
  }

  function implicitProduct(state: State) {
    let node: astnode = quotient(state);
    let prev: astnode = node;
    const tokens = oneof([token.variable, of("real-number"), token["("]]);
    while (check(state, tokens)) {
      prev = quotient(state);
      node = operator("*", "MUL", [node, prev], "left");
    }
    return node;
  }

  /**
   * Parses a quotient expression.
   * @example
   * a % b      // (mod, as it works in JS)
   * a div b    // (integer division)
   * a mod b    // (mathematical modulo)
   * a rem b    // (mathematical remainder)
   */
  function quotient(state: State) {
    let node: astnode = prefixUnary(state);
    let prev: astnode = node;
    const ops = oneof([a("%"), a("div"), a("mod"), a("rem")]);
    while (match(state, ops)) {
      const op = state.prev as Operator;
      const name = operators[op];
      prev = prefixUnary(state);
      node = operator(op, name, [node, prev], "left");
    }
    return node;
  }

  function prefixUnary(state: State) {
    const ops = oneof([a("not"), a("~")]);
    let params: astnode[] = [];
    if (match(state, ops)) {
      let op = state.prev as Operator;
      let name = operators[op];
      params = [prefixUnary(state)];
      return operator(op, name, params, "left");
    }
    return power(state);
  }

  /**
   * Parses a power expression. Power expressions
   * are right-associative.
   * @example
   * a^b // (a raised to the b)
   */
  function power(state: State) {
    withLogs && state.logs.push(`CALL: power`);
    let node: astnode = complex(state);
    let prev: astnode = node;
    const ops = a("^");
    while (match(state, ops)) {
      const op = state.prev as Operator;
      const name = operators[op];
      prev = complex(state);
      node = operator(op, name, [node, prev], "right");
    }
    return node;
  }

  function complex(state: State) {
    const real = of("real-number");
    const i = literal("i");
    const pComplex = chain([real, i]).map((d) => d.join(""));
    return lit(state, term(pComplex), hex, complexnum);
  }

  function hex(state: State) {
    withLogs && state.logs.push(`CALL: hex`);
    return lit(state, term(of("hexadecimal-number")), binary, num);
  }

  function binary(state: State) {
    return lit(state, term(of("binary-number")), octal, num);
  }

  function octal(state: State) {
    return lit(state, term(of("binary-number")), scientific, num);
  }

  function scientific(state: State) {
    return lit(state, term(of("scientific-number")), fraction, scinum);
  }

  function fraction(state: State) {
    return lit(state, term(of("rational")), float, frac);
  }

  function float(state: State) {
    return lit(state, term(of("float")), integer, num);
  }

  function integer(state: State) {
    return lit(state, term(of("integer")), boolean, num);
  }

  function boolean(state: State) {
    return lit(
      state,
      oneof([term(a("false")), term(a("true"))]),
      string,
      bool,
    );
  }

  function string(state: State) {
    return lit(state, dquoted, variable, str);
  }

  function variable(state: State) {
    const parsing = check(state, token.variable);
    if (parsing) {
      tick(state, parsing);
      let native = "";
      if (settings.constants.hasOwnProperty(parsing.res)) {
        native = settings.constants[parsing.res];
      }
      let node: astnode = symbolnode(parsing.res, native);
      if (check(state, token["("])) {
        node = callexpr(state, node);
      }
      return node;
    }
    return parenexpr(state);
  }

  function callexpr(state: State, node: astnode) {
    let args: astnode[] = [];
    eat(state, token["("]);
    if (!check(state, token[")"])) {
      args.push(expr(state));
      while (match(state, token[","])) {
        args.push(expr(state));
      }
      const hasRightParen = eat(state, token[")"]);
      if (!hasRightParen) panic(state, `Expected right paren`);
      else {
        let native = "";
        if (isSymbol(node) && settings.functions.hasOwnProperty(node.value)) {
          native = settings.functions[node.value];
        }
        node = callnode(node, args, native);
      }
    } else eat(state, token[")"]);
    if (match(state, token[":="])) {
      const body = expr(state);
      node = defnode(node, args, body);
    }
    return node;
  }

  function parenexpr(state: State): astnode {
    if (check(state, token["("])) {
      eat(state, token["("]);
      let content = expr(state);
      eat(state, token[")"]);
      return content;
    } else eat(state, token[")"]);
    return errstate(state);
  }

  function errstate(state: State) {
    state.idx = state.src.length;
    return err("Reached end of state");
  }

  return { parse };
}

const r = Parser().parse(`2 * (a + x)`);
log(r);
view(r);

/* -------------------------------------------------------------------------- */
/*                                   TYPINGS                                  */
/* -------------------------------------------------------------------------- */

type nodeFactory = <V extends any[], R>(op: (...d: V) => R) => (...x: V) => R;
type NODEKIND =
  | "FUNCTION_DEFINITION"
  | "SCIENTIFIC-NUMBER"
  | "COMPLEX-NUMBER"
  | "ERROR"
  | "ROOT"
  | "NIL"
  | "RELATION"
  | "SYMBOL"
  | "NUMBER"
  | "FRACTION"
  | "FUNCTION_CALL"
  | "BOOL"
  | "STRING"
  | OP_NAME;
type treenode = {
  kind: NODEKIND;
  atomic: boolean;
};

interface $defnode extends treenode {
  op: astnode;
  kind: "FUNCTION_DEFINITION";
  children: astnode[];
  body: astnode;
}
function isFunctionDef(node: treenode): node is $defnode {
  return node.kind === "FUNCTION_DEFINITION";
}

interface $complexnode extends treenode {
  value: string;
  kind: "COMPLEX-NUMBER";
}
function isComplex(node: treenode): node is $complexnode {
  return node.kind === "COMPLEX-NUMBER";
}

interface $scinode extends treenode {
  value: [string, string];
  kind: "SCIENTIFIC-NUMBER";
}
function isScinode(node: treenode): node is $scinode {
  return node.kind === "SCIENTIFIC-NUMBER";
}

interface $numnode extends treenode {
  value: string;
  kind: "NUMBER";
}
function isNumnode(node: treenode): node is $numnode {
  return node.kind === "NUMBER";
}

interface $strnode extends treenode {
  value: string;
  kind: "STRING";
}
function isStringnode(node: treenode): node is $strnode {
  return node.kind === "STRING";
}

interface $boolnode extends treenode {
  value: boolean;
  kind: "BOOL";
}
function isBoolnode(node: treenode): node is $boolnode {
  return node.kind === "BOOL";
}

interface $fracnode extends treenode {
  value: [string, string];
  kind: "FRACTION";
}
function isFracnode(node: treenode): node is $fracnode {
  return node.kind === "FRACTION";
}

interface $symnode extends treenode {
  value: string;
  native: string;
  kind: "SYMBOL";
}
function isSymbol(node: treenode): node is $symnode {
  return node.kind === "SYMBOL";
}

interface $relnode extends treenode {
  op: string;
  kind: "RELATION";
  params: astnode[];
}
function isRelnode(node: treenode): node is $relnode {
  return node.kind === "RELATION";
}

interface $nilnode extends treenode {
  value: "nil";
  kind: "NIL";
}
function isNilnode(node: treenode): node is $nilnode {
  return node.kind === "NIL";
}

interface $rootnode extends treenode {
  value: astnode;
  kind: "ROOT";
}
function isRootnode(node: treenode): node is $rootnode {
  return node.kind === "ROOT";
}

interface $errnode extends treenode {
  error: string;
  kind: "ERROR";
}
function isErrNode(node: treenode): node is $errnode {
  return node.kind === "ERROR";
}

interface $callnode extends treenode {
  op: astnode;
  kind: "FUNCTION_CALL";
  native: string;
  args: astnode[];
}
function isCallnode(node: treenode): node is $callnode {
  return node.kind === "FUNCTION_CALL";
}

interface $opnode extends treenode {
  op: Operator;
  kind: OP_NAME;
  args: astnode[];
  associativity: "left" | "right";
}
function isOpnode(node: treenode): node is $opnode {
  return (node.hasOwnProperty("associativity"));
}

type astnode =
  | $strnode
  | $boolnode
  | $numnode
  | $scinode
  | $fracnode
  | $symnode
  | $nilnode
  | $opnode
  | $callnode
  | $complexnode
  | $defnode
  | $relnode
  | $rootnode
  | $errnode;
type stage = (state: State) => astnode;
type litfn = (
  state: State,
  parser: P<string>,
  child: stage,
  node: (str: string) => astnode,
) => astnode;
type State = {
  src: string;
  rem: string;
  prev: string;
  idx: number;
  error: string;
  logs: string[];
};
