/**
 * A `Tokenizer` generates tokens from
 * a given string by lazily emitting tokens
 * from the input stream.
 */
export interface TokenizerAPI {
  /**
   * The input stream to read tokens
   * from.
   */
  input: string;
  /**
   * The current position of the tokenizer.
   */
  cursor: number;
	/**
	 * Returns `true` if there are still tokens
	 * to read, `false` otherwise.
	 */
  tokensRemain: () => boolean;
}
