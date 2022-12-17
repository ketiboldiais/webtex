export type $NumberNode = {
  type: "Number";
  value: number;
};

/**
 * @description Parses an input string into an AST.
 */
export interface ParserAPI {
  /**
   * The input string to parse.
   */
  input: string;
  /**
   * Parses the string passed as input.
   */
  parse: (input: string) => void;
  toNumber: () => $NumberNode;
}
