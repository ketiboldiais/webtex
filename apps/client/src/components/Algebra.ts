const { log: show } = console;

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
  typemap(fn: (res: R<t>) => string) {
    return new P((input) => {
      const p = this.run(input);
      return output(p.res, p.rem, p.err, fn(p));
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

function either<a, b>(parser1: P<a>, parser2: P<b>) {
  return new P<a | b | string>((input) => {
    const res1 = parser1.run(input);
    if (!res1.err) return res1;
    const res2 = parser2.run(input);
    if (!res2.err) return res2;
    return output("", input, "error in [either]");
  });
}
/** Parses an exact sequence of the patterns provided. */
function chain(parsers: P<string>[]) {
  return new P((input) => {
    let matches = [];
    let rem = input;
    for (let parser of parsers) {
      let result = parser.run(rem);
      if (result.err) return output(matches, result.rem, result.err);
      if (result.res) matches.push(result.res);
      rem = result.rem;
    }
    if (matches.length === 0) return output([], input, "error in [chain]");
    return output(matches, rem, null);
  });
}

function word(parsers: P<string>[]) {
  return new P((input) => {
    const parsed = chain(parsers).run(input);
    if (parsed.err) return output("", input, "Error in [word]");
    return output(parsed.res.join(""), parsed.rem, parsed.err);
  });
}

/** Parses delimited content. */
function amid(pL: P<string>, pR: P<string>) {
  return (pC: P<string>) => chain([pL, pC, pR]).map((state) => state[1]);
}

/** From the provided parsers, returns the first successful parser's result. */
function choice<t>(parsers: P<t>[]) {
  return new P<t>((input) => {
    let nx: R<t> = parsers[0].run(input);
    for (let i = 1; i < parsers.length; i++) {
      if (!nx.err) {
        return nx;
      }
      nx = parsers[i].run(nx.rem);
    }
    return output(nx.res, nx.rem, nx.err, nx.type);
  });
}

/** From the provided parsers, returns the last successful parser's result. */
function lastof<t>(parsers: P<t>[]) {
  return new P((input) => {
    let nx: R<t> = parsers[0].run(input);
    let out: R<t>[] = [];
    for (let i = 1; i < parsers.length; i++) {
      nx = parsers[i].run(nx.rem);
      if (!nx.err) out.push(nx);
    }
    if (out.length === 0) return output(nx.res, nx.rem, nx.err);
    else return out[out.length - 1];
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
    return chain([hop(ws), p, hop(ws)]).map((d) => d[0]).run(input);
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

function regex(regex: RegExp) {
  return new P((input) => {
    const res = input.match(regex);
    if (regex.source[0] !== "^") {
      return output("", input, "error[regex]: regex must start with “^”");
    }
    if (res) {
      return output(res[0], input.slice(res[0].length), null);
    }
    return output("", input, "error in regex parser");
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

const ignoreIf = (parser: P<string>) =>
  new P((input) => {
    const parsed = parser.run(input);
    return output("", parsed.rem, null);
  });

type numberOptions =
  | "one-numeral"
  | "natural"
  | "integer"
  | "negative-integer"
  | "positive-integer"
  | "float"
  | "rational"
  | "scientific"
  | "any";
function num(option: numberOptions) {
  const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const nonzeroDigits = digits.slice(1);
  const zero = lit("0");
  const minus = lit("-");
  const numeral = choice(from(digits));
  const posint = word([
    many(from(nonzeroDigits)),
    possibly(many(from(digits))),
  ]);
  const natural = zero.or(posint).typemap(() => "natural");
  const negint = word([minus, posint]).typemap(() => "negative-integer");
  const integer = zero.or(negint).or(posint).typemap(() => "integer");
  const float = word([
    integer,
    lit("."),
    word([many([zero]), posint]).or(natural),
  ])
    .typemap(() => "float");
  const rational = word([integer, lit("/"), integer]).typemap(() => "rational");
  const scientific = word([float.or(integer), lit("E"), float.or(integer)])
    .typemap(() => "scientific");
  let parser: P<string>;
  switch (option) {
    case "one-numeral":
      parser = numeral;
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

/** Parses the content separated by `n` patterns. */
function sepby(n: number | "n", separator: P<string>) {
  const nIsInvalid = () =>
    n !== "n" ||
    (typeof n === "number") &&
      (n <= 0 || !Number.isInteger(n) || Number.MAX_SAFE_INTEGER < n);
  return (contentParser: P<string>) =>
    new P((input) => {
      if (nIsInvalid()) return output([""], input, "invalid n value");
      let out = [], i = 0, L = input.length, nx = input, content, sep;
      do {
        content = contentParser.run(nx);
        sep = separator.run(content.rem);
        if (content.err) break;
        else out.push(content.res);
        if (sep.err) {
          nx = content.res;
          break;
        }
        nx = sep.rem;
        i++;
      } while (i < L);
      if (out.length === 0 || n !== "n" && out.length !== n + 1) {
        return output([""], input, "no content found in sepby");
      }
      return output(out, content.rem, null);
    });
}

function lazy(fn: () => P<any>) {
  return new P((input) => {
    const parser = fn();
    return parser.run(input);
  });
}

/* ------------------------------- COMBINATORS ------------------------------ */
/**
 * These are combinators used by the primary parser.
 */
const variable = unit(many([
  latin("any").maybe(
    repeat(glyph("_").or(unit(num("any")))).map((d) => d.join("")),
  ),
]));
const lparen = glyph("(");
const rparen = glyph(")");
const lbracket = glyph("[");
const rbracket = glyph("]");
const lbrace = glyph("{");
const rbrace = glyph("}");
const factor = chain([
  unit(num("any")),
  ignoreIf(unit(lparen)),
  variable,
  ignoreIf(unit(rparen)),
])
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
const eqops = choice([doubleEqual, equal]);
const times = glyph("*");
const divide = glyph("/");
const quot = glyph("%");
const rem = glyph("rem");
const mod = glyph("mod");
const prodOps = [times, divide, quot, rem, mod];
const mulop = choice(prodOps);
/* ---------------------------------- Nodes --------------------------------- */
interface Parser {
  start: number;
  end: number;
}
interface literal {
  value: string;
  type: string;
}
interface varnode {
  value: string;
  type: "variable";
}
interface binex {
  left: astnode;
  op: string;
  right: astnode;
}
type astnode = literal | binex | varnode;

/** Object containing node builders. */
const node = {
  /** Builds a number node. */
  number: (value: string, type: string): literal => ({ value, type }),

  /** Builds a binary expression node. */
  binex: (left: astnode, op: string, right: astnode): binex => ({
    left,
    op,
    right,
  }),

  /** Builds a variable node. */
  variable: (value: string): varnode => ({
    value,
    type: "variable",
  }),
};

function parse(src: string) {
  const state = enstate(src);
  let nodes = [];
  while (state.start < state.end && state.remaining) {
    nodes.push(equality(state));
  }
  return { state, nodes };
}

/* -------------------------------- Equality -------------------------------- */
/**
 * Parses an equality.
 * ~~~
 * <equality> ::= <comparison> ('='|'==') <comparison>
 * ~~~
 */
function equality(state: State) {
  let expr: astnode = comparison(state);
  while (check(state, [doubleEqual, equal])) {
    let op = eqops.run(state.remaining);
    if (!op.err) tick(state, op);
    let right = comparison(state);
    expr = node.binex(expr, op.res, right);
  }
  return expr;
}

/* ------------------------------- Comparison ------------------------------- */
/**
 * Parses a comparison.
 * ~~~
 * <comparison> ::= <sum> ('>='|'<='|'>'|'<') <sum>
 * ~~~
 */
function comparison(state: State) {
  let expr: astnode = sum(state);
  while (check(state, [gte, lte, gt, lt])) {
    let op = compop.run(state.remaining);
    if (!op.err) tick(state, op);
    let right = sum(state);
    expr = node.binex(expr, op.res, right);
  }
  return expr;
}

/* ----------------------------------- Sum ---------------------------------- */
/**
 * Parses a sum.
 * ~~~
 * <sum> ::= <product> ('+'|'-') <product>
 * ~~~
 */
function sum(state: State) {
  let expr: astnode = product(state);
  while (check(state, [plus, minus])) {
    let op = addop.run(state.remaining);
    if (!op.err) tick(state, op);
    let right = product(state);
    expr = node.binex(expr, op.res, right);
  }
  return expr;
}

/* --------------------------------- Product -------------------------------- */
/**
 * Parses a product.
 * ~~~
 * <product> ::= <power> ('*'|'/'|'%'|'rem'|'mod') <power>
 * ~~~
 */
function product(state: State) {
  let expr: astnode = power(state);
  while (check(state, prodOps)) {
    let op = mulop.run(state.remaining);
    if (!op.err) tick(state, op);
    let right = power(state);
    expr = node.binex(expr, op.res, right);
  }
  return expr;
}

/* ---------------------------------- Power --------------------------------- */
/**
 * Parses a power.
 * ~~~
 * <power> := <number> ('^') <number>
 * ~~~
 */

function power(state: State) {
  const caret = glyph("^");
  let expr: astnode = number(state);
  while (check(state, [caret])) {
    let op = caret.run(state.remaining);
    if (!op.err) tick(state, op);
    let right = number(state);
    expr = node.binex(expr, op.res, right);
  }
  return expr;
}

/* --------------------------------- Number --------------------------------- */
/**
 * Parses a number.
 */
function number(state: State) {
  const res = unit(num("any")).run(state.remaining);
  tick(state, res);
  return node.number(res.res, res.type);
}

/* ---------------------------- Utility Functions --------------------------- */

type State = {
  src: string;
  start: number;
  end: number;
  previous: [number, number];
  remaining: string;
};
type Res = R<string>;

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
function check(state: State, parsers: P<string>[]): boolean {
  const count = parsers.length;
  for (let i = 0; i < count; i++) {
    const parser = parsers[i];
    const res = parser.run(state.remaining);
    if (!res.err) return true;
  }
  return false;
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
  show(state)
  state.previous = [state.start, state.start + result.res.length];
  state.start = state.src.length - result.rem.length;
  state.remaining = result.rem;
}

function nextChar(state: State) {
  return state.remaining[0];
}

show(parse("4x"));
