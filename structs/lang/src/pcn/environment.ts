import { Rot } from './nodes/index.js';

export class Environment {
  private parent?: Environment;
  private variables: Map<string, [unknown, boolean]>;
  private functions: Set<string>;
  constructor(parent?: Environment) {
    this.parent = parent;
    this.variables = new Map();
    this.functions = new Set();
  }
  recordFunctionName(name: string) {
    this.functions.add(name);
  }
  hasFunction(name: string) {
    return this.functions.has(name);
  }
  has(varname: string) {
    return this.variables.has(varname);
  }
  read(name: string) {
    const env = this.resolve(name);
    if (env instanceof Rot) return env;
    return (env.variables as any).get(name)[0];
  }
  isConstant(name: string) {
    if (!this.has(name)) return false;
    return (this.variables as any).get(name)[1];
  }
  croak(message: string): Rot {
    return new Rot(message, 'EnvError');
  }
  resolve(name: string): Environment | Rot {
    if (this.has(name)) return this;
    if (this.parent === undefined)
      return this.croak(`Couldn’t resolve symbol “${name}”.`);
    return this.parent.resolve(name);
  }
  declare<T>(name: string, value: T, isConst: boolean): T | Rot {
    if (this.has(name)) {
      return this.croak(`Variable ${name} is already declared.`);
    }
    this.variables.set(name, [value, isConst]);
    return value;
  }
  assign<T>(name: string, value: T): T | Rot {
    const env = this.resolve(name);
    if (env instanceof Rot) return env;
    if (env.isConstant(name))
      return this.croak(`“${name}” is a constant; assignment prohibited.`);
    env.variables.set(name, [value, false]);
    return value;
  }
}
