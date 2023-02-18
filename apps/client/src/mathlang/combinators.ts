const { log } = console;

export interface R<t> {
  res: t;
  rem: string;
  err: string | null;
  type: string;
}

type outfn = <t>(
  res: t,
  rem: string,
  err: string | null,
  type?: string,
) => R<t>;
type numberOptions =
  | "digit"
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
  
export const output: outfn = (res, rem, err, type = "") => ({
  res,
  rem,
  err,
  type,
});

export class P<t> {
  constructor(public run: (input: string) => R<t>) {
    this.run = run;
  }
  typemap<k extends string>(fn: (res: R<t>) => k) {
    return new P<k>((input): R<k> => {
      const p = this.run(input);
      return output(p.res, p.rem, p.err, fn(p)) as unknown as R<k>;
    });
  }
  chain<x>(fn: (a: R<t>) => P<x>) {
    const run = this.run;
    return new P((input) => {
      const res = run(input);
      if (res.err) return output(res.res, res.rem, res.err) as unknown as R<x>;
      return fn(res).run(res.rem);
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
export function lit(pattern: string, type = pattern) {
  return new P<string>((input) => {
    return input.startsWith(pattern)
      ? output(pattern, input.slice(pattern.length), null, type)
      : output("", input, "error in ch", "error");
  });
}

export function regex(regexp: RegExp) {
  return new P((input) => {
    if (regexp.source[0] !== "^") {
      return output("", input, "Regex must start with ‘^’", "regex");
    }
    const match = input.match(regexp);
    if (match) {
      return output(match[0], input.slice(match[0].length), null, "regex");
    }
    return output("", input, "no regex match found", "regex");
  });
}

/** Parses an exact sequence of the patterns provided. */
export function chain(parsers: P<any>[]) {
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

export function word(parsers: P<string>[]) {
  return new P((input) => {
    const parsed = chain(parsers).run(input);
    if (parsed.err) return output("", input, "Error in [word]");
    return output(parsed.res.join(""), parsed.rem, parsed.err);
  });
}

/** From the provided parsers, returns the first successful parser's result. */
export function choice<t>(parsers: P<t>[]) {
  return new P<t>((input) => {
    let nx: R<t> = parsers[0].run(input);
    for (let i = 1; i < parsers.length; i++) {
      if (!nx.err) return nx;
      nx = parsers[i].run(nx.rem);
    }
    return output(nx.res, nx.rem, nx.err, nx.type);
  });
}

export function hop(parser: P<string>) {
  return new P((input) => {
    const res = parser.run(input);
    if (res.err) {
      return output("", input, null);
    }
    return output("", input.slice(res.res.length), null);
  });
}

export function term(p: P<string>) {
  const ws = choice([lit(" "), lit("\t"), lit("\r"), lit("\n")]);
  return new P((input) => {
    const res = chain([hop(ws), p, hop(ws)]).map((d) => d[0]).run(input);
    return res.res === undefined
      ? output("", input, "no match in choice", res.type)
      : res;
  });
}

export function ch(s: string) {
  return term(lit(s));
}

/** Executes the given parser as many times as possible,
 * as long as it's successful. Dreamnt of an edge case here
 * but I can't remember. Revisit. */
export function repeat<x>(parser: P<x>) {
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

export function apart(separator: P<string>) {
  return (contentParser: P<string>) =>
    new P<string | string[]>((input) => {
      const out = [];
      let nx = contentParser.run(input);
      if (nx.err) {
        return nx;
      }
      out.push(nx.res);
      while (!nx.err) {
        const seps = separator.run(nx.rem);
        nx = contentParser.run(seps.rem);
        if (nx.err) {
          break;
        } else {
          out.push(nx.res);
        }
        if (seps.err) {
          break;
        }
      }
      return output(out, nx!.rem, null, nx!.type);
    });
}

export function from(patterns: (string)[]): P<string>[] {
  let output = [];
  for (let i = 0; i < patterns.length; i++) {
    output.push(lit(patterns[i]));
  }
  return output;
}

export function possibly(parser: P<string>) {
  return new P((input) => {
    const parsed = parser.run(input);
    if (parsed.err) return output("", parsed.rem, null);
    return parsed;
  });
}

/**
 * Parses preset a preset number option.
 * @param {numberOptions} option - Valid options are:
 *
 * - `[digit]` ::= `[0-9]`
 * - `[natural]` ::= `'0' | [1-9] ('0')`
 * - `[negative-integer]` := `'-'[natural]`
 * - `[positive-integer]` := `[1-9] | [positive-integer][digit]`
 * - `[float]` := `[integer] '.' [integer]`
 * - `[rational]` := `[integer] '/' [integer]`
 * - `[binary]` := `'0b' [0|1]`
 * - `[octal]` := `'0o' [0-7]`
 * - `[hex]` := `'0x' ([a-f]|[A-F]|[digit])`
 */
export function num(option: numberOptions): P<string> {
  const digits = [...asciiGen([48, 57])];
  const nonzeroDigits = digits.slice(1);
  const zero = lit("0");
  const minus = lit("-");
  const numeral = choice(from(digits));
  const posint = word([
    many(from(nonzeroDigits)),
    possibly(many(from(digits))),
  ]);
  const natural = zero.or(posint);
  const negint = word([minus, posint]);
  const integer = zero.or(negint).or(posint);
  const float = word([
    integer,
    lit("."),
    word([many([zero]), posint]).or(natural),
  ]);
  const rational = word([integer, lit("/"), integer]);
  const scientific = word([
    float.or(integer),
    lit("e").or(lit("E")),
    float.or(integer),
  ]);
  const binary = word([lit("0b"), many(from(["0", "1"]))]);
  const octal = word([lit("0o"), many(from(digits))]);
  const hex = word([
    lit("0x"),
    many(
      from([
        ...digits,
        ...asciiGen([65, 90]),
        ...asciiGen([97, 122]),
      ]),
    ),
  ]);
  let parser: P<string>;
  switch (option) {
    case "digit":
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

/**
 * ASCII character generator.
 *
 * @param {[number,number]} range - The ASCII
 * character range to generate characters from.
 * Common intervals:
 *
 * - `[65,90]` - A-Z
 * - `[97,122]` - a-z
 * - `[48,57]` - 0-9
 *
 * @return {Generator} This function is intended
 * to be used as a spread.
 *
 * @example
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * const digits = [...asciiGen([48,57])];
 * // ['0','1','2','3','4','5','6','7','8','9']
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
export function* asciiGen(
  range: [number, number],
): Generator<string, void, void> {
  for (let i = range[0]; i <= range[1]; i++) {
    yield String.fromCharCode(i);
  }
}

/**
 * Parses one Latin ASCII character. Valid options:
 * - `lower` - Latin lowercase letters 'a' through 'z'.
 * - `upper` - Latin uppercase letters 'A' through 'Z'.
 * - `any` - Any lowercase or uppercase Latin letter.
 */
export function latin(option: "lower" | "upper" | "any") {
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

export function amid<a, b, c>(pL: P<a>, pR: P<b>) {
  return (pC: P<c>) => chain([pL, pC, pR]).map((d) => d[1]);
}

/**
 * Repeatedly executes the parsers provided. This is similar
 * to `repeat`, but on a list of parsers.
 */
export function many(parsers: P<any>[]) {
  return new P<string>((input) => {
    const res = (repeat(choice(parsers)) as P<string[]>).run(input);
    if (res.err) return output("", res.rem, res.err);
    const result = res.res.flat().join("");
    return output(result, res.rem, res.err);
  });
}

export function allbut(p: P<string>) {
  return new P((input) => {
    if (input === "") {
      return output("", "", null, `allbut`);
    }
    let rem = input;
    let res = "";
    let i = 0;
    while (rem !== "") {
      let str = p.run(rem);
      if (str.err) {
        res = input.slice(0, i);
      } else {
        break;
      }
      rem = input.slice(i);
      i++;
    }
    return output(res, input.slice(res.length), null, `allbut`);
  });
}

export const dquoted = amid(lit(`"`), lit(`"`));
export const dquotedString = dquoted(allbut(lit(`"`)));
