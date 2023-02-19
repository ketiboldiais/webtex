/* ------------------------------ Node Builders ----------------------------- */
/**
 * The functions that follow are the parser's tree node builders.
 */
type cstr<T = {}> = new (...args: any[]) => T;
function treenode<t extends cstr>(base: t, kind: nodekind) {
  return class extends base {
    kind: nodekind;
    constructor(...args: any[]) {
      super(...args);
      this.kind = kind;
    }
  };
}

const callnode = (name: astnode, args: astnode[]): callnode => {
  return { value: { name, args }, kind: "function::call" };
};

const unaryop = (kind: unaryOperator): unaryopnode => {
  return { value: "operator-unary", kind };
};

const binop = (kind: binaryOperator): binopnode => {
  return { value: "operator-binary", kind };
};

const binex = (left: astnode, op: binopnode, right: astnode): binexnode => {
  return {
    value: { left, op, right },
    kind: `binary-expression`,
  };
};

const litnode = (value: string, kind: literal) => {
  return { value, kind };
};

const variable = (value: string): varnode => {
  return { value, kind: "variable" };
};

const err = (value: string): errnode => {
  return { value, kind: "error" };
};

const prefixUnary = (op: unaryopnode, right: astnode): unarynode => {
  return ({
    value: {
      op,
      right,
    },
    kind: `unary-expression`,
  });
};

const listnode = (value: astnode[]): listnode => {
  return { value, kind: "list" };
};

export { listnode };
export { unaryop };
export { callnode };
export { binop };
export { binex };
export { prefixUnary };
export { err };
export { variable };
export { litnode };
