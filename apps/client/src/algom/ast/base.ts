import { NODE } from "../structs/enums";
import {
  Visitor,
} from "./astnode.js";

import {
  BinaryExprNode,
  BlockNode,
  BoolNode,
  NullNode,
  Root,
  SymbolNode,
  UnaryExprNode,
  VarDeclareNode,
  VectorNode,
  StringNode,
  FunctionNode,
  GroupNode,
  MatrixNode,
  TupleNode,
  N,
} from "./index.js";

export abstract class ASTNode {
  kind: NODE;
  constructor(kind: NODE) {
    this.kind = kind;
  }
  abstract get val(): string;
  get erred() {
    return this.kind === NODE.ERROR;
  }
  get nkind() {
    return NODE[this.kind].toLowerCase().replace("_", "-");
  }
  abstract accept<T>(n: Visitor<T>): T;

  isBlock(): this is BlockNode {
    return this.kind === NODE.BLOCK;
  }
  isCallExpr() {
    return this.kind === NODE.CALL_EXPRESSION;
  }
  isBool(): this is BoolNode {
    return this.kind === NODE.BOOL;
  }
  isTuple(): this is TupleNode {
    return this.kind === NODE.TUPLE;
  }
  isVector(): this is VectorNode {
    return this.kind === NODE.VECTOR;
  }
  isMatrix(): this is MatrixNode {
    return this.kind === NODE.MATRIX;
  }
  isNull(): this is NullNode {
    return this.kind === NODE.NULL;
  }
  isNum(): this is N {
    return this.kind === NODE.NUMBER;
  }
  isGroup(): this is GroupNode {
    return this.kind === NODE.GROUP;
  }
  isSymbol(): this is SymbolNode {
    return this.kind === NODE.SYMBOL;
  }
  isChars(): this is StringNode {
    return this.kind === NODE.STRING;
  }
  isVarDeclaration(): this is VarDeclareNode {
    return this.kind === NODE.VARIABLE_DECLARATION;
  }
  isFunDeclaration(): this is FunctionNode {
    return this.kind === NODE.FUNCTION_DECLARATION;
  }
  isUnaryExpr(): this is UnaryExprNode {
    return this.kind === NODE.UNARY_EXPRESSION;
  }
  isBinex(): this is BinaryExprNode {
    return this.kind === NODE.BINARY_EXPRESSION;
  }
  isRoot(): this is Root {
    return this.kind === NODE.ROOT;
  }
}
