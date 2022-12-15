declare module '@webtex/structs/StructNode/index' {
  class $StructNode {
      _key: Comparable;
      _val: any;
      _nex: $StructNode | null;
      constructor(key: Comparable, val: any, next?: $StructNode | null);
      set val(newVal: any);
      set key(newKey: any);
      set next(newNext: any);
  }
  export const Node: (key: Comparable, val: any, nex?: null) => $StructNode;
  export {};

}
declare module '@webtex/structs/index' {
  export {};

}
declare module '@webtex/structs' {
  import main = require('@webtex/structs/src/index');
  export = main;
}