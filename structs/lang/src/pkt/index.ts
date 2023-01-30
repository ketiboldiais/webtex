import { log } from '../utils/index.ts';

type Result = Match | Failure;
type PRat = (text: string, i: number, type: string) => Result;

class Output {
  readonly text: string;
  start: number;
  end: number;
  err: boolean;
  type: string;
  result: string = "";
  constructor(
    text: string,
    type: string,
    start: number,
    end: number,
    err: boolean
  ) {
    this.text = text;
    this.type = type;
    this.start = start;
    this.end = end;
    this.err = err;
  }
  map(mapfn: (x: string, error: boolean) => any) {
    return mapfn(this.text.substring(this.start, this.end), this.err);
  }
  setResult(result: string) {
    this.result = result;
    return this;
  }
}

export class Match extends Output {
  children: Match[];
  result: string;
  constructor(
    text: string,
    typename: string = '',
    start: number,
    end: number,
    children: Match[] = []
  ) {
    super(text, typename, start, end, false);
    this.children = children;
    this.type = typename;
    this.result = this.text.substring(this.start, this.end);
  }
}
export class Failure extends Output {
  result: string;
  children: Failure[];
  constructor(
    text: string,
    parserName: string = '',
    start: number,
    end: number,
    children: Failure[] = []
  ) {
    super(text, `ERROR`, start, end, true);
    this.children = children;
    this.type = 'ERROR';
    this.result = `Error | ${parserName}`;
  }
}

export type Data<T> = {
  type: T;
  start: number;
  end: number;
  err: boolean;
  children: Result[];
  result: string;
};

type Mutable = {
  type: string;
  result: string;
  start: number;
  end: number;
  err: boolean;
  children: Result[];
};
type MutableArg = {
  type: string;
  result: string;
  start: number;
  end: number;
  err: boolean;
  children: { result: string; type: string; start: number; end: number }[];
};
type MutableReturn = Omit<Mutable, 'children' | 'err'>;

export class P<T> {
  private fn: PRat;
  private _type: string;
  constructor(fn: PRat, typename: string = 'text') {
    this._type = typename;
    this.fn = fn;
  }
  map(fn: (res: MutableArg) => Partial<MutableReturn>) {
    return new P((txt, i, typename) => {
      const res = this.fn(txt, i, typename);
      if (res.children.length === 0)
        return new Failure(txt, typename, i, i, []);
      const mod = fn({
        ...res,
        children: res.children.map((d) => ({
          result: d.result,
          type: d.type,
          start: d.start,
          end: d.end,
        })),
      });
      const type = mod.type ? mod.type : res.type;
      const result = mod.result ? mod.result : res.result;
      const start = mod.start ? mod.start : res.start;
      const end = mod.end ? mod.end : res.end;
      if (res.err) {
        return new Failure(txt, type, start, end, res.children).setResult(
          result
        );
      } else {
        return new Match(txt, type, start, end, res.children).setResult(result);
      }
    });
  }
  run(src: string): Data<T> {
    const { type, start, end, err, children, result } = this.parse(src);
    return { type: type as T, start, end, err, children, result };
  }
  parse(src: string, i = 0) {
    return this.fn(src, i, this._type);
  }
  type<K extends string>(typename: K) {
    return new P<K>(this.fn, typename);
  }

  /**
   * Returns a `Match` if both the calling parser and the
   * argument parser succeed. Returns the `Fail` of the first
   * parser that fails.
   * 
   * @example
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      const x = lit('x');  
      const y = lit('y');  
      const z = lit('z');  
      const xyz = x.and(y).and(z)
      console.log(xyz.parse('xyz'))
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   * Output:
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Match {
        text: 'xyz',
        start: 0,
        end: 3,
        err: false,
        children: [],
        result: 'xyz'
      }
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   */
  and(p: P<T>) {
    return new P<T>((txt, i, type) => {
      let res = this.fn(txt, i, type);
      if (res.err) return res;
      let out = p.parse(txt, res.end);
      if (out.err) return out;
      return new Match(txt, type, i, out.end, [
        ...res.children,
        ...out.children,
      ]);
    });
  }

  /**
   * Returns a `Match` if the calling parser if it succeeds.
   * If the calling parser fails, the argument parser is attempted.
   * If the argument parser succeeds, its match is returned.
   * If the argument parser fails both failures are returned.
   * 
   * @example
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      const x = lit('x');  
      const y = lit('y');  
      const z = lit('z');  
      const xyz = x.or(y).or(z)
      console.log(xyz.parse('xyz'))
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   * Output:
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      Match {
        text: 'xyz',
        start: 0,
        end: 1,
        err: false,
        children: [],
        result: 'x'
      }
   * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   */
  or(p: P<T>) {
    return new P<T>((txt, i) => {
      let res = this.fn(txt, i, this._type);
      if (!res.err) {
        return new Match(txt, this._type, i, i + res.result.length, []);
      }
      let out = p.parse(txt, i);
      if (!out.err) {
        return new Match(txt, p._type, i, i + out.result.length, []);
      }
      return new Failure(txt, `or-${p._type}`, i, i, []);
    });
  }
  maybe(p: P<T>) {
    return new P<T>((txt, i, type = p._type) => {
      let res = this.fn(txt, i, type);
      let out = p.parse(txt, res.end);
      if (!out.err)
        return new Match(txt, type, i, out.end, [
          ...res.children,
          ...out.children,
        ]);
      return res;
    });
  }
}

export const lit = (pattern: string): P<'literal'> =>
  new P((text: string, i: number, type = 'literal') => {
    if (text.startsWith(pattern, i)) {
      return new Match(text, type, i, i + pattern.length);
    } else {
      return new Failure(text, type, i, i + pattern.length);
    }
  });

// todo - These parser collections should be rewritten as generator functions.
export const numeral = [
  lit('0'),
  lit('1'),
  lit('2'),
  lit('3'),
  lit('4'),
  lit('5'),
  lit('6'),
  lit('7'),
  lit('8'),
  lit('9'),
];

const upperCase = {
  A: lit('A').type('char'),
  B: lit('B').type('char'),
  C: lit('C').type('char'),
  D: lit('D').type('char'),
  E: lit('E').type('char'),
  F: lit('F').type('char'),
  G: lit('G').type('char'),
  H: lit('H').type('char'),
  I: lit('I').type('char'),
  J: lit('J').type('char'),
  K: lit('K').type('char'),
  L: lit('L').type('char'),
  M: lit('M').type('char'),
  N: lit('N').type('char'),
  O: lit('O').type('char'),
  P: lit('P').type('char'),
  Q: lit('Q').type('char'),
  R: lit('R').type('char'),
  S: lit('S').type('char'),
  T: lit('T').type('char'),
  U: lit('U').type('char'),
  V: lit('V').type('char'),
  W: lit('W').type('char'),
  X: lit('X').type('char'),
  Y: lit('Y').type('char'),
  Z: lit('Z').type('char'),
};

const lowerCase = {
  a: lit('a').type('char'),
  b: lit('b').type('char'),
  c: lit('c').type('char'),
  d: lit('d').type('char'),
  e: lit('e').type('char'),
  f: lit('f').type('char'),
  g: lit('g').type('char'),
  h: lit('h').type('char'),
  i: lit('i').type('char'),
  j: lit('j').type('char'),
  k: lit('k').type('char'),
  l: lit('l').type('char'),
  m: lit('m').type('char'),
  n: lit('n').type('char'),
  o: lit('o').type('char'),
  p: lit('p').type('char'),
  q: lit('q').type('char'),
  r: lit('r').type('char'),
  s: lit('s').type('char'),
  t: lit('t').type('char'),
  u: lit('u').type('char'),
  v: lit('v').type('char'),
  w: lit('w').type('char'),
  x: lit('x').type('char'),
  y: lit('y').type('char'),
  z: lit('z').type('char'),
};

export const letter = {
  ...upperCase,
  ...lowerCase,
};

export const chain = <T>(...parsers: P<T>[]): P<T> =>
  new P((txt: string, i: number, type) => {
    let children: Match[] = [];
    let start = i;
    for (let parser of parsers) {
      let result = parser.parse(txt, i);
      if (result.err) return result;
      if (result.result !== '') {
        children.push(result);
      }
      i = result.end;
    }
    const str = children.reduce((p, c) => (p += c.result), '');
    return new Match(txt, type, start, i, children).setResult(str);
  });

export const rgx = (regex: RegExp) =>
  new P((txt, i, type) => {
    const res = regex.exec(txt);
    if (res) return new Match(txt, type, i, i + res[0].length, []);
    return new Failure(txt, type, i, i, []);
  });

export const not = <T>(parser: P<T>) =>
  new P((txt, i, type = 'not') => {
    const res = parser.parse(txt, i);
    if (!res.err)
      return new Failure(
        `Expected no “${txt[i]}”, got “${txt[i]}”`,
        type,
        i,
        res.end,
        res.children
      );
    return new Match(txt, type, i, i);
  });

export const oneof = <T>(...patterns: P<T>[]): P<T> =>
  new P((text: string, i: number) => {
    for (let pattern of patterns) {
      let result = pattern.parse(text, i);
      if (!result.err) return result;
    }
    return new Failure(text, 'oneOf', i, i);
  });

export const union = <T>(parser: P<T>) =>
  new P((text, i, type = 'union') => {
    let start = i;
    let initRes = parser.parse(text, i);
    if (initRes instanceof Failure) return initRes;
    let out: Match[] = [];
    while (i < text.length) {
      initRes = parser.parse(text, i);
      if (initRes.err) break;
      else {
        out.push(new Match(text, type, i, initRes.end));
      }
      i++;
    }
    return new Match(text, type, start, i, out);
  });

export const wildcard = new P<string>((text, i, type = 'wildcard') =>
  i < text.length
    ? new Match(text, type, i, i + 1, [])
    : new Match(text, type, i, i, [])
);

export const repeat = <T>(parser: P<T>) =>
  new P<T>((txt, i, type) => {
    let result = parser.parse(txt, i);
    if (result.err) return new Failure(txt, type, i, i, []);
    let j = i;
    let children: Match[] = [];
    while (!result.err && j < txt.length) {
      result = parser.parse(txt, j);
      if (!result.err) children.push(result);
      j += result.result.length;
    }
    return new Match(txt, type, i, children.length, children);
  });

// log(repeat(lit('0')).parse('0000'));

export const many = <T>(...parsers: P<T>[]) => {
  return new P<T>((txt, i, type) => {
    const res = repeat(oneof(...parsers)).parse(txt, i);
    if (res.err) {
      return res;
    }
    const children: Match[] = res.children;
    const result: string = children.reduceRight((p, c) => (c.result += p), '');
    return new Match(txt, type, i, i + result.length, []);
  });
};

export const strung = (
  option?: 'upper-case-letters' | 'lower-case-letters' | 'letters' | 'digits'
) => {
  switch (option) {
    case 'lower-case-letters':
      return many(...Object.values(lowerCase)).type('lower-case-letters');
    case 'upper-case-letters':
      return many(...Object.values(upperCase)).type('upper-case-letters');
    case 'letters':
      return many(...Object.values(letter)).type('letters');
    case 'digits':
      return many(...numeral).type('digits');
    default:
      return many<any>(wildcard);
  }
};
export const ws = many(lit(' '), lit('\t'), lit('\r'), lit('\n'));
export const skip = <T>(parser: P<T>) => {
  return new P<T>((txt, i, type) => {
    const res = parser.parse(txt, i);
    if (res.err) return new Match('', type, i, i, []);
    return new Match('', type, i, i + res.result.length, []);
  });
};
export const maybe = <T>(parser: P<T>) => {
  return new P<T>((txt, i, type) => {
    const res = parser.parse(txt, i);
    if (res.err) return new Match('', type, i, i, []);
    return res;
  });
};

export const glyph = (p: P<any>) => chain(skip(ws), p, skip(ws));
