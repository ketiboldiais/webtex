import { print, strTree } from "./utils.js";
import { Either, left, right } from "./either.js";
import { tkn, Token, token } from "./token.js";
import { bp } from "./bp.js";
import { Err, err, expect } from "./err.js";
import { nAssign } from "./nodes/node.assign.js";
import { ASTNode } from "./nodes/node.ast.js";
import {
  is_nNil,
  nBin,
  nFalse,
  nFloat,
  nHex,
  nInf,
  nInt,
  nNaN,
  nNil,
  nOct,
  nStr,
  nTrue,
  tempnode,
} from "./nodes/node.atom.js";
import { nBinex } from "./nodes/node.binex.js";
import { Block, nBlock } from "./nodes/node.block.js";
import { nCall } from "./nodes/node.call.js";
import { nCond } from "./nodes/node.cond.js";
import { nFrac } from "./nodes/node.frac.js";
import { nFnDef } from "./nodes/node.fundef.js";
import { nGroup } from "./nodes/node.group.js";
import { nLoop } from "./nodes/node.loop.js";
import { nPrint } from "./nodes/node.print.js";
import { nReturn } from "./nodes/node.return.js";
import { is_nSym, nSym } from "./nodes/node.sym.js";
import { nTuple } from "./nodes/node.tuple.js";
import { nUnex } from "./nodes/node.unex.js";
import { nVarDef } from "./nodes/node.vardef.js";
import { nVector } from "./nodes/node.vector.js";
import { compile, Compiler, interpret } from "./compiler.js";

const isWS = (c: string) => (
  c === " " ||
  c === "\n" ||
  c === "\t" ||
  c === "\r"
);
// § State
class State {
  _start!: number;
  _current!: number;
  _source!: string;
  _line!: number;
  _column!: number;
  _peek!: Token;
  _prev!: Token;
  _lastnode!: ASTNode;
  _error!: Err | null;
  _prevchar!: string;
  init(source: string) {
    this._start = 0;
    this._current = 0;
    this._line = 0;
    this._column = 0;
    this._source = source;
    this._peek = token();
    this._prev = token();
    this._lastnode = nNil;
    this._error = null;
    this._prevchar = "";
  }
  atEnd() {
    return this._current >= this._source.length;
  }
  prevIs(type: tkn) {
    return this._prev.is(type);
  }
  peekIs(type: tkn) {
    return this._peek.is(type);
  }
  setError(error: Err) {
    this._error = error;
    return this;
  }
  setLastNode(node: ASTNode) {
    this._lastnode = node;
    return this;
  }
  hasInput() {
    return this._current < this._source.length;
  }
  substr() {
    return this._source.slice(this._start, this._current);
  }
  tick() {
    const c = this.c1();
    if (!isWS(c)) {
      this._prevchar = c;
    }
    if (c === "\n") {
      this._line++;
      this._column = 0;
    } else {
      this._column++;
    }
    return this._source[this._current++];
  }
  c1() {
    return this._source[this._current];
  }
  c2() {
    return this._source[this._current + 1];
  }
  c3() {
    return this._source[this._current + 2];
  }
  private skipws() {
    while (this.hasInput()) {
      const c = this.c1();
      // deno-fmt-ignore
      switch (c) {
				case ' ':
				case '\r':
				case '\t':
				case '\n':
					this.tick();
					break;
				default:
					return;
			}
    }
  }
  map(f: (c: string) => Token) {
    this.skipws();
    this._start = this._current;
    const c = this.tick();
    return f(c);
  }
  charIs(c: string) {
    return this.c1() === c;
  }
  match(c: string) {
    if (!this.hasInput()) return false;
    if (!this.charIs(c)) return false;
    this.tick();
    return true;
  }
  forward(cond: (c1: string, c2: string) => boolean) {
    let c = this._prevchar;
    while (cond(this.c1(), this.c2()) && this.hasInput()) {
      c += this.tick();
    }
    return c;
  }
  token(t: Token) {
    const prev = this._peek;
    const line = this._line;
    const column = this._column;
    const lexeme = t._lexeme ? t._lexeme : this.substr();
    const newpeek = t
      .line(line)
      .column(column)
      .lexeme(lexeme);
    this._peek = newpeek;
    return prev;
  }
}
const enstate = () => new State();
type TexSyms = { symbols: Record<string, string> };
type TexCodes = TexSyms;
const isDQuote = (c: string) => (c === `"`);
const isDigit = (c: string) => (
  "0" <= c && c <= "9"
);
const isScinum = (c1: string, c2: string, c3: string) => {
  if (c1 !== "E") return false;
  if (c2 === "+" || c2 === "-") {
    return isDigit(c3);
  }
  return isDigit(c2);
};
const isLatin = (c: string) => (
  ("a" <= c && c <= "z") ||
  ("A" <= c && c <= "Z")
);
const isHexit = (c: string) => (
  ("a" <= c && c <= "f") ||
  ("A" <= c && c <= "F") ||
  ("0" <= c && c <= "9")
);
const isOctit = (c: string) => (
  "0" <= c && c <= "7"
);
const isBit = (c: string) => (
  (c === "0") || (c === "1")
);
const isPreBit = (c1: string, c2: string, c3: string) => (
  c1 === "0" &&
  c2 === "b" &&
  isBit(c3)
);
const isPreHex = (c1: string, c2: string, c3: string) => (
  c1 === "0" &&
  c2 === "x" &&
  isHexit(c3)
);
const isPreOct = (c1: string, c2: string, c3: string) => (
  c1 === "0" &&
  c2 === "o" &&
  isOctit(c3)
);
const char = (c: string) => {
  // deno-fmt-ignore
  switch (c) {
    case "(": return token(tkn.left_paren);
    case ")": return token(tkn.right_paren);
    case "[": return token(tkn.left_bracket);
    case "]": return token(tkn.right_bracket);
    case "{": return token(tkn.left_brace);
    case "}": return token(tkn.right_brace);
    case ",": return token(tkn.comma);
    case ".": return token(tkn.dot);
    case ":": return token(tkn.colon);
    case ";": return token(tkn.semicolon);
    case "+": return token(tkn.plus);
    case "-": return token(tkn.minus);
    case "*": return token(tkn.star);
    case "%": return token(tkn.percent);
    case "^": return token(tkn.caret);
    case "/": return token(tkn.slash);
    case "<": return token(tkn.lt);
    case ">": return token(tkn.gt);
    case "!": return token(tkn.bang);
    case "=": return token(tkn.eq);
    case '"': return token(tkn.string);
    default: return token(tkn.unknown);
  }
};

const keyword = (text: string) => {
  // deno-fmt-ignore
  switch (text) {
		case 'let': return token(tkn.let);
		case 'print': return token(tkn.print);
		case 'sqrt': return token(tkn.sqrt);
		case 'fn': return token(tkn.fn);
		case 'rem': return token(tkn.rem);
		case 'div': return token(tkn.div);
		case 'mod': return token(tkn.mod);
		case 'and': return token(tkn.and);
		case 'nand': return token(tkn.nand);
		case 'not': return token(tkn.not);
		case 'or': return token(tkn.or);
		case 'nor': return token(tkn.nor);
		case 'xor': return token(tkn.xor);
		case 'xnor': return token(tkn.xnor);
		case 'struct': return token(tkn.struct);
		case 'for': return token(tkn.for);
		case 'while': return token(tkn.while);
		case 'is': return token(tkn.is);
		case 'return': return token(tkn.return);
		case 'true': return token(tkn.true);
		case 'false': return token(tkn.false);
		case 'inf': return token(tkn.inf);
		case 'nan': return token(tkn.nan);
		case 'null': return token(tkn.null);
		case 'if': return token(tkn.if);
		case 'else': return token(tkn.else);
		default: return token(tkn.symbol);
	}
};

type Parslet = (
  prev: Token,
  peek: Token,
) => Either<Err, ASTNode>;

type PSpec = Record<tkn, [Parslet, Parslet, bp]>;

export function engine() {
  const dict: TexCodes = {
    symbols: {
      Alpha: "&#x391;",
      alpha: `&#x3b1;`,
      Beta: `&#x392;`,
      beta: `&#x3b2;`,
      Gamma: `&#x393;`,
      gamma: `&#x3b3;`,
      Delta: `&#x394;`,
      delta: `&#x3b4;`,
      Epsilon: `&#x395;`,
      epsilon: `&#x3b5;`,
      Zeta: `&#x396;`,
      zeta: `&#x3b6;`,
      Eta: `&#x397;`,
      eta: `&#x3b7;`,
      Theta: `&#x398;`,
      theta: `&#x3b8;`,
      Iota: `&#x399;`,
      iota: `&#x3b9;`,
      Kappa: `&#x39a;`,
      kappa: `&#x3ba;`,
      Lambda: `&#x39b;`,
      lambda: `&#x3bb;`,
      Mu: `&#x39c;`,
      mu: `&#x3bc;`,
      Nu: `&#x39d;`,
      nu: `&#x3bd;`,
      Xi: `&#x39e;`,
      xi: `&#x3be;`,
      Omicron: `&#x39f;`,
      omicron: `&#x3bf;`,
      Pi: `&#x3a0;`,
      pi: `&#x3c0;`,
      Rho: `&#x3a1;`,
      rho: `&#x3c1;`,
      Sigma: `&#x3a3;`,
      sigma: `&#x3c3;`,
      Tau: `&#x3a4;`,
      tau: `&#x3c4;`,
      Upsilon: `&#x3a5;`,
      upsilon: `&#x3c5;`,
      Phi: `&#x3a6;`,
      phi: `&#x3c6;`,
      Chi: `&#x3a7;`,
      chi: `&#x3c7;`,
      Psi: `&#x3a8;`,
      psi: `&#x3c8;`,
      Omega: `&#x3a9;`,
      omega: `&#x3c9;`,
    },
  };
  const state = enstate();
  const report = (source: string, message: string) => {
    const L = state._line;
    const C = state._column;
    const S = `[${source}]: `;
    const line = `On line ${L}, column ${C}, `;
    const msg = S + line + message;
    const E = err(msg);
    state.setError(E);
    return left(E);
  };
  // deno-fmt-ignore
  const pickleft = (
    a: tkn,
    char: string,
    b: tkn,
  ) => (t: Token) => (t.type(state.match(char) ? a : b));
  const string = () => {
    state.forward((c) => !isDQuote(c));
    if (state.atEnd()) {
      return token(tkn.error, `Unterminated string`);
    }
    state.tick();
    const lexeme = state.substr().slice(1, -1);
    return token(tkn.string, lexeme);
  };
  const symscan = () => {
    const text = state.forward(
      (c) => isLatin(c) || c === "_" || c === `'` || isDigit(c),
    );
    return keyword(text).lexeme(text);
  };

  const sciscan = () => {
    state.tick(); // eat the 'E'
    state.match("+");
    state.match("-");
    state.forward(isDigit);
    return token(tkn.scinum);
  };
  const floatscan = () => {
    state.forward(isDigit);
    if (isScinum(state.c1(), state.c2(), state.c3())) {
      return sciscan();
    }
    return token(tkn.float);
  };
  const intscan = () => {
    state.forward(isDigit);
    if (state.charIs(".") && isDigit(state.c2())) {
      state.tick();
      return floatscan();
    }
    if (isScinum(state.c1(), state.c2(), state.c3())) {
      return sciscan();
    }
    return token(tkn.integer);
  };
  const scantex = () => {
    state.tick(); // eat the `~`
    state.forward(isLatin);
    const lex = state.substr().slice(1);
    return token(tkn.texcode, lex);
  };
  const scanOct = () => {
    state.tick(); // eat the '0'
    state.tick(); // eat the 'o'
    state.forward(isOctit);
    const lex = state.substr();
    return token(tkn.octal).lexeme(lex);
  };
  const scanHex = () => {
    state.tick(); // eat the '0'
    state.tick(); // eat the 'x'
    state.forward(isHexit);
    const lex = state.substr();
    return token(tkn.hex).lexeme(lex);
  };
  const scanbinary = () => {
    state.tick(); // eat the '0'
    state.tick(); // eat the 'b'
    state.forward(isBit);
    const lex = state.substr();
    return token(tkn.binary).lexeme(lex);
  };
  const read = (c: string) => {
    if (c === "!" && isLatin(state.c2())) return scantex();
    if (isPreOct(c, state.c1(), state.c2())) return scanOct();
    if (isPreHex(c, state.c1(), state.c2())) return scanHex();
    if (isPreBit(c, state.c1(), state.c2())) return scanbinary();
    if (isLatin(c)) return symscan();
    if (isDigit(c)) return intscan();
    return char(c);
  };

  const scan = () => {
    if (state.atEnd()) {
      return token(tkn.eof)
        .lexeme("END")
        .line(state._line)
        .column(state._column);
    }
    const out = state.map(read)
      .match(tkn.bang, pickleft(tkn.neq, "=", tkn.eq))
      .match(tkn.eq, pickleft(tkn.deq, "=", tkn.eq))
      .match(tkn.lt, pickleft(tkn.leq, "=", tkn.lt))
      .match(tkn.gt, pickleft(tkn.geq, "=", tkn.gt))
      .match(tkn.string, () => string())
      .line(state._line)
      .column(state._column)
      .map((t) => t.lex(state.substr()));
    return out;
  };
  const tokenize = (text: string) => {
    state.init(text);
    const out = [];
    while (state.hasInput()) {
      out.push(scan().json());
    }
    return out;
  };

  const atom = (prev: Token) => {
    const type = prev._type;
    const lex = prev._lexeme;
    let node: ASTNode | null = null;
    // deno-fmt-ignore
    switch (type) {
			case tkn.integer: node=nInt(lex); break;
			case tkn.float: node=nFloat(lex); break;
			case tkn.string: node=nStr(lex); break;
			case tkn.hex: node=nHex(lex); break;
			case tkn.binary: node=nBin(lex); break;
			case tkn.octal: node=nOct(lex); break;
			case tkn.null: node=nNil; break;
			case tkn.inf: node=nInf; break;
			case tkn.nan: node=nNaN; break;
			case tkn.false: node=nFalse; break;
			case tkn.true: node=nTrue; break;
    }
    if (node === null) {
      const msg = `Expected literal, got ${lex}`;
      return report(`atom`, msg);
    }
    if (state.peekIs(tkn.symbol)) {
      const x = expr();
      if (x.isLeft()) return x;
      const op = prev.clone(tkn.star, "*");
      const out = nBinex(node, op, x.unwrap());
      return right(out);
    }
    return right(node);
  };

  const vector = () => {
    const elements: ASTNode[] = [];
    if (!state.peekIs(tkn.right_bracket)) {
      do {
        const node = expr();
        if (node.isLeft()) {
          return node;
        } else {
          const element = node.unwrap();
          if (!is_nNil(element)) {
            elements.push(element);
          }
        }
      } while (nextTokenIs(tkn.comma) && state.hasInput());
    }
    const out = push().map((t) => {
      const node = nVector(elements);
      if (state.atEnd()) {
        return right(node);
      } else if (!t.is(tkn.right_bracket)) {
        const l = t._lexeme;
        const msg = `Expeced closing ']', but got ${l}`;
        return report(`vector`, msg);
      } else {
        return right(node);
      }
    });
    return out;
  };

  const __ = (t: Token) => {
    const exp = `Expected expression, got “${t._lexeme}”`;
    return report("expr", exp);
  };
  const __o = bp.nil;

  const postfix = (op: Token) => {
    const result = state._lastnode;
    return right(nUnex(op, result));
  };

  const prefix = (op: Token) => {
    const res = expr();
    return res.map((arg) => nUnex(op, arg));
  };

  const infix = (op: Token) => {
    const lastnode = state._lastnode;
    return expr().map((n) => nBinex(lastnode, op, n));
  };

  const group = (op: Token) => {
    const closing = op.is(tkn.left_paren);
    const result = expr();
    if (result.isLeft()) return result;
    if (nextTokenIs(tkn.comma)) {
      const elements = [result.unwrap()];
      do {
        const e = expr();
        if (e.isLeft()) return e;
        elements.push(e.unwrap());
      } while (nextTokenIs(tkn.comma));
      const out = push();
      if (out.isnt(tkn.right_paren)) {
        return report("call", `Expected closing “)”`);
      }
      return right(nTuple(elements));
    }
    const out = result.chain((n) => {
      const t = push();
      if (!closing) {
        const msg = expect(`Closing “)”`, t);
        return report(`group`, msg);
      } else {
        return right(nGroup(n));
      }
    });
    return out;
  };

  const nextTokenIs = (type: tkn) => {
    if (state._peek.is(type)) {
      push();
      return true;
    }
    return false;
  };

  const assign = (_: Token, prev: Token) => {
    const lhs = state._lastnode;
    if (!is_nSym(lhs)) {
      const msg = expect(`Identifier`, prev);
      return report(`assign`, msg);
    }
    const right = expr();
    const out = right.map((rhs) => nAssign(lhs.symbol, rhs));
    return out;
  };

  const sym = (name: Token) => {
    const id = nSym(name);
    return right(id);
  };

  const tex = (token: Token) => {
    const lex = token._lexeme;
    if (dict.symbols[lex] !== undefined) {
      const name = dict.symbols[lex];
      return right(nSym(token.lexeme(name)));
    }
    return right(nSym(token));
  };

  const call = () => {
    const name = state._lastnode;
    if (!is_nSym(name)) {
      const msg = `Expected function name.`;
      return report(`call`, msg);
    }
    const args: ASTNode[] = [];
    if (!state._peek.among(tkn.right_paren)) {
      do {
        const node = expr();
        if (node.isLeft()) return node;
        args.push(node.unwrap());
      } while (nextTokenIs(tkn.comma));
    }
    const close = push();
    if (!close.is(tkn.right_paren)) {
      const msg = expect(`Closing delimiter`, close);
      return report("call", msg);
    }
    return right(nCall(name, args));
  };

  const printStmt = () => {
    return exprStmt().map((n) => nPrint(n));
  };

  const Rules: PSpec = {
    [tkn.nil]: [__, __, __o],
    [tkn.eof]: [__, __, __o],
    [tkn.error]: [__, __, __o],
    [tkn.unknown]: [__, __, __o],
    [tkn.colon]: [__, __, __o],
    [tkn.dot]: [__, __, __o],
    [tkn.comma]: [__, __, __o],
    [tkn.semicolon]: [__, __, __o],
    [tkn.left_paren]: [group, call, bp.call],
    [tkn.right_paren]: [__, __, __o],
    [tkn.left_bracket]: [vector, __, bp.call],
    [tkn.right_bracket]: [__, __, __o],
    [tkn.left_brace]: [__, __, __o],
    [tkn.right_brace]: [__, __, __o],
    [tkn.bang]: [__, postfix, bp.postfix],
    [tkn.eq]: [__, assign, bp.assign],
    [tkn.neq]: [__, infix, bp.eq],
    [tkn.deq]: [__, infix, bp.eq],
    [tkn.plus]: [prefix, infix, bp.sum],
    [tkn.minus]: [prefix, infix, bp.sum],
    [tkn.star]: [__, infix, bp.prod],
    [tkn.percent]: [__, infix, bp.quot],
    [tkn.sqrt]: [prefix, infix, bp.prod],
    [tkn.caret]: [__, infix, bp.pow],
    [tkn.slash]: [__, infix, bp.prod],
    [tkn.lt]: [__, infix, bp.rel],
    [tkn.leq]: [__, infix, bp.rel],
    [tkn.gt]: [__, infix, bp.rel],
    [tkn.geq]: [__, infix, bp.rel],
    [tkn.string]: [atom, __, bp.atom],
    [tkn.integer]: [atom, __, bp.atom],
    [tkn.float]: [atom, __, bp.atom],
    [tkn.hex]: [atom, __, bp.atom],
    [tkn.binary]: [atom, __, bp.atom],
    [tkn.octal]: [atom, __, bp.atom],
    [tkn.scinum]: [__, __, __o],
    [tkn.symbol]: [sym, __, bp.atom],
    [tkn.let]: [__, __, __o],
    [tkn.print]: [__, __, __o],
    [tkn.fn]: [__, __, __o],
    [tkn.rem]: [__, infix, bp.quot],
    [tkn.div]: [__, infix, bp.quot],
    [tkn.mod]: [__, infix, bp.quot],
    [tkn.not]: [prefix, __, bp.not],
    [tkn.and]: [__, infix, bp.and],
    [tkn.nand]: [__, infix, bp.nand],
    [tkn.or]: [__, infix, bp.or],
    [tkn.nor]: [__, infix, bp.nor],
    [tkn.xor]: [__, infix, bp.xor],
    [tkn.xnor]: [__, infix, bp.xor],
    [tkn.struct]: [__, __, __o],
    [tkn.for]: [__, __, __o],
    [tkn.while]: [__, __, __o],
    [tkn.is]: [__, infix, bp.rel],
    [tkn.return]: [__, __, __o],
    [tkn.true]: [atom, __, bp.atom],
    [tkn.false]: [atom, __, bp.atom],
    [tkn.inf]: [atom, __, bp.atom],
    [tkn.nan]: [atom, __, bp.atom],
    [tkn.null]: [atom, __, bp.atom],
    [tkn.if]: [__, __, __o],
    [tkn.else]: [__, __, __o],
    [tkn.texcode]: [tex, __, bp.atom],
  };

  const prefixRule = (t: tkn) => Rules[t][0];
  const infixRule = (t: tkn) => Rules[t][1];
  const precOf = (t: tkn) => Rules[t][2];

  const prime = () => {
    state._peek = scan();
  };

  const push = () => {
    const prev = state._peek;
    state._prev = prev;
    state._peek = scan();
    return prev;
  };

  const expr = (minbp = bp.lowest) => {
    let prev = state._prev;
    let token = push();
    const prefix = prefixRule(token._type);
    let left = prefix(token, prev);
    if (left.isLeft()) return left;
    state.setLastNode(left.unwrap());
    if (state.atEnd()) return left;
    while (minbp < precOf(state._peek._type) && state.hasInput()) {
      if (state.atEnd()) break;
      prev = token;
      token = push();
      const infix = infixRule(token._type);
      const right = infix(token, prev);
      if (right.isLeft()) return right;
      left = right;
      state.setLastNode(left.unwrap());
    }
    return left;
  };

  const implicitSC = () => {
    const res = nextTokenIs(tkn.semicolon) ||
      state.peekIs(tkn.eof) ||
      state.peekIs(tkn.right_brace) ||
      state.prevIs(tkn.semicolon) ||
      state.atEnd();
    return res;
  };

  const blockStmt = (): Either<Err, Block> => {
    const stmts: ASTNode[] = [];
    while (!state.peekIs(tkn.right_brace) && state.hasInput()) {
      const stmt = STMT();
      if (stmt.isLeft()) return stmt;
      stmts.push(stmt.unwrap());
    }
    const token = push();
    if (token.isnt(tkn.right_brace)) {
      const msg = expect(`}`, token);
      return report(`blockStmt`, msg);
    }
    nextTokenIs(tkn.semicolon);
    return right(nBlock(stmts));
  };

  const varStmt = () => {
    const src = `variable-declaration`;
    const sym = push();
    if (sym.isnt(tkn.symbol)) {
      const msg = expect("identifier", sym);
      return report(src, msg);
    }
    let init = tempnode;
    if (nextTokenIs(tkn.eq)) {
      const expr = exprStmt();
      if (expr.isLeft()) return expr;
      init = expr.unwrap();
    }
    return right(nVarDef(sym, init));
  };

  const branchStmt = () => {
    const cond = expr();
    if (cond.isLeft()) return cond;
    if (!nextTokenIs(tkn.left_brace)) {
      const msg = `Expected block after if-condition`;
      return report("branchStmt", msg);
    }
    const ifblock = blockStmt();
    if (ifblock.isLeft()) return ifblock;
    let elseblock = nBlock([tempnode]);
    if (nextTokenIs(tkn.else)) {
      if (!nextTokenIs(tkn.left_brace)) {
        const msg = `Expected block after else-condition`;
        return report("branchStmt", msg);
      }
      const block = blockStmt();
      if (block.isLeft()) return block;
      elseblock = block.unwrap();
    }
    return right(nCond(cond.unwrap(), ifblock.unwrap(), elseblock));
  };

  const functionStmt = () => {
    const src = `functionStmt`;
    const name = push();
    if (name.isnt(tkn.symbol)) {
      const msg = expect(`identifer`, name);
      return report(src, msg);
    }
    const t1 = push();
    if (t1.isnt(tkn.left_paren)) {
      const msg = `Expected “(” to open parameters.`;
      return report(src, msg);
    }
    const params: Token[] = [];
    if (!state.peekIs(tkn.right_paren)) {
      do {
        const id = push();
        if (id.isnt(tkn.symbol)) {
          const msg = expect("parameter name", id);
          return report(src, msg);
        }
        params.push(id);
      } while (nextTokenIs(tkn.comma));
    }
    const t2 = push();
    if (t2.isnt(tkn.right_paren)) {
      const msg = `Expected “)” to close parameters.`;
      return report(src, msg);
    }
    if (nextTokenIs(tkn.eq)) {
      const b = exprStmt();
      return b.map((body) => nFnDef(name, params, nBlock([body])));
    } else if (nextTokenIs(tkn.left_brace)) {
      const b = blockStmt();
      return b.map((body) => nFnDef(name, params, body));
    } else {
      const msg = `Expected a function body`;
      return report(src, msg);
    }
  };

  const exprStmt = () => {
    const expression = expr();
    if (implicitSC()) {
      return expression;
    }
    const guard = (token: Token) => {
      if (token.is(tkn.semicolon)) {
        return expression;
      } else {
        const msg = expect(";", token);
        return report("exprStmt", msg);
      }
    };
    const out = push().map(guard);
    return out;
  };

  const returnStmt = () => {
    const keyword = state._prev;
    const rhs = exprStmt();
    const out = rhs.map((value) => nReturn(value, keyword));
    return out;
  };

  const whileStmt = () => {
    const cond = expr();
    if (cond.isLeft()) return cond;
    const t1 = push();
    if (t1.isnt(tkn.left_brace)) {
      const l = t1._lexeme;
      const msg = `Expected block after condition, got ${l}.`;
      return report("whileStmt", msg);
    }
    const body = blockStmt();
    return body.map((b) => nLoop(cond.unwrap(), b));
  };

  const STMT = () => {
    if (nextTokenIs(tkn.print)) return printStmt();
    if (nextTokenIs(tkn.while)) return whileStmt();
    if (nextTokenIs(tkn.fn)) return functionStmt();
    if (nextTokenIs(tkn.if)) return branchStmt();
    if (nextTokenIs(tkn.left_brace)) return blockStmt();
    if (nextTokenIs(tkn.let)) return varStmt();
    if (nextTokenIs(tkn.return)) return returnStmt();
    return exprStmt();
  };

  const parse = (text: string) => {
    state.init(text);
    prime();
    const out = [];
    while (!state.atEnd()) {
      const node = STMT();
      if (node.isLeft()) return node;
      out.push(node.unwrap());
    }
    return right(out);
  };
  return {
    parse,
    tokenize,
  };
}

const src = `
1/2 + 12
`;
// const p = engine().parse(src);
// console.log(p);
// const f = compile(p);
// console.log(f.map(n => n(12)))
