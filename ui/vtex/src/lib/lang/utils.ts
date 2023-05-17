import {Token, tt} from "./main.js";

/**
 * Returns `true` if the given character `c` is
 * a digit, false otherwise.
 */
export const isDigit = (c: string) =>
  (typeof c !== "string") ? false : c.match(/^[0-9]/) !== null;

/**
 * Returns `true` if the given character `c`
 * satisfies any of the following conditions:
 * 
 * 1. `c` is an ASCII lower-case letter (`[a-z]`).
 * 2. `c` is an ASCII upper-case letter (`[A-Z]`).
 * 3. `c` is the ASCII character `_`.
 * 4. `c` is the ASCII character `'`.
 * 
 */
export const isASCIIid = (c: string) => (
  (c >= "a") && (c <= "z") ||
  (c >= "A") && (c <= "Z") ||
  (c === "_") ||
  (c === `'`)
);
/**
 * Returns true if the given `text`
 * is:
 *
 * - a Latin letter (lowercase or uppercase), or
 * - a Latin letter with accents, or
 * - a Greek letter (lowercase or uppercase), or
 * - an underscore `_`, or
 * - the lexeme `'` (a single quote)
 */
export const isLatinGreek = (c: string) =>
  isASCIIid(c) ||
  /^[a-zA-Z_\u00C0-\u02AF\u0370-\u03FF\u2100-\u214F]/.test(c);

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

export type printOption = "json" | "default";

export const print = (
  x: any,
  option: printOption = "default",
) =>
  option === "json" ? console.log(JSON.stringify(x, null, 2)) : console.log(x);

/**
 * Utility token used for testing.
 */
// export const T = (lexeme:string) => new Token(tt.nil, lexeme, 0, 0)