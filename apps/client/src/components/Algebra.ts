import treeify from "treeify";
const { log: show } = console;
const view = (x: any) => show(treeify.asTree(x, true, true));

interface R<t> {
  res: t;
  rem: string;
  err: string | null;
  type: string;
}

const output = <t>(
  res: t,
  rem: string,
  err: string | null = null,
  type = "",
): R<t> => ({
  res,
  rem,
  err,
  type,
});
class P<t> {
  constructor(public run: (input: string) => R<t>) {
    this.run = run;
  }
  typemap<k extends string>(fn: (res: R<t>) => k) {
    return new P<k>((input): R<k> => {
      const p = this.run(input);
      return output(p.res, p.rem, p.err, fn(p)) as unknown as R<k>;
    });
  }
  map<x>(fn: (a: t) => x): P<x> {
    return new P<x>((input) => {
      const parsed = this.run(input);
      const res = fn(parsed.res);
      return output(res, parsed.rem, parsed.err, parsed.type);
    });
  }
  and<x>(parser: P<x>) {
    return new P((input) => {
      const res1 = this.run(input);
      if (!res1.err) return output([], input, res1.err, res1.type);
      const res2 = parser.run(input);
      if (!res2.err) return output([], input, res2.err, res2.type);
      return output([res1.res, res2.res], res2.rem, null, res2.type);
    });
  }
  or<x>(parser: P<x>): P<t | x> {
    return new P<t | x>((input) => {
      const res1 = this.run(input);
      if (!res1.err) return res1;
      const res2 = parser.run(input);
      if (!res2.err) return res2;
      return output(res2.res, input, "error in [or]");
    });
  }
  maybe<s>(parser: P<s>) {
    return new P<s | t | string | (s | t)[]>((input) => {
      const res1 = this.run(input);
      if (res1.err) return res1;
      const res2 = parser.run(res1.rem);
      if (!res2.err) {
        if (typeof res1.res === "string" && typeof res2.res === "string") {
          return output(res1.res + res2.res, res2.rem, null);
        } else return output([res1.res, res2.res], res2.rem, null);
      } else return output(res1.res, res1.rem, res1.err);
    });
  }
}

/** Parses the pattern provided. */
function lit(pattern: string, type = pattern) {
  return new P<string>((input) => {
    return input.startsWith(pattern)
      ? output(pattern, input.slice(pattern.length), null, type)
      : output("", input, "error in ch", "error");
  });
}

/** Parses an exact sequence of the patterns provided. */
function chain(parsers: P<string>[]) {
  return new P((input) => {
    let matches = [];
    let rem = input;
    let result;
    for (let parser of parsers) {
      result = parser.run(rem);
      if (result.err) {
        return output(matches, result.rem, result.err, result.type);
      }
      if (result.res) matches.push(result.res);
      rem = result.rem;
    }
    if (matches.length === 0) return output([], input, "error in [chain]");
    return output(matches, rem, null, result?.type);
  });
}

function word(parsers: P<string>[]) {
  return new P((input) => {
    const parsed = chain(parsers).run(input);
    if (parsed.err) return output("", input, "Error in [word]");
    return output(parsed.res.join(""), parsed.rem, parsed.err);
  });
}

/** From the provided parsers, returns the first successful parser's result. */
function choice<t>(parsers: P<t>[]) {
  return new P<t>((input) => {
    let nx: R<t> = parsers[0].run(input);
    for (let i = 1; i < parsers.length; i++) {
      if (!nx.err) return nx;
      nx = parsers[i].run(nx.rem);
    }
    return output(nx.res, nx.rem, nx.err, nx.type);
  });
}

const hop = (parser: P<string>) => {
  return new P((input) => {
    const res = parser.run(input);
    if (res.err) return output("", input, null);
    return output("", input.slice(res.res.length), null);
  });
};

function unit(p: P<string>) {
  const ws = choice([lit(" "), lit("\t"), lit("\r"), lit("\n")]);
  return new P((input) => {
    const res = chain([hop(ws), p, hop(ws)]).map((d) => d[0]).run(input);
    return res;
  });
}

function glyph(s: string) {
  return unit(lit(s));
}

/** Executes the given parser as many times as possible,
 * as long as it's successful. Dreamnt of an edge case here
 * but I can't remember. Revisit. */
function repeat<x>(parser: P<x>) {
  return new P<x[]>((input) => {
    let result = parser.run(input);
    if (result.err) return output([], result.rem, result.err);
    let out = [result.res];
    while (!result.err && result.rem !== "") {
      result = parser.run(result.rem);
      if (!result.err) out.push(result.res);
      if (result.err) break;
    }
    return output(out, result.rem, null);
  });
}

function from(patterns: (string)[]): P<string>[] {
  let output = [];
  for (let i = 0; i < patterns.length; i++) {
    output.push(lit(patterns[i]));
  }
  return output;
}

function possibly(parser: P<string>) {
  return new P((input) => {
    const parsed = parser.run(input);
    if (parsed.err) return output("", parsed.rem, null);
    return parsed;
  });
}

type numberOptions =
  | "one-numeral"
  | "natural"
  | "integer"
  | "negative-integer"
  | "positive-integer"
  | "float"
  | "rational"
  | "binary"
  | "octal"
  | "hex"
  | "scientific"
  | "any";
function num(option: numberOptions) {
  const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const nonzeroDigits = digits.slice(1);
  const zero = lit("0");
  const minus = lit("-");
  const numeral = unit(choice(from(digits)));
  const posint = unit(word([
    many(from(nonzeroDigits)),
    possibly(many(from(digits))),
  ]));
  const natural = unit(zero.or(posint));
  const negint = unit(word([minus, posint]));
  const integer = unit(zero.or(negint).or(posint));
  const float = unit(word([
    integer,
    lit("."),
    word([many([zero]), posint]).or(natural),
  ]));
  const rational = unit(word([integer, lit("/"), integer]));
  const scientific = unit(
    word([float.or(integer), lit("e").or(lit("E")), float.or(integer)]),
  );
  const binary = unit(word([lit("0b"), many(from(["0", "1"]))]));
  const octal = unit(
    word([lit("0o"), many(from(["0", "1", "2", "3", "4", "5", "6", "7"]))]),
  );
  const hex = unit(word([
    lit("0x"),
    many(
      from([
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
      ]),
    ),
  ]));
  let parser: P<string>;
  switch (option) {
    case "one-numeral":
      parser = numeral;
      break;
    case "binary":
      parser = binary;
      break;
    case "octal":
      parser = octal;
      break;
    case "hex":
      parser = hex;
      break;
    case "natural":
      parser = natural;
      break;
    case "positive-integer":
      parser = posint;
      break;
    case "negative-integer":
      parser = negint;
      break;
    case "integer":
      parser = integer;
      break;
    case "float":
      parser = float;
      break;
    case "rational":
      parser = rational;
      break;
    case "scientific":
      parser = scientific;
      break;
    default:
      parser = choice([
        scientific,
        rational,
        float,
        integer,
        natural,
      ]);
      break;
  }
  return new P((input) => parser.run(input)).typemap((r) => r.type);
}

/** ASCII character generator function. */
function* asciiGen(range: [number, number]) {
  for (let i = range[0]; i <= range[1]; i++) {
    yield String.fromCharCode(i);
  }
}

function latin(option: "lower" | "upper" | "any") {
  return new P<string>((input) => {
    const parser = (range: [number, number]) => {
      for (const char of asciiGen(range)) {
        const parsing = lit(char).run(input);
        if (!parsing.err) return parsing;
      }
      return output("", input, `no match in [latin-${option}]`);
    };
    switch (option) {
      case "lower":
        return parser([97, 122]);
      case "upper":
        return parser([65, 90]);
      default: {
        const res = parser([97, 122]);
        if (!res.err) return res;
        return parser([65, 90]);
      }
    }
  });
}

/**
 * Repeatedly executes the parsers provided. This is similar
 * to `repeat`, but on a list of parsers.
 */
function many(parsers: P<any>[]) {
  return new P<string>((input) => {
    const res = (repeat(choice(parsers)) as P<string[]>).run(input);
    if (res.err) return output("", res.rem, res.err);
    const result = res.res.flat().join("");
    return output(result, res.rem, res.err);
  });
}

/* ------------------------------- COMBINATORS ------------------------------ */
/**
 * These are combinators used by the primary parser.
 */

const lparen = glyph("(");
const rparen = glyph(")");

const lt = glyph("<");
const gt = glyph(">");
const lte = glyph("<=");
const gte = glyph(">=");
const compop = choice([gte, lte, gt, lt]);
const plus = glyph("+");
const minus = glyph("-");
const addop = choice([plus, minus]);
const equal = glyph("=");
const doubleEqual = glyph("==");
const unequal = glyph("!=");
const eqops = choice([unequal, doubleEqual, equal]);
const times = glyph("*");
const divide = glyph("/");
const quot = glyph("%");
const rem = glyph("rem");
const mod = glyph("mod");
const prodOps = [times, divide];
const mulop = choice(prodOps);
const quotOps = [quot, rem, mod];
const quotop = choice(quotOps);

const unaryPlus = glyph("+");
const unaryBitnot = glyph("~");
const unaryNot = glyph("not");
const unaryPrefixOps = [unaryPlus, unaryBitnot, unaryNot];
type numeric =
  | "num-scientific"
  | "num-integer"
  | "num-real"
  | "num-hexadecimal"
  | "num-binary"
  | "num-octal"
  | "num-rational"
  | "num-Infinity"
  | "num-NaN";
type symbolic = "variable-symbol";
type bool =
  | "bool-false"
  | "bool-true";
type litType =
  | bool
  | symbolic
  | numeric;

const isNumeric = (r: Res) => r.type.split("-")[0] === "num" && !r.err;

const hex = unit(num("hex")).typemap<litType>((_) => "num-hexadecimal");
const binary = unit(num("binary")).typemap<litType>((_) => "num-binary");
const octal = unit(num("octal")).typemap<litType>((_) => "num-octal");
const scientificNumber = unit(num("scientific")).typemap<litType>((_) =>
  "num-scientific"
);
const rational = unit(num("rational")).typemap<litType>((_) => "num-rational");
const real = unit(num("float")).typemap<litType>((_) => "num-real");
const integer = unit(num("integer")).typemap<litType>((_) => "num-integer");
const boolfalse = unit(lit("false")).typemap<litType>((_) => "bool-false");
const booltrue = unit(lit("true")).typemap<litType>((_) => "bool-true");
const inf = unit(lit("Infinity")).typemap<litType>((_) => "num-Infinity");
const nan = unit(lit("NaN")).typemap<litType>((_) => "num-NaN");
const sym = unit(many([latin("any")])).typemap<litType>((_) =>
  "variable-symbol"
);
const literals = choice([
  hex,
  binary,
  octal,
  scientificNumber,
  rational,
  real,
  integer,
  boolfalse,
  booltrue,
  inf,
  nan,
  sym,
]);
interface literal {
  value: string;
  type: string;
}

interface relex {
  left: astnode;
  op: string;
  right: astnode;
  type: "relation-expression";
}
interface binex {
  left: astnode;
  op: string;
  right: astnode;
  type: "binary-math-expression";
}
interface errnode {
  error: string;
  origin: string;
  type: "error";
}
interface unex {
  op: string;
  arg: astnode;
  type: "unary-expression";
}
type astnode = literal | binex | errnode | unex | relex;

/** Object containing node builders. */
const node = {
  /** Builds a literal node. */
  literal: (value: string, type: string): literal => ({ value, type }),

  /** Builds a relation expression node. */
  relex: (left: astnode, op: string, right: astnode): relex => ({
    left,
    op,
    right,
    type: "relation-expression",
  }),

  /** Builds a binary expression node. */
  binex: (left: astnode, op: string, right: astnode): binex => ({
    left,
    op,
    right,
    type: "binary-math-expression",
  }),

  /** Builds a binary expression node. */
  unex: (op: string, arg: astnode): unex => ({
    op,
    arg,
    type: "unary-expression",
  }),
};

const err = (error: string, parser: string): errnode => ({
  error,
  origin: `Parser[${parser}]`,
  type: "error",
});
type errObj = ReturnType<typeof err>;

function parse(src: string) {
  const state = enstate(src);
  let ast = [];
  while (state.start < state.end && state.remaining) {
    const node = expression(state);
    if (state.error) return state.error;
    ast.push(node);
  }
  return { ast, src };
}

function expression(state: State) {
  return equality(state);
}
type binaryBuilder = (left: astnode, op: string, right: astnode) => astnode;
type parser = (state: State) => astnode;
function binaryExpr(
  state: State,
  child: parser,
  conditions: P<string>[],
  binexBuilder: binaryBuilder,
) {
  let expr = child(state);
  while (check(state, conditions)) {
    let op = choice(conditions).run(state.remaining);
    if (!op.err) tick(state, op);
    let right = child(state);
    expr = binexBuilder(expr, op.res, right);
  }
  return expr;
}

/* -------------------------------- Equality -------------------------------- */
/**
 * Parses an equality.
 * ~~~
 * equality = [comparison] (`=`|`==`) [comparison]
 * ~~~
 */
function equality(state: State) {
  // let expr: astnode = comparison(state);
  // while (check(state, [unequal, doubleEqual, equal])) {
  // let op = eqops.run(state.remaining);
  // if (!op.err) tick(state, op);
  // let right = comparison(state);
  // expr = node.relex(expr, op.res, right);
  // }
  // return expr;
  return binaryExpr(
    state,
    comparison,
    [unequal, doubleEqual, equal],
    node.relex,
  );
}

/* ------------------------------- Comparison ------------------------------- */
/**
 * Parses a comparison.
 * ~~~
 * comparison = [sum] (`>=`|`<=`|`>`|`<`) [sum]
 * ~~~
 */
function comparison(state: State) {
  // let expr: astnode = sum(state);
  // while (check(state, [gte, lte, gt, lt])) {
  // let op = compop.run(state.remaining);
  // if (!op.err) tick(state, op);
  // let right = sum(state);
  // expr = node.relex(expr, op.res, right);
  // }
  // return expr;
  return binaryExpr(state, sum, [gte, lte, gt, lt], node.relex);
}

/* ----------------------------------- Sum ---------------------------------- */
/**
 * Parses a sum.
 * ~~~
 * sum = [product] (`+`|`-`) [product]
 * ~~~
 */
function sum(state: State) {
  // let expr: astnode = product(state);
  // while (check(state, [plus, minus])) {
    // let op = addop.run(state.remaining);
    // if (!op.err) tick(state, op);
    // let right = product(state);
    // expr = node.binex(expr, op.res, right);
  // }
  // return expr;
  return binaryExpr(state, product, [plus, minus], node.binex)
}

/* --------------------------------- Product -------------------------------- */
/**
 * Parses a product.
 * ~~~
 * product = [implicitProduct] (`*`|`/`) [implicitProduct]
 * ~~~
 */
function product(state: State) {
  // let left: astnode = quotient(state);
  // while (check(state, prodOps)) {
    // let op = mulop.run(state.remaining);
    // if (!op.err) tick(state, op);
    // let right = quotient(state);
    // left = node.binex(left, op.res, right);
  // }
  // return left;
  return binaryExpr(state, quotient, [times, divide], node.binex)
}

/* -------------------------------- Quotient -------------------------------- */
/**
 * Parses a quotient.
 * - `%` - integer division
 * - `rem` - remainder
 * - `mod` - modulo
 * ~~~
 * quotient = [unaryPrefix] (`%`|`rem`|`mod`) [unaryPrefix]
 * ~~~
 */
function quotient(state: State) {
  // let expr: astnode = unaryPrefix(state);
  // while (check(state, quotOps)) {
    // let op = quotop.run(state.remaining);
    // if (!op.err) tick(state, op);
    // let right = unaryPrefix(state);
    // expr = node.binex(expr, op.res, right);
  // }
  // return expr;
  return binaryExpr(state, unaryPrefix, [quot, rem, mod], node.binex)
}

/* ------------------------------ Unary Prefix ------------------------------ */

function unaryPrefix(state: State): astnode {
  const op = check(state, unaryPrefixOps);
  if (op !== null) {
    const operator = op.res[0];
    tick(state, op);
    const right = unaryPrefix(state);
    return node.unex(operator, right);
  }
  return power(state);
}

/* ---------------------------------- Power --------------------------------- */
/**
 * Parses a power.
 * ~~~
 * power = [number] (`^`) [number]
 * ~~~
 */

function power(state: State) {
  const caret = glyph("^");
  let expr: astnode = primary(state);
  while (check(state, [caret])) {
    let op = caret.run(state.remaining);
    if (!op.err) tick(state, op);
    let right = primary(state);
    expr = node.binex(expr, op.res, right);
  }
  return expr;
}

function parenExpr(state: State) {
  if (!eat(state, lparen)) panic(state, "Missing: ‘(’", "parenExpr");
  const expr = expression(state);
  if (!eat(state, rparen)) panic(state, "Missing: ‘)’", "parenExpr");
  return expr;
}

function primary(state: State) {
  const res = literals.run(state.remaining);
  const Lparen = check(state, [lparen]);
  /**
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
  if (isNumeric(res)) {
    tick(state, res);
    if (check(state, [sym])) {
      const left = node.literal(res.res, res.type);
      const varsym = sym.run(state.remaining);
      tick(state, varsym);
      const right = node.literal(varsym.res, res.type);
      const expr = node.binex(left, "*", right);
      if (check(state, [lparen])) {
        let right = parenExpr(state);
        const result = node.binex(expr, "*", right);
        return result;
      }
      return expr;
    }
    if (check(state, [lparen])) {
      const left = node.literal(res.res, res.type);
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
  return node.literal(res.res, res.type);
}

/* ---------------------------- Utility Functions --------------------------- */

type State = {
  src: string;
  start: number;
  end: number;
  previous: [number, number];
  remaining: string;
  error: null | errObj;
};
type Res = R<string | string[]>;

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

function eat(state: State, parser: P<string>) {
  const res = parser.run(state.remaining);
  if (res.err) {
    return false;
  }
  tick(state, res);
  return true;
}
const result = parse("4(x + 1)");
show(result);
view(result);
