export function trunc(n: number) {
  return n | 0;
}
export function rem(a: number, b: number) {
  return a % b;
}
export function modulo(a: number, b: number) {
  return ((a % b) + b) % b;
}
