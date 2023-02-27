import { ASTNode, Err } from "./nodes";

export class Environment {
  variables: Map<string, ASTNode>;
  constants: Map<string, ASTNode>;
  functions: Map<string, { params: ASTNode[]; body: ASTNode }>;
  parent?: Environment;
  constructor(parent?: Environment) {
    this.variables = new Map();
    this.constants = new Map();
    this.functions = new Map();
    this.parent = parent;
  }
  declareFunction(name: string, params: ASTNode[], body: ASTNode) {
    this.functions.set(name, { params, body });
  }
  declareVariable(name: string, value: ASTNode): ASTNode {
    if (this.variables.has(name)) {
      return new Err(`Redeclaration of ${name} prohibited.`);
    }
    this.variables.set(name, value);
    return value;
  }
  resolve(name: string): Environment | null {
    if (this.variables.has(name)) {
      return this;
    }
    if (this.parent === undefined) {
      return null;
    }
    return this.parent.resolve(name);
  }
  lookup(name: string) {
    const env = this.resolve(name);
    if (env instanceof Err) return env;
    return env?.variables.get(name);
  }
}
