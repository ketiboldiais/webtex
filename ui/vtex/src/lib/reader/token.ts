enum Token {
  nil,
  eof,
  error,
  delim,
  infix,
  prefix,
  postfix,
  mixfix,
  call,
  string,
  number,
  symbol,
  keyword,
  custom,
}

enum Fix {
  nil,
  left,
  right,
  chain,
  either,
}

enum BP {
  nil,
  low,
  mid,
  high,
  peak,
  apex,
}


