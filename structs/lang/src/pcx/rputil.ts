export function EOI(tokenType: string) {
  return `Unexpected end of input, expected: ${tokenType}`;
}

export function BadToken(tokenValue: string, tokenType: string) {
  return `Expected ${tokenType}, got: "${tokenValue}".`;
}
