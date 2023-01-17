import { a, any, regex, word, State, Mip, Typebox } from '../src/index';
import { EOI, BadToken } from './rputil';
import treeify from 'treeify';

/* -------------------------------------------------------------------------- */
/*                                SPECIFICATION                               */
/* -------------------------------------------------------------------------- */

const getTypeName = <T>(nodeType: NodeType, value: T) => {
  switch (nodeType) {
    case 'Result':
      return 'ParseTree';
    case 'NumericArray':
      return 'number[]';
    default:
      return typeof value;
  }
};
const display = (x: any) => console.log(treeify.asTree(x, true, true));
const produce = (node: NodeType, d: any) => ({ [node]: d });
const sProduce = (node: NodeType, d: any) => [node, d];

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
const errToken = (): Token => ({ type: ERROR, value: '===ERROR===' });

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

  result() {
    return this.build('Result', this.statementList());
  }

  statementList(stopLookahead = '') {
    const statementList = [this.statement()];
    while (this.peek.type !== 'ERROR' && this.peek.type !== stopLookahead) {
      statementList.push(this.statement());
    }
    return statementList;
  }
  statement() {
    switch (this.peek.type) {
      case ';':
        return this.emptyStatement();
      case '{':
        return this.blockStatement();
      default:
        return this.expressionStatement();
    }
  }

  emptyStatement() {
    this.eat(';');
    return this.build('EmptyStatement', '');
  }

  blockStatement() {
    this.eat('{');
    const body = this.peek.type !== '}' ? this.statementList('}') : [];
    this.eat('}');
    return this.build('BlockStatement', body);
  }

  expressionStatement() {
    const expression = this.expression();
    this.eat(';');
    return this.build('ExpressionStatement', expression);
  }

  expression() {
    return this.additiveExpression();
  }

  additiveExpression() {
    let left = this.multiplicativeExpression();
    while (this.peek.type === 'ADD') {
      const operator = this.eat('ADD').value;
      const right = this.multiplicativeExpression();
      left = produce('BinaryExpression', { operator, left, right });
    }
    return left;
  }

  multiplicativeExpression() {
    let left = this.primaryExpression();
    while (this.peek.type === 'MUL') {
      const operator = this.eat('MUL').value;
      const right = this.primaryExpression();
      left = produce('BinaryExpression', { operator, left, right });
    }
    return left;
  }

  primaryExpression() {
    switch (this.peek.type) {
      case '(':
        return this.parenExpression();
      default:
        return this.literal();
    }
  }

  parenExpression() {
    this.eat('(');
    const expression = this.expression();
    this.eat(')');
    return expression;
  }

  literal() {
    switch (this.peek.type) {
      case 'NUMBER':
        return this.numericLiteral();
      case 'STRING':
        return this.stringLiteral();
    }
  }

  nullLiteral() {
    return this.build('NullLiteral', null);
  }

  stringLiteral() {
    const token = this.eat('STRING');
    return this.build('StringLiteral', token.value.slice(1, -1));
  }

  numericLiteral() {
    const token = this.eat('NUMBER');
    return this.build('NumericLiteral', Number(token.value));
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

type TokenType =
  | 'NUMBER'
  | 'STRING'
  | 'ERROR'
  | 'SPACE'
  | ';'
  | '{'
  | '}'
  | 'MUL'
  | '('
  | ')'
  | 'ADD';
type NodeType =
  | 'Result'
  | 'StringLiteral'
  | 'NumericLiteral'
  | 'NullLiteral'
  | 'NumericArray'
  | 'BlockStatement'
  | 'BinaryExpression'
  | 'EmptyStatement'
  | 'ExpressionStatement';

const typedef = (d: Mip<string | string[] | any>, typeName: TokenType) =>
  d.map<string>((d) => ({
    type: typeName,
    out:
      Array.isArray(d.out) && typeof d[0] === 'string' ? d.out.join('') : d.out,
  }));

// operators
const minus = a('-');
const plus = a('+');
const times = a('*');
const div = a('/');
const pow = a('^');

// punctuation
const lparen = typedef(a('('), '(');
const rparen = typedef(a(')'), ')');

const additiveOp = typedef(plus.or(minus), 'ADD');
const mulOp = typedef(times.or(div), 'MUL');

// string literals
const dquote = a(`"`);
const doubleQuoted = word(dquote, any('alphanumeric'), dquote);
const stringLiteral = typedef(doubleQuoted, 'STRING');

// special char
const dot = a('.');

// statement delimiter
const semicolon = typedef(a(';'), ';');

// block quote delimiters
const lbrace = typedef(a('{'), '{');
const rbrace = typedef(a('}'), '}');

// numbers
const natural = any('digit');
const decimal = word(natural, dot, natural);
const numeric = typedef(decimal.or(natural), 'NUMBER');
const whitespace = typedef(regex(/^\s+/), 'SPACE');

const input = `

(2 + 2) - 1 * 2;

`;

const parser = new Language({
  parsers: [
    numeric,
    stringLiteral,
    whitespace,
    semicolon,
    lbrace,
    rbrace,
    additiveOp,
    mulOp,
    lparen,
    rparen,
  ],
}).format('ast');

const result = parser.read(input);
display(result);
