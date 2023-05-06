import { isNumber, isStrList } from "../core/core.utils.js";
import { div, even, mod, odd, product, rem, sum } from "./core/count.js";
import { Logic } from "./core/logic.js";
import { List } from "./core/list.js";

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
 * by skim. The token types are defined on specific ranges:
 *
 * 1. `0 - 99` - Reserved for utility tokens.
 * 2. `100 - 199` - Reserved for single-character tokens.
 * 3. `200 - 299` - Reserved for predicate operator tokens.
 * 3. `300 - 399` - Reserved for numeric operator tokens.
 * 3. `400 - 499` - Reserved for comparison operator tokens.
 * 3. `500 - 599` - Reserved for function call operators.
 * 3. `600 - 649` - Reserved for numeric literals.
 * 3. `650 - 699` - Reserved for string literals.
 * 3. `700 - 1000` - Reserved for keywords.
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
  left_paren = 100,

  /**
   * Lexeme: `)`
   * - _See also_ {@link Engine.readNextToken}.
   */
  right_paren = 101,

  /**
   * Lexeme: `[`
   * - _See also_ {@link Engine.readNextToken}.
   */
  left_bracket = 102,

  /**
   * Lexeme: `]`
   * - _See also_ {@link Engine.readNextToken}.
   */
  right_bracket = 103,

  /**
   * Lexeme: `{`
   * - _See also_ {@link Engine.readNextToken}.
   */
  left_brace = 104,

  /**
   * Lexeme: `}`
   * - _See also_ {@link Engine.readNextToken}.
   */
  right_brace = 105,

  /**
   * Lexeme: `.`
   * - _See also_ {@link Engine.readNextToken}.
   */
  dot = 106,

  /**
   * Lexeme: `|`
   * - _See also_ {@link Engine.readNextToken}.
   */
  vbar = 107,

  /**
   * Lexeme: `;`
   * - _See also_ {@link Engine.readNextToken}.
   */
  semicolon = 108,

  /**
   * Lexeme: `,`
   * - _See also_ {@link Engine.readNextToken}.
   */
  comma = 109,

  /**
   * Keyword-operator `and`
   */
  and = 200,

  /**
   * Keyword-operator: `or`
   */
  or = 201,

  /**
   * Keyword-operator: `nand`
   */
  nand = 202,

  /**
   * Keyword-operator: `nor`
   */
  nor = 203,

  /**
   * Keyword-operator: `xor`
   */
  xor = 204,

  /**
   * Keyword-operator: `xnor`
   */
  xnor = 205,

  /**
   * Keyword-operator: `not`
   */
  not = 206,

  /**
   * Keyword-operator: `rem`
   */
  rem = 300,

  /**
   * Keyword-operator: `mod`
   */
  mod = 301,

  /**
   * Keyword-operator: `div`
   */
  div = 302,

  /**
   * Lexeme: `+`
   * - _See also_ {@link Engine.readNextToken}.
   */
  plus = 304,

  /**
   * Lexeme: `-`
   * - _See also_ {@link Engine.readNextToken}.
   */
  minus = 305,

  /**
   * Lexeme: `*`
   * - _See also_ {@link Engine.readNextToken}.
   */
  star = 306,

  /**
   * Lexeme: `&`
   * - _See also_ {@link Engine.readNextToken}.
   */
  ampersand = 307,

  /**
   * Lexeme: `^`
   * - _See also_ {@link Engine.readNextToken}.
   */
  caret = 308,

  /**
   * Lexeme: `%`
   * - _See also_ {@link Engine.readNextToken}.
   */
  percent = 309,

  /**
   * Lexeme: `/`
   * - _See also_ {@link Engine.readNextToken}.
   */
  slash = 310,

  /**
   * Lexeme: `!=`
   * - _See also_ {@link Engine.readNextToken}.
   */
  neq = 311,

  /**
   * Lexeme: `!`
   * - _See also_ {@link Engine.readNextToken}.
   */
  bang = 312,

  /**
   * Keyword-operator: `is`
   */
  is = 400,

  /**
   * Lexeme: `>=`
   * - _See also_ {@link Engine.readNextToken}.
   */
  geq = 401,

  /**
   * Lexeme: `>`
   * - _See also_ {@link Engine.readNextToken}.
   */
  gt = 402,

  /**
   * Lexeme: `<=`
   * - _See also_ {@link Engine.readNextToken}.
   */
  leq = 403,

  /**
   * Lexeme: `<`
   * - _See also_ {@link Engine.readNextToken}.
   */
  lt = 404,

  /**
   * Lexeme: `==`
   * - _See also_ {@link Engine.readNextToken}.
   */
  deq = 405,

  /**
   * Lexeme: `=`
   * - _See also_ {@link Engine.readNextToken}.
   */
  eq = 406,

  /**
   * Lexeme: Any native function.
   * - _See also_ {@link Engine.readNextToken}.
   */
  call = 500,

  /**
   * Lexeme: `=>`
   * - This is the lambda operator.
   */

  lambda = 501,

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
  int = 600,

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
  float = 601,

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
  scinum = 602,

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
  frac = 603,

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
  hex = 604,

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
  octal = 605,

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
  binary = 606,

  /**
   * Keyword-literal: `nan`,
   */
  nan = 607,

  /**
   * Keyword-literal: `inf`
   */
  inf = 608,

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
  string = 650,

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
  symbol = 651,

  /**
   * Keyword-literal: `null`.
   */
  null = 652,

  /**
   * Keyword-literal: `true`
   */
  true = 653,

  /**
   * Keyword-literal: `false`
   */
  false = 654,

  /**
   * Keyword `class`.
   */
  class = 700,

  /**
   * Keyword `this`
   */
  this = 701,

  /**
   * Keyword `super`
   */
  super = 702,

  /**
   * Keyword `for`.
   */
  for = 703,

  /**
   * Keyword `while`
   */
  while = 704,

  /**
   * Keyword `do`
   */
  do = 705,

  /**
   * Keyword `goto`
   */
  goto = 706,

  /**
   * Keyword `skip`
   */
  skip = 707,
  /**
   * Keyword `if`.
   */
  if = 708,

  /**
   * Keyword `else`.
   */
  else = 709,

  /**
   * Keyword `return`
   */
  return = 710,

  /**
   * Keyword `let`
   */
  let = 711,

  /**
   * Keyword `def`
   */
  def = 712,

  /**
   * Keyword `in`
   */
  in = 713,

  /**
   * Keyword `to`
   */
  to = 714,
}

/**
 * A test-builder function. This will return a function
 * that we can use to test for specific token types. We’ll
 * use functions for common tests to avoid having to write
 * `===` everywhere.
 */
const tknTest = (t: tkn) => (x: tkn) => x === t;

const isTokenSymbol = tknTest(tkn.symbol);
const isTokenCall = tknTest(tkn.call);

/**
 * Returns true if the given token type
 * is the `eof` token (the token indicating
 * no more tokens are left).
 */
const isTokenEOF = tknTest(tkn.eof);
const isTokenNumber = (t: tkn) => 600 < t && t < 650;
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

/**
 * _Factory function_. Returns a character test function.
 *
 * @param of {string} - The character to test.
 * @returns A function that takes a string and returns true
 * if the string matches, and false otherwise.
 */
const charTest = (of: string) => (c: string) => c === of;

/**
 * _Guard function_. Returns true if the given function
 * is the character `.` (a dot).
 */
const isDot = charTest(".");

/**
 * _Guard function_. Returns true if the given function
 * is the character `+` (a plus).
 */
const isPlus = charTest("+");

/**
 * _Guard function_. Returns true if the given function
 * is the character `-` (a minus).
 */
const isMinus = charTest("-");

/**
 * _Guard function_. Returns true if the given function
 * is either the character `-` (a minus) or `+` (a plus).
 */
const isSign = (c: string) => isPlus(c) || isMinus(c);

/**
 * _Guard function_. Returns true if the given function
 * is a digit (_see_ {@link isDigit}), a dot (_see_ {@link isDot})
 * or a sign (_see_ {@link isSign}).
 */
const isDotDigit = (c: string) => isDigit(c) || isDot(c) || isSign(c);

/**
 * A sum type indicating the Engine’s
 * current status.
 * @enum
 */
export enum status {
  /**
   * The engine is functioning
   * normally.
   */
  ok,
  /**
   * An error occurred during scanning.
   */
  lexical_error,
  /**
   * An error occurred during parsing.
   */
  syntax_error,
  /**
   * An error occurred during execution.
   * E.g., a name binding that doesn’t resolve.
   */
  semantic_error,
}

/**
 * A token is a product type, comprising
 * the fields {@link tkn} (the Token’s
 * token-type), `lexeme` (the Token’s lexeme),
 * and an optional `literal` (the Token’s
 * literal value, if any).
 */
export type Token = {
  /**
   * Holds the token’s {@link tkn} type.
   */
  type: tkn;
  /**
   * The token’s corresponding lexeme.
   */
  lexeme: string;

  /**
   * The line where the token was found.
   */
  line: number;

  /**
   * The column where the token was found.
   */
  column: number;
  /**
   * An optional literal (used primarily
   * by the scanner to hold raw numeric
   * values).
   */
  literal?: string | number;
};

/**
 * _Builder_. Returns a new {@link Token}.
 *
 * @param type {tkn} - The token’s type.
 * @param lexeme {string} - The token’s lexeme.
 * @param literal {string|number|undefined} - The
 * token’s literal value, if any.
 */
const newToken = (
  type: tkn,
  lexeme: string,
  line: number,
  column: number,
  literal?: string | number,
): Token => ({
  type,
  lexeme,
  line,
  column,
  literal,
});

/**
 * A sum type to quickly
 * test an {@link ASTNode}'s type.
 * Using these enum values is much
 * faster than checking for `instanceof`,
 * which potentially requires climbing
 * the prototype chain.
 */
enum nodetype {
  /**
   * The nodetype associated with {@link TUPLE}.
   */
  tuple,
  /**
   * The nodetype associated with {@link ARRAY}.
   */
  array,
  /**
   * The nodetype associated with {@link STRING}.
   */
  string,
  /**
   * The nodetype associated with {@link NUMBER}.
   */
  number,
  /**
   * The nodetype associated with {@link SYMBOL}.
   */
  symbol,
  /**
   * The nodetype associated with {@link BOOL}.
   */
  bool,
  /**
   * The nodetype associated with {@link INFIX}.
   */
  infix,
  /**
   * The nodetype associated with {@link NULL}.
   */
  null,
  /**
   * The nodetype associated with {@link FUNCTION}.
   */
  function,
  /**
   * The nodetype associated with {@link CALL}.
   */
  call,
  /**
   * The nodetype associated with {@link BLOCK}.
   */
  block,
  /**
   * The nodetype associated with {@link VARDEF}.
   */
  vardef,
  /**
   * The nodetype associated with {@link ASSIGN}.
   */
  assign,
  /**
   * The nodetype associated with {@link COND}.
   */
  cond,
  /**
   * The nodetype associated with {@link LOOP}.
   */
  loop,

  /**
   * The nodetype associated with {@link RETURN}.
   */
  returnStmt,
}

/**
 * All functions that seek to operate on
 * the Engine’s outputted AST must implement
 * a `Visitor` interface. This interface
 * comprises methods that must be defined
 * for each {@link ASTNode}.
 *
 * Although switch statements
 * work just fine, JavaScript doesn’t support
 * type-safe pattern matching like ML, Rust,
 * or Swift. Accordingly, we use the
 * _Visitor pattern_ to handle tree-related,
 * relying on TypeScript to inform use that
 * we haven’t implemented a method.
 */
interface Visitor<t = any> {
  num(node: NUMBER): t | any;
  str(node: STRING): t | any;
  sym(node: SYMBOL): t | any;
  fn(node: FUNCTION): t | any;
  infix(node: INFIX): t | any;
  call(node: CALL): t | any;
  bool(node: BOOL): t | any;
  null(node: NULL): t | any;
  block(node: BLOCK): t | any;
  vardef(node: VARDEF): t | any;
  assign(node: ASSIGN): t | any;
  cond(node: COND): t | any;
  loop(node: LOOP): t | any;
  returnStmt(node: RETURN): t | any;
  array(node: ARRAY): t | any;
  tuple(node: TUPLE): t | any;
}

/**
 * @abstract
 * All AST nodes in Skim inherit
 * from `ASTNode`. This node does
 * nothing other than:
 *
 * 1. Storing the inherited node’s {@link nodetype}, and
 * 2. An abstract method ensuring that every inheriting
 * child implements the `accept` method (providing access
 * to tree-related functions).
 */
abstract class ASTNode {
  type: nodetype;
  constructor(type: nodetype) {
    this.type = type;
  }
  abstract accept<t>(visitor: Visitor<t>): t;
}

// deno-fmt-ignore
/**
 * __Factory Function__. This function
 * generates a guard function for ASTNodes.
 *
 * @param ntype {nodetype} - The nodetype to test for.
 * @returns A function that takes a node and returns
 * true if the given node is of the `ntype`.
 */
const nodeTest = <N extends ASTNode>(
  ntype: nodetype,
) => (node: ASTNode): node is N => node.type === ntype;

class RETURN extends ASTNode {
  accept<t>(visitor: Visitor<t>): t {
    return visitor.returnStmt(this);
  }
  keyword: Token;
  value: ASTNode;
  constructor(keyword: Token, value: ASTNode) {
    super(nodetype.returnStmt);
    this.keyword = keyword;
    this.value = value;
  }
}

const returnStmt = (
  keyword: Token,
  value: ASTNode,
) => new RETURN(keyword, value);
const isNodeReturn = nodeTest<RETURN>(nodetype.returnStmt);

class LOOP extends ASTNode {
  accept<t>(visitor: Visitor<t>): t {
    return visitor.loop(this);
  }
  condition: ASTNode;
  body: ASTNode;
  constructor(condition: ASTNode, body: ASTNode) {
    super(nodetype.loop);
    this.condition = condition;
    this.body = body;
  }
}
const loop = (
  condition: ASTNode,
  body: ASTNode,
) => new LOOP(condition, body);
const isNodeLoop = nodeTest<LOOP>(nodetype.loop);

class COND extends ASTNode {
  accept<t>(visitor: Visitor<t>): t {
    return visitor.cond(this);
  }
  condition: ASTNode;
  ifBlock: ASTNode;
  elseBlock: ASTNode;
  constructor(condition: ASTNode, ifBlock: ASTNode, elseBlock: ASTNode) {
    super(nodetype.cond);
    this.condition = condition;
    this.ifBlock = ifBlock;
    this.elseBlock = elseBlock;
  }
}
const cond = (
  condition: ASTNode,
  ifBlock: ASTNode,
  elseBlock: ASTNode,
) => new COND(condition, ifBlock, elseBlock);

const isNodeCond = nodeTest<COND>(nodetype.cond);

class INFIX extends ASTNode {
  accept<t>(visitor: Visitor<t>): t {
    return visitor.infix(this);
  }
  op: Token;
  left: ASTNode;
  right: ASTNode;
  constructor(op: Token, left: ASTNode, right: ASTNode) {
    super(nodetype.infix);
    this.op = op;
    this.left = left;
    this.right = right;
  }
}
const infix = (op: Token, left: ASTNode, right: ASTNode) =>
  new INFIX(op, left, right);
const isNodeInfix = nodeTest<INFIX>(nodetype.infix);

class SYMBOL extends ASTNode {
  accept<t>(visitor: Visitor<t>): t {
    return visitor.sym(this);
  }
  sym: Token;
  constructor(sym: Token) {
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
const isNodeNumber = nodeTest<NUMBER>(nodetype.number);

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
const sym = (value: Token) => new SYMBOL(value);

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

class Fn {
  name: SYMBOL;
  params: SYMBOL[];
  body: ASTNode;
  constructor(name: SYMBOL, params: SYMBOL[], body: ASTNode) {
    this.name = name;
    this.params = [];
    this.body = body;
    const set = new Set();
    for (let i = 0; i < params.length; i++) {
      if (!set.has(params[i])) {
        this.params.push(params[i]);
      }
      set.add(params[i]);
    }
  }
  call(interpreter: Interpreter, args: RunTimeValue[]) {
    const scope = new Scope(interpreter.environment);
    const arglen = args.length;
    for (let i = 0; i < arglen; i++) {
      const param = this.params[i];
      scope.define(param.sym, args[i]);
    }
    return interpreter.executeBlock([this.body], scope);
  }
}

const callable = (stmt: FUNCTION) =>
  new Fn(
    stmt.name,
    stmt.params,
    stmt.body,
  );

class FUNCTION extends ASTNode {
  accept<t>(visitor: Visitor<t>): t {
    return visitor.fn(this);
  }
  name: SYMBOL;
  params: SYMBOL[];
  body: ASTNode;
  constructor(name: SYMBOL, params: SYMBOL[], body: ASTNode) {
    super(nodetype.call);
    this.name = name;
    this.params = params;
    this.body = body;
  }
}
const fn = (name: SYMBOL, params: SYMBOL[], body: ASTNode) =>
  new FUNCTION(name, params, body);

const isNodeFn = nodeTest<FUNCTION>(nodetype.function);

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

class ARRAY extends ASTNode {
  accept<t>(visitor: Visitor<t>): t {
    return visitor.array(this);
  }
  elements: ASTNode[];
  constructor(elements: ASTNode[]) {
    super(nodetype.array);
    this.elements = elements;
  }
}

const array = (elements: ASTNode[]) => new ARRAY(elements);
const isNodeArray = nodeTest<ARRAY>(nodetype.array);

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

class TUPLE extends ASTNode {
  accept<t>(visitor: Visitor<t>): t {
    return visitor.tuple(this);
  }
  items: List<ASTNode>;
  constructor(items: ASTNode[]) {
    super(nodetype.tuple);
    this.items = List.of(items);
  }
  array() {
    return this.items.array();
  }
}
const tuple = (items: ASTNode[]) => new TUPLE(items);
const isNodeTuple = nodeTest<TUPLE>(nodetype.tuple);

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
 * All tokens outputted by the engine have a given binding power.
 * Tokens with lower binding powers model operators with lower
 * precedence, and tokens with higher binding powers model operators
 * with higher precdence. Tokens that have no need for a binding
 * power (e.g., keywords indicating statements like `class` and `if`),
 * default to `bp.null`.
 *
 * _References_.
 * 1. _See also_ {@link Engine.BP} (laying out all the defined `bp`
 * assignments).
 * 2. _See also_ {@link Engine.EXPR} (demonstrating how these `bp`
 * values are used).
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

type FnRecord = { [key: string]: Function };
type NumberConstants = { [key: string]: number };
/**
 * A `Lib` object defines all the functions
 * available at the global level. This
 * object, by default, contains all the
 * native functions and constants available
 * at the top level.
 */
export class Lib {
  _functions: FnRecord = {
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
  };
  _constants: NumberConstants = {
    pi: Math.PI,
    e: Math.E,
  };
  addFn(name: string, fn: Function) {
    if (this.hasFunc(name)) return this;
    this._functions[name] = fn;
    return this;
  }
  addNum(name: string, value: number) {
    if (this.hasConst(name)) return this;
    this._constants[name] = value;
    return this;
  }
  hasConst(name: string) {
    return this._constants[name] !== undefined;
  }
  hasFunc(name: string) {
    return this._functions[name] !== undefined;
  }
  getFunc(name: string) {
    return this._functions[name] ?? null;
  }
  getConst(name: string) {
    return this._constants[name] ?? null;
  }
}

/**
 * A _Scope_ is a record of name-value pairs,
 * where a name is some parsed identifier.
 *
 * At every interpretation, if an identifier is referred to,
 * the {@link Interpreter} will call the current
 * scope and ask for that identifier’s value.
 *
 * The current scope then attempts to _resolve_ the
 * name-value pairing (i.e., _binding_). If the
 * current scope can’t find the pair in its record
 * (below, the {@link Scope.env} field), then it
 * will call its {@link Scope.parent} (the scope
 * that _spawned_ the current scope).
 *
 * This goes all the way back up to the global
 * scope (_see_ {@link Engine.CoreLib}). If nothing
 * exists there, then an _environment error_ is thrown.
 * Given the scarcity of good names in programming,
 * scope is what allows us to reuse identifiers without
 * collision.
 */
class Scope extends Lib {
  private env: { [key: string]: RunTimeValue } = {};
  parent: Scope | null;
  constructor(parent: Scope | null = null) {
    super();
    this.parent = parent;
  }

  has(name: string) {
    return this.env[name] !== undefined;
  }

  get(name: Token): RunTimeValue {
    if (this.hasConst(name.lexeme)) {
      return this.getConst(name.lexeme);
    } else if (this.env[name.lexeme] !== undefined) {
      return this.env[name.lexeme];
    } else if (this.parent !== null) {
      return this.parent.get(name);
    } else {
      const msg = `Undefined variable ${name.lexeme}.`;
      const erm = formattedError(
        msg,
        name.line,
        name.column,
        "Environment-Error",
      );
      throw new Error(erm);
    }
  }
  define(name: Token, value: RunTimeValue) {
    const id = name.lexeme;
    if (this.hasConst(id) || this.hasFunc(id)) {
      const msg = `Cannot declare a global identifier ${id}.`;
      const erm = formattedError(
        msg,
        name.line,
        name.column,
        "Environment-Error",
      );
      throw new Error(erm);
    }
    if (!this.hasConst(id) && !this.hasFunc(id)) {
      this.env[id] = value;
    }
    return value;
  }
  assign(name: Token, value: RunTimeValue): RunTimeValue {
    const id = name.lexeme;
    if (this.hasConst(id) || this.hasFunc(id)) {
      const msg = `Cannot assign to global identifier ${id}.`;
      const erm = formattedError(
        msg,
        name.line,
        name.column,
        "Environment-Error",
      );
      throw new Error(erm);
    }
    if (this.env[id] !== undefined) {
      this.env[id] = value;
      return value;
    }
    if (this.parent !== null) {
      return this.parent.assign(name, value);
    }
    const msg = `Undefined variable ${id}.`;
    const erm = formattedError(
      msg,
      name.line,
      name.column,
      "Environment-Error",
    );
    throw new Error(erm);
  }
}

type ErrType =
  | "Parser-Error"
  | "Scanner-Error"
  | "Environment-Error"
  | "Runtime-Error";

const formattedError = (
  message: string,
  Line: number,
  Column: number,
  errorType: ErrType,
) => {
  const line = `Line: ${Line}\n`;
  const column = `Column: ${Column}\n`;
  const report = `Report: ${message}`;
  const errtype = `[${errorType}]`;
  return errtype + "\n" + line + column + report;
};

type RunTimeValue =
  | number
  | string
  | number[]
  | boolean
  | null
  | Fn
  | string[];

// § Resolver ========================================================
/**
 * A _Resolver_ instance is necessary for
 * handling edge cases in binding resolution.
 * To illustrate why we need this module,
 * consider the following:
 *
 * @example
 * ~~~
 * let a = 0;
 * {
 *   let a = 1;
 *   let x = a; // x is 1
 * }
 * ~~~
 *
 * This is expected behavior. But now consider
 * this:
 *
 * ~~~
 * let a = 0;
 * {
 *   def f() = {
 *     return a;
 *   };
 *   let y = f(); // z is 0
 *   let a = 2;
 *   let z = f(); // z is 2
 * }
 * ~~~
 *
 * Above, `y` is as expected. During `f`'s execution,
 * the {@link Scope} bound to `f`
 * will try searching for `a` in
 * its environment record. It won’t find it, so
 * it goes to its parent scope, the global scope.
 * (It won’t find the `a` beneath it because
 * that line hasn’t been executed yet).
 * `f` finds a name `a` in the global
 * scope, and returns its value, `0`.
 *
 * When it gets to `z`, `f` applies the same
 * process. Only this time, the `a`
 * above it (`let a = 2`) has been
 * executed. So, it finds the `a` and
 * returns it. This is what happens when
 * we support closures without a resolver.
 * While users should refrain from writing
 * the aforementioned code, the idea of
 * a function returning different values
 * _according to time_ is far, far more
 * sinister.
 *
 * To fix this problem, we must change
 * our view of scope. A scope isn’t
 * necessarily a single “fenced-off” block.
 * In reality, scope is inherently partitioned
 * by time. It’s why we have phrases like “going
 * into/out of scope.” The block scope:
 *
 * @example
 * ~~~
 * {
 *   let x = 1;
 *   let y = 2;
 * }
 * ~~~
 *
 * really contains two scopes: A scope at
 * time t0, when `x` is first spawned, and a
 * scope at t1, when `y` is first spawned.
 * The Resolver is implemented with this fact
 * in mind.
 *
 * Before we perform any interpretation, we
 * run the program through _semantic analysis_.
 * At this stage, we resolve every reference
 * to a variable exactly once–whenever we
 * encounter a variable reference, we will
 * note its referent (the declaration the
 * variable name refers to).
 */
class Resolver implements Visitor<void> {
  scopes: Scope[] = [];
  resolve(nodes: ASTNode[]) {
    const N = nodes.length;
    for (let i = 0; i < N; i++) {
      this.resolveNode(nodes[i]);
    }
  }
  resolveNode(node: ASTNode) {
    node.accept(this);
  }
  beginScope() {
    this.scopes.push(new Scope());
  }
  endScope() {
    this.scopes.pop();
  }
  declare(name: Token) {
    const L = this.scopes.length;
    if (L === 0) return;
    const scope = this.scopes[L - 1];
    scope.define(name, false);
  }
  define(name: Token) {
    const L = this.scopes.length;
    if (L === 0) return;
    const scope = this.scopes[L - 1];
    scope.define(name, true);
  }
  num(_: NUMBER) {
    return;
  }
  str(_: STRING) {
    return;
  }
  sym(node: SYMBOL) {
    const varname = node.sym;
    const L = this.scopes.length;
    if (0 < L && this.scopes[L - 1].get(varname) === false) {
      const msg = `Cannot read local variable in self-declaration.`;
      const erm = formattedError(
        msg,
        node.sym.line,
        node.sym.column,
        "Environment-Error",
      );
      throw new Error(erm);
    }
  }
  interpreter: Interpreter;
  constructor(interpreter: Interpreter) {
    this.interpreter = interpreter;
  }
  private resolveLocal(node: ASTNode, name: Token) {
    const L = this.scopes.length - 1;
    for (let i = L; i >= 0; i--) {
      if (this.scopes[i].has(name.lexeme)) {
        this.interpreter;
      }
    }
  }
  fn(_: FUNCTION) {
    return;
  }
  bool(_: BOOL) {
    return;
  }
  null(_: NULL) {
    return;
  }
  infix(node: INFIX) {
    this.resolveNode(node.left);
    this.resolveNode(node.right);
    return;
  }
  call(node: CALL) {
    this.resolveNode(node.name);
    for (let i = 0; i < node.args.length; i++) {
      const arg = node.args[i];
      this.resolveNode(arg);
    }
    return;
  }

  block(node: BLOCK) {
    this.beginScope();
    this.resolve(node.statements);
    this.endScope();
    return;
  }
  vardef(node: VARDEF) {
    this.declare(node.name.sym);
    this.resolveNode(node.value);
    this.define(node.name.sym);
    return;
  }
  assign(node: ASSIGN) {
    throw new Error("Method not implemented.");
  }
  cond(node: COND) {
    const condition = node.condition;
    this.resolveNode(condition);
    const ifBlock = node.ifBlock;
    this.resolveNode(ifBlock);
    if (!isNodeNull(node.elseBlock)) {
      const elseBlock = node.elseBlock;
      this.resolveNode(elseBlock);
    }
    return;
  }
  loop(node: LOOP) {
    this.resolveNode(node.condition);
    this.resolveNode(node.body);
    return;
  }
  returnStmt(node: RETURN) {
    if (!isNodeNull(node.value)) {
      this.resolveNode(node.value);
    }
    return;
  }
  array(node: ARRAY) {
    node.elements.forEach((item) => this.resolveNode(item));
    return;
  }
  tuple(node: TUPLE) {
    node.items.forEach((item) => this.resolveNode(item));
    return;
  }
}

class Interpreter implements Visitor<RunTimeValue> {
  environment = new Scope();
  locals = new Map<ASTNode, number>();
  resolve(expr: ASTNode, depth: number) {
    this.locals.set(expr, depth);
  }
  private evaluate(node: ASTNode): RunTimeValue {
    return node.accept(this);
  }
  tuple(node: TUPLE) {
    const res = node
      .array()
      .map((item) => this.evaluate(item));
    return res;
  }

  array(node: ARRAY) {
    const elements = node.elements;
    const res: RunTimeValue[] = [];
    for (let i = 0; i < elements.length; i++) {
      const val = this.evaluate(elements[i]);
      res.push(val);
    }
    return res;
  }

  evalInfix(x: number, op: tkn, y: number) {
    // deno-fmt-ignore
    switch (op) {
      case tkn.plus: return x + y;
      case tkn.minus: return x - y;
      case tkn.star: return x * y;
      case tkn.slash: return x / y;
      case tkn.neq: return x !== y;
      case tkn.geq: return x >= y;
      case tkn.gt: return x > y;
      case tkn.leq: return x <= y;
      case tkn.lt: return x < y;
      case tkn.deq: return x === y;
      case tkn.caret: return x ** y;
      case tkn.ampersand: return x & y;
      case tkn.percent: return x % y;
      case tkn.rem: return x % y;
      case tkn.mod: return mod(x, y);
      case tkn.div: return div(x, y);
    }
    return null;
  }

  num(node: NUMBER) {
    return node.num;
  }
  str(node: STRING) {
    return node.str;
  }
  sym(node: SYMBOL) {
    const value = this.environment.get(node.sym);
    return value;
  }
  fn(node: FUNCTION) {
    const f = callable(node);
    this.environment.define(node.name.sym, f);
    return null;
  }
  infix(node: INFIX) {
    const op = node.op.type;
    const left = this.evaluate(node.left);
    const right = this.evaluate(node.right);
    switch (op) {
      case tkn.and:
        return Logic.and(left, right);
      case tkn.or:
        return Logic.or(left, right);
      case tkn.nand:
        return Logic.nand(left, right);
      case tkn.nor:
        return Logic.nor(left, right);
      case tkn.xor:
        return Logic.xor(left, right);
    }
    if (isNumber(left) && isNumber(right)) {
      return this.evalInfix(left, op, right);
    }
    return null;
  }
  handleNative(f: Function, args: RunTimeValue[]) {
    const res = f.apply(null, args);
    return res;
  }
  call(node: CALL) {
    const callee = node.name;
    const reportError = (msg: string) => {
      return formattedError(
        msg,
        callee.sym.line,
        callee.sym.column,
        "Runtime-Error",
      );
    };
    const op = callee.sym.type;
    const args: RunTimeValue[] = [];
    const count = node.args.length;
    for (let i = 0; i < count; i++) {
      const arg = node.args[i];
      args.push(this.evaluate(arg));
    }
    const aL = args.length;
    const callname = callee.sym.lexeme;
    if (this.environment.hasFunc(callname)) {
      const fn = this.environment.getFunc(callname);
      const fL = fn.length;
      if (fL !== aL) {
        const msg = `Expected ${fL} arguments, but got ${aL}.`;
        throw new Error(reportError(msg));
      }
      return this.handleNative(fn, args);
    }
    if (op === tkn.not) return !args[0];
    const fn = this.evaluate(callee);
    if (!(fn instanceof Fn)) {
      const msg = `Only functions can be called.`;
      throw new Error(reportError(msg));
    }
    const pL = fn.params.length;
    if (pL !== aL) {
      const msg = `Expected ${pL} arguments, but got ${aL}.`;
      throw new Error(reportError(msg));
    }
    return fn.call(this, args);
  }
  bool(node: BOOL) {
    return node.bool;
  }
  null(node: NULL) {
    return node.value;
  }

  executeBlock(statements: ASTNode[], scope: Scope) {
    const prev = this.environment;
    const count = statements.length;
    this.environment = scope;
    let result: RunTimeValue = null;
    for (let i = 0; i < count; i++) {
      const node = statements[i];
      result = this.evaluate(node);
    }
    this.environment = prev;
    return result;
  }
  block(node: BLOCK) {
    const env = this.environment;
    const res = this.executeBlock(node.statements, new Scope(env));
    return res;
  }
  vardef(node: VARDEF) {
    const name = node.name.sym;
    const value = this.evaluate(node.value);
    this.environment.define(name, value);
    return value;
  }
  assign(node: ASSIGN) {
    const value = this.evaluate(node.value);
    this.environment.assign(node.name.sym, value);
    return value;
  }
  cond(node: COND) {
    let result = null;
    if (this.evaluate(node.condition)) {
      result = this.evaluate(node.ifBlock);
    } else {
      result = this.evaluate(node.elseBlock);
    }
    return result;
  }
  loop(node: LOOP) {
    const condition = node.condition;
    const body = node.body;
    let result: RunTimeValue = null;
    while (this.evaluate(condition)) {
      result = this.evaluate(body);
    }
    return result;
  }
  returnStmt(node: RETURN) {
    let value = this.evaluate(node.value);
    return value;
  }

  interpret(nodes: ASTNode[]) {
    let result: { value: any } = { value: null };
    const N = nodes.length;
    for (let i = 0; i < N; i++) {
      const res = this.evaluate(nodes[i]);
      result.value = res;
    }
    return result;
  }
}

// § Engine ==========================================
export class Engine {
  /**
   * Parses and evaluates the given string.
   */
  public evaluate(src: string) {
    const res = this.parse(src);
    const interpreter = new Interpreter();
    const out = interpreter.interpret(res.prog);
    return out;
  }

  /**
   * This is the Engine’s global
   * environment. All executable
   * scopes have access to this
   * object.
   */
  private CoreLib: Lib = new Lib();

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
   * @internal
   * Returns true if the engine
   * has reached the end of input,
   * false otherwise.
   */
  private atEnd() {
    return this.Current >= this.Input.length;
  }

  /**
   * @internal
   * __Scanner Method__. Generates a new token.
   * When called, updates {@link Engine.LastToken}
   * and {@link Engine.CurrentToken}.
   */
  private newToken(t: tkn, lexeme?: string): Token {
    const type = t;
    const [start, end, line, column] = this.position();
    this.LastToken = this.CurrentToken;
    this.CurrentToken = type;
    // lexeme =  slate.lexeme;
    lexeme = lexeme
      ? lexeme
      : isTokenEOF(t)
      ? "END"
      : this.Input.slice(start, end);
    return newToken(type, lexeme, line, column);
  }

  /**
   * @internal
   * __Scanner Method__. Generates an error
   * token. If called, sets the Engine’s
   * status to {@link status.lexical_error}.
   */
  private errorToken(message: string): Token {
    const [, , line, column] = this.position();
    this.updateStatus(status.lexical_error);
    const type = tkn.error;
    return newToken(type, message, line, column);
  }

  /**
   * @internal
   * __Scanner method__. Scanning method for handling `+` and `-`.
   * The tokens `+` and `-` are given special
   * treatment because we allow `+` and `-`
   * prefaced numbers.
   */
  private SIGN(of: "+" | "-") {
    const nxtchar = this.char();
    if (
      isDotDigit(nxtchar) &&
      !isTokenNumber(this.CurrentToken) &&
      !isTokenSymbol(this.CurrentToken)
    ) {
      const res = signedNumber(of)
        .run(this.Input.slice(this.Current - 1));
      if (res.erred) return this.errorToken(`Expected a number signed ${of}`);
      this.tick(res.result.n.length - 1);
      return this.newToken(res.result.type);
    }
    const type = of === "+" ? tkn.plus : tkn.minus;
    return this.newToken(type);
  }

  /**
   * @internal
   * __Scanner method__. Returns the character
   * at the current index.
   */
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
    if (this.CoreLib.hasFunc(text)) {
      return this.newToken(tkn.call);
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
      case "|": return token(tkn.vbar);
      case "&": return token(tkn.ampersand);
      case "^": return token(tkn.caret);
      case "%": return token(tkn.percent);
      case ",": return token(tkn.comma);

      // one- or two-character tokens
      case "!": return token(this.match("=") ? tkn.neq : tkn.bang);
      case ">": return token(this.match("=") ? tkn.geq : tkn.gt);
      case "<": return token(this.match("=") ? tkn.leq : tkn.lt);
      case "=": return token(this.match("=") 
        ? tkn.deq
        : (this.match('>') ? tkn.lambda : tkn.eq)
      );

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

  /**
   * @internal
   * The Engine’s lookahead.
   *
   * _References_.
   * 1. _See also_ {@link Engine.advance} (detailing
   * how this property is used).
   */
  private peek: Token = emptyToken();

  /**
   * @internal
   * A property holding the last read token.
   */
  private prevToken: Token = emptyToken();

  /**
   * @internal
   * A property holding the last produced
   * node. This property should _always_ be
   * updated whenever a parse method outputs
   * a node. To ensure this, all parse methods
   * must return their outputs via
   * {@link Engine.Node}.
   */
  private lastnode: ASTNode = nil();

  /**
   * A 'reset' button to clear all data
   * from the previous parsing. The engine
   * _always_ has a blank, clean state
   * for the next run.
   */
  private reset() {
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

  /**
   * @internal
   * If called, updates the {@link Engine.peek}
   * to the next token, and returns the
   * current peek.
   *
   * For example, suppose we parse the string
   * `3 + 5`. When the parser first initializes
   * via the {@link Engine.enstate} method, the
   * scanner’s pointer points to the first
   * character:
   * ~~~
   * 3 + 5
   * ^
   * ~~~
   * At the first call to {@link Engine.advance},
   * {@link Engine.peek} becomes:
   * ~~~
   * 3 + 5
   *   ^
   * ~~~
   * The parser, however, hasn’t yet handled the `3`.
   * Thus, {@link Engine.peek} is always one step ahead,
   * returning the last token it saw. In short, Skim uses
   * an LL(1) parser (a left-most derivation with a
   * lookahead of 1).
   *
   * @remarks
   * Skim’s scanner, however, is potentially an LL(k) parser
   * because of it’s use of parser combinators.
   */
  private advance() {
    const peek = this.peek;
    this.peek = this.readNextToken();
    this.prevToken = peek;
    return peek;
  }

  /**
   * @internal
   * Returns true if the next token
   * (_see_ {@link Engine.peek}) is the
   * given `tokenType`, false otherwise. This method
   * checks for the given `tokenType` _without_
   * consuming the next token.
   */
  private check(tokenType: tkn) {
    if (this.atEnd()) return false;
    return this.peek.type === tokenType;
  }

  /**
   * @internal
   * Returns true if the next token
   * (_see_ {@link Engine.peek}) is
   * the given `tokenType`, false otherwise.
   * If the `tokenType` matches, the parser
   * _will consume_ the token and move forward.
   *
   * _References_.
   * 1. _See also_ {@link Engine.check} (the Engine’s
   * method for verifying the next token _without_
   * consumption).
   */
  private sees(tokenType: tkn) {
    if (this.peek.type !== tokenType) return false;
    this.advance();
    return true;
  }

  /**
   * @internal
   * Given an array of token types, returns
   * true on the first token type that matches
   * the next token. This method _will_ consume
   * the matched token and move the parser
   * forward.
   */
  private matches(tokenTypes: tkn[]) {
    for (let i = 0; i < tokenTypes.length; i++) {
      if (this.sees(tokenTypes[i])) return true;
    }
    return false;
  }

  private croak(message: string) {
    const erm = formattedError(
      message,
      this.Line,
      this.Column,
      "Parser-Error",
    );
    return erm;
  }

  private delimited<T extends ASTNode>(
    openingDelimiter: [tkn, string] | null,
    contentParser: (currentLength: number) => T,
    separators: tkn[],
    closingDelimiter: [tkn, string],
  ) {
    if (openingDelimiter !== null) {
      const [delim1, errorMessage1] = openingDelimiter;
      this.eat(delim1, errorMessage1);
    }
    const [delim2, errorMessage2] = closingDelimiter;
    const result: T[] = [];
    if (!this.check(delim2)) {
      do {
        result.push(contentParser(result.length + 1));
      } while (this.matches(separators));
    }
    this.eat(delim2, errorMessage2);
    return result;
  }

  /**
   * @internal
   * Helper method for consuming the next token
   * assertively. If the next token matches the
   * expected type, the Engine advances (_see_
   * {@link Engine.advance}). Otherwise,
   * an error is thrown.
   */
  private eat(tokentype: tkn, message: string) {
    if (this.peek.type === tokentype) {
      return this.advance();
    }
    this.updateStatus(status.syntax_error);
    const msg = formattedError(
      message,
      this.Line,
      this.Column,
      "Parser-Error",
    );
    throw new Error(msg);
  }

  /**
   * @internal
   * Helper method for updating the last node
   * (_see_ {@link Engine.lastnode}). This
   * method should always be called whenever
   * a parser method outputs a new node.
   *
   * @param node - The node outputted.
   */
  private Node<N extends ASTNode>(node: N) {
    this.lastnode = node;
    return node;
  }

  /**
   * @internal
   * Helper method for outputting atomic nodes.
   * Because numeric atoms always hold raw number
   * values, the `atom` method is implemented
   * separately for atomic nodes that only output
   * their lexemes (e.g., symbols and strings).
   */
  private atom(builder: (lexeme: string) => ASTNode) {
    const token = this.prevToken;
    const node = builder(token.lexeme);
    return this.Node(node);
  }

  /**
   * Parses the given input string, `text`.
   */
  parse(text: string) {
    this.enstate(text);
    this.advance(); // prime the `peek`
    const res: { prog: ASTNode[] } = { prog: [] };
    try {
      while (!this.atEnd()) {
        const node = this.STATEMENT();
        res.prog.push(node);
      }
    } catch (e) {
      res.prog = e as any;
    }
    this.reset();
    return res;
  }

  /**
   * @internal
   * Parses a statement.
   */
  private STATEMENT() {
    const token = this.peek;
    switch (token.type) {
      case tkn.return:
        this.advance();
        return this.RETURN();
      case tkn.def:
        this.advance(); // eat the 'def'
        return this.FUNCTION();
      case tkn.for:
        this.advance(); // eat the 'for'
        return this.FOR_LOOP();
      case tkn.while:
        this.advance(); // eat the 'while'
        return this.WHILE_LOOP();
      case tkn.if:
        this.advance(); // eat the 'if'
        return this.COND();
      case tkn.left_brace:
        this.advance(); // eat the '{'
        return this.BLOCK();
      case tkn.left_bracket:
        return this.ARRAY();
      case tkn.let:
        this.advance(); // eat the 'let'
        return this.VAR_DECLARATION(); // go to variable declaration
      default:
        return this.EXPRESSION_STATEMENT();
    }
  }

  ARRAY() {
    this.advance(); // eat the '['
    if (this.check(tkn.comma)) this.advance();
    const args: ASTNode[] = [];
    if (!this.check(tkn.right_bracket)) {
      do {
        const expr = this.EXPR();
        !isNodeNull(expr) && args.push(expr);
      } while (this.sees(tkn.comma) && !this.atEnd());
    }
    this.eat(tkn.right_bracket, `Expected ']' to close the array.`);
    return this.Node(array(args));
  }

  /**
   * Parses a {@link RETURN} statement.
   *
   * @example
   * ~~~
   * def f(x) = {
   *  return x % 2
   * }
   * ~~~
   */
  RETURN() {
    const keyword = this.prevToken;
    let value: ASTNode = nil();
    if (!this.check(tkn.semicolon)) {
      value = this.EXPR();
    }
    const node = this.Node(returnStmt(keyword, value));
    if (this.noSemicolonNeeded()) {
      return node;
    }
    this.eat(tkn.semicolon, `Expected ';' after return value.`);
    return node;
  }

  /**
   * @internal
   * Parses a function declaration.
   *
   * @example
   * ~~~
   * def g(x) = x^2; // declarations not on the last line require a ';'
   * def h(x) = { // blocks are supported
   *   x = x + 1
   * }
   * def f(x) = x + 1
   * ~~~
   */
  private FUNCTION() {
    // The STATEMENT controller has eaten the 'def' keyword,
    // so we now parse the name.
    const name = this.eat(tkn.symbol, `Expected function name.`);
    const functionName = sym(name);

    // This is the parser function for the parameters.
    // We set a hard limit at 100 parameters (and really,
    // no one should be writing functions with 100
    // parameters---break it up).
    const parsedParam = (paramLength: number) => {
      if (paramLength >= 100) {
        const msg = `Cannot have more than 100 parameters.`;
        throw new Error(this.croak(msg));
      }
      const id = this.eat(tkn.symbol, "Expected identifier");
      return sym(id);
    };

    const params = this.delimited(
      [tkn.left_paren, `Expected '(' to open params.`],
      parsedParam,
      [tkn.comma],
      [tkn.right_paren, `Expected ')' to close params.`],
    );

    // Consume the assignment operator, '='
    this.eat(tkn.eq, `Expected the assignment operator '='`);

    // Parse the body of the function
    const body = this.STATEMENT();

    // Return the new node.
    const functionNode = fn(functionName, params, body);
    return this.Node(functionNode);
  }

  /**
   * @internal
   * Parses conditional expressions.
   */
  private COND(): COND {
    this.eat(tkn.left_paren, `Expected '(' after 'if'`);
    const condition = this.EXPR();
    this.eat(tkn.right_paren, `Expected ')' after if-condition`);
    const ifBlock = this.STATEMENT();
    let elseBlock: ASTNode = nil();
    if (this.sees(tkn.else)) {
      elseBlock = this.STATEMENT();
    }
    return cond(condition, ifBlock, elseBlock);
  }

  /**
   * Parses a block of statements.
   * @example
   * ~~~
   * {
   *   let x = 1; // 1
   *   let y = x + 5; // 6
   * }
   * ~~~
   */
  private BLOCK(): BLOCK {
    const statements: ASTNode[] = [];
    while (!this.check(tkn.right_brace) && !this.atEnd()) {
      statements.push(this.STATEMENT());
    }
    this.eat(tkn.right_brace, `Expected '}' after block.`);
    return this.Node(block(statements));
  }

  /**
   * Parses a for-loop statement.
   *
   * @example
   * ~~~
   * let x = 2;
   * for (let i = 0; i < 5; i++) {
   *   x = x + 1;
   * }
   * ~~~
   *
   * @remarks
   * For-loops in Skim are treated as
   * syntactic sugar for while-loops
   * (_see_ {@link Engine.WHILE_LOOP}).
   * This allows Skim to have a single
   * loop-node construct, reducing the
   * memory and computation overhead of
   * handling extra nodes.
   */
  private FOR_LOOP(): LOOP | BLOCK {
    this.eat(tkn.left_paren, `Expected '(' after 'for'.`);

    // First, we parse the initializer.
    // This is a statement executed
    // exactly once, before everything else
    // related to the loop. The initializer
    // starts as null. We will throw an error
    // if stays null after passing through
    // the branches.
    let initializer: ASTNode | null = null;

    // deno-fmt-ignore
    // Case: This is a for-loop without
    // an initializer.
    // E.g., 'for (; i < 5; i++)'
    // We’ll let the interpreter handle
    // the possible error of 'i' being undefined.
    if (this.check(tkn.semicolon)) {
      this.advance();
    }
    
    // deno-fmt-ignore
    // Case: This is a for-loop with an initializer.
    // E.g., 'for (let i = 0; i < 5; i++)'
    else if (this.sees(tkn.let)) {
      initializer = this.VAR_DECLARATION();
    }
    
    // deno-fmt-ignore
    // Case: The initializer has some other statement
    // (e.g., a callback, god forbid).
    else {
      initializer = this.EXPRESSION_STATEMENT();
    }

    // Now we handle the condition.
    let condition: ASTNode | null = null;

    // If there next token is not a semicolon,
    // then this is a for-loop with some a condition.
    // We pass control to EXPR for parsing.
    if (!this.check(tkn.semicolon)) {
      condition = this.EXPR();
    }

    // All conditions must be delimited with a semicolon.
    this.eat(tkn.semicolon, `Expected ';' after for-loop condition.`);

    // Now we handle the increment.
    let increment: ASTNode | null = null;

    // If the next token is not a right-paren,
    // then this a for-loop with an incrementing
    // expression. We pass control to EXPR for parsing.
    if (!this.check(tkn.right_paren)) {
      increment = this.EXPR();
    }
    this.eat(tkn.right_paren, `Expected ')' after for-loop clause.`);

    // Pass control to STATEMENT to parse the for-loop's body
    // (e.g., a block).
    let body = this.STATEMENT();

    // Now we build a tree

    if (increment !== null) {
      body = block([body, increment]);
    }

    if (condition == null) {
      condition = bool("true");
    }

    body = loop(condition, body);

    if (initializer !== null) {
      body = block([initializer, body]);
    }

    return body as any as (LOOP | BLOCK);
  }

  /**
   * Parses a while-loop statement.
   * @example
   * ~~~
   * let i = 0;
   * let x = 5;
   * while (i < 5) {
   *   x += 1;
   *   i++;
   * }
   * ~~~
   */
  private WHILE_LOOP(): LOOP {
    this.eat(tkn.left_paren, `Expected '(' after 'while'.`);
    const condition = this.EXPR();
    this.eat(tkn.right_paren, `Expected ')' after loop-condition.`);
    const body = this.STATEMENT();
    return this.Node(loop(condition, body));
  }

  /**
   * Parses a variable declaration.
   * Variables are declared
   * with the `let` keyword. Chained
   * assignments are supported.
   *
   * @example
   * ~~~
   * let x = 2;
   * let y = x = 4;
   * ~~~
   */
  private VAR_DECLARATION(): VARDEF {
    // We’re here from the STATEMENT method.
    // That method ate the 'let' keyword, so
    // now we eat the name. We expect the
    // scanner to return a token of type `symbol`:
    const name = this.eat(tkn.symbol, `Expected valid identifier.`);

    // Name in hand, we make a new symbol node.
    const id = sym(name);

    // We move forward. Whether we consume
    // the '=' token is irrelevant, because
    // we allow uninitialized variables.
    // If no '=' token is consumed, the variable
    // defaults to 'null'.
    this.advance();

    // Now parse the right-hand side,
    const val = this.EXPRESSION_STATEMENT();

    // and make a new node of type VARDEF.
    const node = vardef(id, val);

    // Semicolons are unnecessary if
    // we’re on the last line
    if (this.noSemicolonNeeded()) {
      return this.Node(node);
    }
    this.eat(tkn.semicolon, "Expected semicolon.");
    // Return the new node.
    return this.Node(node);
  }

  /**
   * @internal
   * Parses assignment statements.
   */
  private ASSIGN(): ASSIGN {
    const name = this.lastnode;
    this.advance();
    if (!isNodeSymbol(name)) {
      this.updateStatus(status.syntax_error);
      const msg = this.croak("Invalid left-hand side.");
      throw new Error(msg);
    }
    const val = this.EXPR();
    return this.Node(assign(name, val));
  }

  private LAMBDA() {
    const op = this.advance();
    const prevnode = this.lastnode;
    const params: SYMBOL[] = [];
    if (isNodeArray(prevnode)) {
      const elements = prevnode.elements;
      const E = elements.length;
      for (let i = 0; i < E; i++) {
        const elem = elements[i];
        (isNodeSymbol(elem)) && params.push(elem);
      }
    }
    const rhs = this.EXPR();
    const tk = newToken(tkn.lambda, "lambda", op.line, op.column);
    const name = sym(tk);
    const node = fn(name, params, rhs);
    return this.Node(node);
  }

  /**
   * Helper method to determine if a
   * semicolon is needed.
   * Semicolons are not needed if:
   *
   * 1. The statement is the last in a program,
   * 2. the parser sees a semicolon ahead, or
   * 3. the next token is a right-brace (closing
   * a block scope).
   */
  private noSemicolonNeeded() {
    return (
      isTokenEOF(this.peek.type) ||
      this.sees(tkn.semicolon) ||
      this.check(tkn.right_brace)
    );
  }

  /**
   * @internal Parses expression statements.
   */
  private EXPRESSION_STATEMENT() {
    const expr = this.EXPR();
    if (this.noSemicolonNeeded()) {
      return this.Node(expr);
    }
    this.eat(tkn.semicolon, `Expected ';' after expression.`);
    return this.Node(expr);
  }

  /**
   * @internal
   * Parses function calls.
   */
  private CALL() {
    const name = this.advance();
    const args = this.delimited(
      [tkn.left_paren, `Expected '(' before arguments.`],
      () => this.EXPR(),
      [tkn.comma],
      [tkn.right_paren, `Expected ')' after arguments.`],
    );
    return this.Node(call(sym(name), args));
  }

  /**
   * @internal
   * Parses parenthesized expressions.
   */
  private GROUP(): ASTNode {
    this.advance(); // eat the opening `(`
    const expr = this.Node(this.EXPR());

    // if we encounter a comma, this is a tuple
    if (this.sees(tkn.comma)) {
      const items = this.delimited(
        null,
        () => this.EXPR(),
        [tkn.comma],
        [tkn.right_paren, `Expected ')' to close tuple.`],
      );
      return this.Node(tuple([expr, ...items]));
    }

    // otherwise, we can expect a closing right-paren
    this.eat(tkn.right_paren, "Expected `)` after expression.");

    // handle implicit multiplication
    if (this.check(tkn.left_paren) && !isNodeCall(this.lastnode)) {
      this.advance(); // eat the opening `)`
      const rhs = this.Node(this.EXPR());
      this.eat(tkn.right_paren, `Expected closing ')'`);
      const p = this.peek;
      const op = newToken(tkn.star, "*", p.line, p.column);
      return this.Node(infix(op, expr, rhs));
    }
    return expr;
  }

  /**
   * @internal
   * Parses numeric literals.
   */
  private NUMERIC() {
    const token = this.advance();
    const val = token.literal ? token.literal : token.lexeme;
    let node: ASTNode = nil();
    // deno-fmt-ignore
    switch (token.type) {
      case tkn.int: node = int(val); break;
      case tkn.float: node = float(val); break;
      case tkn.hex: node = hex(val); break;
      case tkn.octal: node = octal(val); break;
      case tkn.binary: node = binary(val); break;
      case tkn.inf: node = inf(); break;
      case tkn.nan: node = nan(); break;
    }
    const pt = this.peek.type;
    if (isTokenSymbol(pt) || isTokenCall(pt)) {
      const rhs = this.SYMBOLIC();
      node = infix(this.newToken(tkn.star, "*"), node, rhs);
      return this.Node(node);
    }
    if (pt === tkn.left_paren) {
      const rhs = this.GROUP();
      node = infix(this.newToken(tkn.star, "*"), node, rhs);
      return this.Node(node);
    }
    return this.Node(node);
  }

  /**
   * @internal
   * Parses a symbol.
   */
  private SYMBOLIC() {
    const token = this.advance();

    let node = sym(token);

    // if the next token is a left-paren,
    // then this is a function call.
    if (this.check(tkn.left_paren)) {
      const args = this.delimited(
        [tkn.left_paren, `Expected '(' before arguments.`],
        () => this.EXPR(),
        [tkn.comma],
        [tkn.right_paren, `Expected ')' after arguments.`],
      );
      node = call(node, args) as any;
    }

    return this.Node(node);
  }

  /**
   * Parses the literal tokens `tkn.null`,
   * `tkn.string`, `tkn.true` and
   * `tkn.false`. Numeric tokens are
   * handled by {@link Engine.NUMERIC},
   * and symbol tokens are handled by
   * {@link Engine.SYMBOLIC}.
   */
  private LITERAL() {
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
    const msg = `Unrecognized literal: ${token.lexeme}`;
    const errm = this.croak(msg);
    throw new Error(errm);
  }

  /**
   * Parses an expression via Pratt parsing.
   */
  private EXPR(minbp = bp.non): ASTNode {
    const tk = this.peek;
    // let lhs: ASTNode = this[this.#BP[tk.type][0]]();
    let [lP, rP, opBP] = this.#BP[tk.type];
    let lhs = lP === "___" ? this[rP]() : this[lP]();
    while (this.Status === status.ok && !isTokenEOF(this.peek.type)) {
      const op = this.peek;
      if (isTokenEOF(op.type)) break;
      let [_, rightParser, opBP] = this.#BP[op.type];
      if (opBP < minbp || rightParser === "___") break;
      lhs = this[rightParser]();
    }
    return lhs;
  }

  /**
   * Parses a unary-prefix expression.
   * Unary expressions reduce
   * to built-in function calls.
   */
  private PREFIX(): ASTNode {
    const op = this.advance();
    const arg = this.EXPR();
    return this.Node(call(sym(op), [arg]));
  }

  /**
   * Parses a binary expression.
   * Unlike the unary-prefix (_see_
   * {@link Engine.PREFIX}) and
   * unary-postfix (_see_ {@link Engine.POSTFIX})
   * constructs, binary expressions are inherently
   * ambiguous because of their infix notation.
   * Accordingly, we use a special parser for them,
   * along with a special node, `infix`
   * (_see_ {@link INFIX}).
   */
  private INFIX(): ASTNode {
    const op = this.advance();
    const lhs = this.lastnode;
    const rhs = this.EXPR();
    const node = infix(op, lhs, rhs);
    return this.Node(node);
  }

  /**
   * Parses a unary-postfix expression.
   * Postfix expressions reduce
   * to build-in function calls.
   */
  private POSTFIX() {
    const op = this.advance();
    const arg = this.lastnode;
    return this.Node(call(sym(op), [arg]));
  }

  /**
   * Parses fractions. Fractions are defined
   * as numbers of the form `ℕ/ℕ`, where `ℕ`
   * is a natural number. Fractions are reduced
   * to function calls to the native function `frac`,
   * of the same precence as literals.
   * @example
   * ~~~
   * let x = 1/2 // parses to frac(1,2)
   * ~~~
   */
  private FRACTION() {
    const S = this.peek.lexeme.split("/");
    if (S.length !== 2) {
      this.Status = status.syntax_error;
      const msg = this.croak("Invalid fraction");
      throw new Error(msg);
    }
    const [numerator, denominator] = S;
    const peek = this.peek;
    const name = newToken(tkn.call, "frac", peek.line, peek.column);
    const node = call(sym(name), [int(numerator), int(denominator)]);
    return this.Node(node);
  }

  /**
   * The Engine’s scientific number parsing module.
   * Scientific numbers are numbers of the form
   * `ℝEℤ`, where `ℝ` is some floating point number
   * (signs `+` and `-` allowed), and `ℤ` is some integer
   * (signs `+` and `-` allowed). Scientific numbers
   * are reduced to function calls to the native
   * function `sci`, with the same precedence as atoms.
   *
   * @example
   * ~~~
   * let x = 2.4E2 // parses to sci(2.4, 2);
   * let y = .4E-8 // parses to sci(0.4,-8);
   * ~~~
   */
  private SCIENTIFIC() {
    const S = this.peek.lexeme.split("E");
    if (S.length !== 2) {
      this.Status = status.syntax_error;
      const msg = this.croak("Invalid scientific number");
      throw new Error(msg);
    }
    const [base, exp] = S;
    const peek = this.peek;
    const name = newToken(tkn.call, "sci", peek.line, peek.column);
    const node = call(sym(name), [float(base), int(exp)]);
    return this.Node(node);
  }

  /**
   * A placeholder method for the Pratt parser’s
   * table. This is a constant function, always
   * returning the null node.
   */
  private ___() {
    return nil();
  }

  /**
   * @internal
   * __DO NOT MODIFY THIS TABLE__.
   * This the Pratt parser’s orchestrator.
   * This table lays out the precedence map (right-most
   * column) as well as the left- and right-parsers.
   * Slots labeled with three underscores correspond
   * to the null parser (_see_ {@link Engine.___}).
   * These are slots that are open for filling.
   * That parser always returns the null node.
   * We use the underscores to avoid the clutter
   * resulting from a full name.
   */
  #BP: Record<tkn, [Parslet, Parslet, bp]> = {
    [tkn.nil]: ["___", "___", bp.null],
    [tkn.comma]: ["___", "___", bp.null],
    [tkn.eof]: ["___", "___", bp.null],
    [tkn.error]: ["___", "___", bp.null],
    [tkn.left_paren]: ["GROUP", "___", bp.primary],
    [tkn.right_paren]: ["___", "___", bp.null],
    [tkn.left_bracket]: ["ARRAY", "___", bp.primary],
    [tkn.right_bracket]: ["___", "___", bp.null],
    [tkn.left_brace]: ["___", "___", bp.null],
    [tkn.right_brace]: ["___", "___", bp.null],
    [tkn.dot]: ["___", "___", bp.null],
    [tkn.vbar]: ["___", "___", bp.null],
    [tkn.semicolon]: ["___", "___", bp.null],
    [tkn.and]: ["___", "INFIX", bp.and],
    [tkn.or]: ["___", "INFIX", bp.or],
    [tkn.nand]: ["___", "INFIX", bp.nand],
    [tkn.nor]: ["___", "INFIX", bp.nor],
    [tkn.xor]: ["___", "INFIX", bp.xor],
    [tkn.xnor]: ["___", "INFIX", bp.xnor],
    [tkn.not]: ["PREFIX", "___", bp.null],
    [tkn.is]: ["___", "INFIX", bp.is],
    [tkn.rem]: ["___", "INFIX", bp.quotient],
    [tkn.mod]: ["___", "INFIX", bp.quotient],
    [tkn.div]: ["___", "INFIX", bp.quotient],
    [tkn.plus]: ["___", "INFIX", bp.sum],
    [tkn.minus]: ["___", "INFIX", bp.difference],
    [tkn.star]: ["___", "INFIX", bp.product],
    [tkn.ampersand]: ["___", "INFIX", bp.and],
    [tkn.caret]: ["___", "INFIX", bp.power],
    [tkn.percent]: ["___", "INFIX", bp.quotient],
    [tkn.slash]: ["___", "INFIX", bp.product],
    [tkn.neq]: ["___", "INFIX", bp.comparison],
    [tkn.bang]: ["___", "POSTFIX", bp.call],
    [tkn.geq]: ["___", "INFIX", bp.comparison],
    [tkn.gt]: ["___", "INFIX", bp.comparison],
    [tkn.leq]: ["___", "INFIX", bp.comparison],
    [tkn.lt]: ["___", "INFIX", bp.comparison],
    [tkn.deq]: ["___", "INFIX", bp.equality],
    [tkn.eq]: ["___", "ASSIGN", bp.assign],
    [tkn.call]: ["CALL", "___", bp.null],
    [tkn.lambda]: ["___", "LAMBDA", bp.assign],
    [tkn.int]: ["NUMERIC", "___", bp.null],
    [tkn.float]: ["NUMERIC", "___", bp.null],
    [tkn.scinum]: ["SCIENTIFIC", "___", bp.null],
    [tkn.frac]: ["FRACTION", "___", bp.null],
    [tkn.hex]: ["NUMERIC", "___", bp.null],
    [tkn.octal]: ["NUMERIC", "___", bp.null],
    [tkn.binary]: ["NUMERIC", "___", bp.null],
    [tkn.nan]: ["NUMERIC", "___", bp.null],
    [tkn.inf]: ["NUMERIC", "___", bp.null],
    [tkn.string]: ["LITERAL", "___", bp.null],
    [tkn.symbol]: ["SYMBOLIC", "___", bp.null],
    [tkn.null]: ["LITERAL", "___", bp.null],
    [tkn.true]: ["LITERAL", "___", bp.null],
    [tkn.false]: ["LITERAL", "___", bp.null],
    [tkn.class]: ["___", "___", bp.null],
    [tkn.else]: ["___", "___", bp.null],
    [tkn.for]: ["___", "___", bp.null],
    [tkn.if]: ["___", "___", bp.null],
    [tkn.return]: ["___", "___", bp.null],
    [tkn.super]: ["___", "___", bp.null],
    [tkn.this]: ["___", "___", bp.null],
    [tkn.let]: ["___", "___", bp.null],
    [tkn.def]: ["___", "___", bp.null],
    [tkn.while]: ["___", "___", bp.null],
    [tkn.in]: ["___", "___", bp.null],
    [tkn.do]: ["___", "___", bp.null],
    [tkn.goto]: ["___", "___", bp.null],
    [tkn.skip]: ["___", "___", bp.null],
    [tkn.to]: ["___", "___", bp.null],
  };
}

type Parslet =
  | "___"
  | "LITERAL"
  | "GROUP"
  | "CALL"
  | "INFIX"
  | "ASSIGN"
  | "POSTFIX"
  | "ARRAY"
  | "NUMERIC"
  | "SYMBOLIC"
  | "FRACTION"
  | "SCIENTIFIC"
  | "LAMBDA"
  | "PREFIX";

const engine = new Engine();
const src = `
let class
`;
const tree = engine.parse(src);
console.log(JSON.stringify(tree, null, 2));
console.log(tree);
// console.log(engine)
// const tokens = engine.tokenize(src);
// console.log(tokens);
