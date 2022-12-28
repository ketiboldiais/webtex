type Atom = string | number | symbol | boolean | bigint | null | undefined;
type Primitives = Atom[];

const JaggedArray = <K extends string, T = Primitives[]>(...columns: K[]) => {
  return columns.reduce((o,k) => Object.assign(o,{[k]:[]}),{}) as Record<K,T>;
};

const tbl = JaggedArray("email", "password");