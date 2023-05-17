import { ASTNode } from "./abstract.node.js";
import { NodeType } from "./node.type.js";
import { Sym } from "./symbol.node.js";
import { Visitor } from "./visitor.definition.js";

export class Call extends ASTNode {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.call(this);
  }
  private readonly Name: Sym;
  private readonly Args: ASTNode[];
  constructor(name: Sym, args: ASTNode[]) {
    super(NodeType.call);
    this.Name = name;
    this.Args = args;
  }
  forEachArg(f: (arg:ASTNode)=>void) {
    for (let i = 0; i < this.Args.length; i++) {
      f(this.Args[i]);
    } 
    return this;
  }
  /**
   * Returns the called function’s name.
   */
  callee() {
    return this.Name;
  }
  /**
   * Returns this call’s supplied
   * arguments.
   */
  args() {
    return this.Args;
  }
  /**
   * Returns the called function’s arity
   * (the number of arguments provided
   * to this call).
   */
  arity() {
    return this.Args.length;
  }
}

export const call = (
  name: Sym,
  args: ASTNode[],
) => new Call(name, args);
