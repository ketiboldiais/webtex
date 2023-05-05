import { isNumber, isStrList } from "../core/core.utils.js";
import { even, odd, product, sum } from "./core/count.js";

/**
 * @file This is Skim’s main source file. The source code
 * is heavily commented for documentation purposes.
 * @author Ketib Oldiais
 * @copyright Ketib Oldiais 2023
 */

/**
 * Skim uses a set of parser combinators for lexing
 * and parsing short, simple expressions. Earlier,
 * unreleased versions of Skim used parser combinators
 * exclusively, but they proved costly at a broader,
 * architectural level:
 *
 * 1. Users can very easily trigger stack-overflows if
 * they don’t know understand the abstractions (and
 * parser combinators are more than a little abstract).
 *
 * 2. Ironically, because of how abstract they can get,
 * they proved much harder to debug than traditional,
 * procedural mechanisms. It’s not uncommon for a combinator
 * to pass hundreds of tests, followed by a single, highly
 * surprising successful test. If there’s anything worse than
 * a bug that won’t die, it’s a test that succeeds when you
 * expect it to fail.
 */

/**
 * Every skimmer returns a skim state.
 * If a result is `null` or `undefined` or an `empty-string`,
 * the next skimmer will disregard that result.
 */
export type SkimState<T> = {
  /**
   * The input string. This is a read-only string,
   * and it should _NEVER_ be modified.
   */
  readonly text: string;

  /**
   * The state’s current index marks the start
   * of the pattern for the next skimmer.
   * Every skimmer counts on the previous
   * skimmer to correctly mark this index.
   * If a state is in error, it should not
   * update the state’s index, because the
   * next skimmer might successfully match
   * the pattern starting at that index.
   */
  index: number;

  /**
   * The result the skimmer returns
   * if a successful match is found.
   * If a core skimmer errs, it returns
   * a result of `null`, `undefined`,
   * or the empty-string `""`. The field
   * is kept generic, however, because
   * the user might want to change this
   * result on a successful skim.
   *
   * Because this field is generic,
   * skimmers _should never_ rely on the
   * result of a previous skimmer. In fact,
   * the `result` field has nothing to do
   * with a skimmer. It is simply here as
   * a box for side-effects to live in.
   */
  result: T;

  /**
   * An error message, defaults to undefined.
   * If this property is set, then the next skimmer
   * knows that the previous state was in error.
   */
  error?: string;

  erred: boolean;
};

/**
 * Creates a new initial state.
 * @param text - The input source.
 */
export const initSkim = (text: string): SkimState<any> => ({
  text,
  result: null,
  index: 0,
  erred: false,
});

/**
 * Creates a new successful state.
 * @param prev - The previous state.
 * @param result - The result of the skim.
 * @param index - The post-skim position within the input text for the next skimmer to start on.
 */
export const success = <A, B>(
  prev: SkimState<A>,
  result: B,
  index: number,
): SkimState<B> => ({
  ...prev,
  result,
  index,
  erred: false,
});

/**
 * Creates a new error state.
 *
 * @param prev - The previous skim state.
 * @param result - The result of the skim. The built-in skimmers
 * default to `null`, an empty string, or undefined. It is kept generic
 * because of the transformer functions in `P`.
 * @param error - An error message.
 */
export const flaw = <A>(
  prev: SkimState<A>,
  error: string,
): SkimState<any> => ({
  ...prev,
  result: null,
  error,
  erred: true,
});

/** Utility function to check if a result should be skipped. */
// const exists = (x: any) => x !== null && x !== undefined && x !== "";
const option = Symbol("option");
const isOption = (x: any) => x === option;

/** Utility function to standardize error messages. */
export const erratum = (
  parserName: string,
  message: string,
) => `Error[${parserName}]: ${message}`;

/**
 * All SkimRules are functions that take a SkimState and return
 * a SkimState.
 */
export type SkimRule<T> = (state: SkimState<any>) => SkimState<T>;

export class P<A> {
  readonly skim: SkimRule<A>;
  constructor(skimRule: SkimRule<A>) {
    this.skim = skimRule;
  }

  /** Runs a skim on the given source text. */
  run(sourceText: string) {
    const state = initSkim(sourceText);
    return this.skim(state);
  }

  /**
   * Transforms the result of a successful skim,
   * from a result of type `A` to a result of type `B`.
   * The result will only be transformed if the skim
   * succeeds.
   * @param resultTransformer - A callback function that
   * returns a new result of type `B`, given a successful
   * skim.
   */
  map<B>(resultTransformer: (result: A) => B) {
    const skim = this.skim;
    return new P<B>((state) => {
      const newState = skim(state);
      if (newState.error) {
        return newState as unknown as SkimState<B>;
      }
      const result = newState.result;
      return success(
        newState,
        resultTransformer(result),
        newState.index,
      );
    });
  }

  /**
   * Defines a specific error value for this parser.
   * If an error occurs, the arguments passed will
   * be used as the error field’s value. The error
   * message is optional, but a parser name must be
   * provided.
   */
  errdef(parserName: string, errorMessage?: string) {
    const skim = this.skim;
    return new P((state) => {
      const newstate = skim(state);
      if (newstate.erred) {
        const msg = erratum(
          parserName,
          errorMessage ? errorMessage : newstate.error ?? "",
        );
        return flaw(state, msg);
      }
      return newstate as SkimState<A>;
    });
  }

  /**
   * Executes the next parser given the result
   * of this parser, providing a method of chaining
   * parsers.
   * @param next - A function that, given the result
   * of this parsing, returns some parser B.
   */
  then<B>(next: (result: A, nextChar: string) => P<B>) {
    const skim = this.skim;
    return new P((state) => {
      const newstate = skim(state);
      if (newstate.erred) {
        return newstate as unknown as SkimState<B>;
      }
      const { text } = newstate;
      const L = text.length;
      const nextChar = text[L - (L - 1)];
      return next(newstate.result, nextChar).skim(newstate);
    });
  }

  /**
   * Runs the given skimmer based on the results of the previous
   * skim.
   */

  /**
   * Returns a skimmer that successfully skims only if
   * this skimmer and `other` both successfully parse. The
   * result is a pair `[A,B]`, where `A` is the result type of
   * this skimmer, and `B` is the result type of `other`.
   * Equivalent to a logical `AND` skim.
   * @param other - The second prong of the skim.
   */
  and<B>(other: P<B>): P<[A, B] | null> {
    const skim = this.skim;
    return new P<[A, B]>((state): SkimState<any> => {
      if (state.erred) return state;
      const msg = `Expected two matches`;
      const err = erratum("and", msg);
      const error = flaw(state, err);
      const r1 = skim(state);
      if (r1.error) return error as unknown as SkimState<null>;
      const r2 = other.skim(r1);
      if (r2.error) return error as unknown as SkimState<null>;
      const res: [A, B] = [r1.result, r2.result];
      return success(state, res, r2.index);
    });
  }

  /**
   * Applies this parser exactly `n`
   * times.
   */
  times(n: number) {
    const skim = this.skim;
    return new P<A[]>((state) => {
      if (state.erred) return state;
      const count = Math.abs(Math.floor(n));
      const res = [];
      let newstate = state;
      for (let i = 0; i < count; i++) {
        const out = skim(newstate);
        if (out.erred) return out;
        newstate = out;
        res.push(newstate.result);
      }
      return success(state, res, newstate.index);
    });
  }

  /**
   * Returns a skimmer that successfully skims only if
   * at least one of this skimmer or other successfully parsers.
   * If this skimmer succeeds, returns a skimmer of type P<A>.
   * If `other` succeeds, returns a skimmer of type P<B>.
   * If neither succeeds, returns a skimmer of type P<null> in error.
   * Equivalent to a logical `OR` skim.
   * @param other - The second prong of the skim.
   */
  or<B>(other: P<B>) {
    const skim = this.skim;
    return new P<A | B>((state) => {
      if (state.erred) return state;
      const r1 = skim(state);
      if (!r1.error) return r1;
      const r2 = other.skim(state);
      if (!r2.error) return r2;
      const msg = `Expected at least one match`;
      const err = erratum("or", msg);
      return flaw(state, err);
    });
  }

  /**
   * Returns a skimmer that successfully skims
   * only if this skimmer succeeds and `other` fails.
   * That is, if either:
   *
   * 1. Both skimmers succeed (pattern A followed by pattern B), or
   * 2. Both skimmers fail,
   *
   * then a failed skim is returned with a result of null.
   *
   * @param other - The disallowed pattern
   */
  butNot<B>(other: P<B>) {
    const skim = this.skim;
    return new P<A | null>((state) => {
      if (state.erred) return state;
      const r1 = skim(state);
      if (r1.erred) {
        const msg = `Expected first pattern match.`;
        const erm = erratum("nand", msg);
        return flaw(state, erm);
      }
      const r2 = other.skim(state);
      if (!r2.erred) {
        const msg = `Disallowed rule succeeded.`;
        const erm = erratum("nand", msg);
        return flaw(state, erm);
      }
      return success(state, r1.result, r1.index);
    });
  }

  static NIL() {
    return new P((state) => {
      return flaw(state, "entered NIL");
    });
  }

  /**
   * Returns the array of results joined as a single-string.
   * If the skimmer does not return an array of results,
   * this method will return an error. This method is defined
   * as a getter for convience, but it should only be called
   * with absolute certainty that the returned skim result
   * is an array.
   */
  strung() {
    const skim = this.skim;
    return new P<string>((state) => {
      if (state.erred) return state;
      const res = skim(state);
      if (res.erred) {
        return res;
      }
      if (typeof res.result === "string") {
        return res;
      }
      if (Array.isArray(res.result)) {
        return success(state, res.result.join(""), res.index);
      }
      const msg = `Called tie on a non-array result.`;
      const erm = erratum("tie", msg);
      return flaw(state, erm);
    });
  }

  /**
   * Repeats this skimmer for as many matches as possible.
   * Equivalent to calling the `some` function.
   */
  repeating() {
    const skim = this.skim;
    return new P<string>((state) => {
      if (state.erred) return state;
      const results: A[] = [];
      let next = state as unknown as SkimState<A>;
      const max = state.text.length;
      let i = state.index;
      while (!next.erred && i < max) {
        i++;
        const out = skim(next);
        if (out.erred) break;
        else {
          next = out;
          results.push(next.result);
        }
        if (i >= max) break;
      }
      const res = results.join("");
      return success(next, res, next.index);
    });
  }

  /**
   * Declares this skimmer as optional.
   * If the skimmer succeeds, its result
   * is returned. If the skimmer fails,
   * an empty string result is returned.
   * Like all the other getters, the skimmer
   * must return a string as a result. For
   * a generic version of `optional`, use
   * the `maybe` skimmer.
   */
  optional() {
    const skim = this.skim;
    return new P<string>((state) => {
      if (state.erred) return state;
      const next = skim(state);
      if (isStrList(next.result)) {
        const res = next.result.join("");
        return success(state, res, next.index);
      }
      const result = next.erred ? success(state, null, next.index) : next;
      return result;
    });
  }
}

/**
 * Skims exactly one character of the given rule,
 * white-space sensitive. If no match is found,
 * the error state’s result is an empty string.
 * @param rule - The expected character.
 */
export const one = (rule: string): P<string> =>
  new P((state) => {
    if (state.erred) return state;
    const { text, index } = state;
    const target = text.slice(index);
    if (target.startsWith(rule)) {
      const newIndex = index + rule.length;
      return success(state, rule, newIndex);
    }
    const msg = `Expected ${rule}, got ${target[index]}`;
    return flaw(state, erratum("char", msg));
  });

/**
 * Disallows a successful read of the given rule.
 * If the rule succeeds, an error is returned.
 * If the rule errs, a successful state is returned.
 */
export const not = (rule: P<any>) =>
  new P((state) => {
    const res = rule.skim(state);
    if (res.erred) return success(state, null, res.index);
    const msg = `Disallowed rule succeeded.`;
    const erm = erratum("not", msg);
    return flaw(state, erm);
  });

/**
 * Skims exactly one character of the given rule,
 * ignoring leading whitespace. If no match is found,
 * the error state’s result is an empty string.
 * @param rule - The expected character.
 */
export const lit = (rule: string): P<string> =>
  new P((state) => {
    if (state.erred) return state;
    const { text, index } = state;
    const raw = text.slice(index);
    const target = raw.trimStart();
    const trimmed = raw.length - target.length;
    const idx = rule.length + trimmed + state.index;
    if (target.startsWith(rule)) {
      return success(state, rule, idx);
    }
    const msg = `Expected ${rule}, got ${target[index]}`;
    return flaw(state, erratum("lit", msg));
  });

/**
 * Returns a skimmer that must match the given list of rules
 * exactly. If a single skimmer fails, an error is returned.
 * This is in contrast to the `list` skimmer, which always
 * succeeds.
 * @param rules - A list of rules to match.
 */
export const chain = <T extends any[], A extends P<[...T][number]>[]>(
  rules: [...A],
) =>
  new P<T | null>((state) => {
    if (state.erred) return state;
    const results = [];
    let newState = state;
    const R = rules.length;
    for (let i = 0; i < R; i++) {
      newState = rules[i].skim(newState);
      if (newState.erred) {
        const msg = `A required rule failed: ${newState.error}`;
        const erm = erratum("chain", msg);
        return flaw(state, erm);
      }
      if (!isOption(newState.result)) {
        results.push(newState.result);
      }
    }
    const idx = newState.index;
    const output = success(state, results, idx);
    return output as SkimState<T>;
  });

/**
 * Returns a skimmer that matches the given list of rules.
 * The skimmer will hold either an array of results from
 * the rules successfully matched. If no rule is matched,
 * returns an empty array. Note that `list` skimmers never fail.
 * @param rules - A list of rules to match.
 */
export const list = <T extends any[], A extends P<[...T][number]>[]>(
  rules: [...A],
) =>
  new P<(A extends P<infer T>[] ? T : never)[]>((state) => {
    if (state.erred) return state;
    const results = [];
    let newState = state;
    const R = rules.length;
    for (let i = 0; i < R; i++) {
      newState = rules[i].skim(newState);
      if (!isOption(newState.result)) {
        results.push(newState.result);
      }
    }
    const idx = newState.index;
    const output = success(state, results, idx);
    return output as SkimState<T>;
  });

/**
 * Returns a skimmer that skims successfully on the first
 * successful result. If no match is found, returns a failed
 * skim whose result is null.
 * @param rules - A list of rules to match.
 */
export const some = <T extends any[], A extends P<[...T][number]>[]>(
  rules: [...A],
) =>
  new P<(A extends P<infer T>[] ? T : never)>((state) => {
    if (state.erred) return state;
    let newState = state as SkimState<any>;
    const R = rules.length;
    for (let i = 0; i < R; i++) {
      newState = rules[i].skim(state);
      if (!isOption(newState.result) && !newState.erred) {
        return success(
          state,
          newState.result,
          newState.index,
        ) as SkimState<T>;
      }
    }
    const msg = `Expected at least one match.`;
    const error = erratum("some", msg);
    return flaw(state, error) as SkimState<T>;
  });

/**
 * Returns a skimmer that matches the given rule as
 * many times as possible, ceasing at the first failed rule.
 * The skimmer will hold either an array of results from
 * the successful matches, or an empty array.
 * Like the `list` skimmer, `many` skimmers never fail.
 * @param rule - The rule to match.
 */
export const many = <T>(rule: P<T>) =>
  new P<T[]>((state) => {
    if (state.erred) return state;
    const results: T[] = [];
    let next = state as unknown as SkimState<T>;
    const max = state.text.length;
    let i = state.index;
    while (!next.erred && i < max) {
      i++;
      const out = rule.skim(next);
      if (out.erred) break;
      else {
        next = out;
        results.push(next.result);
      }
      if (i >= max) break;
    }
    return success(next, results, next.index);
  });

/**
 * Returns a skimmer that optionally matches
 * the given rule. If no match is found,
 * returns a skimmer whose result is `null`, and
 * the subsequent skimmer will pick up at its index.
 * If a match is found, returns a skimmer whose
 * result is type `T`. Like `list` and `many`
 * skimmers, `maybe` skimmers never fail.
 * @param rule - The rule to match.
 */
export const maybe = <T>(rule: P<T>) =>
  new P<T | null>((state: SkimState<any>) => {
    if (state.erred) return state;
    const next = rule.skim(state);
    const result = next.erred ? success(state, null, next.index) : next;
    return result;
  });

/**
 * Returns a skimmer that skips the given
 * rule in the event of a match. If a match
 * is found, the result is `null` (prompting
 * sequential parsers such as `list` and `many`
 * to ignore its result). If a match
 * is not found, returns the next state.
 * @param rule - The rule to skip.
 */
export const skip = (rule: P<any>) =>
  new P((state) => {
    if (state.erred) return state;
    const next = rule.skim(state);
    if (state.erred) return next;
    return success(next, null, next.index);
  });

/**
 * Returns a skimmer that matches
 * any given character.
 */
export const any = () =>
  new P((state) => {
    if (state.erred) return state;
    const index = state.index;
    if (index < state.text.length) {
      const char = state.text[index];
      return success(state, char, index + 1);
    }
    const error = `Unexpected end of input.`;
    const msg = erratum("anychar", error);
    return flaw(state, msg);
  });

/**
 * Skims the content between two skimmers, `P<A>` and `P<B>`.
 * If no match is found, returns a `null` result. Otherwise,
 * returns the result of `P<C>`, the content skimmer. Useful
 * for skimming delimited content.
 * @param left - The left delimiter. E.g., `(`.
 * @param right - The right delimiter. E.g., `)`.
 * @returns A function that takes a skimmer as an argument.
 */
export const amid = <A, B>(left: P<A>, right: P<B>) => <C>(content: P<C>) =>
  list<[A, C, B], [P<A>, P<C>, P<B>]>([left, content, right]).map((
    result,
  ) => result[1] ? result[1] : null);

/**
 * Returns a skimmer for content separated by the given
 * separator. Useful for skimming comma-separated text.
 * @param separator - The separator’s skimmer. E.g., `,`.
 * @returns A function that takes a content-skimmer.
 */
export const sepby = <S>(separator: P<S>) => <C>(content: P<C>) =>
  new P<C[]>((state) => {
    if (state.erred) return state;
    let next = state;
    let error;
    const results = [];
    const max = state.text.length;
    while (next.index < max) {
      const contentState = content.skim(next);
      const sepState = separator.skim(contentState);
      if (contentState.erred) {
        error = contentState;
        break;
      } else {
        results.push(contentState.result);
      }
      if (sepState.erred) {
        next = contentState;
        break;
      }
      next = sepState;
    }
    if (error) {
      return results.length === 0 ? success(state, results, next.index) : error;
    }
    return success(state, results, next.index);
  });

/**
 * Returns a skimmer that runs according
 * to the given regular expression. The
 * regular expression must begin with `^`.
 * Otherwise, an error is returned.
 * @param pattern - The regular expression
 * the skimmer should follow.
 */
export const regex = (pattern: RegExp) =>
  new P<string>((state) => {
    if (state.erred) return state;
    if (pattern.source[0] !== "^") {
      const msg = `Pattern must begin with ^`;
      const erm = erratum("regex", msg);
      return flaw(state, erm);
    }
    const { text, index } = state;
    const target = text.slice(index);
    const match = target.match(pattern);
    if (match) {
      return success(state, match[0], match[0].length + index);
    }
    const msg = `No match found on pattern ${pattern.source}`;
    const erm = erratum(`regex`, msg);
    return flaw(state, erm);
  });

/**
 * Returns a skimmer for the given word,
 * ignoring leading white-spaces.
 */
export const word = (rules: P<string | null>[]) => {
  return chain(rules).strung();
};

/**
 * Given the set of strings or numbers, returns
 * the first successful match.
 */
export const among = (rules: (string | number)[]) =>
  new P<string>((state) => {
    if (state.erred) return state;
    const R = rules.length;
    for (let i = 0; i < R; i++) {
      const res = lit(`${rules[i]}`).skim(state);
      if (!res.erred && !isOption(res.result)) return res;
    }
    const msg = `Expected on match.`;
    const erm = erratum("among", msg);
    return flaw(state, erm);
  });

/**
 * Returns true if the given `text`
 * is:
 *
 * - a Latin letter (lowercase or uppercase), or
 * - a Latin letter with accents, or
 * - a Greek letter (lowercase or uppercase), or
 * - an underscore `_`
 */
export const isLatinGreek = (text: string) =>
  /^[a-zA-Z_\u00C0-\u02AF\u0370-\u03FF\u2100-\u214F]/.test(text);

/**
 * Returns true if the given `text`
 * is a math symbol (defined in the Math Operators
 * block `U+2200` through `U+22FF`).
 */
export const isMathSymbol = (text: string) =>
  /^[\u{2200}-\u{22FF}]/u.test(text);

/**
 * Returns true if the given `text`
 * is a mathematical symbol or a Latin/Greek letter.
 *
 * _References_.
 * 1. _See_ {@link isLatinGreek} (implementing the Latin/Greek letter test).
 * 2. _See_ {@link isMathSymbol} (implementing the math symbol test).
 */
export const isSymbol = (text: string) =>
  isLatinGreek(text) || isMathSymbol(text);

/**
 * Reads as exactly one digit between zero
 * and 9.
 */
export const digits = regex(/^[0-9]/);

/**
 * Reads exactly one zero.
 */
export const zero = regex(/^[0]/);

/**
 * Reads multiple zeroes.
 */
export const zeroes = zero.repeating();

/**
 * Reads the symbol `.` (dot/period).
 */
export const dot = regex(/^[\.]/);

/**
 * Reads the symbol `-` (a minus).
 */
export const minus = regex(/^[-]/);

/**
 * Reads the symbol `+` (a plus).
 */
export const plus = regex(/^[+]/);

/**
 * Reads a positive integer.
 */
export const positiveInteger = regex(/^[1-9]\d*/);

/**
 * Reads a negative integer.
 */
export const negativeInteger = regex(/^-[1-9]\d*/);

/**
 * Reads positive integers with a leading `+`,
 * not including `+0`.
 */
export const plusInt = word([
  plus,
  positiveInteger,
]);

/**
 * Reads a natural number (a positive
 * integer or 0).
 */
export const naturalNumber = regex(/^(0|[1-9]\d*)/);

/**
 * Reads a string of zeroes repeating,
 * followed by a {@link positiveInteger}.
 */
export const zerosLedInt = word([
  maybe(zeroes),
  positiveInteger,
]);

/**
 * Reads a signed integer, with
 * thousands separators of the
 * form `_`.
 */
export const integer_integer = word([
  (plus.or(minus)).optional(),
  regex(/^[1-9]/),
  digits.optional(),
  digits.optional(),
  lit("_"),
  digits.times(3).strung(),
  maybe(
    word([
      lit("_"),
      digits.times(3).strung(),
    ]).repeating(),
  ),
]);

/**
 * Reads an integer (including those prefaced
 * with a unary `+`).
 * This will also read integers with
 * separators `_`.
 */
export const integer = integer_integer.or(
  word([minus.optional(), positiveInteger]).or(zero),
);

/**
 * Parses a hexadecimal of the form `[0x] [0-9|a-f]+`.
 * For upper-cased hexadecimal letters, see {@link HexNumber}.
 *
 * @example
 * ```
 * const P = hexNumber.run('0xa2fb'); // reads '0xa2fb'.
 * ```
 */
export const hexNumber = regex(/^0x[0-9a-f]+/);

/**
 * Parses a hexadecimal of the form `[0x] [0-9|A-F]+`.
 * For lower-cased hexadecimal letters, see {@link hexNumber}.
 *
 * @example
 * ```
 * const P = HexNumber.run('0xA2FB'); // reads '0xA2FB'.
 * ```
 */
export const HexNumber = regex(/^0x[0-9A-F]+/);

/**
 * Parses a signed hexadecimal number.
 */
const signedHex = (sign: "-" | "+") => word([lit(sign), number("hex")]);
const signedHEX = (sign: "-" | "+") => word([lit(sign), number("HEX")]);

/**
 * Parses a binary number prefaced with a `-` or `+`.
 */
const signedBinary = (sign: "-" | "+") => word([lit(sign), number("binary")]);

/**
 * Parses an octal number prfaced with a `-` or `+`.
 */
const signedOctal = (sign: "-" | "+") => word([lit(sign), number("octal")]);
/**
 * Parses binary numbers of the form `[0b] [0|1]+`.
 *
 * @example
 * ```
 * const P = binaryNumber.run('0b1101') // reads '0b1101'.
 * ```
 */
export const binaryNumber = regex(/^0b[0|1]+/);

/**
 * Parses octal numbers of the form `[0o] [0-7]+`.
 *
 * @example
 * ```
 * const P = octalNumber.run('0o1457') // reads '0o1457'.
 * ```
 */
export const octalNumber = regex(/^0o[0-7]+/);

/**
 * Parses dotted numbers of the form `[.] ([0]+? <positiveInteger> | [0])`.
 * For the definition of `<positiveInteger>`,
 * see {@link positiveInteger}.
 *
 * @example
 * ```
 * const P = unsignedDottedNumber.run('.128') // reads '.128'.
 * ```
 */
export const unsignedDottedNumber = word([
  dot,
  regex(/^[0-9]+/),
]);

/**
 * Parses negative dotted numbers of the form
 * `[-] <unsignedDottedNumber>`.
 * For the definition of
 * `<unsignedDottedNumber>`, see {@link unsignedDottedNumber}.
 */
export const negativeDottedNumber = word([
  minus,
  dot,
  zerosLedInt,
]);

/**
 * Reads dotted numbers of the form `[+] <unsignedDottedNumber>`.
 * For the definition of
 * `<unsignedDottedNumber>`, see {@link unsignedDottedNumber}.
 */
export const plusDottedNumber = word([
  plus,
  dot,
  zerosLedInt,
]);

/**
 * Reads signed dotted numbers of the form `[-]? <unsignedDottedNumber>`.
 * For the definition of `<unsignedDottedNumber>`,
 * see {@link unsignedDottedNumber}. This will not read numbers
 * with a leading `+`.
 */
export const dottedNumber = word([minus.optional(), unsignedDottedNumber]);

/**
 * Reads unsigned numbers of the form
 * `<naturalNumber> [.] <naturalNumber>`.
 * For the definition of `<naturalNumber>`,
 * see {@link naturalNumber}.
 */
export const unsignedFloat = word([
  naturalNumber,
  dot,
  naturalNumber,
]);

/**
 * Reads negative floating-point numbers
 * of the form `[-] <naturalNumber> [.] <zerosLedInt>`.
 * See {@link zerosLedInt} for the definition of
 * `<zerosLedInt>`, and see {@link naturalNumber} for
 * the definition of `<naturalNumber>`.
 */
export const negativeFloat = word([
  minus,
  naturalNumber,
  dot,
  zerosLedInt,
]);

/**
 * Reads negative floating-point numbers
 * of the form `[+] <naturalNumber> [.] <zerosLedInt>`.
 * See {@link zerosLedInt} for the definition of
 * `<zerosLedInt>`, and see {@link naturalNumber} for
 * the definition of `<naturalNumber>`.
 */
export const positiveFloat = word([
  plus,
  word([
    naturalNumber,
    dot,
    zerosLedInt,
  ]).or(word([
    positiveInteger,
    dot,
    zeroes,
  ])),
]);

/**
 * Reads floating-point numbers
 * of the form `[-]? <naturalNumber> [.] <naturalNumber> | <unsignedFloat>`.
 * This will not read floats with a leading `+`.
 *
 * _References_.
 * 1. _See also_ {@link zerosLedInt} (defining `<zerosLedInt>`).
 * 2. _See also_ {@link naturalNumber} (defining `<naturalNumber>`).
 * 3. _See also_ {@link unsignedFloat} (defining `<unsignedFloat>`).
 */
export const floatingPointNumber = word([
  minus.optional(),
  naturalNumber,
  dot,
  zerosLedInt,
]).or(unsignedFloat);

/**
 * Reads unsigned fractions of the form
 * `<naturalNumber> [/] <positiveInteger>`.
 * This will not read fractions with a leading
 * `+`, nor will it read fractions with a leading
 * `-` (since it’s unsigned). Neither will this parse
 * fractions with a zero-denominator.
 *
 * _References_.
 * 1. _See also_ {@link naturalNumber} (defining `<naturalNumber>`).
 * 2. _See also_ {@link positiveInteger} (defining `<positiveInteger>`).
 */
export const unsignedFraction = word([
  naturalNumber,
  lit("/"),
  positiveInteger,
]);

/**
 * Reads signed fractions of the form
 * `[+|-] <unsignedFraction>`.
 *
 * _References_.
 * 1. _See also_ {@link unsignedFraction} (defining `<unsignedFraction>`).
 */
export const signedFraction = word([
  maybe(minus.or(plus)),
  unsignedFraction,
]);

/**
 * Reads fractions of the form
 * `[-]? <unsignedFraction>`. This will
 * not read fractions with a leading `+`.
 *
 * _References_:
 * 1. _See also_ {@link unsignedFraction} (defining `<unsignedFraction>`).
 * 2. _See_ {@link signedFraction} (for reading fractions with a leading `+`).
 */
export const fractionalNumber = word([
  minus.optional(),
  unsignedFraction,
]);

/**
 * Reads scientific numbers of the form
 * `[+|-] <floatingPointNumber|integer|dottedNumber> [e|E] <int|+int>`.
 * Expects a string `e` or `E` (indicating which of the two should be
 * the exponent indicator.
 *
 * _References_:
 * 1. _See also_ {@link floatingPointNumber} (defining `<floatingPointNumber>`).
 * 2. _See also_ {@link integer} (defining `<integer>`).
 * 3. _See also_ {@link dottedNumber} (defining `<dottedNumber>`).
 * 4. _See also_ {@link plusInt} (defining `<+int>`).
 */
export const scientificNumber = (e: "e" | "E") =>
  word([
    plus.optional(),
    floatingPointNumber.or(integer).or(dottedNumber),
    lit(e),
    integer.or(plusInt),
  ]);

type NumberReader = {
  /**
   * Matches the given number exactly.
   *
   * @example
   * ```
   * const P = number('0');
   * const res = P.run('0');
   * ```
   */
  (pattern: `${number}`): P<string>;

  /**
   * Match any positive integer or zero.
   */
  (pattern: `natural`): P<string>;

  /**
   * Match any and only positive integers,
   * allowing an optional leading `+`. This
   * does not include `+0`, since `0` is neither
   * positive nor negative.
   * @example
   * ```
   * const P = number("+int");
   * const r1 = P.run("+157"); // result: '+157'
   * const r2 = P.run("34"); // result: '34'
   * const r3 = P.run('+0') // result: null
   * ```
   */
  (pattern: `+int`): P<string>;

  /**
   * Matchy any and only positive integers,
   * disallowing a leading `+`.
   *
   * @example
   * ```
   * const P = number('whole');
   * const res = P.run(`258`); // 258
   * ```
   */
  (pattern: `whole`): P<string>;

  /**
   * Match any and only negative integers.
   * Does not parse `-0`, since `0` is neither
   * positive nor negative.
   * @example
   * ```
   * const P = number('-int');
   * const r1 = P.run("-28"); // reads '-28'
   * const r2 = P.run("-0"); // result: null
   * ```
   */
  (pattern: `-int`): P<string>;

  /**
   * Matches 0, a positive integer, or a negative
   * integer.
   * @example
   * ```
   * const int = number('int');
   * const r1 = int.run("-28"); // result: '-28'
   * const r2 = int.run("0"); // result: '0'
   * const r3 = int.run("5"); // result: '5'
   * const r4 = int.run("+5"); // result: null
   * ```
   */
  (pattern: `int`): P<string>;

  /**
   * Match any and only unsigned floating
   * point numbers of the form `natural.natural`.
   * No leading `+`is recognized.
   * @example
   * ```
   * const ufloat = number('ufloat');
   * const r1 = ufloat.run("1.1"); // result: '1.1'
   * const r2 = ufloat.run("0.0"); // result: '0.0'
   * const r3 = ufloat.run("0"); // result: null
   * ```
   */
  (pattern: `ufloat`): P<string>;

  /**
   * Matches any and only unsigned floating
   * point numbers of the form `.natural`.
   * No leading `+` is recognized.
   * @example
   * ```
   * const P = number("udotnum");
   * const res = P.run(`.001`); // '.001'
   * const res = P.run(`.0`); // '.0'
   * ```
   */
  (pattern: `udotnum`): P<string>;

  /**
   * Matches any floating
   * point number of the form `.natural`.
   * No leading `+` is recognized, but the `-`
   * will be recognized for negatives.
   * @example
   * ```
   * const P = number("dotnum");
   * const res = P.run(`.001`); // '.001'
   * const res = P.run(`.0`); // '.0'
   * const res = P.run(`-.22`); // '-.22'
   * ```
   */
  (pattern: `dotnum`): P<string>;

  /**
   * Matches any and only negative floating
   * point numbers of the form `-.natural`.
   * Will not read `-.0`.
   * @example
   * ```
   * const P = number("-dotnum");
   * const r1 = P.run(`-.001`); // '-.001'
   * const r2 = P.run(`-.0`); // null
   * ```
   */
  (pattern: `-dotnum`): P<string>;

  /**
   * Matches any and only positive floating
   * point numbers of the form `+.natural`.
   * Will not read `+.0`.
   * @example
   * ```
   * const P = number("+dotnum");
   * const r1 = P.run(`+.001`); // '-.001'
   * const r2 = P.run(`+.0`); // null
   * ```
   */
  (pattern: `+dotnum`): P<string>;
  /**
   * Matches any and only positive floating
   * point numbers of the form `natural.natural`,
   * without a leading `+`.
   * @example
   * ```
   * const P = number('ufloat');
   * const a = P.run("1.1"); // '1.1'
   * const b = P.run("0.0"); // '0.0'
   * const c = P.run("1.3912"); // '1.3912'
   * const d = P.run("0.390"); // '0.390'
   * ```
   */
  (pattern: `ufloat`): P<string>;

  /**
   * Match any and only positive floating
   * point numbers, allowing an optional
   * leading `+`. Does not recognize `0.0`
   * or `-0.0`. The decimal must have
   * a leading digit.
   * @example
   * ```
   * const P = number('+float');
   * const r1 = P.run("0.0"); // '0.0'
   * const r2 = P.run("-0.0"); // null
   * const r3 = P.run("1.0"); // '1.0'
   * const r3 = P.run("+1.0"); // '+1.0'
   * const r3 = P.run("3.258"); // '3.258'
   * ```
   */
  (pattern: `+float`): P<string>;

  /**
   * Match any and only negative floating
   * point numbers. Decimal must have a
   * leading digit. Will not read `-0.0`.
   * @example
   * ```
   * const P = number('-float');
   * const r1 = P.run("-1.2"); // '-1.2'
   * const r2 = P.run("-0.0"); // null
   * ```
   */
  (pattern: `-float`): P<string>;

  /**
   * Match any and only floating
   * point numbers of the form `N.N`,
   * where `N` is a natural number. Will
   * not read a leading `+`, but will
   * recognize `-`. Does not recognize `-0.0`.
   * @example
   * ```
   * const P = number('float');
   * const r1 = P.run(`3.147`); // '3.147'
   * const r2 = P.run(`2.3`); // '2.3'
   * const r3 = P.run(`-0.125`); // '-0.125'
   * const r4 = P.run(`-0.0`); // null
   * const r5 = P.run(`0.0001`); // '0.0001'
   * ```
   */
  (pattern: `float`): P<string>;

  /**
   * Match any and only hexadecimals.
   * Hexadecimals are of the format:
   *
   * `0x[0|1|2|3|4|5|6|7|8|9|a|b|c|d|e|f]`.
   */
  (pattern: `hex`): P<string>;

  /**
   * Match hexadecimals (of upper-case letters `A-F`)
   * prefaced with a `-`.
   */
  (pattern: `+-HEX`): P<string>;

  /**
   * Match hexadecimals (of lower-case letters `a-f`)
   * prefaced with a `+`.
   */
  (pattern: `+-hex`): P<string>;

  /**
   * Match any and only hexadecimals
   * of the format:
   *
   * `0x[0|1|2|3|4|5|6|7|8|9|A|B|C|D|E|F]`.
   */
  (pattern: `HEX`): P<string>;

  /**
   * Match any and only octal numbers
   * of the format:
   *
   * `0o[0|1|2|3|4|5|6|7|8|9]`.
   */
  (pattern: `octal`): P<string>;

  /**
   * Matches octal numbers prefaced
   * with a `-` or `+`.
   *
   * `0o[0|1|2|3|4|5|6|7|8|9]`.
   */
  (pattern: `+-octal`): P<string>;

  /**
   * Match binary numbers
   * of the format:
   *
   * `0b[0|1]`.
   */
  (pattern: `binary`): P<string>;

  /**
   * Matches binary numbers prefaced with
   * a `-` or `+`.
   */
  (pattern: `+-binary`): P<string>;

  /**
   * Match any and only numbers of the format:
   *
   * `[real]e[int]`
   *
   * @example
   * ```
   * const P = number('scientific');
   * const a = P.run(`-1.2e5`); // '-1.2e5'
   * const b = P.run(`+.2e+5`); // '+.2e+5'
   * ```
   */
  (pattern: `scientific`): P<string>;

  /**
   * Match any and only numbers of the format:
   *
   * `[real]E[int]`
   *
   * @example
   * ```
   * const P = number('SCIENTIFIC');
   * const res = P.run(`-1.2E5`); // '-1.2E5'
   * ```
   */
  (pattern: `SCIENTIFIC`): P<string>;

  /**
   * Match any and only numbers of the format:
   *
   * `(-|+)[int]/[int]`
   *
   * The forward slash is whitespace-sensitive. It will
   * not match against, say, `3 / 5`.
   * @example
   * ```
   * const P = number('fraction');
   * const r1 = P.run(`3/2`);  // '3/2'
   * const r2 = P.run(`+1/2`); // '+1/2'
   * const r3 = P.run(`1 / 2`); // null
   * ```
   */
  (pattern: `fraction`): P<string>;

  /**
   * Reads signed fractions.
   */
  (pattern: `signed-fraction`): P<string>;

  /**
   * Match any and only numbers of the format:
   *
   * `[real] [+|-] [real]i`
   *
   * The letter `i` is whitespace-sensitive. It will
   * not match against `3 + 5i`.
   */
  (pattern: `complex`): P<string>;

  /**
   * Match against all number options
   * except `complex`.
   */
  (pattern: `real`): P<string>;

  /**
   * Matches against unsigned fractions.
   */
  (pattern: `unsigned-fraction`): P<string>;

  /**
   * Matches against numbers with thousands
   * separators.
   */
  (pattern: `int_int`): P<string>;

  /** Match against all number options */
  (pattern: `any`): P<string>;
};
export const number: NumberReader = (
  pattern:
    | `${number}`
    | "whole"
    | "real"
    | "natural"
    | "+int"
    | "-int"
    | "int"
    | "int_int"
    | "dotnum"
    | "udotnum"
    | "-dotnum"
    | "+dotnum"
    | "ufloat"
    | "float"
    | "+float"
    | "-float"
    | "hex"
    | "+-HEX"
    | "+-hex"
    | "HEX"
    | "octal"
    | "+-octal"
    | "binary"
    | "+-binary"
    | "real"
    | "scientific"
    | "SCIENTIFIC"
    | "unsigned-fraction"
    | "signed-fraction"
    | "fraction"
    | "complex"
    | "any",
) => {
  let reader = one(pattern);
  // deno-fmt-ignore
  switch (pattern) {
    case "int_int": reader = integer_integer; break;
    case "whole": reader = positiveInteger; break;
    case "natural": reader = naturalNumber; break;
    case "+int": reader = plusInt; break;
    case "-int": reader = negativeInteger; break;
    case "int": reader = integer; break;
    case "dotnum": reader = dottedNumber; break;
    case "udotnum": reader = unsignedDottedNumber; break;
    case "-dotnum": reader = negativeDottedNumber; break;
    case "+dotnum": reader = plusDottedNumber; break;
    case "float": reader = floatingPointNumber; break;
    case "ufloat": reader = unsignedFloat; break;
    case "-float": reader = negativeFloat; break;
    case "+float": reader = positiveFloat; break;
    case '+-HEX': reader = signedHEX('+').or(signedHEX('-')); break;
    case '+-hex': reader = signedHex('+').or(signedHex('-')); break;
    case "hex": reader = hexNumber; break;
    case "HEX": reader = HexNumber; break;
    case "octal": reader = octalNumber; break;
    case "+-octal": reader = signedOctal('+').or(signedOctal('-')); break;
    case "binary": reader = binaryNumber; break;
    case "+-binary": reader = signedBinary('+').or(signedBinary('-')); break;
    case 'signed-fraction': reader = signedFraction; break;
    case 'unsigned-fraction': reader = unsignedFraction; break;
    case "fraction": reader = fractionalNumber; break;
    case "scientific": reader = scientificNumber('e'); break;
    case "SCIENTIFIC": reader = scientificNumber('E'); break;
    case "real": 
      reader = some([
        number("hex"),
        number("octal"),
        number("binary"),
        number("scientific"),
        number("+dotnum"),
        number("dotnum"),
        number("+float"),
        number("float"),
        number('signed-fraction'),
        number("fraction"),
        number("int"),
        number("+int"),
      ]);
      break;
    case "complex":
      reader = word([
        number("real"),
        plus.or(minus),
        number("real"),
        lit("i"),
      ]);
      break;
    case "any":
      reader = number("complex").or(number("real"));
      break;
  }
  return reader.errdef(pattern);
};

// § Token Types

/**
 * The sum type `tkn` maps to a token type recognized
 * by skim.
 * @enum
 */
export enum tkn {
  /**
   * Utility token for initializing
   *
   * - Lexeme: `""`
   * - _See also_ {@link Engine.CurrentToken}
   * - _See also_ {@link Engine.LastToken}.
   */
  nil = 0,

  /**
   * Utility token indicating
   * the end-of-input.
   *
   * - Lexeme: `""`
   */
  eof = 1,

  /**
   * Utility token indicating
   * an error occurred during scanning.
   *
   * - Lexeme: An _error message_.
   * - _See also_ {@link Engine.errorToken}.
   */
  error = 2,

  /**
   * - Lexeme: `(`
   * - _See also_ {@link Engine.readNextToken}.
   */
  left_paren = 3,

  /**
   * Lexeme: `)`
   * - _See also_ {@link Engine.readNextToken}.
   */
  right_paren = 4,

  /**
   * Lexeme: `[`
   * - _See also_ {@link Engine.readNextToken}.
   */
  left_bracket = 5,

  /**
   * Lexeme: `]`
   * - _See also_ {@link Engine.readNextToken}.
   */
  right_bracket = 6,

  /**
   * Lexeme: `{`
   * - _See also_ {@link Engine.readNextToken}.
   */
  left_brace = 7,

  /**
   * Lexeme: `}`
   * - _See also_ {@link Engine.readNextToken}.
   */
  right_brace = 8,

  /**
   * Lexeme: `.`
   * - _See also_ {@link Engine.readNextToken}.
   */
  dot = 9,

  /**
   * Lexeme: `|`
   * - _See also_ {@link Engine.readNextToken}.
   */
  vbar = 10,

  /**
   * Lexeme: `;`
   * - _See also_ {@link Engine.readNextToken}.
   */
  semicolon = 11,

  /**
   * Lexeme: `,`
   * - _See also_ {@link Engine.readNextToken}.
   */
  comma = 12,

  /**
   * Keyword-operator `and`
   */
  and = 601,

  /**
   * Keyword-operator: `or`
   */
  or = 602,

  /**
   * Keyword-operator: `nand`
   */
  nand = 603,

  /**
   * Keyword-operator: `nor`
   */
  nor = 604,

  /**
   * Keyword-operator: `xor`
   */
  xor = 605,

  /**
   * Keyword-operator: `xnor`
   */
  xnor = 606,

  /**
   * Keyword-operator: `not`
   */
  not = 607,

  /**
   * Keyword-operator: `is`
   */
  is = 608,

  /**
   * Keyword-operator: `rem`
   */
  rem = 609,

  /**
   * Keyword-operator: `mod`
   */
  mod = 610,

  /**
   * Keyword-operator: `div`
   */
  div = 611,

  /**
   * Lexeme: `+`
   * - _See also_ {@link Engine.readNextToken}.
   */
  plus = 612,

  /**
   * Lexeme: `-`
   * - _See also_ {@link Engine.readNextToken}.
   */
  minus = 613,

  /**
   * Lexeme: `*`
   * - _See also_ {@link Engine.readNextToken}.
   */
  star = 614,

  /**
   * Lexeme: `&`
   * - _See also_ {@link Engine.readNextToken}.
   */
  ampersand = 615,

  /**
   * Lexeme: `^`
   * - _See also_ {@link Engine.readNextToken}.
   */
  caret = 616,

  /**
   * Lexeme: `%`
   * - _See also_ {@link Engine.readNextToken}.
   */
  percent = 617,

  /**
   * Lexeme: `/`
   * - _See also_ {@link Engine.readNextToken}.
   */
  slash = 618,

  /**
   * Lexeme: `!=`
   * - _See also_ {@link Engine.readNextToken}.
   */
  neq = 619,

  /**
   * Lexeme: `!`
   * - _See also_ {@link Engine.readNextToken}.
   */
  bang = 620,

  /**
   * Lexeme: `>=`
   * - _See also_ {@link Engine.readNextToken}.
   */
  geq = 621,

  /**
   * Lexeme: `>`
   * - _See also_ {@link Engine.readNextToken}.
   */
  gt = 622,

  /**
   * Lexeme: `<=`
   * - _See also_ {@link Engine.readNextToken}.
   */
  leq = 623,

  /**
   * Lexeme: `<`
   * - _See also_ {@link Engine.readNextToken}.
   */
  lt = 624,

  /**
   * Lexeme: `==`
   * - _See also_ {@link Engine.readNextToken}.
   */
  deq = 625,

  /**
   * Lexeme: `=`
   * - _See also_ {@link Engine.readNextToken}.
   */
  eq = 626,

  /**
   * Lexeme: Any native function.
   * - _See also_ {@link Engine.readNextToken}.
   */
  call = 627,

  /**
   * Token type integer.
   *
   * - Lexeme: Any `int`, `+int`, or `-int`.
   * - Guard: {@link isTokenInt}
   *
   * _References_
   * 1. _See also_ {@link Engine.NUMBER}
   * 2. _See also_ {@link integer}
   * 2. _See also_ {@link integer_integer}
   */
  int = 101,

  /**
   * Token type integer.
   * - Lexeme: Any `float`, `+float`, or `-float`.
   * - Guard: {@link isTokenFloat}
   *
   * _Reference_.
   * 1. _See also_ {@link Engine.NUMBER} (the Engine’s number
   * scanning method)
   * 2. _See also_ {@link floatingPointNumber} (demonstrating
   * how floating point numbers are parsed).
   */
  float = 102,

  /**
   * Token type scinum. Note that Skim only recognizes
   * scientific numbers prefaced with an uppercase `E`.
   *
   * - Lexeme: Any `scinum`, `+scinum`, or `-scinum`.
   * - Guard: {@link isTokenScinum}
   *
   * _Reference_.
   * 1. _See also_ {@link Engine.NUMBER} (the Engine’s number
   * scanning method)
   * 2. _See also_ {@link scientificNumber} (demonstrating
   * how scientific numbers are parsed).
   */
  scinum = 103,

  /**
   * Token type fraction.
   *
   * - Lexeme: Any `frac`, `+frac`, or `-frac`.
   * - Guard: {@link isTokenFraction}
   *
   * _Reference_.
   * 1. _See also_ {@link Engine.NUMBER} (the Engine’s number
   * scanning method)
   * 2. _See also_ {@link fractionalNumber} (demonstrating
   * how fractional numbers are parsed).
   */
  frac = 104,

  /**
   * Token type hex.
   *
   * - Lexeme: Any `hex`, `+hex`, or `-hex`.
   * - Guard: {@link isTokenHex}
   *
   * _References_.
   * 1. _See also_ {@link Engine.NUMBER} (the Engine’s number
   * scanning method)
   * 2. _See also_ {@link hexNumber} (demonstrating
   * how fractional numbers are parsed).
   * 3. _See also_ {@link signedHex} (demonstrating
   * how signed hexadecimal numbers are parsed).
   */
  hex = 105,

  /**
   * Token type octal (indicating an octal number).
   *
   * - Lexeme: Any `octal`, `+octal`, or `-octal`.
   * - Guard: {@link tknIsFrac}
   *
   * _References_.
   * 1. _See also_ {@link Engine.NUMBER} (the Engine’s number
   * scanning method)
   * 2. _See also_ {@link isTokenOctal} (demonstrating
   * how fractional numbers are parsed).
   * 3. _See also_ {@link signedOctal} (demonstrating
   * how signed hexadecimal numbers are parsed).
   */
  octal = 106,

  /**
   * Token type binary (indicating an binary number).
   *
   * - Lexeme: Any `binary`, `+binary`, or `-binary`.
   * - Guard: {@link isTokenBinary}
   *
   * _References_.
   * 1. _See also_ {@link Engine.NUMBER} (the Engine’s number
   * scanning method)
   * 2. _See also_ {@link octalNumber} (demonstrating
   * how fractional numbers are parsed).
   * 3. _See also_ {@link signedBinary} (demonstrating
   * how signed hexadecimal numbers are parsed).
   */
  binary = 107,

  /**
   * Keyword-literal: `nan`,
   */
  nan = 108,

  /**
   * Keyword-literal: `inf`
   */
  inf = 109,

  /**
   * Token type string (indicating a string literal).
   * Strings in Skim have only one delimiter, the double
   * quote `"`
   *
   * - Lexeme: All _glyphs_ surrounded by double quotes.
   * - Guard: {@link isTokenString}
   *
   * @remark The engine is immediately prompted to scan
   * for a string on the first double quote `"`.
   *
   * _References_.
   * 1. _See also_ {@link Engine.STRING} (the Engine’s string
   * scanning method)
   */
  string = 110,

  /**
   * Token type symbol, indicating an identifier.
   *
   * - Lexeme: All glyphs recognized as symbols
   * by the {@link Engine.SYMBOL} method.
   * - Guard: {@link isTokenSymbol}
   *
   * _References_.
   * 1. _See_ {@link Engine.SYMBOL} for further comments
   * on classifying symbols.
   */
  symbol = 111,

  /**
   * Keyword-literal: `null`.
   */
  null = 112,

  /**
   * Keyword-literal: `true`
   */
  true = 113,

  /**
   * Keyword-literal: `false`
   */
  false = 114,

  /**
   * Keyword `class`.
   */
  class = 301,

  /**
   * Keyword `else`.
   */
  else = 302,

  /**
   * Keyword `for`.
   */
  for = 303,

  /**
   * Keyword `if`.
   */
  if = 304,

  /**
   * Keyword `return`
   */
  return = 305,

  /**
   * Keyword `super`
   */
  super = 306,

  /**
   * Keyword `this`
   */
  this = 307,

  /**
   * Keyword `let`
   */
  let = 308,

  /**
   * Keyword `def`
   */
  def = 309,

  /**
   * Keyword `while`
   */
  while = 310,

  /**
   * Keyword `in`
   */
  in = 311,

  /**
   * Keyword `do`
   */
  do = 312,

  /**
   * Keyword `goto`
   */
  goto = 313,

  /**
   * Keyword `skip`
   */
  skip = 314,

  /**
   * Keyword `to`
   */
  to = 315,
}

/**
 * A test-builder function. This will return a function
 * that we can use to test for specific token types. We’ll
 * use functions for common tests to avoid having to write
 * `===` everywhere.
 */
const tknTest = (t: tkn) => (x: tkn) => x === t;

/**
 * Returns true if the given token type maps to
 * an hexadecimal number.
 *
 * _References_.
 * 1. _See also_ {@link hexNumber} (demonstrating
 * how floating point numbers are parsed).
 */
const isTokenHex = tknTest(tkn.hex);

/**
 * Returns true if the given token type maps to
 * an octal number.
 *
 * _References_.
 * 1. _See also_ {@link octalNumber} (demonstrating
 * how floating point numbers are parsed).
 */
const isTokenOctal = tknTest(tkn.octal);
/**
 * Returns true if the given token type maps to
 * an integer.
 *
 * _References_.
 * 1. _See also_ {@link integer} (demonstrating
 * how floating point numbers are parsed).
 */
const isTokenInt = tknTest(tkn.int);

/**
 * Returns true if the given token type maps to
 * a float.
 *
 * _Reference_.
 * 1. _See also_ {@link floatingPointNumber} (demonstrating
 * how floating point numbers are parsed).
 */
const isTokenFloat = tknTest(tkn.float);

/**
 * Returns true if the given token type maps to
 * a scientific number.
 *
 * _Reference_.
 * 1. _See also_ {@link scientificNumber} (demonstrating
 * how floating point numbers are parsed).
 */
const isTokenScinum = tknTest(tkn.scinum);

/**
 * Returns true if the given token type maps to
 * a binary number.
 *
 * _Reference_.
 * 1. _See also_ {@link } (demonstrating
 * how floating point numbers are parsed).
 */
const isTokenBinary = tknTest(tkn.binary);

/**
 * Returns true if the given token type maps to
 * a fraction.
 *
 * _Reference_.
 * 1. _See also_ {@link fractionalNumber} (demonstrating
 * how fractions are parsed).
 */
const isTokenFraction = tknTest(tkn.frac);

/**
 * Returns true if the given token type maps to
 * a string.
 *
 * _Reference_.
 * 1. _See also_ {@link Engine.STRING} (demonstrating
 * how strings are tokenized).
 */
const isTokenString = tknTest(tkn.string);

const isTokenSymbol = tknTest(tkn.symbol);
const isTokenCall = tknTest(tkn.call);

/**
 * Returns true if the given token type
 * is the `eof` token (the token indicating
 * no more tokens are left).
 */
const isTokenEOF = tknTest(tkn.eof);

const isTokenNumber = (t: tkn) => 100 < t && t < 110;
const isTokenKeyword = (t: tkn) => 300 < t && t < 400;
const isTokenOp = (t: tkn) => 600 < t && t < 700;
/**
 * Returns true if the given token type
 * is an atomic token. Atomic tokens
 * include:
 *
 * 1. `tkn.int`
 * 2. `tkn.float`
 * 3. `tkn.scinum`
 * 4. `tkn.frac`
 * 5. `tkn.hex`
 * 6. `tkn.octal`
 * 7. `tkn.binary`
 * 8. `tkn.string`
 * 9. `tkn.symbol`
 * 10. `tkn.nan`
 * 11. `tkn.inf`
 * 12. `tkn.true`
 * 13. `tkn.false`
 * 14. `tkn.null`
 *
 * _Reference_.
 * 1. _See also_ {@link Engine.atom} (demonstrating
 * how literal values are parsed).
 */
const isTokenAtom = (t: tkn) => 100 < t && t < 200;
const isOperable = (t: tkn) => isTokenNumber(t) || isTokenOp(t);

const numpkg = (t: tkn) => (n: string) => ({ n, type: t });
const signedNumber = (sign: "-" | "+") =>
  some([
    signedHex(sign).map(numpkg(tkn.hex)),
    signedBinary(sign).map(numpkg(tkn.binary)),
    signedOctal(sign).map(numpkg(tkn.octal)),
    number("scientific").map(numpkg(tkn.scinum)),
    number((sign === "+" ? "+dotnum" : "-dotnum") as any).map(
      numpkg(tkn.float),
    ),
    number((sign === "+" ? "+dotnum" : "-dotnum") as any).map(
      numpkg(tkn.float),
    ),
    number("int").map(numpkg(tkn.int)),
  ]);

/**
 * Returns `true` if the given character `c` is
 * a digit, false otherwise.
 */
const isDigit = (c: string) => "0" <= c && c <= "9";
const charTest = (of: string) => (c: string) => c === of;
const isDot = charTest(".");
const isPlus = charTest("+");
const isMinus = charTest("-");
const isSign = (c: string) => isPlus(c) || isMinus(c);
const isDotDigit = (c: string) => isDigit(c) || isDot(c) || isSign(c);
export enum status {
  ok,
  scanner_error,
  syntax_error,
  semantic_error,
  resolver_error,
}

export type Token = {
  type: tkn;
  lexeme: string;
  line: number;
  column: number;
  literal?: string | number;
};

enum nodetype {
  string,
  number,
  symbol,
  bool,
  binex,
  null,
  function,
  call,
  block,
  vardef,
  assign,
}

interface Visitor<t> {
  num(node: NUMBER): t;
  str(node: STRING): t;
  sym(node: SYMBOL): t;
  fn(node: FN): t;
  binex(node: BINEX): t;
  call(node: CALL): t;
  bool(node: BOOL): t;
  null(node: NULL): t;
  block(node: BLOCK): t;
  vardef(node: VARDEF): t;
  assign(node: ASSIGN): t;
}

abstract class ASTNode {
  type: nodetype;
  constructor(type: nodetype) {
    this.type = type;
  }
  abstract accept<t>(visitor: Visitor<t>): t;
}

// deno-fmt-ignore
const nodeTest = <N extends ASTNode>(
  ntype: nodetype,
) => (n: ASTNode): n is N => n.type === ntype;

class BINEX extends ASTNode {
  accept<t>(visitor: Visitor<t>): t {
    return visitor.binex(this);
  }
  op: Token;
  left: ASTNode;
  right: ASTNode;
  constructor(op: Token, left: ASTNode, right: ASTNode) {
    super(nodetype.binex);
    this.op = op;
    this.left = left;
    this.right = right;
  }
}
const binex = (op: Token, left: ASTNode, right: ASTNode) =>
  new BINEX(op, left, right);
const isNodeBinex = nodeTest<BINEX>(nodetype.binex);

class SYMBOL extends ASTNode {
  accept<t>(visitor: Visitor<t>): t {
    return visitor.sym(this);
  }
  sym: string;
  constructor(sym: string) {
    super(nodetype.symbol);
    this.sym = sym;
  }
}
const isNodeSymbol = nodeTest<SYMBOL>(nodetype.symbol);

class STRING extends ASTNode {
  accept<t>(visitor: Visitor<t>): t {
    return visitor.str(this);
  }
  str: string;
  constructor(str: string) {
    super(nodetype.string);
    this.str = str;
  }
}
const isNodeString = nodeTest<STRING>(nodetype.string);

class NULL extends ASTNode {
  accept<t>(visitor: Visitor<t>): t {
    return visitor.null(this);
  }
  value: null = null;
  constructor() {
    super(nodetype.null);
  }
}
const nil = () => new NULL();
const isNodeNull = nodeTest<NULL>(nodetype.null);

class NUMBER extends ASTNode {
  accept<t>(visitor: Visitor<t>): t {
    return visitor.num(this);
  }
  num: number;
  constructor(num: number) {
    super(nodetype.number);
    this.num = num;
  }
}
// deno-fmt-ignore
const NumFactory = (
  f: (x: string) => number,
) => (value: string|number) =>
  new NUMBER(typeof value === 'string' ? f(value) : value);

const nan = () => new NUMBER(NaN);
const inf = () => new NUMBER(Infinity);
const int = NumFactory((x) => (x as any) * 1);
const hex = NumFactory((x) => Number.parseInt(x, 16));
const octal = NumFactory((x) => Number.parseInt(x, 8));
const float = NumFactory((x) => Number.parseFloat(x));
const binary = NumFactory((x) => Number.parseInt(x, 2));
const str = (value: string) => new STRING(value);
const sym = (value: string) => new SYMBOL(value);
const isNodeNumber = nodeTest<NUMBER>(nodetype.number);

class BOOL extends ASTNode {
  accept<t>(visitor: Visitor<t>): t {
    return visitor.bool(this);
  }
  bool: boolean;
  constructor(value: boolean) {
    super(nodetype.bool);
    this.bool = value;
  }
}
const bool = (value: string) => new BOOL(value === "true");
const isNodeBool = nodeTest<BOOL>(nodetype.bool);

class FN extends ASTNode {
  accept<t>(visitor: Visitor<t>): t {
    return visitor.fn(this);
  }
  name: SYMBOL;
  params: ASTNode[];
  body: ASTNode[];
  constructor(name: SYMBOL, params: ASTNode[], body: ASTNode[]) {
    super(nodetype.call);
    this.name = name;
    this.params = params;
    this.body = body;
  }
}
const fn = (name: SYMBOL, params: ASTNode[], body: ASTNode[]) =>
  new FN(name, params, body);
const isNodeFn = nodeTest<FN>(nodetype.function);

class BLOCK extends ASTNode {
  accept<t>(visitor: Visitor<t>): t {
    return visitor.block(this);
  }
  statements: ASTNode[];
  constructor(statements: ASTNode[]) {
    super(nodetype.block);
    this.statements = statements;
  }
}

const block = (stmts: ASTNode[]) => new BLOCK(stmts);
const isNodeBlock = nodeTest<BLOCK>(nodetype.block);

class ASSIGN extends ASTNode {
  accept<t>(visitor: Visitor<t>): t {
    return visitor.assign(this);
  }
  name: SYMBOL;
  value: ASTNode;
  constructor(name: SYMBOL, value: ASTNode) {
    super(nodetype.assign);
    this.name = name;
    this.value = value;
  }
}

const assign = (name: SYMBOL, value: ASTNode) => new ASSIGN(name, value);
const isNodeAssign = nodeTest<ASSIGN>(nodetype.assign);

class VARDEF extends ASTNode {
  accept<t>(visitor: Visitor<t>): t {
    return visitor.vardef(this);
  }
  name: SYMBOL;
  value: ASTNode;
  constructor(name: SYMBOL, value: ASTNode) {
    super(nodetype.vardef);
    this.name = name;
    this.value = value;
  }
}
const vardef = (name: SYMBOL, value: ASTNode) => new VARDEF(name, value);
const isNodeVarDef = nodeTest<VARDEF>(nodetype.vardef);

class CALL extends ASTNode {
  accept<t>(visitor: Visitor<t>): t {
    return visitor.call(this);
  }
  name: SYMBOL;
  args: ASTNode[];
  constructor(name: SYMBOL, args: ASTNode[]) {
    super(nodetype.call);
    this.name = name;
    this.args = args;
  }
}
const call = (name: SYMBOL, args: ASTNode[]) => new CALL(name, args);
const isNodeCall = nodeTest<CALL>(nodetype.call);

/**
 * Consider the expression:
 *
 * ```
 * a × b + c
 * ```
 *
 * We can interpret this as:
 *
 * ```
 * (a × b) + c
 * ```
 *
 * or as:
 *
 * ```
 * a × (b + c)
 * ```
 *
 * That is, we can perform the multiplication first,
 * then addition, or perform the addition then
 * the multiplication. This ambiguity is resolved
 * through _predecence_ and _associativity_.
 *
 * We begin by modelling precedence. First, we'll
 * think of operators as knots tying expressions
 * (which can either be literals or expressions
 * that reduce to literals). A `bp` (binding power) is an
 * informal measure of how strong the knot is.
 *
 * For example, with the expression `a × b + c`,
 * the `×` is a “stronger” knot than the `+`, so it
 * has enough strength to hold `b + c`:
 *
 * ```
 * a × (b + c)
 * ```
 *
 * The `+`, on the other hand, is only strong
 * enough to hold `b` and `c`. From this conclusion, we
 * determine that the expression _cannot_ be read as:
 *
 * ```
 * (a × b) + c
 * ```
 *
 * The notion of a binding power is how we model _precedence_.
 * Translating to more familiar times, `×` has higher precendence than
 * `+`.
 *
 * For chained operators (e.g. `a + b + c`), we can “nudge” the `+`
 * somewhat by including a _fixity_ (see {@link afix}). If we assign
 * `+` a fixity of `afix.left`, then the right-most `+` is a tigher knot
 * than the left-most `+`, yielding:
 *
 * ```
 * (a + b) + c
 * ```
 */
enum bp {
  null,
  non,
  is,
  assign,
  and,
  xor,
  nand,
  nor,
  xnor,
  or,
  equality,
  comparison,
  sum,
  difference,
  product,
  quotient,
  power,
  call,
  primary,
}

/**
 * This is a function used to instantiate an empty
 * token. Skim uses an empty token to ensure
 * the {@link Engine.LastToken} and
 * {@link Engine.CurrentToken} are always defined.
 */
const emptyToken = () => ({
  type: tkn.nil,
  lexeme: "",
  line: -1,
  column: -1,
});

type Global = {
  functions: { [key: string]: Function };
  constants: { [key: string]: number };
};

export class Engine {
  private GlobalScope: Global = {
    functions: {
      Product: product,
      Sum: sum,
      Even: even,
      Odd: odd,
      cos: Math.cos,
      sin: Math.sin,
      tan: Math.tan,
      arctan: Math.atan,
      arcsin: Math.asin,
      arccos: Math.acos,
    },
    constants: {
      pi: Math.PI,
      e: Math.E,
    },
  };
  constants(fns: { [key: string]: number }) {
    const current = this.GlobalScope.constants;
    this.GlobalScope.constants = { ...current };
    for (const k in fns) {
      if (this.GlobalScope.constants[k]) continue;
      if (typeof fns[k] === "number") {
        this.GlobalScope.constants[k] = fns[k];
      }
    }
    return this;
  }

  isCoreFunction(x: string) {
    return this.GlobalScope.functions[x] !== undefined;
  }
  isCoreNumber(x: string) {
    return this.GlobalScope.constants[x] !== undefined;
  }
  functions(fns: { [key: string]: Function }) {
    const current = this.GlobalScope.functions;
    this.GlobalScope.functions = { ...current };
    for (const k in fns) {
      if (this.GlobalScope.functions[k]) continue;
      this.GlobalScope.functions[k] = fns[k];
    }
    return this;
  }
  /**
   * @internal The input source string.
   * This is a readonly string.
   * Modifications should never be made
   * on this source.
   */
  private Input!: string;

  /**
   * @internal The last token read.
   */
  private LastToken!: tkn;

  /**
   * @internal The current token.
   */
  private CurrentToken!: tkn;

  /**
   * @internal The starting index of the
   * current substring containing
   * a (potential) lexeme.
   */
  private Start!: number;

  /**
   * @internal The starting index of the
   * current lexeme.
   */
  private Current!: number;

  /**
   * @internal The current line number.
   */
  private Line!: number;

  /**
   * @internal The current column number.
   */
  private Column!: number;

  /**
   * @internal The current engine status.
   * See {@link status} from details on the
   * `stat` codes. The engine’s status
   * is never updated from a method directly.
   * All status updates should be made through
   * {@link Engine.updateStatus}.
   */
  private Status!: status;

  /**
   * @internal Updates the current {@link Engine.Status}.
   */
  private updateStatus(newStatus: status) {
    this.Status = newStatus;
  }

  /**
   * Initiates (and resets) the engine’s state.
   * This function should always be called at the
   * beginning of a parse, and called again at the
   * end of a parse.
   */
  private enstate(src: string) {
    this.Input = src;
    this.LastToken = tkn.nil;
    this.CurrentToken = tkn.nil;
    this.Start = 0;
    this.Current = 0;
    this.Line = 1;
    this.Column = 0;
    this.Status = status.ok;
  }

  /**
   * @internal Increments the current
   * index by 1, and returns the
   * character before the increment.
   */
  private tick(by: number = 1) {
    const current = this.Current;
    this.Current += by;
    return this.Input[current];
  }

  /**
   * @internal Returns a quad of numbers
   * `[start, current, line, column]`,
   * where:
   * - `start` is the {@link Engine.Start},
   * - `current` is the {@link Engine.Current},
   * - `line` is the {@link Engine.Line}, and
   * - `column` is the {@link Engine.Column},
   */
  private position() {
    const start = this.Start;
    const current = this.Current;
    const line = this.Line;
    const column = this.Column;
    return [start, current, line, column] as const;
  }

  /**
   * @internal Returns true if the engine
   * has reached the end of input,
   * false otherwise.
   */
  private atEnd() {
    return this.Current >= this.Input.length;
  }

  /**
   * @internal Returns an object `{lexeme,line,column}`,
   * where:
   * - `lexeme` is the lexeme recognized,
   * - `line` is the {@link Engine.Line}, and
   * - `column` is the {@link Engine.Column}.
   * This is a helper method used by the
   * {@link Engine.newToken} and
   * {@link Engine.errorToken} methods
   * to produce tokens.
   */
  private tokenSlate(lexeme: string = "") {
    const [start, end, line, column] = this.position();
    lexeme = lexeme ? lexeme : this.Input.slice(start, end);
    return { lexeme, line, column };
  }

  private newToken(t: tkn, lexeme?: string): Token {
    const type = t;
    const slate = this.tokenSlate(lexeme);
    this.LastToken = this.CurrentToken;
    this.CurrentToken = type;
    lexeme = isTokenEOF(t) ? "END" : slate.lexeme;
    return { ...slate, type, lexeme };
  }

  private errorToken(message: string): Token {
    this.updateStatus(status.scanner_error);
    const type = tkn.error;
    const slate = this.tokenSlate(message);
    return { ...slate, type };
  }

  /**
   * @internal
   * Scanning method for handling `+` and `-`.
   * The tokens `+` and `-` are given special
   * treatment because we allow `+` and `-`
   * prefaced numbers.
   */
  private SIGN(of: "+" | "-") {
    const nxtchar = this.char();
    if (isDotDigit(nxtchar) && !isTokenNumber(this.CurrentToken)) {
      const res = signedNumber(of)
        .run(this.Input.slice(this.Current - 1));
      if (res.erred) return this.errorToken(`Expected a number signed ${of}`);
      this.tick(res.result.n.length - 1);
      return this.newToken(res.result.type);
    }
    const type = of === "+" ? tkn.plus : tkn.minus;
    return this.newToken(type);
  }

  private char() {
    return this.Input[this.Current];
  }

  /**
   * @internal A helper method that skips
   * newlines, tabs, and whitespaces during scanning.
   * Currently used by {@link Engine.readNextToken}
   */
  private skipWhitespace() {
    while (!this.atEnd()) {
      const c = this.char();
      switch (c) {
        case " ":
        case "\r":
        case "\t":
          this.Column++;
          this.tick();
          break;
        case "\n":
          this.Line++;
          this.Column = 0;
          this.tick();
          break;
        default:
          return;
      }
    }
  }

  /**
   * @internal Scans a string, if encountered.
   * This method is triggered when {@link Engine.readNextToken}
   * encounters a double-quote. If no  terminating
   * double-quote is found, an error token
   * is returned.
   */
  private STRING() {
    while (this.char() !== `"` && !this.atEnd) {
      if (this.char() == `\n`) this.Line++;
      this.tick();
    }
    if (this.atEnd()) return this.errorToken(`Unterminated string.`);
    this.tick();
    const start = this.Start;
    const current = this.Current;
    const lexeme = this.Input.substring(start + 1, current - 1);
    return this.newToken(tkn.string, lexeme);
  }

  /**
   * @internal
   * Scans a number. Supported number formats:
   * 1. Hexadecimals of the form: `[0x] ([a-f]+ | [0-9]+)`,
   * 2. Octals of the form `[0o] [0-7]+`,
   * 3. Binary numbers of the form `[0b] [0|1]+ `,
   * 4. Scientific numbers of the form `<decimal> e [+|-] <int>`
   * 5. Fractions of the form `[+|-] <int> [/] <int>`
   * 6. Integers (`<int>`) of the form `[0] | [1-9]+ [_] [0-9]+`
   */
  private NUMBER() {
    const fn = (t: tkn, F: (x: string) => number) => (n: string) => ({
      n,
      type: t,
      literal: F(n),
    });
    const src = this.Input.slice(this.Current - 1);
    const res = some([
      number("hex").map(fn(tkn.hex, (x) => Number.parseInt(x, 16))),
      number("octal").map(fn(tkn.octal, (x) => Number.parseInt(x, 8))),
      number("binary").map(fn(tkn.binary, (x) => Number.parseInt(x, 2))),
      number("SCIENTIFIC").map((n) => ({ n, type: tkn.scinum, literal: n })),
      number("+dotnum").map(fn(tkn.float, Number.parseFloat)),
      number("dotnum").map(fn(tkn.float, Number.parseFloat)),
      number("+float").map(fn(tkn.float, Number.parseFloat)),
      number("float").map(fn(tkn.float, Number.parseFloat)),
      number("fraction").map(fn(tkn.frac, Number.parseFloat)),
      number("int").map(fn(tkn.int, Number.parseInt)),
    ]).run(src);
    if (res.erred) return this.errorToken("Invalid number format.");
    this.tick(res.result.n.length - 1);
    const out = this.newToken(res.result.type);
    out.literal = res.result.literal;
    return out;
  }

  /**
   * @internal A helper method that moves the state
   * forward (incrementing {@link Engine.Current})
   * if the next character matches `expected`. If
   * the character matches, returns `true`, otherwise
   * `false`. See {@link Engine.readNextToken} for usage.
   */
  private match(expected: string) {
    if (this.atEnd()) return false;
    if (this.char() !== expected) return false;
    this.tick();
    return true;
  }
  /**
   * @internal
   * Returns the token type for a given symbol. This method
   * filters keywords from the user’s identifiers.
   * To avoid being identified as a keyword, identifiers must
   * satisfy the two necessary conditions below:
   *
   * 1. Start with either a:
   * - a math symbol (_see_ {@link isMathSymbol}),
   * - a Latin letter,
   * - a Latin letter with accents,
   * - a Greek letter, or
   * - an underscore
   * 2. end with either:
   * - a glyph in (1), or
   * - a digit
   *
   * _References_.
   * 1. _See_ {@link isMathSymbol} (demonstrating how math symbols
   * are tested).
   * 2. _See_ {@link isLatinGreek} (demonstrating how Latin or Greek
   * symbols are tested).
   * 3. _See_ {@link isDigit} (demonstrating how digits are tested).
   */
  private symbolType() {
    const text = this.Input.substring(this.Start, this.Current);
    // deno-fmt-ignore
    switch (text) {
      case 'and': return tkn.and;
      case 'class': return tkn.class;
      case 'else': return tkn.else;
      case 'for': return tkn.for;
      case 'if': return tkn.if;
      case 'null': return tkn.null;
      case 'or': return tkn.or;
      case 'nand': return tkn.nand;
      case 'nor': return tkn.nor;
      case 'xor': return tkn.xor;
      case 'xnor': return tkn.xnor;
      case 'not': return tkn.not;
      case 'is': return tkn.is;
      case 'return': return tkn.return;
      case 'super': return tkn.super;
      case 'this': return tkn.this;
      case 'let': return tkn.let;
      case 'def': return tkn.def;
      case 'while': return tkn.while;
      case 'in': return tkn.in;
      case 'true': return tkn.true;
      case 'false': return tkn.false;
      case 'NaN': return tkn.nan;
      case 'Inf': return tkn.inf;
      case 'do': return tkn.do;
      case 'goto': return tkn.goto;
      case 'skip': return tkn.skip;
      case 'to': return tkn.to;
      case 'rem': return tkn.rem;
      case 'mod': return tkn.mod;
      case 'div': return tkn.div;
    }

    return tkn.symbol;
  }

  /**
   * @internal
   * Scans for a symbol (identifier).
   * This method automatically classifies
   * globally-defined function names as calls,
   * and globally-defined constants as numbers.
   * _See also_ {@link Engine.symbolType} (defining
   * the restrictions on identifiers).
   */
  private SYMBOL() {
    while (isSymbol(this.char()) || isDigit(this.char())) {
      this.tick();
      if (this.atEnd()) break;
    }
    const text = this.Input.substring(this.Start, this.Current);
    if (this.isCoreFunction(text)) {
      return this.newToken(tkn.call);
    }
    if (this.isCoreNumber(text)) {
      const num = this.newToken(tkn.float);
      num.literal = this.GlobalScope.constants[text];
      return num;
    }
    return this.newToken(this.symbolType());
  }

  /**
   * @internal Returns the next token recognized
   * in {@link Engine.Input}. If the engine has
   * reached the end of input, it returns an error
   * Token of type `tkn.eof` (end-of-file token).
   * If no token is recognized and the Engine
   * hasn't reached the end of input, an error
   * token of type `tkn.error` is returned.
   */
  private readNextToken() {
    this.skipWhitespace();
    if (this.atEnd()) return this.newToken(tkn.eof);
    this.Start = this.Current;
    const c = this.tick();
    if (isSymbol(c)) return this.SYMBOL();
    if (isDigit(c)) return this.NUMBER();
    const nxtchar = this.Input[this.Current];
    const token = (t: tkn, lexeme = "") => this.newToken(t, lexeme);
    // deno-fmt-ignore
    switch (c) {
      // single-character tokens
      case "(": return token(tkn.left_paren);
      case ")": return token(tkn.right_paren);
      case "[": return token(tkn.left_bracket);
      case "]": return token(tkn.right_bracket);
      case "{": return token(tkn.left_brace);
      case "}": return token(tkn.right_brace);
      case ";": return token(tkn.semicolon);
      case "/": return token(tkn.slash);
      case "*": return token(tkn.star);
      case ",": return token(tkn.vbar);
      case "&": return token(tkn.ampersand);
      case "^": return token(tkn.caret);
      case "%": return token(tkn.percent);
      case ",": return token(tkn.comma);

      // one- or two-character tokens
      case "!": return token(this.match("=") ? tkn.neq : tkn.bang);
      case ">": return token(this.match("=") ? tkn.geq : tkn.gt);
      case "<": return token(this.match("=") ? tkn.leq : tkn.lt);
      case "=": return token(this.match("=") ? tkn.deq : tkn.eq);

      // literals
      case '"': return this.STRING();
      
      // special handling for `.`
      // because we allow dot-led numbers (e.g., .23).
      case ".": return isDigit(nxtchar) ? this.NUMBER() : token(tkn.dot)

      // special handling for `+` and `-`
      // because we allow signed numbers.
      case "-":
      case "+": 
        return this.SIGN(c);
    }
    return this.errorToken("Unexpected character.");
  }

  /**
   * Returns an array of tokens. This method
   * is used for testing, and isn’t directly
   * used by the Engine. It’s provided as
   * a part of the public API because it
   * may be helpful for debugging input
   * expressions.
   */
  public tokenize<x>(
    text: string,
    fn: (t: Token) => x = (tk) => (tk as x),
  ) {
    this.enstate(text);
    const tokens = [fn(this.readNextToken())];
    while (!isTokenEOF(this.CurrentToken)) {
      const token = this.readNextToken();
      tokens.push(fn(token));
      if (isTokenEOF(token.type)) break;
    }
    return tokens;
  }

  peek: Token = emptyToken();
  prevToken: Token = emptyToken();
  lastnode: ASTNode = nil();

  reset() {
    this.Input = "";
    this.LastToken = tkn.nil;
    this.CurrentToken = tkn.nil;
    this.Start = 0;
    this.Current = 0;
    this.Line = 1;
    this.Column = 0;
    this.Status = status.ok;
    this.peek = emptyToken();
    this.prevToken = emptyToken();
    this.lastnode = nil();
  }
  private advance() {
    const peek = this.peek;
    this.peek = this.readNextToken();
    this.prevToken = peek;
    return peek;
  }

  /**
   * Parses the given input string, `text`.
   */
  parse(text: string) {
    this.enstate(text);
    this.advance(); // prime the `peek`
    const res: { prog: ASTNode[] } = { prog: [] };
    while (!this.atEnd()) {
      const node = this.STATEMENT();
      res.prog.push(node);
    }
    this.reset();
    return res;
  }

  STATEMENT() {
    const token = this.peek;
    switch (token.type) {
      case tkn.let:
        this.advance(); // eat the 'let'
        return this.VAR_DECLARATION(); // go to variable declaration
      default:
        return this.EXPRESSION_STATEMENT();
    }
  }

  VAR_DECLARATION() {
    const name = this.advance(); // get the name
    const id = sym(name.lexeme); // transform to node
    this.advance(); // eat the '=' token
    const val = this.EXPR(); // parse the value
    const node = vardef(id, val);
    if (this.prevToken.type === tkn.semicolon) {
      return this.astnode(node);
    }
    if (this.peek.type !== tkn.eof) {
      this.eat(tkn.semicolon, "Expected semicolon.");
    }
    return this.astnode(node); // return the new node
  }

  ASSIGN(): ASSIGN {
    const name = this.lastnode;
    this.advance();
    if (!isNodeSymbol(name)) {
      throw new Error("Invalid left-hand side");
    }
    const val = this.EXPR();
    return this.astnode(assign(name, val));
  }

  EXPRESSION_STATEMENT() {
    const expr = this.EXPR();
    if (isTokenEOF(this.peek.type) || this.sees(tkn.semicolon)) {
      return this.astnode(expr);
    }
    this.eat(tkn.semicolon, `Expected ';' after expression.`);
    return this.astnode(expr);
  }

  check(tokenType: tkn) {
    if (this.atEnd()) return false;
    return this.peek.type === tokenType;
  }

  sees(type: tkn) {
    if (!this.check(type)) return false;
    this.advance();
    return true;
  }

  matches(tokenTypes: tkn[]) {
    for (let i = 0; i < tokenTypes.length; i++) {
      if (this.sees(tokenTypes[i])) return true;
    }
    return false;
  }

  argList() {
    const args: ASTNode[] = [];
    if (!this.check(tkn.right_paren)) {
      do {
        args.push(this.EXPR());
      } while (this.matches([tkn.comma]));
    }
    this.eat(tkn.right_paren, "Expected `)` after arguments.");
    return args;
  }
  CALL() {
    const name = this.advance();
    this.advance();
    const args = this.argList();
    return this.astnode(call(sym(name.lexeme), args));
  }

  eat(tokentype: tkn, message: string) {
    if (this.peek.type === tokentype) {
      return this.advance();
    }
    throw new Error(message);
  }
  GROUP(): ASTNode {
    this.advance();
    const expr = this.astnode(this.EXPR());
    this.eat(tkn.right_paren, "Expected `)` after expression.");
    return expr;
  }

  astnode<N extends ASTNode>(node: N) {
    this.lastnode = node;
    return node;
  }

  atom(builder: (lexeme: string) => ASTNode) {
    const token = this.prevToken;
    const node = builder(token.lexeme);
    return this.astnode(node);
  }

  NUMERIC() {
    const token = this.advance();
    const val = token.literal ? token.literal : token.lexeme;
    let node: ASTNode = nil();
    // deno-fmt-ignore
    switch (token.type) {
      case tkn.int: node = int(val); break;
      case tkn.float: node = float(val); break;
      case tkn.hex: node = hex(val); break;
      case tkn.octal: node = octal(val); break;
      case tkn.inf: node = inf(); break;
      case tkn.nan: node = nan(); break;
    }
    const pt = this.peek.type;
    if (isTokenSymbol(pt) || isTokenCall(pt)) {
      const rhs = this.SYMBOLIC();
      node = binex(this.newToken(tkn.star, "*"), node, rhs);
      return this.astnode(node);
    }
    if (pt === tkn.left_paren) {
      const rhs = this.GROUP();
      node = binex(this.newToken(tkn.star, "*"), node, rhs);
      return this.astnode(node);
    }
    return this.astnode(node);
  }

  SYMBOLIC() {
    const token = this.advance();
    let node = sym(token.lexeme);
    if (this.matches([tkn.left_paren])) {
      const args = this.argList();
      node = call(node, args) as any;
    }
    return this.astnode(node);
  }

  LITERAL() {
    const token = this.advance();
    switch (token.type) {
      case tkn.null:
        return this.atom(nil);
      case tkn.string:
        return this.atom(str);
      case tkn.true:
        return this.atom(bool);
      case tkn.false:
        return this.atom(bool);
    }
    throw new Error("Unrecognized literal.");
  }

  /**
   * Parses an expression via Pratt parsing.
   */
  EXPR(minbp = bp.non) {
    const tk = this.peek;
    if (this.BP[tk.type] === null) return nil();
    let lhs: ASTNode = this[this.BP[tk.type]![0]]();
    while (this.Status === status.ok && !isTokenEOF(this.peek.type)) {
      const op = this.peek;
      if (isTokenEOF(op.type)) break;
      let [_, rightParser, opBP] = this.BP[op.type]!;
      if (opBP < minbp || rightParser === "NULL") break;
      lhs = this[rightParser]();
    }
    return lhs;
  }

  UNARY_EXPR(): ASTNode {
    const op = this.advance();
    const arg = this.EXPR();
    return this.astnode(call(sym(op.lexeme), [arg]));
  }

  BINARY_EXPR(): ASTNode {
    const op = this.advance();
    const lhs = this.lastnode;
    const rhs = this.EXPR();
    const node = binex(op, lhs, rhs);
    return this.astnode(node);
  }
  POSTFIX_EXPR() {
    const op = this.advance();
    const arg = this.lastnode;
    return this.astnode(call(sym(op.lexeme), [arg]));
  }

  comparison() {
    return nil();
  }

  NULL() {
    return nil();
  }

  BP: Record<tkn, ([Parslet, Parslet, bp] | null)> = {
    [tkn.nil]: ["NULL", "NULL", bp.null],
    [tkn.comma]: ["NULL", "NULL", bp.null],
    [tkn.eof]: null,
    [tkn.error]: null,
    [tkn.left_paren]: ["GROUP", "NULL", bp.call],
    [tkn.right_paren]: ["NULL", "NULL", bp.null],
    [tkn.left_bracket]: ["NULL", "NULL", bp.null],
    [tkn.right_bracket]: ["NULL", "NULL", bp.null],
    [tkn.left_brace]: ["NULL", "NULL", bp.null],
    [tkn.right_brace]: ["NULL", "NULL", bp.null],
    [tkn.dot]: ["NULL", "NULL", bp.null],
    [tkn.vbar]: ["NULL", "NULL", bp.null],
    [tkn.semicolon]: ["NULL", "NULL", bp.null],
    [tkn.and]: ["NULL", "BINARY_EXPR", bp.and],
    [tkn.or]: ["NULL", "BINARY_EXPR", bp.or],
    [tkn.nand]: ["NULL", "BINARY_EXPR", bp.nand],
    [tkn.nor]: ["NULL", "BINARY_EXPR", bp.nor],
    [tkn.xor]: ["NULL", "BINARY_EXPR", bp.xor],
    [tkn.xnor]: ["NULL", "BINARY_EXPR", bp.xnor],
    [tkn.not]: ["UNARY_EXPR", "NULL", bp.null],
    [tkn.is]: ["NULL", "BINARY_EXPR", bp.is],
    [tkn.rem]: ["NULL", "BINARY_EXPR", bp.quotient],
    [tkn.mod]: ["NULL", "BINARY_EXPR", bp.quotient],
    [tkn.div]: ["NULL", "BINARY_EXPR", bp.quotient],
    [tkn.plus]: ["NULL", "BINARY_EXPR", bp.sum],
    [tkn.minus]: ["NULL", "BINARY_EXPR", bp.difference],
    [tkn.star]: ["NULL", "BINARY_EXPR", bp.product],
    [tkn.ampersand]: ["NULL", "BINARY_EXPR", bp.and],
    [tkn.caret]: ["NULL", "BINARY_EXPR", bp.power],
    [tkn.percent]: ["NULL", "BINARY_EXPR", bp.quotient],
    [tkn.slash]: ["NULL", "BINARY_EXPR", bp.product],
    [tkn.neq]: ["NULL", "BINARY_EXPR", bp.comparison],
    [tkn.bang]: ["NULL", "POSTFIX_EXPR", bp.call],
    [tkn.geq]: ["NULL", "BINARY_EXPR", bp.comparison],
    [tkn.gt]: ["NULL", "BINARY_EXPR", bp.comparison],
    [tkn.leq]: ["NULL", "BINARY_EXPR", bp.comparison],
    [tkn.lt]: ["NULL", "BINARY_EXPR", bp.comparison],
    [tkn.deq]: ["NULL", "BINARY_EXPR", bp.equality],
    [tkn.eq]: ["NULL", "ASSIGN", bp.assign],
    [tkn.call]: ["CALL", "NULL", bp.null],
    [tkn.int]: ["NUMERIC", "NULL", bp.null],
    [tkn.float]: ["NUMERIC", "NULL", bp.null],
    [tkn.scinum]: ["SCIENTIFIC", "NULL", bp.null],
    [tkn.frac]: ["FRACTION", "NULL", bp.null],
    [tkn.hex]: ["NUMERIC", "NULL", bp.null],
    [tkn.octal]: ["NUMERIC", "NULL", bp.null],
    [tkn.binary]: ["NUMERIC", "NULL", bp.null],
    [tkn.nan]: ["NUMERIC", "NULL", bp.null],
    [tkn.inf]: ["NUMERIC", "NULL", bp.null],
    [tkn.string]: ["LITERAL", "NULL", bp.null],
    [tkn.symbol]: ["SYMBOLIC", "NULL", bp.null],
    [tkn.null]: ["LITERAL", "NULL", bp.null],
    [tkn.true]: ["LITERAL", "NULL", bp.null],
    [tkn.false]: ["LITERAL", "NULL", bp.null],
    [tkn.class]: ["NULL", "NULL", bp.null],
    [tkn.else]: ["NULL", "NULL", bp.null],
    [tkn.for]: ["NULL", "NULL", bp.null],
    [tkn.if]: ["NULL", "NULL", bp.null],
    [tkn.return]: ["NULL", "NULL", bp.null],
    [tkn.super]: ["NULL", "NULL", bp.null],
    [tkn.this]: ["NULL", "NULL", bp.null],
    [tkn.let]: null,
    [tkn.def]: ["NULL", "NULL", bp.null],
    [tkn.while]: ["NULL", "NULL", bp.null],
    [tkn.in]: ["NULL", "NULL", bp.null],
    [tkn.do]: ["NULL", "NULL", bp.null],
    [tkn.goto]: ["NULL", "NULL", bp.null],
    [tkn.skip]: ["NULL", "NULL", bp.null],
    [tkn.to]: ["NULL", "NULL", bp.null],
  };

  FRACTION() {
    const S = this.peek.lexeme.split("/");
    if (S.length !== 2) {
      this.Status = status.syntax_error;
      throw new Error("Invalid fraction");
    }
    const [numerator, denominator] = S;
    return call(sym("Frac"), [int(numerator), int(denominator)]);
  }
  SCIENTIFIC() {
    const S = this.peek.lexeme.split("E");
    if (S.length !== 2) {
      this.Status = status.syntax_error;
      throw new Error("Invalid scientific number");
    }
    const [base, exp] = S;
    return call(sym("Sci"), [float(base), int(exp)]);
  }
}

type Parslet =
  | "NULL"
  | "LITERAL"
  | "GROUP"
  | "CALL"
  | "BINARY_EXPR"
  | "ASSIGN"
  | "POSTFIX_EXPR"
  | "NUMERIC"
  | "SYMBOLIC"
  | "FRACTION"
  | "SCIENTIFIC"
  | "UNARY_EXPR";

const engine = new Engine();
engine.constants({ phi: 0.179 });
const src = `
let x = 2cos(5)
`;
const tree = engine.parse(src);
console.log(tree)

// const tokens = engine.tokenize(src);
// console.log(tokens);
