export function range<T>(
  to: (i: number) => boolean,
  op: (index: number) => T,
  max: number = Number.MAX_SAFE_INTEGER,
): T[] {
  let i = 0;
  let out: T[] = [];
  while (to(i) && i < max) {
    const res = op(i);
    res !== undefined && res !== null && out.push(res);
    i++;
  }
  return out;
}
