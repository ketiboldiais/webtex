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
} from '../prat/index.js';
import { log } from '../utils/index.js';
import { display } from '../utils/index.js';

/* -------------------------------------------------------------------------- */
/*                                    NODES                                   */
/* -------------------------------------------------------------------------- */
type Delimiter = '(' | ')' | '{' | '}' | '[' | ']';
type NumberType =
  | 'natural'
  | 'integer'
  | 'scientific'
  | 'rational'
  | 'real'
  | 'inf';
type RelOp = '<' | '>' | '<=' | '>=' | '=' | '==' | '!=';
type EqOp = Extract<RelOp, '=' | '=='>;
type IneqOp = Exclude<RelOp, '=' | '=='>;
type LogicOp = 'and' | 'or' | 'not' | 'xor' | 'xnor' | 'nand' | 'nor';
type BinaryLogicOp = Exclude<LogicOp, 'not'>;
type BinaryOp = '+' | '-' | '*' | '/' | '^' | RelOp | BinaryLogicOp;
type UnaryPostfixOp = '!' | Extract<LogicOp, 'not'>;
type UnaryPrefixOp = Extract<LogicOp, 'not'>;
type AssignOp = ':=';
type Operator = BinaryOp | UnaryPostfixOp | AssignOp;
type NodeType =
  | 'ERROR'
  | 'program'
  | 'expression-list'
  | 'assignment-expression'
  | 'binary-expression'
  | 'logical-binary-expression'
  | 'logical-unary-expression'
  | 'logical-and-expression'
  | 'logical-or-expression'
  | 'logical-not-expression'
  | 'logical-xor-expression'
  | 'logical-xnor-expression'
  | 'logical-nand-expression'
  | 'logical-nor-expression'
  | 'equation'
  | 'block'
  | 'inequation'
  | 'unary-postfix-expression'
  | 'factorial-expression'
  | 'operator'
  | 'identifier'
  | 'null'
  | 'boolean'
  | 'function-definition'
  | NumberType
  | Punct
  | Delimiter
  | Keyword
  | Operator;

type Keyword = 'let' | 'const' | 'var' | 'return';
type Punct = ';' | ',';
type WhiteSpace = 'space' | 'newline' | 'tab' | 'enter';

class Node {
  type: NodeType;
  value: any;
  constructor(value: any, type: NodeType) {
    this.value = value;
    this.type = type;
  }
  get latex() {
    return `${this.value}`;
  }
}

class Fail extends Node {
  value: string;
  constructor(message: string) {
    super(message, 'ERROR');
    this.type = 'ERROR';
    this.value = `Error | ${message}`;
  }
  get latex() {
    return `\\text{${this.value}}`;
  }
}

/* -------------------------------------------------------------------------- */
/*                                   PARSERS                                  */
/* -------------------------------------------------------------------------- */
// whitespace
const space = lit(' ').type<WhiteSpace>('space');
const newline = lit('\n').type<WhiteSpace>('newline');
const tab = lit('\t').type<WhiteSpace>('tab');
const enter = lit('\r').type<WhiteSpace>('enter');
const whitespace = repeat(space.or(newline).or(tab).or(enter));

// keywords
const keyword_let = glyph(lit('let')).type<Keyword>('let');
const keyword_const = glyph(lit('const')).type<Keyword>('const');
const keyword_var = glyph(lit('var')).type<Keyword>('var');
const keyword_return = glyph(lit('return')).type<Keyword>('return');

// delimiter
const lparen = glyph(lit('(')).type<Delimiter>('(');
const rparen = glyph(lit(')')).type<Delimiter>(')');
const lbrace = glyph(lit('{')).type<Delimiter>('{');
const rbrace = glyph(lit('}')).type<Delimiter>('}');
const lbracket = glyph(lit('[')).type<Delimiter>('[');
const rbracket = glyph(lit(']')).type<Delimiter>(']');

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
const dot = lit('.');
const dash = lit('-');
const underscore = lit('_');
const fslash = lit('/');
const semicolon = glyph(lit(';')).type<Punct>(';');
const comma = glyph(lit(',')).type<Punct>(',');

// operators
const minus = glyph(lit('-')).type<BinaryOp>('-');
const divide = glyph(lit('/')).type<BinaryOp>('/');
const add = glyph(lit('+')).type<BinaryOp>('+');
const multiply = glyph(lit('*')).type<BinaryOp>('*');
const power = glyph(lit('^')).type<BinaryOp>('^');
const fact = glyph(lit('!')).type<UnaryPostfixOp>('!');
const binop = oneof(minus, divide, add, multiply, power, fact);

// assignment operator
const assignOp = glyph(lit(':=')).type<AssignOp>(':=');

// boolean operators
const and = glyph(lit('and')).type<LogicOp>('and');
const not = glyph(lit('not')).type<LogicOp>('not');
const or = glyph(lit('or')).type<LogicOp>('or');
const xor = glyph(lit('xor')).type<LogicOp>('xor');
const xnor = glyph(lit('xnor')).type<LogicOp>('xnor');
const nor = glyph(lit('nor')).type<LogicOp>('nor');
const nand = glyph(lit('nand')).type<LogicOp>('nand');

// comparison operators
// equality operators
const EQ = glyph(lit('=')).type<RelOp>('=');
const DEQ = glyph(lit('==')).type<RelOp>('==');
const eqop = oneof(DEQ, EQ);

// inequality operators
const NEQ = glyph(lit('!=')).type<RelOp>('!=');
const LT = glyph(lit('<')).type<RelOp>('<');
const GT = glyph(lit('>')).type<RelOp>('>');
const LTE = glyph(lit('<=')).type<RelOp>('<=');
const GTE = glyph(lit('>=')).type<RelOp>('>=');
const ineqop = oneof(LTE, GTE, NEQ, LT, GT);

// booleans
const pTrue = glyph(lit('true')).type('true');
const pFalse = glyph(lit('false')).type('false');
const pBool = oneof(pTrue, pFalse);

// identifiers
const digits = strung('digits');
const identifier = glyph(
  chain(maybe(underscore), strung('letters'), maybe(digits))
).type('identifier');

// natural number
const natural = many(one, two, three, four, five, six, seven, eight, nine)
  .maybe(zero)
  .type<NumberType>('natural');

// integer
const negint = chain(dash, natural).type<NumberType>('integer');
const int = natural.or(negint).type<NumberType>('integer');

// real
const real = chain(int, dot, natural).type<NumberType>('real').or(int);

// rational
const rational = chain(real.or(int), fslash, real.or(int)).type<NumberType>(
  'rational'
);

// scientific
const scientific = chain(real, letter.E, real).type<NumberType>('scientific');

// number parser
const number = oneof(scientific, rational, real, int);

class Prog extends Node {
  value: Node[];
  type: NodeType;
  constructor(value: Node[]) {
    super(value, 'program');
    this.value = value;
    this.type = 'program';
  }
}

class Block extends Node {
  value: Node[];
  type: NodeType;
  constructor(value: Node[]) {
    super(value, 'block');
    this.value = value;
    this.type = 'block';
  }
}
class Nil extends Node {
  constructor() {
    super(null, 'null');
    this.value = null;
    this.type = 'null';
  }
}

class Fun extends Node {
  value: { name: Id; params: Id[]; body: Block | Node };
  type: NodeType;
  constructor(name: Id, params: Id[], body: Block | Node) {
    super({ name, params, body }, 'function-definition');
    this.value = { name, params, body };
    this.type = 'function-definition';
  }
}
class Id extends Node {
  value: string;
  constructor(value: string) {
    super(value, 'identifier');
    this.value = value;
    this.type = 'identifier';
  }
}

class Constant extends Node {
  value: [Id, Node];
  constructor(value: [Id, Node]) {
    super(value, 'const');
    this.value = value;
    this.type = 'const';
  }
}

class Variable extends Node {
  value: [Id, Node];
  constructor(value: [Id, Node]) {
    super(value, 'var');
    this.value = value;
    this.type = 'var';
  }
}
class Numeric extends Node {
  value: number | [number, number];
  type: NumberType;
  constructor(value: number | [number, number], type: NumberType) {
    super(value, type);
    this.value = value;
    this.type = type;
  }
  get norm() {
    switch (this.type) {
      case 'integer':
      case 'natural':
      case 'real':
        return this.value;
      case 'rational':
        return (
          (this.value as [number, number])[0] /
          (this.value as [number, number])[1]
        );
      case 'scientific':
        return (
          (this.value as [number, number])[0] *
          10 ** (this.value as [number, number])[1]
        );
      default:
        return Infinity;
    }
  }
}

class BinaryExpr extends Node {
  type: NodeType;
  value: { left: Node; op: BinaryOp; right: Node };
  constructor(left: Node, op: BinaryOp, right: Node) {
    super({ left, op, right }, 'binary-expression');
    this.type = 'binary-expression';
    this.value = { left, op, right };
  }
  get latex() {
    return `{ {${this.value.left.latex}} {${this.value.op}} {${this.value.right.latex}} }`;
  }
}

class AndExpr extends BinaryExpr {
  type: NodeType;
  value: { left: Node; op: BinaryLogicOp; right: Node };
  constructor(left: Node, op: BinaryLogicOp, right: Node) {
    super(left, op, right);
    this.type = 'logical-and-expression';
    this.value = { left, op, right };
  }
  get latex() {
    return `{ {${this.value.left.latex}} {\\land} {${this.value.right.latex}} }`;
  }
}

class OrExpr extends BinaryExpr {
  type: NodeType;
  value: { left: Node; op: BinaryLogicOp; right: Node };
  constructor(left: Node, op: BinaryLogicOp, right: Node) {
    super(left, op, right);
    this.type = 'logical-or-expression';
    this.value = { left, op, right };
  }
  get latex() {
    return `{ {${this.value.left.latex}} {\\lor} {${this.value.right.latex}} }`;
  }
}

class XorExpr extends BinaryExpr {
  type: NodeType;
  value: { left: Node; op: BinaryLogicOp; right: Node };
  constructor(left: Node, op: BinaryLogicOp, right: Node) {
    super(left, op, right);
    this.type = 'logical-xor-expression';
    this.value = { left, op, right };
  }
  get latex() {
    return `{ {${this.value.left.latex}} {\\veebar} {${this.value.right.latex}} }`;
  }
}

class XnorExpr extends BinaryExpr {
  type: NodeType;
  value: { left: Node; op: BinaryLogicOp; right: Node };
  constructor(left: Node, op: BinaryLogicOp, right: Node) {
    super(left, op, right);
    this.type = 'logical-xor-expression';
    this.value = { left, op, right };
  }
  get latex() {
    return `{ {${this.value.left.latex}} {\\odot} {${this.value.right.latex}} }`;
  }
}

class NandExpr extends BinaryExpr {
  type: NodeType;
  value: { left: Node; op: BinaryLogicOp; right: Node };
  constructor(left: Node, op: BinaryLogicOp, right: Node) {
    super(left, op, right);
    this.type = 'logical-xor-expression';
    this.value = { left, op, right };
  }
  get latex() {
    return `{ {${this.value.left.latex}} {\\overline{\\land}} {${this.value.right.latex}} }`;
  }
}

class NorExpr extends BinaryExpr {
  type: NodeType;
  value: { left: Node; op: BinaryLogicOp; right: Node };
  constructor(left: Node, op: BinaryLogicOp, right: Node) {
    super(left, op, right);
    this.type = 'logical-nor-expression';
    this.value = { left, op, right };
  }
  get latex() {
    return `{ {${this.value.left.latex}} {\\overline{\\lor}} {${this.value.right.latex}} }`;
  }
}

class Equation extends BinaryExpr {
  type: NodeType;
  value: { left: Node; op: EqOp; right: Node };
  constructor(left: Node, op: EqOp, right: Node) {
    super(left, op, right);
    this.type = 'equation';
    this.value = { left, op, right };
  }
  get latex() {
    return `{${this.value.left.latex}} {${this.value.op}} {${this.value.right.latex}}`;
  }
}

class Inequation extends BinaryExpr {
  type: NodeType;
  value: { left: Node; op: IneqOp; right: Node };
  constructor(left: Node, op: IneqOp, right: Node) {
    super(left, op, right);
    this.type = 'inequation';
    this.value = { left, op, right };
  }
  get latex() {
    return `{ {${this.value.left.latex}} {${this.value.op}} {${this.value.right.latex}} }`;
  }
}

class UnaryPostfixExpr extends Node {
  type: NodeType;
  value: { arg: Node; op: UnaryPostfixOp };
  constructor(arg: Node, op: UnaryPostfixOp) {
    super({ arg, op }, 'unary-postfix-expression');
    this.type = 'unary-postfix-expression';
    this.value = { arg, op };
  }
  get latex() {
    return `{ {${this.value.arg}} {${this.value.op}} }`;
  }
}

class NotExpr extends Node {
  type: NodeType;
  value: { arg: Node; op: UnaryPrefixOp };
  constructor(arg: Node, op: UnaryPrefixOp) {
    super({ arg, op }, 'logical-unary-expression');
    this.type = 'logical-unary-expression';
    this.value = { arg, op };
  }
  get latex() {
    return `{ {\\neg} {${this.value.arg.latex}}  }`;
  }
}

class FactorialExpression extends UnaryPostfixExpr {
  type: NodeType;
  value: { arg: Node; op: UnaryPostfixOp };
  constructor(arg: Node, op: UnaryPostfixOp) {
    super(arg, op);
    this.type = 'factorial-expression';
    this.value = { arg, op };
  }
  get latex() {
    return `{ {${this.value.arg}} {${this.value.op}} }`;
  }
}

class Bool extends Node {
  type: NodeType;
  value: boolean;
  constructor(value: boolean) {
    super(value, 'boolean');
    this.value = value;
    this.type = 'boolean';
  }
  get latex() {
    return this.value ? `\\top` : `\\bot`;
  }
}

class Inf extends Numeric {
  constructor() {
    super(Infinity, 'inf');
    this.value = Infinity;
    this.type = 'inf';
  }
  get latex() {
    return `\\infty`;
  }
}

class Rational extends Numeric {
  value: [number, number];
  type: NumberType;
  constructor(value: [number, number]) {
    super(value, 'rational');
    this.value = value;
    this.type = 'rational';
  }
  get latex() {
    return `\\frac{${this.value[0]}}{${this.value[1]}}`;
  }
}

class Integer extends Numeric {
  value: number;
  type: NumberType;
  constructor(value: number) {
    super(value, 'integer');
    this.value = value;
    this.type = 'integer';
  }
  get latex() {
    return `${this.value}`;
  }
}

class Real extends Numeric {
  value: number;
  type: NumberType;
  constructor(value: number) {
    super(value, 'real');
    this.value = value;
    this.type = 'real';
  }
  get latex() {
    return `${this.value}`;
  }
}

class Natural extends Numeric {
  value: number;
  type: NumberType;
  constructor(value: number) {
    super(value, 'natural');
    this.value = value;
    this.type = 'natural';
  }
  get latex() {
    return `${this.value}`;
  }
}

class Scientific extends Numeric {
  value: [number, number];
  type: NumberType;
  constructor(value: [number, number]) {
    super(value, 'scientific');
    this.value = value;
    this.type = 'scientific';
  }
  get latex() {
    return `{ {${this.value[0]}} {\\times} {10^${this.value[1]}} }`;
  }
}

/* -------------------------------------------------------------------------- */
/*                              EXPRESSION PARSER                             */
/* -------------------------------------------------------------------------- */

class Algebra {
  lastStart: number;
  lastEnd: number;
  start: number;
  end: number;
  length: number;
  src: string;
  error: null | Fail;
  nil: Nil;
  constructor() {
    this.lastStart = 0;
    this.lastEnd = 0;
    this.start = 0;
    this.end = 0;
    this.length = 0;
    this.error = null;
    this.src = '';
    this.nil = new Nil();
  }
  parse(src: string) {
    this.src = src.trimStart().trimEnd();
    this.length = this.src.length;
    this.end = this.src.length;
    return this.parseProg();
  }

  private parseProg() {
    let body: Node[] = [];
    while (this.hasChars) {
      body.push(this.parseStmt());
      if (this.error) return this.error;
    }
    return new Prog(body);
  }

  private parseStmt(): Node {
    const res = oneof(
      lbrace,
      keyword_const,
      keyword_var,
      keyword_let,
      keyword_return
    ).run(this.peek);
    switch (res.type) {
      case 'let':
        return this.parseFn();
      case 'var':
      case 'const':
        return this.parseDecl();
      case 'return': {
        let out = this.parseReturn();
        if (out !== null) return out;
      }
      case '{':
        return this.parseBlock(res.end);
      default:
        return this.parseExprStmt();
    }
  }

  private parseFn(): Node {
    this.eat('let', keyword_let, 'Expected keyword “let”');
    const name = identifier.run(this.peek);
    if (name.err) {
      this.error = new Fail(
        'Function names must start with a letter or underscore, followed by letters, digits, or underscores.'
      );
      return this.error;
    }
    this.advance(name.end);
    this.eat('(', lparen, 'Expected a “(” to open the parameter list.');
    const params = this.parseParamList();
    this.eat(')', rparen, 'Expected a “)” to close the parameter list.');
    this.eat(':=', assignOp, 'Invalid function assignment operator');
    const res = lbrace.run(this.peek);
    let body: Node;
    if (res.type === '{') {
      body = this.parseBlock(res.end);
      return new Fun(new Id(name.result), params, body);
    }
    body = this.parseExprStmt();
    return new Fun(new Id(name.result), params, body);
  }

  private parseParamList(): Id[] {
    const params: Id[] = [];
    do {
      const res = identifier.run(this.peek);
      if (!res.err) {
        this.advance(res.end);
        params.push(new Id(res.result));
      } else break;
    } while (this.match([',', comma]) && this.hasChars);
    return params;
  }

  private parseReturn() {
    const out = this.match(['return', keyword_return]);
    if (out === null) return null;
    if (!this.match([';', semicolon])) {
      return this.parseExprStmt();
    }
    return null;
  }

  private parseBlock(n: number): Node {
    this.advance(n);
    const statements: Node[] = [];
    while (this.check('}', rbrace) === null && this.hasChars) {
      statements.push(this.parseDecl());
    }
    this.eat('}', rbrace, 'expect “}” after block.');
    return new Block(statements);
  }

  parseDecl() {
    if (this.match(['var', keyword_var])) {
      return this.parseVar();
    }
    if (this.match(['const', keyword_const])) {
      return this.parseConst();
    }
    return this.parseStmt();
  }

  private parseConst(): Node {
    return this.parseId(true);
  }
  private parseVar(): Node {
    return this.parseId(false);
  }
  private parseId(isConstant: boolean): Node {
    let name = identifier.run(this.peek);
    if (name.err) {
      this.error = new Fail(
        'Identifiers must start with a letter or underscore, followed by digits, letters, or underscores.'
      );
      return this.error;
    }
    this.advance(name.end);
    let init = this.nil;
    if (this.match([':=', assignOp])) {
      init = this.parseExprStmt();
      return isConstant
        ? init instanceof Fail
          ? new Fail('constants must be initialized inline')
          : new Constant([new Id(name.result), init])
        : new Variable([new Id(name.result), init]);
    }
    this.error = new Fail('invalid assignment operator');
    return this.error;
  }

  private parseExprStmt(): Node {
    let expr = this.parseExpr();
    this.eat(';', semicolon, 'Expected a “;” after the expression.');
    return expr;
  }

  private parseExpr() {
    const res = whitespace.run(this.peek);
    if (!res.err) {
      this.savePrev(res.end);
      this.advance(res.end);
    }
    return this.pNOT();
  }

  private pNOT() {
    let expr: Node = this.pAND();
    let res = this.match(['not', not]);
    while (res !== null) {
      let op = this.tryParse(this.previous, not) as UnaryPrefixOp;
      let out = this.pAND();
      expr = new NotExpr(out, op);
      res = this.match(['not', not]);
    }
    return expr;
  }

  private pAND() {
    let expr: Node = this.pOR();
    let res = this.match(['and', and]);
    while (res !== null) {
      let op = this.tryParse(this.previous, and) as BinaryLogicOp;
      let right = this.pOR();
      expr = new AndExpr(expr, op, right);
      res = this.match(['and', and]);
    }
    return expr;
  }

  private pOR() {
    let expr: Node = this.pNAND();
    let res = this.match(['or', or]);
    while (res !== null) {
      let op = this.tryParse(this.previous, or) as BinaryLogicOp;
      let right = this.pNAND();
      expr = new OrExpr(expr, op, right);
      res = this.match(['or', or]);
    }
    return expr;
  }

  private pNAND() {
    let expr: Node = this.pNOR();
    let res = this.match(['nand', nand]);
    while (res !== null) {
      let op = this.tryParse(this.previous, nand) as BinaryLogicOp;
      let right = this.pNOR();
      expr = new NandExpr(expr, op, right);
      res = this.match(['nand', nand]);
    }
    return expr;
  }

  private pNOR() {
    let expr: Node = this.pXOR();
    let res = this.match(['nor', nor]);
    while (res !== null) {
      let op = this.tryParse(this.previous, nor) as BinaryLogicOp;
      let right = this.pXOR();
      expr = new NorExpr(expr, op, right);
      res = this.match(['nor', nor]);
    }
    return expr;
  }

  private pXOR() {
    let expr: Node = this.pXNOR();
    let res = this.match(['xor', xor]);
    while (res !== null) {
      let op = this.tryParse(this.previous, xor) as BinaryLogicOp;
      let right = this.pXNOR();
      expr = new XorExpr(expr, op, right);
      res = this.match(['xor', xor]);
    }
    return expr;
  }

  private pXNOR() {
    let expr: Node = this.parseEquation();
    let res = this.match(['xnor', xnor]);
    while (res !== null) {
      let op = this.tryParse(this.previous, xnor) as BinaryLogicOp;
      let right = this.parseEquation();
      expr = new XnorExpr(expr, op, right);
      res = this.match(['xnor', xnor]);
    }
    return expr;
  }

  private parseEquation() {
    let expr: Node = this.parseInequation();
    let res = this.match(['=', EQ], ['==', DEQ]);
    while (res !== null) {
      let op = this.tryParse(this.previous, eqop) as EqOp;
      let right = this.parseInequation();
      expr = new Equation(expr, op, right);
      res = this.match(['=', EQ], ['==', DEQ]);
    }
    return expr;
  }

  private parseInequation() {
    let expr: Node = this.parseTerm();
    let res = this.match(
      ['<=', LTE],
      ['>=', GTE],
      ['!=', NEQ],
      ['<', LT],
      ['>', GT]
    );
    while (res !== null) {
      let op = this.tryParse(this.previous, ineqop) as IneqOp;
      let right = this.parseTerm();
      expr = new Inequation(expr, op, right);
      res = this.match(
        ['<=', LTE],
        ['>=', GTE],
        ['!=', NEQ],
        ['<', LT],
        ['>', GT]
      );
    }
    return expr;
  }

  private parseTerm(): BinaryExpr | Node {
    let expr: Node = this.parseFactor();
    let res = this.match(['+', add], ['-', minus]);
    while (res !== null) {
      let op = this.tryParse(this.previous, binop) as BinaryOp;
      let right = this.parseFactor();
      expr = new BinaryExpr(expr, op, right);
      res = this.match(['+', add], ['-', minus]);
    }
    return expr;
  }

  private parseFactor(): BinaryExpr | Node {
    let expr: Node = this.parsePower();
    let res = this.match(['*', multiply], ['/', divide]);
    while (res !== null) {
      let op = this.tryParse(this.previous, binop) as BinaryOp;
      let right = this.parsePower();
      expr = new BinaryExpr(expr, op, right);
      res = this.match(['*', multiply], ['/', divide]);
    }
    return expr;
  }

  private parsePower(): BinaryExpr | Node {
    let expr: Node = this.parseFactorial();
    let res = this.match(['^', power]);
    while (res !== null) {
      let op = this.tryParse(this.previous, binop) as BinaryOp;
      let right = this.parseFactorial();
      expr = new BinaryExpr(expr, op, right);
      res = this.match(['^', power]);
    }
    return expr;
  }

  private parseFactorial(): UnaryPostfixExpr | Node {
    let expr: Node = this.parseLiteral();
    let res = this.match(['!', fact]);
    while (res !== null) {
      let op = this.tryParse(this.previous, binop) as UnaryPostfixOp;
      expr = new FactorialExpression(expr, op);
      res = this.match(['!', fact]);
    }
    return expr;
  }

  private parseLiteral() {
    if (this.match(['(', lparen])) {
      let expr = this.parseExpr();
      this.eat(')', rparen, 'expected right paren');
      if (this.error) return this.error;
      return expr;
    }
    return this.parsePrimary();
  }

  private parsePrimary() {
    const res = oneof(number, pBool, identifier).run(this.peek);
    this.savePrev(res.end);
    this.advance(res.end);
    switch (res.type) {
      case 'identifier':
        return new Id(res.result);
      case 'true':
        return new Bool(true);
      case 'false':
        return new Bool(false);
      case 'scientific':
        return new Scientific([
          Number(res.children[0].result),
          Number(res.children[2].result),
        ]);
      case 'rational':
        return new Rational([
          Number(res.children[0].result),
          Number(res.children[2].result),
        ]);
      case 'real':
        return new Real(Number(res.result));
      case 'integer':
        return new Integer(Number(res.result));
      case 'natural':
        return new Natural(Number(res.result));
      default: {
        this.error = new Fail('Error parsing number. Returning infinity.');
        return new Inf();
      }
    }
  }

  // private parseBool() {
  // const res = pBool.run(this.peek);
  // this.savePrev(res.end);
  // this.advance(res.end);
  // switch (res.type) {
  // case 'true':
  // return new Bool(true);
  // case 'false':
  // return new Bool(false);
  // default:
  // return this.parseNumber();
  // }
  // }

  // private parseNumber(): Numeric {
  // const res = number.run(this.peek);
  // this.savePrev(res.end);
  // this.advance(res.end);
  // switch (res.type) {
  // }
  // }

  private tryParse<T>(src: string, parser: P<T>): T {
    return parser.run(src).type as unknown as T;
  }

  private eat(type: NodeType, parser: P<any>, erm: string) {
    const res = this.check(type, parser);
    if (res !== null) {
      this.advance(res.end);
      return true;
    } else {
      this.error = new Fail(erm);
      return false;
    }
  }

  private match<T>(...conds: [NodeType, P<T>][]) {
    for (let i = 0; i < conds.length; i++) {
      let res = this.check(conds[i][0], conds[i][1]);
      if (res !== null) {
        this.savePrev(res.end);
        this.advance(res.end);
        return res;
      }
    }
    return null;
  }

  private check<T>(type: NodeType, parser: P<T>) {
    if (!this.hasChars) return null;
    const out = parser.run(this.peek);
    if (out.err || out.type !== type) return null;
    return out;
  }

  private savePrev(end: number) {
    this.lastStart = this.start;
    this.lastEnd = this.start + end;
  }

  private advance(end: number) {
    if (this.hasChars) this.start = this.start + end;
  }

  private get hasChars() {
    return this.start < this.length;
  }

  private get previous() {
    return this.src.slice(this.lastStart, this.lastEnd);
  }

  private get peek() {
    return this.src.slice(this.start, this.end);
  }
}

const algebra = new Algebra();
const input = `
let f(x,y) := {
	var j := 10;
	var k := 12;
	x * y * j * k;
}
`;
const res = algebra.parse(input);
// log(algebra)
// log(res.latex);
display(res);
