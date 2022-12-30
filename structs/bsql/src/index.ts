import "fake-indexeddb/auto";

// const JaggedArray = <K extends string, T = Primitives[]>(...columns: K[]) =>
  // columns.reduce((o, k) => Object.assign(o, { [k]: [] }), {}) as Record<K, T>;
// function objectCreator<K extends string>(...columns: K[]) {
  // return columns.reduce((o, k) => Object.assign(o, { [k]: T[k] }), {}) as Record<K,T>;
// }



export type ColumnType = 'string' | 'number' | 'boolean' | 'null' | 'integer' | 'pint' | 'nint';

