import { display } from "../utils/index.js";
const { log } = console;

type TerminalToken = { symbol: string | string[]; terminal: true };
type Lexeme = TerminalToken | NonTerminalToken;
type Token = { rhs: string; lhs: Lexeme[] };

const insertChar = (s: string, c: string, i: number) => {
  return s.slice(0, i) + c + s.slice(i);
};

const makeTerminal = (symbol: string | string[]): TerminalToken => ({
  symbol,
  terminal: true,
});

type NonTerminalToken = { symbol: string | string[]; terminal: false };

const makeNonTerminal = (symbol: string | string[]): NonTerminalToken => ({
  symbol,
  terminal: false,
});

const oneof = (n: number) => {
  return {
    through: (x: number) => {
      const init = [n.toString()];
      const [start, end] = n <= x ? [n, x] : [x, n];
      for (let i = start + 1; i <= end; i++) {
        init.push(i.toString());
      }
      return init;
    },
  };
};

const isType = {
  string: (x: any): x is string => typeof x === "string",
  arrayOf: {
    string: (x: any | any[]): x is Array<string> =>
      Array.isArray(x) &&
      x.reduce((p, c) => typeof c === "string" && typeof p === "string", true),
  },
};

class Rule {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  named(name: string) {
    this.name = name;
    return this;
  }
  is(...body: (string | string[])[]): Token {
    let rhs = this.name;
    let lhs: Lexeme[] = [];
    for (let i = 0; i < body.length; i++) {
      let current = body[i];
      if (isType.string(current)) {
        lhs.push(makeNonTerminal(current));
      } else if (isType.arrayOf.string(current)) {
        lhs.push(makeTerminal(current));
      } else {
        lhs.push(makeTerminal(current));
      }
    }
    return { rhs, lhs };
  }
}

const rule = (name: string) => new Rule(name);

type Grammar = { nonterminals: Set<string>; rules: GrammarRule[] };
type GrammarRule = {
  name: string;
  rule: (string)[];
};

const grammar = (...rules: Token[]): Grammar => {
  let nonterminals = new Set<string>();
  let grammarRules: GrammarRule[] = [];
  for (let i = 0; i < rules.length; i++) {
    let currentRule = rules[i];
    const name = currentRule.rhs;
    nonterminals.add(name);
    const rule = currentRule.lhs.flatMap((d) => d.symbol);
    const grammarRule: GrammarRule = {
      name,
      rule,
    };
    grammarRules.push(grammarRule);
  }
  return { nonterminals, rules: grammarRules };
};

const isTerminal = (grm: Grammar, sym: string) => !grm.nonterminals.has(sym);

const G = grammar(
  rule("term").is("number", ["+"], "term"),
  rule("term").is("number"),
  rule("number").is(oneof(0).through(9)),
);


const itemize = (rule: GrammarRule) => {
  return `${rule.name}` + " => " + `${rule.rule.flat().join(" ")}`;
};

const parse = (source: string, grammar: Grammar) => {
  
}


