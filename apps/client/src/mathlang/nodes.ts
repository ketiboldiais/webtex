import {
  ch,
  chain,
  choice,
  latin,
  lit,
  many,
  num,
  possibly,
  regex,
  term,
} from "./combinators";

/**
 * A record of all the tokens recognized by the
 * parser.
 */
export const token = {
  delimiter: {
    lparen: ch("("),
    rparen: ch(")"),
  },
  relation: {
    ["<"]: ch("<"),
    [">"]: ch(">"),
    ["<="]: ch("<="),
    [">="]: ch(">="),
    ["=="]: ch("=="),
    ["!="]: ch("!="),
    ["="]: ch("="),
  },
  binop: {
    ["+"]: ch("+"),
    ["-"]: ch("-"),
    ["*"]: ch("*"),
    ["/"]: ch("/"),
    ["%"]: ch("%"),
    rem: ch("rem"),
    mod: ch("mod"),
    ["^"]: ch("^"),
  },
  unaryop: {
    ["+"]: ch("+"),
    ["~"]: ch("~"),
    not: ch("not"),
  },
  number: {
    hex: term(num("hex")).typemap<litType>((_) => "num:hexadecimal"),
    binary: term(num("binary")).typemap<litType>((_) => "num:binary"),
    octal: term(num("octal")).typemap<litType>((_) => "num:octal"),
    scientific: term(num("scientific")).typemap<litType>((_) =>
      "num:scientific"
    ),
    rational: term(num("rational")).typemap<litType>((_) => "num:rational"),
    real: term(num("float")).typemap<litType>((_) => "num:real"),
    integer: term(num("integer")).typemap<litType>((_) => "num:integer"),
    inf: term(lit("Infinity")).typemap<litType>((_) => "num:Infinity"),
    nan: term(lit("NaN")).typemap<litType>((_) => "num:NaN"),
  },
  bool: {
    false: term(lit("false")).typemap<litType>((_) => "bool:false"),
    true: term(lit("true")).typemap<litType>((_) => "bool:true"),
  },
  symbol: {
    variable: term(many([latin("any")])).typemap<litType>((_) =>
      "name:variable"
    ),
    funcname: chain([
      many([latin("any")]),
      possibly(many([regex(/^\d+/)])),
      possibly(lit("_")),
    ]).map((d) => d.flat().join("")).typemap<litType>((_) => "name:function"),
  },
};

/**
 * Returns `true` if the result from a parser is a `numnode`.
 */
export function isNumeric(r: Res) {
  return r.type.split(":")[0] === "num" && !r.err;
}

export const literals = choice([
  token.number.hex,
  token.number.binary,
  token.number.octal,
  token.number.scientific,
  token.number.rational,
  token.number.real,
  token.number.integer,
  token.bool.false,
  token.bool.true,
  token.number.inf,
  token.number.nan,
  token.symbol.variable,
]);

export function typeclass(node: basenode): nodeclass | null {
  if (!node.type) return null;
  const out = node.type.split(":")[0];
  return out as nodeclass;
}
export function subclass(node: basenode): nodesubclass | null {
  if (!node.type) return null;
  const out = node.type.split(":")[1];
  return out as nodesubclass;
}
/** Object containing node builders. */
export const node = {
  /** Builds a literal node. */
  literal: (value: string, type: litType): literal => {
    switch (type) {
      case "bool:false":
        return { value: false, type } as boolnode;
      case "bool:true":
        return { value: true, type } as boolnode;
      case "name:function":
        return { value, type } as fnamenode;
      case "name:variable":
        return { value, type } as varnamenode;
      case "num:binary":
      case "num:Infinity":
      case "num:NaN":
      case "num:hexadecimal":
      case "num:integer":
      case "num:octal":
      case "num:rational":
      case "num:real":
      case "num:scientific":
        return { value, type } as numnode;
    }
  },
  is: {
    bool: (node: any): node is boolnode => typeclass(node) === "bool",
    num: (node: any): node is numnode => typeclass(node) === "num",
    fname: (node: any): node is fnamenode =>
      typeclass(node) === "name" && subclass(node) === "function",
    varnamenode: (node: any): node is varnamenode =>
      typeclass(node) === "name" && subclass(node) === "variable",
    naryex: (node: any): node is varnamenode =>
      typeclass(node) === "expression" && subclass(node) === "n",
    binex: (node: any): node is varnamenode =>
      typeclass(node) === "expression" && subclass(node) === "2",
    unex: (node: any): node is unex =>
      typeclass(node) === "expression" && subclass(node) === "1",
  },
  /** Builds a binary expression node. */
  binex: (
    left: astnode,
    op: string,
    right: astnode,
  ): binex => ({
    left,
    op,
    right,
    type: `expression:2`,
  }),

  /** Builds an n-ary expression node. */
  nary: (args: astnode[], op: string): naryex => ({
    op,
    args,
    type: `expression:n`,
  }),
  /** Builds a function call node. */
  call: (caller: string, args: astnode): callnode => ({
    caller,
    args,
    type: "function:call",
  }),
  /** Builds a function definition node. */
  fndef: (name: string, params: string[], body: astnode): fnode => ({
    name,
    params,
    body,
    type: "function:def",
  }),
  /** Builds a unary expression node. */
  unex: (op: string, arg: astnode): unex => ({
    op,
    arg,
    type: "expression:1",
  }),
};
