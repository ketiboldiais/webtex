/* eslint-disable no-unused-vars */
type Atom = string | number | symbol | boolean | bigint | null | undefined;
export type ColumnType = 'string' | 'number' | 'boolean';
export type ColumnName = 'string';
export type Primitives = Atom[];

const JaggedArray = <K extends string, T = Primitives[]>(...columns: K[]) =>
  columns.reduce((o, k) => Object.assign(o, { [k]: [] }), {}) as Record<K, T>;