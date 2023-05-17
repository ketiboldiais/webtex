import { ASTNode } from "./abstract.node.js";
import { NodeType } from "./node.type.js";
import { Visitor } from "./visitor.definition.js";

export class Num extends ASTNode {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.number(this);
  }
  private readonly Value: number;
  constructor(value: number) {
    super(NodeType.number);
    this.Value = value;
  }
  static of(value: number) {
    return new Num(value);
  }
  /**
   * Returns this number’s value.
   */
  lit() {
    return this.Value;
  }
}

// deno-fmt-ignore
const NumBuilder = (
	caster: (s:string) => number,
) => (
value:string
) => Num.of(caster(value))

export const hex = NumBuilder((s) =>
  Number.parseInt(
    s.replace("0x", ""),
    16,
  )
);
export const binary = NumBuilder((s) =>
  Number.parseInt(
    s.replace("0b", ""),
    2,
  )
);
export const octal = NumBuilder((s) =>
  Number.parseInt(
    s.replace("0o", ""),
    8,
  )
);
export const int = NumBuilder((s) => Number.parseInt(s));
export const real = NumBuilder((s) => Number.parseFloat(s));
export const nan = new Num(NaN);
export const inf = new Num(Infinity);

export const isNumNode = (
  node: ASTNode,
): node is Num => node.nodeType === NodeType.number;
