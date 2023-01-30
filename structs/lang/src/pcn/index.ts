import { Data, oneof, P } from '../pkt/index.js';
import deepEqual from 'deep-equal';
import { display } from '../utils/index.js';
import { modulo } from '../prx/math.js';

// prettier-ignore
import {
  lbrace, rem, keyword_const, keyword_var, keyword_let, keyword_return, identifier, lparen, rparen, assignOp, comma, semicolon, rbracket, rbrace, whitespace, pnot, and, or, nand, nor, xor, xnor, EQ, DEQ, eqop, LTE, GTE, NEQ, LT, GT, ineqop, add, minus, binop, imul, multiply, divide, quot, mod, power, fact, concat, revcat, number, pBool, str, lbracket, keyword_set, keyword_alg, dist, keyword_struct, colon, } from './parsers.js';
// prettier-ignore
import {
  NodeType, ErrorType, NumberType, BinaryMathOp, BinaryStringOp, BinaryLogicOp, EqOp, IneqOp, UnaryLogicOp, UnaryMathOp,
} from './types.js';
// prettier-ignore
import {
  Node, ArrVal, Bind, Block, Bool, Constant, Equation, FactorialExpression, Fun, Glitch, Id, Inequation, Integer, MathBinop, Natural, Nil, Numeric, Prog, Rational, Real, Scientific, StringBinop, StringVal, Variable, Binding, AlgebraicExpression, BinaryExpr, BinLogExpr, UniLogExpr, StructNode, SetVal, CallExpr
} from './nodes/index.js';
import { Environment } from './environment.js';

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
  #transpileFunctions: boolean;
  private env: Environment;
  private transpiled: Map<string, Function>;
  prog: Prog | Glitch | null;
  /**
   * @param transpileFunctions
   * The `transpileFunctions` option will construct
   * a single-line mathematical expression into a
   * JavaScript function using the `new Function`
   * constructor. Transpiled functions are not
   * stored in the parser environment and cannot be read
   * by non-transpiled functions.
   * @warn Because of its performance and
   * potential security concerns, the option defaults
   * to false. The option is provided because
   * this parser is primarily used by Webtex as a
   * helper, whose results (1) only exist at runtime,
   * (2) only exist on the user’s machine, and (3) aren’t
   * persisted. Outside of these cases, this option
   * should not be used.
   * @warn This option should only be permitted for
   * parsing results that remain only with the user.
   * @warn This option will cause performance issues.
   */

  constructor(transpileFunctions = false) {
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
    this.transpiled = new Map();
    this.env = new Environment();
    this.#transpileFunctions = transpileFunctions;
  }

  parse(src: string) {
    this.src = src.trimStart().trimEnd();
    this.length = this.src.length;
    this.end = this.src.length;
    this.prog = this.pProg();
    return this;
  }

  /**
   * Parses a program. A program
   * is defined as an array of
   * statements, to be interpreted
   * in sequence.
   */
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

  private transpileFunction(
    name: Data<'identifier'>,
    body: Node | Node[],
    params: Id[]
  ) {
    let ret = ['return'];
    const read = (node: Node | Node[]) => {
      if (Array.isArray(node) && node[0] instanceof Node) {
        for (let i = 0; i < node.length; i++) {
          read(node[i]);
        }
      }
      if (node instanceof Numeric) ret.push(`${node.norm}`);
      if (node instanceof BinaryExpr) {
        ret.push('(');
        read(node.left);
        ret.push(node.op);
        read(node.right);
        ret.push(')');
      }
      if (node instanceof Id) {
        ret.push(node.value);
      }
      return node;
    };
    const _args = params.map((d) => d.value);
    read(body);
    _args.push(ret.join(' '));
    this.transpiled.set(name.result, new Function(..._args));
  }

  /**
   * Parses a function. Functions are declared with the keyword
   * `let`.
   * @example
   * ~~~
   * let f(x) := 2^x;
   * ~~~
   */
  private pFunction(): Node {
    this.eat('let', keyword_let, 'Expected keyword “let”.');
    const name = identifier.run(this.peek);
    if (name.err) {
      this.croak('Invalid function name.');
    }
    this.env.recordFunctionName(name.result);
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
    if (this.#transpileFunctions) {
      this.transpileFunction(name, body, params);
    }
    return new Fun(new Id(name.result), params, body);
  }

  private pAlgebra(): Node {
    const name = this.pName();
    if (this.compileError) return name;
    let algx = new AlgebraicExpression(name, []);

    this.eat('{', lbrace, 'Expected “{” to open the set.');

    do {
      const res = this.pExprStmt();
      algx.push(res);
    } while (this.match([',', comma]) && this.hasChars);

    this.eat('}', rbrace, 'Expected “}” to close the algebraic expression.');

    if (this.check(';', semicolon)) this.match([';', semicolon]);

    let dupe: Node | null = null;

    // recursively add parameters
    const fn = (node: Node) => {
      if (dupe) return dupe;
      if (node instanceof Id) {
        if (node.value === name.value) dupe = node;
        algx.addParam(node);
      }
      if (node instanceof BinaryExpr) {
        fn(node.left);
        fn(node.right);
      }

      return node.value;
    };

    for (let i = 0; i < algx.value.body.length; i++) {
      fn(algx.value.body[i]);
      if (dupe) {
        this.croak(
          `Expression variables must be different from the expression’s identifier. Found “${
            (dupe as Id).value
          }”, and the expression is named “${(dupe as Id).value}”.`
        );
        return this.compileError as unknown as Node;
      }
    }
    return algx;
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

  /**
   * Parses a call expression.
   * @example
   * ~~~
   * let f(x) := x^2;
   * const n := f(5); // 25
   * ~~~
   */
  private pCall(name: string): Node {
    this.eat('(', lparen, 'expected “(” to open the argument list.');
    const args: Node[] = [];
    do {
      const res = this.pExpr();
      args.push(res);
    } while (this.match([',', comma]) && this.hasChars);
    this.eat(')', rparen, `expected “)” to close the argument list.`);
    return new CallExpr({ args, caller: new Id(name) });
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
    this.eat('{', lbrace, 'Expected “{” to open the set.');
    do {
      const prop = this.pName();
      this.eat(':', colon, `Expected “:” to begin assignment.`);
      const val = this.pExpr();
      structVal.set(prop.value, val);
    } while (this.match([',', comma]) && this.hasChars);
    this.eat('}', rbrace, 'Expected “}” to close the set.');
    this.match([';', semicolon]);
    const struct = new StructNode(name, structVal);
    return struct;
  }

  private pSet(): Node {
    const arr: Node[] = [];
    const name = this.pName();
    if (this.compileError) return name;
    this.eat('{', lbrace, 'Expected “{” to open the set.');
    do {
      const res = this.pExpr();
      arr.push(res);
    } while (this.match([',', comma]) && this.hasChars);
    this.eat('}', rbrace, 'Expected “}” to close the set.');
    this.match([';', semicolon]);
    const set = new SetVal(name, arr);
    return set;
  }

  private pName(): Id {
    const res = this.match(['identifier', identifier]);
    if (res === null) {
      this.croak(`Couldn’t parse identifier at ${this.peek}`);
      return this.compileError as Node;
    }
    return new Id(res.res.result);
  }

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
    return new Block(statements) as Node;
  }

  // § - pDeclare
  private pDeclare(): Node {
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
      this.croak('Invalid identifier.');
      return this.compileError as Node;
    }
    this.advance(name.end);
    let init = this.nil as Node;
    if (this.match([':=', assignOp])) {
      init = this.pExprStmt();
      return isConstant
        ? init instanceof Glitch
          ? (this.croak('Constants must be initialized inline.') as Node)
          : (new Constant([new Id(name.result), init]) as Node)
        : (new Variable([new Id(name.result), init]) as Node);
    }
    this.croak(`Expected assignment operator “:=”.`);
    return this.compileError as Node;
  }

  // § - pExprStmt
  private pExprStmt(): Node {
    let expr = this.pExpr();
    this.eat(';', semicolon, 'Expected a “;” after the expression.');
    return expr;
  }

  // § - pExpr
  private pExpr(): Node {
    const res = whitespace.run(this.peek);
    if (!res.err) {
      this.savePrev(res.end);
      this.advance(res.end);
    }
    return this.pBind();
  }

  // § pBind
  private pBind(): Node {
    let expr: Node = this.pNOT();
    let res = this.match([':=', assignOp]);
    while (res !== null) {
      let value = this.pNOT();
      if (expr instanceof Id) {
        return new Bind([expr, value]);
      }
      this.croak('Invalid assignment target.');
      return this.compileError as Node;
    }
    return expr;
  }

  // § - pNOT
  private pNOT(): Node {
    let expr: Node = this.pBinaryLogicExpr();
    let res = this.match(['not', pnot]);
    while (res !== null) {
      let op = this.tryParse(this.previous, pnot) as UnaryLogicOp;
      let out = this.pBinaryLogicExpr();
      expr = new UniLogExpr(out, op) as Node;
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
      expr = new BinLogExpr(expr, op, right);
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

  // § - pEquation
  private pEquation(): Node {
    let expr = this.pInequation();
    let res = this.match(['=', EQ], ['==', DEQ]);
    while (res !== null) {
      let op = this.tryParse(this.previous, eqop) as EqOp;
      let right = this.pInequation();
      expr = new Equation(expr, op, right);
      res = this.match(['=', EQ], ['==', DEQ]);
    }
    return expr;
  }

  // § - pInequation
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

  // § - pTerm
  private pTerm(): Node {
    let expr = this.pFactor();
    let res = this.match(['+', add], ['-', minus]);
    while (res !== null) {
      let op = this.tryParse(this.previous, binop) as BinaryMathOp;
      let right = this.pFactor();
      expr = new MathBinop(expr, op, right);
      res = this.match(['+', add], ['-', minus]);
    }
    return expr;
  }

  private pNumOrId(x: Data<any>, testId: string = ''): Node {
    let left: string = x.result;
    let result: Node;
    switch (x.type as NumberType | 'identifier') {
      case 'integer':
        result = new Integer(Number(left));
        break;
      case 'real':
        result = new Real(Number(left));
        break;
      case 'natural':
        result = new Natural(Number(left));
        break;
      case 'scientific':
        result = new Scientific([
          Number(x.children[0].children[0].result),
          Number(x.children[0].children[2].result),
        ]);
        break;
      case 'rational':
        result = new Rational([
          Number(x.children[0].children[0].result),
          Number(x.children[0].children[1].result),
        ]);
        break;
      case 'identifier':
        result = testId ? new Id(left) : (this.croak(testId) as Node);
        break;
      default:
        result = this.croak(`Cannot parse implicit multiplication.`) as Node;
        break;
    }
    return result;
  }

  // § - pFactor
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
      return new MathBinop(left, '*', right);
    }
    const x = imul.run(this.peek);
    if (!x.err) {
      this.advance(x.end);
      left = x.result;
      switch (x.type as NumberType) {
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
      const res = new MathBinop(left, '*', right);
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
      expr = new MathBinop(expr, op, right);
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
      expr = new MathBinop(expr, op, right);
      res = this.match(['^', power]);
    }
    return expr;
  }

  // § - pPower
  private pFactorial(): Node {
    let expr = this.pStringOp();
    let res = this.match(['!', fact]);
    while (res !== null) {
      let op = this.tryParse(this.previous, binop) as UnaryMathOp;
      expr = new FactorialExpression(expr, op);
      res = this.match(['!', fact]);
    }
    return expr;
  }

  // § - pStringOp
  private pStringOp(): Node {
    let expr = this.pLit();
    let res = this.match(['++', concat], ['--', revcat]);
    while (res !== null) {
      let op = this.tryParse(this.previous, binop) as BinaryStringOp;
      let right = this.pLit();
      expr = new StringBinop(expr, op, right);
      res = this.match(['++', concat], ['--', revcat]);
    }
    return expr;
  }

  // § - pLit
  private pLit(): Node {
    if (this.match(['(', lparen])) {
      let expr = this.pExpr();
      this.eat(')', rparen, 'expected right paren');
      if (this.compileError) return this.compileError as Node;
      return expr;
    }
    return this.pPrimary();
  }

  // § - pPrimary
  private pPrimary<T extends Node>(): T {
    const res = oneof(number, pBool, identifier, str, lbracket, lbrace).run(
      this.peek
    );
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
        return { res, parser: conds[i][1] };
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
  ): Node {
    let left: StringVal = this.evaluate(node.left);
    let right: StringVal = this.evaluate(node.right);
    if (typeof left.value !== 'string' || typeof right.value !== 'string') {
      return this.panic(
        `String operators are only valid on string operands.`
      ) as Node;
    }
    switch (node.op) {
      case '++':
        return new StringVal(left.value.concat(right.value)) as Node;
      case '--':
        return new StringVal(right.value.concat(left.value)) as Node;
      default:
        return this.panic('Unrecognized string operator.') as Node;
    }
  }

  // § - evalMathBinop
  /**
   * Evaluates a math binary expression.
   */
  private evalMathBinop<A extends Node, B extends Node>(
    node: MathBinop<A, B>
  ): Node {
    let L = this.evaluate<A, B, Numeric>(node.left);
    let R = this.evaluate<A, B, Numeric>(node.right);
    let builder = L instanceof Integer && R instanceof Integer ? Integer : Real;
    let a = L.norm;
    let b = R.norm;
    if (typeof a !== 'number' || typeof b !== 'number') {
      return this.panic('non-operand numbers in evaluating math.') as Node;
    }
    switch (node.op) {
      case '*':
        return new builder(a * b);
      case '+':
        return new builder(a + b);
      case '-':
        return new builder(a - b);
      case '/':
        return new builder(a / b);
      case '^':
        return new builder(a ** b);
      case '%':
        return new builder(Math.floor(a / b));
      case 'mod':
        return new Integer(modulo(a, b));
      case 'rem':
        return new Integer(a % b);
      default:
        return this.panic('Unrecognized binary math operator.') as Node;
    }
  }

  private evalId(node: Id) {
    const x = this.env.read(node.value);
    if (x instanceof Glitch) {
      this.runtimeError = x;
    }
    return x;
  }
  private evalBind<T extends Node>(node: Bind<T>): T {
    if (!this.env.has(node.name)) {
      this.panic(`Variable ${node.name} hasn’t been declared.`);
    }
    const val = this.evaluate(node.getVal());
    return this.env.assign(node.name, val) as unknown as T;
  }

  private evalDeclare<T extends Node>(node: Binding<T>): T {
    const val = this.evaluate(node.getVal());
    return this.env.declare(node.name, val, node.isConst) as unknown as T;
  }

  private evalAlgebra(node: AlgebraicExpression) {
    return node.read();
  }

  private evalInequation<A extends Node, B extends Node, C extends Node>(
    node: Inequation<A, B>
  ): C {
    const a = this.evaluate(node.left);
    const b = this.evaluate(node.right);
    if (a instanceof Numeric && b instanceof Numeric) {
      let L = a.norm;
      let R = b.norm;
      switch (node.op as IneqOp) {
        case '!=':
          return new Bool(L !== R) as unknown as C;
        case '<':
          return new Bool(L < R) as unknown as C;
        case '>':
          return new Bool(L > R) as unknown as C;
        case '<=':
          return new Bool(L <= R) as unknown as C;
        case '>=':
          return new Bool(L >= R) as unknown as C;
      }
    } else {
      return deepEqual(a, b) as unknown as C;
    }
  }

  // § - evaluate
  private evaluate<A extends Node, B extends Node, C extends Node = Node>(
    node: Node
  ): C {
    switch (node.kind) {
      case 'algebraic-expression':
        return this.evalAlgebra(node as AlgebraicExpression) as unknown as C;
      case 'identifier':
        return this.evalId(node);
      case 'var-declaration-expression':
      case 'const-declaration-expression':
        return this.evalDeclare(node as Binding<C>);
      case 'assignment-expression':
        return this.evalBind(node as Bind<C>);
      case 'inequation':
        return this.evalInequation(node as Inequation<A, B>) as unknown as C;
      case 'string-binary-expression':
        return this.evalStringBinop(node as StringBinop<A, B>) as unknown as C;
      case 'math-binary-expression':
        return this.evalMathBinop(node as MathBinop<A, B>) as unknown as C;
      case 'inf':
        return node as unknown as C;
      case 'rational':
        return node as unknown as C;
      case 'string':
        return node as unknown as C;
      case 'boolean':
        return node as unknown as C;
      case 'natural':
        return node as unknown as C;
      case 'integer':
        return node as unknown as C;
      case 'real':
        return node as unknown as C;
      case 'scientific':
        return node as unknown as C;
      case 'null':
        return node as unknown as C;
      default:
        this.croak(`Unrecognized node type: ${node.kind}`);
        return this.compileError as C;
    }
  }

  // § - print
  print() {
    console.log(display(this.prog));
    return this;
  }
  json() {
    JSON.stringify(this.prog);
  }
  jsonLog() {
    console.log(this.json());
  }
  log() {
    console.log(this.prog);
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

export const prex = new Prex();
