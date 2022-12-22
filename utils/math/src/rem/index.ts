export const rem = (a: number, b: number) => {
  a = Math.trunc(a);
  b = Math.trunc(b);
  return ((a % b) + b) % b;
};
