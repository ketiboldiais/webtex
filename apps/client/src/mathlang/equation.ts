import { log } from "./dev";
import { ASTNode } from "./node";
import { ast } from "./node";

export class LRU<K, V> {
  capacity: number;
  size: number;
  cache: Map<K, V>;
  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
    this.size = 0;
  }
  getItem(key: K) {
    const item = this.cache.get(key)!;
    if (item) {
      this.cache.delete(key);
      this.cache.set(key, item);
    }
    return item;
  }
  has(key: K) {
    return this.cache.has(key);
  }
  putItem(key: K, val: V) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.size--;
    } else if (this.cache.size === this.capacity) {
      this.cache.delete(this.oldestItem);
      this.size--;
    }
    this.cache.set(key, val);
    this.size++;
    return this;
  }
  get oldestItem() {
    return this.cache.keys().next().value;
  }
}

type Output<t> = {
  result: t;
  remaining: string;
  error: string | null;
};

const output = <t>(
  result: t,
  remaining: string,
  error: string | null,
): Output<t> => ({
  result,
  remaining,
  error,
});

type Pfn<t> = (input: string) => Output<t>;
type Cache<t> = LRU<string, Output<t>>;

function cached<t>(fn: Pfn<t>): Pfn<t> {
  const cache: Cache<t> = new LRU(10);
  let cachedText = "";
  return (text) => {
    if (text !== cachedText) {
      cachedText = text;
    }
    if (!cache.has(text)) {
      cache.putItem(text, fn(text));
    }
    const result = cache.getItem(text);
    return result;
  };
}

class Parser<t> {
  parse: Pfn<t>;
  constructor(p: Pfn<t>) {
    this.parse = cached(p);
  }
  map<u>(fn: (x: t) => u) {
    const run = this.parse;
    return new Parser<u>((input) => {
      const parsed = run(input);
      if (parsed.error) {
        return parsed as unknown as Output<u>;
      }
      const result = fn(parsed.result);
      return output(result, parsed.remaining, parsed.error);
    });
  }
  or<x>(parser: Parser<x>) {
    const parse = this.parse;
    return new Parser<t | x>((input) => {
      const r1 = parse(input);
      if (!r1.error) return r1;
      const r2 = parser.parse(input);
      if (!r2.error) return r2;
      return output(r2.result, input, `[or, ${r2.error}, ${r1.error}]`);
    });
  }
}

/**
 * Given a string pattern, returns a successful
 * match if the input string matches exactly.
 * Otherwise, returns a failure.
 * Note that this is a space-sensitive pattern match:
 * @example
 * ~~~
 * const apple = one('apple');
 * const result1 = apple.parse('apple'); // success
 * const result2 = apple.parse(' apple'); // failure
 * ~~~
 */
function lit(pattern: string): Parser<string> {
  return new Parser((input: string) => {
    return (input.startsWith(pattern))
      ? output(pattern, input.slice(pattern.length), null)
      : output("", input, "[one]");
  });
}

/**
 * Given an array of parsers, returns an array of
 * the results.
 * @example
 * ~~~
   const numberOne = one('1');
   const plus = one('+')
   const numberTwo = one('2');
   const result1 = word([numberOne, plus, numberTwo]).parse('1+2');
   // result1 = ['1', '+', '2']
 * ~~~
 */
export function tuple<t extends Parser<any>[]>(parsers: [...t]) {
  return new Parser((input) => {
    let remaining = input;
    let result;
    let results = [];
    for (let i = 0; i < parsers.length; i++) {
      const parser = parsers[i];
      result = parser.parse(remaining);
      if (result.error) {
        return output(results, result.remaining, result.error);
      }
      if (result.result) results.push(result.result);
      remaining = result.remaining;
    }
    if (results.length === 0) {
      return output([], input, "[tuple");
    }
    return output(results, remaining, null);
  });
}

/**
 * Same functionality as the `word` parser,
 * except the result is returned as a single string.
 * Where the word parser allows any parser that
 * maps to a genetric `t`, the `term` parser
 * will only accept an array of parsers that
 * returns string data (`Parser<string>[]`).
 */
export function word(parser: Parser<string>[]) {
  return tuple(parser).map((d) => d.join(""));
}

/**
 * Given an array of parsers, return the first
 * successful match.
 */
export function oneof<t extends Parser<any>[]>(parsers: [...t]) {
  return new Parser((input) => {
    let nx = parsers[0].parse(input);
    const L = parsers.length;
    for (let i = 1; i < L; i++) {
      if (!nx.error) return nx;
      nx = parsers[i].parse(nx.remaining);
    }
    return output(nx.result, nx.remaining, nx.error);
  });
}

export function hop(parser: Parser<string>) {
  return new Parser((input) => {
    const parsing = parser.parse(input);
    if (parsing.error) {
      return output("", input, null);
    }
    return output("", input.slice(parsing.result.length), null);
  });
}

export function unit<t>(parser: Parser<t>) {
  const space = oneof([lit(" "), lit("\t"), lit("\r"), lit("\n")]);
  return new Parser<t>((input) => {
    return tuple([skip(space), parser, skip(space)]).map((d) => d[0]).parse(
      input,
    );
  });
}

export function skip<t>(parser: Parser<t>) {
  return new Parser((input) => {
    let parsing = parser.parse(input);
    while (!parsing.error) {
      let res = parser.parse(parsing.remaining);
      parsing = res;
    }
    return output("", parsing.remaining, null);
  });
}

export function repeat<x>(parser: Parser<x>) {
  return new Parser<x[]>((input) => {
    let parsing = parser.parse(input);
    if (parsing.error) return output([], parsing.remaining, parsing.error);
    let out = [parsing.result];
    while (!parsing.error && parsing.remaining !== "") {
      parsing = parser.parse(parsing.remaining);
      if (!parsing.error) out.push(parsing.result);
      if (parsing.error) break;
    }
    return output(out, parsing.remaining, null);
  });
}

export function not(parser: Parser<string>) {
  return new Parser<string>((input) => {
    const parsing = parser.parse(input);
    if (parsing.result) return output("", input, "[not]");
    return output("", input, null);
  });
}

export function regex(regexp: RegExp) {
  return new Parser((input) => {
    if (regexp.source[0] !== "^") {
      return output("", input, "Invalid RegExp (must start with ^)");
    }
    const match = input.match(regexp);
    if (match) {
      return output(match[0], input.slice(match[0].length), null);
    }
    return output("", input, "[regex]");
  });
}

/**
 * Record of common numeric formats.
 */
export const some = {
  int: regex(/^-?(0|[1-9]\d*)(?<!-0)$/),
  float: regex(/^(?!-0(\.0+)?$)-?(0|[1-9]\d*)(\.\d+)?$/),
  uint: regex(/^(0|[1-9]\d*)$/),
  natural: regex(/^([1-9]\d*)$/),
  ufloat: regex(/^(0|[1-9]\d*)(\.\d+)?$/),
  scientific: regex(/^(?!-0)-?(0|[1-9]\d*)(e-?(0|[1-9]\d*))?$/).or(
    regex(/^(?!-0(\.0+)?(e|$))-?(0|[1-9]\d*)(\.\d+)?(e-?(0|[1-9]\d*))?$/i),
  ),
  hex: regex(/^(?!-0(\.0+)?(e|$))-?(0|[1-9]\d*)(\.\d+)?(e-?(0|[1-9]\d*))?$/i),
  binary: regex(/^0b[0-1]+$/i),
  octal: regex(/^0o[0-8]+$/i),
  rational: regex(/^(-?[1-9][0-9]*|0)\/[1-9][0-9]*/),
  letter: regex(/^[a-zA-Z_]/),
};

/**
 * Creates an algebraic expression parsing
 * rule from a given pattern. Certain characters
 * have special meanings:
 *
 * - `_` indicates a variable. It will parse any letter.
 * - `N` indicates a natural number. It will parse any non-zero integer.
 * - `Z` indicates an integer. It will parse any integer, positive or negative.
 * - `R` indicates a real number. It will parse any integer or float.
 */
function algx(pattern: string) {
  pattern = pattern.replace(/\s/g, "");
  let out: Parser<string>[] = [];
  const map: Record<string, Parser<string>> = {
    ["_"]: some.letter,
    ["N"]: some.natural,
    ["Z"]: some.int,
    ["R"]: some.int.or(some.float),
  };
  for (let i = 0; i < pattern.length; i++) {
    out.push(map[pattern[i]] || unit(lit(pattern[i])));
  }
  return {
    then<T>(cb: (d: string[]) => T) {
      return (input: string) => {
        const res = tuple(out).parse(input);
        if (!res.error) return cb(res.result);
        return null;
      };
    },
  };
}

type RuleSet = {
  arity: number;
  rules: ((input: string) => ASTNode | null)[];
};

const linear1: RuleSet = {
  arity: 3,
  rules: [
    algx(`_ + 0`).then((d) => ast.symbol(d[0])),
    algx(`0 + _`).then((d) => ast.symbol(d[2])),
    algx(`_ + _`).then((d) => {
      if (d[0] === d[2]) {
        const x = ast.symbol(d[0]);
        const two = ast.integer(2);
        return ast.algebra2(two, "*", x);
      }
      return null;
    }),
    algx(`_ - 0`).then((d) => ast.symbol(d[0])),
    algx(`0 - _`).then((d) => ast.algebra1("-", [ast.symbol(d[2])])),
    algx(`_ - _`).then((d) => {
      if (d[0] === d[2]) return ast.integer(0);
      return null;
    }),
    algx(`- - _`).then((d) => ast.symbol(d[2])),
    algx(`_ * 1`).then((d) => ast.symbol(d[0])),
    algx(`1 * _`).then((d) => ast.symbol(d[2])),
    algx(`_ * 0`).then((d) => ast.integer(0)),
    algx(`0 * _`).then((d) => ast.integer(0)),
    algx(`_ * _`).then((d) => {
      if (d[0] === d[2]) {
        const x = ast.symbol(d[0]);
        const two = ast.integer(2);
        return ast.algebra2(x, "^", two);
      }
      return null;
    }),
  ],
};

function simp(ruleset: RuleSet, input: string) {
  input = input.replace(/\s+/g, "");
  if (input.length !== ruleset.arity) return null;
  for (let i = 0; i < ruleset.rules.length; i++) {
    const r = ruleset.rules[i];
    const res = r(input);
    if (res !== null) return res;
  }
  return null;
}

log(simp(linear1, "x * x"));

