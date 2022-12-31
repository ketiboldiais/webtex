export type addTableArgs = {
  /** The table name. */
  name: string;
};

export type addColumnArgs = {
  /** The column name. */
  columnName: string;
  /** Whether the column value should be unique. Defaults to `false`. */
  unique: boolean;
};
