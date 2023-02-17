interface R<t> {
  res: t;
  rem: string;
  err: string | null;
  type: string;
}

type outfn = <t>(
  res: t,
  rem: string,
  err: string | null,
  type?: string,
) => R<t>;

type numberOptions =
  | "digit"
  | "natural"
  | "integer"
  | "negative-integer"
  | "positive-integer"
  | "float"
  | "rational"
  | "binary"
  | "octal"
  | "hex"
  | "scientific"
  | "any";
type numeric =
  | "num:scientific"
  | "num:integer"
  | "num:real"
  | "num:hexadecimal"
  | "num:binary"
  | "num:octal"
  | "num:rational"
  | "num:Infinity"
  | "num:NaN";

type symbolic = "name:variable" | "name:function";
type bool =
  | "bool:false"
  | "bool:true";
type litType =
  | bool
  | symbolic
  | numeric;
interface basenode {
  type: `${nodeclass}:${nodesubclass}:${string}`;
}
type nodeclass = "num" | "name" | "bool" | "expression" | "function";
type nodesubclass = "function" | "variable" | "2" | "n" | "1";

interface literal extends basenode {
  value: string | boolean | number;
  type: litType;
}
interface numnode extends literal {
  value: string;
  type: numeric;
}
interface boolnode extends literal {
  value: boolean;
  type: bool;
}
interface fnamenode extends literal {
  value: string;
  type: "name:function";
}
interface varnamenode extends literal {
  value: string;
  type: "name:variable";
}

interface naryex extends basenode {
  op: string;
  args: astnode[];
  type: `expression:n`;
}
interface binex extends basenode {
  left: astnode;
  op: string;
  right: astnode;
  type: `expression:2`;
}
interface fnode extends basenode {
  name: string;
  params: string[];
  body: astnode;
  type: "function:def";
}
interface callnode extends basenode {
  caller: string;
  args: astnode;
  type: "function:call";
}
interface errnode extends basenode {
  error: string;
  origin: string;
  type: "error";
}
interface unex extends basenode {
  op: string;
  arg: astnode;
  type: "expression:1";
}

type astnode = literal | fnode | callnode | binex | errnode | unex | naryex;
type errObj = ReturnType<typeof err>;
type binaryBuilder = (left: astnode, op: string, right: astnode) => astnode;
type naryBuilder = (args: astnode[], op: string) => naryex;
type parser = (state: State) => astnode;
type State = {
  src: string;
  start: number;
  end: number;
  previous: [number, number];
  remaining: string;
  error: null | errObj;
};
type Res = R<string | string[]>;

interface ParserSettings {
  /**
   * Option that sets expression builder. Defaults
   * to conventional.
   *
   * - `conventional` - Constructs a conventional
   * parse tree. In particular, binary expressions
   * take the form:
   * ~~~
   * {left: astnode, op: string, right: astnode}
   * ~~~
   * - `algebraic` - Constructs a parse tree closer
   * to the S-expression format, conducive to algebraic
   * simplification. In particular, binary expressions
   * take the form:
   * ~~~
   * {op: string, args: astnode[]}
   * ~~~
   */
  ast?: "conventional" | "algebraic";
}
