import { NODE } from "../structs/enums.js";
import { functions, symbols } from "../structs/latex.js";
import { Visitor } from "./astnode.js";
import { ASTNode } from "./base.js";

export class SymbolNode extends ASTNode {
  value: string;
  isStatic: boolean;
  constructor(value: string, isStatic = false) {
    super(NODE.SYMBOL);
    this.value = value;
    this.isStatic = isStatic;
  }
  get val() {
    return this.value;
  }
  get latex() {
    if (functions[this.value]) {
      return functions[this.value].latex;
    } else if (symbols[this.value]) {
      return symbols[this.value].latex;
    }
    return this.value;
  }
  accept<T>(v: Visitor<T>) {
    return v.sym(this);
  }
}
