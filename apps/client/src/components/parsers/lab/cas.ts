import { log } from '../utils/index.js';
import {
  any,
  choice,
  word,
  a,
  many,
  maybe,
  skipSpace,
  an,
} from '../pcx/index.js';
import { Failure, chain, lit, union } from '../pkt/index.js';

export type StringTup4 = [string, string, string, string];

/* ----------------------------- PARSER HELPERS ----------------------------- */

// delimiters
const lparen = a('(');
const rparen = a(')');
const lbracket = a('[');
const rbracket = a(']');
const lbrace = a('{');
const rbrace = a('}');

// punctuation
const dot = a('.');
const colon = a(':');

export const letter = any('letter');
const underscore = a('_');
const digit = choice(
  a('0'),
  a('1'),
  a('2'),
  a('3'),
  a('4'),
  a('5'),
  a('6'),
  a('7'),
  a('8'),
  a('9')
);
const whole = choice(
  a('1'),
  a('2'),
  a('3'),
  a('4'),
  a('5'),
  a('6'),
  a('7'),
  a('8'),
  a('9')
);

// arithmetic operator parsers
const plus = a('+');
const minus = a('-');
const star = a('*');
const slash = a('/');
const caret = a('^');
const bang = a('!');

// relational operator parsers
const equal = a('=');
const notEqual = word(bang, equal);
const lt = a('<');
const gt = a('>');
const lte = word(lt, equal);
const gte = word(gt, equal);

// logical operator parsers
const not = word(an('n'), an('o'), a('t')).map((d) => ({
  out: d.out.join(''),
}));
const or = word(an('o'), an('r')).map((d) => ({ out: d.out.join('') }));
const and = word(an('a'), an('n'), a('d')).map((d) => ({
  out: d.out.join(''),
}));

// boolean parsers
const parseTrue = word(a('t'), an('r'), a('u'), an('e')).map((d) => ({
  out: d.out.join(''),
}));
const parseFalse = word(an('f'), an('a'), an('l'), an('s'), an('e')).map(
  (d) => ({
    out: d.out.join(''),
  })
);

// assignment operator parser
const parseAssignment = word(colon, equal).map((d) => ({
  out: d.out.join(''),
}));

// used by the lineq module, to be removed.
const op = choice(plus, minus);
export { op };

/* ------------------------------- NODE TYPES ------------------------------- */
type NumberType =
  | 'NATURAL'
  | 'INTEGER'
  | 'DECIMAL'
  | 'SCIENTIFIC'
  | 'RATIONAL'
  | 'REAL';
type NodeType = 'ERROR' | 'OPERATOR' | 'IDENTIFIER' | 'BOOL' | NumberType;

class Node {
  value: any;
  type: NodeType;
  constructor(value: any, type: NodeType) {
    this.value = value;
    this.type = type;
  }
}

class Fail extends Node {
  constructor(message: string) {
    super(message, 'ERROR');
    this.type = 'ERROR';
    this.value = message;
  }
}

/* -------------------------- RELATIONAL OPERATORS -------------------------- */

type Relational_Operator =
  | 'equal_to'
  | 'not_equal_to'
  | 'less_than'
  | 'greater_than'
  | 'less_than_or_equal_to'
  | 'greater_than_or_equal_to';

class RelationOperator extends Node {
  value: Relational_Operator;
  type: NodeType;
  constructor(value: Relational_Operator) {
    super(value, 'OPERATOR');
    this.value = value;
    this.type = 'OPERATOR';
  }
}

function LT(src: string) {
  const res = lt.run(src);
  if (res.err) return new Fail('Couldn’t parse [<]');
  return new RelationOperator('less_than');
}
function GT(src: string) {
  const res = gt.run(src);
  if (res.err) return new Fail('Couldn’t parse [>]');
  return new RelationOperator('greater_than');
}
function GTE(src: string) {
  const res = gte.run(src);
  if (res.err) return new Fail('Couldn’t parse [>=]');
  return new RelationOperator('greater_than_or_equal_to');
}
function LTE(src: string) {
  const res = gte.run(src);
  if (res.err) return new Fail('Couldn’t parse [<=]');
  return new RelationOperator('less_than_or_equal_to');
}
function Eq(src: string) {
  const res = equal.run(src);
  if (res.err) return new Fail('Couldn’t parse [=]');
  return new RelationOperator('equal_to');
}
function Neq(src: string) {
  const res = notEqual.run(src);
  if (res.err) return new Fail('Couldn’t parse [!=]');
  return new RelationOperator('not_equal_to');
}

/* ---------------------------- LOGICAL OPERATORS --------------------------- */
type LOGICAL_OPERATOR = 'not' | 'and' | 'or';
class LogicalOperator extends Node {
  constructor(value: LOGICAL_OPERATOR) {
    super(value, 'OPERATOR');
    this.value = value;
  }
}
function op_and(s: string) {
  const res = and.run(s);
  if (res.err) return new Fail('Couldn’t parse [and]');
  return new LogicalOperator('and');
}
function op_or(s: string) {
  const res = or.run(s);
  if (res.err) return new Fail('Couldn’t parse [or]');
  return new LogicalOperator('or');
}
function op_not(s: string) {
  const res = not.run(s);
  if (res.err) return new Fail('Couldn’t parse [not]');
  return new LogicalOperator('not');
}
/* -------------------------- ARITHMETIC OPERATORS -------------------------- */
type ARITHMETIC_OPERATOR =
  | 'add'
  | 'subtract'
  | 'multiply'
  | 'divide'
  | 'power'
  | 'factorial'
  | 'error';

class ArithmeticOperator extends Node {
  value: ARITHMETIC_OPERATOR;
  type: NodeType;
  constructor(value: ARITHMETIC_OPERATOR) {
    super(value, 'OPERATOR');
    this.value = value;
    this.type = 'OPERATOR';
  }
}

function add(src: string): ArithmeticOperator | Fail {
  const res = plus.run(src);
  if (res.err) return new Fail('Error parsing addition.');
  return new ArithmeticOperator('add');
}

function sub(src: string): ArithmeticOperator | Fail {
  const res = minus.run(src);
  if (res.err) return new Fail('Error parsing subtraction.');
  return new ArithmeticOperator('subtract');
}
function mul(src: string): ArithmeticOperator | Fail {
  const res = star.run(src);
  if (res.err) return new Fail('Error parsing multiplication');
  return new ArithmeticOperator('multiply');
}
function div(src: string): ArithmeticOperator | Fail {
  const res = slash.run(src);
  if (res.err) return new Fail('Error parsing division.');
  return new ArithmeticOperator('divide');
}
function pow(src: string): ArithmeticOperator | Fail {
  const res = caret.run(src);
  if (res.err) return new Fail('Error parsing power.');
  return new ArithmeticOperator('power');
}
function fact(src: string): ArithmeticOperator | Fail {
  const res = bang.run(src);
  if (res.err) return new Fail('Error parsing factorial.');
  return new ArithmeticOperator('factorial');
}

/* ------------------------------- IDENTIFIER ------------------------------- */
class IdNode extends Node {
  constructor(id: string, value: any) {
    super(id, 'IDENTIFIER');
    this.value = [id, value];
    this.type = 'IDENTIFIER';
  }
  setBind(value: any) {
    this.value = value;
  }
}
const Reserved = new Map<string, IdNode>([
  ['pi', new IdNode('pi', Math.PI)],
  ['e', new IdNode('e', Math.E)],
  ['i', new IdNode('i', 'sqrt(-1)')],
  ['inf', new IdNode('inf', Infinity)],
]);

function idNode(s: string): IdNode | Fail {
  const identifier = word(
    skipSpace,
    letter.or(underscore),
    maybe(
      many(digit.or(letter).or(underscore)).map((d) => ({
        out: d.out.join(''),
      }))
    ),
    maybe(skipSpace)
  ).map((d) => ({
    out: d.out.join(''),
    type: 'identifier',
  }));
  const res = identifier.run(s);
  if (res.err) return new Fail('Error parsing identifier.');
  if (Reserved.has(res.out)) return Reserved.get(res.out) as IdNode;
  return new IdNode(res.out, null);
}

/* -------------------------------------------------------------------------- */
/*                                  BOOLEANS                                  */
/* -------------------------------------------------------------------------- */
class Bool extends Node {
  value: boolean;
  constructor(value: boolean) {
    super(value, 'BOOL');
    this.value = value;
  }
}
function boolTrue(s: string) {
  const res = parseTrue.run(s);
  if (res.err) return new Fail('Couldn’t parse [true]');
  return new Bool(true);
}

function boolFalse(s: string) {
  const res = parseFalse.run(s);
  if (res.err) return new Fail('Couldn’t parse [false]');
  return new Bool(false);
}

/* -------------------------------------------------------------------------- */
/*                                  NUMERICS                                  */
/* -------------------------------------------------------------------------- */
/**
 * The following functions relate to number values.
 */

class Numeric extends Node {
  constructor(value: number | [number, number], type: NodeType) {
    super(value, type);
    this.value = value;
    this.type = type;
  }
  get norm() {
    if (typeof this.value === 'number') return this.value;
    switch (this.type) {
      case 'DECIMAL':
      case 'INTEGER':
      case 'NATURAL':
      case 'REAL':
        return this.value;
      case 'RATIONAL':
        return this.value[0] / this.value[1];
      case 'SCIENTIFIC':
        return this.value[0] * 10 ** this.value[1];
    }
  }
  add(n: Numeric, to: NumberType = 'REAL') {
    const a = this.norm;
    const b = n.norm;
    const result = new Numeric(a + b, to);
    return result.to(to);
  }
  subtract(n: Numeric, to: NumberType = 'REAL') {
    const a = this.norm;
    const b = n.norm;
    const result = new Numeric(a - b, to);
    return result.to(to);
  }
  multiply(n: Numeric, to: NumberType = 'REAL') {
    if (n instanceof Rational && this instanceof Rational) {
      const n1 = this.value[0];
      const d1 = this.value[1];
      const n2 = n.value[0];
      const d2 = n.value[1];
      const N = n1 * n2;
      const D = d1 * d2;
      return new Rational([N, D]);
    }
    const a = this.norm;
    const b = this.norm;
    const result = new Numeric(a * b, to);
    return result.to(to);
  }
  divide(n: Numeric, to: NumberType = 'REAL') {
    if (n instanceof Rational && this instanceof Rational) {
      const n1 = this.value[0];
      const d1 = this.value[1];
      const n2 = n.value[0];
      const d2 = n.value[1];
      const N = n1 * d2;
      const D = d1 * n2;
      return new Rational([N, D]);
    }
    const a = this.norm;
    const b = n.norm;
    const result = new Numeric(a / b, to);
    return result.to(to);
  }
  power(n: Numeric, to: NumberType = 'REAL') {
    const a = this.norm;
    const b = n.norm;
    const result = new Numeric(a ** b, to);
    return result.to(to);
  }
  get string() {
    switch (this.type) {
      case 'DECIMAL':
      case 'NATURAL':
      case 'INTEGER':
      case 'REAL':
        return `${this.value}`;
      case 'SCIENTIFIC':
        return `${this.value.join('E')}`;
      case 'RATIONAL':
        return `${this.value[0]}/${this.value[1]}`;
    }
  }
  to(option: NumberType) {
    const val = this.value;
    switch (option) {
      case 'NATURAL':
      case 'INTEGER':
        return int(`${val | 0}`);
      case 'REAL':
        return new Numeric(val, 'REAL');
      case 'DECIMAL':
        return decimal(`${val}`);
      case 'SCIENTIFIC': {
        const res = val.toExponential().toString().replace(/e\+?/, 'E');
        return scientific(res);
      }
      case 'RATIONAL': {
        let n: number;
        let d: number;
        if (val === 0) {
          n = 0;
          d = 1;
          return this;
        }
        const a = Math.abs(val);
        n = 0;
        d = 1;
        let r: number;
        while (true) {
          r = n / d;
          if (Math.abs((r - a) / a) < 0.00001) break;
          if (r < a) n++;
          else d++;
        }
        n = val < 0 ? -n : n;
        d = d;
        return rational(`${n}/${d}`);
      }
      default:
        return new Fail('Invalid option.');
    }
  }
}

/* -------------------------------- NATURALS -------------------------------- */

class Natural extends Numeric {
  constructor(value: number) {
    super(value, 'NATURAL');
    this.value = value;
    this.type = 'NATURAL';
  }
}
export const natural = many(whole).map((d) => ({
  out: Number(d.out.join('')),
  type: 'natural',
}));

function nat(src: string): Natural | Fail {
  const res = parseNatural.parse(src);
  if (res.err) return new Fail('Error parsing natural.');
  return new Natural(Number(res.result));
}

log(nat('125'));

/* -------------------------------- INTEGERS -------------------------------- */

class Integer extends Numeric {
  constructor(value: number) {
    super(value, 'INTEGER');
    this.value = value;
    this.type = 'INTEGER';
  }
}

export const integer = word(
  maybe(minus),
  many(digit).map((d) => ({ out: Number(d.out.join('')) }))
).map((d) => ({
  out: Number(d.out.join('')),
  type: 'integer',
}));

function int(src: string): Integer | Fail {
  const res = integer.run(src);
  if (res.err) return new Fail('Error parsing integer.');
  return new Integer(res.out);
}

/* --------------------------------- DECIMAL -------------------------------- */
class Decimal extends Numeric {
  constructor(value: number) {
    super(value, 'DECIMAL');
    this.value = value;
    this.type = 'DECIMAL';
  }
}
const deci = word(
  maybe(minus),
  natural,
  dot,
  many(digit).map((d) => ({ out: d.out.join('') }))
).map((d) => ({ out: Number(d.out.join('')), type: 'decimal' }));
export { deci };

function decimal(src: string): Decimal | Fail {
  const res = deci.run(src);
  log(res);
  if (res.err) return new Fail('Couldn’t parse decimal.');
  return new Decimal(res.out);
}

export { decimal };

/* -------------------------------- RATIONAL -------------------------------- */
class Rational extends Numeric {
  constructor(value: [number, number]) {
    super(value, 'RATIONAL');
    this.value = value;
    this.type = 'RATIONAL';
  }
}
const ratio = word(integer, slash, integer).map((d) => ({
  out: { n: Number(d.out[0]), d: Number(d.out[2]) },
  type: 'rational',
}));
export { ratio };

function rational(s: string): Rational | Fail {
  const res = ratio.run(s);
  if (res.err) return new Fail('Couldn’t parse rational.');
  return new Rational([res.out.n, res.out.d]);
}
export { rational };

/* ------------------------------- SCIENTIFIC ------------------------------- */
class Scientific extends Numeric {
  constructor(value: [number, number]) {
    super(value, 'SCIENTIFIC');
    this.value = value;
    this.type = 'SCIENTIFIC';
  }
  coefficient() {
    return this.value[0];
  }
  mantissa() {
    return this.value[1];
  }
}
const real = choice(deci, integer);
const parseScientific = word(real, an('E'), real);

function scientific(s: string): Scientific | Fail {
  const res = parseScientific.run(s);
  if (res.err) return new Fail('Couldn’t parse scientific.');
  return new Scientific([Number(res.out[0]), Number(res.out[2])]);
}

/* -------------------------------------------------------------------------- */
/*                              EXPRESSION PARSER                             */
/* -------------------------------------------------------------------------- */

// digits
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

// punctuation
const period = lit('.');
const dash = lit('-');

// natural number
const parseNatural = union(
  one.or(two).or(three).or(four).or(five).or(six).or(seven).or(eight).or(nine)
).or(zero);

// integer
const parseInteger = parseNatural.or(chain(dash, parseNatural));



class Algebra {
  start: number;
  end: number;
  length: number;
  src: string;
  constructor() {
    this.start = 0;
    this.end = 0;
    this.length = 0;
  }
  parse(src: string) {
    this.src = src;
    this.length = src.length;
    this.end = src.length;
    return this.parseNatural();
  }
  get hasChars() {
    return this.start < this.length;
  }
  get token() {
    return this.src.slice(this.start, this.end);
  }
  parseNatural() {
    const p = parseNatural.parse(this.token);
    if (p instanceof Failure) return new Fail('Error parsing natural.');
    this.start = p.end;
    return new Natural(Number(p.result));
  }
}

const algebra = new Algebra();
log(algebra.parse('128'));
