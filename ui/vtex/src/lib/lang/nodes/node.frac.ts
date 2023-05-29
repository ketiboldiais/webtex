import { frac, Fraction } from "@/structs/Fraction.js";
import { ASTNode } from "./node.ast.js";
import { Visitor } from "./node.visitor.js";

export class Frac extends ASTNode {
  accept<t>(visitor: Visitor<any>): t {
    return visitor.frac(this);
  }
  value: Fraction;
  constructor(N: number, D: number) {
    super("frac");
    this.value = frac(N, D);
  }
}

export const nFrac = (
  N: number,
  D: number,
) => new Frac(N, D);

export const is_nFrac = (
  node: ASTNode,
): node is Frac => node.is("frac");
