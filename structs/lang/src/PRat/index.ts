type Result = Match | Failure;
type PRat = (text: string, i: number) => Result;

class Output {
  readonly text: string;
  start: number;
  end: number;
  err: boolean;
  constructor(text: string, start: number, end: number, err: boolean) {
    this.text = text;
    this.start = start;
    this.end = end;
    this.err = err;
  }
}

class Match extends Output {
  children: Match[];
  result: string;
  constructor(
    text: string,
    start: number,
    end: number,
    children: Match[] = []
  ) {
    super(text, start, end, false);
    this.children = children;
    this.result = this.text.substring(this.start, this.end);
  }
}
class Failure extends Output {
  result: string;
  children: Failure[];
  constructor(
    text: string,
    parserName: string,
    index: number,
    children: Failure[] = []
  ) {
    super(text, index, index, true);
    this.children = children;
    this.result = `Error | ${parserName}`;
  }
}

class P {
  private fn: PRat;
  constructor(fn: PRat) {
    this.fn = fn;
  }
  parse(src: string, i = 0) {
    return this.fn(src, i);
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
  and(p: P) {
    return new P((txt, i) => {
      let res = this.fn(txt, i);
      if (res.err) return res;
      let out = p.parse(txt, res.end);
      if (out.err) return out;
      return new Match(txt, i, out.end, [...res.children, ...out.children]);
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
  or(p: P) {
    return new P((txt, i) => {
      let res = this.fn(txt, i);
      if (!res.err) return new Match(txt, i, res.end, [...res.children]);
      let out = p.parse(txt, res.end);
      if (!out.err) return new Match(txt, i, out.end, [...out.children]);
      return new Failure(txt, 'or-parser', i, [
        ...res.children,
        ...out.children,
      ]);
    });
  }
  maybe(p: P) {
    return new P((txt, i) => {
      let res = this.fn(txt, i);
      let out = p.parse(txt, res.end);
      if (!out.err)
        return new Match(txt, i, out.end, [...res.children, ...out.children]);
      return res;
    });
  }
}

const lit = (pattern: string): P =>
  new P((text: string, i: number) => {
    if (text.startsWith(pattern, i)) {
      return new Match(text, i, i + pattern.length);
    } else {
      return new Failure(text, 'lit', i);
    }
  });

const x = lit('x');
const y = lit('y');
const z = lit('z');
const xyz = x.or(y).or(z);
console.log(xyz.parse('xyz'));

const chain = (...patterns: P[]): P =>
  new P((text: string, i: number) => {
    let children: Match[] = [];
    let start = i;
    for (let pattern of patterns) {
      let result = pattern.parse(text, i);
      if (result instanceof Failure) return result;
      else children.push(result);
      i = result.end;
    }
    return new Match(text, start, i, children);
  });

const oneof = (...patterns: P[]): P =>
  new P((text: string, i: number) => {
    for (let pattern of patterns) {
      let result = pattern.parse(text, i);
      if (!(result instanceof Failure)) return result;
    }
    return new Failure(text, 'oneOf', i);
  });

const many = (parser: P) =>
  new P((text, i) => {
    let start = i;
    let initRes = parser.parse(text, i);
    if (initRes instanceof Failure) return initRes;
    let out: Match[] = [];
    while (i < text.length) {
      initRes = parser.parse(text, i);
      if (initRes.err) break;
      else {
        out.push(new Match(text, i, initRes.end));
      }
      i++;
    }
    return new Match(text, start, i, out);
  });

const wildcard = (): P =>
  new P((text, i) =>
    i < text.length
      ? new Match(text, i, i + 1)
      : new Failure(text, 'wildcard', i)
  );
