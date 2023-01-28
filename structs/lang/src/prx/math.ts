export function trunc(n: number) {
  return n | 0;
}
export function rem(a: number, b: number) {
  a = trunc(a);
  b = trunc(b);
  return ((a % b) + b) % b;
}
