import { parametric, polar, xy, y } from "./structs/mathfn.js";
import { ASTNode } from "./astnode.js";
import { Compile, Runtimeval } from "./visitors/compiler.js";
import { Fn } from "./fn.js";
import { Parser } from "./parser.js";
import { Interpreter } from "./visitors/interpreter.js";
import { ToLatex } from "./ToLatex.js";

export namespace algom {
  export const getData = {
    polar,
    xy,
    parametric,
    y,
  };

  export const parser = new Parser();

  export function evalLatex(src: string) {
    return parser.compute(src);
  }

  export function evalNode(node: ASTNode) {
    const n = node.accept(new Interpreter()).accept(new ToLatex());
    return n;
  }

  export function toLatex(src: string) {
    const parsing = parser.latex(src);
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

  export function evaluate(input: string) {
    return parser.EVAL(input);
  }
}
