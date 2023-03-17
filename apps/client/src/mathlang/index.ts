import { parametric, polar, xy, y } from "./structs/mathfn.js";
import { ASTNode, Errnode } from "./nodes/astnode.js";
import { Compile, Runtimeval } from "./compiler.js";
import { Fn } from "./fn.js";
import { Parser } from "./parser.js";
import { Shunter } from "./shunter.js";
import { Interpreter } from "./interpreter.js";
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
    const shunter = new Shunter();
    return shunter.parse(src).evaluate();
  }

  export function evalNode(node: ASTNode) {
    const n = node.accept(new Interpreter()).accept(new ToLatex());
    return n;
  }

  export function toLatex(src: string) {
    const shunter = new Shunter();
    const parsing = shunter.parse(src);
    return parsing;
  }

  export function parse(input: string) {
    return parser.parse(input);
  }

  export function compile(input: string) {
    const parsing = parser.parse(input);
    if (parsing.error) {
      return new Runtimeval(null, (parser.result.root[0] as Errnode).value);
    }
    return parsing.accept(new Compile()) as Runtimeval;
  }

  export function makeFunction(body: string, params: string[]) {
    const res = new Shunter().compileFunction(body, params);
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
    parser.parse(input);
    return parser.val;
  }
}
