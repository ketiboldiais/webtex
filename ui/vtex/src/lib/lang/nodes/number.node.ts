import { ASTNode } from "./abstract.node.js";
import { NodeType } from "./node.type.js";
import { Visitor } from "./visitor.definition.js";

export class Num extends ASTNode {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.number(this);
  }
  private val: number;
  constructor(value: number) {
    super(NodeType.number);
    this.val = value;
  }
  static of(value: number) {
    return new Num(value);
  }
  value() {
    return this.val;
  }
}

// deno-fmt-ignore
const NumBuilder = (
	caster: (s:string) => number,
) => (
value:string
) => Num.of(caster(value))

export const hex = NumBuilder((s) => Number.parseInt(s, 16));
export const binary = NumBuilder((s) => Number.parseInt(s, 2));
export const octal = NumBuilder((s) => Number.parseInt(s, 8));
export const int = NumBuilder((s) => Number.parseInt(s));
export const real = NumBuilder((s) => Number.parseFloat(s));
export const nan = new Num(NaN);
export const inf = new Num(Infinity);
