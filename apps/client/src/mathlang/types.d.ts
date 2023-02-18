type parser = (state: State) => astnode;
type Res = R<string | string[]>;
type State = {
  src: string;
  start: number;
  end: number;
  danglingDelimiter: boolean;
  prevtoken: string;
  remaining: string;
  error: errnode | null;
};

type binaryOperator =
  | "+"
  | "-"
  | "*"
  | "/"
  | "%"
  | "rem"
  | "mod"
  | "to"
  | "|"
  | "&"
  | ">>"
  | "<<"
  | ">>>"
  | "=="
  | "="
  | "!="
  | ">"
  | ">="
  | "<"
  | "<="
  | "++"
  | "--"
  | "^";
type unaryOperator = "+" | "~" | "not" | "-";

type Operator =
  | binaryOperator
  | unaryOperator;

interface emptynode {
  value: "empty";
  kind: "empty::empty";
}
interface rootnode {
  value: emptynode | astnode;
  kind: "tree::root";
}
interface opnode {
  value: Operator;
  kind: `operator`;
}
type opnodeb = (value: Operator) => opnode;

interface binexnode {
  value: { left: astnode; op: opnode; right: astnode };
  kind: `binary-expression`;
}
type binexb = (left: astnode, op: opnode, right: astnode) => binexnode;

interface preFixUnaryNode {
  value: { op: opnode; right: astnode };
  kind: `unary-expression`;
}

type literal =
  | "hexadecimal"
  | "binary"
  | "octal"
  | "scientific"
  | "float"
  | "integer"
  | "rational"
  | "string"
  | "bool";

type stringb = (value: string) => stringnode;

interface litnode {
  value: string;
  kind: literal;
}

interface varnode {
  value: string;
  kind: "variable";
}

type varnodeb = (value: string) => varnode;

interface listnode {
  value: astnode[];
  kind: "list::list";
}
interface errnode {
  value: string;
  kind: "error::error";
}
interface callnode {
  value: {
    name: astnode;
    args: astnode[];
  };
  kind: "function::call";
}
type callnodeb = (name: astnode, args: astnode[]) => callnode;
type astnode =
  | rootnode
  | litnode
  | listnode
  | emptynode
  | opnode
  | binexnode
  | preFixUnaryNode
  | varnode
  | callnode
  | errnode
  | binarynode;

type Delimiter = "(" | ")" | "," | '[' | ']';

type tokenspec = {
  operator: {
    binary: { [key in binaryOperator]: P<string> };
    unary: { [key in unaryOperator]: P<string> };
  };
  delimiter: {
    [key in Delimiter]: P<string>;
  };
  lit: { [key in literal]: P<string> };
  symbol: {
    variable: P<string>;
  };
};

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
