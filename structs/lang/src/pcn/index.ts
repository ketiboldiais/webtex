import { oneof, P } from '../pkt/index.js';
import { modulo } from '../prx/math.js';
import { display } from '../utils/index.js';
// prettier-ignore
import {
  lbrace, rem, keyword_const, keyword_var, keyword_let, keyword_return, identifier, lparen, rparen, assignOp, comma, semicolon, rbracket, rbrace, whitespace, pnot, and, or, nand, nor, xor, xnor, EQ, DEQ, eqop, LTE, GTE, NEQ, LT, GT, ineqop, add, minus, binop, imul, multiply, divide, quot, mod, power, fact, concat, revcat, number, pBool, str, lbracket, } from './parsers.js';
// prettier-ignore
import {
  NodeType, ErrorType, NumberType, BinaryMathOp, BinaryStringOp, BinaryLogicOp, EqOp, IneqOp, UnaryLogicOp, UnaryMathOp,
} from './types.js';
// prettier-ignore
import {
  AndExpr, Node, ArrVal, Bind, Block, Bool, Constant, Equation, FactorialExpression, Fun, Glitch, Id, Inequation, Integer, MathBinop, NandExpr, Natural, Nil, NorExpr, NotExpr, Numeric, OrExpr, Prog, Rational, Real, Scientific, StringBinop, StringVal, Variable, XnorExpr, XorExpr,
} from './nodes/index.js';

class Prex {
  private lastStart: number;
  private lastEnd: number;
  private start: number;
  private end: number;
  private length: number;
  private src: string;
  private compileError: null | Glitch;
  private runtimeError: null | Glitch;
  private nil: Nil;
  prog: Prog | Glitch | null;
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
  }

  parse(src: string) {
    this.src = src.trimStart().trimEnd();
    this.length = this.src.length;
    this.end = this.src.length;
    this.prog = this.pProg();
    return this;
  }

  private pProg(): Prog | Glitch {
    let body: Node[] = [];
    while (this.hasChars) {
      body.push(this.pStmt());
      if (this.compileError) return this.compileError;
    }
    return new Prog(body);
  }

  private pStmt(): Node {
    const res = oneof(
      lbrace,
      keyword_const,
      keyword_var,
      keyword_let,
      keyword_return
    ).run(this.peek);
    switch (res.type) {
      case 'let':
        return this.pFunction();
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

  // § - pFunction
  private pFunction(): Node {
    this.eat('let', keyword_let, 'Expected keyword “let”.');
    const name = identifier.run(this.peek);
    if (name.err) {
      return this.croak('Invalid function name.');
    }
    this.advance(name.end);
    this.eat('(', lparen, 'Expected a “(” to open the parameter list.');
    const params = this.pParam();
    this.eat(')', rparen, 'Expected a “)” to close the parameter list.');
    this.eat(':=', assignOp, 'Invalid function assignment operator');
    const res = lbrace.run(this.peek);
    let body: Node;
    if (res.type === '{') {
      body = this.pBlock(res.end);
      return new Fun(new Id(name.result), params, body);
    }
    body = this.pExprStmt();
    return new Fun(new Id(name.result), params, body);
  }

  // § - pParam
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

  // § - pReturn
  private pReturn(): null | ReturnType<typeof this.pExprStmt> {
    const out = this.match(['return', keyword_return]);
    if (out === null) return null;
    if (!this.match([';', semicolon])) {
      return this.pExprStmt();
    }
    return null;
  }

  // § - pArray
  private pArray(): Node {
    const arr: Node[] = [];
    do {
      const res = this.pExpr();
      arr.push(res);
    } while (this.match([',', comma]) && this.hasChars);
    this.eat(']', rbracket, 'Expected “]” to close array');
    return new ArrVal(arr);
  }

  // § - pBlock
  private pBlock(n: number): Node {
    this.advance(n);
    const statements: Node[] = [];
    while (this.check('}', rbrace) === null && this.hasChars) {
      statements.push(this.pDeclare());
    }
    this.eat('}', rbrace, 'expect “}” after block.');
    return new Block(statements);
  }

  // § - pDeclare
  private pDeclare() {
    if (this.match(['var', keyword_var])) {
      return this.pVar();
    }
    if (this.match(['const', keyword_const])) {
      return this.pConst();
    }
    return this.pStmt();
  }

  // § - pConst
  private pConst(): Node {
    return this.pId(true);
  }

  // § - pVar
  private pVar(): Node {
    return this.pId(false);
  }

  // § - pId
  private pId(isConstant: boolean): Node {
    let name = identifier.run(this.peek);
    if (name.err) {
      return this.croak('Invalid identifier.');
    }
    this.advance(name.end);
    let init = this.nil;
    if (this.match([':=', assignOp])) {
      init = this.pExprStmt();
      return isConstant
        ? init instanceof Glitch
          ? this.croak('Constants must be initialized inline.')
          : new Constant([new Id(name.result), init])
        : new Variable([new Id(name.result), init]);
    }
    return this.croak(`Expected assignment operator “:=”.`);
  }

  // § - pExprStmt
  private pExprStmt(): Node {
    let expr = this.pExpr();
    this.eat(';', semicolon, 'Expected a “;” after the expression.');
    return expr;
  }

  // § - pExpr
  private pExpr() {
    const res = whitespace.run(this.peek);
    if (!res.err) {
      this.savePrev(res.end);
      this.advance(res.end);
    }
    return this.pBind();
  }

  // § pBind
  private pBind() {
    let expr: Node = this.pNOT();
    let res = this.match([':=', assignOp]);
    while (res !== null) {
      let value = this.pNOT();
      if (expr instanceof Id) {
        return new Bind([expr, value]);
      }
      return this.croak('Invalid assignment target.');
    }
    return expr;
  }

  // § - pNOT
  private pNOT() {
    let expr: Node = this.pAND();
    let res = this.match(['not', pnot]);
    while (res !== null) {
      let op = this.tryParse(this.previous, pnot) as UnaryLogicOp;
      let out = this.pAND();
      expr = new NotExpr(out, op);
      res = this.match(['not', pnot]);
    }
    return expr;
  }

  // § - pAND
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

  // § - pOR
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

  // § - pNAND
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

  // § - pNOR
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

  // § - pXOR
  private pXOR() {
    let expr = this.pXNOR();
    let res = this.match(['xor', xor]);
    while (res !== null) {
      let op = this.tryParse(this.previous, xor) as BinaryLogicOp;
      let right = this.pXNOR();
      expr = new XorExpr(expr, op, right);
      res = this.match(['xor', xor]);
    }
    return expr;
  }

  // § - pXNOR
  private pXNOR<A extends Node, B extends Node, C extends Node>(): C {
    let expr = this.pEquation<A, B>();
    let res = this.match(['xnor', xnor]);
    while (res !== null) {
      let op = this.tryParse(this.previous, xnor) as BinaryLogicOp;
      let right = this.pEquation();
      expr = new XnorExpr(expr, op, right);
      res = this.match(['xnor', xnor]);
    }
    return expr as unknown as C;
  }

  // § - pEquation
  private pEquation<
    A extends Node,
    B extends Node,
    C extends Node = Node
  >(): C {
    let expr = this.pInequation<A, B>();
    let res = this.match(['=', EQ], ['==', DEQ]);
    while (res !== null) {
      let op = this.tryParse(this.previous, eqop) as EqOp;
      let right = this.pInequation();
      expr = new Equation(expr, op, right);
      res = this.match(['=', EQ], ['==', DEQ]);
    }
    return expr as unknown as C;
  }

  // § - pInequation
  private pInequation<
    A extends Node,
    B extends Node,
    C extends Node = Node
  >(): C {
    let expr = this.pTerm<A, B, C>();
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
      expr = new Inequation(expr, op, right) as unknown as C;
      res = this.match(
        ['<=', LTE],
        ['>=', GTE],
        ['!=', NEQ],
        ['<', LT],
        ['>', GT]
      );
    }
    return expr as unknown as C;
  }

  // § - pTerm
  private pTerm<A extends Node, B extends Node, C extends Node>(): C {
    let expr = this.pFactor();
    let res = this.match(['+', add], ['-', minus]);
    while (res !== null) {
      let op = this.tryParse(this.previous, binop) as BinaryMathOp;
      let right = this.pFactor();
      expr = new MathBinop<A, B>(expr as A, op, right as B);
      res = this.match(['+', add], ['-', minus]);
    }
    return expr as unknown as C;
  }

  // § - pFactor
  private pFactor<A extends Node, B extends Node, C extends Node>(): C {
    const x = imul.run(this.peek);
    if (!x.err) {
      this.advance(x.end);
      let left: any = x.children[0].result;
      switch (x.children[0].type as NumberType) {
        case 'integer':
          left = new Integer(Number(left));
          break;
        case 'real':
          left = new Real(Number(left));
          break;
        case 'natural':
          left = new Natural(Number(left));
          break;
        case 'scientific':
          left = new Scientific([
            Number(x.children[0].children[0].result),
            Number(x.children[0].children[2].result),
          ]);
          break;
        case 'rational':
          left = new Rational([
            Number(x.children[0].children[0].result),
            Number(x.children[0].children[1].result),
          ]);
          break;
        default:
          left = new Real(Number(left));
          break;
      }
      const right = new Id(x.children[1].result);
      return new MathBinop<A, Id>(left, '*', right) as unknown as C;
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
      expr = new MathBinop(expr, op, right);
      res = this.match(
        ['*', multiply],
        ['/', divide],
        ['%', quot],
        ['rem', rem],
        ['mod', mod]
      );
    }
    return expr as unknown as C;
  }

  // § - pPower
  private pPower<A extends Node, B extends Node, C extends Node>():
    | MathBinop<A, B>
    | C {
    let expr = this.pFactorial();
    let res = this.match(['^', power]);
    while (res !== null) {
      let op = this.tryParse(this.previous, binop) as BinaryMathOp;
      let right = this.pFactorial();
      expr = new MathBinop<typeof expr, typeof right>(expr, op, right);
      res = this.match(['^', power]);
    }
    return expr as unknown as C;
  }

  // § - pPower
  private pFactorial<
    A extends Node,
    B extends Node,
    C extends Node = Glitch | A | StringBinop<A, B>
  >(): FactorialExpression<A> | C {
    let expr: Glitch | A | StringBinop<A, B> | Node = this.pStringOp<A, B>();
    let res = this.match(['!', fact]);
    while (res !== null) {
      let op = this.tryParse(this.previous, binop) as UnaryMathOp;
      expr = new FactorialExpression(expr, op);
      res = this.match(['!', fact]);
    }
    return expr as unknown as C;
  }

  // § - pStringOp
  private pStringOp<
    A extends Node,
    B extends Node,
    C extends Node = A | Glitch | StringBinop<A, B>
  >(): C {
    let expr: A | Glitch | Node = this.pLit<A>();
    let res = this.match(['++', concat], ['--', revcat]);
    while (res !== null) {
      let op = this.tryParse(this.previous, binop) as BinaryStringOp;
      let right = this.pLit<B>();
      expr = new StringBinop<A, ReturnType<typeof this.pLit<B>>>(
        expr as A,
        op,
        right
      ) as unknown as C;
      res = this.match(['++', concat], ['--', revcat]);
    }
    return expr as unknown as C;
  }

  // § - pLit
  private pLit<T extends Node>(): T | Glitch {
    if (this.match(['(', lparen])) {
      let expr = this.pExpr();
      this.eat(')', rparen, 'expected right paren');
      if (this.compileError) return this.compileError;
      return expr as unknown as T;
    }
    return this.pPrimary<T>();
  }

  // § - pPrimary
  private pPrimary<T extends Node>(): T {
    const res = oneof(number, pBool, identifier, str, lbracket).run(this.peek);
    this.savePrev(res.end);
    this.advance(res.end);
    switch (res.type) {
      case 'string':
        return new StringVal(res.result.slice(1, -1)) as unknown as T;
      case 'identifier':
        return new Id(res.result) as unknown as T;
      case 'true':
        return new Bool(true) as unknown as T;
      case 'false':
        return new Bool(false) as unknown as T;
      case 'scientific':
        return new Scientific([
          Number(res.children[0].result),
          Number(res.children[2].result),
        ]) as unknown as T;
      case 'rational':
        return new Rational([
          Number(res.children[0].result),
          Number(res.children[2].result),
        ]) as unknown as T;
      case 'real':
        return new Real(Number(res.result)) as unknown as T;
      case 'integer':
        return new Integer(Number(res.result)) as unknown as T;
      case 'natural':
        return new Natural(Number(res.result)) as unknown as T;
      case '[':
        return this.pArray() as T;
      default: {
        return this.croak('Unrecognized lexeme.', 'LexerError') as T;
      }
    }
  }

  // § - tryParse
  private tryParse<T>(src: string, parser: P<T>): T {
    return parser.run(src).type as unknown as T;
  }

  // § - eat
  private eat(type: NodeType, parser: P<any>, erm: string) {
    const res = this.check(type, parser);
    if (res !== null) {
      this.advance(res.end);
      return true;
    }
    this.croak(erm);
    return false;
  }

  // § - match
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

  // § - check
  private check<T>(type: NodeType, parser: P<T>) {
    if (!this.hasChars) return null;
    const out = parser.run(this.peek);
    if (out.err || out.type !== type) return null;
    return out;
  }

  // § - savePrev
  private savePrev(end: number) {
    this.lastStart = this.start;
    this.lastEnd = this.start + end;
  }

  // § - advance
  private advance(end: number) {
    if (this.hasChars) this.start = this.start + end;
  }

  // § - hasChars
  private get hasChars() {
    const res = this.start < this.length;
    return res;
  }

  // § - previous
  private get previous() {
    const res = this.src.slice(this.lastStart, this.lastEnd);
    return res;
  }

  // § - peek
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
    this.compileError = new Glitch(message, type);
    return this.compileError;
  }

  /**
   * Creates a new runtime error.
   * A message must be provided.
   * This will stop evaluation.
   */
  private panic(message: string, type: ErrorType = 'RuntimeError') {
    this.runtimeError = new Glitch(message, type);
    return this.runtimeError;
  }

  // § - evalStringBinop
  private evalStringBinop<A extends Node, B extends Node>(
    node: StringBinop<A, B>
  ): StringVal | Glitch {
    let left: StringVal = this.evaluate(node.left);
    let right: StringVal = this.evaluate(node.right);
    if (typeof left.value !== 'string' || typeof right.value !== 'string') {
      return this.panic(`String operators are only valid on string operands.`);
    }
    switch (node.op) {
      case '++':
        return new StringVal(left.value.concat(right.value));
      case '--':
        return new StringVal(right.value.concat(left.value));
      default:
        return this.panic('Unrecognized string operator.');
    }
  }

  // § - evalMathBinop
  /**
   * Evaluates a math binary expression.
   */
  private evalMathBinop<A extends Node, B extends Node>(
    node: MathBinop<A, B>
  ): Numeric | Glitch {
    let a = this.evaluate<A, B, Numeric>(node.left).norm;
    let b = this.evaluate<A, B, Numeric>(node.right).norm;
    if (typeof a !== 'number' || typeof b !== 'number') {
      return this.panic('non-operand numbers in evaluating math.');
    }
    switch (node.op) {
      case '*':
        return new Real(a * b);
      case '+':
        return new Real(a + b);
      case '-':
        return new Real(a - b);
      case '/':
        return new Real(a / b);
      case '^':
        return new Real(a ** b);
      case '%':
        return new Real(Math.floor(a / b));
      case 'mod':
        return new Integer(modulo(a, b));
      case 'rem':
        return new Integer(a % b);
      default:
        return this.panic('Unrecognized binary math operator.');
    }
  }

  // § - evaluate
  private evaluate<A extends Node, B extends Node, C extends Node = Node>(
    node: Node
  ): C {
    switch (node.kind) {
      case 'string-binary-expression':
        return this.evalStringBinop(node as StringBinop<A, B>) as unknown as C;
      case 'math-binary-expression':
        return this.evalMathBinop(node as MathBinop<A, B>) as unknown as C;
      case 'inf':
      case 'rational':
      case 'string':
      case 'boolean':
      case 'natural':
      case 'integer':
      case 'real':
      case 'scientific':
      case 'null':
        return node as unknown as C;
      default:
        return this.croak(
          `Unrecognized node type: ${node.kind}`
        ) as unknown as C;
    }
  }

  // § - print
  print() {
    display(this.prog);
    return this;
  }

  // § - interpret
  interpret(): Glitch | null | Node {
    if (this.prog === null || this.prog instanceof Glitch)
      return this.compileError;
    let result: any = null;
    for (let i = 0; i < this.prog.value.length; i++) {
      if (this.runtimeError) return this.runtimeError;
      result = this.evaluate(this.prog.value[i]);
    }
    return result;
  }
}

const prex = new Prex();
const input = `
12 + 5;
`;
const parsing = prex.parse(input);
// parsing.print();
const result = parsing.interpret();
console.log(result);
