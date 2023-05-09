import { ASTNode } from "./abstract.node.js";
import { NodeType } from "./node.type.js";
import { Sym } from "./symbol.node.js";
import { Visitor } from "./visitor.definition.js";

export class Call extends ASTNode {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.call(this);
  }
  private _name: Sym;
  private _args: ASTNode[];
  constructor(name: Sym, args: ASTNode[]) {
    super(NodeType.call);
    this._name = name;
    this._args = args;
  }
  name() {
    return this._name.value();
  }
  args() {
    return this._args;
  }
  arity() {
    return this._args.length;
  }
}

export const call = (
	name: Sym,
	args: ASTNode[],
) => new Call(name, args);

