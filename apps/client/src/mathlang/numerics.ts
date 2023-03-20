import { getComplexParts } from "./structs/stringfn";

enum num {
  frac,
  real,
  int,
  sci,
  cmpx,
}

interface numvisitor<t> {
  INT(n: INT): t;
  REAL(n: REAL): t;
  SCI(n: SCI): t;
  FRAC(n: FRAC): t;
  COMPLEX(n: COMPLEX): t;
}

class Denominator implements numvisitor<number> {
  INT(n: INT): number {
    return 1;
  }
  REAL(n: REAL): number {
    return 1;
  }
  SCI(n: SCI): number {
    return 1;
  }
  FRAC(n: FRAC): number {
    return n.D;
  }
  COMPLEX(n: COMPLEX): number {
    return 1;
  }
}

class Imaginary implements numvisitor<number> {
  INT(n: INT): number {
    return 0;
  }
  REAL(n: REAL): number {
    return 0;
  }
  SCI(n: SCI): number {
    return 0;
  }
  FRAC(n: FRAC): number {
    return 0;
  }
  COMPLEX(n: COMPLEX): number {
    return n.imaginary;
  }
}
class Real implements numvisitor<number> {
  INT(n: INT): number {
    return Number.parseInt(n.value);
  }
  REAL(n: REAL): number {
    return Number.parseFloat(n.value);
  }
  SCI(n: SCI): number {
    const [base, exp] = n.value.split("E");
    const B = Number.parseFloat(base);
    const E = Number.parseInt(exp);
    const N = B * (10 ** E);
    if (Number.isSafeInteger(N)) {
      return N;
    }
    return NaN;
  }
  FRAC(n: FRAC): number {
    return n.N / n.D;
  }
  COMPLEX(n: COMPLEX): number {
    return n.real;
  }
}

class Exp implements numvisitor<number> {
  INT(_: INT): number {
    return 0;
  }
  REAL(_: REAL): number {
    return 0;
  }
  SCI(n: SCI): number {
    const exp = n.value.split("E")[1];
    const E = Number.parseFloat(exp);
    return E;
  }
  FRAC(_: FRAC): number {
    return 0;
  }
  COMPLEX(n: COMPLEX): number {
    return n.real;
  }
}
class Base implements numvisitor<number> {
  INT(n: INT): number {
    return Number.parseInt(n.value);
  }
  REAL(n: REAL): number {
    return Number.parseFloat(n.value);
  }
  SCI(n: SCI): number {
    const base = n.value.split("E")[0];
    const B = Number.parseFloat(base);
    return B;
  }
  FRAC(n: FRAC): number {
    return n.N / n.D;
  }
  COMPLEX(n: COMPLEX): number {
    return n.real;
  }
}
class Numerator implements numvisitor<number> {
  INT(n: INT): number {
    return Number.parseInt(n.value);
  }
  REAL(n: REAL): number {
    return Number.parseFloat(n.value);
  }
  SCI(n: SCI): number {
    const [base, exp] = n.value.split("E");
    const B = Number.parseFloat(base);
    const E = Number.parseInt(exp);
    const N = B * (10 ** E);
    if (Number.isSafeInteger(N)) {
      return N;
    }
    return NaN;
  }
  FRAC(n: FRAC): number {
    return n.N;
  }
  COMPLEX(n: COMPLEX): number {
    return n.real;
  }
}

abstract class nx {
  type: num;
  constructor(type: num) {
    this.type = type;
  }
  abstract register<t>(visitor: numvisitor<t>): t;
  abstract equals(other: nx): boolean;
  static denominator = new Denominator();
  static numerator = new Numerator();
  static imaginary = new Imaginary();
  static real = new Real();
  static base = new Base();
  static exponent = new Exp();
}

class INT extends nx {
  value: string;
  constructor(value: string) {
    super(num.int);
    this.value = value;
  }
  register<t>(visitor: numvisitor<t>): t {
    return visitor.INT(this);
  }
  equals(other: nx): boolean {
    return R(this) === R(other);
  }
}
class REAL extends nx {
  value: string;
  constructor(value: string) {
    super(num.real);
    this.value = value;
  }
  register<t>(visitor: numvisitor<t>): t {
    return visitor.REAL(this);
  }
  equals(other: nx): boolean {
    return R(this) === R(other);
  }
}
class SCI extends nx {
  value: string;
  constructor(value: string) {
    super(num.sci);
    this.value = value;
  }
  equals(other: nx): boolean {
    return (B(this) === B(other)) && (E(this) === E(other));
  }
  register<t>(visitor: numvisitor<t>): t {
    return visitor.SCI(this);
  }
}

class FRAC extends nx {
  value: string;
  /** The fraction's numerator. Must be an integer. */
  N: number;
  /** The fraction's denominator. Must be an integer. */
  D: number;
  constructor(value: string) {
    super(num.frac);
    this.value = value;
    const [N, D] = value.split("/");
    this.N = Number.parseInt(N);
    this.D = Number.parseInt(D);
  }
  equals(other: nx): boolean {
    return (N(this) === N(other) && D(this) === D(other));
  }
  register<t>(visitor: numvisitor<t>): t {
    return visitor.FRAC(this);
  }
}

class COMPLEX extends nx {
  value: string;
  real: number;
  imaginary: number;
  constructor(value: string) {
    super(num.cmpx);
    this.value = value;
    const [real, imaginary] = getComplexParts(value);
    this.real = Number(real);
    this.imaginary = Number(imaginary);
  }
  equals(other: nx): boolean {
    throw new Error("Method not implemented.");
  }
  register<t>(visitor: numvisitor<t>): t {
    return visitor.COMPLEX(this);
  }
}

const numof = {
  [num.int]: (n: number) => new INT(n.toString()),
  [num.real]: (n: number) => new REAL(n.toString()),
  [num.frac]: (n: number) => {
  },
};

function abs(n: nx) {
}

function int(value: string): INT {
  return (new INT(value));
}

function real(value: string): REAL {
  return (new REAL(value));
}

function sci(value: string): SCI {
  return (new SCI(value));
}

function frac(value: string): FRAC {
  return (new FRAC(value));
}

function complex(value: string): COMPLEX {
  return (new COMPLEX(value));
}
function D(num: nx): number {
  return num.register(nx.numerator);
}
function N(num: nx): number {
  return num.register(nx.denominator);
}
function I(num: nx): number {
  return num.register(nx.imaginary);
}
function R(num: nx): number {
  return num.register(nx.real);
}
function B(num: nx): number {
  return num.register(nx.base);
}
function E(num: nx): number {
  return num.register(nx.exponent);
}
function isInt(n: nx): n is INT {
  return n.type === num.int;
}
function isReal(n: nx): n is REAL {
  return n.type === num.real;
}
function isBasic(n: nx) {
  return isInt(n) || isReal(n);
}
function isSci(n: nx): n is SCI {
  return n.type === num.sci;
}
function isFrac(n: nx): n is FRAC {
  return n.type === num.frac;
}
function isComplex(n: nx): n is COMPLEX {
  return n.type === num.cmpx;
}
function sign(n: nx) {
  const raw = R(n);
  return (raw === 0) ? (0) : (raw < 0 ? -1 : 1);
}

function getPM(char:string) {
	return Number.parseFloat(char + "1");
}
function exp10(n:number) {
	return Number(`1${[...new Array(n)].map(()=>0)}`);
}
function toRatio(arg: number,precision=10) {
	const pattern = /(-?\d)\.(\d+)e([-+])(\d+)/;
	const res = arg.toExponential(precision).match(pattern);
	if (!res) return ``
}