import { polar, xy } from "./structs/mathfn.js";
import { Compile, Runtimeval } from "./visitors/compiler.js";
import { Fn } from "./fn.js";
import { Parser } from "./parser.js";
import { Interpreter } from "./visitors/interpreter.js";
import { ToLatex } from "./visitors/ToLatex.js";
import { ASTNode } from "./ast/base.js";

export { verifyNumber } from "./structs/stringfn.js";

export const getData = {
  polar,
  xy,
};

export const parser = new Parser();

export function evalLatex(src: string) {
  return parser.compute(src);
}

export function evalNode(node: ASTNode) {
  const n = node.accept(new Interpreter()).accept(new ToLatex());
  return n;
}

export function toLatex(src: string, parsingFunctions: boolean = false) {
  const parsing = parser.latex(src, parsingFunctions);
  return parsing;
}

export function parse(input: string) {
  return parser.parse(input);
}
export function parseExpr(input: string) {
  return parser.parseExpr(input);
}

export function compile(input: string) {
  const parsing = parser.parse(input);
  if (parsing.erred) {
    return new Runtimeval(null, parsing.val);
  }
  return parsing.accept(new Compile()) as Runtimeval;
}

export function makeFunction(body: string, params: string[]) {
  const res = parser.compileFunction(body, params);
  return res;
}

export function compfn(input: string, fname = "f", params = "(x)") {
  const c = new Compile();
  const src = `let ${fname}${params} = ` + input + ";";
  const { result, err } = compile(src);
  if (err) return err;
  if (result instanceof Fn) return (...args: any[]) => result.call(c, args);
  return `Input ${input} did not compile to a function.`;
}

export function createFunction(expr: string) {
  return parser.createFunction(expr);
}

export function evaluate(input: string) {
  return parser.EVAL(input);
}

export function range(start: number, end: number, step: number = 1) {
  let out: number[] = [];
  step = step === 0 ? (step * (step < 0 ? -1 : 1)) : (step);
  let i = start <= end ? start : end;
  let max = start <= end ? end : start;
  while (i < max) {
    out.push(i);
    i += step;
  }
  return out;
}

export function clamp(value: number, max: number, min: number) {
  return value > max ? (max) : (value < min ? min : value);
}

export function dedupe<t>(arr: t[]): t[] {
  return [...new Set(arr)];
}

export function uid(length: number = 4, base = 36) {
  return Math
    .random()
    .toString(base)
    .replace(/[^a-z]+/g, "")
    .substring(0, length + 1);
}

export function percentage(current: number, max: number, min: number = 0) {
  return (((current - min) / (max - min)) * 100);
}

export function latinize(num: number): string {
  const div = Math.floor(num / 26);
  const rem = Math.floor(num % 26);
  const char = String.fromCharCode(rem + 97).toUpperCase();
  return div - 1 >= 0 ? latinize(div - 1) + char : char;
}

export function digitize26(chars: string) {
  return chars.split("")
    .reverse()
    .map((letter, index) =>
      index === 0
        ? letter.toLowerCase().charCodeAt(0) - 97
        : letter.toLowerCase().charCodeAt(0) - 97 + 1
    ).map((base26Num, pos) => base26Num * 26 ** pos)
    .reduce((sum, num) => sum + num, 0);
}

type RowCol = { columnIndex: number; rowIndex: number };

export function getRowCol(id: string): RowCol {
  const res = /([A-Z]+)([\d]+)/.exec(id);
  if (res) {
    const col = res[1];
    const rowIndex = (res[2] as any) * 1;
    const columnIndex = digitize26(col);
    return { columnIndex, rowIndex };
  }
  return { columnIndex: -1, rowIndex: -1 };
}
