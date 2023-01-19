type Result = Match | Err;
type PRat = (text: string, i: number) => Result;

class Output {
  text: string;
  start: number;
  end: number;
  err: boolean;
  constructor(text: string, start: number, end: number) {
    this.text = text;
    this.start = start;
    this.end = end;
    this.err = false;
  }
  get error() {
    return this.err;
  }
}

class Match extends Output {
  text: string;
  start: number;
  end: number;
  children: Match[];
  err: boolean;
  result: string;
  constructor(
    text: string,
    start: number,
    end: number,
    children: Match[] = []
  ) {
    super(text, start, end);
    this.text = text;
    this.start = start;
    this.end = end;
    this.children = children;
    this.err = false;
    this.result = this.text.substring(this.start, this.end);
  }
}
class Err extends Output {
  text: string;
  start: number;
  end: number;
  err: boolean;
  result: string;
  children: Err[];
  constructor(text: string, parserName: string, index: number) {
    super(text, index, index);
    this.text = text;
    this.result = `Error | ${parserName}`;
    this.start = index;
    this.end = index;
    this.children = [];
    this.err = true;
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
  and(p: P) {
    return new P((txt, i) => {
      let res = this.fn(txt, i);
      if (res.err) return res;
      let out = p.parse(txt, res.end);
      if (out.err) return out;
      return new Match(txt, i, out.end, [...res.children, ...out.children]);
    });
  }
  or(p: P) {
    return new P((txt, i) => {
      let res = this.fn(txt, i);
      if (!res.err) return res;
      let out = p.parse(txt, res.end);
      if (!out.err) return out;
      return new Err(txt, 'or-parser', i);
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

export function lit(pattern: string): P {
  return new P((text: string, i: number) => {
    if (text.startsWith(pattern, i)) {
      return new Match(text, i, i + pattern.length);
    } else {
      return new Err(text, 'lit', i);
    }
  });
}

export function chain(...patterns: P[]): P {
  return new P((text: string, i: number) => {
    let children: Match[] = [];
    let start = i;
    for (let pattern of patterns) {
      let result = pattern.parse(text, i);
      if (result instanceof Err) return result;
      else children.push(result);
      i = result.end;
    }
    return new Match(text, start, i, children);
  });
}

export function oneof(...patterns: P[]): P {
  return new P((text: string, i: number) => {
    for (let pattern of patterns) {
      let result = pattern.parse(text, i);
      if (!(result instanceof Err)) return result;
    }
    return new Err(text, 'oneOf', i);
  });
}

export function many(parser: P) {
  return new P((text, i) => {
    let start = i;
    let initRes = parser.parse(text, i);
    if (initRes instanceof Err) return initRes;
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
}

export function wildcard(): P {
  return new P((text, i) =>
    i < text.length ? new Match(text, i, i + 1) : new Err(text, 'wildcard', i)
  );
}
