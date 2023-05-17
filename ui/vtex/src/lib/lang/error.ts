import { Token } from "./main.js";

export type ErrorType =
  | "Scanning Error"
  | "Parser Error"
  | "Environment Error"
  | "Runtime Error"
  | "Resolver Error";

export class ErrorReport {
  type: ErrorType;
  line: number;
  column: number;
  report: string;
  constructor(
    line: number,
    column: number,
    report: string,
    type: ErrorType,
  ) {
    this.type = type;
    this.line = line;
    this.column = column;
    this.report = report;
  }
}

export const isError = (x: any): x is ErrorReport => x instanceof ErrorReport;

export const parserError = (
  message: string,
  token: Token,
) =>
  new ErrorReport(
    token.Line,
    token.Column,
    message,
    "Parser Error",
  );
export const runtimeError = (message: string) =>
  new ErrorReport(0, 0, message, "Runtime Error");
export const scannerError = (
  message: string,
  token: Token,
) =>
  new ErrorReport(
    token.Line,
    token.Column,
    message,
    "Scanning Error",
  );

export const mutError = (varname: string) =>
  `All immutable variables must be definitely assigned. The variable ‘${varname}’ is immutable. If ‘${varname}’ is a mutable variable (in which case, no definite assignment is needed), prepend the ‘var’ keyword: let var ${varname}`;

export const expectedError = (
  source: string,
  expected: string,
  got: Token,
) => `[${source}]: Expected ‘${expected}’, but got ‘${got.Lexeme}’`;
