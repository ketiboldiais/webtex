import { NODE } from "../structs/enums.js";
import { functions } from "../structs/latex.js";
import { Visitor } from "./astnode.js";
import { ASTNode } from "./base.js";

export class CallNode extends ASTNode {
  callee: string;
  args: ASTNode[];
  length: number;
  native?: Function;
  constructor(callee: string, args: ASTNode[], native?: Function) {
    super(NODE.CALL_EXPRESSION);
    this.callee = callee;
    this.args = args;
    this.length = args.length;
    this.native = native;
  }
  get val() {
    return `${this.callee}(${this.args.map((n) => n.val).join(", ")})`;
  }
  get latexFuncName() {
    if (functions[this.callee]) {
      return functions[this.callee].latex;
    }
    return this.callee;
  }
  accept<T>(n: Visitor<T>): T {
    return n.callExpr(this);
  }
}
