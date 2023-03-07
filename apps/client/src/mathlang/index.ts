import { List } from "./structs/list.js";
const { log } = console;

export namespace algom {
  /* -------------------------------------------------------------------------- */
  /* § LIBRARY                                                                  */
  /* -------------------------------------------------------------------------- */
  type Calculi = {
    [key: string]: any;
  };

  class Library {
    private record: Calculi;
    constructor(record: Calculi) {
      this.record = record;
    }
    hasNamedValue(name: string) {
      return this.record.hasOwnProperty(name);
    }
    getFunction(name: string): Function | undefined {
      const res = this.record[name];
      if (typeof res === "function") return res;
    }
    getNumericConstant(name: string): number | undefined {
      const result = this.record[name];
      if (typeof result === "number") return result;
    }
    hasFunction(name: string) {
      return typeof this.record[name] === "function";
    }
    hasConstant(name: string) {
      return typeof this.record[name] === "number";
    }
    static execute() {
    }
  }
  const lib: Calculi = {
    e: Math.E,
    PI: Math.PI,
    LN2: Math.LN2,
    LN10: Math.LN10,
    LOG2E: Math.LOG2E,
    LOG10E: Math.LOG10E,
    SQRT1_2: Math.SQRT1_2,
    SQRT2: Math.SQRT2,
    abs: Math.abs,
    acos: Math.acos,
    acosh: Math.acosh,
    asin: Math.asin,
    asinh: Math.asinh,
    atan: Math.atan,
    atanh: Math.atanh,
    atan2: Math.atan2,
    cbrt: Math.cbrt,
    ceil: Math.ceil,
    clz32: Math.clz32,
    cos: Math.cos,
    cosh: Math.cosh,
    exp: Math.exp,
    expm1: Math.expm1,
    floor: Math.floor,
    fround: Math.fround,
    gcd: algom.GCD,
    hypot: Math.hypot,
    imul: Math.imul,
    log: Math.log,
    ln: Math.log,
    log1p: Math.log1p,
    log10: Math.log10,
    log2: Math.log2,
    lg: Math.log2,
    max: Math.max,
    min: Math.min,
    pow: Math.pow,
    random: Math.random,
    round: Math.round,
    sign: Math.sign,
    sin: Math.sin,
    sinh: Math.sinh,
    sqrt: Math.sqrt,
    tan: Math.tan,
    tanh: Math.tanh,
    trunc: Math.trunc,
    even: algom.even,
    odd: algom.odd,
  };
  const match = {
    isInt: (s: string) => /^-?(0|[1-9]\d*)(?<!-0)$/.test(s),
    isFloat: (s: string) => /^(?!-0(\.0+)?$)-?(0|[1-9]\d*)(\.\d+)?$/.test(s),
    isUInt: (s: string) => /^(0|[1-9]\d*)$/.test(s),
    isUFloat: (s: string) => /^(0|[1-9]\d*)(\.\d+)?$/.test(s),
    isSci: (s: string) =>
      /^(?!-0?(\.0+)?(e|$))-?(0|[1-9]\d*)?(\.\d+)?(?<=\d)(e[-+]?(0|[1-9]\d*))?$/i
        .test(s),
    isHex: (s: string) => /^0x[0-9a-f]+$/i.test(s),
    isBinary: (s: string) => /^0b[0-1]+$/i.test(s),
    isOctal: (s: string) => /^0o[0-8]+$/i.test(s),
    isFrac: (s: string) => /^(-?[1-9][0-9]*|0)\/[1-9][0-9]*/.test(s),
  };
  const corelib = new Library(lib);
  const hasProp = (obj: Object, p: string) =>
    typeof obj === "object" && obj.hasOwnProperty(p);

  function compute(left: Num, op: string, right: Num): ASTNode | undefined {
    switch (op) {
      case "+":
        return left.add(right);
      case "-":
        return left.minus(right);
      case "*":
        return left.times(right);
      case "/":
        return left.divide(right);
      case "^":
        return left.pow(right);
      case "%":
      case "rem":
        return left.rem(right);
      case "//":
        return left.div(right);
      case "mod":
        return left.mod(right);
      case ">":
        return left.gt(right);
      case ">=":
        return left.gte(right);
      case "<":
        return left.lt(right);
      case "<=":
        return left.lte(right);
      case "=":
        return left.equals(right);
    }
  }

  function mergeTuples(a: Tuple | ASTNode, b: Tuple | ASTNode) {
    let L: List<ASTNode> = new List();
    switch (true) {
      case (a.isTuple() && b.isTuple()):
        L = (a as Tuple).value.concat((b as Tuple).value);
        break;
      case (a.isTuple() && !b.isTuple()):
        L = (a as Tuple).value.push(b);
        break;
      case (!a.isTuple() && b.isTuple()):
        L = (b as Tuple).value.push(a);
        break;
      case (!a.isTuple() && !b.isTuple()):
        L = List.of(a, b);
        break;
    }
    return Tuple.of(L);
  }
  export function GCD(a: number, b: number) {
    if (!is.integer(a) || !is.integer(b)) {
      return Infinity;
    }
    let t = 1;
    while (b !== 0) {
      t = b;
      b = a % b;
      a = t;
    }
    return a;
  }
  export function abs(n: number) {
    return Math.abs(n);
  }
  export function factorial(n: number | string) {
    // throw new Error("factorial unimplemented");
  }
  export function simplify(n: number, d: number) {
    const sign = sgn(n) * sgn(d);
    const N = abs(n);
    const D = abs(d);
    const f = GCD(n, d);
    const numer = (sign * n) / f;
    const denom = D / f;
    const res = `${numer}/${denom}`;
    return new Num(res, NUM.FRACTION);
  }
  export const is = {
    func: (v: any): v is Function => typeof v === "function",
    obj: (v: any): v is Object => typeof v === "object",
    number: (v: any): v is number => typeof v === "number",
    string: (v: any): v is string => typeof v === "number",
    bool: (v: any): v is boolean => typeof v === "boolean",
    integer: (v: any) => {
      if (typeof v === "number") return Number.isInteger(v);
      return lib.isInt(v);
    },
  };
  export function sgn(x: number) {
    return x === 0 ? 0 : x > 0 ? 1 : -1;
  }

  export function N(n: string) {
    switch (true) {
      case match.isBinary(n):
        return ast.int(n, 2);
      case match.isHex(n):
        return ast.int(n, 16);
      case match.isOctal(n):
        return ast.int(n, 8);
      case match.isFloat(n):
        return ast.float(n);
      case match.isSci(n): {
        const [a, b] = split(n, "e");
        const x = Number(a);
        const y = Number(b);
        return ast.float(`${x}${y}`);
      }
      case match.isFrac(n): {
        const [a, b] = split(n, "/");
        const x = toInt(a);
        const y = toInt(b);
        return ast.float(`${x / y}`);
      }
      case n === "NaN":
        return ast.integer(NaN);
      case n === "Inf":
        return ast.integer(Infinity);
      default:
        return ast.int("NaN");
    }
  }
  export const toInt = Number.parseInt;
  export const toFloat = Number.parseFloat;
  export const floor = Math.floor;
  export const isNaN = Number.isNaN;
  export const split = (s: string, splitter: string) => s.split(splitter);
  export function integer(n: string | number) {
    if (typeof n === "number") return new Int(n);
    switch (true) {
      case lib.isBinary(n):
        return new Int(toInt(n, 2));
      case lib.isHex(n):
        return new Int(toInt(n, 16));
      case lib.isOctal(n):
        return new Int(toInt(n, 8));
      case lib.isFloat(n):
        n = floor(toFloat(n));
        return new Int(n);
      case lib.isSci(n): {
        const [a, b] = split(n, "e");
        const x = Number(a);
        const y = Number(b);
        return new Int(x ** y);
      }
      case lib.isFrac(n): {
        const [a, b] = split(n, "/");
        const x = toInt(a);
        const y = toInt(b);
        return new Int(x ** y);
      }
    }
    return new Int(NaN);
  }

  export function getFrac(n: string) {
    const [a, b] = split(n, "/");
    const x = toInt(a);
    const y = toInt(b);
    return [x, y];
  }
  export function even(n: number) {
    return n % 2 === 0 ? 1 : 0;
  }
  export function odd(n: number) {
    return n % 2 !== 0 ? 1 : 0;
  }

  export enum TOKEN {
    EOF,
    ERROR,
    NIL,
    COMMA,
    QUERY,
    LPAREN,
    RPAREN,
    LBRACKET,
    RBRACKET,
    LBRACE,
    RBRACE,
    DQUOTE,
    SEMICOLON,
    COLON,
    /**
     * Vertical bar is the absolute value delimiter.
     */
    VBAR,
    /* -------------------------------------------------------------------------- */
    /* § Operator Tokens                                                          */
    /* -------------------------------------------------------------------------- */
    /**
     * Dot for function composition.
     * ~~~
     * f(x) := x^2
     * g(x) := x + 1
     * f.g(x) => f(g(x)) => (x + 1)^2
     * ~~~
     */
    DOT,
    /**
     * Addition is left-associative.
     * ~~~
     * a + b + c => (a + b) + c
     * ~~~
     */
    PLUS,
    /**
     * `++` maps to list concatenation (set union).
     * Left-associative.
     * ~~~
     * A ++ B ++ C => (A ++ B) ++ C
     * ~~~
     * Example:
     * ~~~
     * [1,2] ++ [3,4] => [1,2,3,4]
     * ~~~
     */
    PLUS_PLUS,
    /**
     * Single quote maps to the derivative.
     * ~~~
     * (x^2)' => (2x)' => 1
     * (x^2)'' => 1
     * ~~~
     */
    SQUOTE,
    /**
     * Subtraction is left-associative.
     * ~~~
     * a - b - c => (a - b) - c
     * ~~~
     */
    MINUS,
    /**
     * Multiplication is left-associative.
     * ~~~
     * a * b * c => (a * b) * c
     * ~~~
     */
    STAR,
    /**
     * Division is left-associative.
     * ~~~
     * a/b/c => (a/b)/c
     * ~~~
     */
    SLASH,
    /**
     * The `%` operator returns the signed remainder.
     * It is left-associative.
     * ~~~
     * a % b % c => (a % b) % c
     * ~~~
     */
    PERCENT,
    /**
     * The `^` operator maps to exponentiation.
     * It is right-associative.
     * ~~~
     * a^b^c => a^(b^c)
     * ~~~
     */
    CARET,
    /**
     * The `!` operator maps to factorial.
     * It is left-associative.
     * ~~~
     * a!! => (a!)!
     * ~~~
     */
    BANG,
    /**
     * The `mod` operator maps to the
     * modulus operator. It is left-associative.
     *
     * ~~~
     * a mod b mod c => (a mod b) mod c
     * ~~~
     */
    MOD,
    /**
     * The `//` operator maps to integer division.
     * It is left-associative.
     * ~~~
     * a // b // c => (a // b) // c
     * ~~~
     */
    DIV,
    /**
     * The `rem` operator maps to unsigned remainder.
     * It is left-associative.
     * ~~~
     * a rem b rem c => (a rem b) rem c
     * ~~~
     */
    REM,
    /**
     * The `to` operator maps to a conversion.
     * It is left associative.
     * 4in to m to cm => (4in to m) to cm
     */
    TO,
    /**
     * `==` maps to equivalence.
     * This is a chain-associative.
     * ~~~
     * a == b == c => (a == b) && (b == c)
     * ~~~
     * Under the hood, this is simply a function
     * call:
     * ~~~
     * a == b == c => allEquivalent(a,b,c)
     * ~~~
     */
    DEQUAL,
    /**
     * `!=` maps to inequality.
     * This is chain-associative.
     * ~~~
     * a != b != c => (a != b) && (b != c)
     * ~~~
     * Again, a function call:
     * ~~~
     * a != b != c => allNotEqual(a,b,c)
     * ~~~
     */
    NEQ,
    /**
     * `<` maps to less than.
     * Chain associative.
     * ~~~
     * a < b < c => (a < b) && (b < c)
     * ~~~
     */
    LT,
    /**
     * `>` maps to greater than.
     * Chain associative.
     * ~~~
     * a > b > c => (a > b) && (b > c)
     * ~~~
     */
    GT,
    /**
     * `>=` maps to greater than or equal to.
     * Chain associative.
     * ~~~
     * a >= b >= c => (a >= b) && (b >= c)
     * ~~~
     */
    GTE,
    /**
     * `<=` maps to less than or equal to.
     * Chain associative.
     * ~~~
     * a <= b <= c => (a <= b) && (b <= c)
     * ~~~
     */
    LTE,
    /**
     * `=` maps to strict equality.
     * Chain associative.
     * ~~~
     * a = b = c => (a = b) && (b = c)
     * ~~~
     */
    EQUAL,
    /**
     * `~` maps to list removal (set minus).
     * Left-associative.
     * ~~~
     * A ~ B ~ C => (A ~ B) ~ C
     * ~~~
     * Example:
     * ~~~
     * [1,2,3] ~ [1,2] => [3]
     * ~~~
     */
    TILDE,
    /**
     * `:=` maps to assignment.
     * Right-associative.
     * ~~~
     * a := b := c => a := (b := c)
     * ~~~
     */
    ASSIGN,
    /**
     * `&` maps to set intersection.
     * Left-associative.
     * ~~~
     * A & B & C => (A & B) & C
     * ~~~
     * Example:
     * ~~~
     * [1,2,8,9] & [2,4,1] => [1,2]
     * ~~~
     */
    AMP,
    /**
     * `&` maps to append element.
     * Left-associative.
     * ~~~
     * A << x << y => (A << x) << y
     * ~~~
     * Example:
     * ~~~
     * [1,2,3] << 4 => [1,2,3,4]
     * ~~~
     */
    LSHIFT,
    /**
     * `>>` maps to prepend element.
     * Left-associative.
     * ~~~
     * x >> y >> A => (x >> y) >> A
     * ~~~
     * Example:
     * ~~~
     * 1 >> 2 => [1,2]
     * ~~~
     */
    RSHIFT,
    /**
     * `-` maps to arithmetic negation.
     * Right-associative.
     * ~~~
     * --x => -(-x)
     * ~~~
     */
    NEGATE,
    /**
     * 'in' maps to a check whether
     * an element exists in a compound.
     * Left-associative.
     * ~~~
     * x in A in B => (x in A) in B
     * ~~~
     * Example:
     * ~~~
     * 4 in [1,2,3,4] => 'true'
     * ~~~
     */
    IN,
    /**
     * `-` maps to logical negation.
     * Right-associative.
     * ~~~
     * not not x => not(not x)
     * ~~~
     */
    NOT,
    /**
     * `or` maps to logical or.
     * left-associative.
     * ~~~
     * a or b or c => (a or b) or c
     * ~~~
     */
    OR,
    /**
     * `nor` maps to logical nor.
     * left-associative.
     * ~~~
     * a nor b nor c => (a nor b) nor c
     * ~~~
     */
    NOR,
    /**
     * `xor` maps to logical xor.
     * left-associative.
     * ~~~
     * a xor b xor c => (a xor b) xor c
     * ~~~
     */
    XOR,
    /**
     * `xnor` maps to logical xnor.
     * left-associative.
     * ~~~
     * a xnor b xnor c => (a xnor b) xnor c
     * ~~~
     */
    XNOR,
    /**
     * `and` maps to logical and.
     * left-associative.
     * ~~~
     * a and b and c => (a and b) and c
     * ~~~
     */
    AND,
    /**
     * `nand` maps to logical nand.
     * left-associative.
     * ~~~
     * a nand b nand c => (a nand b) nand c
     * ~~~
     */
    NAND,
    THROW,
    ELSE,
    FOR,
    FUNCTION,
    IF,
    RETURN,
    THIS,
    WHILE,
    DO,
    LET,
    CONST,
    FALSE,
    TRUE,
    INF,
    NAN,
    NULL,
    SYMBOL,
    STRING,
    INT,
    FRAC,
    FLOAT,
    HEX,
    BINARY,
    OCTAL,
    SCINUM,
    COMPLEX,
  }
  export type NUM_TOKEN =
    | TOKEN.INT
    | TOKEN.FLOAT
    | TOKEN.FRAC
    | TOKEN.HEX
    | TOKEN.BINARY
    | TOKEN.OCTAL
    | TOKEN.SCINUM
    | TOKEN.COMPLEX;

  export const keywords = {
    [`and`]: TOKEN.AND,
    [`nand`]: TOKEN.NAND,
    [`throw`]: TOKEN.THROW,
    [`else`]: TOKEN.ELSE,
    [`for`]: TOKEN.FOR,
    [`function`]: TOKEN.FUNCTION,
    [`if`]: TOKEN.IF,
    [`in`]: TOKEN.IN,
    [`return`]: TOKEN.RETURN,
    [`this`]: TOKEN.THIS,
    [`while`]: TOKEN.WHILE,
    [`do`]: TOKEN.DO,
    [`Inf`]: TOKEN.INF,
    [`mod`]: TOKEN.MOD,
    [`nor`]: TOKEN.NOR,
    [`NaN`]: TOKEN.NAN,
    [`not`]: TOKEN.NOT,
    [`null`]: TOKEN.NULL,
    [`or`]: TOKEN.OR,
    [`rem`]: TOKEN.REM,
    [`to`]: TOKEN.TO,
    [`true`]: TOKEN.TRUE,
    [`false`]: TOKEN.FALSE,
    [`xor`]: TOKEN.XOR,
    [`xnor`]: TOKEN.XNOR,
    [`let`]: TOKEN.LET,
    [`const`]: TOKEN.CONST,
  };
  export type Keyword = keyof typeof keywords;
  export type LEXEME = Lexeme | Keyword;

  export interface Token {
    type: TOKEN;
    lexeme: string;
    line: number;
  }

  export enum PREC {
    /** For utility types. */
    NON,

    /** E.g., equality. */
    LOW,

    /** E.g., inequality. */
    LMID,

    /** E.g., Sums. */
    MID,

    /** E.g., Products. */
    UMID,

    /** E.g., Exponentiation and modulo. */
    HIGH,

    /** E.g., prefix operators. */
    TOP,

    /** E.g., postfix operators */
    PEAK,

    /** E.g., Postfix operators and function calls. */
    APEX,
  }

  enum FIX {
    NON,
    CHAIN,
    LEFT,
    RIGHT,
  }
  enum KIND {
    UTIL,
    DELIM,
    KEYWORD,
    ILLEGAL,
    PREFIX,
    INFIX,
    POSTFIX,
    MIXFIX,
    ATOMIC,
  }

  type Entry = {
    kind: KIND;
    prec: PREC;
    fixity: FIX;
  };

  const TokenRecord: { [k in TOKEN]: Entry } = {
    [TOKEN.EOF]: { kind: KIND.UTIL, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.ERROR]: { kind: KIND.UTIL, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.NIL]: { kind: KIND.UTIL, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.COMMA]: { kind: KIND.DELIM, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.QUERY]: { kind: KIND.DELIM, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.LPAREN]: { kind: KIND.DELIM, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.RPAREN]: { kind: KIND.DELIM, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.LBRACKET]: { kind: KIND.DELIM, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.RBRACKET]: { kind: KIND.DELIM, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.LBRACE]: { kind: KIND.DELIM, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.RBRACE]: { kind: KIND.DELIM, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.DQUOTE]: { kind: KIND.DELIM, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.SEMICOLON]: { kind: KIND.DELIM, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.COLON]: { kind: KIND.DELIM, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.VBAR]: { kind: KIND.DELIM, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.SQUOTE]: { kind: KIND.POSTFIX, prec: PREC.PEAK, fixity: FIX.LEFT },
    [TOKEN.BANG]: { kind: KIND.POSTFIX, prec: PREC.PEAK, fixity: FIX.LEFT },

    [TOKEN.DOT]: { kind: KIND.INFIX, prec: PREC.PEAK, fixity: FIX.RIGHT },
    [TOKEN.MINUS]: { kind: KIND.INFIX, prec: PREC.MID, fixity: FIX.LEFT },
    [TOKEN.PLUS]: { kind: KIND.INFIX, prec: PREC.MID, fixity: FIX.LEFT },
    [TOKEN.STAR]: { kind: KIND.INFIX, prec: PREC.UMID, fixity: FIX.LEFT },
    [TOKEN.SLASH]: { kind: KIND.INFIX, prec: PREC.UMID, fixity: FIX.LEFT },
    [TOKEN.CARET]: { kind: KIND.INFIX, prec: PREC.HIGH, fixity: FIX.RIGHT },
    [TOKEN.IN]: { kind: KIND.INFIX, prec: PREC.LMID, fixity: FIX.LEFT },
    [TOKEN.PERCENT]: { kind: KIND.INFIX, prec: PREC.HIGH, fixity: FIX.NON },
    [TOKEN.MOD]: { kind: KIND.INFIX, prec: PREC.HIGH, fixity: FIX.LEFT },
    [TOKEN.DIV]: { kind: KIND.INFIX, prec: PREC.HIGH, fixity: FIX.LEFT },
    [TOKEN.REM]: { kind: KIND.INFIX, prec: PREC.HIGH, fixity: FIX.LEFT },
    [TOKEN.TO]: { kind: KIND.INFIX, prec: PREC.TOP, fixity: FIX.LEFT },
    [TOKEN.DEQUAL]: { kind: KIND.INFIX, prec: PREC.LOW, fixity: FIX.CHAIN },
    [TOKEN.EQUAL]: { kind: KIND.INFIX, prec: PREC.LOW, fixity: FIX.CHAIN },
    [TOKEN.NEQ]: { kind: KIND.INFIX, prec: PREC.LOW, fixity: FIX.CHAIN },
    [TOKEN.LT]: { kind: KIND.INFIX, prec: PREC.LOW, fixity: FIX.CHAIN },
    [TOKEN.GT]: { kind: KIND.INFIX, prec: PREC.LOW, fixity: FIX.CHAIN },
    [TOKEN.GTE]: { kind: KIND.INFIX, prec: PREC.LOW, fixity: FIX.CHAIN },
    [TOKEN.LTE]: { kind: KIND.INFIX, prec: PREC.LOW, fixity: FIX.CHAIN },
    [TOKEN.TILDE]: { kind: KIND.PREFIX, prec: PREC.MID, fixity: FIX.CHAIN },
    [TOKEN.PLUS_PLUS]: { kind: KIND.INFIX, prec: PREC.MID, fixity: FIX.LEFT },
    [TOKEN.AMP]: { kind: KIND.INFIX, prec: PREC.MID, fixity: FIX.LEFT },
    [TOKEN.LSHIFT]: { kind: KIND.INFIX, prec: PREC.MID, fixity: FIX.LEFT },
    [TOKEN.RSHIFT]: { kind: KIND.INFIX, prec: PREC.MID, fixity: FIX.LEFT },
    [TOKEN.NEGATE]: { kind: KIND.PREFIX, prec: PREC.TOP, fixity: FIX.RIGHT },
    [TOKEN.NOT]: { kind: KIND.PREFIX, prec: PREC.TOP, fixity: FIX.RIGHT },
    [TOKEN.OR]: { kind: KIND.INFIX, prec: PREC.LOW, fixity: FIX.LEFT },
    [TOKEN.NOR]: { kind: KIND.INFIX, prec: PREC.LMID, fixity: FIX.LEFT },
    [TOKEN.XOR]: { kind: KIND.INFIX, prec: PREC.MID, fixity: FIX.LEFT },
    [TOKEN.XNOR]: { kind: KIND.INFIX, prec: PREC.UMID, fixity: FIX.LEFT },
    [TOKEN.AND]: { kind: KIND.INFIX, prec: PREC.HIGH, fixity: FIX.NON },
    [TOKEN.NAND]: { kind: KIND.UTIL, prec: PREC.NON, fixity: FIX.NON },

    [TOKEN.ASSIGN]: { kind: KIND.INFIX, prec: PREC.LOW, fixity: FIX.RIGHT },
    /**
     * The following are keywords.
     * If the token class is `illegal`,
     * then the keyword is either disallowed
     * in the language or unimplemented.
     */
    [TOKEN.THROW]: { kind: KIND.ILLEGAL, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.ELSE]: { kind: KIND.KEYWORD, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.FOR]: { kind: KIND.ILLEGAL, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.FUNCTION]: { kind: KIND.ILLEGAL, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.IF]: { kind: KIND.KEYWORD, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.RETURN]: { kind: KIND.ILLEGAL, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.THIS]: { kind: KIND.ILLEGAL, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.WHILE]: { kind: KIND.ILLEGAL, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.DO]: { kind: KIND.ILLEGAL, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.LET]: { kind: KIND.KEYWORD, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.CONST]: { kind: KIND.ILLEGAL, prec: PREC.NON, fixity: FIX.NON },
    /**
     * These are atomic values.
     */
    [TOKEN.FALSE]: { kind: KIND.ATOMIC, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.TRUE]: { kind: KIND.ATOMIC, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.INF]: { kind: KIND.ATOMIC, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.NAN]: { kind: KIND.ATOMIC, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.NULL]: { kind: KIND.ATOMIC, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.SYMBOL]: { kind: KIND.ATOMIC, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.STRING]: { kind: KIND.ATOMIC, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.INT]: { kind: KIND.ATOMIC, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.FRAC]: { kind: KIND.ATOMIC, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.FLOAT]: { kind: KIND.ATOMIC, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.HEX]: { kind: KIND.ATOMIC, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.BINARY]: { kind: KIND.ATOMIC, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.OCTAL]: { kind: KIND.ATOMIC, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.SCINUM]: { kind: KIND.ATOMIC, prec: PREC.NON, fixity: FIX.NON },
    [TOKEN.COMPLEX]: { kind: KIND.ATOMIC, prec: PREC.NON, fixity: FIX.NON },
  };

  const numerics: { [key in NUM_TOKEN]: boolean } = {
    [TOKEN.INT]: true,
    [TOKEN.FRAC]: true,
    [TOKEN.FLOAT]: true,
    [TOKEN.HEX]: true,
    [TOKEN.BINARY]: true,
    [TOKEN.OCTAL]: true,
    [TOKEN.SCINUM]: true,
    [TOKEN.COMPLEX]: true,
  } as const;

  export class Token {
    constructor(type: TOKEN, lexeme: string, line: number) {
      this.type = type;
      this.lexeme = lexeme;
      this.line = line;
    }
    get isSemicolon() {
      return this.type === TOKEN.SEMICOLON;
    }
    get typename() {
      return TOKEN[this.type].replace("_", "-").toLowerCase();
    }
    get isNumber() {
      return numerics[this.type as NUM_TOKEN] !== undefined;
    }
    get isIllegal() {
      return TokenRecord[this.type].kind === KIND.ILLEGAL;
    }
    get isPrefix() {
      return TokenRecord[this.type].kind === KIND.PREFIX;
    }
    get isPostfix() {
      return TokenRecord[this.type].kind === KIND.POSTFIX;
    }
    get isInfix() {
      return TokenRecord[this.type].kind === KIND.INFIX;
    }
    get isMixfix() {
      return TokenRecord[this.type].kind === KIND.MIXFIX;
    }
    get isAtomic() {
      return TokenRecord[this.type].kind === KIND.ATOMIC;
    }
    get isOperable() {
      return !this.isEOF && !this.isSemicolon && !this.isDelimiter &&
        this.type !== TOKEN.ASSIGN;
    }
    get isOperator() {
      return this.isInfix ||
        this.isPostfix ||
        this.isPrefix ||
        this.isMixfix;
    }
    get isChainAssociative() {
      return TokenRecord[this.type].fixity === FIX.CHAIN;
    }
    get isDelimiter() {
      return TokenRecord[this.type].kind === KIND.DELIM;
    }
    get isEOF() {
      return this.type === TOKEN.EOF;
    }
    get bp() {
      return TokenRecord[this.type].prec;
    }
    get isVbar() {
      return this.type === TOKEN.VBAR;
    }
    get isRightBrace() {
      return this.type === TOKEN.RBRACE;
    }
    get isLeftBrace() {
      return this.type === TOKEN.LBRACE;
    }
    get isLeftParen() {
      return this.type === TOKEN.LPAREN;
    }
    get isKeyword() {
      return TokenRecord[this.type].kind === KIND.KEYWORD ||
        TokenRecord[this.type].kind === KIND.ILLEGAL;
    }
    get isRightParen() {
      return this.type === TOKEN.RPAREN;
    }
    get isLeftBracket() {
      return this.type === TOKEN.LBRACKET;
    }
    get isRightBracket() {
      return this.type === TOKEN.RBRACKET;
    }
    get isSymbol() {
      return this.type === TOKEN.SYMBOL;
    }
    static nil = new Token(TOKEN.NIL, "", -1);
    toString(linePad = 0, lexPad = 2, typePad = 0) {
      const lex = `${this.lexeme}`.padEnd(lexPad);
      const line = `${this.line}`.padEnd(linePad);
      const type = `${this.typename}`.padEnd(typePad);
      return `(${line})[ ${lex}][${type}]`;
    }
  }

  export class TokenStream {
    tokens: Token[];
    length: number;
    constructor(tokens: Token[]) {
      this.tokens = tokens;
      this.length = tokens.length;
    }
    toString() {
      let str = "";
      for (let i = 0; i < this.length; i++) {
        str += this.tokens[i].toString() + `\n`;
      }
      return str;
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § enum: NODE                                                               */
  /* -------------------------------------------------------------------------- */
  enum NODE {
    BLOCK,
    ERROR,
    TUPLE,
    VECTOR,
    MATRIX,
    COND,
    NULL,
    BOOL,
    NUMBER,
    SYMBOL,
    CHARS,
    VARIABLE_DECLARATION,
    FUNCTION_DECLARATION,
    ASSIGNMENT,
    ALGEBRAIC_EXPRESSION,
    UNARY_EXPRESSION,
    BINARY_EXPRESSION,
    CALL_EXPRESSION,
    ROOT,
  }

  /* -------------------------------------------------------------------------- */
  /* § Interface: Visitor                                                       */
  /* -------------------------------------------------------------------------- */
  interface Visitor<T> {
    chars(n: Chars): T;
    null(n: Null): T;
    num(n: Num): T;
    sym(n: Sym): T;
    tuple(n: Tuple): T;
    block(n: Block): T;
    vector(n: Vector): T;
    matrix(n: Matrix): T;
    unaryExpr(n: UnaryExpr): T;
    callExpr(n: CallExpr): T;
    binaryExpr(n: BinaryExpr): T;
    varDeclaration(n: VarDeclaration): T;
    funDeclaration(n: FunDeclaration): T;
    root(n: Root): T;
    cond(n: CondExpr): T;
    assign(n: Assignment): T;
    bool(n: Bool): T;
    error(n: Errnode): T;
  }

  /* -------------------------------------------------------------------------- */
  /* § Abstract Class: ASTNode                                                  */
  /* -------------------------------------------------------------------------- */
  export abstract class ASTNode {
    kind: NODE;
    constructor(kind: NODE) {
      this.kind = kind;
    }
    get erred() {
      return this.kind === NODE.ERROR;
    }
    get nkind() {
      return NODE[this.kind].toLowerCase().replace("_", "-");
    }
    abstract accept<T>(n: Visitor<T>): T;
    isBlock(): this is Block {
      return this.kind === NODE.BLOCK;
    }
    isCallExpr() {
      return this.kind === NODE.CALL_EXPRESSION;
    }
    isBool(): this is Bool {
      return this.kind === NODE.BOOL;
    }
    isTuple(): this is Tuple {
      return this.kind === NODE.TUPLE;
    }
    isVector(): this is Vector {
      return this.kind === NODE.VECTOR;
    }
    isMatrix(): this is Matrix {
      return this.kind === NODE.MATRIX;
    }
    isNull(): this is Null {
      return this.kind === NODE.NULL;
    }
    isNum(): this is Num {
      return this.kind === NODE.NUMBER;
    }
    isSymbol(): this is Sym {
      return this.kind === NODE.SYMBOL;
    }
    isChars(): this is Chars {
      return this.kind === NODE.CHARS;
    }
    isVarDeclaration(): this is VarDeclaration {
      return this.kind === NODE.VARIABLE_DECLARATION;
    }
    isFunDeclaration(): this is FunDeclaration {
      return this.kind === NODE.FUNCTION_DECLARATION;
    }
    isUnaryExpr(): this is UnaryExpr {
      return this.kind === NODE.UNARY_EXPRESSION;
    }
    isBinex(): this is BinaryExpr {
      return this.kind === NODE.BINARY_EXPRESSION;
    }
    isRoot(): this is Root {
      return this.kind === NODE.ROOT;
    }
  }
  export class Errnode extends ASTNode {
    value: string;
    constructor(message: string) {
      super(NODE.ERROR);
      this.value = message;
    }
    accept<T>(n: Visitor<T>): T {
      return n.error(this);
    }
  }
  /* -------------------------------------------------------------------------- */
  /* § Root Node                                                                */
  /* -------------------------------------------------------------------------- */
  class Root extends ASTNode {
    root: ASTNode[];
    error: boolean;
    constructor(root: ASTNode[]) {
      super(NODE.ROOT);
      this.root = root;
      this.error = false;
    }
    accept<T>(n: Visitor<T>): T {
      return n.root(this);
    }
  }
  /* -------------------------------------------------------------------------- */
  /* § ASTNode: Assignment                                                      */
  /* -------------------------------------------------------------------------- */
  class Assignment extends ASTNode {
    name: string;
    value: ASTNode;
    constructor(name: string, value: ASTNode) {
      super(NODE.ASSIGNMENT);
      this.name = name;
      this.value = value;
    }
    accept<T>(n: Visitor<T>): T {
      return n.assign(this);
    }
  }
  /* -------------------------------------------------------------------------- */
  /* § ASTNode: Block                                                           */
  /* -------------------------------------------------------------------------- */
  class Block extends ASTNode {
    body: ASTNode[];
    constructor(body: ASTNode[]) {
      super(NODE.BLOCK);
      this.body = body;
    }
    accept<T>(n: Visitor<T>): T {
      return n.block(this);
    }
  }
  /* -------------------------------------------------------------------------- */
  /* § ASTNode: Tuple                                                           */
  /* -------------------------------------------------------------------------- */
  class Tuple extends ASTNode {
    value: List<ASTNode>;
    constructor(elements: List<ASTNode>) {
      super(NODE.TUPLE);
      this.value = elements;
    }
    static of(list: List<ASTNode>) {
      return new Tuple(list);
    }
    accept<T>(n: Visitor<T>): T {
      return n.tuple(this);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § ASTNode: Matrix                                                          */
  /* -------------------------------------------------------------------------- */
  class Matrix extends ASTNode {
    vectors: Vector[];
    rows: number;
    columns: number;
    matrix: ASTNode[][];
    constructor(vectors: Vector[], rows: number, columns: number) {
      super(NODE.MATRIX);
      this.vectors = vectors;
      this.rows = rows;
      this.columns = columns;
      this.matrix = [];
      for (let i = 0; i < this.rows; i++) {
        this.matrix.push(this.vectors[i].elements);
      }
    }
    toString(n: ASTNode) {
      const ts = new ToString();
      return n.accept(ts);
    }
    accept<T>(n: Visitor<T>): T {
      return n.matrix(this);
    }
    clone() {
      let v: Vector[] = [];
      for (let i = 0; i < this.rows; i++) {
        v.push(this.vectors[i]);
      }
      return new Matrix(v, this.rows, this.columns);
    }
    forall(
      fn: (n: ASTNode, rowIndex: number, columnIndex: number) => any,
    ): any {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.matrix[i][j] = fn(this.matrix[i][j], i, j);
        }
      }
      return this.matrix;
    }
    map(fn: (n: ASTNode, rowIndex: number, columnIndex: number) => ASTNode) {
      let out = this.clone();
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          out.matrix[i][j] = fn(this.matrix[i][j], i, j);
        }
      }
      return out;
    }

    ith(i: number, j: number): ASTNode {
      return this.matrix[i][j];
    }

    add(matrix: Matrix) {
      const out = this.clone();
      out.map((n, r, c) => {
        let element = matrix.ith(r, c);
        if (n.isNum() && element.isNum()) {
          return n.add(element);
        } else {
          return ast.binex(n, "+", element);
        }
      });
      return out;
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § ASTNode: Vector                                                          */
  /* -------------------------------------------------------------------------- */
  class Vector extends ASTNode {
    elements: ASTNode[];
    len: number;
    constructor(elements: ASTNode[]) {
      super(NODE.VECTOR);
      this.elements = elements;
      this.len = elements.length;
    }
    accept<T>(n: Visitor<T>): T {
      return n.vector(this);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § ASTNode: Null                                                            */
  /* -------------------------------------------------------------------------- */
  class Null extends ASTNode {
    value: null;
    constructor() {
      super(NODE.NULL);
      this.value = null;
    }
    accept<T>(v: Visitor<T>) {
      return v.null(this);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § ASTNode: Bool                                                            */
  /* -------------------------------------------------------------------------- */
  class Bool extends ASTNode {
    value: boolean;
    constructor(value: boolean) {
      super(NODE.BOOL);
      this.value = value;
    }
    accept<T>(v: Visitor<T>) {
      return v.bool(this);
    }
    and(other: Bool) {
      return ast.bool(this.value && other.value);
    }
    or(other: Bool) {
      return ast.bool(this.value || other.value);
    }
    nor(other: Bool) {
      return ast.bool(!(this.value || other.value));
    }
    xor(other: Bool) {
      return ast.bool(this.value !== other.value);
    }
    xnor(other: Bool) {
      return ast.bool(this.value === other.value);
    }
    nand(other: Bool) {
      return ast.bool(!(this.value && other.value));
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § ASTNode: Num                                                             */
  /* -------------------------------------------------------------------------- */
  type NUMBER = Int | Float | Fraction;
  enum NUM {
    FRACTION,
    FLOAT,
    INT,
    COMPLEX,
  }
  class Num extends ASTNode {
    value: string;
    #type: NUM;
    constructor(value: string | number, type: NUM) {
      super(NODE.NUMBER);
      this.value = typeof value === "number" ? value.toString() : value;
      this.#type = type;
    }
    get raw() {
      switch (this.#type) {
        case NUM.INT:
          return algom.toInt(this.value);
        case NUM.FLOAT:
          return algom.toFloat(this.value);
        case NUM.FRACTION:
          const parts = this.value.split("/");
          const n = algom.toInt(parts[0]);
          const d = algom.toInt(parts[1]);
          return n / d;
      }
      return NaN;
    }
    get isTrue() {
      return this.raw > 0;
    }
    get isFalse() {
      return this.raw <= 0;
    }

    accept<T>(v: Visitor<T>) {
      return v.num(this);
    }
    get isFraction() {
      return this.#type === NUM.FRACTION;
    }
    get typename() {
      return this.#type;
    }
    get numval(): NUMBER {
      switch (this.#type) {
        case NUM.INT:
          const res = new Int(Number.parseInt(this.value));
          return res;
        case NUM.FLOAT:
          return new Float(algom.toFloat(this.value));
        case NUM.FRACTION:
          const parts = this.value.split("/");
          const n = algom.toInt(parts[0]);
          const d = algom.toInt(parts[1]);
          return new Fraction(n, d);
        default:
          return new Int(0);
      }
    }
    nthRoot(x: Num) {
      if (this.hasFrac(x)) {
        throw new Error("method unimplemented");
      }
      const a = this.numval.N;
      const b = x.numval.N;
      const result = Math.pow(a, 1 / b);
      return new Num(result, this.type(result));
    }
    pow(x: Num) {
      if (this.#type === NUM.FRACTION && x.#type === NUM.INT) {
        const a = ast.fraction(this.value).numval;
        const b = algom.toInt(x.value);
        const aN = a.N;
        const aB = a.D;
        const N = aN ** b;
        const D = aB ** b;
        return algom.simplify(N, D);
      }
      if (this.hasFrac(x)) {
        throw new Error("pow for fractional exponents unimplemented");
      }
      const a = this.numval.N;
      const b = x.numval.N;
      const result = a ** b;
      return new Num(result, this.type(result));
    }
    mod(x: Num) {
      const a = algom.integer(this.value).N;
      const b = algom.integer(x.value).N;
      return ast.integer(((a % b) + b) % b);
    }
    rem(x: Num) {
      const a = algom.integer(this.value).N;
      const b = algom.integer(x.value).N;
      return ast.integer(a % b);
    }
    div(x: Num) {
      const a = algom.integer(this.value).N;
      const b = algom.integer(x.value).N;
      return ast.integer(Math.floor(a / b));
    }
    hasFrac(x: Num) {
      return this.isFraction || x.isFraction;
    }
    type(result: number): NUM {
      return Number.isInteger(result) ? NUM.INT : NUM.FLOAT;
    }
    divide(x: Num) {
      let result = 0;
      if (this.hasFrac(x)) {
        return algom.simplify(
          this.numval.N * x.numval.D,
          this.numval.D * x.numval.N,
        );
      }
      const a = this.numval.N;
      const b = x.numval.N;
      result = a / b;
      return new Num(result, this.type(result));
    }
    gte(x: Num) {
      let result = false;
      if (this.hasFrac(x)) {
        const GT = this.gt(x);
        const EQ = this.equals(x);
        result = GT.value && EQ.value;
      } else result = this.numval.N >= x.numval.D;
      return ast.bool(result);
    }
    equals(x: Num) {
      const a = algom.simplify(this.numval.N, this.numval.D);
      const b = algom.simplify(x.numval.N, x.numval.D);
      const result = a.numval.N === b.numval.N && a.numval.D === b.numval.D;
      return ast.bool(result);
    }
    gt(x: Num) {
      let result = false;
      if (this.hasFrac(x)) {
        result = this.lte(x).value;
      } else result = this.numval.N > x.numval.D;
      return ast.bool(result);
    }
    lt(x: Num) {
      let result = false;
      if (this.hasFrac(x)) {
        const L = this.lte(x);
        const R = this.equals(x);
        result = L.value && R.value;
      } else result = this.numval.N < x.numval.D;
      return ast.bool(result);
    }
    lte(x: Num) {
      let result = false;
      if (this.hasFrac(x)) {
        const tN = this.numval.N;
        const tD = this.numval.D;
        const tND = algom.simplify(tN, tD);
        const xN = x.numval.N;
        const xD = x.numval.D;
        const xND = algom.simplify(xN, xD);
        const thisN = tND.numval.N;
        const otherD = xND.numval.D;
        const thisD = tND.numval.D;
        const otherN = xND.numval.N;
        result = thisN * otherD <= otherN * thisD;
      } else result = this.numval.N <= x.numval.N;
      return ast.bool(result);
    }
    minus(x: Num) {
      let result = 0;
      if (this.hasFrac(x)) {
        return algom.simplify(
          this.numval.N * x.numval.D - x.numval.N * this.numval.D,
          this.numval.D * x.numval.D,
        );
      }
      const a = this.numval.N;
      const b = x.numval.N;
      result = a - b;
      return new Num(result, this.type(result));
    }
    add(x: Num) {
      let result = 0;
      if (this.hasFrac(x)) {
        return algom.simplify(
          this.numval.N * x.numval.D + x.numval.N * this.numval.D,
          this.numval.D * x.numval.D,
        );
      }
      const a = this.numval.N;
      const b = x.numval.N;
      result = a + b;
      return new Num(result, this.type(result));
    }
    times(x: Num) {
      let result = 0;
      if (this.hasFrac(x)) {
        return algom.simplify(
          this.numval.N * x.numval.N,
          this.numval.D * x.numval.D,
        );
      }
      const a = this.numval.N;
      const b = x.numval.N;
      result = a * b;
      return new Num(result, this.type(result));
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § Aux: Fraction                                                            */
  /* -------------------------------------------------------------------------- */
  class Fraction extends Num {
    N: number;
    D: number;
    constructor(n: number, d: number) {
      super(`${n}/${d}`, NUM.FRACTION);
      this.N = n;
      this.D = d;
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § Aux: Int                                                                 */
  /* -------------------------------------------------------------------------- */
  class Int {
    N: number;
    constructor(n: number) {
      this.N = n;
    }
    get D() {
      return 1;
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § Aux: Complex                                                             */
  /* -------------------------------------------------------------------------- */
  class Complex {
    real: number;
    imaginary: number;
    constructor(real: number, imaginary: string) {
      this.real = real;
      this.imaginary = algom.toInt(imaginary.split("i")[0]);
    }
    get D() {
      return 1;
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § Aux: Float                                                               */
  /* -------------------------------------------------------------------------- */
  class Float {
    N: number;
    constructor(n: number) {
      this.N = n;
    }
    get D() {
      return 1;
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § ASTNode: Conditional                                                     */
  /* -------------------------------------------------------------------------- */
  class CondExpr extends ASTNode {
    condition: ASTNode;
    consequent: ASTNode;
    alternate: ASTNode;
    constructor(condition: ASTNode, consequent: ASTNode, alternate: ASTNode) {
      super(NODE.COND);
      this.condition = condition;
      this.consequent = consequent;
      this.alternate = alternate;
    }
    accept<T>(v: Visitor<T>) {
      return v.cond(this);
    }
  }
  /* -------------------------------------------------------------------------- */
  /* § ASTNode: Sym                                                             */
  /* -------------------------------------------------------------------------- */
  enum SYMBOL {
    CONSTANT,
    VARIABLE,
  }
  export class Sym extends ASTNode {
    value: string;
    type: SYMBOL;
    constructor(value: string, type: SYMBOL) {
      super(NODE.SYMBOL);
      this.value = value;
      this.type = type;
    }
    accept<T>(v: Visitor<T>) {
      return v.sym(this);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § ASTNode: Chars                                                           */
  /* -------------------------------------------------------------------------- */
  class Chars extends ASTNode {
    value: string;
    constructor(value: string) {
      super(NODE.CHARS);
      this.value = value;
    }
    accept<T>(v: Visitor<T>) {
      return v.chars(this);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § ASTNode: Function Declaration                                            */
  /* -------------------------------------------------------------------------- */
  class FunDeclaration extends ASTNode {
    name: string;
    params: Sym[];
    body: ASTNode;
    constructor(name: string, params: Sym[], body: ASTNode) {
      super(NODE.FUNCTION_DECLARATION);
      this.name = name;
      this.params = params;
      this.body = body;
    }
    get paramlist() {
      return this.params.map((n) => n.value);
    }
    accept<T>(n: Visitor<T>): T {
      return n.funDeclaration(this);
    }
  }
  /* -------------------------------------------------------------------------- */
  /* § ASTNode: Variable Declaration                                            */
  /* -------------------------------------------------------------------------- */
  class VarDeclaration extends ASTNode {
    name: string;
    value: ASTNode;
    line: number;
    constructor(op: string, value: ASTNode, line: number) {
      super(NODE.VARIABLE_DECLARATION);
      this.name = op;
      this.value = value;
      this.line = line;
    }
    accept<T>(n: Visitor<T>): T {
      return n.varDeclaration(this);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § ASTNode: CallExpr                                                        */
  /* -------------------------------------------------------------------------- */
  class CallExpr extends ASTNode {
    callee: string;
    args: ASTNode[];
    length: number;
    native?: Function;
    constructor(callee: string, args: ASTNode[], native?: Function) {
      super(NODE.CALL_EXPRESSION);
      this.callee = callee;
      this.args = args;
      this.length = args.length;
      this.native = native;
    }
    accept<T>(n: Visitor<T>): T {
      return n.callExpr(this);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § ASTNode: UnaryExpr                                                       */
  /* -------------------------------------------------------------------------- */
  class UnaryExpr extends ASTNode {
    op: string;
    arg: ASTNode;
    constructor(op: string, arg: ASTNode) {
      super(NODE.UNARY_EXPRESSION);
      this.op = op;
      this.arg = arg;
    }
    accept<T>(n: Visitor<T>): T {
      return n.unaryExpr(this);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § ASTNode: BinaryExpr                                                      */
  /* -------------------------------------------------------------------------- */
  class BinaryExpr extends ASTNode {
    left: ASTNode;
    op: string;
    right: ASTNode;
    constructor(left: ASTNode, op: string, right: ASTNode) {
      super(NODE.BINARY_EXPRESSION);
      this.left = left;
      this.op = op;
      this.right = right;
    }
    accept<T>(n: Visitor<T>): T {
      return n.binaryExpr(this);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § BUILDER: AST                                                             */
  /* -------------------------------------------------------------------------- */
  export class ast {
    static int(v: string, base = 10) {
      return new Num(algom.toInt(v, base).toString(), NUM.INT);
    }
    static redeclareError(name: string) {
      return new Errnode(
        `[Resolver]: Name “${name}” has been declared in the same scope, redeclaration prohibited.`,
      );
    }
    static argsErr(callee: string, expected: number, actual: number) {
      const a1 = expected === 0 ? "no" : `${expected}`;
      const a2 = expected === 1 ? " argument," : " arguments,";
      const a12 = a1 + a2;
      const fName = "Function " + "“" + callee + "”";
      return new Errnode(
        `${fName} requires ${a12} but ${actual} were passed.`,
      );
    }
    static resError(message: string) {
      return new Errnode(`[Resolver]: ${message}`);
    }
    static typeError(message: string) {
      return new Errnode(`[Typechecker]: ${message}`);
    }
    static error(message: string) {
      return new Errnode(message);
    }
    static bool(value: boolean) {
      return new Bool(value);
    }
    static float(v: string) {
      return new Num(v, NUM.FLOAT);
    }
    static callExpr(fn: string, args: ASTNode[], native?: Function) {
      return new CallExpr(fn, args, native);
    }
    static assign(name: string, value: ASTNode) {
      return new Assignment(name, value);
    }
    static complex(v: string) {
      return new Num(v, NUM.COMPLEX);
    }
    static cond(test: ASTNode, consequent: ASTNode, alternate: ASTNode) {
      return new CondExpr(test, consequent, alternate);
    }
    static fraction(s: string) {
      const [a, b] = algom.getFrac(s);
      return new Num(`${a}/${b}`, NUM.FRACTION);
    }
    static integer(n: number) {
      return new Num(n.toString(), NUM.INT);
    }
    static decimal(n: number) {
      return new Num(n.toString(), NUM.FLOAT);
    }
    static string(s: string) {
      return new Chars(s);
    }
    static nil = new Null();
    static symbol(s: string, type: SYMBOL) {
      return new Sym(s, type);
    }
    static algebra2(left: ASTNode, op: string, right: ASTNode) {
      return new BinaryExpr(left, op, right);
    }
    static matrix(matrix: Vector[], rows: number, columns: number) {
      return new Matrix(matrix, rows, columns);
    }
    static vector(elements: ASTNode[]) {
      return new Vector(elements);
    }
    static binex(left: ASTNode, op: string, right: ASTNode) {
      return new BinaryExpr(left, op, right);
    }
    static algebra1(op: string, arg: ASTNode) {
      return new UnaryExpr(op, arg);
    }
    static unex(op: string, arg: ASTNode) {
      return new UnaryExpr(op, arg);
    }
    static tuple(elements: List<ASTNode>) {
      return new Tuple(elements);
    }
    static block(elements: ASTNode[]) {
      return new Block(elements);
    }
    static varDeclaration(name: string, value: ASTNode, line: number) {
      return new VarDeclaration(name, value, line);
    }
    static funDeclaration(name: string, params: Sym[], body: ASTNode) {
      return new FunDeclaration(name, params, body);
    }
    static root(elements: ASTNode[] | string) {
      return typeof elements === "string"
        ? new Root([new Chars(elements)])
        : new Root(elements);
    }
    static isCallExpr(node: any): node is CallExpr {
      return node instanceof CallExpr;
    }

    static isUnex(node: any): node is UnaryExpr {
      return node instanceof UnaryExpr;
    }

    static isBinex(node: any): node is BinaryExpr {
      return node instanceof BinaryExpr;
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § Visitor: ToString                                                        */
  /* -------------------------------------------------------------------------- */
  class ToString implements Visitor<string> {
    cond(n: CondExpr) {
      const test: string = this.toString(n.condition);
      const consequent: string = this.toString(n.consequent);
      const alternate: string = this.toString(n.alternate);
      return `if (${test}) {${consequent}} else {${alternate}}`;
    }
    error(n: Errnode): string {
      return n.value;
    }
    bool(n: Bool): string {
      return `${n.value}`;
    }
    assign(n: Assignment): string {
      const name = n.name;
      const value = this.toString(n.value);
      return `${name} := ${value}`;
    }
    chars(n: Chars): string {
      return n.value;
    }
    null(n: Null): string {
      return "null";
    }
    num(n: Num): string {
      return n.value;
    }
    sym(n: Sym): string {
      return n.value;
    }
    tuple(n: Tuple): string {
      return this.stringify(n.value.array);
    }
    block(n: Block): string {
      let result = "";
      for (let i = 0; i < n.body.length; i++) {
        result += this.toString(n.body[i]) + "\n";
      }
      return result;
    }
    vector(n: Vector): string {
      return this.stringify(n.elements, ", ", ["[", "]"]);
    }
    unaryExpr(n: UnaryExpr): string {
      let op = n.op;
      let result = this.toString(n.arg);
      const out = op + `(` + result + `)`;
      return out;
    }
    binaryExpr(n: BinaryExpr): string {
      if (n.op === "*" && n.left.isNum() && n.right.isSymbol()) {
        return n.left.value + n.right.value;
      }
      let left = this.toString(n.left);
      let right = this.toString(n.right);
      const op = (n.op !== "^" && n.op !== "/") ? ` ${n.op} ` : n.op;
      return left + op + right;
    }
    varDeclaration(n: VarDeclaration): string {
      return this.toString(n.value);
    }
    root(n: Root): string {
      let result: string[] = [];
      n.root.forEach((n) => result.push(this.toString(n)));
      const out = result.join("");
      return out;
    }
    funDeclaration(node: FunDeclaration): string {
      const name = node.name;
      const params = this.stringify(node.params, ", ", ["(", ")"]);
      const body = this.toString(node.body);
      return name + params + "{" + body + "}";
    }
    matrix(n: Matrix): string {
      let elements: string[] = [];
      n.vectors.forEach((v) => elements.push("\t" + this.toString(v)));
      const Es = "[\n" + elements.join("\n") + "\n]";
      return Es;
    }
    callExpr(n: CallExpr): string {
      let fn = n.callee;
      let arglist = this.stringify(n.args);
      return fn + arglist;
    }
    stringify(
      nodes: ASTNode[],
      separator = ", ",
      delims = ["(", ")"],
      prefix = "",
      postfix = "",
    ) {
      let out: string[] = [];
      nodes.forEach((n) => prefix + out.push(this.toString(n)) + postfix);
      const [leftDelim, rightDelim] = delims;
      return leftDelim + out.join(separator) + rightDelim;
    }
    toString(n: ASTNode) {
      return n.accept(this);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § SCOPE                                                                    */
  /* -------------------------------------------------------------------------- */

  class Scope {
    values: { [key: string]: any };
    parent?: Scope;
    constructor(parent?: Scope) {
      this.values = {};
      this.parent = parent;
    }
    assign(name: string, value: any) {
      if (this.has(name)) {
        this.values[name] = value;
        return value;
      } else if (this.parent !== undefined) {
        this.parent.assign(name, value);
        return value;
      } else {
        this.values[name] = value;
        return value;
      }
    }
    has(name: string) {
      return this.values[name] !== undefined || lib[name] !== undefined;
    }
    define(name: string, value: any) {
      if (this.has(name)) {
        return null;
      }
      this.values[name] = value;
      return value;
    }
    get(name: string): any {
      if (this.has(name)) return this.values[name];
      if (this.parent !== undefined) return this.parent.get(name);
      return null;
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § FN                                                                       */
  /* -------------------------------------------------------------------------- */
  export class Fn {
    name: string;
    length: number;
    params: any[];
    body: ASTNode;
    constructor(name: string, params: any[], body: ASTNode) {
      this.name = name;
      this.params = [];
      this.length = params.length;
      this.body = body;
      const set = new Set();
      for (let i = 0; i < params.length; i++) {
        if (!set.has(params[i])) {
          this.params.push(params[i]);
        }
        set.add(params[i]);
      }
    }
    interpret(interpreter: Interpreter, args: any[]) {
      const scope = new Scope();
      for (let i = 0; i < this.length; i++) {
        scope.define(this.params[i], args[i]);
      }
      return interpreter.execBlock([this.body], scope);
    }
    call(compiler: Compile, args: any[]) {
      const scope = new Scope();
      for (let i = 0; i < this.length; i++) {
        scope.define(this.params[i], args[i]);
      }
      return compiler.executeBlock([this.body], scope);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § COMPILER                                                                 */
  /* -------------------------------------------------------------------------- */
  class Compile implements Visitor<any> {
    scope: Scope;
    constructor() {
      this.scope = new Scope();
    }
    interpret(nodes: ASTNode[]) {
      for (let i = 0; i < nodes.length; i++) {
        this.execute(nodes[i]);
      }
    }
    execute(n: ASTNode) {
      return n.accept(this);
    }
    bool(n: Bool) {
      return n.value;
    }
    chars(n: Chars) {
      return n.value;
    }
    null() {
      return null;
    }
    num(n: Num) {
      return n.raw;
    }
    sym(n: Sym) {
      if (corelib.hasConstant(n.value)) {
        return corelib.getNumericConstant(n.value);
      }
      const res = this.scope.get(n.value);
      return res;
    }
    error(n: Errnode) {
      return n.value;
    }
    tuple(n: Tuple) {
      const elements = n.value.map((node) => this.execute(node));
      return elements.array;
    }
    block(n: Block) {
      return this.executeBlock(n.body, this.scope);
    }
    executeBlock(statements: ASTNode[], env: Scope): any {
      const previous = this.scope;
      this.scope = env;
      let result = null;
      for (let i = 0; i < statements.length; i++) {
        result = this.execute(statements[i]);
      }
      this.scope = previous;
      return result;
    }
    vector(n: Vector) {
      const elements: any[] = n.elements.map((node) => this.execute(node));
      return elements;
    }
    matrix(n: Matrix) {
      const matrix: any = n.forall((n) => this.execute(n));
      return matrix;
    }
    unaryExpr(n: UnaryExpr): any {
      const arg = this.execute(n.arg);
      const op = n.op;
      switch (op) {
        case "-":
          return -arg;
        case "!":
          return !arg;
      }
      return null;
    }
    callExpr(n: CallExpr) {
      const fn = this.scope.get(n.callee);
      let args: any[] = [];
      for (let i = 0; i < n.args.length; i++) {
        args.push(this.execute(n.args[i]));
      }
      if (n.native) {
        return n.native.apply(null, args);
      }
      if (fn instanceof Fn) {
        const res = fn.call(this, args);
        return res;
      }
      return null;
    }
    binaryExpr(n: BinaryExpr) {
      const left: any = this.execute(n.left);
      const right: any = this.execute(n.right);
      const op = n.op;
      switch (op) {
        case "+":
          return left + right;
        case "-":
          return left - right;
        case "*":
          return left * right;
        case "/":
          return left / right;
        case "^":
          return left ** right;
        case "mod":
          return ((left % right) + left) % right;
        case "%":
        case "rem":
          return left % right;
        case "//":
          return Math.floor(left / right);
        case ">":
          return left > right;
        case ">=":
          return left >= right;
        case "<":
          return left < right;
        case "<=":
          return left <= right;
        case "!=":
          return left !== right;
        case "and":
          return left && right;
        case "or":
          return left || right;
        case "nor":
          return !(left || right);
        case "xor":
          return left !== right;
        case "xnor":
          return left === right;
        case "nand":
          return !(left && right);
        case "==":
        case "=":
          return left === right;
      }
    }
    varDeclaration(node: VarDeclaration): any {
      let value = null;
      if (!node.value.isNull()) {
        value = this.execute(node.value);
      }
      return this.scope.define(node.name, value);
    }
    funDeclaration(node: FunDeclaration) {
      const fn = new Fn(node.name, node.paramlist, node.body);
      this.scope.define(node.name, fn);
      return fn;
    }
    root(n: Root): Runtimeval {
      let result = this.scope;
      for (let i = 0; i < n.root.length; i++) {
        result = this.execute(n.root[i]);
      }
      const output = Object.assign(this.scope, { result });
      return output;
    }
    cond(n: CondExpr): any {
      if (this.execute(n.condition)) {
        return this.execute(n.consequent);
      } else return this.execute(n.alternate);
    }
    assign(n: Assignment): any {
      const value = this.execute(n.value);
      this.scope.assign(n.name, value);
      return value;
    }
  }
  interface Runtimeval extends Scope {
    result: any;
  }

  /* -------------------------------------------------------------------------- */
  /* § INTERPRETER                                                              */
  /* -------------------------------------------------------------------------- */
  class Interpreter implements Visitor<ASTNode> {
    str: ToString;
    scope: Scope;
    constructor() {
      this.str = new ToString();
      this.scope = new Scope();
    }
    stringify(n: ASTNode) {
      return n.accept(this.str);
    }

    error(n: Errnode): ASTNode {
      return n;
    }

    funDeclaration(node: FunDeclaration): ASTNode {
      const fn = new Fn(node.name, node.paramlist, node.body);
      this.scope.define(node.name, fn);
      return ast.nil;
    }

    callExpr(node: CallExpr): ASTNode {
      const args: ASTNode[] = [];
      const callee = node.callee;
      const arglen = node.length;
      for (let i = 0; i < arglen; i++) {
        args.push(this.exec(node.args[i]));
      }
      if (node.native) {
        let nargs: number[] = [];
        const L = node.native.length;
        if (args.length < L) {
          return ast.argsErr(callee, L, arglen);
        }
        args.forEach((num, i) => {
          i < L && num.kind === NODE.NUMBER && nargs.push((num as Num).raw);
        });
        const result = node.native.apply(null, nargs);
        switch (typeof result) {
          case "number":
            return N(`${result}`);
          case "boolean":
            return ast.bool(result);
          case "string":
            return ast.string(result);
          case "undefined":
          default:
            return ast.typeError("Invalid native call.");
        }
      }
      const fn = this.scope.get(callee);
      if (fn === null) {
        return ast.resError(`No function named ${callee} exists.`);
      }
      if (fn instanceof Fn) {
        if (arglen < fn.length) return ast.argsErr(callee, fn.length, arglen);
        return fn.interpret(this, args);
      }
      return ast.nil;
    }

    varDeclaration(node: VarDeclaration): ASTNode {
      let value: ASTNode = ast.nil;
      if (!node.value.isNull()) {
        value = this.exec(node.value);
      }
      const res = this.scope.define(node.name, value);
      if (res === null) {
        return ast.redeclareError(node.name);
      }
      return res;
    }

    assign(node: Assignment): ASTNode {
      const value = this.exec(node.value);
      this.scope.assign(node.name, value);
      return value;
    }
    sym(node: Sym): ASTNode {
      const n = corelib.getNumericConstant(node.value);
      if (n) return N(n.toString());
      const value = this.scope.get(node.value);
      if (value === null || value === undefined) {
        return ast.resError(`No variable named ${node.value} exists.`);
      }
      return value;
    }
    matrix(n: Matrix): ASTNode {
      return n;
    }
    chars(n: Chars): ASTNode {
      return n;
    }
    bool(n: Bool): ASTNode {
      return n;
    }
    null(n: Null): ASTNode {
      return n;
    }
    num(n: Num): ASTNode {
      return n;
    }
    cond(n: CondExpr): ASTNode {
      const test = this.exec(n.condition);
      if (test.isBool() && test.value) {
        return this.exec(n.consequent);
      }
      return this.exec(n.alternate);
    }

    tuple(n: Tuple): ASTNode {
      return Tuple.of(n.value.map((v) => this.exec(v)));
    }

    block(node: Block): ASTNode {
      return this.execBlock(node.body, this.scope);
    }
    execBlock(statements: ASTNode[], env: Scope) {
      const prev = this.scope;
      this.scope = env;
      let result: ASTNode = ast.nil;
      for (let i = 0; i < statements.length; i++) {
        if (result.erred) return result;
        result = this.exec(statements[i]);
      }
      this.scope = prev;
      return result;
    }

    vector(n: Vector): ASTNode {
      return n;
    }

    unaryExpr(n: UnaryExpr): ASTNode {
      return n;
    }

    binaryExpr(n: BinaryExpr): ASTNode {
      const left = this.exec(n.left);
      if (left.erred) return left;
      const right = this.exec(n.right);
      if (right.erred) return right;
      const op = n.op;
      if ((left.isTuple() || right.isTuple())) {
        switch (op) {
          case "++":
            return mergeTuples(left, right);
          default:
            return ast.typeError(`Operand ${op} doesn’t work with tuples.`);
        }
      }
      if (left.isMatrix() && right.isMatrix()) {
        switch (n.op) {
          case "+":
            return left.add(right);
          default:
            return ast.typeError(`Operand ${op} doesn’t work with matrices.`);
        }
      }
      if (left.isNum() && right.isNum()) {
        const result = compute(left, n.op, right);
        if (result) return result;
      }
      return ast.error(`Unknown use of operator ${n.op}`);
    }

    root(node: Root): ASTNode {
      if (node.error) return node.root[0];
      let result: ASTNode = ast.nil;
      for (let i = 0; i < node.root.length; i++) {
        if (result.erred) return result;
        result = this.exec(node.root[i]);
      }
      return result;
    }

    exec(node: ASTNode) {
      if (node.erred) return node;
      return node.accept(this);
    }
  }

  class ToPrefix implements Visitor<string> {
    cond(n: CondExpr) {
      const test: string = this.toPrefix(n.condition) + "\n";
      const consequent: string = "\t" + this.toPrefix(n.consequent) + "\n";
      const alternate: string = "\t" + " else " + this.toPrefix(n.alternate);
      return `(cond ${test} ${consequent} ${alternate})`;
    }
    assign(n: Assignment): string {
      const name = n.name;
      const value = this.toPrefix(n.value);
      return `(assign ${name} ${value})`;
    }
    bool(n: Bool): string {
      return `${n.value}`;
    }
    chars(n: Chars): string {
      return `"` + n.value + `"`;
    }
    null(n: Null): string {
      return "null";
    }
    num(n: Num): string {
      return n.value;
    }
    sym(n: Sym): string {
      return n.value;
    }
    tuple(n: Tuple): string {
      return this.stringify(n.value.array);
    }
    block(n: Block): string {
      let result = "(";
      for (let i = 0; i < n.body.length; i++) {
        result += this.toPrefix(n.body[i]);
      }
      return result + ")";
    }
    vector(n: Vector): string {
      return this.stringify(n.elements);
    }
    error(n: Errnode): string {
      return n.value;
    }
    unaryExpr(n: UnaryExpr): string {
      let op = n.op;
      let result = this.toPrefix(n.arg);
      const out = `(` + op + result + `)`;
      return out;
    }
    binaryExpr(n: BinaryExpr): string {
      let left = this.toPrefix(n.left);
      let right = this.toPrefix(n.right);
      return `(` + n.op + " " + left + " " + right + `)`;
    }
    varDeclaration(n: VarDeclaration): string {
      const name = n.name;
      return `(define ` + name + " " + this.toPrefix(n.value) + `)`;
    }
    root(n: Root): string {
      let result: string[] = [];
      n.root.forEach((n) => result.push(this.toPrefix(n)));
      const out = result.join("\n");
      return `(` + out + `)`;
    }
    funDeclaration(node: FunDeclaration): string {
      const name = node.name;
      const params = this.stringify(node.params);
      const body = this.toPrefix(node.body);
      return `(fun ${name} ${params} ${body})`;
    }
    matrix(n: Matrix): string {
      let elements: string[] = [];
      n.vectors.forEach((v) => elements.push("\t" + this.toPrefix(v)));
      const Es = "(\n" + elements.join("\n") + "\n)";
      return Es;
    }
    callExpr(n: CallExpr): string {
      let fn = n.callee;
      let arglist = this.stringify(n.args);
      return fn + arglist;
    }
    stringify(
      nodes: ASTNode[],
      separator = " ",
      delims = ["(", ")"],
      prefix = "",
      postfix = "",
    ) {
      let out: string[] = [];
      nodes.forEach((n) => prefix + out.push(this.toPrefix(n)) + postfix);
      const [leftDelim, rightDelim] = delims;
      return leftDelim + out.join(separator) + rightDelim;
    }
    toPrefix(n: ASTNode) {
      return n.accept(this);
    }
  }
  /* -------------------------------------------------------------------------- */
  /* § LEXER                                                                    */
  /* -------------------------------------------------------------------------- */
  interface Lexer {
    source: string;
    start: number;
    current: number;
    prevToken: Token;
    end: number;
    line: number;
    numtype: NUM_TOKEN;
  }
  class Lexer {
    init(source: string) {
      this.source = source;
      this.start = 0;
      this.current = 0;
      this.end = source.length;
      this.prevToken = Token.nil;
      this.line = 1;
      return this;
    }

    private get atEnd() {
      return this.start >= this.end;
    }
    private errorToken(message: string) {
      return new Token(TOKEN.ERROR, message, this.line);
    }
    private token(type: TOKEN, lex?: string) {
      const lexeme = lex ?? this.source.substring(this.start, this.current);
      const line = this.line;
      const out = new Token(type, lexeme, line);
      this.prevToken = out;
      return out;
    }
    private get peek(): LEXEME {
      return this.source[this.current] as LEXEME;
    }
    private peekNext(by: number = 1): string {
      if (this.atEnd) return "";
      return this.source[this.current + by] as LEXEME;
    }
    private advance() {
      this.current++;
      const out = this.source[this.current - 1] as LEXEME;
      return out;
    }

    private skipWhitespace() {
      while (true) {
        const c = this.peek;
        switch (c) {
          case " ":
          case "\r":
          case "\t":
            this.advance();
            break;
          case "\n":
            this.line += 1;
            this.advance();
            break;
          default:
            return;
        }
      }
    }
    getToken() {
      this.skipWhitespace();
      this.start = this.current;
      if (this.atEnd) return this.token(TOKEN.EOF);
      const c = this.advance();
      if (this.isAlpha(c)) return this.identifier();
      if (this.isDigit(c)) {
        this.numtype = TOKEN.INT;
        return this.number();
      }
      switch (c) {
        case `,`:
          return this.token(TOKEN.COMMA);
        case `(`:
          return this.token(TOKEN.LPAREN);
        case `)`:
          return this.token(TOKEN.RPAREN);
        case `[`:
          return this.token(TOKEN.LBRACKET);
        case `]`:
          return this.token(TOKEN.RBRACKET);
        case `{`:
          return this.token(TOKEN.LBRACE);
        case `}`:
          return this.token(TOKEN.RBRACE);
        case `'`:
          return this.token(TOKEN.SQUOTE);
        case `;`:
          return this.token(TOKEN.SEMICOLON);
        case `+`:
          return this.token(this.match("+") ? TOKEN.PLUS_PLUS : TOKEN.PLUS);
        case "-":
          if (this.isDigit(this.peek) && !this.prevToken.isNumber) {
            this.advance();
            this.numtype = TOKEN.INT;
            return this.number();
          }
          if (this.prevToken.isNumber || this.prevToken.isSymbol) {
            return this.token(TOKEN.MINUS);
          }
          return this.token(TOKEN.NEGATE);
        case "?":
          return this.token(TOKEN.QUERY);
        case ":":
          return this.token(this.match("=") ? TOKEN.ASSIGN : TOKEN.COLON);
        case "&":
          return this.token(TOKEN.AMP);
        case "*":
          return this.token(TOKEN.STAR);
        case "/":
          return this.token(this.match("/") ? TOKEN.DIV : TOKEN.SLASH);
        case "%":
          return this.token(TOKEN.PERCENT);
        case "~":
          return this.token(TOKEN.TILDE);
        case "|":
          return this.token(TOKEN.VBAR);
        case ".":
          return this.token(TOKEN.DOT);
        case "^":
          return this.token(TOKEN.CARET);
        case "!":
          return this.token(this.match("=") ? TOKEN.NEQ : TOKEN.BANG);
        case "=":
          return this.token(this.match("=") ? TOKEN.DEQUAL : TOKEN.EQUAL);
        case "<":
          return this.token(
            this.match("=")
              ? TOKEN.LTE
              : this.match("<")
              ? TOKEN.LSHIFT
              : TOKEN.LT,
          );
        case ">":
          return this.token(
            this.match("=")
              ? TOKEN.LTE
              : this.match(">")
              ? TOKEN.RSHIFT
              : TOKEN.LT,
          );
        case `"`:
          return this.string;
      }

      return this.errorToken(`Unrecognized token “${c}”`);
    }
    private get seesScientific() {
      return (this.peek === "e" || this.peek === "E") &&
        (this.peekNext() === "-" || this.peekNext() === "+" ||
          this.isDigit(this.peekNext()));
    }
    private get stillSeesNumber() {
      return (this.isDigit(this.peekNext())) &&
        (this.peek === "." || this.peek === "/");
    }
    private number() {
      while (this.isDigit(this.peek)) this.advance();
      if (this.prev === "0") {
        if (this.match("b")) return this.binary;
        if (this.match("o")) return this.octal;
        if (this.match("x")) return this.hex;
      }
      if (this.stillSeesNumber) {
        if (this.peek === ".") this.numtype = TOKEN.FLOAT;
        if (this.peek === "/") this.numtype = TOKEN.FRAC;
        this.advance();
        while (this.isDigit(this.peek)) this.advance();
      }
      if (this.seesScientific) {
        this.advance();
        this.scientific;
      }
      if (
        this.peek === ("i") &&
        (!this.isAlpha(this.peekNext()))
      ) {
        this.advance();
        this.numtype = TOKEN.COMPLEX;
      }
      return this.numberToken;
    }
    get numberToken() {
      return this.token(this.numtype);
    }
    private get scientific() {
      this.advance();
      this.number();
      this.numtype = TOKEN.SCINUM;
      return this.numberToken;
    }
    private get binary() {
      while (this.peek === "0" || this.peek === "1") {
        this.advance();
      }
      this.numtype = TOKEN.BINARY;
      return this.numberToken;
    }
    private get octal() {
      while ("0" <= this.peek && this.peek <= "7") {
        this.advance();
      }
      this.numtype = TOKEN.OCTAL;
      return this.numberToken;
    }
    private get prev() {
      return this.source[this.current - 1];
    }
    private get hex() {
      while (
        (this.peek >= "0" && this.peek <= "9") ||
        (this.peek >= "a" && this.peek <= "f") ||
        (this.peek >= "A" && this.peek <= "F")
      ) {
        this.advance();
      }
      this.numtype = TOKEN.HEX;
      return this.numberToken;
    }
    private isDigit(c: string) {
      return c >= "0" && c <= "9";
    }
    private isAlpha(c: string) {
      return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || (c === "_");
    }
    private identifier() {
      while (this.isAlpha(this.peek) || this.isDigit(this.peek)) this.advance();
      const remaining = this.source.substring(this.start, this.current);
      if (keywords.hasOwnProperty(remaining)) {
        const type = keywords[remaining as Keyword];
        return this.token(type);
      }
      return this.token(TOKEN.SYMBOL);
    }
    private get string() {
      while (this.peek !== `"` && !this.atEnd) {
        if (this.peek === `\n`) this.line += 1;
        this.advance();
      }
      if (this.atEnd) return this.errorToken(`Unterminated string.`);
      this.advance();
      return this.token(TOKEN.STRING, "atom");
    }
    private match(expected: LEXEME) {
      if (this.atEnd) return false;
      if (this.source[this.current] !== expected) return false;
      this.current += 1;
      return true;
    }
    get nextChar() {
      return this.source[this.start + 1];
    }
    get previousChar() {
      return this.source[this.current - 1];
    }
  }

  /* -------------------------------------------------------------------------- */
  /* § PARSER                                                                   */
  /* -------------------------------------------------------------------------- */
  interface Parser {
    /**
     * The result of the parsing
     * is an array of ASTs.
     * If only one statement (an expression
     * terminated by a semicolon) is entered,
     * the result will have a length of 1.
     */
    result: Root;
    /**
     * Parses the input source, returning
     * an ASTNode. The parse result
     * is accessible via the result property.
     * If an error occurred during the parse,
     * the result property will contain an
     * error astnode.
     */
    parse(source: string): this;
  }
  class Parser {
    token: Token = Token.nil;
    error: Errnode | null;
    lastToken: Token = Token.nil;
    private compiler: Compile = new Compile();
    private lastNode: ASTNode = ast.nil;
    private scanner: Lexer = new Lexer();
    private idx: number = 1;
    private funcNames: Set<string> = new Set();
    private source: string = "";
    constructor() {
      this.error = null;
    }
    static build(op: string, params: string[]) {
      const input = Parser.make(op, params);
      const p = new Parser();
      return p.parse(input);
    }

    static make(op: string, params: string[]) {
      let input = "";
      let args = params.map((s) => s.length > 0 ? `(${s})` : s);
      if (/^[a-zA-Z]/.test(op)) {
        input = `${op}(${args.join(", ")})`;
      }
      input = args.join(` ${op} `);
      return input;
    }

    /* -------------------------------------------------------------------------- */
    /* § Parse                                                                    */
    /* -------------------------------------------------------------------------- */
    /**
     * Initializes the input source string
     * for scanning.
     */
    private init(source: string) {
      this.source = source;
      this.scanner.init(source);
      this.token = this.scanner.getToken();
    }

    public parse(source: string) {
      this.init(source);
      const result = this.stmntList();
      if (this.error !== null) {
        this.result = ast.root([this.error]);
      } else {
        this.result = ast.root(result);
      }
      return this;
    }

    private stmntList() {
      const statements: ASTNode[] = [this.stmnt()];
      while (!this.token.isEOF && this.error === null) {
        if (this.error) return this.error;
        statements.push(this.stmnt());
      }
      return statements;
    }

    private stmnt() {
      switch (true) {
        case this.match([TOKEN.IF]):
          return this.conditional();
        case this.match([TOKEN.LET]):
          return this.variableDeclaration();
        case this.match([TOKEN.LBRACE]):
          return this.block();
        default:
          return this.exprStmt();
      }
    }

    evaluate(n: ASTNode) {
      const i = new Interpreter();
      return n.accept(i);
    }

    private conditional() {
      const parser = "[conditional]: ";
      const err1 = parser + "Expected ‘(’";
      const err2 = parser + "Expected ‘)’";
      this.eat(TOKEN.LPAREN, err1);
      const test = this.expression();
      this.eat(TOKEN.RPAREN, err2);
      const consequent: ASTNode = this.stmnt();
      const alternate: ASTNode = this.match([TOKEN.ELSE])
        ? this.stmnt()
        : ast.nil;
      return ast.cond(test, consequent, alternate);
    }

    private block() {
      const parser = "[block]: ";
      const err = parser + "Expected ‘}’ to close block.";
      const statements: ASTNode[] = [];
      while (!this.check(TOKEN.RBRACE) && !this.token.isEOF) {
        statements.push(this.stmnt());
      }
      this.eat(TOKEN.RBRACE, err);
      return ast.block(statements);
    }

    private variableDeclaration() {
      const parser = "[variable-declaration]: ";
      const err1 = parser + "Expected variable name";
      const name = this.eat(TOKEN.SYMBOL, err1);
      let init: ASTNode = ast.nil;
      if (this.match([TOKEN.LPAREN])) {
        return this.functionDeclaration(name);
      }
      if (this.match([TOKEN.ASSIGN])) init = this.exprStmt();
      return ast.varDeclaration(name, init, this.token.line);
    }

    private functionDeclaration(name: string) {
      this.funcNames.add(name);
      let params: Sym[] = [];
      const parser = "[function-declaration]: ";
      const err1 = parser + "Expected name";
      const err2 = parser + "Expected ‘)’";
      if (!this.check(TOKEN.RPAREN)) {
        do {
          const n = this.eat(TOKEN.SYMBOL, err1);
          params.push(ast.symbol(n, SYMBOL.VARIABLE));
        } while (this.match([TOKEN.COMMA]));
        this.eat(TOKEN.RPAREN, err2);
      } else this.eat(TOKEN.RPAREN, err2);
      const err3 = parser + "Expected assignment operator ‘:=’";
      this.eat(TOKEN.ASSIGN, err3);
      const body: ASTNode = this.stmnt();
      return ast.funDeclaration(name, params, body);
    }

    private exprStmt() {
      const expr = this.expression();
      while (this.check(TOKEN.SEMICOLON)) {
        this.advance();
      }
      if (!this.lastToken.isSemicolon && !this.lastToken.isRightBrace) {
        const parser = "[expression-statement]: ";
        const err1 = parser + "Expected ‘;’ to end statement";
        (this.source[this.idx] || this.source[this.idx - 1] === ";") &&
          this.eat(TOKEN.SEMICOLON, err1);
      }
      return expr;
    }

    assign() {
      let expr = this.expression();
      if (this.match([TOKEN.ASSIGN])) {
        const value: ASTNode = this.assign();
        if (expr.isSymbol()) {
          const name = ast.symbol(expr.value, SYMBOL.VARIABLE);
          return ast.assign(name.value, value);
        }
      }
      return expr;
    }

    private lit(node: (lexeme: string) => ASTNode) {
      const previousToken = this.advance();
      let newnode = node(previousToken.lexeme);
      if (newnode.isNum() && this.token.isSymbol) {
        if (this.isVariableName(this.token.lexeme)) {
          const sym = this.advance();
          let rhs = ast.symbol(sym.lexeme, SYMBOL.VARIABLE);
          newnode = ast.binex(newnode, "*", rhs);
        }
        if (corelib.hasFunction(this.token.lexeme)) {
          const sym = this.advance();
          const s = ast.symbol(sym.lexeme, SYMBOL.VARIABLE);
          let rhs = this.callexpr(s);
          newnode = ast.binex(newnode, "*", rhs);
        }
      }
      if (this.token.isLeftParen) {
        const rhs = this.parend();
        newnode = ast.binex(newnode, "*", rhs);
      }
      this.lastNode = newnode;
      return newnode;
    }

    private expression(minbp = PREC.NON) {
      if (this.error !== null) return this.error as ASTNode;
      let lhs: ASTNode = ast.nil;
      switch (true) {
        case this.token.isAtomic:
          lhs = this.literal();
          break;
        case this.token.isLeftParen:
          lhs = this.parend();
          if (this.token.isLeftParen && !this.lastNode.isCallExpr()) {
            const rhs = this.parend();
            lhs = ast.binex(lhs, "*", rhs);
          }
          break;
        case this.token.isLeftBrace:
          lhs = this.block();
          break;
        case this.token.isLeftBracket:
          lhs = this.array();
          break;
        case this.token.isVbar:
          lhs = this.absoluteValue();
          break;
      }
      while (this.token.isOperable && this.error === null) {
        if (this.token.type === TOKEN.EOF) break;
        const op = this.token;
        if (op.isKeyword) this.panic("found prohibited keyword");
        if (op.bp < minbp) break;
        this.advance();
        let rhs = this.expression(op.bp);
        lhs = this.makeExpr(lhs, op.lexeme, rhs);
      }
      return lhs;
    }

    private makeExpr(lhs: ASTNode, op: string, rhs: ASTNode) {
      let expr: ASTNode = ast.nil;
      switch (true) {
        case (!lhs.isNull() && !rhs.isNull()):
          expr = ast.binex(lhs, op, rhs);
          break;
        case (!lhs.isNull() && rhs.isNull()):
          expr = ast.unex(op, lhs);
          break;
        case (lhs.isNull() && !rhs.isNull()):
          expr = ast.unex(op, rhs);
          break;
      }
      this.lastNode = expr;
      return expr;
    }

    private literal() {
      switch (this.token.type) {
        case TOKEN.SYMBOL:
          return this.id();
        case TOKEN.INT:
          return this.lit((lexeme) => ast.int(lexeme));
        case TOKEN.FLOAT:
          return this.lit((lexeme) => ast.float(lexeme));
        case TOKEN.OCTAL:
          return this.lit((lexeme) => ast.int(lexeme, 8));
        case TOKEN.HEX:
          return this.lit((lexeme) => ast.int(lexeme, 16));
        case TOKEN.BINARY:
          return this.lit((lexeme) => ast.int(lexeme, 2));
        case TOKEN.FRAC:
          return this.lit((lexeme) => ast.fraction(lexeme));
        case TOKEN.SCINUM:
          const prevToken = this.advance();
          return this.expand(prevToken.lexeme);
        case TOKEN.TRUE:
          return this.lit(() => ast.bool(true));
        case TOKEN.FALSE:
          return this.lit(() => ast.bool(false));
        case TOKEN.STRING:
          return this.lit((lexeme) => ast.string(lexeme));
        case TOKEN.NULL:
          return this.lit(() => ast.nil);
        case TOKEN.COMPLEX:
          throw new Error("complex unimplemented");
        default:
          return ast.nil;
      }
    }

    private absoluteValue() {
      const parser = "[absolute-value]: ";
      const err = parser + "Expected ‘|’";
      this.eat(TOKEN.VBAR, err);
      const expr = this.expression(PREC.NON);
      this.eat(TOKEN.VBAR, err);
      return ast.callExpr("abs", [expr], corelib.getFunction("abs"));
    }

    private parend(): ASTNode {
      const parser = "[parenthesized-expression]: ";
      const err1 = parser + "Expected ‘(’";
      const err2 = parser + "Expected ‘)’";
      this.eat(TOKEN.LPAREN, err1);
      const expr = this.expression(PREC.NON);
      let elements = List.of(expr);
      if (this.match([TOKEN.COMMA])) {
        do {
          elements.push(this.expression());
        } while (this.match([TOKEN.COMMA]));
        this.eat(TOKEN.RPAREN, err2);
        return ast.tuple(elements);
      } else this.eat(TOKEN.RPAREN, err2);
      if (this.scanner.prevToken.type === TOKEN.PLUS_PLUS) {
        return ast.tuple(elements);
      }
      return expr;
    }

    private isVariableName(name: string) {
      return (!this.funcNames.has(name) && !corelib.hasFunction(name)) ||
        corelib.hasConstant(name);
    }

    private id(): ASTNode {
      const parser = "[identifier]: ";
      const err = parser + "Expected valid identifier";
      const name = this.eat(TOKEN.SYMBOL, err);
      let node = ast.symbol(name, SYMBOL.VARIABLE);
      if (this.check(TOKEN.LPAREN)) {
        return this.callexpr(node);
      }
      if (this.match([TOKEN.ASSIGN])) {
        const value = this.expression();
        return ast.assign(name, value);
      }
      return node;
    }

    private callexpr(node: Sym): ASTNode {
      const parser = "[call-expression]: ";
      const err1 = parser + "Expected ‘(’";
      const err2 = parser + "Expected ‘)’";
      if (this.isVariableName(node.value)) {
        let rhs = this.parend();
        return ast.binex(node, "*", rhs);
      }
      this.eat(TOKEN.LPAREN, err1);
      let params: ASTNode[] = [];
      if (!this.check(TOKEN.RPAREN)) {
        do {
          let param = this.expression();
          params.push(param);
        } while (this.match([TOKEN.COMMA]));
        this.eat(TOKEN.RPAREN, err2);
      } else this.eat(TOKEN.RPAREN, err2);
      return ast.callExpr(
        node.value,
        params,
        corelib.getFunction(node.value),
      );
    }

    private array() {
      let builder: "matrix" | "vector" = "vector";
      let elements: ASTNode[] = [];
      const parser = "[array]: ";
      const err1 = parser + "Expected ‘[’";
      this.eat(TOKEN.LBRACKET, err1);
      let element = this.expression();
      let rows = 0;
      let cols = 0;
      if (element instanceof Vector) {
        cols = element.len;
        rows += 1;
        builder = "matrix";
      }
      elements.push(element);
      const err3 = parser + "Matrices must only have vector elements.";
      const err4 = parser + "No jagged arrays permitted";
      while (this.match([TOKEN.COMMA])) {
        let expr = this.expression();
        if (builder === "matrix" && (!expr.isVector())) {
          this.panic(err3);
        }
        if (expr instanceof Vector) {
          builder = "matrix";
          rows += 1;
          if (cols !== expr.len) this.panic(err4);
        }
        elements.push(expr);
      }
      const err2 = parser + "Expected ‘]’";
      this.eat(TOKEN.RBRACKET, err2);
      return builder === "matrix"
        ? ast.matrix(elements as Vector[], rows, cols)
        : ast.vector(elements);
    }

    /**
     * Sets the parser's error property.
     * If the error property is set, then the parser
     * will return an error node.
     */
    // private croak(message: string) {
    // message = `Line[${this.token.line}]: ${message}`;
    // this.error = ast.error(message);
    // return this.error;
    // }

    /**
     * Special handling for scientific numbers.
     * To simplify the type system, we convert
     * these numbers into a compound expression `a^b`,
     * where `a` is a `float` or `integer`.
     */
    private expand(lexeme: string) {
      const [a, b] = algom.split(lexeme, "e");
      const left = algom.is.integer(a) ? ast.int(a) : ast.float(a);
      const right = algom.is.integer(b) ? ast.int(b) : ast.float(b);
      return ast.binex(left, "^", right);
    }

    /**
     * Returns true if any of the supplied
     * token types matches. False otherwise.
     * If a match is found, the next token
     * is requested from the lexer.
     */
    private match(tokenTypes: TOKEN[]) {
      if (this.error) return false;
      for (let i = 0; i < tokenTypes.length; i++) {
        const tokentype = tokenTypes[i];
        if (this.check(tokentype)) {
          this.advance();
          return true;
        }
      }
      return false;
    }

    private check(type: TOKEN) {
      if (this.error || type === TOKEN.EOF) return false;
      return this.token.type === type;
    }

    get val() {
      const n = new Interpreter();
      const out = this.result.accept(n);
      return n.stringify(out);
    }

    toString(out: ASTNode) {
      const s = new ToString();
      return out.accept(s);
    }

    get ast() {
      return this.tree("ast");
    }

    tree(format: "ast" | "s-expression" = "ast") {
      if (format === "s-expression") {
        const prefix = new ToPrefix();
        return this.result.accept(prefix);
      }
      if (this.error) {
        return this.error.value;
      }
      return tree(this.result, (node) => {
        if (node instanceof ASTNode) node.kind = node.nkind as any;
        if (node instanceof Tuple) node.value = node.value.array as any;
      });
    }

    private panic(messages: string) {
      const line = this.token.line;
      const plexeme = this.lastToken.lexeme;
      const ptypename = this.lastToken.typename;
      const lastNode = this.lastNode.nkind;
      const line0 = `Parsing Error:\n`;
      const line2 = `Line: ${line}\n`;
      const line3 = `Last lexeme parsed: A ${ptypename} “${plexeme}”\n`;
      const line4 = `Last semantic parsed: ${lastNode}\n`;
      const message = line0 + line2 + line3 + line4 + messages;
      this.error = ast.error(message);
      return this.error;
    }

    private eat(tokenType: TOKEN, message: string) {
      const token = this.token;
      if (token.type === TOKEN.EOF) {
        if (this.error) {
          return this.error.value;
        }
        const erm = `Abrupt end of input.`;
        this.error = ast.error(erm);
        this.panic(erm);
        return erm;
      }
      if (token.type !== tokenType) {
        this.panic(message);
        return message;
      }
      this.advance();
      return token.lexeme;
    }
    private advance() {
      if (this.token.type === TOKEN.ERROR) {
        this.panic(`[scanner]: ${this.token.lexeme}`);
        this.token = new Token(TOKEN.EOF, "", this.token.line);
        return this.token;
      }
      if (this.error) {
        this.scanner.init("");
        this.token = new Token(TOKEN.EOF, "", this.token.line);
        return this.token;
      }
      this.lastToken = this.token;
      this.token = this.scanner.getToken();
      this.idx = this.scanner.current;
      return this.lastToken;
    }

    compile() {
      return this.result.accept(this.compiler);
    }
  }

  export function tokenize(source: string): TokenStream {
    let out: Token[] = [];
    const lexer = new Lexer();
    lexer.init(source);
    while (true) {
      const token = lexer.getToken();
      out.push(token);
      if (token.type === TOKEN.EOF) break;
    }
    return new TokenStream(out);
  }

  export function tree<T extends Object>(Obj: T, cbfn?: (node: any) => void) {
    const prefix = (key: keyof T, last: boolean) => {
      let str = last ? "└" : "├";
      if (key) str += "─ ";
      else str += "──┐";
      return str;
    };
    const getKeys = (obj: T) => {
      const keys: (keyof T)[] = [];
      for (const branch in obj) {
        if (!hasProp(obj, branch) || is.func(obj[branch])) continue;
        keys.push(branch);
      }
      return keys;
    };
    const grow = (
      key: keyof T,
      root: any,
      last: boolean,
      prevstack: ([T, boolean])[],
      cb: (str: string) => any,
    ) => {
      cbfn && cbfn(root);
      let line = "";
      let index = 0;
      let lastKey = false;
      let circ = false;
      let stack = prevstack.slice(0);
      if (stack.push([root, last]) && stack.length > 0) {
        prevstack.forEach(function (lastState, idx) {
          if (idx > 0) line += (lastState[1] ? " " : "│") + "  ";
          if (!circ && lastState[0] === root) circ = true;
        });
        line += prefix(key, last) + key.toString();
        if (!is.obj(root)) line += ": " + root;
        circ && (line += " (circular ref.)");
        cb(line);
      }
      if (!circ && is.obj(root)) {
        const keys = getKeys(root);
        keys.forEach((branch) => {
          lastKey = ++index === keys.length;
          grow(branch, root[branch], lastKey, stack, cb);
        });
      }
    };
    let output = "";
    const obj = Object.assign({}, Obj);
    grow(
      "." as keyof T,
      obj,
      false,
      [],
      (line: string) => (output += line + "\n"),
    );
    return output;
  }
  export const parser = new Parser();
  export function parse(input: string) {
    return parser.parse(input);
  }
  export function compile(input: string) {
    const parsing = parser.parse(input);
    if (parsing.error) return parser.result.root[0] as Errnode;
    const fn = parsing.result.accept(new Compile()) as Runtimeval;
    return fn.result;
  }
  export function compfn(input: string) {
    const c = new Compile();
    const src = "let " + input + ";";
    const output = compile(src);
    log(output);
    if (output instanceof Errnode) return output;
    if (output instanceof Fn) return (...args: any[]) => output.call(c, args);
    return ast.error(
      `Could not compile the expression ${input} to a function.`,
    );
  }
  export function evaluate(input: string) {
    const parsing = parser.parse(input);
    return parsing.evaluate(parsing.result);
  }
}
