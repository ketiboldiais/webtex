import { ASTNode } from "./abstract.node.js";
import { Block, block, isBlockNode } from "./block.node.js";
import { NodeType } from "./node.type.js";
import { Sym } from "./symbol.node.js";
import { Visitor } from "./visitor.definition.js";

export class FunctionDeclaration extends ASTNode {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.funcDef(this);
  }
  constructor(
    private readonly Name: Sym,
    private readonly Parameters: Sym[],
    private readonly Body: Block,
  ) {
    super(NodeType.functionDeclaration);
    this.Name = Name;
    this.Parameters = Parameters;
    this.Body = Body;
  }
  symName() {
    return this.Name;
  }
  forEachParam(f: (param:Sym)=>void) {
    const L = this.arity();
    for (let i = 0; i < L; i++) {
      const param = this.Parameters[i];
      f(param);
    }
    return this;
  }
  paramNodes() {
    return this.Parameters;
  }

  /**
   * Returns this function’s definition
   * node.
   */
  bodyNode() {
    return this.Body;
  }
  /**
   * Returns this function’s name (a symbol node).
   */
  name() {
    return this.Name.id();
  }
  /**
   * Returns the number of parameters
   * this function takes.
   */
  arity() {
    return this.Parameters.length;
  }
  /**
   * Returns the parameters of this function.
   */
  params() {
    return this.Parameters.map((v) => v.id());
  }
}

export const fnDef = (
  sym: Sym,
  params: Sym[],
  body: ASTNode,
) =>
  new FunctionDeclaration(
    sym,
    params,
    isBlockNode(body) ? body : block([body]),
  );
