import {Fraction} from "@/structs/Fraction.js";
import { Compiler } from "./compiler.js";

export type RVal =
  | number
  | boolean
  | null
  | string
  | Callable
  | Fraction
  | RVal[];

export abstract class Callable {
  abstract call(compiler: Compiler, args: RVal[]): RVal;
  abstract arity(): number;
}
