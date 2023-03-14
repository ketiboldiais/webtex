import { NodeBuilder, Parslet } from "./parslet.js";
import { StringNumType, tree } from "./stringfn.js";

export type TexEntry = { bp: number; latex: string };
export type TeXDef = {
  [key: string]: (latex: string, bp?: number) => TexEntry;
};
export const tex: TeXDef = {
  symbol: (latex, bp = 50) => ({
    bp,
    latex: `\\${latex}`,
  }),
  text: (latex, bp = 50) => ({
    bp,
    latex: `\\text{${latex}}`,
  }),
  manual: (latex, bp = 50) => ({
    bp,
    latex,
  }),
};
export const functions: { [key: string]: TexEntry } = {
  arcsin: tex.symbol("arcsin"),
  cosec: tex.symbol("cosec"),
  deg: tex.symbol("deg"),
  sec: tex.symbol("sec"),
  arccos: tex.symbol("arccos"),
  acos: tex.text("acos"),
  acosh: tex.text("acosh"),
  asin: tex.text("asin"),
  asinh: tex.text("asinh"),
  atan: tex.text("atan"),
  atanh: tex.text("atanh"),
  atan2: tex.text("atan^2"),
  cosh: tex.symbol("cosh"),
  clz32: tex.text("clz32"),
  dim: tex.symbol("dim"),
  sin: tex.symbol("sin"),
  arctan: tex.symbol("arctan"),
  cot: tex.symbol("cot"),
  exp: tex.symbol("exp"),
  sinh: tex.symbol("sinh"),
  sh: tex.symbol("sh"),
  arcctg: tex.symbol("arcctg"),
  coth: tex.symbol("coth"),
  ker: tex.symbol("ker"),
  tan: tex.symbol("tan"),
  arg: tex.symbol("arg"),
  csc: tex.symbol("csc"),
  lg: tex.symbol("lg"),
  tanh: tex.symbol("tanh"),
  ch: tex.symbol("ch"),
  ctg: tex.symbol("ctg"),
  ln: tex.symbol("ln"),
  tg: tex.symbol("tg"),
  cos: tex.symbol("cos"),
  cth: tex.symbol("cth"),
  log: tex.symbol("log"),
  th: tex.symbol("th"),
  argmax: tex.symbol("argmax"),
  injlim: tex.symbol("injlim"),
  min: tex.symbol("min"),
  varinjlim: tex.symbol("varinjlim"),
  argmin: tex.symbol("argmin"),
  lim: tex.symbol("lim"),
  plim: tex.symbol("plim"),
  varliminf: tex.symbol("varliminf"),
  det: tex.symbol("det"),
  liminf: tex.symbol("liminf"),
  Pr: tex.symbol("Pr"),
  varlimsup: tex.symbol("varlimsup"),
  gcd: tex.symbol("gcd"),
  limsup: tex.symbol("limsup"),
  projlim: tex.symbol("projlim"),
  varprojli: tex.symbol("varprojli"),
  inf: tex.symbol("inf"),
  max: tex.symbol("max"),
  sup: tex.symbol("sup"),
  sqrt: tex.symbol("sqrt"),
  hypot: tex.text("hypot"),
};

export const symbols: { [key: string]: TexEntry } = {
  Alpha: tex.symbol("Alpha"),
  Beta: tex.symbol("Beta"),
  Gamma: tex.symbol("Gamma"),
  Delta: tex.symbol("Delta"),
  Epsilon: tex.symbol("Epsilon"),
  Zeta: tex.symbol("Zeta"),
  Eta: tex.symbol("Eta"),
  Theta: tex.symbol("Theta"),
  Iota: tex.symbol("Iota"),
  Kappa: tex.symbol("Kappa"),
  Lambda: tex.symbol("Lambda"),
  Mu: tex.symbol("Mu"),
  Nu: tex.symbol("Nu"),
  Xi: tex.symbol("Xi"),
  Omicron: tex.symbol("Omicron"),
  Pi: tex.symbol("Pi"),
  Rho: tex.symbol("Rho"),
  Sigma: tex.symbol("Sigma"),
  Tau: tex.symbol("Tau"),
  Upsilon: tex.symbol("Upsilon"),
  Phi: tex.symbol("Phi"),
  Chi: tex.symbol("Chi"),
  Psi: tex.symbol("Psi"),
  Omega: tex.symbol("Omega"),
  varGamma: tex.symbol("varGamma"),
  varDelta: tex.symbol("varDelta"),
  varTheta: tex.symbol("varTheta"),
  varLambda: tex.symbol("varLambda"),
  varXi: tex.symbol("varXi"),
  varPi: tex.symbol("varPi"),
  varSigma: tex.symbol("varSigma"),
  varUpsilon: tex.symbol("varUpsilon"),
  varPhi: tex.symbol("varPhi"),
  varPsi: tex.symbol("varPsi"),
  varOmega: tex.symbol("varOmega"),
  alpha: tex.symbol("alpha"),
  beta: tex.symbol("beta"),
  gamma: tex.symbol("gamma"),
  delta: tex.symbol("delta"),
  epsilon: tex.symbol("epsilon"),
  zeta: tex.symbol("zeta"),
  eta: tex.symbol("eta"),
  theta: tex.symbol("theta"),
  iota: tex.symbol("iota"),
  kappa: tex.symbol("kappa"),
  lambda: tex.symbol("lambda"),
  mu: tex.symbol("mu"),
  nu: tex.symbol("nu"),
  xi: tex.symbol("xi"),
  omicron: tex.symbol("omicron"),
  pi: tex.symbol("pi"),
  rho: tex.symbol("rho"),
  sigma: tex.symbol("sigma"),
  tau: tex.symbol("tau"),
  upsilon: tex.symbol("upsilon"),
  phi: tex.symbol("phi"),
  chi: tex.symbol("chi"),
  psi: tex.symbol("psi"),
  omega: tex.symbol("omega"),
  varepsilon: tex.symbol("varepsilon"),
  varkappa: tex.symbol("varkappa"),
  vartheta: tex.symbol("vartheta"),
  thetasym: tex.symbol("thetasym"),
  varpi: tex.symbol("varpi"),
  varrho: tex.symbol("varrho"),
  varsigma: tex.symbol("varsigma"),
  varphi: tex.symbol("varphi"),
  digamma: tex.symbol("digamma"),
  imath: tex.symbol("imath"),
  nabla: tex.symbol("nabla"),
  Im: tex.symbol("Im"),
  Reals: tex.symbol("Reals"),
  jmath: tex.symbol("jmath"),
  partial: tex.symbol("partial"),
  image: tex.symbol("image"),
  wp: tex.symbol("wp"),
  aleph: tex.symbol("aleph"),
  Game: tex.symbol("Game"),
  Bbbk: tex.symbol("Bbbk"),
  weierp: tex.symbol("weierp"),
  alef: tex.symbol("alef"),
  Finv: tex.symbol("Finv"),
  N: tex.symbol("N"),
  Z: tex.symbol("Z"),
  alefsym: tex.symbol("alefsym"),
  cnums: tex.symbol("cnums"),
  natnums: tex.symbol("natnums"),
  beth: tex.symbol("beth"),
  Complex: tex.symbol("Complex"),
  R: tex.symbol("R"),
  gimel: tex.symbol("gimel"),
  ell: tex.symbol("ell"),
  Re: tex.symbol("Re"),
  daleth: tex.symbol("daleth"),
  hbar: tex.symbol("hbar"),
  real: tex.symbol("real"),
  eth: tex.symbol("eth"),
  hslash: tex.symbol("hslash"),
  reals: tex.symbol("reals"),
};
export const delimiters = [
  { pattern: /^\(/, bp: 1 },
  { pattern: /^\)/, bp: 1 },
  { pattern: /^\{/, bp: 1 },
  { pattern: /^\}/, bp: 1 },
  { pattern: /^\[/, bp: 1 },
  { pattern: /^\]/, bp: 1 },
  { pattern: /^,/, bp: 1 },
  { pattern: /^;/, bp: 1 },
  { pattern: /^'/, bp: 1 },
];
export const operators = [
  { pattern: /^==/, bp: 5, kind: "binop" },
  { pattern: /^=/, bp: 5, kind: "binop" },
  { pattern: /^[><]=?/, bp: 5, kind: "binop" },
  { pattern: /^\+/, bp: 10, kind: "binop" },
  { pattern: /^-/, bp: 11, kind: "binop" },
  { pattern: /^\*/, bp: 12, kind: "binop" },
  { pattern: /^[\/]/, bp: 13, kind: "binop" },
  { pattern: /^%/, bp: 14, kind: "binop" },
  { pattern: /^[\/\/]/, bp: 15, kind: "binop" },
  { pattern: /^\^/, bp: 16, kind: "binop" },
  { pattern: /^@/, bp: 17, kind: "binop" },
  { pattern: /^!/, bp: 18, kind: "unop" },
];
function isNumber(node: any): node is numnode {
  return node && node["num"] !== undefined;
}

function isString(node: any): node is strnode {
  return node && node["str"] !== undefined;
}

function isSymbol(node: any): node is symnode {
  return node && node["sym"] !== undefined;
}

function isFn(node: any): node is funnode {
  return node && node["op"] !== undefined;
}

function isList(node: any): node is listnode {
  return node && node["list"] !== undefined;
}

function isNil(node: any): node is nilnode {
  return node && node["value"] !== undefined;
}

interface numnode {
  num: string;
  kind: StringNumType;
}
interface strnode {
  str: string;
}
interface symnode {
  sym: string;
}
interface funnode {
  op: texnode;
  left: texnode;
  right: texnode;
}
interface listnode {
  list: texnode[];
}
interface nilnode {
  value: "null";
}
export type DictEntry = {
  [key: string]: texnode[];
};
type texnode =
  | numnode
  | strnode
  | symnode
  | funnode
  | listnode
  | nilnode;
type TexTreeConfig = NodeBuilder<
  numnode,
  strnode,
  symnode,
  funnode,
  listnode,
  nilnode
>;

export const mtex: TexTreeConfig = {
  number: (num, kind) => ({ num, kind }),
  isNumber,
  string: (str) => ({ str }),
  isString,
  symbol: (sym) => {
    if (symbols[sym] !== undefined) {
      return { sym: symbols[sym].latex };
    }
    return { sym };
  },
  isSymbol,
  fn: (fn) => ({ op: fn[0], left: fn[1], right: fn[2] }),
  isFn,
  list: (list) => ({ list }),
  isList,
  nil: () => ({ value: "null" }),
  isNil,
  delimiters,
  operators,
  functions,
  symbols,
};
export class LatexParser {
  private parser: Parslet<
    numnode,
    strnode,
    symnode,
    funnode,
    listnode,
    nilnode
  >;
  tree: texnode = mtex.nil();
  constructor() {
    this.parser = new Parslet(mtex);
  }
  ast(source: string) {
    const res = this.parser.parse(source);
    return tree(res);
  }
  parse(source: string) {
    return this.parser.parse(source);
  }
  latex(source: string) {
    this.tree = this.parser.parse(source);
    return this.latexify(this.tree);
  }
  private latexify(node: texnode) {
    let res = "";
    if (isNumber(node)) {
      res += this.latexNumber(node);
    } else if (isString(node)) {
      res += this.latexString(node);
    } else if (isSymbol(node)) {
      res += this.latexSymbol(node);
    } else if (isFn(node)) {
      res += this.latexFn(node);
    } else if (isList(node)) {
      res += this.latexList(node);
    } else {
      res += "";
    }
    return res;
  }
  private latexSymbol(node: symnode) {
    return node.sym;
  }
  private latexNumber(node: numnode) {
    switch (node.kind) {
      case "integer":
      case "float":
      case "complex-number":
        return node.num;
      case "binary": {
        const digits = node.num.slice(2);
        return `${digits}_2`;
      }
      case "hex": {
        const digits = node.num.slice(2);
        return `${digits}_{16}`;
      }
      case "scientific": {
        const [base, pow] = node.num.split("E");
        return `${base} \\times 10^${pow}`;
      }
    }
    return "";
  }
  private latexString(node: strnode) {
    return `\\text{\\textquotedblleft}${node.str}\\text{\\textquotedblright}`;
  }
  private latexFn(node: funnode) {
    const op: any = this.latexify(node.op);
    const left: any = this.latexify(node.left);
    const right: any = this.latexify(node.right);
    if (typeof op === "string") {
      if (functions[op] !== undefined) {
        let tx: string = functions[op].latex;
        let args = "";
        if (typeof right === "string") {
          args += right;
        }
        if (typeof left === "string") {
          args += left;
        }
        let out = tx + `\\left(` + args + `\\right)`;
        if (op === "sqrt") {
          return tx + `{` + args + `}`;
        }
        return out;
      }
      if (typeof left === "string" || typeof right === "string") {
        switch (true) {
          case op === "/":
            return `\\dfrac{${left}}{${right}}`;
          case op === "^":
            return left + `${op}` + right;
          case op === "%":
            return left + `\\%` + right;
          case op === "+":
          case op === "-":
          case op === "=":
            return left + ` ${op} ` + right;
          case op === "*":
            if (/\d+/.test(left) && /[a-zA-Z_]+/.test(right)) {
              return `${left}${right}`;
            }
            return left + ` \\times ` + right;
          case op === "<":
            return left + `\\lt` + right;
          case op === ">":
            return left + `\\gt` + right;
          case op === "<=":
            return left + `\\leq` + right;
          case op === ">=":
            return left + `\\geq` + right;
          case op === "==":
            return left + `\\equiv` + right;
        }
      }
    }
  }
  private latexList(node: listnode) {
    return JSON.stringify(node.list);
  }
}
