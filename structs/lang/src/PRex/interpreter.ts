import { Program, BinaryExpr, Stmt, ParserError } from './nodes';
import { TokenType } from './token';
import {
  NullVal,
  StrVal,
  IntVal,
  RealVal,
  BoolVal,
  RuntimeErr,
  RuntimeVal,
  ValueType,
  NumVal,
  NodeType,
} from './typings';

class Interpreter {
  constructor() {}
  interpret(result: Program | ParserError) {
    if (result instanceof ParserError) {
      return result;
    }
    return this.evaluate(result);
  }
  private evaluate(astNode: Stmt): RuntimeVal {
    switch (astNode.node) {
      case NodeType.INTEGER:
        return this.int(astNode.value);
      case NodeType.REAL:
        return this.real(astNode.value);
      case NodeType.STRING:
        return this.str(astNode.value);
      case NodeType.BOOL:
        return this.bool(astNode.value);
      case NodeType.PROGRAM:
        return this.evalProg(astNode as Program);
      case NodeType.BINARY_EXPRESSION:
        return this.evalBinary(astNode as BinaryExpr);
      default:
        return this.err('Unrecognized node.');
    }
  }

  private evalBinary(node: BinaryExpr): RuntimeVal {
    const lhs = this.evaluate(node.left);
    const rhs = this.evaluate(node.right);
    const op = node.operator;
    if (this.hasNumArgs(lhs.type, rhs.type)) {
      return this.evalNumBin(lhs as NumVal, op, rhs as NumVal);
    }
    if (this.hasBoolArgs(lhs.type, rhs.type)) {
    }
    if (this.hasStrArgs(lhs.type, rhs.type)) {
    }
    return this.err('Unrecognized binary operation');
  }

  private evalProg(node: Program): RuntimeVal {
    let lastEvaluated: RuntimeVal = this.nil;
    for (let i = 0; i < node.body.length; i++) {
      lastEvaluated = this.evaluate(node.body[i]);
    }
    return lastEvaluated;
  }

  private evalNumBin(t1: NumVal, op: TokenType, t2: NumVal): RuntimeVal {
    let f = t1.type === 'real' ? this.real : this.int;
    switch (op) {
      case TokenType.PLUS:
        return f(t1.value + t2.value);
      case TokenType.MINUS:
        return f(t1.value + t2.value);
      case TokenType.MUL:
        return f(t1.value * t2.value);
      case TokenType.DIV:
        return this.real(t1.value / t2.value);
      case TokenType.QUOT:
        return this.int(t1.value / t2.value);
      default:
        return this.err('Unrecognized numeric operation.');
    }
  }

  get nil(): NullVal {
    return { type: 'null', value: null };
  }

  private str(value: string): StrVal {
    return { type: 'string', value };
  }

  private int(value: number): IntVal {
    return {
      type: 'integer',
      value: Math.floor(value),
    };
  }

  private real(value: number): RealVal {
    return { type: 'real', value };
  }

  private bool(value: boolean): BoolVal {
    return { type: 'bool', value };
  }

  private err(message: string): RuntimeErr {
    return {
      type: 'runtimeError',
      value: message,
    };
  }

  private hasIntArgs(t1: ValueType, t2: ValueType) {
    return t1 === 'integer' && t2 === 'integer';
  }
  private hasRealArgs(t1: ValueType, t2: ValueType) {
    return t1 === 'real' && t2 === 'real';
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
