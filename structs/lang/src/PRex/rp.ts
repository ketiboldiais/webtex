import {
  a,
  any,
  regex,
  word,
  State,
  Mip,
  maybe,
  not,
  print,
} from '../PCox/index';
import { EOI, BadToken } from '../PCox/rputil';
import treeify from 'treeify';

/* -------------------------------------------------------------------------- */
/*                                SPECIFICATION                               */
/* -------------------------------------------------------------------------- */
enum OpToken {
  mul = 'MUL',
  add = 'ADD',
}

enum token {
  number = 'NUMBER',
  string = 'STRING',
  nil = 'NIL',
  error = 'ERROR',
  space = 'SPACE',
  varname = 'VARIABLE',
  semicolon = ';',
  lbrace = '{',
  rbrace = '}',
  lparen = '(',
  rparen = ')',
  equal = '=',
}

type TokenType = OpToken | token;

const isLiteral = (t: TokenType) => t === token.number || t === token.string;

enum node {
  result = 'Result',
  string = 'StringLiteral',
  number = 'NumericLiteral',
  null = 'NullLiteral',
  numarray = 'NumericArray',
  binex = 'BinaryExpression',
  blockStatement = 'BlockStatement',
  emptyStatement = 'EmptyStatement',
  expressionStatement = 'ExpressionStatement',
  assignmentExpr = 'AssignmentExpression',
  identifier = 'Identifier',
}

export const display = (x: any) => console.log(treeify.asTree(x, true, true));
type TNode<T, K extends node> = { node: K; data: T };
type SNode<T, K extends node> = [K, T];

const produce = <T, K extends node>(node: K, data: T): TNode<T, K> => ({
  node,
  data,
});
const sProduce = <T, K extends node>(node: K, d: T): SNode<T, K> => [node, d];

type Node<T, K extends node> = TNode<T, K> | SNode<T, K>;

type StringLiteral = Node<string, node.string>;

type NumericLiteral = Node<number, node.number>;

type NullLiteral = Node<null, node.null>;

type Literal = StringLiteral | NumericLiteral | NullLiteral;

type StatementList = Statement[];

type Statement = EmptyStatement | BlockStatement | ExpressionStatement;

type EmptyStatement = Node<'', node.emptyStatement>;

type BlockStatement =
  | Node<ExpressionStatement, node.blockStatement>
  | Node<StatementList, node.blockStatement>;

type ExpressionStatement = Node<Expression, node.expressionStatement>;

type Expression = Literal | Binex | DefExpr;

type Identifier = Node<string, node.identifier>;
type DefExpr = Node<
  {
    operator: string;
    left: Identifier;
    right: DefExpr | Binex;
  },
  node.assignmentExpr
>;

// prettier-ignore
type Binex =
  | Literal
  | Node<{operator: string; left: Literal; right: Literal}, node.binex>
  | Node<{operator: string; left: Literal; right: Binex}, node.binex>
  | Node<{operator: string; left: Binex; right: Literal}, node.binex>
  | Node<{operator: string; left: Binex; right: Binex}, node.binex>;

type Result = Node<StatementList, node.result>;

const keyOf = <T extends object>(
  key: string | number | symbol,
  obj: T
): key is keyof T => key in obj;

const astBuilder = {
  ['ast']: produce,
  ['s-expression']: sProduce,
};
type TreeBuilder = typeof astBuilder;

const validASTKey = (s: string) => (keyOf(s, astBuilder) ? s : 'ast');
type BuildOption = ReturnType<typeof validASTKey>;
const ERROR = 'ERROR';

type Token = { type: TokenType; value: string };

/* -------------------------------------------------------------------------- */
/*                                  TOKENIZER                                 */
/* -------------------------------------------------------------------------- */

const tokenize = (state: State<string>): Token => ({
  type: state.type as TokenType,
  value: state.out,
});
const errToken = (): Token => ({ type: token.error, value: '===ERROR===' });

class Tokenizer {
  string: string;
  cursor: number;
  parsers: Mip<string>[];
  constructor(parsers: Mip<string>[]) {
    this.parsers = parsers;
  }
  init(string: string): void {
    this.string = string;
    this.cursor = 0;
  }
  hasTokens(): boolean {
    return this.cursor < this.string.length;
  }
  getNextToken(): Token {
    if (!this.hasTokens()) return errToken();
    const str = this.string.slice(this.cursor);
    for (let i = 0; i < this.parsers.length; i++) {
      const token = this.match(this.parsers[i].run(str));
      if (token === null) continue;
      else if (token.type === 'SPACE') return this.getNextToken();
      else return token;
    }
    return errToken();
  }
  match(state: State<string>) {
    const matched = tokenize(state);
    if (matched.value !== '') {
      this.cursor += matched.value.length;
      return tokenize(state);
    }
    return null;
  }
  isEOF() {
    return this.cursor === this.string.length;
  }
}

/* -------------------------------------------------------------------------- */
/*                                 Parse Tree                                 */
/* -------------------------------------------------------------------------- */
interface Grammar {
  parsers: Mip<string>[];
}

class Language {
  input: string;
  tokenizer: Tokenizer;
  peek: Token;
  option: BuildOption;
  build: TreeBuilder[BuildOption];
  constructor(grammar: Grammar) {
    this.tokenizer = new Tokenizer(grammar.parsers);
    this.option = 'ast';
    this.build = astBuilder['ast'];
  }
  format(buildOption: BuildOption) {
    this.option = buildOption;
    this.build = astBuilder[buildOption];
    return this;
  }
  read(string: string) {
    this.input = string;
    this.tokenizer.init(string);
    this.peek = this.tokenizer.getNextToken();
    return this.result();
  }

  result(): Result {
    return this.build(node.result, this.statementList());
  }

  statementList(stopLookahead = ''): StatementList {
    const statementList = [this.statement()];
    while (this.peek.type !== token.error && this.peek.type !== stopLookahead) {
      statementList.push(this.statement());
    }
    return statementList;
  }
  statement(): Statement {
    switch (this.peek.type) {
      case token.semicolon:
        return this.emptyStatement();
      case token.lbrace:
        return this.blockStatement();
      default:
        return this.expressionStatement();
    }
  }

  emptyStatement(): EmptyStatement {
    this.eat(token.semicolon);
    return this.build(node.emptyStatement, '');
  }

  blockStatement(): BlockStatement {
    this.eat(token.lbrace);
    const body =
      this.peek.type !== token.rbrace ? this.statementList(token.rbrace) : [];
    this.eat(token.rbrace);
    return this.build(node.blockStatement, body);
  }

  expressionStatement(): ExpressionStatement {
    const expression = this.expression();
    this.eat(token.semicolon);
    return this.build(node.expressionStatement, expression);
  }

  expression(): Expression {
    return this.defExpression();
  }

  defExpression(): DefExpr | Binex {
    const left = this.additiveExpression();
    if (this.peek.type !== token.equal) return left;
    return this.build(node.assignmentExpr, {
      operator: this.eat(token.equal).value,
      left: this.leftExpr(),
      right: this.defExpression(),
    });
  }

  leftExpr(): Identifier {
    return this.identifier();
  }

  identifier(): Identifier {
    const name = this.eat(token.varname).value;
    return this.build(node.identifier, name);
  }

  additiveExpression(): Binex {
    return this.binaryExpression('multiplicativeExpression', OpToken.add);
  }

  multiplicativeExpression(): Binex {
    return this.binaryExpression('primaryExpression', OpToken.mul);
  }

  binaryExpression(name: ExprMethodName, optoken: OpToken): Binex {
    let left: Expression | Identifier | Literal = this[name]();
    while (this.peek.type === optoken) {
      const operator = this.eat(optoken).value;
      const right = this[name]();
      left = this.build(node.binex, { operator, left, right }) as Binex;
    }
    return left as Literal;
  }

  primaryExpression(): Expression | Identifier | Literal {
    if (isLiteral(this.peek.type)) {
      return this.literal();
    }
    switch (this.peek.type) {
      case token.lparen:
        return this.parenthesizedExpression();
      default:
        return this.leftExpr();
    }
  }

  parenthesizedExpression(): Expression {
    this.eat(token.lparen);
    const expr = this.expression();
    this.eat(token.rparen);
    return expr;
  }

  literal(): Literal {
    switch (this.peek.type) {
      case token.number:
        return this.numericLiteral();
      case token.string:
        return this.stringLiteral();
      default:
        return this.nullLiteral();
    }
  }

  nullLiteral(): NullLiteral {
    return this.build(node.null, null);
  }

  stringLiteral(): StringLiteral {
    const result = this.eat(token.string);
    return this.build(node.string, result.value.slice(1, -1));
  }

  numericLiteral(): NumericLiteral {
    const result = this.eat(token.number);
    return this.build(node.number, Number(result.value));
  }

  eat(tokenType: TokenType) {
    const token = this.peek;
    if (token.type === ERROR) throw new SyntaxError(EOI(tokenType));
    if (token.type !== tokenType)
      throw new SyntaxError(BadToken(`${token.value}`, token.type));
    this.peek = this.tokenizer.getNextToken();
    return token;
  }
}

type ExprMethodName = 'primaryExpression' | 'multiplicativeExpression';

const typedef = (d: Mip<string | string[] | any>, typeName: TokenType) =>
  d.map<string>((d) => ({
    type: typeName,
    out:
      Array.isArray(d.out) && typeof d.out[0] === 'string'
        ? d.out.join('')
        : d.out,
  }));

// operators
const minus = a('-');
const plus = a('+');
const times = a('*');
const div = a('/');
const pow = a('^');
const equal = a('=');
const additiveOp = typedef(plus.or(minus), OpToken.add);
const mulOp = typedef(times.or(div), OpToken.mul);
const eqOp = typedef(equal, token.equal);

// punctuation
const lparen = typedef(a('('), token.lparen);
const rparen = typedef(a(')'), token.rparen);

// string literals
const dquote = a(`"`);
const doubleQuoted = word(dquote, any('alphanumeric'), dquote);
const stringLiteral = typedef(doubleQuoted, token.string);
const id = word(not(dquote), any('letter'), maybe(any('digit')), not(dquote));
const varname = typedef(id, token.varname);

// special char
const dot = a('.');

// statement delimiter
const semicolon = typedef(a(';'), token.semicolon);

// block quote delimiters
const lbrace = typedef(a('{'), token.lbrace);
const rbrace = typedef(a('}'), token.rbrace);

// numbers
const natural = any('digit');
const decimal = word(natural, dot, natural);
const numeric = typedef(decimal.or(natural), token.number);
const whitespace = typedef(regex(/^\s+/), token.space);

const input = `

x = 5;

`;

const parser = new Language({
  parsers: [
    stringLiteral,
    whitespace,
    semicolon,
    lbrace,
    rbrace,
    additiveOp,
    mulOp,
    eqOp,
    numeric,
    varname,
    lparen,
    rparen,
  ],
}).format('ast');



// const result = parser.read(input);
// display(result);
