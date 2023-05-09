import { Token } from "./token.js";

export type ErrorType =
  | "Scanning Error"
  | "Parser Error";

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

export const parserError = (
  message: string,
  token: Token,
) =>
  new ErrorReport(
    token.line,
    token.column,
    message,
    "Parser Error",
  );
export const scannerError = (
	message: string,
	token: Token
) => new ErrorReport(
	token.line,
	token.column,
	message,
	'Scanning Error'
)