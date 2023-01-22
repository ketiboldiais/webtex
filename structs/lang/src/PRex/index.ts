import { interpreter } from './interpreter.js';
import { parser } from './parser.js';

export * from './interpreter.js';
export * from './math.js';
export * from './nodes.js';
export * from './parser.js';
export * from './token.js';
export * from './tokenizer.js';
export * from './typings.js';

export const PRex = (input: string) => {
  const res = parser.parse(input);
  return interpreter.interpret(res);
};
