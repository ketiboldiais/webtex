// § Node Type Definitions ===========================================
/**
 * The `NodeType` enum is used to tag nodetypes.
 * @enum
 */
export enum NodeType {
  number,
  string,
  null,
  error,
  symbol,
  binary,
  unary,
  bool,
  call,
  functionDeclaration,
  variableDeclaration,
  tuple,
  block,
  assign,
}
