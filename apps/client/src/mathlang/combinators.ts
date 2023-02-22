import { choice } from "@components/parsers/pcx";

export interface R<t> {
  res: t;
  rem: string;
  err: string | null;
  type: string;
}
type Tag<t> = Pick<R<t>, "type">;

const { log } = console;

type outfn = <t>(
  res: t,
  rem: string,
  err: string | null,
  type?: string,
) => R<t>;

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

  amid<x>(wrapper: P<x>) {
    const content = new P(this.run);
    const psr: P<[x, t, x]> = chain([wrapper, content, wrapper]);
    return new P((input) => {
      const result = psr.run(input);
      return output(
        result.res[1],
        result.rem,
        result.err,
        `amid[${result.res[0]}]`,
      );
    });
  }
  chain<x>(fn: (a: R<t>) => P<x>) {
    const run = this.run;
    return new P((input) => {
      const res = run(input);
      if (res.err) {
        return output(res.res, res.rem, res.err) as unknown as R<x>;
      }
      return fn(res).run(res.rem);
    });
  }
  map<x>(fn: (a: t) => x): P<x> {
    return new P<x>((input): R<x> => {
      const parsed = this.run(input);
      if (parsed.err) {
        return parsed as unknown as R<x>;
      }
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
      return output(res2.res, input, `error[or],${res1.err},${res2.err}`);
    });
  }
}

export function literal(pattern: string, type = pattern) {
  return new P<string>((input) => {
    return input.startsWith(pattern)
      ? output(pattern, input.slice(pattern.length), null, type)
      : output("", input, "error in literal", "error");
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
type UnwrapP<T> = T extends P<infer U> ? U : T;
type UnwrapPs<T extends [...any[]]> = T extends [infer Head, ...infer Tail]
  ? [UnwrapP<Head>, ...UnwrapPs<Tail>]
  : [];

export function chain<k extends any[], t extends P<any>[]>(parsers: [...t]) {
  return new P<[...k]>((input): R<[...k]> => {
    let rem = input;
    let result;
    let matches = [];
    for (let parser of parsers) {
      result = parser.run(rem);
      if (result.err) {
        return output<[...k]>(
          matches as [...k],
          result.rem,
          result.err,
          result.type,
        );
      }
      if (result.res) matches.push(result.res);
      rem = result.rem;
    }
    if (matches.length === 0) {
      return output<[...k]>([] as any as [...k], input, "error in [chain]");
    }
    return output(matches as [...k], rem, null, result?.type);
  });
}

export function word(parsers: P<string>[]) {
  return new P((input) => {
    const parsed = chain(parsers).run(input);
    if (parsed.err) return output("", input, "Error in [word]");
    return output(parsed.res.join(""), parsed.rem, parsed.err);
  });
}

export function oneof<t extends P<any>[]>(parsers: [...t]) {
  return new P((input) => {
    let nx = parsers[0].run(input);
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

export function term<t>(p: P<t>) {
  const ws = oneof([
    literal(" "),
    literal("\t"),
    literal("\r"),
    literal("\n"),
  ]);
  return new P<t>((input) => {
    return chain([hop(ws), p, hop(ws)]).map((d) => d[0]).run(input);
  });
}

export function a(s: string) {
  return term(literal(s));
}
export const an = a;

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
  return <t>(contentParser: P<t>) =>
    new P<t[]>((input) => {
      const out = [];
      let nx = contentParser.run(input);
      if (nx.err) return output([], input, "error in apart", nx.type);
      out.push(nx.res);
      while (!nx.err) {
        const seps = separator.run(nx.rem);
        nx = contentParser.run(seps.rem);
        if (nx.err) break;
        else out.push(nx.res);
        if (seps.err) break;
      }
      return output(out, nx!.rem, null, nx!.type);
    });
}

export function from(patterns: (string)[]): P<string>[] {
  let output = [];
  for (let i = 0; i < patterns.length; i++) {
    output.push(literal(patterns[i]));
  }
  return output;
}

export function maybe<t>(parser: P<t>) {
  return new P<t | string>((input) => {
    const parsed = parser.run(input);
    if (parsed.err) return output("", parsed.rem, null);
    return parsed;
  });
}

type someset = {
  letters: P<string>;
  "upper-latin": P<string>;
  "lower-latin": P<string>;
  digit: P<string>;
  "positive-integer": P<string>;
  "negative-integer": P<string>;
  "integer": P<string>;
  "natural-number": P<string>;
  "scientific-number": P<string>;
  "binary-number": P<string>;
  "octal-number": P<string>;
  "hexadecimal-number": P<string>;
  "real-number": P<string>;
  float: P<string>;
  rational: P<string>;
};

export function of(option: keyof someset) {
  const digits = [...asciiGen([48, 57])];
  const nonzerodigits = digits.slice(1);
  const zero = literal("0");
  const letters = regex(/^\w+/);
  const upperLatin = regex(/^[A-Z]+/);
  const lowerLatin = regex(/^[a-z]+/);
  const digit = regex(/^\d+/);
  const posint = word([
    many(from(nonzerodigits)),
    maybe(many(from(digits))),
  ]);
  const negint = word([literal("-"), many(from(nonzerodigits))]);
  const natnum = oneof([zero, negint, posint]);
  const integer = zero.or(negint).or(posint);
  const float = word([
    integer,
    literal("."),
    word([many([zero]), posint]).or(natnum),
  ]);
  const rational = word([integer, literal("/"), integer]);
  const scientific = word([
    float.or(integer),
    literal("e").or(literal("E")),
    float.or(integer),
  ]);
  const binary = word([literal("0b"), many(from(["0", "1"]))]);
  const octal = word([literal("0o"), many(from(digits))]);
  const hex = word([
    literal("0x"),
    many(from([...digits, ...asciiGen([65, 90]), ...asciiGen([97, 122])])),
  ]);
  const real = oneof([
    scientific,
    rational,
    float,
    integer,
    natnum,
  ]);
  const Ps: someset = {
    letters,
    digit,
    integer,
    "upper-latin": upperLatin,
    "lower-latin": lowerLatin,
    "positive-integer": posint,
    "negative-integer": negint,
    "natural-number": natnum,
    float,
    rational,
    "real-number": real,
    "scientific-number": scientific,
    "binary-number": binary,
    "octal-number": octal,
    "hexadecimal-number": hex,
  };
  return Ps[option];
}
export function* asciiGen(
  range: [number, number],
): Generator<string, void, void> {
  for (let i = range[0]; i <= range[1]; i++) {
    yield String.fromCharCode(i);
  }
}

export function recur<t>(parser: () => P<t>): P<t> {
  return new P<t>((input) => parser().run(input));
}

export function many<t>(parsers: P<t>[]) {
  return new P<string>((input) => {
    const res = (repeat(oneof(parsers)) as P<string[]>).run(input);
    if (res.err) return output("", res.rem, res.err, res.type);
    const result = res.res.flat().join("");
    return output(result, res.rem, res.err, res.type);
  });
}

export function allbut(p: P<string>) {
  return new P((input) => {
    if (input === "") return output("", "", null, `allbut`);
    let rem = input;
    let res = "";
    let i = 0;
    while (rem !== "") {
      let str = p.run(rem);
      if (str.err) res = input.slice(0, i);
      else break;
      rem = input.slice(i);
      i++;
    }
    return output(res, input.slice(res.length), null, `allbut`);
  });
}

export const dquoted = allbut(literal(`"`)).amid(literal(`"`));

export function atmost<t>(n: number, parser: P<t>) {
  return new P((input) => {
    const res = repeat(parser).run(input);
    if (res.res.length > n) {
      return output(
        [] as t[],
        input,
        `error[atmost]: expected ${n} got ${res.res.length}`,
        res.type,
      );
    }
    if (res.err) {
      return output("", input.slice(0), null, "atmost") as unknown as R<t[]>;
    }
    return res;
  });
}

export function atleast<t>(n: number, parser: P<t>) {
  return new P((input) => {
    const res = repeat(parser).run(input);
    if (res.res.length === 0 || res.res.length < n) {
      return output(
        [] as t[],
        input,
        `error[atleast]: expected ${n} got ${res.res.length}`,
        res.type,
      );
    }
    return res;
  });
}
