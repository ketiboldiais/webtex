type parser = (state: State) => astnode;
type Res = R<string | string[]>;
type Tup = string | [...Tup[]];
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
type unaryOperator = "not" | "~";

type Operator =
  | binaryOperator
  | unaryOperator;

interface emptynode {
  value: "empty";
  kind: "empty";
}
interface rootnode {
  value: emptynode | astnode;
  kind: "root";
}

interface binopnode {
  value: 'operator-binary';
  kind: binaryOperator;
}

interface unaryopnode {
  value: 'operator-unary';
  kind: unaryOperator;
}

type operator = binaryOperator | unaryOperator;

interface binexnode {
  value: { left: astnode; op: binopnode; right: astnode };
  kind: `binary-expression`;
}

type binexb = (left: astnode, op: opnode, right: astnode) => binexnode;

interface unarynode {
  value: { op: unaryopnode; right: astnode };
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

type nodekind =
  | "variable"
  | 'empty'
  | 'unknown'
  | "list"
  | "error"
  | "function::call"
  | "root"
  | "binary-expression"
  | 'operator-binary'
  | 'operator-unary'
  | "unary-expression"
  | operator
  | literal;

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
  kind: "list";
}

interface errnode {
  value: string;
  kind: "error";
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
  | binopnode
  | unaryopnode
  | emptynode
  | binexnode
  | unarynode
  | varnode
  | callnode
  | errnode;

type Delimiter = "(" | ")" | "," | "[" | "]";

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
