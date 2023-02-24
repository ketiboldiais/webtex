import treeify from "treeify";
import { TOKEN, Token } from "./tokentype";

export function log(x: any) {
  console.log(x);
}

export function str(x: any) {
  function buildTokenString(token: Token) {
    const lex = ` ${token.lexeme}`.padEnd(8);
    const line = ` line: ${token.line}`.padEnd(10);
    const type = ` type: ${TOKEN[token.type]}`.padEnd(20);
    return `[${lex}|${line}|${type}]`;
  }
  if (Array.isArray(x)) {
    if (x[0] instanceof Token) {
      let str = "";
      for (let i = 0; i < x.length; i++) {
        str += buildTokenString(x[i]) + `\n`;
      }
      return str;
    }
  }
  if (x instanceof Token) {
    return buildTokenString(x);
  }
  if (typeof x === "object") {
    return treeify.asTree(x, true, false);
  }
}
