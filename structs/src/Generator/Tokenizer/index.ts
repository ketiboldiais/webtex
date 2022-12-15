import { TokenizerAPI } from "./tokenizer.api";
import { isDigit } from "../../Utils";

export class Tokenizer implements TokenizerAPI {
  input: string;
  cursor: number;
  constructor(input: string) {
    this.input = input;
    this.cursor = 0;
  }
  tokensRemain() {
    return this.cursor < this.input.length;
  }
}
