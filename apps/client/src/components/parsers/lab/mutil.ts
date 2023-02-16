export const GCD = (a: number, b: number) => {
  if (a == 0) return b;
  if (b == 0) return a;
  let k: number;
  for (k = 0; ((a | b) & 1) == 0; k++) {
    a >>= 1;
    b >>= 1;
  }
  while ((a & 1) == 0) a >>= 1;
  do {
    while ((b & 1) == 0) b >>= 1;
    if (a > b) {
      let t = a;
      a = b;
      b = t;
    }
    b = b - a;
  } while (b != 0);
  return a << k;
};
