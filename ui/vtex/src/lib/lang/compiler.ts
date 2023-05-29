import { Either, left, right } from "./either.js";
import { Err, err } from "./err.js";
import { Fn, isFn, native } from "./fn.js";
import { Assign } from "./nodes/node.assign.js";
import { Group } from "./nodes/node.group.js";
import { ASTNode } from "./nodes/node.ast.js";
import { Atom } from "./nodes/node.atom.js";
import { Binex } from "./nodes/node.binex.js";
import { Block } from "./nodes/node.block.js";
import { Call } from "./nodes/node.call.js";
import { Cond } from "./nodes/node.cond.js";
import { Frac } from "./nodes/node.frac.js";
import { FunDef } from "./nodes/node.fundef.js";
import { Getex } from "./nodes/node.getex.js";
import { Loop } from "./nodes/node.loop.js";
import { PrintNode } from "./nodes/node.print.js";
import { Return } from "./nodes/node.return.js";
import { Setex } from "./nodes/node.setex.js";
import { Sym } from "./nodes/node.sym.js";
import { Unex } from "./nodes/node.unex.js";
import { VarDef } from "./nodes/node.vardef.js";
import { VectorExpr } from "./nodes/node.vector.js";
import { Tuple } from "./nodes/node.tuple.js";
import { Visitor } from "./nodes/node.visitor.js";
import { Retval } from "./retval.js";
import { tkn } from "./token.js";
import { RVal } from "./typings.js";
import { env, Environment } from "./environment.js";
import { LocalScope, resolve } from "./resolver.js";
import {print} from "./utils.js";

function tval(x: any): boolean {
  if (x === null) return false;
  if (isbool(x)) return x;
  return true;
}

const evalNum1 = (op: tkn, x: number) => {
  // deno-fmt-ignore
  switch (op) {
    case tkn.plus: return Math.abs(x);
    case tkn.minus: return -x;
    case tkn.sqrt: return Math.sqrt(x);
    default: return null;
  }
};

const isnum = (x: any): x is number => typeof x === "number";
const isbool = (x: any): x is boolean => typeof x === "boolean";
const isstr = (x: any): x is string => typeof x === "string";

const evalBool2 = (x: boolean, op: tkn, y: boolean) => {
  // deno-fmt-ignore
  switch (op) {
    case tkn.and: return x && y;
    case tkn.or: return x || y;
    case tkn.nand: return !(x && y);
    case tkn.xor: return x !== y;
    case tkn.xnor: return !(x === y);
    case tkn.nor: return !(x || y);
    default: return null;
  }
};
const evalNum2 = (x: number, op: tkn, y: number) => {
  // deno-fmt-ignore
  switch (op) {
    case tkn.plus: return x + y;
    case tkn.sqrt: {
      const n = Math.abs(Math.floor(x));
      return Math.pow(y, 1/n);
    };
    case tkn.minus: return x - y;
    case tkn.star: return x * y;
    case tkn.slash: return x / y;
    case tkn.caret: return x ** y;
    case tkn.mod: return ((x % y) + x) % y;
    case tkn.rem: return x % y;
    case tkn.lt: return x < y;
    case tkn.gt: return x > y;
    case tkn.leq: return x <= y;
    case tkn.geq: return x >= y;
    case tkn.neq: return x !== y;
    case tkn.deq: return x === y;
    case tkn.div: return Math.floor(x / y);
    case tkn.percent: return (100 * x) / y;
    default: return null;
  }
};

export class Compiler implements Visitor {
  env: Environment<RVal>;
  globals: Environment<RVal>;
  locals: LocalScope;
  constructor() {
    this.globals = env<RVal>().record({
      E: Math.E,
      LN10: Math.LN10,
      LN2: Math.LN2,
      LOG10E: Math.LOG10E,
      LOG2E: Math.LOG2E,
      PI: Math.PI,
      SQRT2: Math.SQRT2,
      abs: native(Math.abs, 1),
      arccos: native(Math.acos, 1),
      arccosh: native(Math.acosh, 1),
      arcsin: native(Math.asin, 1),
      arcsinh: native(Math.asinh, 1),
      arctan: native(Math.atan, 1),
      arctan2: native(Math.atan2, 1),
      arctanh: native(Math.atanh, 1),
      cbrt: native(Math.cbrt, 1),
      ceil: native(Math.ceil, 1),
      cos: native(Math.cos, 1),
      cosh: native(Math.cosh, 1),
      exp: native(Math.exp, 1),
      floor: native(Math.floor, 1),
      fround: native(Math.fround, 1),
      hypot: native(Math.hypot, 1),
      ln: native(Math.log, 1),
      log: native(Math.log10, 1),
      lg: native(Math.log2, 1),
      max: native(Math.max, 1),
      min: native(Math.min, 1),
      round: native(Math.round, 1),
      sin: native(Math.sin, 1),
      tan: native(Math.tan, 1),
      tanh: native(Math.tanh, 1),
      trunc: native(Math.trunc, 1),
    });
    this.env = this.globals;
    this.locals = new Map();
  }
  addNum(name: string, value: number) {
    this.globals.write(name, value);
    return this;
  }
  addFn(name: string, f: Function, arity: number) {
    this.globals.write(name, native(f, arity));
    return this;
  }
  setLocal(scope: LocalScope) {
    this.locals = scope;
    return this;
  }
  frac(node: Frac) {
    return node.value;
  }
  printStmt(node: PrintNode) {
    const val = this.cmp(node.target);
    console.log(val);
    return null;
  }
  tuple(node: Tuple) {
    return node.array().map((n) => this.cmp(n));
  }
  cmp(node: ASTNode): RVal {
    return node.accept(this);
  }
  atom<x>(node: Atom<x>): RVal {
    return node.value as any as RVal;
  }
  lookup(name: string, value: ASTNode) {
    const distance = this.locals.get(value);
    if (distance !== undefined) {
      return this.env.getAt(distance-1, name);
    } else {
      return this.env.read(name);
    }
  }
  sym(node: Sym): RVal {
    const name = node.symbol._lexeme;
    return this.lookup(name, node);
  }
  getex<t>(node: Getex): t {
    throw new Error("Method not implemented.");
  }
  setex<t>(node: Setex): t {
    throw new Error("Method not implemented.");
  }
  binex(node: Binex): RVal {
    const left = this.cmp(node.left);
    const right = this.cmp(node.right);
    const op = node.op;
    let result = null;
    if (isnum(left) && isnum(right)) {
      result = evalNum2(left, op._type, right);
    } else {
      const L = tval(left);
      const R = tval(right);
      result = evalBool2(L, op._type, R);
    }
    if (result === null) {
      throw new Error(`Unknown op ${op._lexeme}`);
    }
    return result;
  }
  unex(node: Unex): RVal {
    const arg = this.cmp(node.arg);
    const op = node.op;
    let result = null;
    if (isnum(arg)) {
      result = evalNum1(op._type, arg);
    } else if (op.is(tkn.not)) {
      result = !(tval(arg));
    }
    if (result === null) {
      const o = op._lexeme;
      const msg = `Unknown use of unary operator ${o}.`;
      throw new Error(msg);
    }
    return result;
  }
  group(node: Group): RVal {
    return this.cmp(node.expr);
  }
  cmpnodes(nodes: ASTNode[]) {
    const out = [];
    for (let i = 0; i < nodes.length; i++) {
      out.push(this.cmp(nodes[i]));
    }
    return out;
  }
  callex(node: Call): RVal {
    const callee = this.cmp(node.callee);
    const args = this.cmpnodes(node.args);
    if (isFn(callee)) {
      return callee.call(this, args);
    }
    const msg = `Only functions and classes can be called.`;
    throw new Error(msg);
  }
  vector(node: VectorExpr): RVal {
    const elems = node.elements.map((n) => this.cmp(n));
    return elems;
  }
  assign(node: Assign): RVal {
    const name = node.name._lexeme;
    const value = this.cmp(node.value);
    const distance = this.locals.get(node);
    if (distance !== undefined) {
      this.env.assignAt(distance, name, value);
    } else {
      this.globals.update(name, value);
    }
    return value;
  }
  loopStmt(node: Loop) {
    let result: RVal = null;
    while (this.cmp(node.condition)) {
      result = this.cmp(node.body);
    }
    return result;
  }
  varStmt(node: VarDef): RVal {
    const name = node.name._lexeme;
    const value = this.cmp(node.body);
    this.env.write(name, value);
    return value;
  }
  funStmt(node: FunDef): RVal {
    const fn = new Fn(node, this.env);
    const name = node.name._lexeme;
    this.env.write(name, fn);
    return fn;
  }
  cmpBlock(block: Block, env: Environment<RVal>) {
    const stmts = block.stmts;
    const prev = this.env;
    this.env = env;
    let result: RVal = null;
    for (let i = 0; i < stmts.length; i++) {
      result = this.cmp(stmts[i]);
    }
    this.env = prev;
    return result;
  }
  blockStmt(node: Block): RVal {
    const env = new Environment(this.env);
    return this.cmpBlock(node, env);
  }
  condStmt(node: Cond): RVal {
    const c = this.cmp(node.condition);
    if (tval(c)) {
      return this.cmp(node.ifBlock);
    } else {
      return this.cmp(node.elseBlock);
    }
  }
  returnStmt(node: Return): RVal {
    const val = this.cmp(node.value);
    throw new Retval(val);
  }

  compile(nodes: ASTNode[]) {
    let result: RVal = null;
    const N = nodes.length;
    const locals = resolve(nodes);
    if (locals.isLeft()) {
      return locals;
    }
    this.locals = locals.unwrap();
    try {
      for (let i = 0; i < N; i++) {
        result = nodes[i].accept(this);
      }
      return right(result);
    } catch (error) {
      let message = "Fatal error";
      if (error instanceof Error) {
        message = "[RuntimeError]: " + error.message;
      }
      return left(err(message));
    }
  }
}

export function interpret(prog: Either<Err, ASTNode[]>) {
  if (prog.isLeft()) return prog;
  const nodes = prog.unwrap();
  const compiler = new Compiler();
  return compiler.compile(nodes);
}

export function compile(prog: Either<Err, ASTNode[]>) {
  if (prog.isLeft()) {
    return prog;
  }
  const compiler = new Compiler();
  const nodes = prog.unwrap();
  const result = compiler.compile(nodes);
  if (result.isLeft()) return result;
  const f = result.unwrap();
  if (!isFn(f)) {
    return left(err("Could not compile function"));
  }
  const out = (
    ...args: any[]
  ) => f.call(compiler, args);
  return right(out);
}

