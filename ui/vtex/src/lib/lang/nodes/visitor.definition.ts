import { Num } from "./number.node.js";
import { BinaryExpression } from "./binex.node.js";
import { Nil } from "./nil.node.js";
import { Bool } from "./bool.node.js";
import { Sym } from "./symbol.node.js";
import { Call } from "./call.node.js";
import { UnaryExpression } from "./unary.node.js";
import { Str } from "./string.node.js";
import { FunctionDeclaration } from "./function.node.js";
import { Tuple } from "./tuple.node.js";
import {Block} from "./block.node.js";
import {Loop} from "./loop.node.js";
import {Assign} from "./assignment.node.js";
import {VariableDeclaration} from "./variable.node.js";

// § Visitor Interface ===============================================
/**
 * All tree-traversal functions must
 * implement the `Visitor` interface.
 */
export interface Visitor<T> {
  number(node: Num): T;
  nil(node: Nil): T;
  bool(node: Bool): T;
  symbol(node: Sym): T;
  string(node: Str): T;
  call(node: Call): T;
  unary(node: UnaryExpression): T;
  binex(node: BinaryExpression): T;
  funcDef(node: FunctionDeclaration): T;
  varDef(node:VariableDeclaration): T;
  tuple(node: Tuple<any>): T;
  block(node: Block): T;
  loop(ndoe:Loop): T;
  assign(node:Assign): T;
}
