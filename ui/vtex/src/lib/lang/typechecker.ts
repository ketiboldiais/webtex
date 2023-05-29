import { left, right } from "./either";
import { Environment } from "./environment";
import { err } from "./err";
import { Assign } from "./nodes/node.assign";
import { ASTNode } from "./nodes/node.ast";
import { Atom } from "./nodes/node.atom";
import { Binex } from "./nodes/node.binex";
import { Block } from "./nodes/node.block";
import { Call } from "./nodes/node.call";
import { Cond } from "./nodes/node.cond";
import { Frac } from "./nodes/node.frac";
import { FunDef } from "./nodes/node.fundef";
import { Getex } from "./nodes/node.getex";
import { Group } from "./nodes/node.group";
import { Loop } from "./nodes/node.loop";
import { PrintNode } from "./nodes/node.print";
import { Return } from "./nodes/node.return";
import { Setex } from "./nodes/node.setex";
import { Sym } from "./nodes/node.sym";
import { Tuple } from "./nodes/node.tuple";
import { Unex } from "./nodes/node.unex";
import { VarDef } from "./nodes/node.vardef";
import { VectorExpr } from "./nodes/node.vector";
import { Visitor } from "./nodes/node.visitor";

class TypeChecker implements Visitor<ASTNode> {
  typeError: string | null = null;
  check(node: ASTNode): ASTNode {
    return node.accept(this);
  }
  atom<x>(node: Atom<x>) {
    return node;
  }
  sym(node: Sym) {
    return node;
  }
  getex(node: Getex) {
    return node;
  }
  setex(node: Setex) {
    return node;
  }
  binex(node: Binex) {
    return node;
  }
  frac(node: Frac) {
    return node;
  }
  unex(node: Unex) {
    return node;
  }
  group(node: Group) {
    return node;
  }
  tuple(node: Tuple) {
    return node;
  }
  callex(node: Call) {
    return node;
  }
  vector(node: VectorExpr) {
    return node;
  }
  assign(node: Assign) {
    return node;
  }
  varStmt(node: VarDef) {
    return node;
  }
  funStmt(node: FunDef) {
    return node;
  }
  blockStmt(node: Block) {
    return node;
  }
  condStmt(node: Cond) {
    return node;
  }
  returnStmt(node: Return) {
    return node;
  }
  loopStmt(node: Loop) {
    return node;
  }
  printStmt(node: PrintNode) {
    return node;
  }
  typecheck(nodes: ASTNode[]) {
    const output: ASTNode[] = [];
    try {
      for (let i = 0; i < nodes.length; i++) {
        output.push(this.check(nodes[i]));
      }
    } catch (error) {
      if (error instanceof Error) {
        const msg = error.message;
        return left(err(msg));
      }
    }
    return right(output);
  }
}

export function typecheck(nodes: ASTNode[]) {
  const typechecker = new TypeChecker();
}
