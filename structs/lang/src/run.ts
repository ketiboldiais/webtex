import {
  char,
  choiceOf,
  digits,
  letters,
  sequenceOf,
  many,
  atLeast1,
  braced,
  parenthesized,
  bracketed,
} from './index.js';

const { log: show } = console;

// const parser = sequenceOf(letter);
// show(parser.run('123'));
