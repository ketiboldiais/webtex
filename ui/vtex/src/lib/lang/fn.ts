import { Compiler } from "./compiler.js";
import { Environment } from "./environment.js";
import { FunDef } from "./nodes/node.fundef.js";
import { Retval } from "./retval.js";
import { Callable, RVal } from "./typings.js";
import { cap } from "./utils.js";

export class Fn extends Callable {
  private def: FunDef;
  private closure: Environment<RVal> | null;
  constructor(
    fundef: FunDef,
    closure: Environment<RVal> | null,
  ) {
    super();
    this.def = fundef;
    this.closure = closure;
  }
  arity() {
    return this.def.params.length;
  }
  call(compiler: Compiler, args: RVal[]) {
    const params = this.def.params;
    const arity = params.length;
    const body = this.def.body;
    const closure = this.closure || compiler.globals;
    const env = new Environment(closure);
    for (let i = 0; i < arity; i++) {
      const param = params[i]._lexeme;
      const val = args[i];
      env.write(param, val);
    }
    try {
      const result = compiler.cmpBlock(body, env);
      return result;
    } catch (e) {
      if (e instanceof Retval) {
        return e.value;
      }
    }
    return null;
  }
}

export const isFn = (
  n: any,
): n is Callable => n instanceof Callable;

export const native = (f: Function, arglen: number) => {
  class NativeFn extends Callable {
    constructor() {
      super();
    }
    arity(): number {
      return arglen;
    }
    call(compiler: Compiler, args: RVal[]): RVal {
      return f.call(null, cap(args).at(arglen));
    }
  }
  return new NativeFn();
};
