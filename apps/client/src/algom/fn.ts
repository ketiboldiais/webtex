import { Compile } from "./visitors/compiler.js";
import { Interpreter } from "./visitors/interpreter.js";
import { ASTNode } from "./ast/index.js";
import { Scope } from "./scope.js";

export class Fn {
  name: string;
  length: number;
  params: any[];
  body: ASTNode;
  constructor(name: string, params: any[], body: ASTNode) {
    this.name = name;
    this.params = [];
    this.length = params.length;
    this.body = body;
    const set = new Set();
    for (let i = 0; i < params.length; i++) {
      if (!set.has(params[i])) {
        this.params.push(params[i]);
      }
      set.add(params[i]);
    }
  }
  interpret(interpreter: Interpreter, args: any[]) {
    const scope = new Scope();
    for (let i = 0; i < this.length; i++) {
      scope.define(this.params[i], args[i]);
    }
    return interpreter.execBlock([this.body], scope);
  }
  call(compiler: Compile, args: any[]) {
    const scope = new Scope();
    for (let i = 0; i < this.length; i++) {
      scope.define(this.params[i], args[i]);
    }
    return compiler.executeBlock([this.body], scope);
  }
}
