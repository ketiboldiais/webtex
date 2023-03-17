export function isAlpha(c: string) {
  return (c >= "a" && c <= "z") ||
    (c >= "A" && c <= "Z") ||
    c == "_";
}
export function isDotDigit(c: string) {
  return ((c >= "0" && c <= "9") || (c === "."));
}
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
  then<x>(fn: (a: R<t>) => P<x>) {
    const run = this.run;
    return new P((input) => {
      const res = run(input);
      if (res.err) {
        return output(res.res, res.rem, res.err) as unknown as R<x>;
      }
      return fn(res).run(res.rem);
    });
  }
  fmap<x>(fn: (a: t) => x): P<x> {
    return new P<x>((input): R<x> => {
      const parsed = this.run(input);
      if (parsed.err) {
        return parsed as unknown as R<x>;
      }
      let res = fn(parsed.res);
      if (Array.isArray(res)) {
        res.flat();
      }
      return output(res, parsed.rem, parsed.err, parsed.type);
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

export function lit(pattern: string, type = pattern) {
  return new P<string>((input) => {
    return input.startsWith(pattern)
      ? output(pattern, input.slice(pattern.length), null, type)
      : output("", input, "error in lit", "error");
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

export function manyof<t extends P<any>[]>(parsers: [...t]) {
  return new P((input) => {
    let result = parsers[0].run(input);
    let out = [result.res];
    do {
      for (let i = 0; i < parsers.length; i++) {
        result = parsers[i].run(result.rem);
        if (!result.err) out.push(result.res);
      }
      if (result.err) break;
    } while (!result.err && result.rem !== "");
    return output(out.join(""), result.rem, null, result.type);
  });
}
export function choice<t extends P<any>[]>(parsers: [...t]) {
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
  const ws = choice([
    lit(" "),
    lit("\t"),
    lit("\r"),
    lit("\n"),
  ]);
  return new P<t>((input) => {
    return chain([hop(ws), p, hop(ws)]).map((d) => d[0]).run(input);
  });
}

export function a(s: string) {
  return term(lit(s));
}

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
    output.push(lit(patterns[i]));
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

export function many<t>(parsers: P<t>[]) {
  return new P<string>((input) => {
    const res = (repeat(choice(parsers)) as P<string[]>).run(input);
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

export function lazy<t>(p: () => P<t>): P<t> {
  return new P((input) => {
    return p().run(input);
  });
}

const digit = regex(/^\d+/);
const hex = word([
  lit("0x"),
  manyof([digit, regex(/^[a-f]/i)]),
]);
const _binary = word([lit("0b"), manyof([lit("0").or(lit("1"))])]);
const posint = word([manyof([regex(/^[1-9]+/)]), manyof([digit])]);
const negint = word([lit("-"), posint]);
const _integer = choice([negint, posint, lit("0")]);
const float = word([_integer, lit("."), manyof([digit])]);
const dottedFloat = word([
  maybe(lit("-").or(lit("+"))),
  lit("."),
  manyof([digit]),
]);
const scientificNumber = word([
  float.or(dottedFloat).or(_integer),
  lit("E").or(lit("e")),
  maybe(lit("+").or(lit("-"))),
  _integer,
]);
const optSpace = maybe(repeat(regex(/^\s+/)));
const realNumber = choice([
  hex,
  _binary,
  scientificNumber,
  float,
  dottedFloat,
  _integer,
]);
const complexNumber = word([
  realNumber,
  optSpace,
  lit("+").or(lit("-")),
  optSpace,
  realNumber,
  lit("i"),
]);

export function getComplexParts(src: string) {
  const cpx = chain([
    realNumber,
    a("+").or(a("-")),
    realNumber,
    lit("i"),
  ]).map((d) => [d[0], d[2]]).run(src);
  if (cpx.err) return ["NaN", "NaN"];
  return cpx.res;
}

export type StringNumType =
  | "hex"
  | "binary"
  | "scientific"
  | "float"
  | "fraction"
  | "integer"
  | "unknown"
  | "complex-number";
export type NumParsing = { num: string; kind: StringNumType };
export function verifyNumber(input: string): NumParsing {
  let res = complexNumber.run(input);
  if (!res.err) return { num: res.res, kind: "complex-number" };
  res = hex.run(input);
  if (!res.err) return { num: res.res, kind: "hex" };
  res = _binary.run(input);
  if (!res.err) return { num: res.res, kind: "binary" };
  res = scientificNumber.run(input);
  if (!res.err) return { num: res.res.toUpperCase(), kind: "scientific" };
  res = float.run(input);
  if (!res.err) return { num: res.res, kind: "float" };
  res = dottedFloat.run(input);
  if (!res.err) return { num: res.res, kind: "float" };
  res = _integer.run(input);
  if (!res.err) return { num: res.res, kind: "integer" };
  return { num: "", kind: "unknown" };
}
export const match = {
  isInt: (s: string) => /^-?(0|[1-9]\d*)(?<!-0)$/.test(s),
  isFloat: (s: string) => /^(?!-0(\.0+)?$)-?(0|[1-9]\d*)(\.\d+)?$/.test(s),
  isUInt: (s: string) => /^(0|[1-9]\d*)$/.test(s),
  isUFloat: (s: string) => /^(0|[1-9]\d*)(\.\d+)?$/.test(s),
  isSci: (s: string) =>
    /^(?!-0?(\.0+)?(e|$))-?(0|[1-9]\d*)?(\.\d+)?(?<=\d)(e[-+]?(0|[1-9]\d*))?$/i
      .test(s),
  isHex: (s: string) => /^0x[0-9a-f]+$/i.test(s),
  isBinary: (s: string) => /^0b[0-1]+$/i.test(s),
  isOctal: (s: string) => /^0o[0-8]+$/i.test(s),
  isFrac: (s: string) => /^(-?[1-9][0-9]*|0)\/[1-9][0-9]*/.test(s),
};

export function tree<T extends Object>(Obj: T, cbfn?: (node: any) => void) {
  const prefix = (key: keyof T, last: boolean) => {
    let str = last ? "└" : "├";
    if (key) str += "─ ";
    else str += "──┐";
    return str;
  };
  const getKeys = (obj: T) => {
    const keys: (keyof T)[] = [];
    for (const branch in obj) {
      if (!obj.hasOwnProperty(branch) || typeof obj[branch] === "function") {
        continue;
      }
      keys.push(branch);
    }
    return keys;
  };
  const grow = (
    key: keyof T,
    root: any,
    last: boolean,
    prevstack: ([T, boolean])[],
    cb: (str: string) => any,
  ) => {
    cbfn && cbfn(root);
    let line = "";
    let index = 0;
    let lastKey = false;
    let circ = false;
    let stack = prevstack.slice(0);
    if (stack.push([root, last]) && stack.length > 0) {
      prevstack.forEach(function (lastState, idx) {
        if (idx > 0) line += (lastState[1] ? " " : "│") + "  ";
        if (!circ && lastState[0] === root) circ = true;
      });
      line += prefix(key, last) + key.toString();
      if (typeof root !== "object") line += ": " + root;
      circ && (line += " (circular ref.)");
      cb(line);
    }
    if (!circ && typeof root === "object") {
      const keys = getKeys(root);
      keys.forEach((branch) => {
        lastKey = ++index === keys.length;
        grow(branch, root[branch], lastKey, stack, cb);
      });
    }
  };
  let output = "";
  const obj = Object.assign({}, Obj);
  grow(
    "." as keyof T,
    obj,
    false,
    [],
    (line: string) => (output += line + "\n"),
  );
  return output;
}

export function split(s: string, splitter: string) {
  return s.split(splitter);
}

export function* asciiGen(
  start: number,
  end: number,
): Generator<string, void, void> {
  for (let i = start; i <= end; i++) {
    yield String.fromCharCode(i);
  }
}

export function numToUpLatin(index: number): string {
  const quot = Math.floor(index / 26);
  const rem = Math.floor(index % 26);
  const char = String.fromCharCode(rem + 97).toUpperCase();
  return quot - 1 >= 0 ? numToUpLatin(quot - 1) + char : char;
}
