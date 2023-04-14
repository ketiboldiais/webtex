import { evaluate, getRowCol, latinize, uid } from "@webtex/algom";
import { GraphNode, Link } from "../Graph/graph.chip";

export type GraphPayload = {
  nodes: GraphNode[];
  links: Link[];
};
export type CellType = "td" | "th";
export type CellMap = Map<string, [number, number]>;
export type Cell = {
  type: CellType;
  value: string;
  id: string;
  column: string;
  row: number;
};
export type Cells = Cell[];

function newCell(
  type: CellType = "td",
  value: string = "",
  column: string = "",
  row: number = 0,
): Cell {
  return ({ value, type, id: uid(), column, row });
}

export type Row = {
  cells: Cell[];
  id: string;
};

const newRow = (cells: Cell[]): Row => ({ cells, id: uid() });

export type Rows = Row[];

export function makeRows(rowCount: number, colCount: number) {
  const out: Rows = [];
  for (let r = 0; r < rowCount; r++) {
    const cells: Cell[] = [];
    for (let c = 0; c < colCount; c++) {
      const cell = newCell();
      cell.row = r;
      cell.column = latinize(c);
      cells.push(cell);
    }
    out.push(newRow(cells));
  }
  return out;
}

function graphNodesFromCells(cells: Cell[]) {
  const C = cells.length;
  const uids = new Set<string>();
  const nodes: GraphNode[] = [];
  for (let i = 0; i < C; i++) {
    const cell = cells[i];
    if (!cell.value) continue;
    if (!uids.has(cell.id)) {
      nodes.push({ id: cell.id, value: cell.value });
    }
    uids.add(cell.id);
  }
  return nodes;
}

export class Spreadsheet {
  columnCount: number;
  rowCount: number;
  focusedCell: string | null;
  selection: Cell[] = [];
  rows: Rows;
  constructor(rows: Rows) {
    this.rows = rows;
    this.focusedCell = null;
    this.rowCount = rows.length;
    this.columnCount = rows[0].cells.length;
  }

  getWritable() {
    return this;
  }
  updateSelection(cells: Cell[]) {
    const self = this.getWritable();
    self.selection = [...cells];
  }

  cellGraph() {
    const self = this.getWritable();
    const cells = self.selection;
    const output: GraphPayload = { nodes: [], links: [] };
    if (cells.length === 0) output;
    const C = cells.length;
    const map: Cell[][] = [];
    const ucells: Cell[] = [];
    const nodes = graphNodesFromCells(cells);
    for (let i = 0; i < C; i++) {
      let cell = cells[i];
      if (!cell.value) continue;
      if (map[cell.row] !== undefined) {
        let neighbor = cell;

        map[cell.row].push(neighbor);
      } else {
        ucells.push(cell);
        map[cell.row] = [];
      }
    }
    const toDelete = new Set<string>();
    for (let i = 0; i < ucells.length; i++) {
      const ucell = ucells[i];
      const source = { id: ucell.id, value: ucell.value };
      for (let j = 0; j < map.length; j++) {
        const neighbors = map[j];
        if (neighbors[0].row !== ucell.row) continue;
        for (let k = 0; k < neighbors.length; k++) {
          let neighbor = neighbors[k];
          if (neighbor.value.startsWith("$")) {
            const value = neighbor.value.slice(1);
            console.log(value);
            const { rowIndex, columnIndex } = getRowCol(value);
            const other = self.getCellAt(rowIndex, columnIndex);
            if (other) {
              toDelete.add(neighbor.id);
              neighbor = other;
            }
          }
          const target = { id: neighbor.id, value: neighbor.value };
          output.links.push({ source: source.id, target: target.id });
        }
      }
    }
    output.nodes = nodes.filter((n) => !toDelete.has(n.id));
    return output;
  }

  static preload(rows: Rows) {
    return new Spreadsheet(rows);
  }

  toggleCellType(rowIndex: number, columnIndex: number) {
    const self = this.getWritable();
    const rows = self.rows;
    const row = rows[rowIndex];
    const cells = row.cells;
    const cell = cells[columnIndex];
    const type: CellType = cell.type === "td" ? "th" : "td";
    const clonedCells = Array.from(cells);
    const cellClone = { ...cell, type };
    const rowClone = { ...row, ...{ cells: clonedCells } };
    clonedCells[columnIndex] = cellClone;
    rows[rowIndex] = rowClone;
  }

  pushColumns(count: number) {
    const self = this.getWritable();
    const rows = self.rows;
    const C = self.columnCount;
    for (let y = 0; y < rows.length; y++) {
      const row = rows[y];
      const cells = row.cells;
      const cellsClone = Array.from(cells);
      const rowClone = { ...row, ...{ cells: cellsClone } };
      const type = cells[cells.length - 1].type;
      const r = cells[cells.length - 1].row;
      for (let x = 0; x < count; x++) {
        const cell = newCell(type);
        cell.row = r;
        cell.column = latinize(C);
        cellsClone.push(cell);
      }
      rows[y] = rowClone;
    }
    self.columnCount++;
    return this;
  }

  insertColumnAt(columnIndex: number) {
    const self = this.getWritable();
    const rows = self.rows;
    for (let y = 0; y < rows.length; y++) {
      const row = rows[y];
      const cells = row.cells;
      const cellsClone = Array.from(cells);
      const rowClone = { ...row, ...{ cells: cellsClone } };
      const type = (cells[columnIndex] || cells[columnIndex - 1]).type;
      cellsClone.splice(columnIndex, 0, newCell(type));
      rows[y] = rowClone;
    }
    self.columnCount++;
    if (this.mustAdjustColumnIds(columnIndex)) {
      this.updateAllColumnIDs();
    }
    return this;
  }

  deleteColumnAt(columnIndex: number) {
    const self = this.getWritable();
    const rows = self.rows;
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      const cells = row.cells;
      const clonedCells = Array.from(cells);
      const rowClone = { ...row, ...{ cells: clonedCells } };
      clonedCells.splice(columnIndex, 1);
      rows[r] = rowClone;
    }
    self.columnCount--;
    if (this.mustAdjustColumnIds(columnIndex)) {
      this.updateAllColumnIDs();
    }
    return this;
  }

  pushRows(count: number) {
    const self = this.getWritable();
    const rows = self.rows;
    const previousRow = rows[rows.length - 1];
    const cellCount = self.columnCount;
    for (let y = 0; y < count; y++) {
      const cells: Cells = [];
      for (let x = 0; x < cellCount; x++) {
        const type = previousRow.cells[x].type;
        const column = previousRow.cells[x].column;
        const cell = newCell(type);
        cell.column = column;
        cell.row = self.rowCount;
        cells.push(cell);
      }
      rows.push(newRow(cells));
    }
    self.rowCount += count;
    return this;
  }

  mustAdjustColumnIds(insertedColumnIndex: number) {
    const self = this.getWritable();
    return (insertedColumnIndex) < self.columnCount;
  }

  mustAdjustRowIDs(insertedRowIndex: number) {
    const self = this.getWritable();
    return (insertedRowIndex) < self.rowCount;
  }

  insertRowAt(rowIndex: number) {
    const self = this.getWritable();
    const mustAdjustRowIDs = self.mustAdjustRowIDs(rowIndex);
    const rows = self.rows;
    const prevRow = rows[rowIndex] || rows[rowIndex - 1];
    const cellCount = prevRow.cells.length;
    const row = newRow([]);
    for (let c = 0; c < cellCount; c++) {
      const type = prevRow.cells[c].type;
      const col = prevRow.cells[c].column;
      const cell = newCell(type);
      cell.column = col;
      row.cells.push(cell);
    }
    rows.splice(rowIndex, 0, row);
    self.rowCount += 1;
    if (mustAdjustRowIDs) {
      this.updateAllRowIDs();
    }
    return this;
  }

  updateAllColumnIDs() {
    const self = this.getWritable();
    const R = self.rowCount;
    const C = self.columnCount;
    for (let r = 0; r < R; r++) {
      const row = self.rows[r];
      const cells = row.cells;
      for (let c = 0; c < C; c++) {
        const cell = cells[c];
        cell.column = latinize(c);
      }
    }
  }

  updateAllRowIDs() {
    const self = this.getWritable();
    const rowCount = self.rowCount;
    const colCount = self.columnCount;
    for (let r = 0; r < rowCount; r++) {
      const row = self.rows[r];
      const cells = row.cells;
      for (let c = 0; c < colCount; c++) {
        const cell = cells[c];
        const clonedCell = { ...cell, row: r };
        cells[c] = clonedCell;
      }
    }
  }

  getCellAt(rowIndex: number, columnIndex: number) {
    const self = this.getWritable();
    const row = self.rows[rowIndex];
    if (row === undefined) return null;
    const cell = row.cells[columnIndex];
    if (cell === undefined) return null;
    return cell;
  }

  deleteRowAt(rowIndex: number) {
    const self = this.getWritable();
    const rows = self.rows;
    rows.splice(rowIndex, 1);
    self.rowCount--;
    if (this.mustAdjustRowIDs(rowIndex)) {
      this.updateAllRowIDs();
    }
    return this;
  }

  updateCellValue(rowIndex: number, columnIndex: number, value: string) {
    value = value.trimEnd().trimStart();
    const self = this.getWritable();
    const row = self.rows[rowIndex];
    if (row === undefined) return value;
    const cell = row.cells[columnIndex];
    if (cell === undefined) return value;
    if (value.startsWith("=")) {
      value = evaluate(value.slice(1));
    }
    cell.value = value;
    return value;
  }

  bindColumns(rowIndex: number, data: string[]) {
    const self = this.getWritable();
    const row = self.rows[rowIndex];
    if (row === undefined) return;
    const R = row.cells.length;
    const L = data.length;
    for (let i = 0; i < L && i < R; i++) {
      const cell = row.cells[i];
      const value = data[i];
      const cellClone: Cell = { ...cell, value, type: "th" };
      row.cells[i] = cellClone;
    }
    return this;
  }
}
