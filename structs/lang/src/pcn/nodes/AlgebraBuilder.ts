export type OpRecord = {
  [key: string]: any;
};

export type Datum<V, N extends string, R extends OpRecord> = {
  value: V;
  type: N;
} & R;

export type CoreBuilder = <V, N extends string, R extends OpRecord>(
  x: V,
  type: N,
  op: (d: V) => R
) => Datum<V, N, R>;

export const buildAtom: CoreBuilder = (x, type, op) => ({
  value: x,
  type,
  ...op(x),
});

export type Algebra = ReturnType<typeof algebra>;

export function algebra<V, N extends string, R extends OpRecord>(
  type: N,
  op: (d: V) => R
) {
  const fn = (x: V) => {
    function map<V2, N2 extends string, R2 extends OpRecord>(
      fn: (d: Datum<V, N, R>) => Datum<V2, N2, R2>
    ) {
      const res = fn(buildAtom(x, type, op));
      return res as Datum<V2, N2, R2>;
    }
    const out = {
      ...buildAtom(x, type, op),
      map,
    };
    return out;
  };
  return fn;
}

const natural = algebra('natural', (x: number) => ({
  add: (a: number) => natural(x + a),
  mul: (a: number) => natural(x * a),
  sub: (a: number) => natural(x - a),
}));

const integer = algebra('integer', (x: number) => ({
  add: (a: number) => integer(x + a),
  mul: (a: number) => integer(x * a),
  div: (a: number) => integer(x / a),
  sub: (a: number) => integer(x - a),
}));
