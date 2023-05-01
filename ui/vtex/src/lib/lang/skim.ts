import { isStrList } from "../core/core.utils.js";

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

  onlyIf(condition: boolean) {
    if (!condition) return P.NIL();
    return this;
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
  get strung() {
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
  get repeating() {
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
  get optional() {
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
    return flaw(newState, error) as SkimState<T>;
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
  return chain(rules).strung;
};

/**
 * Given the list of skimmers, returns their
 * array of results as a single string. The array
 * may contain single result, since `list` returns
 * the first successful match.
 */
export const str = (rules: P<string | null>[]) => {
  return list(rules).map((res) => res.join(""));
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

export type CtrlOption =
  | "space"
  | "form-feed"
  | "tab"
  | "newline"
  | "vertical-tab"
  | "carriage-return"
  | "any";
/**
 * Returns a skimmer for a control-character. Valid options
 * include:
 *
 * - `space`
 * - `form-feed`
 * - `tab`
 * - `newline`
 * - `vertical-tab`
 * - `carriage-return`
 * - `any`
 */
export const ctrl = (option: CtrlOption) => {
  const newline = regex(/^[\n]/);
  const carriageReturn = regex(/^[\r]/);
  const formfeed = regex(/^[\f]/);
  const tab = regex(/^[\t]/);
  const verticalTab = regex(/^[\v]/);
  const any = regex(/^[\s]/);
  const space = regex(/^[ ]/);
  const record: Record<CtrlOption, P<string>> = {
    "form-feed": formfeed,
    "carriage-return": carriageReturn,
    "vertical-tab": verticalTab,
    newline,
    tab,
    any,
    space,
  };
  return new P<string>((state) => {
    if (state.erred) return state;
    const p = record[option];
    if (p === undefined) {
      const msg = `Invalid control option`;
      const erm = erratum("ctrl", msg);
      return flaw(state, erm);
    }
    return p.skim(state);
  });
};

/**
 * Returns a skimmer for numbers between `start` (inclusive)
 * and `end` (inclusive), returning the largest successfully
 * matched number.
 */
export const inRange = (start: number, end: number) =>
  new P<string>((state) => {
    if (state.erred) return state;
    if (start > end) {
      const msg = `Invalid range, start > end.`;
      const erm = erratum("inRange", msg);
      return flaw(state, erm);
    }
    let max = NaN;
    for (let i = start; i <= end; i++) {
      const p = lit(`${i}`).skim(state);
      if (!p.erred) {
        max = i;
      }
    }
    const res = `${max}`;
    if (isNaN(max) || res === null) {
      const msg = `Expected one match.`;
      const erm = erratum("inRange", msg);
      return flaw(state, erm);
    }
    return success(state, res, state.index + res.length);
  });

type NumberReader = {
  /**
   * Matches the given number exactly.
   *
   * @example
   * ~~~
   * const P = num('0');
   * const res = P.run('0');
   * ~~~
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
   * ~~~
   * const P = num("+int");
   * const r1 = P.run("+157"); // result: '+157'
   * const r2 = P.run("34"); // result: '34'
   * const r3 = P.run('+0') // result: null
   * ~~~
   */
  (pattern: `+int`): P<string>;

  /**
   * Matchy any and only positive integers,
   * disallowing a leading `+`.
   *
   * @example
   * ~~~
   * const P = num('whole');
   * const res = P.run(`258`); // 258
   * ~~~
   */
  (pattern: `whole`): P<string>;

  /**
   * Match any and only negative integers.
   * Does not parse `-0`, since `0` is neither
   * positive nor negative.
   * @example
   * ~~~
   * const P = num('-int');
   * const r1 = P.run("-28"); // reads '-28'
   * const r2 = P.run("-0"); // result: null
   * ~~~
   */
  (pattern: `-int`): P<string>;

  /**
   * Matches 0, a positive integer, or a negative
   * integer. Does not read `+` prefixed integers.
   * @example
   * ~~~
   * const int = num('int');
   * const r1 = int.run("-28"); // result: '-28'
   * const r2 = int.run("0"); // result: '0'
   * const r3 = int.run("5"); // result: '5'
   * const r4 = int.run("+5"); // result: null
   * ~~~
   */
  (pattern: `int`): P<string>;

  /**
   * Match any and only unsigned floating
   * point numbers of the form `natural.natural`.
   * No leading `+`is recognized.
   * @example
   * ~~~
   * const ufloat = num('ufloat');
   * const r1 = ufloat.run("1.1"); // result: '1.1'
   * const r2 = ufloat.run("0.0"); // result: '0.0'
   * const r3 = ufloat.run("0"); // result: null
   * ~~~
   */
  (pattern: `ufloat`): P<string>;

  /**
   * Matches any and only unsigned floating
   * point numbers of the form `.natural`.
   * No leading `+` is recognized.
   * @example
   * ~~~
   * const P = num("udotnum");
   * const res = P.run(`.001`); // '.001'
   * const res = P.run(`.0`); // '.0'
   * ~~~
   */
  (pattern: `udotnum`): P<string>;

  /**
   * Matches any floating
   * point number of the form `.natural`.
   * No leading `+` is recognized, but the `-`
   * will be recognized for negatives.
   * @example
   * ~~~
   * const P = num("dotnum");
   * const res = P.run(`.001`); // '.001'
   * const res = P.run(`.0`); // '.0'
   * const res = P.run(`-.22`); // '-.22'
   * ~~~
   */
  (pattern: `dotnum`): P<string>;

  /**
   * Matches any and only negative floating
   * point numbers of the form `-.natural`.
   * Will not read `-.0`.
   * @example
   * ~~~
   * const P = num("-dotnum");
   * const r1 = P.run(`-.001`); // '-.001'
   * const r2 = P.run(`-.0`); // null
   * ~~~
   */
  (pattern: `-dotnum`): P<string>;

  /**
   * Matches any and only positive floating
   * point numbers of the form `+.natural`.
   * Will not read `+.0`.
   * @example
   * ~~~
   * const P = num("+dotnum");
   * const r1 = P.run(`+.001`); // '-.001'
   * const r2 = P.run(`+.0`); // null
   * ~~~
   */
  (pattern: `+dotnum`): P<string>;
  /**
   * Matches any and only positive floating
   * point numbers of the form `natural.natural`,
   * without a leading `+`.
   * @example
   * ~~~
   * const P = num('ufloat');
   * const a = P.run("1.1"); // '1.1'
   * const b = P.run("0.0"); // '0.0'
   * const c = P.run("1.3912"); // '1.3912'
   * const d = P.run("0.390"); // '0.390'
   * ~~~
   */
  (pattern: `ufloat`): P<string>;

  /**
   * Match any and only positive floating
   * point numbers, allowing an optional
   * leading `+`. Does not recognize `0.0`
   * or `-0.0`. The decimal must have
   * a leading digit.
   * @example
   * ~~~
   * const P = num('+float');
   * const r1 = P.run("0.0"); // '0.0'
   * const r2 = P.run("-0.0"); // null
   * const r3 = P.run("1.0"); // '1.0'
   * const r3 = P.run("+1.0"); // '+1.0'
   * const r3 = P.run("3.258"); // '3.258'
   * ~~~
   */
  (pattern: `+float`): P<string>;

  /**
   * Match any and only negative floating
   * point numbers. Decimal must have a
   * leading digit. Will not read `-0.0`.
   * @example
   * ~~~
   * const P = num('-float');
   * const r1 = P.run("-1.2"); // '-1.2'
   * const r2 = P.run("-0.0"); // null
   * ~~~
   */
  (pattern: `-float`): P<string>;

  /**
   * Match any and only floating
   * point numbers of the form `N.N`,
   * where `N` is a natural number. Will
   * not read a leading `+`, but will
   * recognize `-`. Does not recognize `-0.0`.
   * @example
   * ~~~
   * const P = num('float');
   * const r1 = P.run(`3.147`); // '3.147'
   * const r2 = P.run(`2.3`); // '2.3'
   * const r3 = P.run(`-0.125`); // '-0.125'
   * const r4 = P.run(`-0.0`); // null
   * const r5 = P.run(`0.0001`); // '0.0001'
   * ~~~
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
   * Match any and only octal numbers
   * of the format:
   *
   * `0b[0|1]`.
   */
  (pattern: `binary`): P<string>;

  /**
   * Match any and only numbers of the format:
   *
   * `[real]e[int]`
   *
   * @example
   * ~~~
   * const P = num('scientific');
   * const a = P.run(`-1.2e5`); // '-1.2e5'
   * const b = P.run(`+.2e+5`); // '+.2e+5'
   * ~~~
   */
  (pattern: `scientific`): P<string>;

  /**
   * Match any and only numbers of the format:
   *
   * `[real]E[int]`
   *
   * @example
   * ~~~
   * const P = num('SCIENTIFIC');
   * const res = P.run(`-1.2E5`); // '-1.2E5'
   * ~~~
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
   * ~~~
   * const P = num('fraction');
   * const r1 = P.run(`3/2`);  // '3/2'
   * const r2 = P.run(`+1/2`); // '+1/2'
   * const r3 = P.run(`1 / 2`); // null
   * ~~~
   */
  (pattern: `fraction`): P<string>;

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

  /** Match against all number options */
  (pattern: `any`): P<string>;
};

export const num: NumberReader = (
  pattern:
    | `${number}`
    | "whole"
    | "real"
    | "natural"
    | "+int"
    | "-int"
    | "int"
    | "dotnum"
    | "udotnum"
    | "-dotnum"
    | "+dotnum"
    | "ufloat"
    | "float"
    | "+float"
    | "-float"
    | "hex"
    | "HEX"
    | "octal"
    | "binary"
    | "real"
    | "scientific"
    | "SCIENTIFIC"
    | "fraction"
    | "complex"
    | "any",
) => {
  const DIGITS_0_9 = regex(/^[0-9]+/);
  const ZERO = regex(/^[0]/);
  const REPEAT_0 = regex(/^[0]+/);
  const POSITIVE_INTEGER = regex(/^[1-9]\d*/);
  const NATURAL_NUMBER = regex(/^(0|[1-9]\d*)/);
  const DOT = regex(/^[\.]/);
  const MINUS_SIGN = regex(/^[-]/);
  const PLUS_SIGN = regex(/^[+]/);
  let reader = one(pattern);
  const zerosLedInt = word([
    maybe(REPEAT_0),
    POSITIVE_INTEGER,
  ]);
  switch (pattern) {
    case "whole":
      reader = POSITIVE_INTEGER;
      break;
    case "natural":
      reader = NATURAL_NUMBER;
      break;
    case "float":
      reader = word([
        NATURAL_NUMBER,
        DOT,
        DIGITS_0_9,
      ]).or(num("-float"));
      break;
    case "+int":
      reader = word([PLUS_SIGN, POSITIVE_INTEGER]);
      break;
    case "-int":
      reader = word([MINUS_SIGN, POSITIVE_INTEGER]);
      break;
    case "int":
      reader = word([MINUS_SIGN.optional, POSITIVE_INTEGER]).or(ZERO);
      break;
    case "dotnum":
      reader = word([
        MINUS_SIGN.optional,
        num("udotnum"),
      ]);
      break;
    case "udotnum":
      reader = word([
        DOT,
        word([maybe(REPEAT_0), POSITIVE_INTEGER])
          .or(ZERO),
      ]);
      break;
    case "-dotnum":
      reader = word([
        MINUS_SIGN,
        DOT,
        maybe(REPEAT_0),
        POSITIVE_INTEGER,
      ]);
      break;
    case "+dotnum":
      reader = word([
        PLUS_SIGN,
        DOT,
        maybe(REPEAT_0),
        POSITIVE_INTEGER,
      ]);
      break;
    case "ufloat":
      reader = word([
        NATURAL_NUMBER,
        DOT,
        NATURAL_NUMBER,
      ]);
      break;
    case "-float":
      reader = word([
        MINUS_SIGN,
        NATURAL_NUMBER,
        DOT,
        maybe(REPEAT_0),
        POSITIVE_INTEGER,
      ]);
      break;
    case "+float":
      reader = word([
        PLUS_SIGN,
        NATURAL_NUMBER.then((r1) => {
          const res = r1 === "0" ? zerosLedInt : zerosLedInt
            .or(ZERO);
          return word([DOT, res]).map((r2) => r1 + r2);
        }),
      ]);
      break;
    case "hex":
    case "HEX":
      reader = regex(
        pattern === "hex" ? /^0x[0-9a-f]+/ : /^0x[0-9A-F]+/,
      );
      break;
    case "octal":
      reader = regex(/^0o[0-7]+/);
      break;
    case "binary":
      reader = regex(/^0b[0|1]+/);
      break;
    case "fraction":
      reader = word([
        maybe(MINUS_SIGN.or(PLUS_SIGN)),
        NATURAL_NUMBER,
        lit("/"),
        NATURAL_NUMBER,
      ]);
      break;
    case "scientific":
    case "SCIENTIFIC": {
      const E = lit(pattern === "SCIENTIFIC" ? "E" : "e");
      reader = word([
        PLUS_SIGN.optional,
        num("float").or(num("int")).or(num("dotnum")),
        E,
        num("int").or(num("+int")),
      ]);
      break;
    }
    case "real": {
      reader = some([
        num("hex"),
        num("octal"),
        num("binary"),
        num("scientific"),
        num("+dotnum"),
        num("dotnum"),
        num("+float"),
        num("float"),
        num("fraction"),
        num("int"),
        num("+int"),
      ]);
      break;
    }
    case "complex":
      reader = word([
        num("real"),
        PLUS_SIGN.or(MINUS_SIGN),
        num("real"),
        lit("i"),
      ]);
      break;
    case "any":
      reader = num("complex").or(num("real"));
      break;
  }
  return reader.errdef(pattern);
};

// § Utility Methods
/**
 * The following section relates to utility methods
 * used throughout the source code. Because the
 * reader may not be familiar with functional
 * programming concepts, we take the time to
 * document their implementations. Readers
 * familiar with these methods may continue to
 * to the [Token Type]{@link tkn} section (relating
 * to token definitions).
 */

/**
 * The `pipe` function combines its argument list of functions
 * into a single function, executed from left to right.
 *
 * @example
 * ~~~
 * const cap = (s:string) => s.slice(0,1).toUpperCase() + s.slice(1);
 * const dot = (s:string) => s + '.';
 * const capdot = pipe(capFirst, addDot);
 * const res = capdot('hello') // 'Hello.'
 * ~~~
 */
const pipe = <t>(...fns: Array<(arg: t) => t>) => (arg: t) =>
  fns.reduce((acc, fn) => fn(acc), arg);

const either =
  <x>(main: (arg: x) => boolean, alt: (arg: x) => boolean) => (arg: x) =>
    main(arg) || alt(arg);

const both =
  <x>(req1: (arg: x) => boolean, req2: (arg: x) => boolean) => (arg: x) =>
    req1(arg) && req2(arg);

const anyof = <x>(...conds: Array<(arg: x) => boolean>) => (arg: x) => {
  for (let i = 0; i < conds.length; i++) {
    if (conds[i](arg)) return true;
  }
  return false;
};

/**
 * The `tkn` type corresponds to “token type.”
 * A token type is distinguished from the
 * _token instance_. The structure “a crook is a crook”
 * consists of five tokens but four token
 * types – type “a”, type “crook”, and type “is”.
 * A distinct `tkn` type allows us to more efficiently
 * recognize tokens. There are countably-infinite number
 * of integers, but we can encapsulate all of them with
 * the single token `int`. Likewise, there may be infinite
 * number of string values, but we encapsulate all of them
 * with `string`.
 */
enum tkn {
  // § Utility Tokens
  /**
   * A utility token corresponding to
   * the end of input.
   */
  eof,
  /**
   * A utility token corresponding to
   * an error.
   */

  err,
  /**
   * A utility token to indicate
   * an initial, empty state.
   */
  nil,

  // § 1 Character Tokens
  // The following are 1-character
  // token types.

  /**
   * - Lexeme: `,`
   * - BP: `nil`
   * - Ctx: `delimiter`
   */
  comma,

  /**
   * - Lexeme: `?`
   * - BP: `nil`
   * - Ctx: `delimiter`
   */
  query,

  /**
   * - Lexeme: `(`
   * - BP: `nil`
   * - Ctx: `delimiter`
   */
  lparen,

  /**
   * - Lexeme: `)`
   * - BP: `nil`
   * - Ctx: `delimiter`
   */
  rparen,

  /**
   * - Lexeme: `[`
   * - BP: `nil`
   * - Ctx: `delimiter`
   */
  lbracket,

  /**
   * - Lexeme: `]`
   * - BP: `nil`
   * - Ctx: `delimiter`
   */
  rbracket,

  /**
   * - Lexeme: `{`
   * - BP: `nil`
   * - Ctx: `delimiter`
   */
  lbrace,

  /**
   * - Lexeme: `}`
   * - BP: `nil`
   * - Ctx: `delimiter`
   */
  rbrace,

  /**
   * - Lexeme: `"`
   * - BP: `nil`
   * - Ctx: `delimiter`
   */
  dquote,

  /**
   * - Lexeme: `;`
   * - BP: `nil`
   * - Ctx: `delimiter`
   */
  semicolon,

  /**
   * - Lexeme: `:`
   * - BP: `nil`
   * - Ctx: `delimiter`
   */
  colon,

  /**
   * - Lexeme: `|`
   * - BP: `nil`
   * - Ctx: `delimiter`
   */
  vbar,

  /**
   * - Lexeme: `.`
   * - BP: `nil`
   * - Ctx: `delimiter`
   */
  dot,

  // § 1-2 Character Tokens

  /**
   * - Lexeme: `+`
   */
  plus,

  /**
   * - Lexeme: `-`
   */
  minus,

  /**
   * - Lexeme: `*`
   */
  star,

  /**
   * - Lexeme: `/`
   */
  slash,

  /**
   * - Lexeme: `=`
   */
  eq,

  /**
   * - Lexeme: `!=`
   */
  neq,

  /**
   * - Lexeme: `==`
   */
  eq2,

  /**
   * - Lexeme: `>`
   */
  gtn,

  /**
   * - Lexeme: `>=`
   */
  geq,

  /**
   * - Lexeme: `<`
   */
  ltn,

  /**
   * - Lexeme: `<=`
   */
  leq,

  // § Literal Tokens
  /**
   * An identifier token.
   * A token is scanned as
   * an identifier if and only if
   * the token’s lexeme:
   *
   * 1. begins with an ASCII Latin letter, `_`, or `'`
   * 2. ends with a Latin letter, `_`, digit, or `'`, and
   * 3. is not a keyword, reserved word, or
   *    native function name.
   */
  symbol,

  /**
   * Strings are recognized by a starting `"` (double-quote)
   * and a terminating `"`. Unterminated strings will
   * trigger a `status.syntax_error`.
   */
  string,

  // Numeric Literals
  int,
  real,
  frac,
}

/**
 * Just because the parser _can_ parse a
 * token doesn’t mean that it _should_.
 * A `bp` is a type that corresponds to a token’s binding
 * power. Tokens with higher binding powers take priority.
 * Tokens with lower binding powers are subjected to those
 * of higher powers.
 */
enum bp {
  /**
   * A `bp` type corresponding to “no bp.” Not
   * every token requires a `bp`, but every token’s
   * `bp` property must be initialized with a `bp`.
   * This ensures that all tokens have the same type.
   * The alternative is to leave the field `undefined`,
   * thereby introducing a further need for guards and
   * field-checks.
   */
  nil,

  /**
   * The lowest substantive `bp` type.
   */
  base,
  /**
   * Tokens with a `bp` of `low`
   * have a higher binding power than
   * operators with a `bp` of `base`,
   * but a lower binding power than
   * operators with a `bp` of `mid`.
   */
  low,
  /**
   * One rung above `low`, tokens
   * with a `bp` of `mid` bind more
   * strongly than operators with a
   * `bp` of `low`, but are subservient
   * to operators with a `bp` of `high`.
   */
  mid,
  /**
   * Tokens with a `bp` of `high`
   * bind more strongly than those of
   * `bp.mid`, but less strongly than
   * those of `bp.peak`.
   */
  high,
  /**
   * For most tokens, this is the highest
   * possible `bp`. The only tokens that
   * may use this `bp` are prefix operator
   * tokens.
   */
  peak,
  /**
   * The only tokens that may use the
   * `bp` of `apex` are function calls
   * and postfix operators (which are
   * parsed as native function calls).
   */
  apex,
}
/**
 * A token’s `ctx` type gives the parser
 * a “hint” as to what the given token’s
 * context is.
 *
 * For example, the lexemes `(` and `)`
 * correspond to `tkn.lparen` and `tkn.rparen`
 * respectively. Both types, however, are a
 * _kind_ of `delimiter`.
 *
 * Providing this context allows the parser
 * to more efficiently determine which route to
 * take next.
 */
enum ctx {
  /**
   * A token of kind `util`
   * is an internal-use only token.
   * The two `util`-type tokens are
   * `eof` and `err`.
   */
  util,

  /**
   * Tokens of kind `delim`
   * are tokens are “structuring”
   * tokens. These tokens include:
   * `(`, `)`, `[`, `]`, `.`, `{`,
   * `}`, `"`, `;`, and `|`.
   */
  delim,

  /**
   * Keyword tokens are tokens
   * that have well-defined
   * semantics in the language.
   * E.g., `let`, `if`, `else`,
   * and `class`.
   */
  keyword,

  /**
   * A _reserved token_ is a token
   * that may or may not have a
   * well-defined semantic in the
   * language, but are restricted
   * from the user regardless, for
   * whatever reason.
   */
  reserved,

  /**
   * A `prefix` token is an operator
   * contextualized in prefix notation.
   * E.g., `~5` (bitwise not).
   */
  prefix,

  /**
   * An `infix_left` token indicates
   * an infix operator that prefers
   * left-associativity. E.g., in
   * `2+5`, `+` is an infix operator
   * to be read from left to right.
   */
  infix_left,

  /**
   * An `infix_right` token
   * indicates an infix operator
   * that prefers right-associativity.
   * E.g., given `2^1+3`, the token `^`
   * is an `infix_right` token
   * evaluated from right to left. Thus,
   * `1+3` is read first (yielding
   * `4`), and `2` is read last (yielding
   * `2`). The overall result is `2^4`,
   * yielding `16`. Had we classified
   * `^` as an `infix_left` token,
   * the result would have been `2+3=4`.
   */
  infix_right,

  /**
   * A token under `postfix` indicates
   * a postfix notation context.
   * E.g., in the expression `3!`,
   * the token `!` is understood
   * as the factorial operator.
   */
  postfix,

  /**
   * A token under `mixfix` indicates
   * a context that is some _fix_ neither
   * pre, in, or post. E.g, the ternary
   * operator `?` is a `mixfix` context.
   */
  mixfix,

  /**
   * An `atom` indicates a terminal
   * context. That is, there are no
   * other contexts to consider.
   */
  atom,
}

type Token = {
  /**
   * The token’s type.
   * @see tkn for further description.
   */
  Type: tkn;

  /**
   * The token’s binding power.
   * @see bp for further description.
   */
  BP: bp;

  /**
   * The token’s context.
   * @see ctx for futher description.
   */
  Ctx: ctx;
  Lexeme: string;
  Line: number;
  Col: number;
};
const token = (
  Type: tkn,
  BP: bp,
  Ctx: ctx,
  Lexeme: string,
  Line: number,
  Col: number,
): Token => ({ Type, BP, Ctx, Lexeme, Line, Col });

const ctxTest = (def: ctx) => (subject: ctx) => (subject === def);

const isUtilToken = ctxTest(ctx.util);
const isDelimToken = ctxTest(ctx.delim);
const isKeyword = ctxTest(ctx.keyword);
const isReserved = ctxTest(ctx.reserved);
const isInfixLeft = ctxTest(ctx.infix_left);
const isInfixRight = ctxTest(ctx.infix_right);
const isPrefix = ctxTest(ctx.prefix);
const isInfix = either(isInfixLeft, isInfixRight);
const isPostFix = ctxTest(ctx.postfix);
const isMixFix = ctxTest(ctx.mixfix);
const isOP = anyof(isInfix, isPrefix, isPostFix, isMixFix);
const isAtom = ctxTest(ctx.atom);

type LCFn = (
  type: () => tkn,
  BP: () => bp,
  Ctx: () => ctx,
  lexeme: () => string,
) => (line: number, column: number) => Token;

const LC: LCFn = (type, BP, Ctx, lexeme) => (line, column) =>
  token(
    type(),
    BP(),
    Ctx(),
    lexeme(),
    line,
    column,
  );

const pureTokenFactory = (Ctx: ctx) => (type: tkn, lexeme = "") =>
  LC(() => type, () => bp.nil, () => Ctx, () => lexeme);

const tokenFactory = (Ctx: ctx) => (lexeme: string, type: tkn, BP: bp) =>
  LC(() => type, () => BP, () => Ctx, () => lexeme);

const infixRightToken = tokenFactory(ctx.infix_left);
const infixLeftToken = tokenFactory(ctx.infix_right);
const mixFixToken = tokenFactory(ctx.mixfix);
const postFixToken = tokenFactory(ctx.postfix);
const prefixToken = tokenFactory(ctx.prefix);
const atomToken = pureTokenFactory(ctx.atom);
const delimiterToken = pureTokenFactory(ctx.delim);
const keywordToken = pureTokenFactory(ctx.keyword);
const reservedToken = pureTokenFactory(ctx.reserved);
const utilToken = pureTokenFactory(ctx.util);
const errorToken = (message: string) => utilToken(tkn.err, message);
enum stat {
  scanner_error,
  syntax_error,
  semantic_error,
  type_error,
  ok,
}
type State = {
  start: number;
  current: number;
  line: number;
  column: number;
  max: number;
  status: stat;
  prevtoken: tkn;
};
const initState = (max: number): State => ({
  start: 0,
  current: 0,
  line: 1,
  column: 0,
  max,
  status: stat.ok,
  prevtoken: tkn.nil,
});

const parse = (source: string, devmode: boolean = false) => {
  const text = source;
  const stateLogs: State[] = [];
  let state = initState(text.length);
  const stateUpdate = (update: Partial<State>) => {
    devmode && stateLogs.push(state);
    state = { ...state, ...update };
  };
  const makeToken = (tkfn: (line: number, column: number) => Token) => {
    const res = tkfn(state.line, state.column);
    stateUpdate({prevtoken: res.Type})
    return res;
  };
  const safe = () => state.status === stat.ok;
  const atEnd = () => state.current >= state.max;
  const tick = (by: number = 1) => {
    const char = text[state.current];
    const current = state.current + by;
    stateUpdate({ current });
    return char;
  };
  const peek = () => text[state.current];
  const peekNext = () => text[state.current + 1];
  const currentChar = () => text.slice(state.start, state.current);
  const match = (expectedChar: string) => {
    if (atEnd()) return false;
    if (currentChar() !== expectedChar) return false;
    tick();
    return true;
  };
  const isDigit = (c: string) => c >= "0" && c <= "9";
  const remText = () => text.slice(state.current);
  const scanPosNum = (str: string) => {
    const N = some([
      num("+dotnum").map((res) => ({ res, type: "+float" })),
      num("+float").map((res) => ({ res, type: "+float" })),
      num("+int").map((res) => ({ res, type: "+int" })),
    ]).run(str);
    if (N.erred) return makeToken(errorToken("Expected number"));
    const result = N.result.res;
    tick(result.length - 1);
    const type = N.result.type === "+float" ? tkn.real : tkn.int;
    return makeToken(atomToken(type, result));
  };
  const scanNegNum = (str: string) => {
    const N = some([
      num("-dotnum").map((res) => ({ res, type: "-float" })),
      num("-float").map((res) => ({ res, type: "-float" })),
      num("-int").map((res) => ({ res, type: "-int" })),
    ]).run(str);
    if (N.erred) return makeToken(errorToken("Expected number"));
    const result = N.result.res;
    tick(result.length - 1);
    const type = N.result.type === "-float" ? tkn.real : tkn.int;
    return makeToken(atomToken(type, result));
  };
  const scanDotNum = (str: string) => {
    const N = num("dotnum").run(str);
    if (N.erred) return makeToken(errorToken("Expected number"));
    tick(N.result.length - 1);
    return makeToken(atomToken(tkn.real, N.result));
  };
  const skipwhitespace = () => {
    while (safe() && !atEnd()) {
      const c = peek();
      switch (c) {
        case " ":
        case "\r":
        case "\t":
          tick();
          break;
        case "\n":
          stateUpdate({ line: state.line + 1 });
          tick();
          break;
        default:
          stateUpdate({ column: state.column + 1 });
          return;
      }
    }
  };
  const getToken = () => {
    skipwhitespace();
    const c = tick();
    const D = (t: tkn) => makeToken(delimiterToken(t, c));
    const text = c + remText();
    const nxtchar = peek();
    switch (c) {
      case "(":
        return D(tkn.lparen);
      case ")":
        return D(tkn.rparen);
      case "{":
        return D(tkn.lbrace);
      case "}":
        return D(tkn.rbrace);
      case "[":
        return D(tkn.lbracket);
      case "]":
        return D(tkn.rbracket);
      case ";":
        return D(tkn.semicolon);
      case ",":
        return D(tkn.comma);
      case ".":
        if (isDigit(nxtchar)) return scanDotNum(text);
        return D(tkn.dot);
      case "-":
        if (isDigit(nxtchar)) return scanNegNum(text);
        return D(tkn.minus);
      case "+":
        if (isDigit(nxtchar)) return scanPosNum(text);
        return D(tkn.plus);
      case "/":
        return D(tkn.slash);
      case "*":
        return D(tkn.star);
    }
    return makeToken(utilToken(tkn.eof));
  };
  const report = <t>(output: t) =>
    devmode ? ({ output, stateLogs }) : ({ output });
  const tokenize = () => {
    const L = text.length;
    const tokens: Token[] = [];
    for (let i = 0; i < L; i++) {
      tokens.push(getToken());
      if (atEnd()) break;
    }
    return report(tokens);
  };
  return {
    tokenize,
  };
};

const parsing = parse(".123 + 2.3", true);
console.log(parsing.tokenize());
