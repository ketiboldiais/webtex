import { Data, oneof, P } from '../pkt/index.js';

// prettier-ignore
import {
  lbrace, rem, keyword_const, keyword_var, keyword_let, keyword_return, identifier, lparen, rparen, assignOp, comma, semicolon, rbracket, rbrace, whitespace, pnot, and, or, nand, nor, xor, xnor, EQ, DEQ, eqop, LTE, GTE, NEQ, LT, GT, ineqop, add, minus, binop, imul, multiply, divide, quot, mod, power, fact, concat, revcat, number, pBool, str, lbracket, keyword_set, keyword_alg, dist, keyword_struct, colon, } from './parsers.js';
// prettier-ignore
import {
  NodeType, ErrorType, NumberType, BinaryMathOp, BinaryStringOp, BinaryLogicOp, EqOp, IneqOp, UnaryLogicOp, UnaryMathOp,
} from './types.js';
// prettier-ignore
import {
  Node, Rot, Id, Nil, Prog, AlgebraicExpression, StructNode, SetVal, node} from './nodes/index.js';
import { Environment } from './environment.js';
import {display} from '../utils/index.js';

class Prex {
  #transpileFunctions: boolean;
  private lastStart: number;
  private lastEnd: number;
  private start: number;
  private end: number;
  private length: number;
  private src: string;
  private compileError: null | Rot;
  private runtimeError: null | Rot;
  private nil: Nil;
  private env: Environment;
  prog: Prog | Rot | null;
  constructor() {
    this.lastStart = 0;
    this.lastEnd = 0;
    this.start = 0;
    this.end = 0;
    this.length = 0;
    this.compileError = null;
    this.runtimeError = null;
    this.src = '';
    this.nil = new Nil();
    this.prog = null;
    this.env = new Environment();
  }
  private init(src: string) {
    this.src = src.trimStart().trimEnd();
    this.length = this.src.length;
    if (this.src[this.length - 1] !== ';') {
      this.src += ';';
      this.length++;
    }
    this.end = this.length;
  }

  parse(src: string) {
    this.init(src);
    this.prog = this.pProg();
    return this;
  }

  /**
   * Parses a program. A program
   * is defined as an array of
   * statements, to be interpreted
   * in sequence.
   */
  private pProg(): Prog | Rot {
    let body: Node[] = [];
    while (this.hasChars) {
      body.push(this.pStmt());
      if (this.compileError) return this.compileError;
    }
    return node.prog(body);
  }

  private pStmt(): Node {
    const res = oneof(
      lbrace,
      keyword_const,
      keyword_var,
      keyword_set,
      keyword_let,
      keyword_alg,
      keyword_struct,
      keyword_return
    ).run(this.peek);
    switch (res.type) {
      case 'let':
        return this.pFunction();
      case 'alg':
        this.advance(res.end);
        return this.pAlgebra();
      case 'set':
        this.advance(res.end);
        return this.pSet();
      case 'struct':
        this.advance(res.end);
        return this.pStruct();
      case 'var':
      case 'const':
        return this.pDeclare();
      case 'return': {
        let out = this.pReturn();
        if (out !== null) return out;
      }
      case '{':
        return this.pBlock(res.end);
      default:
        return this.pExprStmt();
    }
  }

  // private transpileFunction(
  // name: Data<'identifier'>,
  // body: Node | Node[],
  // params: Id[]
  // ) {
  // let ret = ['return'];
  // const read = (N: Node | Node[]) => {
  // if (node.is.nodeArray(N)) {
  // for (let i = 0; i < N.length; i++) {
  // read(N[i]);
  // }
  // }
  // if (node.is.numeric(N)) ret.push(`${N.norm}`);
  // if (node.is.binary.expression(N)) {
  // ret.push('(');
  // read(N.left);
  // ret.push(N.op);
  // read(N.right);
  // ret.push(')');
  // }
  // if (node.is.id(N)) {
  // ret.push(N.value);
  // }
  // return N;
  // };
  // const _args = params.map((d) => d.value);
  // read(body);
  // _args.push(ret.join(' '));
  // this.transpiled.set(name.result, new Function(..._args));
  // }

  /**
   * Parses a function. Functions are declared with the keyword
   * `let`.
   * @example
   * ~~~
   * let f(x) := 2^x;
   * ~~~
   */
  private pFunction(): Node {
    this.eat('let', keyword_let, 'Expected keyword ???let???.');
    const name = identifier.run(this.peek);
    if (name.err) {
      this.croak('Invalid function name.');
    }
    this.env.recordFunctionName(name.result);
    this.advance(name.end);
    this.eat('(', lparen, 'Expected a ???(??? to open the parameter list.');
    const params = this.pParam();
    this.eat(')', rparen, 'Expected a ???)??? to close the parameter list.');
    this.eat(':=', assignOp, 'Invalid function assignment operator');
    const res = lbrace.run(this.peek);
    let body: Node;
    if (res.type === '{') {
      body = this.pBlock(res.end);
      return node.fn(name.result, params, body);
    }
    body = this.pExprStmt();
    // if (this.#transpileFunctions) {
    // this.transpileFunction(name, body, params);
    // }
    return node.fn(name.result, params, body);
  }

  public algebra(src: string): AlgebraicExpression {
    this.init(src);
    let algx = node.algebra(node.id(''), []);
    const res = this.pExprStmt();
    do {
      algx.push(res);
    } while (this.match([',', comma]) && this.hasChars);
    this.match([';', semicolon]);
    const fn = (N: Node) => {
      if (node.is.id(N)) algx.addParam(N);
      if (node.is.binary.expression(N)) {
        fn(N.left);
        fn(N.right);
      }
      return N.value;
    };
    for (let i = 0; i < algx.value.body.length; i++) {
      fn(algx.value.body[i]);
    }
    return algx;
  }

  private pAlgebra(): Node {
    const name = this.pName();
    if (this.compileError) return name;
    let algx = node.algebra(name, []);
    this.eat('{', lbrace, 'Expected ???{??? to open the set.');
    do {
      const res = this.pExprStmt();
      algx.push(res);
    } while (this.match([',', comma]) && this.hasChars);
    this.eat('}', rbrace, 'Expected ???}??? to close the algebraic expression.');
    if (this.check(';', semicolon)) this.match([';', semicolon]);
    let dupe: Node | null = null;

    // recursively add parameters
    const fn = (N: Node) => {
      if (dupe) return dupe;
      if (node.is.id(N)) {
        if (N.value === name.value) dupe = N;
        algx.addParam(N);
      }
      if (node.is.binary.expression(N)) {
        fn(N.left);
        fn(N.right);
      }

      return N.value;
    };

    for (let i = 0; i < algx.value.body.length; i++) {
      fn(algx.value.body[i]);
      if (dupe) {
        this.croak(
          `Expression variables must be different from the expression???s identifier. Found ???${
            (dupe as Id).value
          }???, and the expression is named ???${(dupe as Id).value}???.`
        );
        return this.compileError as unknown as Node;
      }
    }
    return algx;
  }

  // ?? - pParam
  private pParam(): Id[] {
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

  /**
   * Parses a call expression.
   * @example
   * ~~~
   * let f(x) := x^2;
   * const n := f(5); // 25
   * ~~~
   */
  private pCall(name: string): Node {
    this.eat('(', lparen, 'expected ???(??? to open the argument list.');
    const args: Node[] = [];
    do {
      const res = this.pExpr();
      args.push(res);
    } while (this.match([',', comma]) && this.hasChars);
    this.eat(')', rparen, `expected ???)??? to close the argument list.`);
    return node.call(args, name);
  }

  // ?? - pReturn
  private pReturn(): null | ReturnType<typeof this.pExprStmt> {
    const out = this.match(['return', keyword_return]);
    if (out === null) return null;
    if (!this.match([';', semicolon])) {
      return this.pExprStmt();
    }
    return null;
  }

  /**
   * Parses a `struct`.
   * @example
   * ~~~~~
   * struct apple {
   *   x: 5,
   *   y: 10
   * }
   * ~~~~~
   */
  private pStruct(): Node {
    const structVal = new Map<string, Node>();
    const name = this.pName();
    if (this.compileError) return name as Node;
    this.eat('{', lbrace, 'Expected ???{??? to open the set.');
    do {
      const prop = this.pName();
      this.eat(':', colon, `Expected ???:??? to begin assignment.`);
      const val = this.pExpr();
      structVal.set(prop.value, val);
    } while (this.match([',', comma]) && this.hasChars);
    this.eat('}', rbrace, 'Expected ???}??? to close the set.');
    this.match([';', semicolon]);
    const struct = new StructNode(name, structVal);
    return struct;
  }

  private pSet(): Node {
    const arr: Node[] = [];
    const name = this.pName();
    if (this.compileError) return name;
    this.eat('{', lbrace, 'Expected ???{??? to open the set.');
    do {
      const res = this.pExpr();
      arr.push(res);
    } while (this.match([',', comma]) && this.hasChars);
    this.eat('}', rbrace, 'Expected ???}??? to close the set.');
    this.match([';', semicolon]);
    const set = new SetVal(name, arr);
    return set;
  }

  private pName(): Id {
    const res = this.match(['identifier', identifier]);
    if (res === null) {
      this.croak(`Couldn???t parse identifier at ${this.peek}`);
      return this.compileError as Node;
    }
    return node.id(res.res.result);
  }

  private pArray(): Node {
    const xs: Node[] = [];
    do {
      const res = this.pExpr();
      xs.push(res);
    } while (this.match([',', comma]) && this.hasChars);
    this.eat(']', rbracket, 'Expected ???]??? to close array');
    return node.array(xs);
  }

  private pBlock(n: number): Node {
    this.advance(n);
    const ns: Node[] = [];
    while (this.check('}', rbrace) === null && this.hasChars) {
      ns.push(this.pDeclare());
    }
    this.eat('}', rbrace, 'expect ???}??? after block.');
    return node.block(ns);
  }

  private pDeclare(): Node {
    if (this.match(['var', keyword_var])) {
      return this.pVar();
    }
    if (this.match(['const', keyword_const])) {
      return this.pConst();
    }
    return this.pStmt();
  }

  private pConst(): Node {
    return this.pId(true);
  }

  private pVar(): Node {
    return this.pId(false);
  }

  private pId(isConstant: boolean): Node {
    let name = identifier.run(this.peek);
    if (name.err) {
      this.croak('Invalid identifier.');
      return this.compileError as Node;
    }
    this.advance(name.end);
    let init = this.nil as Node;
    if (this.match([':=', assignOp])) {
      init = this.pExprStmt();
      return isConstant
        ? node.is.rotten(init)
          ? (this.croak('Constants must be initialized inline.') as Node)
          : (node.constant(name.result, init) as Node)
        : (node.variable(name.result, init) as Node);
    }
    this.croak(`Expected assignment operator ???:=???.`);
    return this.compileError as Node;
  }

  private pExprStmt(): Node {
    let expr = this.pExpr();
    this.eat(';', semicolon, 'Expected a ???;??? after the expression.');
    return expr;
  }

  private pExpr(): Node {
    const res = whitespace.run(this.peek);
    if (!res.err) {
      this.savePrev(res.end);
      this.advance(res.end);
    }
    return this.pBind();
  }

  private pBind(): Node {
    let expr: Node = this.pNOT();
    let res = this.match([':=', assignOp]);
    while (res !== null) {
      let value = this.pNOT();
      if (expr instanceof Id) {
        return node.assign(expr, value);
      }
      this.croak('Invalid assignment target.');
    }
    return expr;
  }

  private pNOT(): Node {
    let expr: Node = this.pBinaryLogicExpr();
    let res = this.match(['not', pnot]);
    while (res !== null) {
      let op = this.tryParse(this.previous, pnot) as UnaryLogicOp;
      let out = this.pBinaryLogicExpr();
      expr = node.unary.logic.expression(out, op);
      res = this.match(['not', pnot]);
    }
    return expr;
  }

  private pBinaryLogicExpr(): Node {
    let expr = this.pEquation();
    let res = this.match(
      ['and', and],
      ['or', or],
      ['nand', nand],
      ['nor', nor],
      ['xor', xor],
      ['xnor', xnor]
    );
    while (res !== null) {
      let op = this.tryParse(this.previous, res.parser) as BinaryLogicOp;
      let right = this.pEquation();
      expr = node.binary.logic.expression(expr, op, right);
      res = this.match(
        ['and', and],
        ['or', or],
        ['nand', nand],
        ['nor', nor],
        ['xor', xor],
        ['xnor', xnor]
      );
    }
    return expr;
  }

  private pEquation(): Node {
    let expr = this.pInequation();
    let res = this.match(['=', EQ], ['==', DEQ]);
    while (res !== null) {
      let op = this.tryParse(this.previous, eqop) as EqOp;
      let right = this.pInequation();
      expr = node.equation(expr, op, right);
      res = this.match(['=', EQ], ['==', DEQ]);
    }
    return expr;
  }

  private pInequation(): Node {
    let expr = this.pTerm();
    let res = this.match(
      ['<=', LTE],
      ['>=', GTE],
      ['!=', NEQ],
      ['<', LT],
      ['>', GT]
    );
    while (res !== null) {
      let op = this.tryParse(this.previous, ineqop) as IneqOp;
      let right = this.pTerm();
      expr = node.inequation(expr, op, right);
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

  private pTerm(): Node {
    let expr = this.pFactor();
    let res = this.match(['+', add], ['-', minus]);
    while (res !== null) {
      let op = this.tryParse(this.previous, binop) as BinaryMathOp;
      let right = this.pFactor();
      expr = node.binary.math.expression(expr, op, right);
      res = this.match(['+', add], ['-', minus]);
    }
    return expr;
  }

  private pNumOrId(x: Data<any>, testId: string = ''): Node {
    let left: string = x.result;
    let result: Node;
    switch (x.type as NumberType | 'identifier') {
      case 'integer':
        result = node.num(left, 'integer');
        break;
      case 'real':
        result = node.num(left, 'real');
        break;
      case 'natural':
        result = node.num(left, 'natural');
        break;
      case 'scientific':
        result = node.num(left, 'scientific');
        break;
      case 'rational':
        result = node.num(left, 'rational');
        break;
      case 'identifier':
        result = testId ? new Id(left) : (this.croak(testId) as Node);
        break;
      default:
        this.croak(`Cannot parse implicit multiplication.`) as Node;
        result = node.nil;
        break;
    }
    return result;
  }

  // ?? - pFactor
  private pFactor(): Node {
    const d = dist.run(this.peek);
    let left: any;
    if (!d.err) {
      this.advance(d.end);
      if (this.env.hasFunction(d.result)) {
        return this.pCall(d.result);
      }
      left = this.pNumOrId(d, `Cannot parse distributive multiplication.`);
      const right = this.pLit();
      return node.binary.math.expression(left, '*', right);
    }
    const x = imul.run(this.peek);
    if (!x.err) {
      this.advance(x.end);
      left = x.result;
      switch (x.type as NumberType) {
        case 'integer':
          left = node.num(left, 'integer');
          break;
        case 'real':
          left = node.num(left, 'real');
          break;
        case 'natural':
          left = node.num(left, 'natural');
          break;
        case 'scientific':
          left = node.num(left, 'scientific');
          break;
        case 'rational':
          left = node.num(left, 'rational');
          break;
        default:
          left = node.num(left, 'real');
          break;
      }
      const right = node.id(x.children[1].result);
      const res = node.binary.math.expression(left, '*', right);
      return res;
    }
    let expr: Node = this.pPower();
    let res = this.match(
      ['*', multiply],
      ['/', divide],
      ['%', quot],
      ['rem', rem],
      ['mod', mod]
    );
    while (res !== null) {
      let op = this.tryParse(this.previous, binop) as BinaryMathOp;
      let right = this.pPower();
      expr = node.binary.math.expression(expr, op, right);
      res = this.match(
        ['*', multiply],
        ['/', divide],
        ['%', quot],
        ['rem', rem],
        ['mod', mod]
      );
    }
    return expr;
  }

  private pPower(): Node {
    let expr = this.pFactorial();
    let res = this.match(['^', power]);
    while (res !== null) {
      let op = this.tryParse(this.previous, binop) as BinaryMathOp;
      let right = this.pFactorial();
      expr = node.binary.math.expression(expr, op, right);
      res = this.match(['^', power]);
    }
    return expr;
  }

  private pFactorial(): Node {
    let expr = this.pStringOp();
    let res = this.match(['!', fact]);
    while (res !== null) {
      let op = this.tryParse(this.previous, binop) as UnaryMathOp;
      expr = node.unary.math.expression.factorial(expr, op);
      res = this.match(['!', fact]);
    }
    return expr;
  }

  // ?? - pStringOp
  private pStringOp(): Node {
    let expr = this.pLit();
    let res = this.match(['++', concat], ['--', revcat]);
    while (res !== null) {
      let op = this.tryParse(this.previous, binop) as BinaryStringOp;
      let right = this.pLit();
      expr = node.binary.string.expression(expr, op, right);
      res = this.match(['++', concat], ['--', revcat]);
    }
    return expr;
  }

  // ?? - pLit
  private pLit(): Node {
    if (this.match(['(', lparen])) {
      let expr = this.pExpr();
      this.eat(')', rparen, 'expected right paren');
      if (this.check('(', lparen) && node.is.math.expression(expr)) {
        const right = this.pExpr();
        return node.binary.math.expression(expr, '*', right);
      }
      if (this.compileError) return this.compileError as Node;
      return expr;
    }
    return this.pPrimary();
  }

  // ?? - pPrimary
  private pPrimary<T extends Node>(): T {
    const res = oneof(number, pBool, identifier, str, lbracket, lbrace).run(
      this.peek
    );
    this.savePrev(res.end);
    this.advance(res.end);
    switch (res.type) {
      case 'bigN':
      case 'scientific':
      case 'rational':
      case 'real':
      case 'integer':
      case 'natural':
      case 'inf':
        return node.num(res.result, res.type) as unknown as T;
      case 'string':
        return node.string(res.result.slice(1, -1)) as unknown as T;
      case 'identifier':
        return node.id(res.result) as unknown as T;
      case 'true':
        return node.bool(true) as unknown as T;
      case 'false':
        return node.bool(false) as unknown as T;
      case '{':
        return this.pSet() as unknown as T;
      case '[':
        return this.pArray() as unknown as T;
      default: {
        this.croak('Unrecognized lexeme.', 'LexerError');
        return this.nil as T;
      }
    }
  }

  // ?? - tryParse
  private tryParse<T>(src: string, parser: P<T>): T {
    return parser.run(src).type as unknown as T;
  }

  // ?? - eat
  private eat(type: NodeType, parser: P<any>, erm: string) {
    const res = this.check(type, parser);
    if (res !== null) {
      this.advance(res.end);
      return true;
    }
    this.croak(erm);
    return false;
  }

  // ?? - match
  private match<T>(...conds: [NodeType, P<T>][]) {
    for (let i = 0; i < conds.length; i++) {
      let res = this.check(conds[i][0], conds[i][1]);
      if (res !== null) {
        this.savePrev(res.end);
        this.advance(res.end);
        return { res, parser: conds[i][1] };
      }
    }
    return null;
  }

  // ?? - check
  private check<T>(type: NodeType, parser: P<T>) {
    if (!this.hasChars) return null;
    const out = parser.run(this.peek);
    if (out.err || out.type !== type) return null;
    return out;
  }

  // ?? - savePrev
  private savePrev(end: number) {
    this.lastStart = this.start;
    this.lastEnd = this.start + end;
  }

  // ?? - advance
  private advance(end: number) {
    if (this.hasChars) this.start = this.start + end;
  }

  // ?? - hasChars
  private get hasChars() {
    const res = this.start < this.length;
    return res;
  }

  // ?? - previous
  private get previous() {
    const res = this.src.slice(this.lastStart, this.lastEnd);
    return res;
  }

  // ?? - peek
  private get peek() {
    const res = this.src.slice(this.start, this.end);
    return res;
  }

  /**
   * Creates a new compiletime error.
   * A message must be provided.
   * This will stop evaluation.
   */
  private croak(message: string, type: ErrorType = 'SyntaxError') {
    this.compileError = new Rot(message, type);
    return this.compileError;
  }

  /**
   * Creates a new runtime error.
   * A message must be provided.
   * This will stop evaluation.
   */
  private panic(message: string, type: ErrorType = 'RuntimeError') {
    this.runtimeError = new Rot(message, type);
    return this.runtimeError;
  }
}

export const prex = new Prex();
const parsing = prex.parse(`2(x^2+1)`);
display(parsing.prog)