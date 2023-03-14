import { ast } from "./nodes/index.js";
import { SYMBOL } from "./nodes/index.js";
import { Calculi, lib } from "./structs/mathfn.js";

export class Library {
  private record: Calculi;
  constructor(record: Calculi) {
    this.record = record;
  }
  hasNamedValue(name: string) {
    return this.record.hasOwnProperty(name);
  }
  getFunction(name: string): Function | undefined {
    const res = this.record[name];
    if (typeof res.val === "function") return res.val;
  }
  getConstantNode(name: string) {
    if (this.record[name]) {
      const fn = this.record[name].node;
      if (fn) return fn();
    }
    return ast.symbol(name, SYMBOL.CONSTANT);
  }
  getNumericConstant(name: string): number | undefined {
    const result = this.record[name];
    if (typeof result.val === "number") return result.val;
  }
  hasFunction(name: string) {
    if (this.record[name]) {
      return typeof this.record[name].val === "function";
    }
    return false;
  }
  hasConstant(name: string) {
    if (this.record[name]) {
      return typeof this.record[name].val === "number";
    }
    return false;
  }
  static execute() {
  }
}
export const corelib = new Library(lib);
export class Scope {
  values: { [key: string]: any };
  parent?: Scope;
  constructor(parent?: Scope) {
    this.values = {};
    this.parent = parent;
  }
  assign(name: string, value: any) {
    if (this.has(name)) {
      this.values[name] = value;
      return value;
    } else if (this.parent !== undefined) {
      this.parent.assign(name, value);
      return value;
    } else {
      this.values[name] = value;
      return value;
    }
  }
  has(name: string) {
    return this.values[name] !== undefined || lib[name] !== undefined;
  }
  define(name: string, value: any) {
    if (this.has(name)) {
      return null;
    }
    this.values[name] = value;
    return value;
  }
  get(name: string): any {
    if (this.has(name)) return this.values[name];
    if (this.parent !== undefined) return this.parent.get(name);
    return null;
  }
}
