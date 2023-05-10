import { ASTNode } from "./abstract.node.js";
import { NodeType } from "./node.type.js";
import { Sym } from "./symbol.node.js";
import { Visitor } from "./visitor.definition.js";

enum VarType {
  constant,
  mutable,
}

export class VariableDeclaration extends ASTNode {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.varDef(this);
  }
  private sym: Sym;
  private body: ASTNode;
  private vartype: VarType;
  constructor(sym: Sym, body: ASTNode, vartype:VarType) {
    super(NodeType.variableDeclaration);
    this.sym = sym;
    this.body = body;
    this.vartype=vartype;
  }
  isMutable() {
    return this.vartype === VarType.mutable;
  }
  isConstant() {
    return this.vartype === VarType.constant;
  }
	name() {
		return this.sym.value();
	}
  value() {
    return this.body;
  }
}

export const varDef = (
  name:Sym, 
  body:ASTNode
) => new VariableDeclaration(name, body, VarType.mutable);

export const constantDef = (
  name:Sym, 
  body:ASTNode
) => new VariableDeclaration(name, body, VarType.constant);

