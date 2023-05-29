export type SType =
  | "stmt-block"
  | "stmt-return"
  | "stmt-struct"
  | "stmt-cond"
  | "stmt-fn"
  | "stmt-loop"
  | "stmt-print"
  | "stmt-var";
export type LType =
  | "int"
  | "hex"
  | "octal"
  | "float"
  | "bool"
  | "null"
  | "Inf"
  | "NaN"
  | "string"
  | "binary";
export type EType =
  | "call"
  | "tuple"
  | "getex"
  | "setex"
  | "frac"
  | "assign"
  | "group"
  | "symbol"
  | "binex"
  | "vector"
  | "unex";

export type NType = SType | EType | LType;
