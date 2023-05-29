import { ASTNode, nodeGuard } from "./node.ast.js";
import { Visitor } from "./node.visitor.js";
import { LType } from "./node.typings.js";

export class Atom<t> extends ASTNode {
  accept<k>(visitor: Visitor): k {
    return visitor.atom(this) as unknown as k;
  }
  value: t;
  constructor(value: t, type: LType) {
    super(type);
    this.value = value;
  }
}

export const nNil = new Atom(null, "null");

export const tempnode: ASTNode = nNil;

export const nFalse = new Atom(false, "bool");

export const nTrue = new Atom(true, "bool");

export const is_nNil = nodeGuard<Atom<null>>("null");

export type NumLit = Atom<number>;
export const nStr = (x: string) => new Atom(x, "string");
export const is_nStr = nodeGuard<Atom<string>>("string");

export const nInf = new Atom(Infinity, "Inf");
export const is_nInf = nodeGuard<NumLit>("Inf");

export const nNaN = new Atom(NaN, "NaN");
export const is_nNaN = nodeGuard<NumLit>("NaN");

export const nInt = (
  x: string,
) => new Atom(Number.parseInt(x, 10), "int");
export const is_nInt = nodeGuard<NumLit>("int");

export const nFloat = (
  x: string,
) => new Atom(Number.parseFloat(x), "float");
export const is_nFloat = nodeGuard<NumLit>("float");

export const nHex = (x: string) => new Atom(Number.parseInt(x, 16), "hex");
export const is_nHex = nodeGuard<NumLit>("hex");

export const nBin = (x: string) => new Atom(Number.parseInt(x, 2), "binary");
export const is_nBin = nodeGuard<NumLit>("binary");

export const nOct = (x: string) => new Atom(Number.parseInt(x, 8), "octal");
export const is_nOct = nodeGuard<NumLit>("octal");

export const is_nNum = (n: ASTNode): n is NumLit => (
  is_nInt(n) ||
  is_nFloat(n) ||
  is_nHex(n) ||
  is_nBin(n) ||
  is_nOct(n) ||
  is_nInf(n) ||
  is_nNaN(n)
);


