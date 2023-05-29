import { Token } from "./token.js";

export class Err {
  message: string;
  constructor(message: string) {
    this.message = message;
  }
}
export const err = (message: string) => new Err(message);
export const expect = (expected: string, got: Token) => (
  `Expected ${expected}, but got “${got._lexeme}”`
);
