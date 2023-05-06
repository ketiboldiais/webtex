const and = (a: any, b: any) => a && b;
const not = (a: any) => !a;
const or = (a: any, b: any) => a || b;
const nand = (a: any, b: any) => !and(a, b);
const nor = (a: any, b: any) => !or(a, b);
const xor = (a: any, b: any) => or(a, b) && nand(a, b);
const xnor = (a: any, b: any) => !xor(a, b);

export const Logic = {
  and,
  not,
  nand,
  or,
  nor,
  xor,
	xnor,
};
