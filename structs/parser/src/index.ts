import { $NumberNode, ParserAPI } from "./parser.api";

const NumberNode = (value: string): $NumberNode => {
  return { type: "Number", value: Number(value) };
};

export class Parser implements ParserAPI {
  input: string;
  constructor() {
    this.input = "";
  }
  parse(input: string) {
    this.input = input;
  }
  toNumber() {
    return NumberNode(this.input);
  }
}
