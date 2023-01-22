import {
  Program,
  BinaryExpr,
  Stmt,
  ParserError,
  SymbolExpr,
  VarDecl,
} from './nodes';
import { TokenType } from './token';
import { ValueType, NodeType } from './typings';

class RuntimeVal {
  type: ValueType;
  value: any;
  constructor(type: ValueType, value: any) {
    this.type = type;
    this.value = value;
  }
}

class Nil extends RuntimeVal {
  constructor() {
    super('null', null);
    this.type = 'null';
    this.value = null;
  }
}

class Str extends RuntimeVal {
  constructor(value: string) {
    super('string', value);
    this.type = 'string';
    this.value = value;
  }
}

class Int extends RuntimeVal {
  constructor(value: number) {
    super('integer', value);
    this.type = 'integer';
    this.value = value | 0;
  }
}
class Real extends RuntimeVal {
  constructor(value: number) {
    super('real', value);
    this.type = 'real';
    this.value = value;
  }
}
type Num = Int | Real;

class Bool extends RuntimeVal {
  constructor(value: boolean) {
    super('bool', value);
    this.type = 'bool';
    this.value = value;
  }
}

class RuntimeErr extends RuntimeVal {
  constructor(message: string) {
    super('Runtime-error', message);
    this.type = 'Runtime-error';
    this.value = message;
  }
}

const lib: [string, RuntimeVal][] = [
  ['pi', new Real(Math.PI)],
  ['e', new Real(Math.E)],
  ['ln2', new Real(Math.LN2)],
  ['ln10', new Real(Math.LN10)],
  ['log2e', new Real(Math.LOG2E)],
  ['log10e', new Real(Math.LOG10E)],
  ['tau', new Real(2 * Math.PI)],
  ['sqrt2', new Real(Math.SQRT2)],
  ['cbrt2', new Real(Math.cbrt(2))],
  ['cbrt3', new Real(Math.cbrt(3))],
  ['sqrt3', new Real(Math.sqrt(3))],
  ['sqrt5', new Real(Math.sqrt(5))],
  ['phi', new Real(1.6180339887498948482)],
];

class Environment {
  private parent?: Environment;
  private vars: Map<string, RuntimeVal>;
  private constants: Set<string>;
  error: boolean;
  constructor(parentEnv?: Environment) {
    this.parent = parentEnv;
    this.vars = new Map(lib);
    this.constants = new Set();
    this.error = false;
  }

  lookup(varname: string): RuntimeVal {
    const env = this.resolve(varname);
    if (env instanceof RuntimeErr) return env;
    return env.vars.get(varname) as RuntimeVal;
  }

  declare(varname: string, value: RuntimeVal, isConstant: boolean): RuntimeVal {
    if (this.vars.has(varname)) {
      this.error = true;
      return new RuntimeErr(
        `You already declared Variable “${varname}”. Did you mean to reassign?`
      );
    }
    if (isConstant) {
      this.constants.add(varname);
    }
    this.vars.set(varname, value);
    return value;
  }

  assign(varname: string, value: RuntimeVal): RuntimeVal {
    const env = this.resolve(varname);

    if (env instanceof RuntimeErr) {
      this.error = true;
      return env;
    }

    if (env.constants.has(varname)) {
      this.error = true;
      return new RuntimeErr(
        `Variable ${varname} is a constant, and you 
         can’t change a constant. If you want a mutable
         variable, consider using let.`
      );
    }

    env.vars.set(varname, value);
    return value;
  }

  resolve(varname: string): Environment | RuntimeErr {
    if (this.vars.has(varname)) return this;
    if (this.parent === undefined || this.error) {
      return new RuntimeErr(`Couldn’t find the variable “${varname}”.`);
    }
    return this.parent.resolve(varname);
  }
}

class Interpreter {
  environment: Environment;
  constructor() {
    this.environment = new Environment();
  }
  interpret(result: Program | ParserError) {
    if (result instanceof ParserError) {
      return result;
    }
    return this.evaluate(result);
  }
  private evaluate(astNode: Stmt): RuntimeVal {
    switch (astNode.node) {
      case NodeType.INTEGER:
        return new Int(astNode.value);
      case NodeType.REAL:
        return new Real(astNode.value);
      case NodeType.STRING:
        return new Str(astNode.value);
      case NodeType.BOOL:
        return new Bool(astNode.value);
      case NodeType.SYMBOL:
        return this.evalIdentifier(astNode as SymbolExpr);
      case NodeType.PROGRAM:
        return this.evalProg(astNode as Program);
      case NodeType.BINARY_EXPRESSION:
        return this.evalBinary(astNode as BinaryExpr);
      case NodeType.VAR:
        return this.evalVarDeclr(astNode as VarDecl);
      default:
        return new RuntimeErr('Unrecognized node.');
    }
  }

  private evalVarDeclr(node: VarDecl): RuntimeVal {
    const val = node.value ? this.evaluate(node.value) : this.nil;
    return this.environment.declare(node.symbol, val, node.constant);
  }

  private evalIdentifier(node: SymbolExpr): RuntimeVal {
    const val = this.environment.lookup(node.symbol);
    return val;
  }

  private evalBinary(node: BinaryExpr): RuntimeVal {
    const lhs = this.evaluate(node.left);
    const rhs = this.evaluate(node.right);
    const op = node.operator;
    if (this.hasNumArgs(lhs.type, rhs.type)) {
      return this.evalNumBin(lhs as Num, op, rhs as Num);
    }
    if (this.hasBoolArgs(lhs.type, rhs.type)) {
    }
    if (this.hasStrArgs(lhs.type, rhs.type)) {
    }
    return new RuntimeErr('Unrecognized binary operation');
  }

  private evalProg(node: Program): RuntimeVal {
    let lastEvaluated: RuntimeVal = this.nil;
    for (let i = 0; i < node.body.length; i++) {
      lastEvaluated = this.evaluate(node.body[i]);
    }
    return lastEvaluated;
  }

  private evalNumBin(t1: Num, op: TokenType, t2: Num): RuntimeVal {
    let f =
      t1.type === 'real' || t2.type === 'real'
        ? (v: number) => new Real(v)
        : (v: number) => new Int(v);
    switch (op) {
      case TokenType.PLUS:
        return f(t1.value + t2.value);
      case TokenType.MINUS:
        return f(t1.value + t2.value);
      case TokenType.MUL:
        return f(t1.value * t2.value);
      case TokenType.DIV:
        return new Real(t1.value / t2.value);
      case TokenType.QUOT:
        return new Int(t1.value / t2.value);
      default:
        return new RuntimeErr('Unrecognized numeric operation.');
    }
  }

  get nil(): Nil {
    return { type: 'null', value: null };
  }

  private hasIntArgs(t1: ValueType, t2: ValueType) {
    return (
      (t1 === 'integer' && t2 === 'integer') ||
      (t1 === 'integer' && t2 === 'real')
    );
  }
  private hasRealArgs(t1: ValueType, t2: ValueType) {
    return (
      (t1 === 'real' && t2 === 'real') || (t1 === 'real' && t2 === 'integer')
    );
  }
  private hasNumArgs(t1: ValueType, t2: ValueType) {
    return this.hasIntArgs(t1, t2) || this.hasRealArgs(t1, t2);
  }
  private hasStrArgs(t1: ValueType, t2: ValueType) {
    return t1 === 'string' && t2 === 'string';
  }
  private hasBoolArgs(t1: ValueType, t2: ValueType) {
    return t1 === 'bool' && t2 === 'bool';
  }
}

export const interpreter = new Interpreter();
