import { nanoid } from "nanoid";

/** Generates a unique identifier for the cells. */
export function uid() {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substring(0, 5);
}

export type CellType = "td" | "th";

export type Cell = {
  value: string;
  type: CellType;
  width: number | null;
  id: string;
};
const blank =
  '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';

export function newCell(type: CellType, value = blank): Cell {
  return ({
    value,
    type,
    width: null,
    id: nanoid(4),
  });
}

export type Row = {
  cells: Cell[];
  height: number | null;
  id: string;
};
export function newRow(cells: Cell[] = []): Row {
  return ({
    cells,
    height: null,
    id: uid(),
  });
}

export function makeCells(count: number, type: CellType = "td") {
  const cells: Cell[] = [];
  for (let i = 0; i < count; i++) {
    const cell = newCell(type);
    cells.push(cell);
  }
  return cells;
}

export function cloneCell(cell: Cell, mutation: Partial<Cell> = {}) {
  return ({ ...cell, ...mutation });
}

export function cloneCells(cells: Cell[]) {
  return Array.from(cells);
}

export function cloneRow(row: Row, variance: Partial<Row> = {}) {
  return ({
    ...row,
    ...variance,
  });
}

export type Rows = Row[];

export function makeRows(
  rowCount: number,
  colCount: number,
  type: "td" | "th" = "td",
) {
  const rows: Rows = [];
  for (let i = 0; i < rowCount; i++) {
    const row = newRow();
    rows.push(row);
    for (let x = 0; x < colCount; x++) {
      row.cells.push(newCell(type, blank))
    }
  }
  return rows;
}

export const htmlCache: Map<string, string> = new Map();
export const textCache: Map<string, string> = new Map();
