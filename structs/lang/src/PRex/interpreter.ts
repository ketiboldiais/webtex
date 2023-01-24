import { log } from '../utils/index.js';
import {
  Program,
  BinaryExpressionNode,
  StatementNode,
  ParserError,
  SymbolNode,
  VariableDeclarationNode,
  AssignmentExpressionNode,
} from './parser';
import { TokenType } from './tokenizer';
import { ValueType, NodeType } from './typings';

/* -------------------------------------------------------------------------- */
/*                            RUNTIME VALUE OBJECTS                           */
/* -------------------------------------------------------------------------- */

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

class RuntimeError extends RuntimeVal {
  constructor(message: string) {
    super('Runtime-error', message);
    this.type = 'Runtime-error';
    this.value = message;
  }
}

/* -------------------------------------------------------------------------- */
/*                              NATIVE VARIABLES                              */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                             ENVIRONMENT OBJECT                             */
/* -------------------------------------------------------------------------- */

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
  has(varname: string) {
    return this.vars.has(varname);
  }

  lookup(varname: string): RuntimeVal {
    const env = this.resolve(varname);
    if (env instanceof RuntimeError) return env;
    return env.vars.get(varname) as RuntimeVal;
  }

  declare(varname: string, value: RuntimeVal, isConstant: boolean): RuntimeVal {
    if (this.vars.has(varname)) {
      this.error = true;
      return new RuntimeError(
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

    if (env instanceof RuntimeError) {
      this.error = true;
      return env;
    }

    if (env.constants.has(varname)) {
      this.error = true;
      return new RuntimeError(
        `Variable ${varname} is a constant, and you 
         can’t change a constant. If you want a mutable
         variable, consider using let.`
      );
    }

    env.vars.set(varname, value);
    return value;
  }

  resolve(varname: string): Environment | RuntimeError {
    if (this.vars.has(varname)) return this;
    if (this.parent === undefined || this.error) {
      return new RuntimeError(`Couldn’t find the variable “${varname}”.`);
    }
    return this.parent.resolve(varname);
  }
}

/* -------------------------------------------------------------------------- */
/*                                 INTERPRETER                                */
/* -------------------------------------------------------------------------- */

class Interpreter {
  environment: Environment;
  nil: Nil;
  error: null | RuntimeError;
  constructor() {
    this.environment = new Environment();
    this.nil = new Nil();
    this.error = null;
  }
  interpret(result: Program | ParserError) {
    if (result instanceof ParserError) {
      return result;
    }
    return this.evaluate(result);
  }
  private evaluate(astNode: StatementNode): RuntimeVal {
    if (this.error) return this.error;
    switch (astNode.node) {
      case NodeType.PROGRAM:
        return this.evaluate_program(astNode as Program);
      case NodeType.INTEGER:
        return new Int(astNode.value);
      case NodeType.REAL:
        return new Real(astNode.value);
      case NodeType.STRING:
        return new Str(astNode.value);
      case NodeType.BOOL:
        return new Bool(astNode.value);
      case NodeType.SYMBOL:
        return this.evaluate_variable(astNode as SymbolNode);
      case NodeType.BINARY_EXPRESSION:
        return this.evaluate_binary_expression(astNode as BinaryExpressionNode);
      case NodeType.VAR:
        return this.evaluate_variable_declaration(
          astNode as VariableDeclarationNode
        );
      case NodeType.ASSIGNMENT_EXPRESSION:
        return this.evaluate_assignment(astNode as AssignmentExpressionNode);
      default:
        return new RuntimeError('Unrecognized node.');
    }
  }
  
  private evaluate_variable_declaration(
    node: VariableDeclarationNode
  ): RuntimeVal {
    const val = node.value ? this.evaluate(node.value) : this.nil;
    return this.environment.declare(node.symbol, val, node.constant);
  }

  private evaluate_assignment(node: AssignmentExpressionNode): RuntimeVal {
    if (!this.environment.has(node.symbol)) {
      this.error = new RuntimeError(
        `Variable “${node.symbol}” hasn’t been declared.`
      );
    }
    const assignee = this.environment.assign(
      node.symbol,
      this.evaluate(node.value)
    );
    return assignee;
  }

  private evaluate_variable(node: SymbolNode): RuntimeVal {
    const val = this.environment.lookup(node.symbol);
    return val;
  }

  private evaluate_program(node: Program): RuntimeVal {
    let lastEvaluated: RuntimeVal = this.nil;
    for (let i = 0; i < node.body.length; i++) {
      lastEvaluated = this.evaluate(node.body[i]);
      if (this.error) return this.error;
    }
    return lastEvaluated;
  }

  private evaluate_binary_expression(node: BinaryExpressionNode): RuntimeVal {
    const lhs = this.evaluate(node.left);
    const rhs = this.evaluate(node.right);
    const op = node.operator;
    if (this.has_numeric_operands(lhs.type, rhs.type)) {
      return this.evalNumeric(lhs as Num, op, rhs as Num);
    }
    if (this.has_boolean_operands(lhs.type, rhs.type)) {
      return this.evalBool(lhs as Bool, op, rhs as Bool);
    }
    if (this.has_string_operands(lhs.type, rhs.type)) {
    }
    const err = new RuntimeError('Unrecognized binary operation');
    this.error = err;
    return err;
  }

  private evalBool(t1: Bool, op: TokenType, t2: Bool): RuntimeVal {
    switch (op) {
      case TokenType.AND:
        return new Bool(t1.value && t2.value);
      case TokenType.OR:
        return new Bool(t1.value || t2.value);
      case TokenType.NAND:
        return new Bool(!(t1.value && t2.value));
      case TokenType.NOR:
        return new Bool(!t1.value && !t2.value);
      case TokenType.XOR:
        return new Bool(t1.value !== t2.value);
      case TokenType.XNOR:
        return new Bool(t1.value === t2.value);
      default:
        return new RuntimeError('Unrecognized boolean operation.');
    }
  }

  private evalNumeric(t1: Num, op: TokenType, t2: Num): RuntimeVal {
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
      case TokenType.CARET:
        return f(t1.value ** t2.value);
      case TokenType.DIV:
        return new Real(t1.value / t2.value);
      case TokenType.QUOT:
        return new Int(t1.value / t2.value);
      case TokenType.BANG_EQUAL:
        return new Bool(t1.value !== t2.value);
      case TokenType.EQUAL_EQUAL:
        return new Bool(t1.value === t2.value);
      case TokenType.LT:
        return new Bool(t1.value < t2.value);
      case TokenType.GT:
        return new Bool(t1.value > t2.value);
      case TokenType.LTE:
        return new Bool(t1.value < t2.value || t1.value === t2.value);
      case TokenType.GTE:
        return new Bool(t1.value > t2.value || t1.value === t2.value);
      default:
        return new RuntimeError('Unrecognized numeric operation.');
    }
  }

  private has_integer_operands(t1: ValueType, t2: ValueType) {
    return (
      (t1 === 'integer' && t2 === 'integer') ||
      (t1 === 'integer' && t2 === 'real')
    );
  }
  private has_real_operands(t1: ValueType, t2: ValueType) {
    return (
      (t1 === 'real' && t2 === 'real') || (t1 === 'real' && t2 === 'integer')
    );
  }
  private has_numeric_operands(t1: ValueType, t2: ValueType) {
    return this.has_integer_operands(t1, t2) || this.has_real_operands(t1, t2);
  }
  private has_string_operands(t1: ValueType, t2: ValueType) {
    return t1 === 'string' && t2 === 'string';
  }
  private has_boolean_operands(t1: ValueType, t2: ValueType) {
    return t1 === 'bool' && t2 === 'bool';
  }
}

export const interpreter = new Interpreter();
