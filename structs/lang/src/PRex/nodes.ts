import { NodeType } from './typings';
import { TokenType } from './token';

export class Stmt {
  node: NodeType;
  value: any;
  constructor(node: NodeType, value = null) {
    this.node = node;
    this.value = value;
  }
}

export class Program extends Stmt {
  node: NodeType.PROGRAM;
  body: Stmt[];
  constructor(body: Stmt[]) {
    super(NodeType.PROGRAM);
    this.node = NodeType.PROGRAM;
    this.body = body;
  }
}

export class VarDecl extends Stmt {
  node: NodeType.VAR;
  symbol: string;
  value: Expr;
  constant: boolean;
  constructor(symbol: string, value: Expr, constant: boolean = false) {
    super(NodeType.VAR);
    this.symbol = symbol;
    this.value = value;
    this.constant = constant;
  }
}

export class AssignmentExpr extends Stmt {
  node: NodeType.ASSIGNMENT_EXPRESSION;
  symbol: string;
  value: any;
  constructor(symbol: string, value: any) {
    super(NodeType.ASSIGNMENT_EXPRESSION, value);
    this.node = NodeType.ASSIGNMENT_EXPRESSION;
    this.symbol = symbol;
    this.value = value;
  }
}

export class Expr extends Stmt {
  value: any;
  node: NodeType;
  constructor(value: any, node: NodeType) {
    super(node, value);
    this.value = value;
    this.node = node;
  }
}

export class BinaryExpr extends Expr {
  node: NodeType.BINARY_EXPRESSION;
  left: Expr;
  operator: TokenType;
  right: Expr;
  constructor(left: Expr, operator: TokenType, right: Expr) {
    super(null, NodeType.BINARY_EXPRESSION);
    this.node = NodeType.BINARY_EXPRESSION;
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
}

export class UnaryExpr extends Expr {
  node: NodeType.UNARY_EXPRESSION;
  operand: Expr;
  constructor(operand: Expr) {
    super(null, NodeType.UNARY_EXPRESSION);
    this.node = NodeType.UNARY_EXPRESSION;
    this.operand = operand;
  }
}

export class SymbolExpr extends Expr {
  node: NodeType.SYMBOL;
  symbol: string;
  constructor(symbol: string) {
    super(symbol, NodeType.SYMBOL);
    this.node = NodeType.SYMBOL;
    this.symbol = symbol;
  }
}

export class IntegerLiteral extends Expr {
  node: NodeType.INTEGER;
  value: number;
  constructor(value: number) {
    super(value, NodeType.INTEGER);
    this.value = value;
    this.node = NodeType.INTEGER;
  }
}

export class RealLiteral extends Expr {
  node: NodeType.REAL;
  value: number;
  constructor(value: number) {
    super(value, NodeType.REAL);
    this.value = value;
    this.node = NodeType.REAL;
  }
}

export class StringLiteral extends Expr {
  node: NodeType.STRING;
  value: string;
  constructor(value: string) {
    super(value, NodeType.STRING);
    this.node = NodeType.STRING;
    this.value = value;
  }
}

export class BooleanLiteral extends Expr {
  node: NodeType.BOOL;
  value: boolean;
  constructor(value: boolean) {
    super(value, NodeType.BOOL);
    this.node = NodeType.BOOL;
    this.value = value;
  }
}

export class NullLiteral extends Expr {
  node: NodeType.NULL;
  value: null;
  constructor() {
    super(null, NodeType.NULL);
    this.value = null;
    this.node = NodeType.NULL;
  }
}

export class ParserError extends Expr {
  node: NodeType.PARSER_ERROR;
  message: string;
  line: number;
  constructor(message: string, line: number) {
    super(message, NodeType.PARSER_ERROR);
    this.message = message;
    this.line = line;
  }
}
