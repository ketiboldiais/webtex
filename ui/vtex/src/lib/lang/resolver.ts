import { left, right } from "./either.js";
import { Err, err } from "./err.js";
import { Token } from "./token.js";
import { print, string_ } from "./utils.js";
import { Assign } from "./nodes/node.assign.js";
import { ASTNode } from "./nodes/node.ast.js";
import { Atom } from "./nodes/node.atom.js";
import { Binex } from "./nodes/node.binex.js";
import { Block } from "./nodes/node.block.js";
import { Call } from "./nodes/node.call.js";
import { Cond } from "./nodes/node.cond.js";
import { Frac } from "./nodes/node.frac.js";
import { FunDef } from "./nodes/node.fundef.js";
import { Getex } from "./nodes/node.getex.js";
import { Group } from "./nodes/node.group.js";
import { Loop } from "./nodes/node.loop.js";
import { PrintNode } from "./nodes/node.print.js";
import { Return } from "./nodes/node.return.js";
import { Setex } from "./nodes/node.setex.js";
import { Sym } from "./nodes/node.sym.js";
import { Tuple } from "./nodes/node.tuple.js";
import { Unex } from "./nodes/node.unex.js";
import { VarDef } from "./nodes/node.vardef.js";
import { VectorExpr} from "./nodes/node.vector.js";
import { Visitor } from "./nodes/node.visitor.js";
import { Stack, stack } from "./nodes/stack.js";

export type LocalScope = Map<ASTNode, number>;
export type Scope = Map<string, boolean>;

enum functionType {
  none,
  function,
}

export class Resolver implements Visitor<void> {
  scopes: Stack<Scope>;
  locals: LocalScope;
  error: Err | null;
  currentFunction: functionType;
  constructor() {
    this.scopes = new Stack();
    this.locals = new Map();
    this.error = null;
    this.currentFunction = functionType.none;
  }
  private declare(name: Token): void {
    if (this.scopes.isEmpty()) return;
    const n = name._lexeme;
    this.scopes.onPeek((scope) => scope.set(n, false));
    return;
  }
  private define(name: string): void {
    if (this.scopes.isEmpty()) return;
    this.scopes.onPeek((scope) => scope.set(name, true));
    return;
  }
  private resolveLocal(n: ASTNode, name: string) {
    for (let i = this.scopes.size() - 1; i >= 0; i--) {
      if (this.scopes.at(i, (x) => x.has(name))) {
        this.addLocal(n, this.scopes.size() - 1 - i);
      }
      return;
    }
  }
  private addLocal(node: ASTNode, depth: number): void {
    this.locals.set(node, depth);
    return;
  }
  private resolveAll(nodes: ASTNode[]): void {
    const N = nodes.length;
    for (let i = 0; i < N; i++) {
      this.resolveNode(nodes[i]);
    }
    return;
  }
  private resolveNode(node: ASTNode): void {
    node.accept(this);
    return;
  }
  private begin(): void {
    this.scopes.push(new Map());
    return;
  }
  private end(): void {
    this.scopes.pop();
    return;
  }
  private resolveFn(node: FunDef, type: functionType): void {
    const enclosingFunction = this.currentFunction;
    this.currentFunction = type;
    this.begin();
    node.params.forEach((p) => {
      this.declare(p);
      this.define(p._lexeme);
    });
    this.resolveNode(node.body);
    this.end();
    this.currentFunction = enclosingFunction;
    return;
  }

  atom<x>(_: Atom<x>): void {
    return;
  }

  sym(node: Sym): void {
    const name = node.symbol._lexeme;
    if (this.scopes.peekIs((x) => x.get(name) === false)) {
      const msg = string_(`
				Reading local variable ${name} 
				in its own initializer is 
				prohibited.
			`);
      throw new Error(msg);
    }
    this.resolveLocal(node, name);

    return;
  }
  getex(node: Getex): void {
    throw new Error("getex not implemented.");
  }
  setex(node: Setex): void {
    throw new Error("setex not implemented.");
  }
  binex(node: Binex): void {
    this.resolveNode(node.left);
    this.resolveNode(node.right);
    return;
  }
  frac(node: Frac): void {
    return;
  }
  unex(node: Unex): void {
    this.resolveNode(node.arg);
    return;
  }
  group(node: Group): void {
    this.resolveNode(node.expr);
    return;
  }
  tuple(node: Tuple): void {
    this.resolveAll(node.array());
    return;
  }
  callex(node: Call): void {
    this.resolveNode(node.callee);
    this.resolveAll(node.args);
    return;
  }
  vector(node: VectorExpr): void {
    this.resolveAll(node.elements);
    return;
  }
  assign(node: Assign): void {
    this.resolveNode(node.value);
    this.resolveLocal(node, node.name._lexeme);
    return;
  }
  varStmt(node: VarDef): void {
    this.declare(node.name);
    this.resolveNode(node.body);
    this.define(node.name._lexeme);
  }
  funStmt(node: FunDef): void {
    this.declare(node.name);
    this.define(node.name._lexeme);
    this.resolveFn(node, functionType.function);
    return;
  }
  blockStmt(node: Block): void {
    this.begin();

    this.resolveAll(node.stmts);

    this.end();

    return;
  }
  condStmt(node: Cond): void {
    this.resolveNode(node.condition);
    this.resolveNode(node.ifBlock);
    this.resolveNode(node.elseBlock);
    return;
  }
  returnStmt(node: Return): void {
    if (this.currentFunction === functionType.none) {
      const msg = string_(`
        ${node.keyword.herald()} Can’t return from
        top-level code.
      `);
      throw new Error(msg);
    }
    this.resolveNode(node.value);
    return;
  }
  loopStmt(node: Loop): void {
    this.resolveNode(node.condition);
    this.resolveNode(node.body);
    return;
  }
  printStmt(node: PrintNode): void {
    this.resolveNode(node.target);
    return;
  }
  run(nodes: ASTNode[]) {
    try {
      for (let i = 0; i < nodes.length; i++) {
        this.resolveNode(nodes[i]);
      }

      return right(this.locals);
    } catch (error) {
      if (error instanceof Error) {
        return left(err(error.message));
      }
    }
    return right(this.locals);
  }
}

export function resolve(nodes: ASTNode[]) {
  const resolver = new Resolver();
  const resolution = resolver.run(nodes);
  return resolution;
}
