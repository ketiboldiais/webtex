import {
  BinaryLogicOp,
  BinaryMathOp,
  BinaryStringOp,
  EqOp,
  IneqOp,
} from '../types.js';
import {
  Node,
  Integer,
  Natural,
  Rational,
  Real,
  Scientific,
  Id,
  Nil,
  StringVal,
  Prog,
  Fun,
  AlgebraicExpression,
  CallExpr,
  ArrVal,
  Block,
  Bind,
  UniLogExpr,
  BinLogExpr,
  Equation,
  Inequation,
  MathBinop,
  FactorialExpression,
  StringBinop,
  Bool,
  Numeric,
  BinaryExpr,
  Rot,
  Constant,
  Variable,
  Inf,
  LongInt,
} from './index.js';

export const node = {
  nil: new Nil(),
  prog: (stmts: Node[]) => new Prog(stmts),
  block: (stmts: Node[]) => new Block(stmts),
  string: (value: string) => new StringVal(value),
  infinity: new Inf(),
  int: (n: number) => new Integer(n),
  real: (n: number) => new Real(n),
  natural: (n: number) => new Natural(n),
  scint: (a: number, b: number) => new Scientific([a, b]),
  rational: (a: number, b: number) => new Rational([a, b]),
  bignum: (...digits: number[]) => new LongInt(digits),
  id: (name: string) => new Id(name),
  fn: (name: string, params: Id[], body: Node) =>
    new Fun(new Id(name), params, body),
  algebra: (name: Id, body: Id[], params?: Node[]) =>
    new AlgebraicExpression(name, body, params),
  call: (args: Node[], caller: string) =>
    new CallExpr({ args, caller: new Id(caller) }),
  array: (xs: Node[]) => new ArrVal(xs),
  assign: (name: Id, value: Node) => new Bind([name, value]),
  unary: {
    logic: {
      expression: (operand: Node, op: 'not') => new UniLogExpr(operand, op),
    },
    math: {
      expression: {
        factorial: (operand: Node, op: '!') =>
          new FactorialExpression(operand, op),
      },
    },
  },
  binary: {
    logic: {
      expression: (a: Node, op: BinaryLogicOp, b: Node) =>
        new BinLogExpr(a, op, b),
    },
    math: {
      expression: (a: Node, op: BinaryMathOp, b: Node) =>
        new MathBinop(a, op, b),
    },
    string: {
      expression: (a: Node, op: BinaryStringOp, b: Node) =>
        new StringBinop(a, op, b),
    },
  },
  constant: (name: string, value: Node) => new Constant([new Id(name), value]),
  variable: (name: string, value: Node) => new Variable([new Id(name), value]),
  bool: (val: boolean) => new Bool(val),
  equation: (left: Node, op: EqOp, right: Node) =>
    new Equation(left, op, right),
  inequation: (left: Node, op: IneqOp, right: Node) =>
    new Inequation(left, op, right),
  is: {
    math: {
      expression: (n: any) =>
        n instanceof MathBinop ||
        n instanceof Numeric ||
        n instanceof FactorialExpression ||
        n instanceof Id,
    },
    id: (n: any): n is Id => n instanceof Id,
    binary: {
      expression: (n: any): n is BinaryExpr<Node, Node> =>
        n instanceof BinaryExpr,
    },
    numeric: (n: any): n is Numeric => n instanceof Numeric,
    nodeArray: (n: any): n is Array<Node> =>
      Array.isArray(n) && n[0] instanceof Node,
    rotten: (n: any): n is Rot => n instanceof Rot,
    integer: (n: any): n is Integer => n instanceof Integer,
    natural: (n: any): n is Natural => n instanceof Natural,
    real: (n: any): n is Real => n instanceof Real,
    rational: (n: any): n is Rational => n instanceof Rational,
    scientific: (n: any): n is Scientific => n instanceof Scientific,
    infinity: (n: any): n is Inf => n instanceof Inf,
  },
  isNode: (x: any): x is Node => x instanceof Node,
};
