import {
  lit,
  chain,
  oneof,
  letter,
  many,
  P,
  strung,
  maybe,
  glyph,
  repeat,
  rgx,
  not,
} from '../pkt/index.js';
import { log } from '../utils/index.js';
import {
  WhiteSpace,
  Keyword,
  Delimiter,
  Punct,
  BinaryMathOp,
  UnaryMathOp,
  BinaryStringOp,
  AssignOp,
  LogicOp,
  RelOp,
  NumberType,
} from './types.js';

// § - whitespace parsers
export const space = lit(' ').type<WhiteSpace>('space');
export const newline = lit('\n').type<WhiteSpace>('newline');
export const tab = lit('\t').type<WhiteSpace>('tab');
export const enter = lit('\r').type<WhiteSpace>('enter');
export const whitespace = repeat(space.or(newline).or(tab).or(enter));

// § - keyword parsers
export const keyword_let = glyph(lit('let')).type<Keyword>('let');
export const keyword_const = glyph(lit('const')).type<Keyword>('const');
export const keyword_var = glyph(lit('var')).type<Keyword>('var');
export const keyword_return = glyph(lit('return')).type<Keyword>('return');
export const keyword_set = glyph(lit('set')).type<Keyword>('set');
export const keyword_alg = glyph(lit('alg')).type<Keyword>('alg');
export const keyword_struct = glyph(lit('struct')).type<Keyword>('struct');

// § - delimiter parsers
export const lparen = glyph(lit('(')).type<Delimiter>('(');
export const rparen = glyph(lit(')')).type<Delimiter>(')');
export const lbrace = glyph(lit('{')).type<Delimiter>('{');
export const rbrace = glyph(lit('}')).type<Delimiter>('}');
export const lbracket = glyph(lit('[')).type<Delimiter>('[');
export const rbracket = glyph(lit(']')).type<Delimiter>(']');

// § - digit parsers
const zero = lit('0');
const one = lit('1');
const two = lit('2');
const three = lit('3');
const four = lit('4');
const five = lit('5');
const six = lit('6');
const seven = lit('7');
const eight = lit('8');
const nine = lit('9');

// § - punctuation parsers
export const dot = lit('.');
export const dash = lit('-');
export const underscore = lit('_');
export const fslash = lit('/');
export const semicolon = glyph(lit(';')).type<Punct>(';');
export const comma = glyph(lit(',')).type<Punct>(',');
export const colon = glyph(lit(':')).type<Punct>(':');

// § - math operator parsers
export const minus = glyph(lit('-')).type<BinaryMathOp>('-');
export const divide = glyph(lit('/')).type<BinaryMathOp>('/');
export const add = glyph(lit('+')).type<BinaryMathOp>('+');
export const multiply = glyph(lit('*')).type<BinaryMathOp>('*');
export const power = glyph(lit('^')).type<BinaryMathOp>('^');
export const quot = glyph(lit('%')).type<BinaryMathOp>('%');
export const fact = glyph(lit('!')).type<UnaryMathOp>('!');
export const rem = glyph(lit('rem')).type<BinaryMathOp>('rem');
export const mod = glyph(lit('mod')).type<BinaryMathOp>('mod');

// § - string operator parsers
/**
 * Parses the `++` string operator. Given `a ++ b`,
 * returns `b` appended to `a`.
 * @example
 * ~~~
 * 'a' ++ 'b' // 'ab'
 * ~~~
 */
export const concat = glyph(lit('++')).type<BinaryStringOp>('++');
/**
 * Parses the `--` string operator. Given `a ++ b`,
 * returns `b` prepended to `a`.
 * @example
 * ~~~
 * 'a' -- 'b' // 'ba'
 * ~~~
 */
export const revcat = glyph(lit('--')).type<BinaryStringOp>('--');

// § binary operators
export const binop = oneof(
  concat,
  revcat,
  minus,
  divide,
  add,
  multiply,
  power,
  fact,
  quot,
  rem,
  mod
);

// § - assignment operator parser
export const assignOp = glyph(lit(':=')).type<AssignOp>(':=');

// § - boolean operator parser
export const and = glyph(lit('and')).type<LogicOp>('and');
export const pnot = glyph(lit('not')).type<LogicOp>('not');
export const or = glyph(lit('or')).type<LogicOp>('or');
export const xor = glyph(lit('xor')).type<LogicOp>('xor');
export const xnor = glyph(lit('xnor')).type<LogicOp>('xnor');
export const nor = glyph(lit('nor')).type<LogicOp>('nor');
export const nand = glyph(lit('nand')).type<LogicOp>('nand');

// § equality parsers
export const EQ = glyph(lit('=')).type<RelOp>('=');
export const DEQ = glyph(lit('==')).type<RelOp>('==');
export const eqop = oneof(DEQ, EQ);

// § inequality parsers
export const NEQ = glyph(lit('!=')).type<RelOp>('!=');
export const LT = glyph(lit('<')).type<RelOp>('<');
export const GT = glyph(lit('>')).type<RelOp>('>');
export const LTE = glyph(lit('<=')).type<RelOp>('<=');
export const GTE = glyph(lit('>=')).type<RelOp>('>=');
export const ineqop = oneof(LTE, GTE, NEQ, LT, GT);

// § boolean parser
export const pTrue = glyph(lit('true')).type('true');
export const pFalse = glyph(lit('false')).type('false');
export const pBool = oneof(pTrue, pFalse);

// § identifier parser
export const digits = strung('digits');
export const identifier = glyph(
  chain(maybe(underscore), strung('letters'), maybe(digits))
).type('identifier');

// § natural number parser
export const natural = many(
  one,
  two,
  three,
  four,
  five,
  six,
  seven,
  eight,
  nine
)
  .maybe(zero)
  .type<NumberType>('natural');

// § integer parser
export const negint = chain(dash, natural).type<NumberType>('integer');
export const int = natural.or(negint).type<NumberType>('integer');

// § real number parser
export const real = chain(int, dot, natural).type<NumberType>('real').or(int);

// § rational number parser
export const rational = chain(
  real.or(int),
  fslash,
  real.or(int)
).type<NumberType>('rational');

// § scientific number parser
export const scientific = chain(real, letter.E, real).type<NumberType>(
  'scientific'
);

// § any number parser
export const number = oneof(scientific, rational, real, int);

// § string parser
export const str = rgx(/^"[^"]*"/).type<'string'>('string');

// § implicit multiplication parser
export const imul = chain(number, not(whitespace), identifier).map((d) => ({
  type: d.children[0].type,
  result: d.children[0].result,
}));
export const dist = chain(number.or(identifier as any), lparen).map((d) => ({
  result: d.children[0].result,
  type: d.children[0].type,
  end: d.children[0].end,
}));
